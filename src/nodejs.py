from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpRequest, HttpResponseServerError
import os, shlex, subprocess, platform
import json
from src.logger import log
import src.settings, src.contrib

def run(request):
    specs = request.POST["specs"]
    steps = request.POST["steps"]
    log.debug('nodejs run %s' %  specs)
    
    document_root = src.contrib.get_document_root(specs)
    fullSpecsPath = src.contrib.get_full_path(document_root, specs)
    fullStepsPath = src.contrib.get_full_path(document_root, steps)
    testsResults = src.settings.root + "\\testsResult"
    result = execute(fullSpecsPath, fullStepsPath, testsResults)
    result = get_results(fullSpecsPath, testsResults)
    
    data = {}
    data['result'] = result
    response = HttpResponse(mimetype='text/json')
    response.write(json.dumps(data))

    return response

def execute(specs, steps, testsResults):
    try:
        args = "%s --specs %s --steps  %s --output-dir %s" % (src.settings.DASPEC_EXECUTABLE, specs, steps, testsResults)
        log.debug('run %s' %  args)
        p = subprocess.Popen(args, shell=True)
        result = p.communicate()
        
    except Exception, e:
        log.exception(e)
        raise Exception("Can't execute daspec: %s" % src.settings.DASPEC_EXECUTABLE)
    
def get_results(spec, testsResults):
    resultPath = spec.replace("C:", testsResults)
    log.debug("result file is %s" % resultPath)
    return open(resultPath).read()