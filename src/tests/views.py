from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.cache import never_cache
from logger import log
from django.conf import settings
from django.utils.translation import ugettext as _
import os, random

try:
    from django.contrib import messages
    _USE_MESSAGES = True
except ImportError: 
    _USE_MESSAGES = False

def saveTestContent(path, content, test_root):
	root = os.path.dirname(__file__)
	path = os.path.join(root, test_root, path)
	log.Info(path)
	
	if not os.path.exists(os.path.dirname(path)):
		os.makedirs(os.path.dirname(path))
	
	file = open(path, 'wb')
	file.write(content.encode('utf-8'))
	file.close()

@never_cache
def index(request):
	if request.method == "POST":
		response = HttpResponse(mimetype='text/plain')
		try:
			saveTestContent(request.REQUEST['path'], request.REQUEST['content'], request.REQUEST['tests_root'])
			response.write('OK')
		except Exception, e:
			log.Info(e)
			response.write('FAILED')
		
		return response
	else:
		rand = random.random()
		root = '/testsrc'
		loader = root +'/loader'
		cases = root +'/cases'
		if 'suite' in request.REQUEST:
			jspath = request.REQUEST.get('suite', '')
			title = os.path.basename(jspath)
			suite = True
		else:
			jsfile = request.REQUEST.get('path', '')
			jspath = os.path.dirname(jsfile)
			title = os.path.basename(jsfile)
			jsfile = root + jsfile
		jspath = root + '/' + jspath.strip('/')
		return render_to_response('testLoader.html', locals())
