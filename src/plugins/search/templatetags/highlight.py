from django import template
from django.template.defaultfilters import stringfilter
from django.utils import safestring
register = template.Library()

@register.filter(name='highlight')
def highlight(value, arg):
	return safestring.mark_safe( value.replace(arg, '<span class="highlight">%s</span>' % arg) )

