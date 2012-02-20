import os, shlex, subprocess, platform
import settings, dir_index_tools
from logger import log

ext = '.coffee'

def coffee2js(path):
	"""
	>>> coffee2js('test.coffee')
	('test.coffee', '.test.js')
	"""
	file_name = os.path.basename(path)
	return (file_name, '.%s' % file_name.replace(ext, '.js'))

def execute(source, full_path):
	if not settings.COFFEESCRIPT_EXECUTABLE:
		raise Exception("Unsupported platform: %s. Can't compile CoffeeScript" % platform.system())	

	try:
		args = shlex.split("%s -c -b -s -p" % settings.COFFEESCRIPT_EXECUTABLE)
		p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
		return p.communicate(source.encode("utf-8"))
	except Exception, e:
		log.exception(e)
		raise Exception("Can't execute CoffeeScript compiler: %s" % settings.COFFEESCRIPT_EXECUTABLE)
        
def save(full_path, path, out):
	coffee_name, js_name = coffee2js(full_path)
	full_path = full_path.replace(coffee_name, js_name)
	if os.path.exists(full_path):
		os.remove(full_path)

	if out:
		dir_index_tools.savetest(out.decode("utf-8"), full_path)

	return path.replace(coffee_name, js_name) if path else None

def compile(source, path, full_path):
	if not source:
		source = dir_index_tools.gettest(full_path)
	out, errors = execute(source, full_path)
	return save(full_path, path, out)
        
