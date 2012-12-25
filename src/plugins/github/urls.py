from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.github.views',
	(r'^login$', 'login'),
	(r'^initrepo$', 'initrepo'),
	(r'signin$', 'signin'),
)
