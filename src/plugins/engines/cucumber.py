import os, shlex, subprocess, platform
import settings, dir_index_tools
from logger import log
import coffeescript, contrib

def removeEOL(text):
	lines = text.splitlines()
	return "\\n".join(lines)

def compileSuite(path, suite_path):
	features = contrib.enum_files_in_folders(
			suite_path,
			lambda file_: not file_.endswith(settings.CUCUMBER_FILE_EXT)
	)
	for feature in features:
		fullpath = contrib.testFullPath(suite_path, feature)
		log.debug('compile %s' % fullpath)
		compile2js(path, fullpath)

def compile(full_path):
	log.info('cucumber compile %s' % full_path)
	source = dir_index_tools.gettest(full_path)
	#log.info("Spec'''%s'''" % source)
	#return coffeescript.compile("Spec'''%s'''" % source, full_path)
	return "Spec('%s');" % removeEOL(source)

def cucumber2coffee(path):
	"""
	>>> cucumber2coffee('test.feature')
	('test.feature', 'test.coffee')
	"""
	file_name = os.path.basename(path)
	return (file_name, '%s' % file_name.replace(settings.CUCUMBER_FILE_EXT, settings.COFFEE_FILE_EXT))

def save(full_path, path, cucumber_source):
	cucumber_name, coffee_name = cucumber2coffee(full_path)
	coffee_full_path = full_path.replace(cucumber_name, coffee_name)
	coffeescript.compile2js(None, None, coffee_full_path)
	
	coffee_name, js_name = coffeescript.coffee2js(coffee_full_path)
	js_full_path = coffee_full_path.replace(coffee_name, js_name)
	if os.path.exists(js_full_path):
		js_source = dir_index_tools.gettest(js_full_path)
		os.remove(js_full_path)
		source = cucumber_source + '\n' + js_source
		dir_index_tools.savetest(source.decode("utf-8"), js_full_path)

		return path.replace(cucumber_name, js_name) if path else None

def compile2js(path, full_path):
	out = compile(full_path)
	return save(full_path, path, out)
