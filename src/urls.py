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

urlpatterns = patterns('',
	(r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/img/favicon.gif'}),
	(r'^websocket$', 'views.handler' ),
	(r'^actions/folder/create/$', 'views.createFolder'),
	(r'^actions/suite/create/$', 'views.createSuite'),
	(r'^actions/suite/edit/$', 'views.editSuite'),
	(r'^actions/test/create/$', 'views.createTest'),
	(r'^actions/test/save/$', 'views.saveTest'),
	(r'^actions/test/save/draft/$', 'views.saveDraftTest'),
	(r'^actions/test/run/$', 'views.runTest'),
	(r'^actions/test/stub/$', 'views.stubFile'),
	(r'^actions/test/submit/$', 'views.submitTest'),
	(r'^logger/records/recv/$', 'views.recvLogRecords'),
	(r'^actions/remove/$', 'views.removeObject'),
)

urlpatterns += patterns('',
	(r'^static/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': settings.MEDIA_ROOT,
		'show_indexes': True
		}
	),
	(r'^' + settings.TESTS_URL + '/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': settings.VIRTUAL_URLS[settings.INNER_TESTS_ROOT],
		'show_indexes': True
		}
	),
	(r'^' + settings.STATIC_TESTS_URL + '(?P<path>.*)$', 'views.serve',
		{
			'document_root': settings.STATIC_TESTS_ROOT,
			'show_indexes': True
		}
	),
)
