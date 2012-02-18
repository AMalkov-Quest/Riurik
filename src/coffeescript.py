import os, shlex, subprocess, platform
import settings, dir_index_tools

if platform.system() == 'Windows':
    COFFEESCRIPT_EXECUTABLE = settings.WIN_COFFEE_COMPILER
elif platform.system() == 'Linux':
    COFFEESCRIPT_EXECUTABLE = settings.POSIX_COFFEE_COMPILER
else:
    raise Exception("Unsupported platform: %s. Can't compile CoffeeScript" % platform.system())
    
ext = '.coffee'

def coffee2js(path):
    file_name = os.path.basename(path)
    return (file_name, '.%s' % file_name.replace(ext, '.js'))

def execute(source, full_path):
    try:
        args = shlex.split("%s -c -b -s -p" % COFFEESCRIPT_EXECUTABLE)
        p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        return p.communicate(source.encode("utf-8"))
    except Exception, e:
        raise Exception("Can't execute CoffeeScript compiler: %s" % COFFEESCRIPT_EXECUTABLE)
        
def save(full_path, path, out):
    coffee_name, js_name = coffee2js(full_path)
    full_path = full_path.replace(coffee_name, js_name)
    if os.path.exists(full_path):
            os.remove(full_path)

    if out:
            dir_index_tools.savetest(out.decode("utf-8"), full_path)

    #return errors
    return path.replace(coffee_name, js_name) if path else None

def compile(source, path, full_path):
    if not source:
        source = dir_index_tools.gettest(full_path)
    out, errors = execute(source, full_path)
    if not out:
        raise Exception('CoffeeScript compilation error ...')
    return save(full_path, path, out)
        