from django.shortcuts import render_to_response as _render_to_response
from django.template.loader import render_to_string
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
from django.utils.http import http_date
from django.core.cache import cache
import django.views.static
import traceback, sys, os, re
import dir_index_tools as tools
import simplejson
import django.conf
import settings
from logger import log
import context, config
import mimetypes, os, random, posixpath, re, datetime
import stat
from email.Utils import parsedate_tz, mktime_tz
import contrib
import urllib, urllib2
import codecs, time
import os

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
			context	(optional)	- filter suites containing supplied context name
			json 	(optional)	- return result in JSON format
	"""
	from django.http import HttpResponse
	from context import get as context_get
	import contrib
	
	context = request.REQUEST.get('context', None)
	json = request.REQUEST.get('json', False)
	target = request.REQUEST.get('target', False)
	
	suites = []
	root = contrib.get_document_root(target)
	contextini = settings.TEST_CONTEXT_FILE_NAME

	for dirpath, dirnames, filenames in os.walk(root, followlinks=True):
		if not ( contextini in filenames ): continue
		if context:
			contextfile = os.path.join(dirpath, contextini)
			ctx = context_get(contextfile)
			ctx_sections = ctx.sections()
			if not context in ctx_sections: continue
		suites += [ dirpath.replace(root, '').replace('\\','/').lstrip('/') ]
	
	if json:
		import simplejson
		return HttpResponse(simplejson.dumps(suites))
	return HttpResponse(str(suites).replace('[','').replace(']','').rstrip(',').replace('\'',''))

def show_context(request, path):
	document_root = contrib.get_document_root(path)
	fullpath = contrib.get_full_path(document_root, path)
	log.debug('show context of %s (%s %s)' % (fullpath, document_root, path))
	
	result = ""

	sections = config.sections(context.get(fullpath).inifile)
	for section_name in sections:
		ctx = context.get(fullpath, section=section_name)
		context_ini = context.render_ini(ctx, section_name)
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

def get_file_content_to_edit(path, fullpath, is_stubbed):
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
		'is_stubbed': is_stubbed,
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
		for key in settings.VIRTUAL_PATHS:
			dir = get_descriptor(key)
			dirs.append(dir)
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
	result = tools.remove(fullpath)
	redirect = '/' + request.POST["url"].lstrip('/')
	return HttpResponseRedirect(redirect)

@add_fullpath
def createSuite(request, fullpath):
	result = {}
	result['success'], result['result'] = tools.mkcontext(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
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
	response.write(simplejson.dumps(result))
	
	return response
	
@add_fullpath
def saveTest(request, fullpath):
	url = request.POST["url"].lstrip('/')
	stub(url, request)
	result = tools.savetest(request.POST["content"], fullpath)
	return HttpResponseRedirect('/' + url + '?editor')

@add_fullpath	
def saveDraftTest(request, fullpath):
	saveTest(request)
	return HttpResponse()

def submitTest(request):
	testname = request.POST["path"]
	url = request.POST["url"]
	context = request.POST["context"]
	#TODO: for what gettest call
	#content = request.POST.get("content", tools.gettest(testname))
	content = request.POST.get("content", '')

	log.debug('submitTest POST')
	return _render_to_response( "runtest.html", locals() )

def submitSuite(request):
	suite = request.POST["path"]
	url = request.POST["url"]
	context = request.POST["context"]

	return _render_to_response( "runsuite.html", locals() )

def get_root():
	return '/testsrc/' + settings.PRODUCT_TEST_CASES_ROOT

@add_fullpath
@error_handler
def runSuite(request, fullpath):
	path = contrib.normpath(request.REQUEST["path"])
	context_name = request.REQUEST["context"]
	ctx = context.get(fullpath, section=context_name)
	
	log.info('run suite %s with context %s' % (path, context_name))

	contextjs = context.render(ctx)
	
	clean_path = contrib.get_relative_clean_path(path)
	target = contrib.get_target_host(ctx)
	log.info('target of suite %s is %s' % (clean_path, target))

	if target and request.get_host() != target:
		url = "http://%s/%s" % (target, settings.UPLOAD_TESTS_CMD)
		saveRemoteContext(clean_path, contextjs, url, ctx)
		saveSuiteAllTests(url, path, ctx)
		url = "http://%s/%s?suite=/%s" % ( target, settings.EXEC_TESTS_CMD, clean_path )
	else:
		saveLocalContext(fullpath, contextjs)
		url = "http://%s/%s?suite=/%s" % ( request.get_host(), settings.EXEC_TESTS_CMD, clean_path )

	log.info("redirect to run suite %s" % url)
	return HttpResponseRedirect( url )

@add_fullpath
@error_handler
def runTest(request, fullpath):
	path = contrib.normpath(request.REQUEST["path"])
	context_name = request.REQUEST.get("context", None)
	ctx = context.get(fullpath, section=context_name)
	
	log.info('run test %s with context %s' % (path, context_name))
	
	contextjs = context.render(ctx)
	log.debug('contextJS: '+ contextjs)

	clean_path = contrib.get_relative_clean_path(path)
	target = contrib.get_target_host(ctx)
	log.info('target of test %s is %s' % (clean_path, target))
	
	test_content = request.REQUEST.get('content', None)
	tools.savetest(test_content, fullpath)
	
	if contrib.target_is_remote( target, request.get_host()):
		log.debug('TARGET: %s, %s' % ( target, request.get_host() ))
		url = "http://%s/%s" % (target, settings.UPLOAD_TESTS_CMD)
		saveRemoteContext(os.path.dirname(clean_path), contextjs, url, ctx)
		saveTestSatelliteScripts(url, path, ctx)
		sendContentToRemote(clean_path, request.REQUEST["content"], url, ctx)
		url = "http://%s/%s?path=/%s" % (target, settings.EXEC_TESTS_CMD, clean_path)
	else:
		saveLocalContext(fullpath, contextjs)
		url = "http://%s/%s?path=/%s" % (request.get_host(), settings.EXEC_TESTS_CMD, clean_path)

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

def makeSaveContentPost(content, path):
	data = {
		'content': content,
		'path': path 
	}
	return contrib.convert_dict_values_strings_to_unicode(data)
	
def saveSuiteAllTests(url, path, ctx):
	document_root = contrib.get_document_root(path) 
	tests = contrib.enum_suite_tests( contrib.get_full_path(document_root, path) ) 
	log.info('save suite tests for: %s' % path)

	for test in tests:
		test_path = os.path.join(path, test)
		fullpath = contrib.get_full_path(document_root, test_path)
		clean_path = contrib.get_relative_clean_path(test_path)
		result = uploadContentToRemote(url, fullpath, clean_path, ctx)
		log.info("test %s is saved: %s" % (test_path, result))


def saveTestSatelliteScripts(url, path, ctx):
	"""	
	uploads scripts those the test depends on
	"""
	document_root = contrib.get_document_root(path) 
	virtual_root = contrib.get_virtual_root(path) 
	log.info('save satellite scripts for: %s' % path)

	for lib in contrib.get_libraries(ctx):
		lib_path = os.path.join(virtual_root, lib)
		fullpath = contrib.get_full_path(document_root, lib_path)
		result = uploadContentToRemote(url, fullpath, lib, ctx)
		log.info("library %s is saved: %s" % (lib, result))

def uploadContentToRemote(url, fullpath, path, ctx):
	log.debug('upload content %s', fullpath)
	content = tools.gettest(fullpath)
	return sendContentToRemote(path, content, url, ctx)

def saveRemoteContext(path, content, url, ctx):
	contextjs_path = os.path.join(path, settings.TEST_CONTEXT_JS_FILE_NAME)
	log.info('save %s context' % path)
	sendContentToRemote(contextjs_path, content, url, ctx)

def sendContentToRemote(path, content, url, ctx):
	data = makeSaveContentPost(content, path)
	auth(url, ctx)
	post = urllib.urlencode(data)
	req = urllib2.Request(url, post)
	try:
		return  urllib2.urlopen(req).read()
	except urllib2.URLError, e:
		if hasattr(e, 'reason'):
			raise urllib2.URLError('%s %s' % (e.reason, url))
		raise

def auth(url, ctx):
	login = ctx.get('login')
	password = ctx.get('password')
	empty_proxy_handler = urllib2.ProxyHandler({})
	if login and password:
		from ntlm import HTTPNtlmAuthHandler
	
		passman = urllib2.HTTPPasswordMgrWithDefaultRealm()
		passman.add_password(None, url, login, password)
		auth_NTLM = HTTPNtlmAuthHandler.HTTPNtlmAuthHandler(passman)
		opener = urllib2.build_opener(auth_NTLM, empty_proxy_handler)
	else:
		opener = urllib2.build_opener(empty_proxy_handler)
	
	urllib2.install_opener(opener)
	
def recvLogRecords(request):
	from logger import FILENAME, DJANGO_APP, timeFormat
	log_file = FILENAME
	if request.REQUEST.get('source', None):
		log.debug('recv logs for django app')
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
			result = getLastLogRecordTime(records, timeFormat);
			log.debug('find last log record time: %s' % result)
	else:
		log.debug('find all log records')
		result = records
	
	response = HttpResponse(mimetype='text/plain')
	response.write(result)

	return response

def getLastLogRecordTime(records, format):
	import re
	result = None
	lines = records.split('\n')
	regex = re.compile("\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d")
	for i in reversed(range(len(lines))):
		line = lines[i]
		m = regex.match(line)
		if m:
			result = time.mktime(time.strptime(m.group(), format))
			break
	return result

def getLogRecordsSinceGivenTime(records, format, sinse_time):
	import re
	result = []
	lines = records.split('\n')
	regex = re.compile("\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d")
	log.debug('since time %d' % sinse_time)
	for i in reversed(range(len(lines))):
		line = lines[i]
		log.debug(line)
		m = regex.match(line)
		if m:
			t = time.mktime(time.strptime(m.group(), format))
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
	print 'all session', request.session.items()
	for i,v in request.session.items():
		if i != 'stub_key' and str(v) == key:
			files += [ i ]
			try:
				del request.session[i]
			except:
				pass
	return files
