import os, sys
from django.conf.urls.defaults import *
from django.views.static import serve

#to make the tests views available for tests executer by relative path
sys.path.append(os.path.normpath(os.path.dirname(__file__)))

urlpatterns = patterns('',
	(r'^/execute$', 'tests.loader.views.execute'),
	(r'^/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': os.path.join(os.path.dirname( __file__ )),
		'show_indexes': True
		}
	),
	#(r'^/loader(?P<path>.*)$', 'django.views.static.serve',
	#	{
	#	'document_root': os.path.join(os.path.dirname( __file__ ), 'loader'),
	#	'show_indexes': True
	#	}
	#),
)
