from django.conf.urls.defaults import *

from django.views.static import serve
import os
import settings
import views

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
)

urlpatterns += patterns('',
	(r'^testsrc', include('src.tests.urls')),
)

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
