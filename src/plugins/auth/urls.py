from django.conf.urls.defaults import patterns

urlpatterns = patterns('plugins.auth.views',
	(r'^$', 'default'),
)
