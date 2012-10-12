import os
from django.http import HttpResponse
import plugins.git.gitssh as gitssh
import auth.gitware as gitware
from logger import log

def git(request, cmd):
	token = request.session.get('token')
	ghub = gitware.Github(token)
	user = ghub.get_user()
	repo = gitware.get_riurik_repo(user)
	root = gitware.get_document_root(user, repo)
	cmdline = 'git %s' % cmd
	log.debug('execute %s' % cmdline)
	with gitssh.GitSSH(root, gitware.get_rsa_path(user), gitware.get_rsa_pub_path(user)) as call:
		out, err, code = call(cmdline)

	if not out:
		log.debug('%s (%s)' % (err, code))
		out = err

	return HttpResponse(out.replace(os.linesep, '<br>'))
