from django import template
#from django.utils.safestring import mark_safe

register = template.Library()

@register.filter
def aggregate_results(listitems, attr):
	value = 0
	for item in listitems:
		value += int(item.get(attr))
	return value
