import os, re, settings
from logger import log

def get_document_root(path):
	"""
	>>> settings.VIRTUAL_PATHS['some-key'] = 'some-value'
	>>> get_document_root('/some-key/test-1')
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
	>>> get_full_path('C:\\dir-1', '')
	'C:\\\\dir-1'
	>>> get_full_path('C:\\dir-1', '/')
	'C:\\\\dir-1'
	>>> get_full_path('C:/dir-1/tests', '/tests-1/')
	'C:\\\\dir-1\\\\tests'
	>>> get_full_path('C:/dir-1/tests-1', '/tests-1/first/test')
	'C:\\\\dir-1\\\\tests-1\\\\first\\\\test'
	>>> get_full_path('C:/dir-1/tests-1', '\\\\tests-1/first\\\\test')
	'C:\\\\dir-1\\\\tests-1\\\\first\\\\test'
	"""
	newpath = ''
	if path:
		parts = path.replace('\\', '/').strip('/').split('/', 1)
		if parts[0] in settings.VIRTUAL_PATHS: 
			if len(parts) > 1:
				newpath = parts[1]
	return os.path.normpath(os.path.join(document_root, newpath))

def patch_fullpaths(fullpath, newpath=''):
	for key in settings.VIRTUAL_URLS:
		m = re.search('^%s(.*)$' % key, newpath)
		if m:
			fullpath = settings.VIRTUAL_URLS[key] + m.group(1)
			return fullpath
	
	return fullpath

def get_fullpath(path):
	path = path.lstrip('/')
	return patch_fullpaths(os.path.join(settings.STATIC_TESTS_ROOT, path), path)

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