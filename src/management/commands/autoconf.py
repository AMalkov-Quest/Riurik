import os, config
from django.core.management.base import BaseCommand
from django.core.management import call_command
import src.settings, context, contrib

def listfiles(folder):
	for root, dirs, files in os.walk(folder):
		for fname in files:
			yield root, fname

def ScanCwdForsrc.settings(cwd):
	for path, name in listfiles(cwd):
		if name == src.settings.GLOBAL_CONTEXT_FILE_NAME:
			print '%s is found in %s' % (src.settings.GLOBAL_CONTEXT_FILE_NAME, path)
			return path

def ConfigureServer(alias, cwd, path):
	src.settings.virtual_paths.VIRTUAL_PATHS = {
		alias: (cwd, os.path.relpath(path, cwd))
	}

class Command(BaseCommand):
	args = '<alias for virtual path, path to working folder, port>'
	help = 'Executes riurik using specified working folder'

	def handle(self, *args, **options):
		if len(args) < 3:
			print 'Proper Usage is: %s' % self.args
			return

		alias = args[0]
		cwd = args[1]
		port = args[2]
		
		if os.path.exists(cwd):
			print 'Current working dir is %s' % cwd
			path = ScanCwdForsrc.settings(cwd)
			ConfigureServer(alias, cwd, path)
			call_command('runserver', '0.0.0.0:%s' % port)
		else:
			print 'Given folder does not exist: %s' % cwd
