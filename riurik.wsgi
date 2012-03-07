import os, sys

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

working_dir = os.path.dirname(__file__)

add_path = ['./','./src',]

for p in add_path:
	sys.path.append(os.path.normpath(os.path.join(working_dir, p)))

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
