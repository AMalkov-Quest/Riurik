from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response as _render_to_response
from django.template.loader import render_to_string
from django_websocket.decorators import require_websocket, accept_websocket
from django.template import RequestContext, Context, Template
import protocol
import traceback, sys, os, re
import dir_index_tools as tools
import simplejson
import django.conf
import settings
from logger import log

__all__ = ('handler',)
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

def static_wrapper(func):
	def new(*args,**kwargs):
		setTestsRoot(kwargs['document_root'])
		r = func(*args, **kwargs)
		try:
			request, path, content = args[0], kwargs['path'], r.content
			if re.match(CODEMIRROR_CALL_EDITOR_FOR, path.lower()):
				return _render_to_response(
					'static/types/javascript.html', 
					{ 
						'content': content,
						'relative_file_path': path,
					}, 
					context_instance=RequestContext(request)
				)
		except Exception, ex:
			log.error(str(ex))
		return r
	return new

import django.views.static
serve = static_wrapper(django.views.static.serve)
innerserve = static_wrapper(django.views.static.serve)

def innerTests(request):
	return HttpResponseRedirect('/inner/')

def outerTests(request):
	return HttpResponseRedirect('/')

def createFolder(request):
	result = tools.mkdir(request.POST["full-path"], request.POST["object-name"])
	
	response = HttpResponse(mimetype='text/plain')
	response.write(result)
	
	return response

def removeObject(request):
	result = tools.remove(request.POST["path"])
	return HttpResponseRedirect('/' + settings.STATIC_TESTS_URL + '/' + request.POST["url"].strip('/'))

def createSuite(request):
	result = {}
	result['success'], result['result'] = tools.mksuite(request.POST["full-path"], request.POST["object-name"])
	
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
	return response

def editSuite(request):
	return HttpResponseRedirect('/' + request.GET["path"] + '/' + settings.TEST_CONTEXT_FILE_NAME)

def createTest(request):
	result = {}
	result['success'], result['result'] = tools.mktest(request.POST["full-path"], request.POST["object-name"])
	
	response = HttpResponse(mimetype='text/json')
	response.write(simplejson.dumps(result))
	
	return response

def saveTest(request):
	result = tools.savetest(request.POST["content"], request.POST["path"])
	return HttpResponseRedirect(request.POST["url"])

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
    for name,value in vars:
        c['options'] += [ (name,value,), ]
    return t.render(c) + data

def submitTest(request):
	testname = request.POST["path"]
	url = request.POST["url"]
	content = request.POST.get("content", tools.gettest(testname))
	
	return _render_to_response( "runtest.html", locals() )
	
def runTest(request):
	result = tools.savetest(request.POST["content"], request.POST["name"])
	data = {}
	data['content'] = request.POST["content"]
	data['name'] = request.POST["name"]
	
	# TODO: call data = _patch_with_context(data, items) to add context variables to test file content behind
	
	import context
	ctx = context.context(request.POST["name"])
	url = ctx.get('url')
	host = ctx.get('host')
	items = ctx.items();
	data['content'] = _patch_with_context(data['content'], items)
	
	result = tools.remotesavetest(host, data)
	
	return HttpResponseRedirect(url + '?path=' + request.POST["url"].lstrip('/'))

def remoteSaveTest(request):
	result = tools.savetest(request.POST["content"], request.POST["name"])
	
	response = HttpResponse(mimetype='text/plain')
	response.write(result)
	
	return response

def recvLogRecords(request):
	log.warn('This is a warning')
	
	from logbook.queues import ZeroMQSubscriber
	subscriber = ZeroMQSubscriber('tcp://127.0.0.1:5000')
	records = subscriber.recv()
	
	response = HttpResponse(mimetype='text/plain')
	response.write(records)
	
	return response