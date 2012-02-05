# coding: utf-8
import os, re
import settings, virtual_paths
from logger import log
import socket

def parseURI(url):
	"""
	>>> parseURI('spb9914')
	('spb9914', '80')
	>>> import os, test
	>>> test.stub('socket.gethostname', returns='spb9914')
	>>> parseURI('localhost:8000')
	('spb9914', '8000')
	"""
	hostport = url.split(':')
	host = hostport[0] if hostport[0] != 'localhost' else socket.gethostname()
	return host, hostport[1] if len(hostport) > 1 else '80'

def patch_host_port(ctximpl, riurik_url):
	"""
	>>> ci = context_impl([])
	>>> patch_host_port(ci, 'spb9914:8000')
	>>> ci.get('host')
	'spb9914'
	>>> ci.get('port')
	'8000'
	>>> import os, test
	>>> test.stub('socket.gethostname', returns='google.ru')
	>>> ci = context_impl([('host', 'localhost'), ('port', '1')])
	>>> patch_host_port(ci, 'spb9914')
	>>> ci.get('host')
	'google.ru'
	"""
	if ctximpl.has('host') and ctximpl.has('port'):
		ctximpl.replace_if('host', socket.gethostname(), 'localhost')
	else:
		host, port = parseURI(riurik_url)
		ctximpl.add('host', host)
		ctximpl.add('port', port)

class context_impl():

	def __init__(self, items):
		self.items = items
		self.items_as_list = list(self.items)

	def has(self, key):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.has('host')
		True
		>>> ci.has('port')
		False
		"""
		return self.as_items().has_key(key)

	def check(self, key, value):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.check('host', 'host-1')
		True
		>>> ci.check('host', 'host-2')
		False
		>>> ci.check('port', '8000')
		False
		"""
		for i, v in self.items:
			if i == key and v == value:
				return True

		return False

	def replace(self, key, value):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.replace('host', 'host-2')
		>>> ci.as_tuple()
		(('host', 'host-2'),)

		"""
		self.remove(key)
		self.add(key, value)

	def replace_if(self, key, new_value, old_value):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.replace_if('port', '8000', '8001')
		>>> ci.as_tuple()
		(('host', 'host-1'),)
		>>> ci.replace_if('host', 'host-2', 'host-1')
		>>> ci.as_tuple()
		(('host', 'host-2'),)

		"""
		try:
			self.remove(key, old_value)
			self.add(key, new_value)
		except ValueError, e:
			log.error(e)

	def get(self, key):
		if self.has(key):
			return self.as_items()[key]

	def add(self, key, value):
		self.items_as_list.append((key, value))

	def remove(self, key, value=None):
		if not value:
			self.items_as_list = [item for item in self.items_as_list if item[0] != key]
		else:
			self.items_as_list.remove((key, value))

	def as_items(self):
		items = {}
		for item in self.items_as_list:
			items[item[0]] = item[1]

		return items

	def as_list(self):
		return self.items_as_list

	def as_tuple(self):
		return tuple(self.items_as_list)

def get_virtual_paths():
	"""
	>>> from minimock import mock
	>>> mock('reload')
	>>> virtual_paths.VIRTUAL_PATHS = {'key': 'value'}
	>>> get_virtual_paths() #doctest: +ELLIPSIS
	Called reload...
	...<module 'src.virtual_paths'...
	{'key': 'value'}
	"""
	reload(virtual_paths)
	return virtual_paths.VIRTUAL_PATHS

def target_is_remote(target, host):
	"""
	>>> target_is_remote('localhost:8080', 'spb:8080')
	False
	>>> target_is_remote('spb8080', 'localhost:8080')
	False
	>>> target_is_remote('spb123:8080', 'spb456:8080')
	True
	>>> target_is_remote('spb8080', 'spb:8080')
	True
	"""
	if not 'localhost' in target		\
		and not 'localhost' in host and	\
		host.lower() != target.lower():
		return True

	return False

def get_libraries(path, context):
	return get_libraries_impl(path, context.items(), context)

def get_libraries_impl(path, ctxitems, ctx):
	libraries = []

	libs = get_libraries_raw(ctxitems)
	root = get_document_root(path)
	log.info('libs are %s' % libs)
	if libs != None:
		for lib in libs:
			lib_path = get_lib_path_by_name(path, lib, ctx)
			if lib_path:
				libraries.append(lib_path)
		if not libraries:
			log.info('there are no precofigured libs to include, try defaults ...')
			libraries = libraries_default(path, ctx)

	import coffeescript
	def patch_coffeescript_lib(lib):
		if re.search(r'\.coffee$', lib):
			root = get_document_root(lib)
			fullpath = get_full_path(root, lib)
			return coffeescript.compile(None, lib, fullpath)
		return lib
	libraries = map( patch_coffeescript_lib, libraries )
	
	return libraries

def loadListFromString(source):
	return [item.strip() for item in source.split(',')]

def get_libraries_raw(ctxitems):
	"""
	>>> get_libraries_raw([])
	[]
	>>> get_libraries_raw([('libraries', '[]')])

	>>> get_libraries_raw([('key', 'value')])
	[]
	>>> get_libraries_raw([('key', 'value'), ('libraries', 'lib1, lib2')])
	['lib1', 'lib2']
	"""
	for item in ctxitems:
		if item[0] == settings.LIB_KEY_NAME:
			if not '[]' in item[1]:
				return [lib.strip() for lib in item[1].split(',')]
			else:
				return None
	return []

def libraries_default(path, ctx):
	libraries = []
	root = get_document_root(path)
	virtual_root = get_virtual_root(path)
	lib_paths = get_global_context_lib_path(ctx)
	for lib_path in lib_paths:
		full_path = os.path.abspath(os.path.join(root, lib_path.strip()))
		for name in os.listdir(full_path):
			lib_path = os.path.abspath(os.path.join(full_path, name))
			lib_relpath = lib_path.replace(root, virtual_root).lstrip('/')
			libraries.append(str(lib_relpath))

	lib_relpath = get_local_lib_path(path, settings.LIB_DEFAULT_NAME, ctx)
	if lib_relpath:
		libraries.append(lib_relpath)

	return libraries

def convert_dict_values_strings_to_unicode(obj):
	"""
	>>> convert_dict_values_strings_to_unicode({'key1': u'Ё'})
	{'key1': '\\xc3\\x90\\xc2\\x81'}
	"""
	for key, val in obj.iteritems():
		if val.__class__.__name__ == 'unicode':
			obj[key] = val.encode('utf-8')
	return obj

def get_runner_url(context, riurik_url):
	"""
	returns url of the riurik runner to execute tests by host and port values in a context
	if these values in the context are empty it returns default value: url of the riurik server
	if host value is localhost it is replaced by resolved name
	if the use_local_runner option is defined in the context it returns url of the riurik server
	>>> get_runner_url({}, 'spb123:8000')
	'spb123:8000'
	>>> get_runner_url({'host': 'google.com', 'port': '22'}, 'localhost:8000')
	'google.com:22'
	>>> get_runner_url({'host': 'google.com', 'port': '22', 'use_local_runner': True}, 'spb123:8010')
	'spb123:8010'
	>>> from minimock import mock
	>>> import os
	>>> mock('socket.gethostname', returns='google.com')
	>>> get_runner_url({'host': 'localhost', 'port': '22'}, 'localhost:8000')
	Called socket.gethostname()
	'google.com:22'
	>>> get_runner_url({'port': '22'}, 'localhost:22')
	Called socket.gethostname()
	'google.com:22'
	"""
	def replace_localhost(url):
		return url.replace('localhost', socket.gethostname())

	use_local_runner = context.get('use_local_runner')
	remote_runner_url = get_runner_from_context(context)
	if use_local_runner or not remote_runner_url:
		target = riurik_url
	else:
		target = remote_runner_url

	return replace_localhost(target)

def get_runner_from_context(context):
	"""
	>>> get_runner_from_context({})

	>>> get_runner_from_context({'host': 'host-1'})

	>>> get_runner_from_context({'port': 'port-1'})

	>>> get_runner_from_context({'host': 'google.com', 'port': '22'})
	'google.com:22'
	"""
	host = context.get('host')
	port = context.get('port')
	if host and port:
		target = '%s:%s' % (host, port)
	else:
		target = None

	return target

def get_virtual_root(path):
	"""
	>>> import test
	>>> test.stub('get_virtual_paths', returns={'some-key': 'some-value'})
	>>> get_virtual_root('/some-key/test-1')
	'some-key'
	"""
	if path:
		key = path.strip('/').split('/')[0]
		if key and key in get_virtual_paths():
			return key

def get_document_root(path):
	"""
	>>> import test
	>>> test.stub('get_virtual_paths', returns={'some-key': 'some-value'})
	>>> get_document_root('/some-key/test-1')
	'some-value'
	>>> get_document_root('some-key')
	'some-value'
	>>> get_document_root('')
	''
	>>> get_document_root('/')
	'/'
	"""
	if path:
		reload(virtual_paths)
		key = path.strip('/').split('/')[0]
		vpaths = get_virtual_paths()
		if key and key in vpaths:
			return vpaths[key]

	return path

def get_full_path(document_root, path):
	"""
	>>> import test
	>>> test.stub('get_virtual_paths', returns={'tests-1': 'C:\\dir-1'})
	>>> settings.VIRTUAL_PATHS['tests-1'] = 'C:\\dir-1'
	>>> get_full_path('/dir/dir-1', '')
	'/dir/dir-1'
	>>> get_full_path('/dir/dir-1', '/')
	'/dir/dir-1'
	>>> get_full_path('C:/dir-1/tests', '/tests-1/')
	'C:/dir-1/tests'
	>>> get_full_path('C:/dir-1/tests-1', '/tests-1/first/test')
	'C:/dir-1/tests-1/first/test'
	>>> get_full_path('C:/dir-1/tests-1', '\\\\tests-1/first\\\\test')
	'C:/dir-1/tests-1/first/test'
	"""
	log.debug('get full path %s %s' % (document_root, path))
	newpath = get_relative_clean_path(path)
	return os.path.normpath(os.path.join(document_root, newpath))

def get_relative_clean_path(path):
	"""
	removes virtal folder from path
	>>> import test
	>>> test.stub('get_virtual_paths', returns={'tests-1': '/src/tests/cases'})
	>>> get_relative_clean_path('tests-1/main/case-1')
	'main/case-1'
	>>> get_relative_clean_path('tests-1/main/')
	'main'
	>>> get_relative_clean_path('/')
	''
	>>> get_relative_clean_path('')
	''
	>>> get_relative_clean_path('main/case-1')
	''
	"""
	if path:
		parts = path.replace('\\', '/').strip('/').split('/', 1)
		if parts[0] in get_virtual_paths():
			if len(parts) > 1:
				return parts[1].strip('/')
	return ''

def get_global_context_lib_path(ctx):
	"""
	>>> ctx = {'LIBRARY_PATH': 'path1, path2, path3'}
	>>> get_global_context_lib_path(ctx)
	['path1', 'path2', 'path3']
	"""
	path = ctx.get( 'LIBRARY_PATH' )
	return get_list_value_from_context(path)

def get_context_tools_folders(ctx):
	"""
	>>> ctx = {'TOOLS_FOLDERS': 'path1, path2, path3'}
	>>> get_context_tools_folders(ctx)
	['path1', 'path2', 'path3']
	"""
	folders = ctx.get( 'TOOLS_FOLDERS' )
	return get_list_value_from_context(folders)

def get_list_value_from_context(value):
	"""
	>>> ctx = {}
	>>> get_list_value_from_context(ctx)
	[]
	"""
	if value:
		return [value.strip() for value in value.split(',')]

	return []

def get_local_lib_path(path, lib_name, ctx):
	root = get_document_root(path)
	virtual_root = get_virtual_root(path)
	current_suite_path = os.path.abspath(os.path.join(ctx.get_folder(), lib_name))
	if os.path.exists(current_suite_path):
		log.info('%s lib is located in current suite folder' % lib_name)
		return str(current_suite_path.replace(root, virtual_root).lstrip('/'))

	return ''

def get_lib_path_by_name(path, lib, ctx):
	root = get_document_root(path)
	virtual_root = get_virtual_root(path)
	full_path = os.path.abspath(os.path.join(root, lib))
	lib_relpath = ''
	if not os.path.exists(full_path):
		lib_relpath = get_local_lib_path(path, lib, ctx)
		if not lib_relpath:
			for path in get_global_context_lib_path(ctx):
				global_libs_path = os.path.abspath(os.path.join(root, path.strip(), lib))
				if os.path.exists(global_libs_path):
					log.info('%s lib is located in the %s global library path' % (lib, path))
					lib_relpath = global_libs_path.replace(root, virtual_root)
					break

			if not lib_relpath:
				log.error('%s lib is not found in any available library paths' % lib)
	else:
		lib_relpath = lib

	return str(lib_relpath.lstrip('\\').lstrip('/').replace('\\','/'))

def enum_suite_tests(target):
	tests = []
	for root, dirs, files in os.walk(target):
		for file_ in files:
			if re.match('^.*\.js$', file_) and not file_.startswith('.'):
				file_abspath = os.path.abspath(os.path.join(root, file_))
				file_relpath = file_abspath.replace(os.path.abspath(target), '').lstrip('/').lstrip('\\')
				tests += [ str(file_relpath) ]

	return tests

def enum_files_in_folders(target, skip=(lambda file_: file_.startswith('.'))):
	all_files = []
	for root, dirs, files in os.walk(target):
		for file_ in files:
			if not skip(file_):
				file_abspath = os.path.abspath(os.path.join(root, file_))
				file_relpath = file_abspath.replace(os.path.abspath(target), '').lstrip('/').lstrip('\\')
				all_files += [ str(file_relpath) ]

	return all_files

def patch_fullpaths(fullpath, newpath=''):
	reload(virtual_paths)
	for key in virtual_paths.VIRTUAL_URLS:
		m = re.search('^%s(.*)$' % key, newpath)
		if m:
			fullpath = virtual_paths.VIRTUAL_URLS[key] + m.group(1)
			return fullpath

	return fullpath

def getHostByName(host, cache):
	r = socket.gethostbyname(host)
	cache.set(host, r)
	return r

def resolveRemoteAddr(host, cache):
	addr =  cache.get(host, None)
	if not addr:
		addr = getHostByName(host, cache)
		log.info('%s addr is resolved: %s' % (str(host), str(addr)))
	else:
		log.info('%s addr is got from cach: %s' % (str(host), str(addr)))

	return addr

def normpath(path):
	return path.replace('\\', '/')

def localhost(host):
	return host == 'localhost' or host == socket.gethostname()
