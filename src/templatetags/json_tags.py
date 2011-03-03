import os, re
from django import template
from django.utils.safestring import mark_safe
import settings
import contrib
from logger import log
import simplejson
register = template.Library()

@register.filter
def json(input):
	log.debug(input)
	try:
		simplejson.loads(input)
		return mark_safe("%s" % input)
	except Exception, ex:
		pass
	return mark_safe("'%s'" % input)
