import os
from django import template
import settings

register = template.Library()

@register.filter
def prev_dir(path):
	return path