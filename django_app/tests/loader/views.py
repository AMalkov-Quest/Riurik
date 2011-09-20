from django.http import HttpResponse, HttpResponseRedirect
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

#TODO: loader_dir = os.path.dirname(__file__)
loader_dir = 'loader'
cases_dir = 'cases'
	
@never_cache
def execute(request):
	rand = random.random()
	loader = loader_dir
	cases = cases_dir
	
	if 'suite' in request.REQUEST:
		jspath = request.REQUEST.get('suite', '').strip('/')
		log.info('execute suite %s' % jspath)
		title = os.path.basename(jspath)
		suite = True
	else:
		jsfile = request.REQUEST.get('path', '').strip('/')
		log.info('execute test %s' % jsfile)
		jspath = os.path.dirname(jsfile).strip('/')
		title = os.path.basename(jsfile)
		
	return render_to_response('%s/testLoader.html' % loader_dir, locals())

@csrf_exempt
def upload(request, document_root):
	response = HttpResponse(mimetype='text/plain')
	path = request.REQUEST['path']
	content = request.REQUEST['content']
	fullpath = os.path.join(document_root, cases_dir, path)
	log.debug('upload file %s to %s' % (path, fullpath))
	try:
		dirname = os.path.dirname(fullpath)
		#TODO: test that this work on deeper levels
		if not os.path.exists(dirname):
			os.makedirs(dirname)
	
		file = open(fullpath, 'wb')
		file.write(content.encode('utf-8'))
		file.close()
		
		log.info('save script %s' % path)

		response.write('OK')
	except Exception, e:
		log.debug(e)
		response.write('FAILED')
	
	return response
