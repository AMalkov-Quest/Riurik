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
		f = open(settings.STATIC_TESTS_ROOT + '/' + path.strip('/') + '/' + 'context.txt', 'w')
		f.close()
	except Exception, e:
		return str(e)
	
	return resources.ok

def mktest(path):
	try:
		f = open(settings.STATIC_TESTS_ROOT + '/' + path.strip('/') + '.js', 'w')
		f.close()
	except Exception, e:
		return str(e)
	
	return resources.ok

def savetest(content, path):
	try:
		f = open(settings.STATIC_TESTS_ROOT + '/' + path.strip('/'), 'w')
		f.write(content.replace('\r', ''))
		f.close()
	except Exception, e:
		return str(e)
	
	return resources.ok
