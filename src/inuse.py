import datetime
from django.core.cache import cache
from django.http import HttpResponse

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

	if cache_session_key == session_key:
		request.session[path] = session_key
		cache.set(path, (session_key, cache_request_control) , 60)
		return cache_request_control
	if cache.add(path, (session_key, cache_request_control), 60):
		request.session[path] = session_key
	return cache_request_control

def stubFile(request):
	request_control = stub(request.GET['path'], request)
	return HttpResponse(str(request_control))

def getControl(request):
	path = request.GET['path']
	cache_value = cache.get(path)
	session_key = request.session.get('stub_key') or None
	if cache_value:
		try:
			cache_session_key = cache_value[0]
			cache_request_control = cache_value[1]
		except:
			cache_session_key = None
			cache_request_control = False
		if cache_session_key != session_key:
			cache.set(path, (cache_session_key, True), 30)
		if 'cancel' in request.GET:
			cache.set(path, (cache_session_key, False), 60)
	return HttpResponse('')

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
