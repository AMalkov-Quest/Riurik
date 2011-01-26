import os
from django import template
import settings

register = template.Library()

@register.filter
def img_by_fstype(path, fsobject):
	if path == '/':
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, fsobject)
	else:
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, path, fsobject)
	
	if os.path.isdir(fullpath):
		if os.path.exists( os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME) ):
			return 'fssuite'
		return 'fsfolder'
	return 'fstest'