from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.cache import never_cache
from django.conf import settings
from django.utils.translation import ugettext as _
import os, random
from logger import log
try:
    from django.contrib import messages
    _USE_MESSAGES = True
except ImportError: 
    _USE_MESSAGES = False

loader_dir = 'loader'
cases_dir = 'cases'
	
def saveTestContent(document_root, path, content):
	log.Debug('save %s' % path)
	path = os.path.join(document_root, cases_dir, path)
	log.Debug('	to %s' % path)
	if not os.path.exists(os.path.dirname(path)):
		os.makedirs(os.path.dirname(path))
	
	file = open(path, 'wb')
	file.write(content.encode('utf-8'))
	file.close()

@never_cache
def execute(request):
	rand = random.random()
	loader = loader_dir
	cases = cases_dir
	
	if 'suite' in request.REQUEST:
		jspath = request.REQUEST.get('suite', '').strip('/')
		title = os.path.basename(jspath)
		suite = True
	else:
		jsfile = request.REQUEST.get('path', '').strip('/')
		jspath = os.path.dirname(jsfile).strip('/')
		title = os.path.basename(jsfile)

	return render_to_response('%s/testLoader.html' % loader_dir, locals())

@never_cache
def upload(request, document_root):
	response = HttpResponse(mimetype='text/plain')
	try:
		saveTestContent(document_root, request.REQUEST['path'], request.REQUEST['content'])
		response.write('OK')
	except Exception, e:
		response.write('FAILED')
		log.Except(e)
	
	return response