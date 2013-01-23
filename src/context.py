import os, re, json
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

def get(RequestHandler, path=None, section='default'):
	return context(RequestHandler, path, section)

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

def render(RequestHandler, ctx, riurik_url, ctxname):
	ctxitems = patch(RequestHandler, ctx, riurik_url, ctxname)
	t = Template("""{% load json_tags %}
		riurik.context = {
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

def render_ini(RequestHandler, ctx, riurik_url, section_name='default'):
	ctxitems = patch(RequestHandler, ctx, riurik_url)
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

def patch_libraries(RequestHandler, ctximpl, ctx):
	libraries = contrib.get_libraries_impl(RequestHandler, ctximpl.as_list(), ctx)
	log.info('libs are %s' % libraries)
	if libraries != None:
		ctximpl.replace(settings.LIB_KEY_NAME, json.dumps(libraries).replace('\'','\"'))

def add_start_time(ctximpl, start_time):
	ctximpl.add('test_start_time', start_time)

def add_name(ctximpl, name):
	if name:
		ctximpl.add('__name__', name)

def add_virtual_root(ctximpl, path):
	vroot = contrib.get_virtual_root(path)
	if vroot:
		ctximpl.add('__virtual_root__', vroot)

def include_tests(path, ctx, ctximpl):

	def contextjs(path):
		return settings.TEST_CONTEXT_JS_FILE_NAME in path

	def suite_setup(path):
		return settings.SUITE_SETUP_FILE_NAME in path

	if not ctximpl.has(settings.INCLUDE_KEY):
		exclude = []
		if ctximpl.has(settings.EXCLUDE_KEY):
			exclude = contrib.loadListFromString(ctx.get( option=settings.EXCLUDE_KEY ))
		include = []
		for root, dirs, files in os.walk(ctx.get_folder()):
			for file_ in files:
				if re.match('^.*\.js$', file_):
					if file_ in exclude or contextjs(file_):
						continue
					file_abspath = os.path.abspath(os.path.join(root, file_))
					file_relpath = file_abspath.replace(os.path.abspath(ctx.get_folder()), '').lstrip('/').lstrip('\\')

					if suite_setup(file_):
						patch_suite_setup(ctximpl, file_relpath)
						continue

					include += [ str(file_relpath) ]
	else:
		include = contrib.loadListFromString(ctx.get( option=settings.INCLUDE_KEY ))

	ctximpl.replace(settings.INCLUDE_KEY, str(include).replace('\'','\"'))

def patch_suite_setup(ctximpl, path):
	ctximpl.add(settings.SUITE_SETUP, path)

def patch(RequestHandler, ctx, riurik_url, ctxname=None):
	path = RequestHandler.get_path()
	ctximpl = contrib.context_impl(ctx.items())
	include_tests(path, ctx, ctximpl)
	patch_libraries(RequestHandler, ctximpl, ctx)
	add_start_time(ctximpl, RequestHandler.time)
	add_name(ctximpl, ctxname)
	add_virtual_root(ctximpl, path)
	contrib.patch_host_port(ctximpl, riurik_url)

	return ctximpl.as_tuple()

class global_settings(object):
	comment = 'from global settings'

	def __init__(self, RequestHandler, section=settings.DEFAULT):
		self.inifile = RequestHandler.get_global_context_path()
		self.section = section
		log.debug('read global settings from %s, section:%s' % (self.inifile, section))

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
		return config.sections(self.inifile) or [settings.DEFAULT]

	def get_folder(self):
		return os.path.dirname(self.inifile)

class context(global_settings):
	comment = 'context.ini'

	def __init__(self, RequestHandler, path, section=settings.DEFAULT):
		self.requestHandler = RequestHandler
		self.inifile = RequestHandler.get_context_path(path)
		if not os.path.exists(self.inifile):
			raise Exception('Context has not been created yet')
		self.section = section
		log.debug('context: %s, section: %s' % (self.inifile, self.section))

	def	get(self, option, default=None):
		value = super(context, self).get(option, default=None)
		if not value:
			value = global_settings(self.requestHandler, self.section).get(option, default=None)
		if not value:
			value = global_settings(self.requestHandler).get(option, default=None)
		if not value:
			value = default
		return value

	def libraries(self, values):
		gs = global_settings(self.requestHandler).items() or {}
		for item in gs:
			if item[0] == settings.LIB_KEY_NAME:
				glibs = item[1]
				llibs = values[settings.LIB_KEY_NAME]
				if glibs != llibs:
					libs = { settings.LIB_KEY_NAME: ','.join([glibs, llibs]) }
					values.update(libs)

	def items(self):
		values = {}
		values.update( global_settings(self.requestHandler).items() or {} )
		values.update( global_settings(self.requestHandler, self.section).items() or {} )
		values.update( super(context, self).items(values) or {} )
		self.libraries(values)
		return values.items()
