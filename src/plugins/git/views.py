import os
from django.http import HttpResponse
import plugins.git.gitssh as gitssh
from logger import log

def git(request, cmd):
	token = request.session.get('token')
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

	out = gitssh.command(token, cmdline)
	response = out.replace(os.linesep, '<br>') if out else ''
	
	return HttpResponse(response)
