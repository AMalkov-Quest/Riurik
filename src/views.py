from django.shortcuts import render_to_response as _render_to_response
from django.template.loader import render_to_string
from django_websocket.decorators import require_websocket, accept_websocket
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
from django.utils.http import http_date
from django.core.cache import cache
import django.views.static
import protocol
import traceback, sys, os, re
import dir_index_tools as tools
import simplejson
import django.conf
import settings
from logger import log
import context
import mimetypes
import os
import posixpath
import re, datetime
import stat
import urllib
from email.Utils import parsedate_tz, mktime_tz
from contrib import *
import urllib, urllib2

__all__ = ('handler','serve',)
_isolate_imports = False
_executioncontext=protocol.ExecutionContext(isolate_imports=_isolate_imports)

@accept_websocket
def handler(request):
	if not request.is_websocket():
		log.debug('Not a webSocket connection')
		return HttpResponse('<html><body>WebSocket connection required</body></html>', status=403)
	for message in request.websocket:
			try:
				log.debug('Handling message: %s' % message)
				message = handle_message(message)
				log.debug('Handling responsing with message: %s' % message)
			except Exception, ex:
				exc_type, exc_value, exc_traceback = sys.exc_info()
				message = "%s\n%s" % ( ex, traceback.extract_tb(exc_traceback) )
				log.error(message)
			request.websocket.send(message)
	log.debug('WebSocket connection closed')
	_executioncontext=protocol.ExecutionContext(isolate_imports=_isolate_imports)
	log.debug('Recreating Waferslim ExecutionContext')
	return HttpResponse()


def instructions_for(datas):
	instructions = []
	for instruction in datas:
		instruction_id, instruction_params, instruction_instance = instruction[0], instruction[2:], instruction[1]
		instruction_instance = protocol._INSTRUCTION_TYPES[instruction_instance](instruction_id,instruction_params)
		instructions += [ instruction_instance ] 
	return instruction_instance

def handle_message(data, isolate_imports=False, executioncontext=_executioncontext, new_result=protocol.Results, instructions=instructions_for):
	result = new_result()
	execution_context = executioncontext#executioncontext(isolate_imports=isolate_imports)
	try:
		instruction_list = instructions(protocol.unpack(data))
		instruction_list.execute(execution_context, result)
	except protocol.UnpackingError, error:
		result.failed(error, error.description())

	results = result.collection()
	return protocol.pack(results)

CODEMIRROR_CALL_EDITOR_FOR = '^.*\.(?:js|ini)$'
if hasattr(django.conf, 'CODEMIRROR_CALL_EDITOR_FOR'):
	CODEMIRROR_CALL_EDITOR_FOR = getattr(django.conf, 'CODEMIRROR_CALL_EDITOR_FOR')
	
def setTestsRoot(document_root):
	settings.STATIC_TESTS_ROOT = document_root
	settings.STATIC_TESTS_URL = settings.STATIC_TESTS_URLs[document_root]
	log.debug('Set tests root: %s' % document_root)

def serve(request, path, document_root=None, show_indexes=False):
	print request.session.session_key
	print cache.get('asfasf')
	cache.add('asfasf', datetime.datetime.now())

	if 'nnn' in request.session:
		print 'IN SESSION OK'
	else:
		print 'NOT IN SESSION'
	request.session['nnn'] = 'awgawg'

	"""
	Serve static files below a given point in the directory structure.

	To use, put a URL pattern such as::

		(r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root' : '/path/to/my/files/'})

	in your URLconf. You must provide the ``document_root`` param. You may
	also set ``show_indexes`` to ``True`` if you'd like to serve a basic index
	of the directory.  This index view will use the template hardcoded below,
	but if you'd like to override it, you can create a template called
	``static/directory_index.html``.
	"""
	# Clean up given path to only allow serving files below document_root.
	log.debug((request.GET, path,document_root,show_indexes, path))
	path = posixpath.normpath(urllib.unquote(path))
	path = path.lstrip('/')
	newpath = ''
	for part in path.split('/'):
		if not part:
			# Strip empty path components.
			continue
		drive, part = os.path.splitdrive(part)
		head, part = os.path.split(part) 
		if part in (os.curdir, os.pardir):
			# Strip '.' and '..' in path.
			continue
		newpath = os.path.join(newpath, part)
	fullpath = os.path.abspath(os.path.join(document_root, newpath))#.replace('/', '\\')
	log.debug(('before patching fullpath',fullpath, newpath))
	fullpath = patch_fullpaths(fullpath, newpath)
	log.debug(('after patching fullpath',fullpath, newpath))
	log.debug(fullpath)
	log.debug(os.path.isdir(fullpath))
	if os.path.isdir(fullpath):
		if show_indexes:
			try:
				t = loader.select_template(['static/directory_index.html',
						'static/directory_index'])
			except TemplateDoesNotExist:
				t = Template(django.views.static.DEFAULT_DIRECTORY_INDEX_TEMPLATE, name='Default directory index template')
			files = []
			for f in os.listdir(fullpath):
				if not f.startswith('.'):
					if os.path.isdir(os.path.join(fullpath, f)):
						f += '/'
					files.append(f)
			if newpath == '/' or newpath == '': 
				for key in settings.VIRTUAL_URLS:
					files =  [ key + '/', ] + files
			c = Context({
				'directory' : newpath + '/',
				'file_list' : files,
			})
			return HttpResponse(t.render(c))
		raise Http404("Directory indexes are not allowed here.")
	if not os.path.exists(fullpath):
		raise Http404('"%s" does not exist' % fullpath)
	# Respect the If-Modified-Since header.
	statobj = os.stat(fullpath)
	mimetype, encoding = mimetypes.guess_type(fullpath)
	mimetype = mimetype or 'application/octet-stream'
	#if not django.views.static.was_modified_since(request.META.get('HTTP_IF_MODIFIED_SINCE'),
	#						  statobj[stat.ST_MTIME], statobj[stat.ST_SIZE]):
	#	return HttpResponseNotModified(mimetype=mimetype)
	contents = open(fullpath, 'rb').read()
	response = HttpResponse(contents, mimetype=mimetype)
	response["Last-Modified"] = http_date(statobj[stat.ST_MTIME])
	response["Content-Length"] = len(contents)
	if encoding:
		response["Content-Encoding"] = encoding
		
	try:
		content = contents
		if re.match(CODEMIRROR_CALL_EDITOR_FOR, path.lower()):
			try:
				contexts = context.get( fullpath ).sections()
			except Exception, e:
				log.error(e)
				contexts = []

			ret = _render_to_response(
				'static/types/javascript.html', 
				{ 
					'content': content,
					'contexts': contexts,
					'relative_file_path': path,
					'is_stubbed': is_stubbed(path, request),
	
				}, 
				context_instance=RequestContext(request)
			)
			stub(path, request)
			return ret
	except Exception, ex:
		print ex
		log.error(str(ex))
		
	return response

def get_path(request):
	if request.POST and 'path' in request.POST:
		return request.POST['path']
	elif request.GET and 'path' in request.GET:
		return request.GET['path']
	else:
		return None

def add_fullpath(fn):
	def patch(request):
		path = get_path(request)
		if path:
			log.debug('add_fullpath: func (%s) arguments patched. path: %s , fullpath: %s' % (fn, path, get_fullpath(path)))
			return fn(request, get_fullpath(path))
		return fn(request)
	return patch

@add_fullpath
def createFolder(request, fullpath):
	result = tools.mkdir(fullpath, request.POST["object-name"])
	
	response = HttpResponse(mimetype='text/plain')
	response.write(result)
	
	return response

@add_fullpath
def removeObject(request, fullpath):
	result = tools.remove(fullpath)
	return HttpResponseRedirect('/' + request.POST["url"].strip('/'))

@add_fullpath
def createSuite(request, fullpath):
	result = {}
	result['success'], result['result'] = tools.mksuite(fullpath, request.POST["object-name"])
	
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
	return response
	
def editSuite(request):
	return HttpResponseRedirect('/' + request.GET['path'] + '/' + settings.TEST_CONTEXT_FILE_NAME)
	
@add_fullpath
def createTest(request, fullpath):
	result = {}
	result['success'], result['result'] = tools.mktest(fullpath, request.POST["object-name"])
	
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
	return response
	
@add_fullpath
def saveTest(request, fullpath):
	result = tools.savetest(request.POST["content"], fullpath)
	return HttpResponseRedirect(request.POST["url"])

@add_fullpath	
def saveDraftTest(request, fullpath):
	result = tools.savetmptest(request.POST["content"], fullpath)
	if result:
		result = { 'success': result }
	else:
		result = { 'success': 'false' }
	return HttpResponse(simplejson.dumps(result))

def _patch_with_context(data, vars):
	t = Template("""
		var context = {
			{% for option in options %}
				{{ option.0 }}: '{{ option.1 }}'{% if not forloop.last %},{% endif %}
			{% endfor %}
		};
	""")
	c = Context();
	c['options'] = []
	for name, value in vars:
		c['options'] += [ (name, value,), ]
	return t.render(c) + data

def submitTest(request):
	testname = request.POST["path"]
	url = request.POST["url"]
	context = request.POST["context"]
	content = request.POST.get("content", tools.gettest(testname))
	
	return _render_to_response( "runtest.html", locals() )
	
@add_fullpath	
def runTest(request, fullpath):
	result = tools.savetest(request.POST["content"], fullpath)
	log.debug(request.POST)
	
	context_name = request.POST.get("context", None)
	
	ctx = context.get(fullpath, section=context_name)
	host = ctx.get( option='host' )
	#log.debug( locals() )
	if host == 'localhost':
		return runInnerTest(request.POST["path"], request.POST["url"])
	else:
		path = saveRemoteScripts(request.POST["path"], request.POST["content"], request.POST["url"], ctx, request)
		return runRemoteTest(path, ctx)

def runInnerTest(name, url):
	jsfile = '/' + name.replace(settings.INNER_TESTS_ROOT, settings.TESTS_URL)
	return _render_to_response('testLoader.html', locals())

def useLogin(url, login, password):
	from ntlm import HTTPNtlmAuthHandler
	
	passman = urllib2.HTTPPasswordMgrWithDefaultRealm()
	passman.add_password(None, url, login, password)
	auth_NTLM = HTTPNtlmAuthHandler.HTTPNtlmAuthHandler(passman)
	opener = urllib2.build_opener(auth_NTLM)
	urllib2.install_opener(opener)
	
def makeSaveContentPost(content, path):
	return {
		'content': content,
		'path': path,
		'tests_root': settings.PRODUCT_TEST_CASES_ROOT 
	}
	
def saveTestSatelliteScripts(url, test, request):
	'''
	saves all documents opened in the same browser(in other tabs)
	as a test that is about to run 
	'''
	scripts = getOpenedFiles(request)
	if scripts.count(test) > 0: scripts.remove(test)
	for path in scripts:
		fullpath = get_fullpath(path)
		content = tools.gettest(fullpath)
		data = makeSaveContentPost(content, path)
		post = urllib.urlencode(data)
		log.info("Save satellite script %s to %s" % (path, url))
		result = urllib2.urlopen(url, post).read()
		log.info("... done as %s" % result)

def saveRemoteScripts(path, content, testpath, ctx, request):
	patched = _patch_with_context(content, ctx.items())
	data = makeSaveContentPost(patched, path)
	post = urllib.urlencode(data)
	login = ctx.get('login')
	password = ctx.get('password')
	
	url = "%s/%s/" % (ctx.get('url'), settings.PRODUCT_TESTS_URL)
	url = url.replace(ctx.get('host'), context.host(ctx))
	
	useLogin(url, login, password)
	saveTestSatelliteScripts(url, path, request)
	log.info("Save test script %s to %s" % (path, url))
	return urllib2.urlopen(url, post).read()

def runRemoteTest(path, context):
	url = "%s/%s" % (context.get('url'), path)
	log.info("Run test %s" % url)
	return HttpResponseRedirect(url)

def recvLogRecords(request):
	log.warn('This is a warning')
	
	from logbook.queues import ZeroMQSubscriber
	subscriber = ZeroMQSubscriber('tcp://127.0.0.1:5000')
	records = subscriber.recv()
	
	response = HttpResponse(mimetype='text/plain')
	response.write(records)
	
	return response

def is_stubbed(path, request):
	session_key = request.session.get('stub_key') or None
	print 'IS_STUBBED:', path, session_key, cache.get(path)
	return cache.get(path) != None and cache.get(path) != session_key
	#return False
	

def stub(path, request):
	if 'stub_key' in request.session:
		session_key = request.session['stub_key']
	else:
		request.session['stub_key'] = session_key = datetime.datetime.now()

	print 'STUB:', path, session_key
	if cache.get(path) == session_key:
		request.session[path] = session_key
		cache.set(path, session_key, 60)
		return
	if cache.add(path, session_key, 60):
		request.session[path] = session_key
	return

def stubFile(request):
	stub(request.GET['path'], request)
	return HttpResponse('')

def getOpenedFiles(request):
	'''
	returns all scripts those are currently opened in a browser
	'''
	files = []
	if not 'stub_key' in request.session:
		return files
	key = str(request.session['stub_key'])
	print 'all session', request.session.items()
	for i,v in request.session.items():
		if i != 'stub_key' and str(v) == key:
			files += [ i ]
	return files


	
