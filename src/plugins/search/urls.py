from django.conf.urls.defaults import *

urlpatterns = patterns('plugins.search.views',
	(r'^$', 'search_view_ext'),
)
