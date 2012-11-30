from django import template
import time, datetime
import reporting

register = template.Library()

@register.filter
def aggregate_results(listitems, attr):
	value = 0
	for item in listitems:
		value += int(item.get(attr))
	return value

@register.filter
def date_from_str(string):
	return datetime.datetime.fromtimestamp(time.mktime(time.localtime(float(string))))
