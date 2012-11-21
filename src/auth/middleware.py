from django.http import HttpResponseRedirect

class GitHubAuth(object):
	def process_request(self, request):
		if not request.session.get('token') and not request.path in ['/signin', '/login'] and not request.path.startswith('/static'):
			return HttpResponseRedirect('/signin')
