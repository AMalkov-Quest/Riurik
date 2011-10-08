# coding: utf-8
import os, re, settings
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

def get_libraries(context):
	try:
		libs = context.get('libraries', '[]')
		return simplejson.loads(libs)
	except:
		return get_libraries_new(context)

def get_libraries_new(context):
	"""
	>>> get_libraries({})
	[]
	>>> get_libraries({'libraries': 'lib1, lib2'})
	['lib1', 'lib2']
	"""
	libs = context.get('libraries', '')
	if libs:
		return [lib.strip() for lib in libs.split(',')]
	else:
		return []

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
		key = path.strip('/').split('/')[0]
		if key and key in settings.VIRTUAL_PATHS:
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
		key = path.strip('/').split('/')[0]
		if key and key in settings.VIRTUAL_PATHS:
			return settings.VIRTUAL_PATHS[key]
	
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
		parts = path.replace('\\', '/').strip('/').split('/', 1)
		if parts[0] in settings.VIRTUAL_PATHS: 
			if len(parts) > 1:
				return parts[1].strip('/')
	return '' 

def get_lib_path_by_name(root, lib, ctx):
	full_path = os.path.abspath(os.path.join(root, lib))
	lib_relpath = ''
	if not os.path.exists(full_path):
		current_suite_path = os.path.abspath(os.path.join(ctx.get_folder(), lib))
		if os.path.exists(current_suite_path):
			log.info('%s lib is located in current suite folder' % lib)
			lib_relpath = current_suite_path.replace(root, '').lstrip('/') 
		else:
			for path in ctx.get( option='LIBRARY_PATH' ).split(','):
				global_libs_path = os.path.abspath(os.path.join(root, path.strip(), lib))
				if os.path.exists(global_libs_path):
					log.info('%s lib is located in the %s global library path' % (lib, path))
					lib_relpath = global_libs_path.replace(root, '').lstrip('/') 
					break
			
			if not lib_relpath:
				log.error('%s lib is not found in any available library paths' % lib)
	else:
		lib_relpath = lib
	
	return str(lib_relpath)

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
	for key in settings.VIRTUAL_URLS:
		m = re.search('^%s(.*)$' % key, newpath)
		if m:
			fullpath = settings.VIRTUAL_URLS[key] + m.group(1)
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
