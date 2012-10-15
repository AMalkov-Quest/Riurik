from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.github.views',
	(r'^login$', 'login'),
)
