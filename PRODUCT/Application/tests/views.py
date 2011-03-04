from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.cache import never_cache
from logger import log
from django.conf import settings
from django.utils.translation import ugettext as _
import os

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
	file.write(content)
	file.close()

@never_cache
def index(request):
	if request.method == "POST":
		try:
			saveTestContent(request.REQUEST['path'], request.REQUEST['content'], request.REQUEST['tests_root'])
		except Exception, e:
			log.Info(e)
		
		#redirect example cases/tests/?path=enterprise-report/web-applications/setup.js
		redirect = request.path + '?path=/' + request.REQUEST['tests_root'] + '/' + request.REQUEST['path']
		response = HttpResponse(mimetype='text/plain')
		response.write(redirect)
		
		return response
	else:
		if 'suite' in request.REQUEST:
			suite = request.REQUEST.get('suite')
			jspath = suite
		else:
			jsfile = request.REQUEST['path']
			jspath = os.path.dirname(jsfile)
		return render_to_response('testLoader.html', locals())