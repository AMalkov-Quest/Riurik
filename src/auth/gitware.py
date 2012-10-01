import os
from github import Github
import shlex
from subprocess import Popen, PIPE

repo_title = 'Repo added through Riurik Framework'
key_title = 'Key added through Riurik Framework'
#git = Github('Riurik', 'riurik862879')

def get_keys(obj):
	try:
		keys = obj.get_keys()
	except Exception, e:
		return []

	return keys

def get_deploy_key(repo):
	for key in get_keys(repo):
		if key_title == key.title and repo.description == repo_title:
			return key

def create_repo(user, name):
	return user.create_repo(name, repo_title)	

def get_rsa_path(user):
	return '%s/.ssh/%s_rsa' % (os.getenv('HOME'), user.login)

def get_rsa_pub_path(user):
	return '%s.pub' % get_rsa_path(user)

def download_deploy_key(user, repo):
	key = get_deploy_key(repo)
	rsa_path = get_rsa_path(user)
	if not os.path.exists(rsa_path):
		f = open(rsa_path, 'w')
		f.write(key.key)
		f.close()

def get_user_dir(login, repo_id):
	return '%s-%s' % (login, repo_id)

def gen_repo_name(user):
	return 'riurik-for-%s' % user.login

def get_full_path(path=None):
	if not path:
		return os.getenv('HOME')

	return os.path.join(os.getenv('HOME'), path)

def init_repo(user, repo):
	from gitssh import GitSSH
	user_dir = get_user_dir(user.login, repo.id)
	if not os.path.exists( get_full_path(user_dir) ):
		with GitSSH(get_full_path(), get_rsa_path(user), get_rsa_pub_path(user)) as call:
			cmd = 'git clone %s %s' % (repo.ssh_url, user_dir)
			out, error, code = call(cmd)

def ssh_key_gen(user):
	rsa_path = get_rsa_path(user)
	args = shlex.split("ssh-keygen -q -t rsa -N '' -f")
	args.append( rsa_path )
	p = Popen(args, stdout=PIPE)

	return get_pub_key(user)

def get_pub_key(user):
	rsa_path = get_rsa_path(user)
	if os.path.exists(rsa_path):
		args = shlex.split("ssh-keygen -y -f")
		args.append( rsa_path )
		p = Popen(args, stdout=PIPE)
		stdout = p.communicate()[0]
		return stdout.strip()

def ensure_deploy_key(user, repo):
	key = get_rsa_key(user)
	if not key:
		key = ssh_key_gen(user)
		old_key = get_deploy_key(repo)
		if old_key:
			old_key.delete()

		repo.create_key(key_title, key)

def get_rsa_key(user):
	rsa_path = get_rsa_path(user)
	if os.path.exists(rsa_path):
		return get_pub_key(user)

def ensure_rsa_key(user):
	rsa_path = get_rsa_path(user)
	if not os.path.exists(rsa_path):
		key = ssh_key_gen(user)
	else:
		key = get_pub_key(user)

	return key

def get_repo_by_name(user, name):
	try:
		return user.get_repo(name)
	except:
		return None

def get_repos(user):
	repos = []
	for repo in user.get_repos():
		if get_deploy_key(repo):
			repos.append(repo)

	return repos

def ensure_riurik_repo(user):
	repo_name = gen_repo_name(user)
	repo = get_repo_by_name(user, repo_name)
	if not repo:
		repo = create_repo(user, repo_name)
		
	return repo

def get_riurik_repo(user):
	repos = get_repos(user)
	if not repos:
		repo = ensure_riurik_repo(user)
		ensure_deploy_key(user, repo)
	else:
		repo = repos[0]
	
	init_repo(user, repo)

	return repo

def get_document_root(user, repo):
	user_dir = get_user_dir(user.login, repo.id)
	return get_full_path(user_dir)
