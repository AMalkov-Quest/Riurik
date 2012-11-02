from django.shortcuts import render_to_response
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
import os, json
import libsearch
from logger import log
import serving

def search_view(request, path=None, search_pattern=None, as_json=False, global_search=True):
	path = request.GET.get('path', path)
	search_pattern = request.GET.get('search_pattern',search_pattern)
	as_json = request.GET.get('as_json', as_json)
	RequestHandler = serving.factory(request, path)
	#document_root = RequestHandler.get_document_root()
	if global_search:
		#path = contrib.get_virtual_root(path)
		#full_path = contrib.get_full_path(document_root, path)
		full_path = RequestHandler.get_document_root()
	else:
		full_path = RequestHandler.get_full_path()

	folder = full_path
	log.debug(locals())
	if os.path.isfile(full_path):
		folder = os.path.dirname(full_path)
		path = os.path.dirname( path )
	
	searches = libsearch.search(folder, path, search_pattern)

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
