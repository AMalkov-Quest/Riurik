import os
from github import Github
import shlex
from subprocess import Popen, PIPE
from logger import log

repo_title = 'Repo added through Riurik Framework'
key_title = 'Key added through Riurik Framework'
#git = Github('Riurik', 'riurik862879')
gitignore = '.gitignore'

client_id = {
	'www.riurik.com' : 'cea1f31118f8468d79d8',
	'www.riurik.com:8000' : '26e2af67a56e633c8426'
}

client_secret = {
	'www.riurik.com' : 'ebac30752e5a75df37d8386d192ac4bcabdc7546',
	'www.riurik.com:8000' : '03d9bdc160d7364f31e5afefda6747658cdf12ab'
}

github_auth_url = 'https://github.com/login/oauth/authorize'
github_access_url = 'https://github.com/login/oauth/access_token'
scope = 'public_repo'

def get_oauth_href(request):
	host = request.META['HTTP_HOST']
	url = 'http://%s/github/login' % host
	return '%s?client_id=%s&redirect_url=%s&scope=' % (github_auth_url, client_id[host], url) 

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

def get_rsa_path(login):
	return '%s/.ssh/%s_rsa' % (get_repos_root(), login)

def get_rsa_pub_path(login):
	return '%s.pub' % get_rsa_path(login)

def download_deploy_key(user, repo):
	key = get_deploy_key(repo)
	rsa_path = get_rsa_path(user.login)
	if not os.path.exists(rsa_path):
		f = open(rsa_path, 'w')
		f.write(key.key)
		f.close()

def get_user_by_token(token):
	return Github(token).get_user()

def get_user_by_password(login, password):
	return Github(login, password).get_user()

def get_user_dir(login, repo_id):
	return '%s-%s' % (login, repo_id)

def gen_repo_name(user):
	return 'for-riurik'

def init_repo(user, repo):
	from plugins.git import gitssh
	user_dir = get_user_dir(user.login, repo.id)
	if not os.path.exists( get_abspath(user_dir) ):
		with gitssh.GitSSH(get_abspath(), get_rsa_path(user.login), get_rsa_pub_path(user.login)) as call:
			cmd = 'git clone %s %s' % (repo.ssh_url, user_dir)
			out, error, code = call(cmd)

def ssh_key_gen(user):
	log.debug('generate ssh keys for %s' % user.login)
	rsa_path = get_rsa_path(user.login)
	args = shlex.split("ssh-keygen -q -t rsa -N '' -f")
	args.append( rsa_path )
	p = Popen(args, stdout=PIPE)

	return get_pub_key(user)

def get_pub_key(user):
	rsa_path = get_rsa_path(user.login)
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
	rsa_path = get_rsa_path(user.login)
	if os.path.exists(rsa_path):
		return get_pub_key(user)

def ensure_rsa_key(user):
	rsa_path = get_rsa_path(user.login)
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

	return repo

def get_riurik_repo(user):
	repos = get_repos(user)
	if not repos:
		return None
	else:
		repo = repos[0]
	
	return repo

def init_gitignore(user, repo):
	git_ignore_path = get_full_path(user, repo, gitignore)
	f = open(git_ignore_path, 'w')
	f.write('.*.js')
	f.close()

def try_to_create_repo(token):
	from plugins.git import gitssh
	try:
		user = gitware.get_user_by_token(token)
		repo = mkrepo_for_riurik(user)
	except Exception, e:
		return None

	init_repo(user, repo)
	init_gitignore(user.login, repo.id)

	gitssh.command(user.login, repo.id, "git config user.name '%s'" % user.login)
	gitssh.command(user.login, repo.id, "git config user.email %s" % user.email)
	gitssh.command(user.login, repo.id, "git add .")
	gitssh.command(user.login, repo.id, "git commit -a -m 'initial commit'")
	gitssh.command(user.login, repo.id, "git push -u origin master")
	
	return repo

def mkrepo_for_riurik(user):
	repo_name = gen_repo_name(user.login)
	log.debug("create the '%s' repo for the '%s' user" % (repo_name, user.login))
	repo = create_repo(user, repo_name)
	
	key = ssh_key_gen(user)
	log.debug('create a deploy key in the %s repo' % repo_name)
	repo.create_key(key_title, key)

	return repo

def get_abspath(path=None):
	home = get_repos_root()
	if not path:
		return home

	return os.path.join(home, path)

def get_document_root(user, repo):
	"""
	>>> get_document_root('riurik', '12345')
		
	"""
	user_dir = get_user_dir(user, repo)
	log.debug(user_dir)
	document_root = get_abspath(user_dir)
	if os.path.exists(document_root):
		return document_root

def get_full_path(user, repo, path):
	user_dir = get_user_dir(user, repo)
	full_path = os.path.join(user_dir, path.strip('/'))
	return get_abspath(full_path)

def get_repos_root():
	#return os.getenv('HOME')
	return '/home/ubuntu'
