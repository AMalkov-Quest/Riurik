import os, re
from django import template
from django.utils.safestring import mark_safe
import settings

register = template.Library()

@register.filter
def prev_dir(path):
    m = re.match('^(.*/).*?/$', path)
    if m:
        return m.group(1)
    m = re.match('^(.*/).*?$', path)
    if m:
        return m.group(1)
	return path

@register.filter
def breadcrumbs(path):
    html = '<a href="/">/</a>&nbsp;'
    lastpath = '/' + settings.STATIC_TESTS_URL
    i = 0
    path = path.split('/')
    for p in path:
        i += 1
        if p:
            lastpath += p 
            lastpath += '/'
            html += '<a href="%s">%s</a>&nbsp;/&nbsp;' % ( lastpath, p )
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

