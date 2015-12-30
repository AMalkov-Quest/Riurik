import os, shlex, subprocess, platform
import src.settings, dir_index_tools
from logger import log

def coffee(path):
	file_name = os.path.basename(path)
	return file_name.endswith(src.settings.COFFEE_FILE_EXT)

def coffee2js(path):
	"""
	>>> coffee2js('test.coffee')
	('test.coffee', '.test.js')
	"""
	file_name = os.path.basename(path)
	return (file_name, '.%s' % file_name.replace(src.settings.COFFEE_FILE_EXT, src.settings.JS_FILE_EXT))

def execute(source):
	if not src.settings.COFFEESCRIPT_EXECUTABLE:
		raise Exception("Unsupported platform: %s. Can't compile CoffeeScript" % platform.system())

	try:
		args = shlex.split("%s -c -b -s -p" % src.settings.COFFEESCRIPT_EXECUTABLE)
		p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
		return p.communicate(source)
	except Exception, e:
		log.exception(e)
		raise Exception("Can't execute CoffeeScript compiler: %s" % src.settings.COFFEESCRIPT_EXECUTABLE)
        
def save(full_path, path, out):
	coffee_name, js_name = coffee2js(full_path)
	full_path = full_path.replace(coffee_name, js_name)
	if os.path.exists(full_path):
		os.remove(full_path)

	if out:
		dir_index_tools.savetest(out.decode("utf-8"), full_path)

	return path.replace(coffee_name, js_name) if path else None

def compile(source, full_path):
	log.info('coffeescript compile %s' % full_path)
	if not source:
		source = dir_index_tools.gettest(full_path)
	else:
		source = source.encode("utf-8")

	out, errors = execute(source)
	if not out:
		if errors:
			log.exception(errors)
		raise Exception('CoffeeScript compilation error ...')

	return out

def compile2js(source, path, full_path):
	out = compile(source, full_path)
	return save(full_path, path, out)
