# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.template import Context
from django.http import HttpResponseRedirect
import settings
import httplib, urllib, json
from logger import log
import serving
import gitware

def _signin_(req):
	variables = { 'RIURIK_URL': 'http://'+req.META['HTTP_HOST']+'/login' }
	variables.update(globals())
	return _render_to_response("signin.html", variables)

def authorize(code, host):
	log.debug( 'authorize on github' )

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

	log.debug( 'authorization is done, token %s' % token )
	return token['access_token']

def store_auth(request, user):
	if user:
		request.session['login'] = user.login
		repo = gitware.get_riurik_repo(user)
		if repo:
			request.session['repoid'] = repo.id

def store_auth_by_token(request, token):
	request.session['token'] = token
	user = gitware.get_user_by_token(token)
	store_auth(request, user)

def store_auth_by_password(request, login, password):
	request.session['password'] = password
	user = gitware.get_user_by_password(login, password)
	store_auth(request, user)

def get_auth(request):
	return (
		request.session.get('token', None),
		request.session.get('login', None),
		request.session.get('repoid', None)
	)

def signin(request):
	login = request.GET.get('login')
	password = request.GET.get('password')
	log.debug('sign in: %s %s' % (login, password))
	store_auth_by_password(request, login, password)

	return HttpResponseRedirect('/')

def login(request):
	code = request.GET.get('code')
	state = request.GET.get('state')
	host = request.META['HTTP_HOST']
	
	token = authorize(code, host)
	store_auth_by_token(request, token)

	return HttpResponseRedirect('/')

def authorized(request):
	token, login, repoid = get_auth(request)
	return login

def reporized(request):
	token, login, repoid = get_auth(request)
	return repoid

def get_token(request):
	token, login, repoid = get_auth(request)
	return token

def plugin(request, path, time):
	if settings.appInstalled('src.plugins.github'):
		if authorized(request):
			if reporized(request):
				return GitHandler(request, path, time)
			else:
				return GitInitHandler(request, path, time)
		else:
			return GitFronPageHandler(request, path, time)

def mkrepo(request):
	token = get_token(request)
	store_auth_by_token(request, token)
	user = gitware.get_user_by_token(token)
	repo = gitware.try_to_create_repo(user)

	return HttpResponseRedirect('/')

class GitHandler(serving.BaseHandler):

	def __init__(self, request, path, time):
		super(GitHandler, self).__init__(request, path, time)
		token, login, repoid = get_auth(request)
		self.user = login
		self.repo = repoid
		if not self.user:
			user = gitware.get_user_by_token(token)
			if user:
				self.user = user.login
				repo = gitware.get_riurik_repo(user)
				if repo:
					self.repo = repo.id

	def get_document_root(self):
		return gitware.get_document_root(self.user, self.repo)

	def get_full_path(self, path=None):
		path = self.path if not path else path
		return gitware.get_full_path(self.user, self.repo, path)

	def get_virtual_root(self):
		return '' 

class GitFronPageHandler(GitHandler):

	def __init__(self, request, path, time):
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
			'githref'   : gitware.get_oauth_href(request),
		})
		return _render_to_response('git-front-page.html', descriptor)

class GitInitHandler(GitHandler):

	def serve(self, request):
		log.debug('initialize git repo fo %s' % (self.user))

		repo_name = gitware.gen_repo_name(self.user)
		token = get_token(request)
		if not token:
			password = request.session.get('password', None)
			user = gitware.get_user_by_password(self.user, password)
		else:
			user = gitware.get_user_by_token(token)

		repo = gitware.try_to_create_repo(user)
		if repo:
			return self.repo_is_created()
		else:
			return self.have_to_create_repo(repo_name)

	def repo_is_created(self):
		return HttpResponseRedirect('/')

	def have_to_create_repo(self, repo_name):

		descriptor = Context({
			'directory' : '/',
			'type'		: 'virtual',
			'file_list' : [],
			'dir_list'  : [],
			'contexts'  : [],
			'favicon'   : None,
			'spec'      : None,
			'login'     : self.user,
			'repo_name' : repo_name,
		})
		return _render_to_response('git-init.html', descriptor)
