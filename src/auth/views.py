# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.http import HttpResponseRedirect
from django.conf import settings
import httplib, urllib, json
from github import Github
import gitware

def signin(req):
	variables = { 'RIURIK_URL': 'http://'+req.META['HTTP_HOST']+'/login' }
	variables.update(globals())
	return _render_to_response("signin.html", variables)

def login(req):
	code = req.GET.get('code')
	state = req.GET.get('state')
	host = req.META['HTTP_HOST']
	
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

	req.session['token'] = token['access_token']

	return HttpResponseRedirect('/')

def github_test(req):
	git = Github( req.session['token'] )
	user = git.get_user()
	git = user.login
	return _render_to_response("test.html", locals())
