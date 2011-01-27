from django.conf.urls.defaults import *

from django.views.static import serve
import os

urlpatterns = patterns('Application.tests.views',
	(r'^$', 'index'),
)