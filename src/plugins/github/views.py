# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
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

def logout(request):
	request.session.flush()
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

def initrepo(request):
	title = request.GET.get('title', '')
	user = get_user(request)
	repo = gitware.get_repo_by_name(user, title)
	gitware.create_deploy_key(user, repo)
	gitware.init_riurik_repo(user, repo)
	request.session['repoid'] = repo.id	
	return HttpResponseRedirect('/')

def mkrepo(request):
	title = request.GET.get('title', '')
	user = get_user(request)
	gitware.create_repo(user, title)
	return HttpResponse()

def delrepo(request):
	title = request.GET.get('title', '')
	user = get_user(request)
	repo = gitware.get_repo_by_name(user, title)
	repo.delete()
	return HttpResponse()

def get_user(request):
	token = get_token(request)
	if not token:
		login = request.session.get('login', None)
		password = request.session.get('password', None)
		return gitware.get_user_by_password(login, password)
	else:
		return gitware.get_user_by_token(token)

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
		return '/' 

class GitFronPageHandler(serving.DefaultHandler):

	def load_index_template(self):
		try:
			t = loader.select_template(['git-front-page.html'])
		except TemplateDoesNotExist:
			t = Template(
				django.views.static.DEFAULT_DIRECTORY_INDEX_TEMPLATE,
				name='Default directory index template')

		return t

	def get_dir_index(self, document_root, fullpath, request):
		descriptor = super(GitFronPageHandler, self).get_dir_index(document_root, fullpath, request)
		descriptor['type'] = 'front-page'
		descriptor['githref'] = gitware.get_oauth_href(request)
		return descriptor

	def get_file_content_to_edit(self, fullpath, stubbed):
		descriptor = super(GitFronPageHandler, self).get_file_content_to_edit(fullpath, stubbed)
		descriptor['read_only'] = True
		return descriptor

class GitInitHandler(GitHandler):

	def serve(self, request):
		log.debug('initialize git repo fo %s' % (self.user))

		repo_name = gitware.gen_repo_name(self.user)
		token = get_token(request)
		repo = gitware.try_to_create_riurik_repo(token)
		if repo:
			return self.repo_is_created(repo_name)
		else:
			user = get_user(request)
			return self.have_to_create_repo(user)

	def have_to_create_repo(self, user):
		repos_list = gitware.get_repos(user)
		log.debug(repos_list)
		descriptor = Context({
			'directory' : '/',
			'type'		: 'virtual',
			'file_list' : [],
			'dir_list'  : [],
			'contexts'  : [],
			'favicon'   : None,
			'spec'      : None,
			'login'     : self.user,
			'repos_list' : [repo.name for repo in repos_list],
		})
		return _render_to_response('select-repo.html', descriptor)

	def repo_is_created(self, repo_name):

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
