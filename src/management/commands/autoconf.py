import os
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
	help = 'Executes riurik using specified working folder'

	def handle(self, *args, **options):
		import settings
		cwd = args[0]
		port = args[1]
		if not port:
			port = '8000'
		if os.path.exists(cwd):
			print >> self.stdout, 'Current working dir is %s' % cwd
			from django.core.management import call_command
			call_command('runserver', '0.0.0.0:%s' % port)
		else:
			print >> self.stdout, 'Given folder does not exist: %s' % cwd
