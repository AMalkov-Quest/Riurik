from django.conf.urls.defaults import *

from django.views.static import serve
import os

urlpatterns = patterns('Application.jstests.views',
	(r'^$', 'index'),
)
urlpatterns += patterns('',
	(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.abspath(__file__),'static')}),
)
