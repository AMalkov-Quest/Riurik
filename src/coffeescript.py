import os, shlex, subprocess
import dir_index_tools

COFFEESCRIPT_EXECUTABLE = r'C:\\CoffeeScript\\coffee.bat'

def coffee2js(path):
	file_name = path.rsplit('/', 1)[1]
	return (file_name, '.%s' % file_name.replace('.coffee', '.js'))

def compile(source, path, full_path):

	args = shlex.split("%s -c -b -s -p" % COFFEESCRIPT_EXECUTABLE)

	p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
	out, errors = p.communicate(source.encode("utf-8"))

	coffee_name, js_name = coffee2js(path)
	full_path = full_path.replace(coffee_name, js_name)
	if os.path.exists(full_path):
		os.remove(full_path)
	
	if out:
		dir_index_tools.savetest(out.decode("utf-8"), full_path)
	
	#return errors
	return path.replace(coffee_name, js_name)
