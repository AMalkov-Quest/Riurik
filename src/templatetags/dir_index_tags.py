import os, re
from django import template
from django.utils.safestring import mark_safe
import settings
import contrib
from logger import log
import dir_index_tools

register = template.Library()

@register.filter
def strip(s, chars):
	return s.strip(chars)

@register.filter
def dir_index_type(path, fsobject):
	log.debug(path + fsobject)
	fullpath = contrib.get_fullpath(path + fsobject)
	log.debug(fullpath)
	return dir_index_tools.get_type(fullpath)

@register.filter
def make_url(val):
	return '/'.join(val.split('\\'))

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
	path = path.replace('\\', '/').rstrip('/')
	if path.find('/') == -1:
		return path
	return path.rsplit('/')[-1]

@register.filter
def breadcrumbs(path):
	path = path.replace('\\','/')
	html = '<a href="/">&#8226;</a>&nbsp;&nbsp;'
	if settings.STATIC_TESTS_URL:
		root = '/' + settings.STATIC_TESTS_URL + '/'
	else:
		root = '/'
	
	lastpath = root
	i = 1
	crumbs = path.split('/')
	for p in crumbs:
		i += 1
		if p:
			lastpath += p 
			lastpath += '/'
			if i < len(crumbs):
				html += '<a href="%s">%s</a>&nbsp;&nbsp;&#8227;&nbsp;&nbsp;' % ( lastpath, p )
			else:
				html += '%s&nbsp;&nbsp;' % ( p )
			
	if not path == '/':
		html += '<a href="%s%s"><img height="11" src="/static/img/up.png" /></a>' % (root, above(path))
	return mark_safe(html)

@register.filter
def breadcrumbs_file(path):
	path = path.replace('\\','/')
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
