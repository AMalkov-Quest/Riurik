import os
from django.conf.urls.defaults import patterns, include, url
from django.views.static import serve
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
import views, settings

urlpatterns = patterns('',
	('^hello/$', 'views.hello'),
)

urlpatterns += patterns('',
	(r'^testsrc', include('tests.urls')),
)

urlpatterns += staticfiles_urlpatterns()
