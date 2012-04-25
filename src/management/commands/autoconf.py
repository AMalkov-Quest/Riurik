import os
from django.core.management.base import BaseCommand
from django.core.management import call_command
import settings, virtual_paths

def listfiles(folder):
	for root, dirs, files in os.walk(folder):
		for fname in files:
			yield root, fname

def ScanCwdForSettings(cwd):
	for path, name in listfiles(cwd):
		if name == settings.GLOBAL_CONTEXT_FILE_NAME:
			print '%s is found in %s' % (settings.GLOBAL_CONTEXT_FILE_NAME, path)
			return path

def ReconfigureServer(path):
	virtual_paths.VIRTUAL_PATHS = {
		'test-cases': path
	}

class Command(BaseCommand):
	args = '<path to working folder, port>'
	help = 'Executes riurik using specified working folder'

	def handle(self, *args, **options):
		
		cwd = args[0]
		port = args[1]
		if not port:
			port = '8000'
		if os.path.exists(cwd):
			print 'Current working dir is %s' % cwd
			path = ScanCwdForSettings(cwd)
			ReconfigureServer(path)
			call_command('runserver', '0.0.0.0:%s' % port)
		else:
			print >> self.stdout, 'Given folder does not exist: %s' % cwd
