import subprocess, tempfile, os, shlex
import plugins.github.gitware as gitware
from logger import log

git_ssh_cmd = os.path.abspath( os.path.join( os.path.dirname( os.path.join( __file__ ) ), 'git-ssh.sh' ) )

def command(token, cmdline):
	log.debug('git execute %s' % cmdline)

	ghub = gitware.Github(token)
	user = ghub.get_user()
	repo = gitware.get_riurik_repo(user)
	root = gitware.get_document_root(user, repo)

	with GitSSH(root, gitware.get_rsa_path(user), gitware.get_rsa_pub_path(user)) as call:
		out, err, code = call(cmdline)

		if not out:
			log.debug('%s (%s)' % (err, code))
			return err if err else str(code) 

		return out

class GitSSH(object):
	def __init__(self, repoPath, privateKey, publicKey):
		self.privateFile = privateKey
		self.publicFile = publicKey
		self.repository = repoPath
		log.debug('GitSSH for %s' % repoPath)

	def __enter__(self):
		return self.popen

	def __exit__(self, exceptionType, value, tb):
		if exceptionType:
			log.debug('GitSSH catch exception %s' % exceptionType)
			log.debug(value)
			import traceback
			log.debug(traceback.format_exc())
		return True # The exception was not handled

	def popen(self, cmd, input=None):
		log.debug('GitSSH command %s' % cmd)
		params = shlex.split( cmd )
		env = {}
		env.update( os.environ )
		env.update({
			'GIT_IDENTITY_FILE': self.privateFile,
			'GIT_SSH': git_ssh_cmd
		})
		self.proc = subprocess.Popen(
			params,
			cwd=self.repository,
			env=env,
			stdout=subprocess.PIPE,
			stderr=subprocess.PIPE
		)
		out, err = self.proc.communicate( input=input )
		code = self.proc.returncode
		return out, err, code

if __name__ == '__main__':
	# Usage example

	def get_key(name):
		name = os.path.join( os.path.abspath( os.path.dirname(__file__) ), name )
		with open(name) as f:
			return f.read()

	private = get_key('key')
	public = get_key('key.pub')
	folder = os.path.abspath( os.path.dirname(__file__) )
	print 'Ready!', private, public, folder
	with GitSSH(folder, private, public) as call:
		print 'git pull ...'
		out, err, code = call('git pull')
		print "out: " + str(out)
		print "err: " + str(err)
		print "exit code: " + str(code)
