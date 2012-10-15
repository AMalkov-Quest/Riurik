# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.http import HttpResponseRedirect
from django.conf import settings
import httplib, urllib, json
import gitware

def signin(req):
	variables = { 'RIURIK_URL': 'http://'+req.META['HTTP_HOST']+'/login' }
	variables.update(globals())
	return _render_to_response("signin.html", variables)

def authorize(code, host):
	params = urllib.urlencode({
		'code': code.encode('utf-8'),
		'client_id': gitware.client_id[host],
		'client_secret': gitware.client_secret[host],
		#'state': state.encode('utf-8'),
	})
	conn = httplib.HTTPSConnection(host='github.com')
	conn.request('POST', gitware.github_access_url, params, { 'Accept': 'application/json' })
	resp = conn.getresponse()
	token = json.loads(resp.read())
	return token['access_token']

def login(req):
	code = req.GET.get('code')
	state = req.GET.get('state')
	host = req.META['HTTP_HOST']
	
	token = authorize(code, host)
	req.session['token'] = token

	github = gitware.Github(token)
	user = github.get_user()
	repos = gitware.get_repos(user)
	if repos:
		return HttpResponseRedirect('/')
	else:
		return _render_to_response("signin.html", variables)
