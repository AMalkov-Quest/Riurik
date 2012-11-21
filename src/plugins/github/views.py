# coding: utf-8

from django.shortcuts import render_to_response as _render_to_response
from django.template import Context
from django.http import HttpResponseRedirect
import settings
import httplib, urllib, json
from logger import log
import serving
import gitware
from plugins.git import gitssh

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

def store_auth(request, token):
	request.session['token'] = token
	user = gitware.get_user_by_token(token)
	request.session['login'] = user.login
	repo = gitware.get_riurik_repo(user)
	request.session['repoid'] = repo.id

def get_auth(request):
	return (
		request.session.get('token', None),
		request.session.get('login', None),
		request.session.get('repoid', None)
	)

def login(req):
	code = req.GET.get('code')
	state = req.GET.get('state')
	host = req.META['HTTP_HOST']
	
	token = authorize(code, host)
	store_auth(req, token)

	return HttpResponseRedirect('/')

def oAuth(request):
	return request.session.get('token', None)

def plugin(request, path):
	if settings.appInstalled('src.plugins.github'):
		if oAuth(request):
			handler = GitHandler(request, path)
			if handler.repo:
				return handler
			else:
				return GitInitHandler(request, path)
		else:
			return GitFronPageHandler(request, path)

def mkrepo(request):
	token = oAuth(request)
	user = gitware.get_user_by_token(token)
	repo = gitware.mkrepo_for_riurik(user)
	gitware.init_repo(user, repo)
	gitware.init_gitignore(user, repo)

	gitssh.command(token, "git config user.name '%s'" % user.login)
	gitssh.command(token, "git config user.email %s" % user.email)
	gitssh.command(token, "git add .")
	gitssh.command(token, "git commit -a -m 'initial commit'")
	gitssh.command(token, "git push -u origin master")

	return HttpResponseRedirect('/')

class GitHandler(serving.BaseHandler):

	def __init__(self, request, path):
		self.path = path
		token, login, repoid = get_auth(request)
		self.user = login if login else gitware.get_user_by_token(token).login
		self.repo = repoid if repoid else gitware.get_riurik_repo(self.user).id

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
			'githref'   : gitware.get_oauth_href(request),
		})
		return _render_to_response('git-front-page.html', descriptor)

class GitInitHandler(GitHandler):

	def serve(self, request):
		log.debug('initialize git repo fo %s' % (self.user.login))

		repo_name = gitware.gen_repo_name(self.user)
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
