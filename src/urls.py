#######################################################################################
#Copyright (C) 2008 Quest Software, Inc.
#File:		urls.py
#Version:	   1.0.0.0

#######################################################################################
#
#	   THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#	   EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#	   WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################
from django.conf.urls.defaults import *

from django.views.static import serve
import os
import settings

def enumerate_suites(request):
	"""
		Return a list of suite names.
		Arguments:
			context	(optional)	- filter suites containing supplied context name
			json 	(optional)	- return result in JSON format
	"""
	from django.http import HttpResponse
	from context import get as context_get
	import contrib
	
	context = request.REQUEST.get('context', None)
	json = request.REQUEST.get('json', False)
	target = request.REQUEST.get('target', False)
	
	suites = []
	_root = contrib.get_document_root(target)
	contextini = '.context.ini'
	for dirpath, dirnames, filenames in os.walk(_root, followlinks=True):
		if not ( contextini in filenames ): continue
		if context:
			contextfile = os.path.join(dirpath, contextini)
			ctx = context_get(contextfile)
			ctx_sections = ctx.sections()
			if not context in ctx_sections: continue
		suites += [ dirpath.replace(_root, '').replace('\\','/').lstrip('/') ]
	
	if json:
		import simplejson
		return HttpResponse(simplejson.dumps(suites))
	return HttpResponse(str(suites).replace('[','').replace(']','').rstrip(',').replace('\'',''))

urlpatterns = patterns('',
	(r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/img/favicon.gif'}),
	(r'^actions/folder/create/$', 'views.createFolder'),
	(r'^actions/suite/create/$', 'views.createSuite'),
	(r'^actions/suite/edit/$', 'views.editSuite'),
	(r'^actions/suite/submit/$', 'views.submitSuite'),
	(r'^actions/suite/run/$', 'views.runSuite'),
	(r'^actions/test/create/$', 'views.createTest'),
	(r'^actions/test/save/$', 'views.saveTest'),
	(r'^actions/test/save/draft/$', 'views.saveDraftTest'),
	url(r'^actions/test/run/$', 'views.runTest', name='run-test'),
	url(r'^actions/test/runlocal/$', 'views.runLocalTest', name='run-local-test'),
	(r'^actions/test/stub/$', 'views.stubFile'),
	(r'^actions/test/submit/$', 'views.submitTest'),
	(r'^actions/test/control/$', 'views.getControl'),
	(r'^logger/records/recv/$', 'views.recvLogRecords'),
	(r'^actions/remove/$', 'views.removeObject'),
	(r'^actions/suite/enumerate/$', enumerate_suites),
)

urlpatterns += patterns('',
	(r'^testsrc', include('src.tests.urls')),
)

urlpatterns += patterns('',
	(r'^static/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': settings.MEDIA_ROOT,
		'show_indexes': True
		}
	),
	(r'^ttttestsrc/(?P<path>.*)$', 'views.serve',
		{
		'show_indexes': True
		}
	),
	(r'^(?P<path>.*)$', 'views.serve',
		{
			'show_indexes': True
		}
	),
)
