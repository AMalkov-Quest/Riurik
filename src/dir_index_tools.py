import os, shutil
import settings, resources
from logger import log

def getWorkingDir():
	return settings.STATIC_TESTS_ROOT

def mkdir(path, name):
	try:
		fullpath = os.path.join(getWorkingDir(), path.strip('/'), name)
		os.mkdir(fullpath)
	except Exception, e:
		return str(e)
	
	return resources.ok

def remove(path):
	try:
		fullpath = os.path.join(getWorkingDir(), path.strip('/'))
		if os.path.isdir(fullpath):
			import shutil
			shutil.rmtree(fullpath)
		else:
			os.remove(fullpath)
	except Exception, e:
		print e
		return str(e)
	
	return resources.ok

def mksuite(path, name):
	try:
		fullpath = os.path.join(getWorkingDir(), path.strip('/'), name)
		os.mkdir(fullpath)
		filename = os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME)
		f = open(filename, 'w')
		f.close()
	except Exception, e:
		return (False, str(e))
	
	return (True, os.path.join(name, settings.TEST_CONTEXT_FILE_NAME))

def mktest(path, name):
	try:
		#filename = os.path.join(name + settings.TEST_FILE_EXT)
		filename = os.path.join(name)
		fullpath = os.path.join(getWorkingDir(), path.strip('/'), filename)
		f = open(fullpath, 'w')
		f.close()
	except Exception, e:
		return (False, str(e))
	
	return (True, filename)

def savetmptest(content, fullpath):
	try:
		if not os.path.exists(os.path.dirname(fullpath)):
			os.makedirs(os.path.dirname(fullpath))

		dir, file_name = os.path.split(fullpath)
		swp_file_name = settings.TEST_SWAP_FILE_NAME % file_name 
		swpname = os.path.join(dir, swp_file_name) 

		f = open(swpname, 'w')
		
		try:
			content = content.decode('utf-8')
		except:
			try:
				content = content.decode('cp1251')
			except:
				try:
					content = content.decode('cp1252')
				except:
					try:
						content = content.decode('koi8-r')
					except:
						try:
							content = content.decode('ascii')
						except:
							pass
		try:
			content = content.replace('\r', '')
		except:
			pass
		f.write(content.encode('utf-8'))
		f.close()
		log.debug('swp saved to %s' % swpname)
		return swpname
	except Exception, e:
		log.debug(str(e))
		#return str(e)
	return False
	
def savetest(content, fullpath):
	try:
		swpname = savetmptest(content, fullpath)
		if swpname:
			with open(swpname,'rb') as source:
				with open(fullpath, 'wb') as dest:
					dest.write(source.read())
					dest.close()
				source.close()
		else:
			raise Exception('Can\'t presave')
	except Exception, e:
		log.error(e)
	
	return resources.ok

def gettest(path):
	try:
		f = open(path, 'r')
		content = f.read()
		f.close()
	except Exception, e:
		return str(e)
	
	return content
