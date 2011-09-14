from django.shortcuts import render_to_response
from django.http import HttpResponse

def hello(request):
	#return HttpResponse('Hello world!')
	return render_to_response('default.html')
