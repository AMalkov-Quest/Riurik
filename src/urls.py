from django.conf.urls.defaults import *
from django.views.generic import RedirectView
from django.views.static import serve
import os
import src.settings
import src.views, src.ci, src.run
from logger import log

urlpatterns = patterns('',
	(r'^favicon\.ico$', RedirectView.as_view(url="/static/img/favicon.gif")),
	(r'^actions/folder/create/$', 'src.views.createFolder'),
	(r'^actions/suite/create/$', 'src.views.createSuite'),
	(r'^actions/suite/edit/$', 'src.views.editSuite'),
	(r'^actions/suite/submit/$', 'src.views.submitSuite'),
	(r'^actions/suite/run/$', 'src.run.suite'),
	(r'^actions/test/create/$', 'src.views.createTest'),
	(r'^actions/test/save/$', 'src.views.saveTest'),
	(r'^actions/test/save/draft/$', 'src.views.saveDraftTest'),
	url(r'^actions/test/run/$', 'src.run.test', name='run-test'),
	(r'^actions/nodejs/run/$', 'src.nodejs.run'),
	(r'^actions/test/stub/$', 'src.views.stubFile'),
	(r'^actions/test/submit/$', 'src.views.submitTest'),
	(r'^actions/test/control/$', 'inuse.getControl'),
	(r'^logger/records/recv/$', 'src.views.recvLogRecords'),
	(r'^actions/remove/$', 'src.views.removeObject'),
	(r'^actions/rename/$', 'src.views.renameObject'),
	(r'^actions/suite/enumerate/$', 'ci.enumerate_suites'),
	(r'^(?P<path>.*)/show_context[/]?$', 'src.views.show_context'),
	(r'^src.settings[/]?$', 'src.views.live_src.settings_view'),
	(r'^src.settings/save[/]?$', 'src.views.live_src.settings_save'),
	(r'^report_callback/$', 'src.views.report_callback'),
	(r'^report/status$', 'src.views.tests_status'),
	(r'^report/progress$', 'src.views.tests_progress'),
	(r'^report/purge$', 'src.views.reporting_purge'),

)

urlpatterns += patterns('',
	(r'^search', include('src.plugins.search.urls')),
	(r'^readme', include('src.plugins.help.urls')),
	(r'^git/(?P<cmd>.*)$', include('src.plugins.git.urls')),
	(r'^github/', include('src.plugins.github.urls')),
)

urlpatterns += patterns('',
	(r'^static/(?P<path>.*)$', 'django.views.static.serve',
		{
		'document_root': src.src.settings.MEDIA_ROOT,
		'show_indexes': True
		}
	),
	(r'^(?P<path>.*)$', 'src.views.serve',
		{
			'show_indexes': True
		}
	),
)
