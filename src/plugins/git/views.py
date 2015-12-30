import os
from django.http import HttpResponse
import plugins.git.gitssh as gitssh
import plugins.github.views as github
from src.logger import log

def git(request, cmd):
	token, login, repoid = github.get_auth(request)
	log.debug('git %s with token %s' %(cmd, token))
	cmdline = 'git %s' % cmd

	if cmd == 'add':
		cmdline += " ."
	if cmd == 'commit':
		message = request.REQUEST.get('msg', 'polish')
		cmdline += " -a -m '%s'" % message 
	elif cmd == 'push':
		branch = request.REQUEST.get('branch', 'master')
		cmdline += " origin %s" % branch 

	out = gitssh.command(login, repoid, cmdline)
	response = out.replace(os.linesep, '<br>') if out else ''
	
	return HttpResponse(response)
