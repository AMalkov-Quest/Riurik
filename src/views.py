from django.shortcuts import render_to_response as _render_to_response
from django.template.loader import render_to_string
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpRequest
from django.utils.http import http_date
from django.core.cache import cache
import django.views.static
import os, re
import dir_index_tools as tools
import json
import django.conf
import settings
from logger import log
import context, config, contrib
import mimetypes, datetime
import stat
import urllib, urllib2
import codecs, time
import virtual_paths
import distributor

def error_handler(fn):
	def _f(*args, **kwargs):
		try:
			response = fn(*args, **kwargs)
		except urllib2.HTTPError, ex:
			response = HttpResponse(ex.read(), status=500)
		except urllib2.URLError, ex:
			response = HttpResponse(status=500)
			response.write(render_to_string('error.html', {
				'type': ex.__class__.__name__,
				'msg': ex,
				'stacktrace': '',
				'issue':  ex.issue if hasattr(ex, 'issue') else '',
				'request': args[0].REQUEST
			}))

		return response
	return _f

def enumerate_suites(request):
	"""
	Return a list of suite names.
	Arguments:
		ctx	(optional)	- filter suites containing supplied ctx name
		json 	(optional)	- return result in JSON format
	"""
	ctx_name = request.REQUEST.get('context', None)
	as_json = request.REQUEST.get('json', False)
	target = request.REQUEST.get('target', False)

	suites = []
	root = contrib.get_document_root(target)
	contextini = settings.TEST_CONTEXT_FILE_NAME

	for dirpath, dirnames, filenames in os.walk(root, followlinks=True):
		if not ( contextini in filenames ):
			continue
		if ctx_name:
			contextfile = os.path.join(dirpath, contextini)
			ctx = context.get(contextfile)
			ctx_sections = ctx.sections()
			if not ctx_name in ctx_sections:
				continue

			suites += [ dirpath.replace(root, '').replace('\\','/').lstrip('/') ]

	if as_json:
		return HttpResponse(json.dumps(suites))
	return HttpResponse(str(suites).replace('[','').replace(']','').rstrip(',').replace('\'',''))

def show_context(request, path):
	document_root = contrib.get_document_root(path)
	fullpath = contrib.get_full_path(document_root, path)
	log.debug('show context of %s (%s %s)' % (fullpath, document_root, path))

	result = ""

	sections = config.sections(context.get(fullpath).inifile)
	for section_name in sections:
		ctx = context.get(fullpath, section=section_name)
		context_ini = context.render_ini(path, ctx, request.get_host(), section_name)
		result += context_ini

	return HttpResponse(result)


def serve(request, path, show_indexes=False):
	document_root = contrib.get_document_root(path)
	fullpath = contrib.get_full_path(document_root, path)
	log.debug('show index of %s(%s %s)' % (fullpath, document_root, path))
	if os.path.isdir(fullpath):
		if request.path and request.path[-1:] != '/':
			return HttpResponseRedirect(request.path + '/')
		if show_indexes:
			template = load_index_template()
			descriptor = get_dir_index(document_root, path, fullpath)
			return HttpResponse(template.render(descriptor))

	if not os.path.exists(fullpath):
		if 'editor' in request.REQUEST:
			open(fullpath, 'w').close() # creating file if not exists by editor opening it first time
		else:
			raise Http404('"%s" does not exist' % fullpath)

	if 'editor' in request.REQUEST:
		descriptor = get_file_content_to_edit(path, fullpath, is_stubbed(path, request))
		stub(path, request)
		return _render_to_response('editor.html', descriptor, context_instance=RequestContext(request))

	return get_file_content(fullpath)

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
	}

def get_file_content(fullpath):
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
		t = Template(django.views.static.DEFAULT_DIRECTORY_INDEX_TEMPLATE, name='Default directory index template')

	return t

def get_dir_index(document_root, path, fullpath):
	files = []
	dirs = []

	def get_descriptor(title):
		fullpath = os.path.join(path, title)
		return { 'title': title, 'type': tools.get_type(contrib.get_full_path(document_root, fullpath)) }

	if not document_root:
		pagetype = 'front-page'
		reload(virtual_paths)
		for key in virtual_paths.VIRTUAL_PATHS:
			dir_descriptor = get_descriptor(key)
			dirs.append(dir_descriptor)
	else:
		pagetype = tools.get_type(fullpath)
		for f in sorted(os.listdir(fullpath)):
			if not f.startswith('.'):
				if os.path.isfile(os.path.join(fullpath, f)):
					files.append(get_descriptor(f))
				else:
					f += '/'
					dirs.append(get_descriptor(f))

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
	})

def get_path(request):
	if request.POST and 'path' in request.POST:
		return request.POST['path']
	elif request.GET and 'path' in request.GET:
		return request.GET['path']
	elif request.GET and 'suite' in request.GET:
		return request.GET['suite']
	else:
		return None

def add_fullpath(fn):
	def patch(request):
		path = get_path(request)
		if path:
			document_root = contrib.get_document_root(path)
			full_path = contrib.get_full_path(document_root, path)
			log.debug('add full path for %s path: %s , fullpath: %s' % (fn, path, full_path))
			return fn(request, contrib.get_full_path(document_root, path))
		return fn(request)
	return patch

def log_errors(fn):
	""" Catch errors and write it into logs then raise it up.
		Normal result returned if no errors.

		>>> def testF(k):
		...	 	return k
		>>> def testExc(k):
		...	 	raise Exception(k)
		>>> f = log_errors(testF)
		>>> f(10)
		10

		>>> f = log_errors(testExc)
		>>> f(10)
		Traceback (most recent call last):
			...
		Exception: 10

	"""
	def log_it(*args, **kwargs):
		try:
			result = fn(*args, **kwargs)
		except Exception, ex:
			log.error("%s", ex)
			raise
		return result
	return log_it

@add_fullpath
def createFolder(request, fullpath):
	result = tools.mkdir(fullpath, request.POST["object-name"])

	response = HttpResponse(mimetype='text/plain')
	response.write(result)

	return response

@add_fullpath
def removeObject(request, fullpath):
	log.debug('removeObject: ' + fullpath)
	tools.remove(fullpath)
	redirect = '/' + request.POST["url"].lstrip('/')
	return HttpResponseRedirect(redirect)

@add_fullpath
def createSuite(request, fullpath):
	result = {}
	result['success'], result['result'] = tools.mkcontext(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	response = HttpResponse(mimetype='text/json')
	response.write(json.dumps(result))

	return response

@add_fullpath
def editSuite(request, fullpath):
	log.debug('edit context %s' % fullpath)
	if not os.path.exists(os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME)):
		tools.mkcontext(fullpath, settings.TEST_CONTEXT_FILE_NAME)
	redirect = '/' + request.GET['path'] + '/' + settings.TEST_CONTEXT_FILE_NAME + '?editor'
	return HttpResponseRedirect(redirect)

@add_fullpath
def createTest(request, fullpath):
	log.debug('createTest: '+ request.POST["object-name"])
	result = {}
	result['success'], result['result'] = tools.mktest(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	log.debug('createTest results: %s' % result)
	response = HttpResponse(mimetype='text/json')
	response.write(json.dumps(result))

	return response

@add_fullpath
def saveTest(request, fullpath):
	if fullpath == 'settings':
		fullpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'virtual_paths.py')
	url = request.POST["url"].lstrip('/')
	stub(url, request)
	tools.savetest(request.POST["content"], fullpath)
	return HttpResponseRedirect('/' + url + '?editor')

def submitTest(request):
	return _render_to_response( "runtest.html", request.POST )

def submitSuite(request):
	return _render_to_response( "runsuite.html", request.POST )

@add_fullpath
@error_handler
def runSuite(request, fullpath):
	path = contrib.normpath(request.REQUEST["path"])
	context_name = request.REQUEST["context"]
	ctx = context.get(fullpath, section=context_name)

	log.info('run suite %s with context %s' % (path, context_name))
	server = request.get_host();
	contextjs = context.render(path, ctx, server)

	clean_path = contrib.get_relative_clean_path(path)
	target = contrib.get_runner_url(ctx, server)
	log.info('target of suite %s is %s' % (clean_path, target))

	#if contrib.target_is_remote( target, server):
	#	url = "http://%s/%s" % (target, settings.UPLOAD_TESTS_CMD)
	#	saveRemoteContext(clean_path, contextjs, url, ctx)
	#	distributor.saveSuiteAllTests(url, path, ctx)
	#	distributor.saveTestSatelliteScripts(url, path, ctx)
	#	url = "http://%s/%s?suite=/%s" % ( target, settings.EXEC_TESTS_CMD, clean_path )
	#else:
	#	saveLocalContext(fullpath, contextjs)
	#	url = "http://%s/%s?suite=/%s" % ( target, settings.EXEC_TESTS_CMD, clean_path )
	saveLocalContext(fullpath, contextjs)
	url = "http://%s/%s?server=%s&path=/%s" % ( target, settings.EXEC_TESTS_CMD, server, path )
	log.info("redirect to run suite %s" % url)
	return HttpResponseRedirect( url )

@add_fullpath
@error_handler
def runTest(request, fullpath):
	path = contrib.normpath(request.REQUEST["path"])
	context_name = request.REQUEST.get("context", None)
	ctx = context.get(fullpath, section=context_name)

	log.info('run test %s with context %s' % (path, context_name))
	server = request.get_host()
	contextjs = context.render(path, ctx, server)
	log.debug('contextJS: '+ contextjs)

	clean_path = contrib.get_relative_clean_path(path)
	target = contrib.get_runner_url(ctx, server)
	log.info('target of test %s is %s' % (clean_path, target))

	tools.savetest(request.REQUEST.get('content', None), fullpath)
	test_content = request.REQUEST.get("content", open(fullpath, 'r').read())

	#if contrib.target_is_remote( target, server):
	#	log.debug('TARGET: %s, %s' % ( target, server ))
	#	url = "http://%s/%s" % (target, settings.UPLOAD_TESTS_CMD)
	#	saveRemoteContext(os.path.dirname(clean_path), contextjs, url, ctx)
	#	distributor.saveTestSatelliteScripts(url, path, ctx)
	#	distributor.sendContentToRemote(clean_path, test_content, url, ctx)
	#	url = "http://%s/%s?path=/%s" % (target, settings.EXEC_TESTS_CMD, clean_path)
	#else:
	#	saveLocalContext(fullpath, contextjs)
	#	url = "http://%s/%s?path=/%s" % (target, settings.EXEC_TESTS_CMD, clean_path)
	saveLocalContext(fullpath, contextjs)
	url = "http://%s/%s?server=%s&path=/%s" % (target, settings.EXEC_TESTS_CMD, server, path)
	log.info("redirect to run test %s" % url)
	return HttpResponseRedirect(url)

def saveLocalContext(fullpath, contextjs):
	if os.path.isdir(fullpath):
		contextjs_path = os.path.join(fullpath, settings.TEST_CONTEXT_JS_FILE_NAME)
	else:
		contextjs_path = os.path.join(os.path.dirname(fullpath), settings.TEST_CONTEXT_JS_FILE_NAME)
	f = open(contextjs_path, 'wt')
	f.write(contextjs)
	f.close()

def saveRemoteContext(path, content, url, ctx):
	contextjs_path = os.path.join(path, settings.TEST_CONTEXT_JS_FILE_NAME)
	log.info('save %s context' % path)
	distributor.sendContentToRemote(contextjs_path, content, url, ctx)

def recvLogRecords(request):
	from logger import FILENAME, DJANGO_APP, timeFormat
	log_file = FILENAME
	if request.REQUEST.get('source', None):
		log_file = DJANGO_APP
	f = codecs.open(log_file, 'r', 'utf-8')
	records = f.read()
	f.close()

	result = []
	start = request.REQUEST.get('start', '')
	if start != 'undefined':
		if start != 'last':
			epoch_sec = float(start)
			since_time = time.strftime(timeFormat, time.localtime(epoch_sec))
			log.debug('find log records those were made after %s' % since_time)
			result = getLogRecordsSinceGivenTime(records, timeFormat, epoch_sec)
		else:
			result = getLastLogRecordTime(records, timeFormat)
			log.debug('find last log record time: %s' % result)
	else:
		log.debug('find last 100 log records')
		result = records.split('\n')[-100:]

	response = HttpResponse(mimetype='text/plain')
	response.write(result)

	return response

def getLastLogRecordTime(records, format_):
	result = None
	lines = records.split('\n')
	regex = re.compile("\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d")
	for i in reversed(range(len(lines))):
		line = lines[i]
		m = regex.match(line)
		if m:
			result = time.mktime(time.strptime(m.group(), format_))
			break
	return result

def getLogRecordsSinceGivenTime(records, format_, sinse_time):
	result = []
	lines = records.split('\n')
	regex = re.compile("\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d")
	log.debug('since time %d' % sinse_time)
	for i in reversed(range(len(lines))):
		line = lines[i]
		log.debug(line)
		m = regex.match(line)
		if m:
			t = time.mktime(time.strptime(m.group(), format_))
			if float( t ) < sinse_time:
				break
			result.append(line)

	return result

def is_stubbed(path, request):
	session_key = request.session.get('stub_key') or None
	cache_value = cache.get(path)
	if cache_value:
		try:
			cache_session_key = cache_value[0]
			cache_request_control = cache_value[1]
		except:
			cache_session_key = None
			cache_request_control = False

		return cache_session_key != session_key
	return False

def stub(path, request):
	if 'stub_key' in request.session:
		session_key = request.session['stub_key']
	else:
		request.session['stub_key'] = session_key = datetime.datetime.now()

	cache_value = cache.get(path)
	try:
		cache_session_key = cache_value[0]
		cache_request_control = cache_value[1]
	except:
		cache_session_key = None
		cache_request_control = False

	if cache_session_key == session_key:
		request.session[path] = session_key
		cache.set(path, (session_key, cache_request_control) , 60)
		return cache_request_control
	if cache.add(path, (session_key, cache_request_control), 60):
		request.session[path] = session_key
	return cache_request_control

def stubFile(request):
	request_control = stub(request.GET['path'], request)
	return HttpResponse(str(request_control))

def getControl(request):
	path = request.GET['path']
	cache_value = cache.get(path)
	session_key = request.session.get('stub_key') or None
	if cache_value:
		try:
			cache_session_key = cache_value[0]
			cache_request_control = cache_value[1]
		except:
			cache_session_key = None
			cache_request_control = False
		if cache_session_key != session_key:
			cache.set(path, (cache_session_key, True), 30)
		if 'cancel' in request.GET:
			cache.set(path, (cache_session_key, False), 60)
	return HttpResponse('')

def getOpenedFiles(request, clean=False):
	'''
	returns all scripts those are currently opened in a browser
	'''
	files = []
	if not 'stub_key' in request.session:
		return files
	key = str(request.session['stub_key'])
	for i, v in request.session.items():
		if i != 'stub_key' and str(v) == key:
			files += [ i ]
			try:
				del request.session[i]
			except:
				pass
	return files

def live_settings_view(request):
	return _render_to_response('configure.html', live_settings_json(request), context_instance=RequestContext(request))

def live_settings_json(request, content=None):
	settings_fullpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'virtual_paths.py')
	if not content:
		content = open(settings_fullpath, 'r').read()
	descriptor = {
		'directory': '/settings',
		'content': content,
		'contexts': [],
		'relative_file_path': 'settings',
		'is_stubbed': False,
		'favicon'   : 'dir-index-test.gif',
		'filetype':  tools.get_type(settings_fullpath),
	}
	return descriptor

def live_settings_save(request):
	fullpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'virtual_paths.py')
	url = request.POST["url"].lstrip('/')
	stub(url, request)

	content = request.POST["content"]

	def saveTemp(content):
		import tempfile
		handle, path = tempfile.mkstemp(suffix='.py', text=True)
		f = open(path, 'w')
		f.write(content)
		f.close()
		return path

	def clean(path):
		try:
			if os.path.exists(path): os.remove(path)
		except Exception, e:
			log.debug(e)

	def checkSyntax(content):
		import py_compile
		path = saveTemp(content)
		try:
			py_compile.compile(path, path+'c', path+'d', True)
			return True
		except:
			return False
		finally:
			clean(path)
			clean(path+'c')
			clean(path+'d')

	if not checkSyntax( content ):
		descriptor = live_settings_json(request, content)
		descriptor.update({ 'error': 'File got a syntax error' })
		return _render_to_response('configure.html', descriptor, context_instance=RequestContext(request))

	tools.savetest(request.POST["content"], fullpath)
	return HttpResponseRedirect('/settings')









