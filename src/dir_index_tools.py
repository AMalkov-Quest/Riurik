import os, shutil
import settings, resources
from logger import log

def get_type(path):
	"""
	>>> get_type('C:\\\\none')
	'none'
	>>> get_type(os.path.dirname(__file__))
	'folder'
	>>> get_type(__file__)
	'test'
	>>> name = os.path.join(os.path.dirname(__file__), settings.TEST_CONTEXT_FILE_NAME)
	>>> f = open(name, 'w')
	>>> f.close()
	>>> get_type(os.path.dirname(__file__))
	'suite'
	>>> os.remove(name)
	"""
	if os.path.exists(path):
		if os.path.isdir(path):
			if os.path.exists( os.path.join(path, settings.TEST_CONTEXT_FILE_NAME) ):
				return 'suite'
			return 'folder'
		return 'test'
	return 'none'

def mkdir(path, name):
	try:
		fullpath = os.path.join(path, name)
		os.mkdir(fullpath)
	except Exception, e:
		return str(e)
	
	return resources.ok

def remove(path):
	try:
		fullpath = os.path.join(path)
		if os.path.isdir(fullpath):
			import shutil
			shutil.rmtree(fullpath)
		else:
			os.remove(fullpath)
	except Exception, e:
		return str(e)
	
	return resources.ok

def mksuite(path, name):
	try:
		fullpath = os.path.join(path, name)
		os.mkdir(fullpath)
		filename = os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME)
		f = open(filename, 'w')
		f.close()
	except Exception, e:
		return (False, str(e))
	
	return (True, os.path.join(name, settings.TEST_CONTEXT_FILE_NAME))

def template(name):
	content = ''
	try:
		file = os.path.join(os.path.dirname(__file__), name)
		f = open(file, 'r')
		content = f.read()
		f.close()
	except Exception, e:
		log.exception(e)
	
	return content

def mktest(path, name):
	return mkscript(path, name, 'template_test.txt')

def mkcontext(path, name):
	return mkscript(path, name, 'template_context.txt')

def mkscript(path, name, template_name=None):
	try:
		fullpath = os.path.join(path, name)
		f = open(fullpath, 'w')
		if template:
			f.write(template(template_name))
		f.close()
	except Exception, e:
		log.exception(e)
		return (False, str(e))
	
	return (True, name)

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
