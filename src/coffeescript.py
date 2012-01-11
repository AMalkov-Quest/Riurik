import shlex, subprocess
import dir_index_tools

COFFEESCRIPT_EXECUTABLE = 'coffee'

def compile(source, clean_path, full_path):

	args = shlex.split("%s -c -b -s -p" % COFFEESCRIPT_EXECUTABLE)

	p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
	out, errors = p.communicate(source.encode("utf-8"))

	full_path = full_path.replace('.coffee', '.js')

	if out:
		dir_index_tools.savetest(out.decode("utf-8"), full_path)
	elif errors:
		dir_index_tools.savetest(errors.decode("utf-8"), full_path)

	return clean_path.replace('.coffee', '.js')
