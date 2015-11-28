from django.conf.urls.defaults import *
from django.views.generic import RedirectView
from django.views.static import serve
import os
import settings
import views, ci
from logger import log

urlpatterns = patterns('',
	(r'^favicon\.ico$', RedirectView.as_view(url="/static/img/favicon.gif")),
	(r'^actions/folder/create/$', 'views.createFolder'),
	(r'^actions/suite/create/$', 'views.createSuite'),
	(r'^actions/suite/edit/$', 'views.editSuite'),
	(r'^actions/suite/submit/$', 'views.submitSuite'),
	(r'^actions/suite/run/$', 'run.suite'),
	(r'^actions/test/create/$', 'views.createTest'),
	(r'^actions/test/save/$', 'views.saveTest'),
	(r'^actions/test/save/draft/$', 'views.saveDraftTest'),
	url(r'^actions/test/run/$', 'run.test', name='run-test'),
	(r'^actions/test/stub/$', 'views.stubFile'),
	(r'^actions/test/submit/$', 'views.submitTest'),
	(r'^actions/test/control/$', 'inuse.getControl'),
	(r'^logger/records/recv/$', 'views.recvLogRecords'),
	(r'^actions/remove/$', 'views.removeObject'),
	(r'^actions/rename/$', 'views.renameObject'),
	(r'^actions/suite/enumerate/$', 'ci.enumerate_suites'),
	(r'^(?P<path>.*)/show_context[/]?$', 'views.show_context'),
	(r'^settings[/]?$', 'views.live_settings_view'),
	(r'^settings/save[/]?$', 'views.live_settings_save'),
	(r'^report_callback/$', 'views.report_callback'),
	(r'^report/status$', 'views.tests_status'),
	(r'^report/progress$', 'views.tests_progress'),
	(r'^report/purge$', 'views.reporting_purge'),

)

urlpatterns += patterns('',
	(r'^search', include('plugins.search.urls')),
	(r'^readme', include('plugins.help.urls')),
	(r'^git/(?P<cmd>.*)$', include('plugins.git.urls')),
	(r'^github/', include('plugins.github.urls')),
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
