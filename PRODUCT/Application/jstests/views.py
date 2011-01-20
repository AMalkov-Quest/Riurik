from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.cache import never_cache
from logger import log
from django.conf import settings
import os

@never_cache
def index(request):
	tests = []
	for tpl_dir in settings.TEMPLATE_DIRS:
		abs_path_tpl_dir = os.path.abspath(tpl_dir)
		tests_dir = os.path.join(abs_path_tpl_dir, 'static/tests')
		if not os.path.exists(tests_dir):
			continue
		test_cases_dir = os.path.join(tests_dir, 'cases')
		for root, dirs, files in os.walk(test_cases_dir):
			for in_file in files:
				abs_file_path = os.path.join(root, in_file)
				tests += [ 
					abs_file_path.replace(abs_path_tpl_dir,'').replace(abs_path_tpl_dir,'').replace('\\','/')
				]
	vars = { 'js': tests }
	return render_to_response('static/tests/testLoader.html', vars)
