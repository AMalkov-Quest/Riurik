import os, sys
from django.conf.urls.defaults import *
from django.views.static import serve

#to make the tests views available for tests executer by relative path
cwd = os.path.normpath(os.path.dirname(__file__))
sys.path.append(cwd)

urlpatterns = patterns('',
	(r'^/execute$', 'tests.loader.views.execute'),
	(r'^/upload$', 'tests.loader.views.upload',
		{
		'document_root': cwd
		}
	),
	(r'^/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': cwd,
		'show_indexes': True
		}
	),
)
