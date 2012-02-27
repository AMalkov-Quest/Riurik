import os
import settings
import dir_index_tools as tools

def get_url(path):
	if os.path.isfile(path):
		path = os.path.dirname(path)
	fullpath = os.path.join(path, settings.SPEC_URL_FILE_NAME)
	if os.path.exists(fullpath):
		content = tools.gettest(fullpath)
		return content.split('\n')[0]