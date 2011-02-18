import os, re, settings
from logger import log
from django.core.cache import cache

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
	log.info('get host by name called '+str(host))
	cache.set(host, r)
	return r

def resolveRemoteAddr(host):
	log.info('resolve addr called '+str(host))
	return cache.get(host, getHostByName(host))