from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpRequest, HttpResponseServerError
import os, shlex, subprocess, platform
import json
from src.logger import log
import src.settings, src.contrib

def run_daspec(request, testsResults):
    specs = request.POST["specs"]
    steps = request.POST["steps"]
    log.debug('nodejs run daspec %s' %  specs)
    
    document_root = src.contrib.get_document_root(specs)
    fullSpecsPath = src.contrib.get_full_path(document_root, specs)
    fullStepsPath = src.contrib.get_full_path(document_root, steps)
    
    execute_daspec(fullSpecsPath, fullStepsPath, testsResults)
    
    resultPath = fullSpecsPath.replace("C:", testsResults)
    result = get_results(resultPath)
    
    data = {}
    data['result'] = result
    response = HttpResponse(mimetype='text/json')
    response.write(json.dumps(data))

    return response

def run_edgejs(request, testsResults):
    script = request.POST["script"]
    log.debug('nodejs run edgejs %s' %  script)
    
    document_root = src.contrib.get_document_root(script)
    fullScriptPath = src.contrib.get_full_path(document_root, script)
    fullEdgejsPath = os.path.join(src.settings.working_dir, 'src\static\engines\edgejs\edge-web.js')
    testsResults = os.path.join(testsResults, script.strip('/'))
    
    execute_edge(fullScriptPath, fullEdgejsPath, testsResults)
    result = get_results(testsResults)
    
    data = {}
    data['result'] = result
    response = HttpResponse(mimetype='text/json')
    response.write(json.dumps(data))

    return response

def run(request):
    testsResults = os.path.join(src.settings.root, "testsResult")
    engine = request.POST["engine"]
    if engine == 'daspec':
        return run_daspec(request, testsResults)
    
    if engine == 'edgejs':
        return run_edgejs(request, testsResults)

def execute_daspec(specs, steps, testsResults):
    try:
        args = "%s --specs %s --steps  %s --output-dir %s" % (src.settings.DASPEC_EXECUTABLE, specs, steps, testsResults)
        log.debug('run %s' %  args)
        p = subprocess.Popen(args, shell=True, stdout=subprocess.PIPE)
        
        for line in p.stdout:
            log.debug(line)
    except Exception, e:
        log.exception(e)
        raise Exception("Can't execute daspec: %s" % src.settings.DASPEC_EXECUTABLE)
    
def execute_edge(script, engine, testsResults):
    try:
        args = '"%s" %s %s' % (src.settings.nodejs, engine, script)
        log.debug('run %s' %  args)
        p = subprocess.Popen(args, shell=True, stdout=subprocess.PIPE)
        
        if not os.path.exists(os.path.dirname(testsResults)):
            os.makedirs(os.path.dirname(testsResults))
        f = open(testsResults, 'w')
        for line in p.stdout:
            f.write(line)
        f.close()
    except Exception, e:
        log.exception(e)
        raise Exception("Can't execute edge: %s" % src.settings.nodejs)
    
def get_results(resultPath):
    log.debug("result file is %s" % resultPath)
    return open(resultPath).read()