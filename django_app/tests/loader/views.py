from django.http import HttpResponse, HttpResponseRedirect
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.views.decorators.cache import never_cache
from django.conf import settings
from django.utils.translation import ugettext as _
from django.views.decorators.csrf import csrf_exempt
import os, random
try:
	from logger import log
except:
	import logging
	log = logging.getLogger('default')

try:
    from django.contrib import messages
    _USE_MESSAGES = True
except ImportError:
    _USE_MESSAGES = False

_loader_dir_path = os.path.dirname(__file__)
loader_dir = os.path.basename(_loader_dir_path)
cases_dir = 'cases'
_cases_dir_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), cases_dir)

from errors import *

def error_handler(fn):
	def _f(*args, **kwargs):
		try:
			if not os.path.exists(_loader_dir_path):
				raise InvalidLoaderFolder(_loader_dir_path)
			if not os.path.exists(_cases_dir_path):
				raise InvalidCasesFolder(_cases_dir_path)
			response = fn(*args, **kwargs)
		except Exception, ex:
			response = HttpResponse(status=500)
			response.write(render_to_string('%s/error.html' % loader_dir, {
				'type': ex.__class__.__name__,
				'msg': ex.message,
				'stacktrace': '',
				'issue':  ex.issue if hasattr(ex, 'issue') else '',
				'loader': loader_dir,
				'request': args[0].REQUEST
			}))
		return response
	return _f

@never_cache
@error_handler
def execute(request):
	rand = random.random()
	loader = loader_dir
	cases = cases_dir
	
	if not ( 'suite' in request.REQUEST or 'path' in request.REQUEST ):
		raise TestFileNotSpecified(request.get_full_path())
	
	if 'suite' in request.REQUEST:
		jspath = request.REQUEST.get('suite', '').strip('/')
		
		if not jspath:
			raise NoSuiteSpecified()
		if not os.path.exists( os.path.join(_cases_dir_path, jspath) ):
			raise SuiteFolderDoesNotExists(jspath, os.path.join(_cases_dir_path, jspath))

		log.info('execute suite %s' % jspath)
		title = os.path.basename(jspath)
		suite = True
	else:
		jsfile = request.REQUEST.get('path', '').strip('/')

		if not jsfile:
			raise NoTestSpecified()
		if not os.path.exists( os.path.join(_cases_dir_path, jsfile) ):
			raise TestFileDoesNotExists(jsfile, os.path.join(_cases_dir_path, jsfile))

		log.info('execute test %s' % jsfile)
		jspath = os.path.dirname(jsfile).strip('/')
		title = os.path.basename(jsfile)
		
	return render_to_response('%s/testLoader.html' % loader_dir, locals())

@csrf_exempt
@error_handler
def upload(request, document_root):
	response = HttpResponse(mimetype='text/plain')
	path = request.REQUEST.get('path', None)
	content = request.REQUEST.get('content', None)

	if not path:
		raise NoPathSpecifiedForUpload()
	if not content:
		raise NoContentSpecifiedForUpload()
	
	fullpath = os.path.join(document_root, cases_dir, path)
	if not os.path.exists(document_root):
		raise InvalidDocumentRoot(document_root)

	log.debug('upload file %s to %s' % (path, fullpath))
	dirname = os.path.dirname(fullpath)
	try:
		if not os.path.exists(dirname):
			os.makedirs(dirname)
	except Exception, ex:
		raise ErrorCreatingFolders(dirname, ex)
	
	try:
		file = open(fullpath, 'wb')
		file.write(content.encode('utf-8'))
		file.close()
	except Exception, ex:
		raise ErrorWritingFile(fullpath, ex)
	log.info('save script %s' % path)

	response.write('OK')
	return response
