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

urlpatterns = patterns('',
	('^$', 'views.handler' ),
)
