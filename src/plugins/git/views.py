import os
from django.http import HttpResponse
import plugins.git.gitssh as gitssh
import plugins.github.gitware as gitware
from logger import log

def command(token, cmdline):
	log.debug('git execute %s' % cmdline)

	ghub = gitware.Github(token)
	user = ghub.get_user()
	repo = gitware.get_riurik_repo(user)
	root = gitware.get_document_root(user, repo)

	with gitssh.GitSSH(root, gitware.get_rsa_path(user), gitware.get_rsa_pub_path(user)) as call:
		out, err, code = call(cmdline)

	if not out:
		log.debug('%s (%s)' % (err, code))
		return err

	return out

def git(request, cmd):
	token = request.session.get('token')
	cmdline = 'git %s' % cmd

	if cmd == 'commit':
		message = request.session.get('msg', 'polish')
		cmdline += " -a -m '%s'" % message 
	elif cmd == 'push':
		branch = request.session.get('branch', 'master')
		cmdline += " origin %s'" % branch 

	out = command(token, cmdline)
	return HttpResponse(out.replace(os.linesep, '<br>'))

