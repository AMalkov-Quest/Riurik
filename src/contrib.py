# coding: utf-8
import os, re, settings
from logger import log
import socket, simplejson

def get_libraries(context):
	"""
	>>> get_libraries({})
	[]
	>>> get_libraries({'libraries': '["lib1", "lib2"]'})
	['lib1', 'lib2']
	"""
	libs = context.get('libraries', '[]')
	return simplejson.loads(libs)

def convert_dict_values_strings_to_unicode(obj):
	"""
		>>> convert_dict_values_strings_to_unicode({'key1': u'Ё'})
		{'key1': '\\xc3\\x90\\xc2\\x81'}
	"""
	for key, val in obj.iteritems():
		if val.__class__.__name__ == 'unicode':
			obj[key] = val.encode('utf-8')
	return obj


def get_target_host(context):
	"""
	returns http url of target lab to run tests on by host and port values in a context
	if these values in the context are empry it returns None
	if host is localhost it returns resolved name
	>>> get_target_host({})
	
	>>> get_target_host({'host': 'host-1'})	

	>>> get_target_host({'port': 'port-1'})	

	>>> get_target_host({'host': 'google.com', 'port': '22'})	
	'google.com:22'
	>>> from minimock import mock
	>>> import os
	>>> mock('socket.gethostname', returns='google.com')
	>>> get_target_host({'host': 'localhost', 'port': '22'})	
	Called socket.gethostname()
	'google.com:22'
	"""
	host = context.get('host')
	port = context.get('port')
	if host and port:
		if host == 'localhost':
			host = socket.gethostname()
 
		return '%s:%s' % (host, port)

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
