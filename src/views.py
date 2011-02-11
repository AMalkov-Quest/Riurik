from django.shortcuts import render_to_response as _render_to_response
from django.template.loader import render_to_string
from django_websocket.decorators import require_websocket, accept_websocket
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
from django.utils.http import http_date
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
import re
import stat
import urllib
from email.Utils import parsedate_tz, mktime_tz

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

def patch_fullpaths(fullpath,newpath=''):
    for key in settings.VIRTUAL_URLS:
        m = re.search('^%s(/.*)$' % key, newpath)
        if m:
            fullpath = settings.VIRTUAL_URLS[key] + m.group(1)
            return fullpath
    return ''

patch_virtual_paths = patch_fullpaths

def get_fullpath(path):
    return patch_fullpaths('', path)

def serve(request, path, document_root=None, show_indexes=False):
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
        newpath = os.path.join(newpath, part).replace('\\', '/')
    if newpath and path != newpath:
        return HttpResponseRedirect(newpath)
    fullpath = os.path.join(document_root, newpath).replace('/', '\\')
    
    fullpath = patch_virtual_paths(fullpath, newpath)
    
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
    if not django.views.static.was_modified_since(request.META.get('HTTP_IF_MODIFIED_SINCE'),
                              statobj[stat.ST_MTIME], statobj[stat.ST_SIZE]):
        return HttpResponseNotModified(mimetype=mimetype)
    contents = open(fullpath, 'rb').read()
    response = HttpResponse(contents, mimetype=mimetype)
    response["Last-Modified"] = http_date(statobj[stat.ST_MTIME])
    response["Content-Length"] = len(contents)
    if encoding:
        response["Content-Encoding"] = encoding
        
    try:
        content = contents
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
        
    return response

def add_fullpath(fn):
    def patch(request):
        if request.POST and 'path' in request.POST:
            log.debug('add_fullpath: func (%s) arguments patched. path: %s , fullpath: %s' % (fn, request.POST['path'], get_fullpath(request.POST['path'])))
            return fn(request, get_fullpath(request.POST['path']))
        return fn(request)
    return patch

@add_fullpath
def createFolder(request, fullpath):
    result = tools.mkdir(fullpath, request.POST["object-name"])
    
    response = HttpResponse(mimetype='text/plain')
    response.write(result)
    
    return response

@add_fullpath
def removeObject(request):
    result = tools.remove(fullpath)
    return HttpResponseRedirect('/' + settings.STATIC_TESTS_URL + '/' + request.POST["url"].strip('/'))

@add_fullpath
def createSuite(request, fullpath):
    result = {}
    result['success'], result['result'] = tools.mksuite(fullpath, request.POST["object-name"])
    
    response = HttpResponse(mimetype='text/json')
    response.write(simplejson.dumps(result))
    
    return response
    
@add_fullpath
def editSuite(request, fullpath):
    return HttpResponseRedirect(fullpath + '/' + settings.TEST_CONTEXT_FILE_NAME)
    
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
    for name,value in vars:
        c['options'] += [ (name,value,), ]
    return t.render(c) + data

def submitTest(request):
    testname = request.POST["path"]
    url = request.POST["url"]
    content = request.POST.get("content", tools.gettest(testname))
    
    return _render_to_response( "runtest.html", locals() )
    
@add_fullpath    
def runTest(request, fullpath=''):
    log.debug(request.POST)
    result = tools.savetest(request.POST["content"], fullpath)
    
    ctx = context.get(request.POST["path"])
    host = ctx.get('host')
    
    if host == 'localhost':
        return runInnerTest(request.POST["path"], request.POST["url"])
    else:
        return runRemoteTest(request.POST["path"], request.POST["content"], request.POST["url"], ctx)

def runInnerTest(name, url):
    jsfile = "/%s/%s" % (settings.TESTS_URL, name)
    return _render_to_response('testLoader.html', locals())

def runRemoteTest(name, content, testpath, context):
    data = {}
    data['content'] = content
    data['name'] = name
    
    # TODO: call data = _patch_with_context(data, items) to add context variables to test file content behind
    
    data['content'] = _patch_with_context(data['content'], context.items())
    result = tools.remotesavetest(context.get('host'), data)
    url = context.get('url')
    
    return HttpResponseRedirect(url + '?path=' + testpath.lstrip('/'))

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
