#######################################################################################
#Copyright (C) 2010 Quest Software, Inc.
#File:		security.py
#Version:       1.2.0.3

#######################################################################################
#
#       THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#       EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#       WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################

import app_contrib as utils 
import auth_users

from logger import log
from django.shortcuts import render_to_response
import re
from infoportal_security_levels import *

class Roles:
	SiteAdmin = "SiteAdmin"
	RestrictedUser = 'RestrictedUser'
	SiteFullControl = "SiteFullControl"

	
def SetRole(request, role):
	log.Info("Role: " + role)
	request.InfoPortalRole = role

def SetWithSubSites(request, value):
	log.Info("With subsites: " + str(value))
	request.with_subsites = value

def IsSiteOwner(user, search_q):
	return len(utils.GetSiteOwnerSitesWOErrors(user, 1, search_q, '')) != 0

def IsSiteFullControl(user, search_q):
	return utils.IsSiteFullControl(user, search_q)

class SignInAsDifferentUserHandlerMiddleware(object):
	
	def process_request(self, request):
		if request.META['PATH_INFO'].strip('//') == 'loginas':
			return self.loggin_as_diff(request)
		
	def loggin_as_diff(self, request):
		from django.http import HttpResponse, HttpResponseRedirect
		
		user = utils.GetCurrentUser(request)
		log.Info('************* Login as different user *************')
		
		loginAsDifferentAttemptCount = request.session.get('loginAsDifferentAttemptCount', 0)
		previousLoggedInAs = request.session.get('previousLoggedInAs', user)
		log.Info('previous logged in as: %s' % previousLoggedInAs)
		request.session[ 'previousLoggedInAs' ] = user
		
		if previousLoggedInAs == user and loginAsDifferentAttemptCount < 3:
			request.session[ 'loginAsDifferentAttemptCount' ] = loginAsDifferentAttemptCount + 1
			
			response = HttpResponse( status = 401 )
			
			response[ "WWW-Authenticate" ] = "NTLM"
			response[ "Vary" ] = "*"
			response[ "Cache-Control" ] = "private"
			response["Connection"] = "close"                     
			
			log.Info('current user: %s' % user)
			log.Info('return 401 response')
			
			return response
		
		log.Info('Login as %s is successfully competed' % user)
		del request.session[ 'loginAsDifferentAttemptCount' ]
		
		return HttpResponseRedirect("/")
			
	
class RequestHandlerMiddleware(object):
	
	def process_request(self, request):
		return self.make_auth(request)
			
	def make_auth(self, request):		
		log.Info('************* Start checking auth info *************')						
		
		def checkPattern(list_with_patterns, url):
			for p in list_with_patterns:
				#if re.compile(p).search(url): return True
				if p == url: return True
			return False
			
		method_url = request.META['PATH_INFO']
		log.Info('Web method requested: ' + method_url)
		
		if not checkPattern(UnSecurePages+InfoPortalAdminOnlyPages+SiteOwnerPages+SiteFullControlPages, method_url):			
			return render_to_response( "app_error.html", locals() )
			
		if checkPattern(UnSecurePages, method_url):
			log.Info('Unsecure page')
			return
		
		current = utils.GetCurrentUser(request)
		log.Info('User authenticated as: ' + str(current))
		scopeUrls = utils.GetScopeUrls(request)
		permScope = utils.GetPermScope(request)

		if auth_users.IsSuperUser(current):
			log.Info("Role: Super user" )
		else:
			log.Info("Checking is Site Collections Owner..")			
			for scopeUrl in scopeUrls:
				log.Info(" - for site-collection '" + scopeUrl + "'")
				log.Info(" - and web-method '" + method_url + "'")
				
				def RedirectRestrictedErrorPage():
					SetRole(request, Roles.RestrictedUser)
					log.Info('************* authentication failed *************')
					return render_to_response( "auth_error.html", locals() )		
		
				if  permScope == 'wappl' and checkPattern(['/user_permission_report', '/report_export'], method_url):
					return RedirectRestrictedErrorPage()
					
				if IsSiteOwner(current, scopeUrl) and not checkPattern(InfoPortalAdminOnlyPages, method_url) and checkPattern(SiteOwnerPages+SiteFullControlPages, method_url):
					SetRole(request, Roles.SiteAdmin)
				elif IsSiteFullControl(current, scopeUrl) and not checkPattern(InfoPortalAdminOnlyPages, method_url) and checkPattern(SiteFullControlPages, method_url):
					SetRole(request, Roles.SiteFullControl)
					SetWithSubSites(request,False)
				else:
					return RedirectRestrictedErrorPage()