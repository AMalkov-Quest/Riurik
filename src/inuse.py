import datetime
from django.core.cache import cache
from django.http import HttpResponse
from logger import log

def is_stubbed(path, request):
    session_key = request.session.get('stub_key') or None
    cache_value = cache.get(path)
    if cache_value:
        try:
            cache_session_key = cache_value[0]
            cache_request_control = cache_value[1]
        except:
            cache_session_key = None
            cache_request_control = False

        return cache_session_key != session_key
    return False

def stub(path, request):
    if 'stub_key' in request.session:
        session_key = request.session['stub_key']
    else:
        request.session['stub_key'] = session_key = datetime.datetime.now()

    cache_value = cache.get(path)
    try:
        cache_session_key = cache_value[0]
        cache_request_control = cache_value[1]
    except:
        cache_session_key = None
        cache_request_control = False

    log.debug("StubControl: current: %s, cached: %s, request: %s" % (session_key,cache_session_key,cache_request_control))

    if cache_session_key == session_key:
        log.debug('This is my session, extend stub time')
        request.session[path] = session_key
        cache.set(path, (session_key, cache_request_control) , 60)
        return cache_request_control
    if cache.add(path, (session_key, cache_request_control), 60):
        log.debug('Accuire new session')
        request.session[path] = session_key
    log.debug('Not my session...')
    return cache_request_control

def getControl(request):
    path = request.GET['path']
    cache_value = cache.get(path)
    session_key = request.session.get('stub_key') or None
    log.debug('GetControl..')
    if cache_value:
        try:
            cache_session_key = cache_value[0]
            cache_request_control = cache_value[1]
        except:
            cache_session_key = None
            cache_request_control = False

        log.debug("GetControl: current: %s, cached: %s, request: %s, cancel requiest: %s" % (session_key,cache_session_key,cache_request_control,request.GET.get('cancel')))

        if cache_session_key != session_key:
            cache.set(path, (cache_session_key, True), 30)
        if 'cancel' in request.GET:
            cancel = request.GET.get('cancel')
            if cancel == 'cancelled':
                cache.set(path, (cache_session_key, False), 60)
            if cancel == 'accepted':
                cache.delete(path)
    else:
        log.debug('No session... will be mine')
        return HttpResponse('true')
    
    return HttpResponse(str(not cache_request_control).lower())

def getOpenedFiles(request, clean=False):
    '''
    returns all scripts those are currently opened in a browser
    '''
    files = []
    if not 'stub_key' in request.session:
        return files
    key = str(request.session['stub_key'])
    for i, v in request.session.items():
        if i != 'stub_key' and str(v) == key:
            files += [ i ]
            try:
                del request.session[i]
            except:
                pass
    return files
