from django.shortcuts import render_to_response
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
import os, json
import libsearch
from src.logger import log
import serving

def search_view(request, path=None, search_pattern=None, as_json=False, global_search=True):
	path = request.GET.get('path', path)
	search_pattern = request.GET.get('search_pattern', search_pattern)
	global_search = bool(request.GET.get('global_search', True))
	log.debug('global_search %s' % global_search)
	as_json = request.GET.get('as_json', as_json)
	RequestHandler = serving.factory(request, path)
	if global_search:
		full_path = RequestHandler.get_document_root()
		path = RequestHandler.get_virtual_root()
	else:
		#this code is not used and tested
		full_path = RequestHandler.get_full_path()

	root = full_path
	if os.path.isfile(full_path):
		root = os.path.dirname(full_path)
		path = os.path.dirname( path )
	
	searches = libsearch.search(root, path, search_pattern)

	for filepath, search in searches.items():
		_search = []
		for lines in search:
			_search += [ map( lambda d: { 'lineno': d[0], 'line': d[1], 'hightlight': d[2] }, lines ) ]
		searches[filepath] = _search

	if as_json:
		return HttpResponse(json.dumps( searches ))

	return render_to_response(
		'search/search_results.html',
		{ 'searches': searches, 'search_pattern': search_pattern, 'search_folder': path },
		context_instance=RequestContext(request)
	)
