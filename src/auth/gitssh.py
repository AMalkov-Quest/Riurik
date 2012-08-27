import subprocess, tempfile, os

git_ssh_cmd = os.path.abspath( os.path.join( os.path.dirname( os.path.join( __file__ ) ), 'gitssh.sh' ) )

class GitSSH(object):
	def __init__(self, privateKey, publicKey):
		hPrivate, self.privateFile = tempfile.mkstemp()
		hPrivate.write(privateKey)
		hPrivate.close()
		self.publicFile = self.privateFile + '.pub'
		hPublic = open(self.publicFile, 'w')
		hPublic.write(publicKey)
		hPublic.close()

	def __enter__(self):
		return self.popen

	def __exit__(self, exceptionType, value, traceback):
		os.remove(self.privateFile)
		os.remove(self.publicFile)
		return True # The exception was not handled

	def popen(self, cmd, input=None):
		params = shlex.split( cmd )
		env = {}
		env.update( os.environ )
		env.update({
			'GIT_IDENTITY_FILE': self.privateFile
			'GIT_SSH': git_ssh_cmd
		})
		proc = subprocess.Popen( params, env=env )
		return proc.communicate( input=input )
