import os
import settings
import dir_index_tools as tools
import config

def get_default(path):
	return config.get(path, 'DEFAULT', 'url')

def get_url(path):
	if os.path.isfile(path):
		path = os.path.dirname(path)
	fullpath = os.path.join(path, settings.SPEC_URL_FILE_NAME)

	if config.sections(fullpath) > 1:
		urls = []
		result = {}
		for section in config.sections(fullpath):
			result['url'] = config.get(fullpath, section, 'url')
			result['title'] = config.get(fullpath, section, 'title')

		return result

	if os.path.exists(fullpath):
		return config.get(fullpath, 'DEFAULT', 'url')
