import os, json
from django.http import HttpResponse
from serving import add_request_handler
from logger import log
import settings, context

@add_request_handler
def enumerate_suites(request, RequestHandler):
	"""
	Return a list of suite names.
	Arguments:
		ctx	(optional)	- filter suites containing supplied ctx name
		json 	(optional)	- return result in JSON format
	"""
	ctx_name = request.REQUEST.get('context')
	as_json = request.REQUEST.get('json', False)
	path = request.REQUEST.get('path', '/')
	
	root = RequestHandler.get_document_root()
	fullpath = RequestHandler.get_full_path()
	log.debug('enum suites in %s' % root)
	suites = get_suites(root, path, fullpath, ctx_name, RequestHandler)

	if as_json:
		reply = json.dumps(suites)
	else:
		reply = ','.join(suites)

	#return HttpResponse(str(suites).replace('[','').replace(']','').rstrip(',').replace('\'',''))
	return HttpResponse( reply )

def norm_win_path(path):
	"""
	>>> norm_win_path(r'\\tests\\suite\\subsuite')
	'tests/suite/subsuite'
	"""
	return path.replace('\\','/').lstrip('/')

def get_suites(root, path, fullpath, ctx_name, RequestHandler):
	"""
	>>> from serving import DefaultHandler
	>>> from tl.testing.fs import new_sandbox
	>>> new_sandbox('''\\
	... d tests
	... d tests/suite-1
	... f tests/suite-1/.context.ini [context] 
	... d tests/suite-2
	... f tests/suite-2/.context.ini [test]
	... d tests/suite-2/sub-suite
	... f tests/suite-2/sub-suite/.context.ini [context]
	... ''')
	>>> settings.VIRTUAL_PATHS['root'] = os.getcwd()
	>>> dfh = DefaultHandler({}, 'root/tests', None)
	>>> suites = get_suites(os.getcwd(), 'root/tests', os.getcwd()+'/tests', 'context', dfh)
	>>> 'tests/suite-2/sub-suite' in suites
	True
	>>> 'tests/suite-1' in suites
	True
	"""
	contextini = settings.TEST_CONTEXT_FILE_NAME
	suites = []
	for dirpath, dirnames, filenames in os.walk(fullpath, followlinks=True):
		if contextini in filenames:
			relpath = os.path.relpath(dirpath, root)
			ctx = context.get(RequestHandler, relpath )
			ctx_sections = ctx.sections()
			if not ctx_name in ctx_sections:
				continue

			if path in relpath:
				suite_name = os.path.relpath(relpath, path)
			else:
				suite_name = relpath
				
			suites += [ norm_win_path(suite_name) ]

	return suites
