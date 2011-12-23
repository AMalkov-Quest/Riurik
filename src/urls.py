from django.conf.urls.defaults import *

from django.views.static import serve
import os
import settings
import views
from logger import log

urlpatterns = patterns('',
	(r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/img/favicon.gif'}),
	(r'^actions/folder/create/$', 'views.createFolder'),
	(r'^actions/suite/create/$', 'views.createSuite'),
	(r'^actions/suite/edit/$', 'views.editSuite'),
	(r'^actions/suite/submit/$', 'views.submitSuite'),
	(r'^actions/suite/run/$', 'views.runSuite'),
	(r'^actions/test/create/$', 'views.createTest'),
	(r'^actions/test/save/$', 'views.saveTest'),
	(r'^actions/test/save/draft/$', 'views.saveDraftTest'),
	url(r'^actions/test/run/$', 'views.runTest', name='run-test'),
	url(r'^actions/test/runlocal/$', 'views.runLocalTest', name='run-local-test'),
	(r'^actions/test/stub/$', 'views.stubFile'),
	(r'^actions/test/submit/$', 'views.submitTest'),
	(r'^actions/test/control/$', 'views.getControl'),
	(r'^logger/records/recv/$', 'views.recvLogRecords'),
	(r'^actions/remove/$', 'views.removeObject'),
	(r'^actions/suite/enumerate/$', 'views.enumerate_suites'),
	(r'^(?P<path>.*)/show_context[/]?$', 'views.show_context'),
	(r'^settings[/]?$', 'views.live_settings_view'),
	(r'^settings/save[/]?$', 'views.live_settings_save'),
)

urlpatterns += patterns('',
	(r'^search', include('plugins.search.urls')),
)

try:
	urlpatterns += patterns('',
		(r'^testsrc', include('%s.urls' % settings.inner_testsloader_path)),
	)
except AttributeError, e:
	log.info(e)

urlpatterns += patterns('',
	(r'^static/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': settings.MEDIA_ROOT,
		'show_indexes': True
		}
	),
	(r'^(?P<path>.*)$', 'views.serve',
		{
			'show_indexes': True
		}
	),
)
