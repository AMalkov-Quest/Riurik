import os
import contrib
from logger import log
import dir_index_tools as tools
import urllib, urllib2

def auth(url, ctx):
	login = ctx.get('login')
	password = ctx.get('password')
	empty_proxy_handler = urllib2.ProxyHandler({})
	if login and password:
		from ntlm import HTTPNtlmAuthHandler

		passman = urllib2.HTTPPasswordMgrWithDefaultRealm()
		passman.add_password(None, url, login, password)
		auth_NTLM = HTTPNtlmAuthHandler.HTTPNtlmAuthHandler(passman)
		opener = urllib2.build_opener(auth_NTLM, empty_proxy_handler)
	else:
		opener = urllib2.build_opener(empty_proxy_handler)

	urllib2.install_opener(opener)


def makeSaveContentPost(content, path):
	data = {
		'content': content,
		'path': path
	}
	return contrib.convert_dict_values_strings_to_unicode(data)


def sendContentToRemote(path, content, url, ctx):
	data = makeSaveContentPost(content, path)
	auth(url, ctx)
	post = urllib.urlencode(data)
	req = urllib2.Request(url, post)
	try:
		return  urllib2.urlopen(req).read()
	except urllib2.URLError, e:
		if hasattr(e, 'reason'):
			raise urllib2.URLError('%s %s' % (e.reason, url))
		raise

def uploadContentToRemote(url, fullpath, path, ctx):
	log.debug('upload content %s', fullpath)
	content = tools.gettest(fullpath)
	return sendContentToRemote(path, content, url, ctx)


def saveToolsAllScripts(url, document_root, virtual_root, ctx):
	tools_dirs = contrib.get_context_tools_folders(ctx)
	for tools_dir in tools_dirs:
		log.info('save tools folder: %s' % tools_dir)
		virtual_path = os.path.join(virtual_root, tools_dir)
		tools_dir_fullpath = contrib.get_full_path(document_root, virtual_path)
		files = contrib.enum_files_in_folders(tools_dir_fullpath)
		uploadFolderToRemote(files, virtual_path, document_root, ctx, url, 'tools script')

def uploadFolderToRemote(folder_content, virtual_path, document_root, ctx, url, name):
	for file_ in folder_content:
		file_path = os.path.join(virtual_path, file_)
		rel_path = contrib.get_relative_clean_path(file_path)
		fullpath = contrib.get_full_path(document_root, file_path)
		result = uploadContentToRemote(url, fullpath, rel_path, ctx)
		log.info("%s %s is saved: %s" % (name, file_path, result))

def saveAllLibraries(document_root, virtual_root, url, path, ctx):
	for lib in contrib.get_libraries(path, ctx):
		lib_relpath = contrib.get_lib_path_by_name(document_root, lib, ctx)
		if lib_relpath:
			lib_path = os.path.join(virtual_root, lib_relpath)
			fullpath = contrib.get_full_path(document_root, lib_path)
			result = uploadContentToRemote(url, fullpath, lib_relpath, ctx)
			log.info("library %s is saved: %s" % (lib_relpath, result))


def saveTestSatelliteScripts(url, path, ctx):
	"""
	uploads all scripts those test or suite depends on
	to remote server from the context
	"""
	document_root = contrib.get_document_root(path)
	virtual_root = contrib.get_virtual_root(path)
	log.info('save satellite scripts for: %s' % path)

	saveAllLibraries(document_root, virtual_root, url, path, ctx)
	saveToolsAllScripts(url, document_root, virtual_root, ctx)


def saveSuiteAllTests(url, path, ctx):
	document_root = contrib.get_document_root(path)
	tests = contrib.enum_suite_tests( contrib.get_full_path(document_root, path) )
	log.info('save suite tests for: %s' % path)
	uploadFolderToRemote(tests, path, document_root, ctx, url, 'test')

