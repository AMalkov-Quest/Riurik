import os
from django import template
import settings

register = template.Library()

@register.filter
def prev_dir(path):
	'''
	parses given path and returns a path that is a parent folder to the given one
	given: dir1/dir2/dir3/
	returns:  dir1/dir2/
	given: dir1/
	returns:  empty string
	'''
	if path.rstrip('/').find('/') == -1:
		return ''
	
	return path.rstrip('/').rsplit('/', 1)[0] + '/'