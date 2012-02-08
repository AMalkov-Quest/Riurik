import os
import settings
import dir_index_tools as tools

def get_url(path):
	fullpath = os.path.join(path, settings.SPEC_URL_FILE_NAME)
	if os.path.exists(fullpath):
		return tools.gettest(fullpath)