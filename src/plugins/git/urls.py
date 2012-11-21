from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.git.views',
	(r'^commit$', 'commit'),
	(r'^$', 'git'),
)
