import os, re
from django import template
from django.utils.safestring import mark_safe
import src.settings
import src.contrib
from src.src.logger import log
import src.src.dir_index_tools

register = template.Library()

@register.filter
def strip(s, chars):
	return s.strip(chars)

@register.filter
def make_int(s):
	return int(s)

@register.filter
def make_url(val):
	return re.sub('\/+', '/', '/'.join(val.split('\\')))

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
def breadcrumbs(path, pagetype):
	"""
	>>> breadcrumbs('', 'front-page')
	''
	>>> breadcrumbs('', 'virtual')
	''
	>>> breadcrumbs('/path1/', 'suite')
	'<a href="/">&#8226;</a>&nbsp;&nbsp;<a>path1</a>&nbsp;&nbsp;<a href="//"><img height="11" src="/static/img/up.png" /></a>'
	>>> breadcrumbs('/path1/path2', 'suite')
	'<a href="/">&#8226;</a>&nbsp;&nbsp;<a href="/path1/">path1</a>&nbsp;&nbsp;&#8227;&nbsp;&nbsp;<a>path2</a>&nbsp;&nbsp;<a href="//path1/"><img height="11" src="/static/img/up.png" /></a>'
	>>> breadcrumbs('/path1/test1.js', 'test')
	'<a href="/">&#8226;</a>&nbsp;&nbsp;<a href="/path1/">path1</a>&nbsp;&nbsp;&#8227;&nbsp;&nbsp;<a>test1.js</a>&nbsp;&nbsp;'
	"""
	path = path.replace('\\','/')
	head = '<a href="/">&#8226;</a>&nbsp;&nbsp;'
	html = head
	root = '/'
	lastpath = root
	i = 0
	crumbs = path.rstrip('/').split('/')
	for p in crumbs:
		i += 1
		if p:
			lastpath += p
			lastpath += '/'
			if i < len(crumbs):
				html += '<a href="%s">%s</a>&nbsp;&nbsp;&#8227;&nbsp;&nbsp;' % ( lastpath, p )
			else:
				html += '<a>%s</a>&nbsp;&nbsp;' % ( p )
			
	if html != head:
		if pagetype != 'test':
			html += '<a href="%s%s"><img height="11" src="/static/img/up.png" /></a>' % (root, above(path))
	else:
		html = ''
		
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
