import os
import settings, resources

def mkdir(path):
	try:
		os.mkdir(settings.STATIC_TESTS_ROOT + '/' + path.strip('/'))
	except Exception, e:
		return str(e)
	
	return resources.ok

def mksuite(path):
	try:
		os.mkdir(settings.STATIC_TESTS_ROOT + '/' + path.strip('/'))
		f = open(settings.STATIC_TESTS_ROOT + '/' + path.strip('/') + '/' + settings.TEST_CONTEXT_FILE_NAME, 'w')
		f.close()
	except Exception, e:
		return str(e)
	
	return resources.ok

def mktest(path, name):
	try:
		filename = os.path.join(name + settings.TEST_FILE_EXT)
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, path.strip('/'), filename)
		f = open(fullpath, 'w')
		f.close()
	except Exception, e:
		return (False, str(e))
	
	return (True, filename)

def savetest(content, path):
	try:
		f = open(settings.STATIC_TESTS_ROOT + '/' + path.strip('/'), 'w')
		f.write(content.replace('\r', ''))
		f.close()
	except Exception, e:
		return str(e)
	
	return resources.ok
