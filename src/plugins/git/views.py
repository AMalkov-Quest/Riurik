import os
from django.http import HttpResponse
import plugins.git.gitssh as gitssh
from logger import log

def git(request, cmd):
	token = request.session.get('token')
	cmdline = 'git %s' % cmd

	if cmd == 'commit':
		message = request.session.get('msg', 'polish')
		cmdline += " -a -m '%s'" % message 
	elif cmd == 'push':
		branch = request.session.get('branch', 'master')
		cmdline += " origin %s'" % branch 

	out = gitssh.command(token, cmdline)
	return HttpResponse(out.replace(os.linesep, '<br>'))
