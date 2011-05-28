import os
from django.conf.urls.defaults import *
from django.views.static import serve

urlpatterns = patterns('src.tests.views',
	(r'^$', 'index'),
)