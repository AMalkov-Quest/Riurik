import os
from django.http import HttpResponse
from django.shortcuts import render_to_response as _render_to_response
from github import Github

key_title = 'Key added through Riurik Framework'

def default(request):
	git = Github('Riurik', 'riurik862879')
	user = git.get_user()
	ssh_key_gen(user)
	#keys = get_keys(user)
	repos = get_repos(user)
	return _render_to_response('github.html', locals())

def get_keys(user):
	keys = user.get_keys()
	return keys

def get_repos(user):
	repos = []
	for repo in  user.get_repos():
		for key in repo.get_keys():
			if key_title == key.title:
				repos.append(repo)

	return repos

def ssh_key_gen(user):
	import shlex
	from subprocess import Popen, PIPE

	rsa_path = '%s/.ssh/%s_rsa' % (os.getenv('HOME'), user.login)

	args = shlex.split("ssh-keygen -q -t rsa -N '' -f")
	args.append( rsa_path )
	p = Popen(args, stdout=PIPE)
	if os.path.exists(rsa_path):
		args = shlex.split("ssh-keygen -y -f")
		args.append( rsa_path )
		p = Popen(args, stdout=PIPE)
		stdout = p.communicate()[0]
		return stdout.strip()
