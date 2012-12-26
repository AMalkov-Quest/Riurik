from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.github.views',
	(r'^login$', 'login'),
	(r'^initrepo$', 'initrepo'),
	(r'^mkrepo$', 'mkrepo'),
	(r'^delrepo$', 'delrepo'),
	(r'signin$', 'signin'),
)
