import os
import settings, resources

def mkdir(path, name):
	try:
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, path.strip('/'), name)
		print fullpath
		os.mkdir(fullpath)
	except Exception, e:
		return str(e)
	
	return resources.ok

def mksuite(path, name):
	try:
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, path.strip('/'), name)
		os.mkdir(fullpath)
		filename = os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME)
		f = open(filename, 'w')
		f.close()
	except Exception, e:
		return (False, str(e))
	
	return (True, os.path.join(name, settings.TEST_CONTEXT_FILE_NAME))

def mktest(path, name):
	try:
		filename = os.path.join(name + settings.TEST_FILE_EXT)
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, path.strip('/'), filename)
		f = open(fullpath, 'w')
		f.close()
	except Exception, e:
		return (False, str(e))
	
	return (True, filename)

def remotesavetest(url, data):
	import urllib, urllib2
	post = urllib.urlencode(data)
	return urllib2.urlopen(url, post).read()

def savetest(content, path):
	try:
		fullpath = os.path.normpath(os.path.join(settings.STATIC_TESTS_ROOT, path.strip('/')))
		if not os.path.exists(os.path.dirname(fullpath)):
			os.makedirs(os.path.dirname(fullpath))
			
		f = open(fullpath, 'w')
		f.write(content.replace('\r', ''))
		f.close()
	except Exception, e:
		return str(e)
	
	return resources.ok
