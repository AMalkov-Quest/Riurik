# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.http import HttpResponseRedirect
from django.conf import settings
import httplib, urllib, json
from github import Github

GITHUB_OAUTH_CLIENTID = '26e2af67a56e633c8426' 
GITHUB_OAUTH_AUTHORIZE = 'https://github.com/login/oauth/authorize'
GITHUB_OAUTH_ACCESS_TOKEN = 'https://github.com/login/oauth/access_token'
GITHUB_OAUTH_SECRET = '03d9bdc160d7364f31e5afefda6747658cdf12ab'

def signin(req):
	variables = { 'RIURIK_URL': 'http://'+req.META['HTTP_HOST']+'/login' }
	variables.update(globals())
	return _render_to_response("signin.html", variables)

def login(req):
	code = req.GET.get('code')
	state = req.GET.get('state')
	
	params = urllib.urlencode({
		'code': code.encode('utf-8'),
		'client_id': GITHUB_OAUTH_CLIENTID,
		#'state': state.encode('utf-8'),
		'client_secret': GITHUB_OAUTH_SECRET
	})
	conn = httplib.HTTPSConnection(host='github.com')
	conn.request('POST', GITHUB_OAUTH_ACCESS_TOKEN, params, { 'Accept': 'application/json' })
	resp = conn.getresponse()
	token = json.loads(resp.read())

	req.session['token'] = token['access_token']

	return HttpResponseRedirect('/') #_render_to_response("login.html", locals())

def github_test(req):
	git = Github( req.session['token'] )
	user = git.get_user()
	git = user.login
	return _render_to_response("test.html", locals())
