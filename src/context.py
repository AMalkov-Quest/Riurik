import os, re
from logger import log
import settings, config, contrib
from django.template import Context, Template
import socket
from django.core.cache import cache

def host(instance, resolve=True):
	key = 'host'
	if resolve:
		return contrib.resolveRemoteAddr(instance.get(key), cache)
	return instance.get(key)

def get(name, section='default'):
	return context(name, section)

def get_URL(instance, resolve=False):
	url = instance.get('url')
	if not url:
		host = instance.get('host')
		if host == 'localhost':
			host = socket.gethostname()
		if resolve:
			host = contrib.resolveRemoteAddr(host, cache)
		url =  'http://%s:%s' % (host, instance.get('port'))
	return url

def render(path, ctx, riurik_url):
	ctxitems = patch(path, ctx, riurik_url)
	t = Template("""{% load json_tags %}
		var context = {
			{% for option in options %}
				{{ option.0 }}: {{ option.1|tojson }}{% if not forloop.last %},{% endif %}
			{% endfor %}
		};
	""")
	c = Context()
	c['options'] = []
	for name, value in ctxitems:
		c['options'] += [ (name, value,), ]
	return t.render(c)

def render_ini(path, ctx, riurik_url, section_name='default'):
	ctxitems = patch(path, ctx, riurik_url)
	t = Template("""{% load json_tags %}
[{{ section }}]
{% for option in options %}{{ option.0 }} = {{ option.1|tojson }}{% if option.2 %} ; {{ option.2 }}{% endif %}
{% endfor %}""")
	c = Context()
	c['section'] = section_name
	c['options'] = []
	for name, value in ctxitems:
		c['options'] += [ (name, value, hasattr(value, 'comment')), ]
	return t.render(c)

def patch_libraries(path, ctximpl, ctx):
	libraries = contrib.get_libraries_impl(path, ctximpl.as_list(), ctx)
	log.info('libs are %s' % libraries)
	if libraries != None:
		ctximpl.replace(settings.LIB_KEY_NAME, str(libraries).replace('\'','\"'))

def add_start_time(ctximpl):
	import time
	now = time.localtime(time.time())
	ctximpl.add('test_start_time', time.mktime(now))

def patch(path, ctx, riurik_url):
	ctximpl = contrib.context_impl(ctx.items())
	if not ctximpl.has(settings.INCLUDE_KEY):
		exclude = []
		if ctximpl.has(settings.EXCLUDE_KEY):
			exclude = contrib.loadListFromString(ctx.get( option=settings.EXCLUDE_KEY ))
		include = []
		for root, dirs, files in os.walk(ctx.get_folder()):
			for file_ in files:
				if re.match('^.*\.js$', file_):
					if file_ in exclude or settings.TEST_CONTEXT_JS_FILE_NAME in file_:
						continue
					file_abspath = os.path.abspath(os.path.join(root, file_))
					file_relpath = file_abspath.replace(os.path.abspath(ctx.get_folder()), '').lstrip('/').lstrip('\\')
					include += [ str(file_relpath) ]
	else:
		include = contrib.loadListFromString(ctx.get( option=settings.INCLUDE_KEY ))

	ctximpl.replace(settings.INCLUDE_KEY, str(include).replace('\'','\"'))

	patch_libraries(path, ctximpl, ctx)
	add_start_time(ctximpl)
	contrib.patch_host_port(ctximpl, riurik_url)

	return ctximpl.as_tuple()

class global_settings(object):
	comment = 'from global settings'

	def __init__(self, path, section='DEFAULT'):
		log.debug('initing global_settings by from %s, section:%s' % (path, section))
		self.inifile = None
		for virtpath in settings.VIRTUAL_PATHS.values():
			if virtpath in path:
				self.inifile = os.path.join(virtpath, '.settings.ini')
		self.section = section

	def get(self, option, default=None):
		value = config.get(self.inifile, self.section, option)
		log.debug('get context option: %s=%s from %s' % (option, value, self.inifile))
		if not value:
			value = default

		return value

	def set(self, option, value):
		config.set(self.inifile, self.section, option, value)
		log.debug('set context option: %s=%s' % (option, value))

	def items(self, vars_=None):
		log.debug('context get items: %s, section: %s' % (self.inifile, self.section))
		return config.items(self.inifile, self.section, vars_)

	def __patch_values(self, vals):
		if vals:
			for k, v in vals:
				yield k, v, self.comment

	def sections(self):
		log.debug('reading sections: %s' % config.sections(self.inifile))
		return config.sections(self.inifile)

	def get_folder(self):
		return os.path.dirname(self.inifile)

class context(global_settings):
	comment = 'context.ini'

	def __init__(self, test, section='DEFAULT'):
		if os.path.isdir(test):
			self.inifile = os.path.join(test, settings.TEST_CONTEXT_FILE_NAME)
		else:
			self.inifile = os.path.join(os.path.dirname(test), settings.TEST_CONTEXT_FILE_NAME)
		self.section = section
		log.debug('context: %s, section: %s, test: %s' % (self.inifile, self.section, test))

	def	get(self, option, default=None):
		value = super(context, self).get(option, default=None)
		if not value:
			value = global_settings(self.inifile, self.section).get(option, default=None)
		if not value:
			value = global_settings(self.inifile).get(option, default=None)
		if not value:
			value = default
		return value

	def libraries(self, values):
		gs = global_settings(self.inifile).items() or {}
		for item in gs:
			if item[0] == settings.LIB_KEY_NAME:
				glibs = item[1]
				llibs = values[settings.LIB_KEY_NAME]
				if glibs != llibs:
					libs = { settings.LIB_KEY_NAME: ','.join([glibs, llibs]) }
					values.update(libs)

	def items(self):
		values = {}
		values.update( global_settings(self.inifile).items() or {} )
		values.update( global_settings(self.inifile, self.section).items() or {} )
		values.update( super(context, self).items(values) or {} )
		self.libraries(values)
		return values.items()
