#######################################################################################
#Copyright (C) 2008 Quest Software, Inc.
#File:		urls.py
#Version:       1.0.0.0

#######################################################################################
#
#       THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#       EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#       WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################
from django.conf.urls.defaults import *

from django.views.static import serve
import os
import settings

urlpatterns = patterns('',
	('^websocket$', 'views.handler' ),
	(r'^actions/folder/create/$', 'views.createFolder'),
	(r'^actions/suite/create/$', 'views.createSuite'),
	(r'^actions/test/create/$', 'views.createTest'),
	(r'^actions/test/save/$', 'views.saveTest'),
)

urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve',
			  {
			'document_root': settings.MEDIA_ROOT,
			'show_indexes': True
			}
		),
        (r'^'+settings.STATIC_TESTS_URL+'(?P<path>.*)$', 'views.serve',
		{
			'document_root': settings.STATIC_TESTS_ROOT,
			'show_indexes': True
		}
	),
)
