# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.template import Context
from django.http import HttpResponseRedirect
import settings
import httplib, urllib, json
from logger import log
import serving
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

def oAuth(request):
	return request.session.get('token')

def plugin(request, path):
	if settings.appInstalled('src.plugins.github') and not path or path == '/':
		return GitFronPageHandler(request, path)

	if oAuth(request):
		handler = GitHandler(request, path)
		if handler.get_document_root():
			return handler
		else:
			return GitInitHandler(request, path)

class GitHandler(serving.BaseHandler):

	def __init__(self, request, path):
		self.path = path
		token = request.session.get('token')
		ghub = gitware.Github(token)
		self.user = ghub.get_user()
		self.repo = gitware.get_riurik_repo(self.user)

	def get_document_root(self):
		return gitware.get_document_root(self.user, self.repo)

	def get_full_path(self, path=None):
		path = self.path if not path else path
		return gitware.get_full_path(self.user, self.repo, path)

	def get_virtual_root(self):
		return '' 

class GitFronPageHandler(GitHandler):

	def __init__(self, request, path):
		pass

	def serve(self, request):
		log.debug('show git front page')
		descriptor = Context({
			'directory' : '/',
			'type'		: 'front-page',
			'file_list' : [],
			'dir_list'  : [],
			'contexts'  : [],
			'favicon'   : None,
			'spec'      : None,
			'githref'   : gitware.get_oauth_href(request)
		})
		return _render_to_response('git-front-page.html', descriptor)

class GitInitHandler(GitHandler):

	def serve(self, request):
		log.debug('initialize git repo fo %s' % ('user'))
		descriptor = Context({
			'directory' : '/',
			'type'		: 'virtual',
			'file_list' : [],
			'dir_list'  : [],
			'contexts'  : [],
			'favicon'   : None,
			'spec'      : None,
		})
		return _render_to_response('git-init.html', descriptor)
