import os, re
from django import template
from django.utils.safestring import mark_safe
import settings
import contrib
from logger import log
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
