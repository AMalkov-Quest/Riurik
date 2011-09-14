import os, re, settings
from logger import log

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

def patch_fullpaths(fullpath, newpath=''):
	for key in settings.VIRTUAL_URLS:
		m = re.search('^%s(.*)$' % key, newpath)
		if m:
			fullpath = settings.VIRTUAL_URLS[key] + m.group(1)
			return fullpath
	
	return fullpath

def getHostByName(host):
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
