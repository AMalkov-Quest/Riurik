from django.shortcuts import render_to_response
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
import os, simplejson as json
import libsearch
import contrib

def search_view_ext(request, path=None, search_pattern=None, as_json=False):
	path = request.GET.get('path', path)
	search_pattern = request.GET.get('search_pattern',search_pattern)
	as_json = request.GET.get('as_json', as_json)
	document_root = contrib.get_document_root(path)
	full_path = contrib.get_full_path(document_root, path)
	folders = [ full_path ]
	if os.path.isfile(full_path):
		folders = [ os.path.dirname(full_path) ]
		path = os.path.dirname( path )
	return search_view(request, folders, path, search_pattern, as_json)


def search_view(request, folders, url, search_pattern, as_json=False):
	if not isinstance( folders, list ): folders = [ folders ]
	folder = folders[0]
	searches = {}
	for filepath in libsearch.iter_files(folders):
		res = libsearch.search_in_file( filepath,  search_pattern)
		if not res: continue
		filepath = filepath.replace(folder, url).replace('\\', '/').replace('//', '/')
		searches[filepath] = res

	for filepath,search in searches.items():
		_search = []
		for lines in search:
			_search += [ map( lambda d: { 'lineno': d[0], 'line': d[1], 'hightlight': d[2] }, lines ) ]
		searches[filepath] = _search

	if as_json:
		return HttpResponse(json.dumps( searches ))

	return render_to_response(
		'search/search_results.html',
		{ 'searches': searches, 'search_pattern': search_pattern, 'search_folder': url },
		context_instance=RequestContext(request)
	)

