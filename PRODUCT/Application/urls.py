#coding: utf-8

# PUT THIS TO YOUR urls.py

from django.conf.urls.defaults import *

urlpatterns += patterns('',
	(r'^tests/', include('Application.tests.urls')),
)
