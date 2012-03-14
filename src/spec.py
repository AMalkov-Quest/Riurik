import os
import settings
import config

def get_opt(path):
	"""
	>>> import os, test
	>>> test.stub('os.path.isfile', returns=False)
	>>> get_opt(r"/home/amalkov")
	('/home/amalkov', 'DEFAULT')
	>>> test.stub('os.path.isfile', returns=True)
	>>> get_opt(r"/home/amalkov/config.ini")
	('/home/amalkov', 'config')
	>>> test.restore() 
	"""
	if os.path.isfile(path):
		head, tail = os.path.split(path)
		root, ext = os.path.splitext(tail)
		return head, root
	else:
		return (path, 'DEFAULT')

def get_url(path):
	path, section = get_opt(path)
	fullpath = os.path.join(path, settings.SPEC_URL_FILE_NAME)

	if len(config.sections(fullpath)) > 1:
		urls = []
		result = {}
		for section in config.sections(fullpath):
			result['url'] = config.get(fullpath, section, 'url')
			result['title'] = config.get(fullpath, section, 'title')

		return result

	if os.path.exists(fullpath):
		return config.get(fullpath, section, 'url')
