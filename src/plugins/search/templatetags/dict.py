from django import template
from django.template.defaultfilters import stringfilter
from django.utils import safestring
register = template.Library()

@register.filter(name='dict_get')
def dict_get(value, arg):
	if not isinstance(value, dict):
		return 'Not a dict'
	return value.get(arg, 'KeyError')
