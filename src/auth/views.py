from django.shortcuts import render_to_response as _render_to_response
from django.conf import settings
import httplib
import proxy

RIURIK_URL = getattr(settings, 'RIURIK_URL', 'http://localhost:8000/')
GITHUB_OAUTH_CLIENTID = 'c957aefa0b92f6841803' 
GITHUB_OAUTH_AUTHORIZE = 'https://github.com/login/oauth/authorize'
GITHUB_OAUTH_ACCESS_TOKEN = 'https://github.com/login/oauth/access_token'
GITHUB_OAUTH_SECRET = ''
RIURIK_LOGIN_URL = RIURIK_URL + 'login'

def signin(req):
	return _render_to_response("signin.html", globals())

@proxy.use_proxy(host='localhost', port=3128)
def login(req):
	code = req.GET.get('code')

	conn = httplib.HTTPSConnection(host='github.com', port=80)
	conn.request('GET', GITHUB_OAUTH_ACCESS_TOKEN, { 'code':code }, { 'Accept': 'application/json' })
	resp = conn.getresponse()
	token = resp.read()

	return _render_to_response("login.html", locals)
