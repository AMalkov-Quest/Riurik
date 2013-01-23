from django.shortcuts import render_to_response as _render_to_response
from django.template.loader import render_to_string
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpRequest, HttpResponseServerError
import django.views.static
import os, re
import dir_index_tools as tools
import json
import django.conf
import settings
from logger import log
import context, config, contrib
import mimetypes, datetime
import codecs, time
import distributor
import inuse, serving
from serving import add_request_handler

def serve(request, path, show_indexes=False):
	return serving.response(request, path)

def show_context(request, path):
	RequestHandler = serving.factory(request, path)
	fullpath = RequestHandler.get_full_path()
	log.debug('show context of %s (%s)' % (fullpath, path))

	result = ""

	#sections = config.sections(context.get(RequestHandler).inifile)
	sections = context.get( RequestHandler ).sections()
	for section_name in sections:
		ctx = context.get(RequestHandler, section=section_name)
		context_ini = context.render_ini(RequestHandler, ctx, request.get_host(), section_name)
		result += context_ini

	return HttpResponse(result)

@add_request_handler
def createFolder(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	result = tools.mkdir(fullpath, request.POST["object-name"])

	response = HttpResponse(mimetype='text/plain')
	response.write(result)

	return response

@add_request_handler
def removeObject(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	log.debug('removeObject: ' + fullpath)
	tools.remove(fullpath)
	redirect = '/' + request.POST["url"].lstrip('/')
	return HttpResponseRedirect(redirect)

@add_request_handler
def renameObject(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	new_name = request.POST["object-name"]
	log.debug('renameObject: ' + fullpath)
	result = {}
	result['success'], result['result'] = tools.rename(fullpath, new_name)

	response = HttpResponse(mimetype='text/json')
	response.write(json.dumps(result))

	return response

@add_request_handler
def createSuite(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	result = {}
	result['success'], result['result'] = tools.mkconfig(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	response = HttpResponse(mimetype='text/json')
	response.write(json.dumps(result))

	return response

@add_request_handler
def editSuite(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	log.debug('edit context %s' % fullpath)
	if not os.path.exists(os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME)):
		tools.mkconfig(fullpath, settings.TEST_CONTEXT_FILE_NAME)
	redirect = '/' + request.GET['path'] + '/' + settings.TEST_CONTEXT_FILE_NAME + '?editor'
	return HttpResponseRedirect(redirect)

@add_request_handler
def createTest(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	log.debug('createTest: '+ request.POST["object-name"])
	result = {}
	result['success'], result['result'] = tools.mktest(fullpath, request.POST["object-name"])
	result['result'] += '?editor'
	log.debug('createTest results: %s' % result)
	response = HttpResponse(mimetype='text/json')
	response.write(json.dumps(result))

	return response

@add_request_handler
def saveTest(request, RequestHandler):
	fullpath = RequestHandler.get_full_path()
	if fullpath == 'settings':
		fullpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'virtual_paths.py')
	url = request.POST["url"].lstrip('/')
	inuse.stub(url, request)
	tools.savetest(request.POST["content"], fullpath)
	return HttpResponseRedirect('/' + url + '?editor')

def submitTest(request):
	return _render_to_response( "runtest.html", request.POST )

def submitSuite(request):
	return _render_to_response( "runsuite.html", request.POST )

def recvLogRecords(request):
	from logger import FILENAME, timeFormat
	log_file = FILENAME
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

def live_settings_view(request):
	return _render_to_response(
			'configure.html',
			live_settings_json(request),
			context_instance=RequestContext(request)
		)

def get_virtual_paths_path():
	root = os.path.dirname(os.path.abspath(__file__))
	return os.path.join(root, settings.virtual_paths_py)

def stubFile(request):
	request_control = inuse.stub(request.GET['path'], request)
	return HttpResponse(str(request_control))

def live_settings_json(request, content=None):
	settings_fullpath = get_virtual_paths_path()
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
	fullpath = get_virtual_paths_path()
	url = request.POST["url"].lstrip('/')
	inuse.stub(url, request)

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
	
def report_callback(req):
	import reporting
	try:
		event = req.GET.get('event')
		if event == 'begin':
			reporting.start(req.GET)
		elif event == 'done':
			reporting.done(req.GET)
		elif event == 'testDone':
			reporting.save(req.GET)
		elif event == 'html':
			reporting.add_html(req.GET)
		else:
			log.exception('Unsupported event on tests callback')
	except Exception, e:
		log.exception(e)
		return HttpResponseServerError(e)
		
	return HttpResponse('')

def tests_status(request):
	try:
		import reporting
		path = request.GET.get('path')
		context = request.GET.get('context')
		date = request.GET.get('date', None)
		status = reporting.status(path, context, date)
		return HttpResponse(status)
	except Exception, e:
		log.exception(e)
		return HttpResponseServerError(e)
		
def tests_progress(request):
	try:
		import reporting
		path = request.GET.get('path')
		context = request.GET.get('context')
		date = request.GET.get('date')
		progress = reporting.progress(date, path, context)
		return HttpResponse(progress)
	except Exception, e:
		log.exception(e)
		return HttpResponseServerError(e)

def reporting_purge(request):
	try:
		import reporting
		path = request.GET.get('path')
		context = request.GET.get('context')
		date = request.GET.get('date', )
		reporting.purge(date, path, context)
		return HttpResponse()
	except Exception, e:
		log.exception(e)
		return HttpResponseServerError(e)
