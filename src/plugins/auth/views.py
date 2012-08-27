from django.http import HttpResponse
from django.shortcuts import render_to_response as _render_to_response
from github import Github

def default(request):
	git = Github('Riurik', 'riurik862879')
	user = git.get_user()
	keys = user.get_keys()
	return _render_to_response('github.html', locals())
