import os, re
from django import template
from django.utils.safestring import mark_safe
import src.settings
import src.contrib
from src.logger import log
import json
register = template.Library()

@register.filter
def tojson(input):
	log.debug(input)
	try:
		json.loads(input)
		return mark_safe("%s" % input)
	except Exception, ex:
		pass
	return mark_safe("\"%s\"" % input)

@register.filter
def unqoute(input):
	import urllib
	return mark_safe(urllib.unquote(input))