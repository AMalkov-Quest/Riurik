#######################################################################################
#Copyright (C) 2010 Quest Software, Inc.
#File:        infoportal_security_levels.py
#Version:       1.0.0.1

#######################################################################################
#
#       THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#       EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#       WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################

UnSecurePages = ["/remote_log","/site/state/","/site_permission/state/", "/user_permission_report/state/", "/site_usage_report/state/", "/site_details_report/state", "/create_csv_report/state", "/tests/"]

SiteOwnerPages = ["/make/search", "/make/search/additional", "/", "/site_usage_info", "/user_permission_report","/welcome",
"/user_permission_report/state/","/search_settings","/ent/state/","/farm/state/",
"/reports/site/userpermissions", "/reports/site/siteusage", "/reports/site/sitedetails", "/site_usage_report", "/site_usage_report/state/",
"/actions/permissions/delete/", "/actions/permissions/core/delete/", "/actions/permissions/duplicate/", "/actions/permissions/core/duplicate/",
"/actions/permissions/grant/", "/actions/permissions/core/grant/","/actions/permissions/core/deletepermission/", "/actions/permissions/reassign/", "/actions/permissions/core/reassign/",
"/actions/sites/copy/", "/actions/sites/core/copy/", "/actions/sites/core/copy/log/", "/report_export", "/Lists",
"/site_details_report", "/site_details_report/execute", "/site_details_report/data", "/create_csv_report", "/download_csv_report"]

InfoPortalAdminOnlyPages = ["/addfarm", "/settings", "/settings.html", "/make/delete_user", "/make/add_user/", "/make/set_topsetting/", 
"/make/remove_farm/","/make/add_farm/","/make/upload_license", "/farms_show"]

SiteFullControlPages = ["/site_collection","/reports/site/metrics","/reports/site/permissions","/site_permission_report",
"/reports/site/userpermissions","/user_permission_report","/report_export",
"/reports/site/siteusage", "/site_usage_report"]
