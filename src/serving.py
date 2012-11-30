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

def get_path(request):
	if request.POST and 'path' in request.POST:
		return request.POST['path']
	elif request.GET and 'path' in request.GET:
		return request.GET['path']
	elif request.GET and 'suite' in request.GET:
		return request.GET['suite']
	else:
		return None

def add_request_handler(fn):
	def patch(request):
		path = get_path(request)
		if path:
			RequestHandler = factory(request, path)
			full_path = RequestHandler.get_full_path()
			log.debug('added request handler for %s path: %s , fullpath: %s' % (fn, path, full_path))
			return fn(request, RequestHandler)
		return fn(request)
	return patch

def getGitHub(request, path, time):
	try:
		from plugins.github.views import plugin
		return plugin(request, path, time)
	except ImportError, e:
		log.exception(e)

def factory(request, path):
	log.debug('serving: select handler')

	start_time = request.REQUEST.get('time', None)

	gHandler = getGitHub(request, path, start_time)
	if gHandler:
		log.debug('github handler is selected')
		return gHandler
	else:
		log.debug('default handler is selected')
		return DefaultHandler(request, path, start_time)

def response(request, path):
	handler = factory(request, path)
	return handler.serve(request)

class BaseHandler(object):

	def __init__(self, request, path, time):
		self.path = path
		self.user = None
		self.time = time if time else contrib.getNowTime()

	def get_path(self):
		return self.path

	def get_context_path(self, path):
		fullpath = self.get_full_path(path)
		if os.path.isdir(fullpath):
			return os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME)
		else:
			dirname = os.path.dirname(fullpath)
			return os.path.join(dirname, settings.TEST_CONTEXT_FILE_NAME)

	def get_global_context_path(self):
		return os.path.join(
				self.get_document_root(),
				settings.GLOBAL_CONTEXT_FILE_NAME
				)		

	def serve(self, request):
		document_root = self.get_document_root()
		fullpath = self.get_full_path()
		log.debug('serve full path %s' % fullpath)
		if os.path.isdir(fullpath):
			if 'history' in request.REQUEST:
				return self.get_history(request)

			if request.path and request.path[-1:] != '/':
				return HttpResponseRedirect(request.path + '/')

			template = load_index_template()
			descriptor = self.get_dir_index(document_root, fullpath, request)
			return HttpResponse(template.render(descriptor))
	
		log.debug('show index of %s(%s %s)' % (fullpath, document_root, self.path))
		if not os.path.exists(fullpath):
			if 'editor' in request.REQUEST:
				tools.make(fullpath)
			else:
				raise Http404('"%s" does not exist' % fullpath)

		if 'editor' in request.REQUEST:
			descriptor = self.get_file_content_to_edit(fullpath, inuse.is_stubbed(self.path, request))
			inuse.stub(self.path, request)
			return _render_to_response('editor.html', descriptor, context_instance=RequestContext(request))

		return get_file_content(fullpath)

	def get_file_content_to_edit(self, fullpath, stubbed):
		try:
			contexts = context.get( self ).sections()
		except Exception, e:
			log.exception(e)
			contexts = []

		content = open(fullpath, 'rb').read()

		return {
			'directory': self.path,
			'content': content,
			'contexts': contexts,
			'relative_file_path': self.path,
			'is_stubbed': stubbed,
			'favicon'   : 'dir-index-test.gif',
			'filetype':  self.get_type(fullpath),
			'spec'		: get_spec(self.path, fullpath),
			'login'     : self.user
		}

	def is_document_root(self, fullpath):
		document_root = self.get_document_root()
		if document_root:
			#return os.path.samefile(fullpath, document_root)
			return os.path.normpath(fullpath) == os.path.normpath(document_root)
		else:
			return False

	def get_type(self, fullpath):
		result = tools.get_type(fullpath)
		if result == 'folder' and self.is_document_root( fullpath.rstrip('/').rstrip('\\') ):
			return 'root'

		return result

	def get_dir_index(self, document_root, fullpath, request):
		files = []
		dirs = []

		def get_descriptor(title):
			abspath = os.path.join(self.path, title)
			fullpath = self.get_full_path(abspath)
			return { 'title': title, 'type': self.get_type(fullpath) }

		if not document_root:
			pagetype = 'front-page'
			for key in contrib.get_virtual_paths():
				dir_descriptor = get_descriptor(key)
				dirs.append(dir_descriptor)
		else:
			pagetype = self.get_type(fullpath)
			for f in sorted(os.listdir(fullpath)):
				if not f.startswith('.'):
					if os.path.isfile(os.path.join(fullpath, f)):
						descriptor = get_descriptor(f)
						files.append(descriptor)
					else:
						descriptor = get_descriptor(f + '/')
						dirs.append(descriptor)

		try:
			if self.get_type(fullpath) == 'virtual':
				contexts = context.global_settings(self).sections()
			else:
				contexts = context.get(self).sections()
			log.debug(contexts)
		except Exception, e:
			log.error(e)
			contexts = []

		favicon = 'dir-index-%s.gif' % self.get_type(fullpath)

		return Context({
			'directory' : self.path + '/',
			'type'		: pagetype,
			'file_list' : files,
			'dir_list'  : dirs,
			'contexts'  : contexts,
			'favicon'   : favicon,
			'spec'      : get_spec(self.path, fullpath),
			'login'     : self.user
		})

	def get_history(self, request):
		import reporting
		context = request.REQUEST.get('context')
		date = request.REQUEST.get('history', None)
		asxml = request.REQUEST.get('xml', None)
		asjson = request.REQUEST.get('json', None)
		if not date:
			results = reporting.getSuiteHistoryResults(self.path, context)
			pathtype = self.get_type(self.get_full_path())
			return  _render_to_response('history_list.html', locals())

		if asxml:
			tests_list = reporting.getResultsAsXml(self.path, context, date, request)
			return HttpResponse(tests_list)

		tests_list = reporting.getResults(self.path, context, date)

		if asjson:
			url = reporting.getTestResultsUrl(self.path, context, date, request)
			result = { 'url': url, 'data': tests_list }
			return HttpResponse(json.dumps(result))

		return _render_to_response('history_qunit.html', locals())

class DefaultHandler(BaseHandler):
	
	def get_document_root(self):
		return contrib.get_document_root(self.path)

	def get_full_path(self, path=None):
		document_root = contrib.get_document_root(self.path)
		path = self.path if not path else path
		return contrib.get_full_path(document_root, path)

	def get_virtual_root(self):
		return contrib.get_virtual_root(self.path)

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
