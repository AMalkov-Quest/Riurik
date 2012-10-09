from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.help.views',
	(r'^$', 'readme'),
)
