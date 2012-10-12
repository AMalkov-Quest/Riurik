from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.git.views',
	(r'^$', 'git'),
)
