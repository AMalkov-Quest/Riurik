import os, re
from django import template
from django.utils.safestring import mark_safe
import settings

register = template.Library()

@register.filter
def kind_tests(p):
	if settings.STATIC_TESTS_ROOT == settings.STATIC_INNER_TESTS_ROOT:
		return 'Outer'
	else:
		return 'Inner'

@register.filter
def strip(s, chars):
	return s.strip(chars)

@register.filter
def dir_index_type(path, fsobject):
	if path == '/':
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, fsobject)
	else:
		fullpath = os.path.join(settings.STATIC_TESTS_ROOT, path, fsobject)
	
	if os.path.isdir(fullpath):
		if os.path.exists( os.path.join(fullpath, settings.TEST_CONTEXT_FILE_NAME) ):
			return 'suite'
		return 'folder'
	return 'test'

@register.filter
def above(path):
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

@register.filter
def current(path):
	if path.rstrip('/').find('/') == -1:
		return path.rstrip('/')
	return path.rstrip('/').rsplit('/', 1)[1]

@register.filter
def breadcrumbs(path):
	html = '<a href="/">/</a>&nbsp;'
	if settings.STATIC_TESTS_URL:
		root = '/' + settings.STATIC_TESTS_URL + '/'
	else:
		root = '/'
	
	lastpath = root
	i = 0
	crumbs = path.split('/')
	for p in crumbs:
		i += 1
		if p:
			lastpath += p 
			lastpath += '/'
			html += '<a href="%s">%s</a>&nbsp;/&nbsp;' % ( lastpath, p )
			
	if not path == '/':
		html += '<a style="text-decoration: none;" href="%s%s">...</a>' % (root, above(path))
	return mark_safe(html)

@register.filter
def breadcrumbs_file(path):
	html = '<a href="/">/</a>&nbsp;'
	lastpath = '/'
	i = 0
	path = path.split('/')
	for p in path:
		i += 1
		if p:
			lastpath += p 
			if i < len(path): 
				lastpath += '/'
				html += '<a href="%s">%s</a>&nbsp;/&nbsp;' % ( lastpath, p )
			else:
				html += '<a href="%s">%s</a>' % ( lastpath, p )
	return mark_safe(html)
