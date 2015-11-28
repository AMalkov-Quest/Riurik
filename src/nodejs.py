from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpRequest, HttpResponseServerError
import json
from logger import log

def run(request):
    specs = request.POST["specs"]
    log.debug('nodejs run %s' %  specs)
    result = {}
    result['result'] = 'OK'
    response = HttpResponse(mimetype='text/json')
    response.write(json.dumps(result))

    return response