from django import template
import time, datetime
#from django.utils.safestring import mark_safe

register = template.Library()

@register.filter
def aggregate_results(listitems, attr):
	value = 0
	for item in listitems:
		value += int(item.get(attr))
	return value

@register.filter
def date_from_str(string):
	return datetime.datetime.fromtimestamp(time.mktime( time.strptime(string, '%Y-%m-%d-%H-%M-%S') ))


