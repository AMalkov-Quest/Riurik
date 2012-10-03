import os
from django.shortcuts import render_to_response as _render_to_response
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.utils.http import http_date
import django.views.static
import json, mimetypes, stat
import settings
from logger import log
import dir_index_tools as tools
import context, contrib, inuse, spec
from auth import gitware 

def oAuth(request):
	return request.session.get('token')

def factory(request):
	if oAuth(request):
		return GitHandler(request)
	else:
		return DefaultHandler(request)

def response(request, path):
	handler = factory(request)
	return handler.serve(request, path)

class BaseHandler:

	def serve(self, request, path):
		document_root = self.get_document_root(path)
		fullpath = self.get_full_path(path)

		if os.path.isdir(fullpath):
			if 'history' in request.REQUEST:
				return get_history(request, path)

			if request.path and request.path[-1:] != '/':
				return HttpResponseRedirect(request.path + '/')

			template = load_index_template()
			descriptor = self.get_dir_index(document_root, path, fullpath)
			return HttpResponse(template.render(descriptor))
	
		return serve_def(request, path, document_root, fullpath)

	def get_descriptor(self, title, path):
		fullpath = self.get_full_path( os.path.join(path, title) )
		return { 'title': title, 'type': tools.get_type(fullpath) }

	def get_dir_index(self, document_root, path, fullpath):
		files = []
		dirs = []

		def get_descriptor(title):
			fullpath = os.path.join(path, title)
			return { 'title': title, 'type': tools.get_type(contrib.get_full_path(document_root, fullpath)) }

		if not document_root:
			pagetype = 'front-page'
			for key in contrib.get_virtual_paths():
				dir_descriptor = get_descriptor(key)
				dirs.append(dir_descriptor)
		else:
			pagetype = tools.get_type(fullpath)
			for f in sorted(os.listdir(fullpath)):
				if not f.startswith('.'):
					descriptor = get_descriptor(f)
					if os.path.isfile(os.path.join(fullpath, f)):
						files.append(descriptor)
					else:
						f += '/'
						dirs.append(descriptor)

		try:
			if tools.get_type(fullpath) == 'virtual':
				contexts = context.global_settings(fullpath).sections()
			else:
				contexts = context.get(fullpath).sections()
			log.debug(contexts)
		except Exception, e:
			log.error(e)
			contexts = []

		favicon = 'dir-index-%s.gif' % tools.get_type(fullpath)

		return Context({
			'directory' : path + '/',
			'type'		: pagetype,
			'file_list' : files,
			'dir_list'  : dirs,
			'contexts'  : contexts,
			'favicon'   : favicon,
			'spec'	: get_spec(path, fullpath),
		})

class GitHandler(BaseHandler):

	def __init__(self, request):
		token = request.session.get('token')
		ghub = gitware.Github(token)
		self.user = ghub.get_user()
		self.repo = gitware.get_riurik_repo(self.user)

	def get_document_root(self, path):
		return gitware.get_document_root(self.user, self.repo)

	def get_full_path(self, path):
		return gitware.get_full_path(self.user, self.repo, path)

class DefaultHandler(BaseHandler):
	
	def __init__(self, request):
		pass

	def get_document_root(self, path):
		return contrib.get_document_root(path)

	def get_full_path(self, path):
		document_root = contrib.get_document_root(path)
		return contrib.get_full_path(document_root, path)

def serve_def(request, path, document_root, fullpath):
	
	log.debug('show index of %s(%s %s)' % (fullpath, document_root, path))
		
	if not os.path.exists(fullpath):
		if 'editor' in request.REQUEST:
			#open(fullpath, 'w').close() # creating file if not exists by editor opening it first time
			tools.make(fullpath)
		else:
			raise Http404('"%s" does not exist' % fullpath)

	if 'editor' in request.REQUEST:
		descriptor = get_file_content_to_edit(path, fullpath, inuse.is_stubbed(path, request))
		inuse.stub(path, request)
		return _render_to_response('editor.html', descriptor, context_instance=RequestContext(request))

	return get_file_content(fullpath)

def get_history(request, path):
	import reporting
	context = request.REQUEST.get('context')
	date = request.REQUEST.get('history', None)
	asxml = request.REQUEST.get('xml', None)
	asjson = request.REQUEST.get('json', None)
	if not date:
		results = reporting.getSuiteHistoryResults(path, context)
		return  _render_to_response('history_list.html', locals())

	if asxml:
		tests_list = reporting.getResultsAsXml(path, context, date, request)
		return HttpResponse(tests_list)

	tests_list = reporting.getResults(path, context, date)

	if asjson:
		url = reporting.getTestResultsUrl(path, context, date, request)
		result = { 'url': url, 'data': tests_list }
		return HttpResponse(json.dumps(result))

	return _render_to_response('history.html', locals())

def get_file_content_to_edit(path, fullpath, stubbed):
	try:
		contexts = context.get( fullpath ).sections()
	except Exception, e:
		log.exception(e)
		contexts = []

	content = open(fullpath, 'rb').read()

	return {
		'directory': path,
		'content': content,
		'contexts': contexts,
		'relative_file_path': path,
		'is_stubbed': stubbed,
		'favicon'   : 'dir-index-test.gif',
		'filetype':  tools.get_type(fullpath),
		'spec'		: get_spec(path, fullpath),
	}

def get_spec(target, path):
	spec_url = spec.get_url(path)
	log.info('spec url: %s' % spec_url)
	if spec_url:
		return spec_url
	else:
		return '%s?editor' % settings.SPEC_URL_FILE_NAME

def get_file_content(fullpath):
	log.debug('get content of %s' % fullpath)
	statobj = os.stat(fullpath)
	mimetype, encoding = mimetypes.guess_type(fullpath)
	mimetype = mimetype or 'application/octet-stream'
	content = open(fullpath, 'rb').read()
	response = HttpResponse(content, mimetype=mimetype)
	response["Last-Modified"] = http_date(statobj[stat.ST_MTIME])
	response["Content-Length"] = len(content)
	if encoding:
		response["Content-Encoding"] = encoding

	return response

def load_index_template():
	try:
		t = loader.select_template(['directory-index.html', 'directory-index'])
	except TemplateDoesNotExist:
		t = Template(
				django.views.static.DEFAULT_DIRECTORY_INDEX_TEMPLATE,
				name='Default directory index template')

	return t
