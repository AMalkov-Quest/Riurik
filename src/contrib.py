# coding: utf-8
import os, re, settings, virtual_paths
from logger import log
import socket, simplejson


def target_is_remote(target, host):
	"""
	>>> target_is_remote('localhost:8080', 'spb:8080')
	False
	>>> target_is_remote('spb8080', 'localhost:8080')
	False
	>>> target_is_remote('spb123:8080', 'spb456:8080')
	True
	>>> target_is_remote('spb8080', 'spb:8080')
	True
	"""
	if not 'localhost' in target		\
		and not 'localhost' in host and	\
		host.lower() != target.lower():
			return True
	
	return False

def get_libraries__(context):
	try:
		libs = context.get('libraries', '[]')
		return simplejson.loads(libs)
	except:
		return get_libraries_new(context)

def get_libraries___(context):
	"""
	>>> get_libraries___({})
	[]
	>>> get_libraries___({'libraries': 'lib1, lib2'})
	['lib1', 'lib2']
	>>> get_libraries___({'libraries': '[]'})
	"""
	libs = context.get('libraries', None)
	if libs and libs == '[]':
		return None
	
	if libs:
		return [lib.strip() for lib in libs.split(',')]
	else:
		return []

def get_libraries(path, context):
	return get_libraries_impl(path, context.items(), context)

def get_libraries_impl(path, vars, ctx):
	libraries = []
	
	libs = get_libraries_raw(vars)
	root = get_document_root(path)
	log.info('libs are %s' % libs)
	if libs != None:
		for lib in libs:
			lib_path = get_lib_path_by_name(root, lib, ctx)
			if lib_path:
				libraries.append(lib_path)
		if not libraries:
			log.info('there are no precofigured libs to include, try defaults ...')
			libraries = libraries_default(root, ctx)

	return libraries 

def get_libraries_raw(vars):
	"""
	>>> get_libraries_raw([])
	[]
	>>> get_libraries_raw([('libraries', '[]')])
	>>> get_libraries_raw([('key', 'value')])
	[]
	>>> get_libraries_raw([('libraries', 'lib1, lib2')])
	['lib1', 'lib2']
	"""
	for item in vars:
		if item[0] == settings.LIB_KEY_NAME:
			if not '[]' in item[1]:
				return [lib.strip() for lib in item[1].split(',')]
			else:
				return None
	return []

def libraries_default(root, ctx):
	libraries = []

	lib_paths = get_global_context_lib_path(ctx)
	for path in lib_paths:
		full_path = os.path.abspath(os.path.join(root, path.strip()))
		for name in os.listdir(full_path):
			lib_path = os.path.abspath(os.path.join(full_path, name))
			lib_relpath = lib_path.replace(root, '').lstrip('/') 
			libraries.append(str(lib_relpath))
	
	lib_relpath = get_local_lib_path(root, 'library.js', ctx)
	if lib_relpath:
		libraries.append(lib_relpath)
	
	return libraries

def convert_dict_values_strings_to_unicode(obj):
	"""
	>>> convert_dict_values_strings_to_unicode({'key1': u'Ё'})
	{'key1': '\\xc3\\x90\\xc2\\x81'}
	"""
	for key, val in obj.iteritems():
		if val.__class__.__name__ == 'unicode':
			obj[key] = val.encode('utf-8')
	return obj


def get_target_host(context, riurik_url):
	"""
	returns http url of target lab to run tests on by host and port values in a context
	if these values in the context are empry it returns None
	if host is localhost it returns resolved name
	>>> get_target_host({}, 'spb123:8000')
	'spb123:8000'
	>>> get_target_host({'host': 'host-1'}, 'spb123:8000')	
	'spb123:8000'
	>>> get_target_host({'port': 'port-1'}, 'spb123:8000')	
	'spb123:8000'
	>>> get_target_host({'host': 'google.com', 'port': '22'}, 'localhost:8000')	
	'google.com:22'
	>>> from minimock import mock
	>>> import os
	>>> mock('socket.gethostname', returns='google.com')
	>>> get_target_host({'host': 'localhost', 'port': '22'}, 'localhost:8000')	
	Called socket.gethostname()
	'google.com:22'
	>>> get_target_host({'port': '22'}, 'localhost:22')
	Called socket.gethostname()
	'google.com:22'
	"""
	def replace_localhost(url):
		return url.replace('localhost', socket.gethostname())

	host = context.get('host')
	port = context.get('port')
	if host and port:
		target = '%s:%s' % (host, port)
	else:
		target = riurik_url

	return replace_localhost(target)

def get_virtual_root(path):
	"""
	>>> settings.VIRTUAL_PATHS['some-key'] = 'some-value'
	>>> get_virtual_root('/some-key/test-1')
	'some-key'
	"""
	if path:
		reload(virtual_paths)
		key = path.strip('/').split('/')[0]
		if key and key in virtual_paths.VIRTUAL_PATHS:
			return key

def get_document_root(path):
	"""
	>>> settings.VIRTUAL_PATHS['some-key'] = 'some-value'
	>>> get_document_root('/some-key/test-1')
	'some-value'
	>>> get_document_root('some-key')
	'some-value'
	>>> get_document_root('')
	''
	>>> get_document_root('/')
	'/'
	"""
	if path:
		reload(virtual_paths)
		key = path.strip('/').split('/')[0]
		if key and key in virtual_paths.VIRTUAL_PATHS:
			return virtual_paths.VIRTUAL_PATHS[key]
	
	return path

def get_full_path(document_root, path):
	"""
	>>> settings.VIRTUAL_PATHS['tests-1'] = 'C:\\dir-1'
	>>> get_full_path('/dir/dir-1', '')
	'/dir/dir-1'
	>>> get_full_path('/dir/dir-1', '/')
	'/dir/dir-1'
	>>> get_full_path('C:/dir-1/tests', '/tests-1/')
	'C:/dir-1/tests'
	>>> get_full_path('C:/dir-1/tests-1', '/tests-1/first/test')
	'C:/dir-1/tests-1/first/test'
	>>> get_full_path('C:/dir-1/tests-1', '\\\\tests-1/first\\\\test')
	'C:/dir-1/tests-1/first/test'
	"""
	log.debug('get full path %s %s' % (document_root, path))
	newpath = get_relative_clean_path(path)
	print newpath
	return os.path.normpath(os.path.join(document_root, newpath))

def get_relative_clean_path(path):
	"""
	removes virtal folder from path
	>>> settings.VIRTUAL_PATHS['tests-1'] = '/src/tests/cases'
	>>> get_relative_clean_path('tests-1/main/case-1')
	'main/case-1'
	>>> get_relative_clean_path('tests-1/main/')
	'main'
	>>> get_relative_clean_path('')
	''
	>>> get_relative_clean_path('/')
	''
	>>> get_relative_clean_path('main/case-1')
	''
	"""
	if path:
		reload(virtual_paths)
		parts = path.replace('\\', '/').strip('/').split('/', 1)
		print parts, virtual_paths.VIRTUAL_PATHS
		if parts[0] in virtual_paths.VIRTUAL_PATHS:
			if len(parts) > 1:
				return parts[1].strip('/')
	return '' 

def get_global_context_lib_path(ctx):
	"""
	>>> ctx = {}
	>>> get_global_context_lib_path(ctx)
	[]
	>>> ctx = {'LIBRARY_PATH': 'path1, path2, path3'}
	>>> get_global_context_lib_path(ctx)
	['path1', 'path2', 'path3']
	"""
	path = ctx.get( 'LIBRARY_PATH' )
	if path:
		return [path.strip() for path in path.split(',')]
	
	return []

def get_local_lib_path(root, lib, ctx):
	current_suite_path = os.path.abspath(os.path.join(ctx.get_folder(), lib))
	if os.path.exists(current_suite_path):
		log.info('%s lib is located in current suite folder' % lib)
		return str(current_suite_path.replace(root, '').lstrip('/'))

	return ''
	
def get_lib_path_by_name(root, lib, ctx):
	full_path = os.path.abspath(os.path.join(root, lib))
	lib_relpath = ''
	if not os.path.exists(full_path):
		#current_suite_path = os.path.abspath(os.path.join(ctx.get_folder(), lib))
		#if os.path.exists(current_suite_path):
		#	log.info('%s lib is located in current suite folder' % lib)
		#	lib_relpath = current_suite_path.replace(root, '')
		lib_relpath = get_local_lib_path(root, lib, ctx)
		#else:
		if not lib_relpath:
			for path in get_global_context_lib_path(ctx):
				global_libs_path = os.path.abspath(os.path.join(root, path.strip(), lib))
				if os.path.exists(global_libs_path):
					log.info('%s lib is located in the %s global library path' % (lib, path))
					lib_relpath = global_libs_path.replace(root, '')
					break
			
			if not lib_relpath:
				log.error('%s lib is not found in any available library paths' % lib)
	else:
		lib_relpath = lib
	
	return str(lib_relpath.lstrip('\\').lstrip('/'))

def enum_suite_tests(target):
	tests = []
	for root, dirs, files in os.walk(target):
		for file in files:
			if re.match('^.*\.js$', file) and not file.startswith('.'):
				#if file in exclude:
				#	continue
				file_abspath = os.path.abspath(os.path.join(root, file))
				file_relpath = file_abspath.replace(os.path.abspath(target), '').lstrip('/').lstrip('\\')
				tests += [ str(file_relpath) ]

	return tests

def patch_fullpaths(fullpath, newpath=''):
	reload(virtual_paths)
	for key in virtual_paths.VIRTUAL_URLS:
		m = re.search('^%s(.*)$' % key, newpath)
		if m:
			fullpath = virtual_paths.VIRTUAL_URLS[key] + m.group(1)
			return fullpath
	
	return fullpath

def getHostByName(host, cache):
	import socket
	r = socket.gethostbyname(host)
	cache.set(host, r)
	return r

def resolveRemoteAddr(host, cache):
	addr =  cache.get(host, None)
	if not addr:
		addr = getHostByName(host, cache)
		log.info('%s addr is resolved: %s' % (str(host), str(addr)))
	else:
		log.info('%s addr is got from cach: %s' % (str(host), str(addr)))
		
	return addr

def normpath(path):
	return path.replace('\\', '/')

def localhost(host):
	import socket
	return host == 'localhost' or host == socket.gethostname()
