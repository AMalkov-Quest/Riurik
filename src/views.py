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
import context
import mimetypes, os, random, posixpath, re, datetime
import stat
from email.Utils import parsedate_tz, mktime_tz
import contrib
import urllib, urllib2
import codecs, time

__all__ = ('handler','serve',)
_isolate_imports = False

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
	log.debug('Serve static files. Path %s, document_root %s' % (path, document_root))
	path = posixpath.normpath(urllib.unquote(path))
	path = path.lstrip('/')
	newpath = ''
	for part in path.split('/'):
		if not part:
			#Strip empty path components.
			continue
		drive, part = os.path.splitdrive(part)
		head, part = os.path.split(part) 
		if part in (os.curdir, os.pardir):
			# Strip '.' and '..' in path.
			continue
		newpath = os.path.join(newpath, part)
	fullpath = os.path.abspath(os.path.join(document_root, newpath))
	fullpath = contrib.patch_fullpaths(fullpath, newpath)
	if os.path.isdir(fullpath):
		if request.path and request.path[-1:] != '/':
			return HttpResponseRedirect(request.path + '/')
		if show_indexes:
			try:
				t = loader.select_template(['directory-index.html', 'directory-index'])
			except TemplateDoesNotExist:
				t = Template(django.views.static.DEFAULT_DIRECTORY_INDEX_TEMPLATE, name='Default directory index template')
			files = []
			dirs = []
			for f in os.listdir(fullpath):
				if not f.startswith('.'):
					if os.path.isfile(os.path.join(fullpath, f)):
						files.append(f)
					else:
						f += '/'
						dirs.append(f)
			if newpath == '/' or newpath == '': 
				for key in settings.VIRTUAL_URLS:
					files =  [ key + '/', ] + files
			try:
				contexts = context.get(fullpath).sections()
			except Exception, e:
				log.error(e)
				contexts = []
				
			favicon = 'dir-index-%s.gif' % tools.get_type(fullpath)

			c = Context({
				'directory' : newpath + '/',
				'file_list' : files,
				'dir_list'  : dirs,
				'contexts'  : contexts,
				'favicon'   : favicon,
			})
			return HttpResponse(t.render(c))
		raise Http404("Directory indexes are not allowed here.")
	if not os.path.exists(fullpath):
		raise Http404('"%s" does not exist' % fullpath)
	statobj = os.stat(fullpath)
	mimetype, encoding = mimetypes.guess_type(fullpath)
	mimetype = mimetype or 'application/octet-stream'
	contents = open(fullpath, 'rb').read()
	response = HttpResponse(contents, mimetype=mimetype)
	response["Last-Modified"] = http_date(statobj[stat.ST_MTIME])
	response["Content-Length"] = len(contents)
	if encoding:
		response["Content-Encoding"] = encoding
		
	try:
		content = contents
		if 'editor' in request.REQUEST:
			try:
				contexts = context.get( fullpath ).sections()
			except Exception, e:
				log.exception(e)
				contexts = []

			ret = _render_to_response(
				'editor.html', 
				{ 
					'directory': path,
					'content': content,
					'contexts': contexts,
					'relative_file_path': path,
					'is_stubbed': is_stubbed(path, request),
					'favicon'   : 'dir-index-test.gif',
				}, 
				context_instance=RequestContext(request)
			)
			stub(path, request)
			return ret
	except Exception, e:
		log.exception(e)
		
	return response

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
			log.debug('add_fullpath: func (%s) arguments patched. path: %s , fullpath: %s' % (fn, path, contrib.get_fullpath(path)))
			return fn(request, contrib.get_fullpath(path))
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
		tools.mktest(fullpath, settings.TEST_CONTEXT_FILE_NAME)
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
	result = tools.savetmptest(request.POST["content"], fullpath)
	if result:
		result = { 'success': result }
	else:
		result = { 'success': 'false' }
	return HttpResponse(simplejson.dumps(result))

def submitTest(request):
	testname = request.POST["path"]
	url = request.POST["url"]
	context = request.POST["context"]
	content = request.POST.get("content", tools.gettest(testname))
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
def runSuite(request, fullpath):
	path = contrib.normpath(request.REQUEST["path"])
	context_name = request.REQUEST["context"]

	ctx = context.get(fullpath, section=context_name)
	host = ctx.get('host' )
	run = ctx.get('run' )
	
	contextjs = context.render(ctx)
	
	path = removeVirtualFolderFromPath(path)
	if contrib.localhost(host) and not run == 'remote':
		saveLocalContext(fullpath, contextjs)
	else:
		url = "%s/%s" % (context.get_URL(ctx, False), settings.PRODUCT_TESTS_URL)
		contextjs_path = os.path.join(path, settings.TEST_CONTEXT_JS_FILE_NAME)
		sendContentToRemote(contextjs_path, contextjs, url, ctx)
	
	url = "%s/%s?suite=/%s&root=%s" % ( context.get_URL(ctx), settings.PRODUCT_TESTS_URL, path, get_root()  )
	url = contrib.normpath(urllib.unquote(url))
	log.info("Run suite %s" % path)
	return HttpResponseRedirect( url )

@add_fullpath
def runTest(request, fullpath):
	path = contrib.normpath(request.REQUEST["path"])
	context_name = request.REQUEST.get("context", None)
	ctx = context.get(fullpath, section=context_name)
	
	log.debug('run test %s' % path)
	log.debug('Fullpath %s' % fullpath)
	log.debug('Context name %s' % str(context_name))
	log.debug('Context items: '+ str(ctx.items()))
	
	host = ctx.get('host')
	run = ctx.get('run')
	contextjs = context.render(ctx)
	log.debug('contextJS: '+ contextjs)
	
	path = removeVirtualFolderFromPath(path)
	root = get_root()
	if (contrib.localhost(host) and not run == 'remote') or run == 'local':
		saveLocalContext(fullpath, contextjs)
		if run == 'local':
			root = ''
	else:
		url = "%s/%s" % (context.get_URL(ctx, True), settings.PRODUCT_TESTS_URL)
		contextjs_path = os.path.join(os.path.dirname(path), settings.TEST_CONTEXT_JS_FILE_NAME)
		sendContentToRemote(contextjs_path, contextjs, url, ctx)
		saveRemoteScripts(path, url, request.REQUEST["content"], ctx, request)
		
	url = "%s/%s?path=/%s&root=%s" % (context.get_URL(ctx), settings.PRODUCT_TESTS_URL, path, root)
		
	log.info("Run test %s" % path)
	return HttpResponseRedirect(url)

def removeVirtualFolderFromPath(path):
	'''virtual folder is a folder that contains inner riurik tests'''
	path = path.lstrip('/')
	index = path.find(settings.INNER_TESTS_ROOT + '/')
	if index == 0:
		log.debug('remove virtual folder %s from path %s' % (settings.INNER_TESTS_ROOT, path))
		return path.replace(settings.INNER_TESTS_ROOT + '/', '', 1)
	return path

def saveLocalContext(fullpath, contextjs):
	if os.path.isdir(fullpath):
		contextjs_path = os.path.join(fullpath, settings.TEST_CONTEXT_JS_FILE_NAME)
	else:
		contextjs_path = os.path.join(os.path.dirname(fullpath), settings.TEST_CONTEXT_JS_FILE_NAME)
	f = open(contextjs_path, 'wt')
	f.write(contextjs)
	f.close()

def makeSaveContentPost(content, path):
	return {
		'content': content,
		'path': path,
		'tests_root': settings.PRODUCT_TEST_CASES_ROOT 
	}
	
def saveTestSatelliteScripts(url, test, request, libs):
	'''
	saves all documents opened in the same browser(in other tabs)
	as a test that is about to run 
	'''
	scripts = getOpenedFiles(request, clean=True)
	log.debug('save satellite scripts for: %s' % test)
	log.debug('libraries: %s' % str(libs))
	log.debug('opened scripts: %s' % str(scripts))
	if scripts.count(test) > 0: scripts.remove(test)
	for path in scripts:
		if path in libs:
			fullpath = contrib.get_fullpath(path)
			content = tools.gettest(fullpath)
			path = removeVirtualFolderFromPath(path)
			data = makeSaveContentPost(content, path)
			post = urllib.urlencode(data)
			result = urllib2.urlopen(url, post).read()
			log.info("Save satellite script %s is done: %s" % (path, result))

def saveRemoteScripts(path, url, content, ctx, request):
	libs = ctx.get('libraries', [])
	saveTestSatelliteScripts(url, path, request, libs)
	return sendContentToRemote(path, content, url, ctx)

def auth(url, ctx):
	login = ctx.get('login')
	password = ctx.get('password')
	if login and password:
		from ntlm import HTTPNtlmAuthHandler
	
		passman = urllib2.HTTPPasswordMgrWithDefaultRealm()
		passman.add_password(None, url, login, password)
		auth_NTLM = HTTPNtlmAuthHandler.HTTPNtlmAuthHandler(passman)
		opener = urllib2.build_opener(auth_NTLM)
	else:
		opener = urllib2.build_opener()
	
	urllib2.install_opener(opener)
	
def sendContentToRemote(path, content, url, ctx):
	data = makeSaveContentPost(content, path)
	def _patch_strings(obj):
		for key, val in obj.iteritems():
			if val.__class__.__name__ == 'unicode':
				obj[key] = val.encode('utf-8')
		return obj
	auth(url, ctx)
	post = urllib.urlencode(_patch_strings(data))
	result = urllib2.urlopen(url, post).read()
	log.info("remote script %s saving result: %s" % (path, result))
	return result

def recvLogRecords(request):
	from logger import FILENAME, timeFormat
	f = codecs.open(FILENAME, 'r', 'utf-8')
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


	
