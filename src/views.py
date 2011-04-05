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
import mimetypes, os, random, posixpath, re, datetime
import stat
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
				t = loader.select_template(['directory_index.html',
						'directory_index'])
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

			c = Context({
				'directory' : newpath + '/',
				'file_list' : files,
				'dir_list'  : dirs,
				'contexts'  : contexts,
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
				log.error(e)
				contexts = []

			ret = _render_to_response(
				'editor.html', 
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
	elif request.GET and 'suite' in request.GET:
		return request.GET['suite']
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
	result = tools.remove(fullpath)
	return HttpResponseRedirect('/' + request.POST["url"])

@add_fullpath
def createSuite(request, fullpath):
	result = {}
	result['success'], result['result'] = tools.mksuite(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
	return response
	
def editSuite(request):
	return HttpResponseRedirect('/' + request.GET['path'] + '/' + settings.TEST_CONTEXT_FILE_NAME+'?editor')
	
@add_fullpath
def createTest(request, fullpath):
	result = {}
	result['success'], result['result'] = tools.mktest(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
	return response
	
@add_fullpath
def saveTest(request, fullpath):
	stub(request.POST["url"].lstrip('/'), request)
	result = tools.savetest(request.POST["content"], fullpath)
	return HttpResponseRedirect(request.POST["url"]+'?editor')

@add_fullpath	
def saveDraftTest(request, fullpath):
	result = tools.savetmptest(request.POST["content"], fullpath)
	if result:
		result = { 'success': result }
	else:
		result = { 'success': 'false' }
	return HttpResponse(simplejson.dumps(result))

def _patch_context_adv(ctx):
	vars = ctx.items()
	hasInclude = False
	for i,v in vars:
		if i == 'include':
			hasInclude = True
			break
	if not hasInclude:
		include = []
		for root, dirs, files in os.walk(ctx.get_folder()):
			for file in files:
				if re.match('^.*\.js$', file):
					if file in ['setup.js','library.js']:
						continue
					file_abspath = os.path.abspath(os.path.join(root, file))
					file_relpath = file_abspath.replace(os.path.abspath(ctx.get_folder()), '').lstrip('/').lstrip('\\')
					include += [ str(file_relpath) ]
		vars = tuple(list(vars) + [ ('include', str(include).replace('\'','\"')) ])

	return _patch_with_context(vars)

def _patch_with_context(vars):
	t = Template("""{% load json_tags %}
		var context = {
			{% for option in options %}
				{{ option.0 }}: {{ option.1|json }}{% if not forloop.last %},{% endif %}
			{% endfor %}
		};
	""")
	c = Context();
	c['options'] = []
	for name, value in vars:
		c['options'] += [ (name, value,), ]
	return t.render(c)

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

@add_fullpath
def runSuite(request, fullpath):
	path = request.POST["path"]
	url = request.POST["url"]
	context_name = request.POST["context"]

	ctx = context.get(fullpath, section=context_name)
	host = ctx.get( option='host' )
	localhost = ctx.get( option='localhost' )

	context_url = ctx.get( option='url' )

	remote_url = "%s/tests/?suite=/cases/%s" % ( context_url, path  )
	remote_url = urllib.unquote(remote_url).replace('\\','/')


	contextjs = _patch_context_adv(ctx)
	contextjs_path = os.path.join(path, 'context.js')
	saveRemoteScripts(contextjs_path, contextjs, ctx, request)

	return HttpResponseRedirect( remote_url )


@add_fullpath
def runTest(request, fullpath):
	if request.POST:
		result = tools.savetest(request.POST["content"], fullpath)

		context_name = request.POST.get("context", None)

		ctx = context.get(fullpath, section=context_name)
		log.debug('renTest: Fullpath is '+ fullpath +', Context is ' + str(context_name)+ ', Items: '+ str(ctx.items()))
		host = ctx.get( option='host' )
		run = ctx.get( option='run' )
		if not run: run = 'remote'
		run = str(run).strip('\'')
		log.debug('runTest POST: '+ str(ctx.items())+'; run: '+run)
		if run == 'inner':
			log.debug('InnerTest: prepearing' )
			contextjs = _patch_context_adv(ctx)
			if os.path.isdir(fullpath):
				contextjs_path = os.path.join(fullpath, 'context.js')
			else:
				contextjs_path = os.path.join(os.path.dirname(fullpath), 'context.js')
			f = open(contextjs_path, 'wt')
			f.write(contextjs)
			f.close()
			log.debug('context saved to: '+contextjs_path)
			from django.core.urlresolvers import reverse
			path = request.POST.get('path','').lstrip('/')
			url = reverse('run-test') + '?path=/'+path
			log.debug('Redirect to URL: '+ url)
			return HttpResponseRedirect(url)
		elif run == 'local':
			contextjs = _patch_context_adv(ctx)
			if os.path.isdir(fullpath):
				contextjs_path = os.path.join(fullpath, 'context.js')
			else:
				contextjs_path = os.path.join(os.path.dirname(fullpath), 'context.js')
			f = open(contextjs_path, 'wt')
			f.write(contextjs)
			f.close()
			from django.core.urlresolvers import reverse
			url = reverse('run-test') + '?path='+request.POST['path']+'&run=local'
			return HttpResponseRedirect(url)
		elif run == 'remote':
			contextjs = _patch_context_adv(ctx)
			log.debug('contextJS: '+ contextjs)
			contextjs_path = os.path.join(os.path.dirname(request.POST["path"]), 'context.js')
			saveRemoteScripts(contextjs_path, contextjs, ctx, request)
			path = saveRemoteScripts(request.POST["path"], request.POST["content"], ctx, request)
			return runRemoteTest(path, ctx)
		raise Exception('Invalid test, run method: ' + run)
	else:
		if 'path' in request.GET or 'suite' in request.GET:
			run = request.GET.get('run', 'inner')
			path = request.GET.get('path', request.GET.get('suite', None))
			if run == 'local':
				return runLocalTest(path, fullpath)
			elif run == 'inner':
				return runInnerTest(path, fullpath)
		raise Exception('Invalid test')



def runRemoteTest(path, context):
	url = "%s%s" % (context.get('url'), path)
	log.info("Run REMOTE test %s" % url)
	return HttpResponseRedirect(url)
	
def runLocalTest(name, fullpath):
	rand = random.random()
	root = ''
	loader = root +'/loader'
	jsfile = '/'+name.replace(settings.INNER_TESTS_ROOT, settings.TESTS_URL)
	suite = None
	rand = random.random()
	log.debug('runInnerTest: ' + fullpath+', name: '+name)
	if os.path.isdir(fullpath):
		jspath = jsfile
		suite = jspath
		title = os.path.basename(jsfile)
		log.info('SUITE')
	else:
		jspath, file_name = os.path.split(jsfile)
		title = file_name
	log.info("Run INNER test %s %s, %s %s" % (jspath, jsfile, locals(), os.path.isdir(fullpath)))
	return _render_to_response('testLoader.html', locals())

def runInnerTest(name, fullpath):
	rand = random.random()
	root = ''
	loader = root +'/loader'
	jsfile = name
	rand = random.random()
	log.debug('runInnerTest: ' + fullpath+', name: '+name)
	if os.path.isdir(fullpath):
		jspath = jsfile
		suite = jspath
		title = os.path.basename(jsfile)
		log.info('SUITE')
	else:
		jspath, file_name = os.path.split(jsfile)
		title = file_name
	log.info("Run INNER test %s %s, %s %s" % (jspath, jsfile, locals(), os.path.isdir(fullpath)))
	return _render_to_response('testLoader.html', locals())

def useLogin(url, login, password, skip_ntlm=False):
	if not skip_ntlm:
		from ntlm import HTTPNtlmAuthHandler
	
		passman = urllib2.HTTPPasswordMgrWithDefaultRealm()
		passman.add_password(None, url, login, password)
		auth_NTLM = HTTPNtlmAuthHandler.HTTPNtlmAuthHandler(passman)
		opener = urllib2.build_opener(auth_NTLM)
	else:
		opener = urllib2.build_opener()
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
	scripts = getOpenedFiles(request, clean=True)
	if scripts.count(test) > 0: scripts.remove(test)
	for path in scripts:
		fullpath = get_fullpath(path)
		content = tools.gettest(fullpath)
		data = makeSaveContentPost(content, path)
		post = urllib.urlencode(data)
		log.info("Save satellite script %s to %s" % (path, url))
		result = urllib2.urlopen(url, post).read()
		log.info("... done as %s" % result)

def saveRemoteScripts(path, content, ctx, request):
	data = makeSaveContentPost(content, path)
	post = urllib.urlencode(data)
	login = ctx.get('login')
	password = ctx.get('password')
	
	url = "%s/%s/" % (ctx.get('url'), settings.PRODUCT_TESTS_URL)
	url = url.replace(ctx.get('host'), context.host(ctx))
	log.debug((url, login, password))
	useLogin(url, login, password)
	saveTestSatelliteScripts(url, path, request)
	log.info("Save test script %s to %s" % (path, url))
	r = urllib2.urlopen(url, post).read()
	log.info("Saved test script %s to %s" % (path, url))
	return r

def recvLogRecords(request):
	from logbook.queues import ZeroMQSubscriber
	subscriber = ZeroMQSubscriber('tcp://127.0.0.1:5000')
	records = subscriber.recv()
	
	response = HttpResponse(mimetype='text/plain')
	response.write(records)

	return response

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


	
