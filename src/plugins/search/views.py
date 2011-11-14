from django.shortcuts import render_to_response
from django.template import loader, RequestContext, Context, Template, TemplateDoesNotExist
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseNotModified, HttpRequest
import simplejson as json
import libsearch

def search_view_ext(request, path=None, search_pattern=None, as_json=False):
	import contrib
	path = request.GET.get('path', path)
	search_pattern = request.GET.get('search_pattern',search_pattern)
	as_json = request.GET.get('as_json', as_json)
	document_root = contrib.get_document_root(path)
	full_path = contrib.get_full_path(document_root, path)
	return search_view(request, contrib.get_full_path(document_root, path), search_pattern, as_json)


def search_view(request, folder, search_pattern, as_json=False):
	searches = []
	for filepath in libsearch.iter_files(folder):
		searches += libsearch.search_in_file( filepath,  search_pattern)

	json_data = [ map( lambda d: { 'lineno': d[0], 'line': d[1], 'hightlight': d[2] }, search ) for search in searches ]
		
	if as_json:
		return HttpResponse(json.dumps( json_data ))

	return render_to_response('search/search_results.html', { 'searches': json_data }, context_instance=RequestContext(request))

