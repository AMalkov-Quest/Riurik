import os
from github import Github

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

def get_repos(user):
	repos = []
	for repo in user.get_repos():
		if get_deploy_key(repo):
			repos.append(repo)

	return repos

def create_repo(user):
	return user.create_repo('test-repo-2', repo_title)	

def get_rsa_path(user):
	return '%s/.ssh/%s_rsa' % (os.getenv('HOME'), user.login)

def download_deploy_key(user, repo):
	key = get_deploy_key(repo)
	rsa_path = get_rsa_path(user)
	if not os.path.exists(rsa_path):
		f = open(rsa_path, 'w')
		f.write(key.key)
		f.close()

def ensure_deploy_key(user, repo):
	rsa_path = get_rsa_path(user)
	if not os.path.exists(rsa_path):
		new_key = ssh_key_gen(user)
		if new_key:
			old_key = get_deploy_key(repo)
			old_key.delete()
			repo.create_key(key_title, new_key)

def ssh_key_gen(user):
	import shlex
	from subprocess import Popen, PIPE

	rsa_path = get_rsa_path(user)

	args = shlex.split("ssh-keygen -q -t rsa -N '' -f")
	args.append( rsa_path )
	p = Popen(args, stdout=PIPE)
	if os.path.exists(rsa_path):
		args = shlex.split("ssh-keygen -y -f")
		args.append( rsa_path )
		p = Popen(args, stdout=PIPE)
		stdout = p.communicate()[0]
		return stdout.strip()
