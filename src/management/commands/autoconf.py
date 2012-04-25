import os, config
from django.core.management.base import BaseCommand
from django.core.management import call_command
import settings, virtual_paths, context, contrib

def listfiles(folder):
	for root, dirs, files in os.walk(folder):
		for fname in files:
			yield root, fname

def ScanCwdForSettings(cwd):
	for path, name in listfiles(cwd):
		if name == settings.GLOBAL_CONTEXT_FILE_NAME:
			print '%s is found in %s' % (settings.GLOBAL_CONTEXT_FILE_NAME, path)
			return path

def ReconfigureServer(alias, cwd, path):
	virtual_paths.VIRTUAL_PATHS = {
		alias: path
	}
	config_path = os.path.join(path, settings.GLOBAL_CONTEXT_FILE_NAME)
	product_code_path = config.get(config_path, 'DEFAULT', settings.PRODUCT_CODE_PATH)
	product_code_alias = config.get(config_path, 'DEFAULT', settings.PRODUCT_CODE_ALIAS)
	if product_code_path and product_code_alias:
		print 'product code path is found: %s' % product_code_path
		product_code_alias = '%s-%s' % (alias, product_code_alias)
		virtual_paths.VIRTUAL_PATHS[product_code_alias] = os.path.join(cwd, product_code_path)

class Command(BaseCommand):
	args = '<alias, path to working folder, port>'
	help = 'Executes riurik using specified working folder'

	def handle(self, *args, **options):
		alias = args[0]
		cwd = args[1]
		port = args[2]
		if not port:
			port = '8000'
		if os.path.exists(cwd):
			print 'Current working dir is %s' % cwd
			path = ScanCwdForSettings(cwd)
			ReconfigureServer(alias, cwd, path)
			call_command('runserver', '0.0.0.0:%s' % port)
		else:
			print >> self.stdout, 'Given folder does not exist: %s' % cwd
