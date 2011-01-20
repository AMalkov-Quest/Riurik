#######################################################################################
#Copyright (C) 2008 Quest Software, Inc.
#File:		urls.py
#Version:       1.0.0.0

#######################################################################################
#
#       THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#       EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#       WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################
from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

from django.views.static import serve
import os

urlpatterns = patterns('',

	(r'^admin/(.*)', admin.site.root),
	('^$', 'Application.views.default' ),
	('^welcome$', 'Application.views.welcome' ),
	('^remote_log$', 'Application.views.remote_log' ),
	('^addfarm$', 'Application.views.addFarm' ),	
	(r'^site_collection','Application.views.site_collection'),	
	(r'^site_permission_report','Application.views.site_permission_report'),
	(r'^user_permission_report$','Application.views.user_permission_report'),
	(r'^user_permission_report/state/$','Application.views.user_permission_report_state'),
	(r'^site_usage_report$','Application.views.site_usage_report'),
	(r'^site_usage_report/state/$', 'Application.views.getSiteUsageReportState'),
	(r'^site_usage_info$','Application.views.site_usage_info'),
	(r'^site_details_report$', 'Application.views.site_details_report'),
	(r'^site_details_report/execute$', 'Application.views.get_site_details_report'),
	(r'^site_details_report/data$', 'Application.views.async_get_site_details_data'),
	(r'^site_details_report/state$', 'Application.views.get_site_details_report_state'),
	(r'^create_csv_report$','Application.views.create_csv_report'),
	(r'^create_csv_report/state$','Application.views.get_csv_report_state'),
	(r'^make/search$',  'Application.views.make_search'),
	(r'^make/search/additional$',  'Application.views.make_search_additional'),        
	(r'^search_settings$',  'Application.views.search_settings'),
	(r'^ent/state/$', 'Application.views.getTrendState'),
	(r'^farm/state/$', 'Application.views.farmState'),
	(r'^site/state/$', 'Application.views.getSiteTrendState'),
	(r'^site_permission/state/$', 'Application.views.getSitePermissionState'),
	(r'^settings','Application.views.settings'),
	(r'^make/delete_user', 'Application.views.make_delete_user'),
	(r'^make/add_user/$', 'Application.views.make_add_user'),
	(r'^make/set_topsetting/$', 'Application.views.make_set_topsetting'),	
	(r'^make/remove_farm/$', 'Application.views.make_remove_server'),		
	(r'^make/add_farm/$', 'Application.views.make_add_server'),	
	(r'^make/upload_license$', 'Application.views.make_upload_license'),
	(r'^reports/site/metrics$', 'Application.reports.siteMetrics'),
	(r'^reports/site/permissions$', 'Application.reports.sitePermissions'),
	(r'^reports/site/userpermissions$', 'Application.reports.userPermissions'),
	(r'^reports/site/siteusage$', 'Application.reports.siteUsage'),
	(r'^reports/site/sitedetails$', 'Application.reports.siteDetails'),
	(r'^actions/permissions/delete/$', 'Application.actions.deletePermissions'),
	(r'^actions/permissions/core/delete/$', 'Application.actions.deletePermissionsCore'),
	(r'^actions/permissions/grant/$', 'Application.actions.grantPermissions'),
	(r'^actions/permissions/core/grant/$', 'Application.actions.grantPermissionsCore'),
	(r'^actions/permissions/core/deletepermission/$', 'Application.actions.demotePermissionCore'),	
	(r'^actions/permissions/duplicate/$', 'Application.actions.duplicatePermissions'),
	(r'^actions/permissions/core/duplicate/$', 'Application.actions.duplicatePermissionsCore'),
	(r'^actions/permissions/reassign/$', 'Application.actions.reassignPermissions'),	
	(r'^actions/permissions/core/reassign/$', 'Application.actions.reassignPermissionsCore'),
	(r'^actions/sites/copy/$', 'Application.actions.copySite'),	
	(r'^actions/sites/core/copy/$', 'Application.actions.copySiteCore'),
	(r'^actions/sites/core/copy/log/$', 'Application.actions.getCopySiteLog'),
	(r'^farms_show$', 'Application.views.farms_show'),
	(r'^report_export$', 'Application.views.report_export'),
	(r'^Lists$', 'Application.views.get_lists'),
	(r'^MultipleLists$', 'Application.views.get_mlists'),
	(r'^tests/', include('Application.jstests.urls')),
)
