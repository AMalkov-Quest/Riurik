import urllib, urllib2
from django.http import HttpResponse
from django.template.loader import render_to_string

def handler(fn):
	def _f(*args, **kwargs):
		try:
			response = fn(*args, **kwargs)
		except urllib2.HTTPError, ex:
			response = HttpResponse(ex.read(), status=500)
		except urllib2.URLError, ex:
			response = HttpResponse(status=500)
			response.write(render_to_string('error.html', {
				'type': ex.__class__.__name__,
				'msg': ex,
				'stacktrace': '',
				'issue':  ex.issue if hasattr(ex, 'issue') else '',
				'request': args[0].REQUEST
			}))

		return response
	return _f

def log(fn):
	""" Catch errors and write it into logs then raise it up.
		Normal result returned if no errors.

		>>> def testF(k):
		...	 	return k
		>>> def testExc(k):
		...	 	raise Exception(k)
		>>> f = log(testF)
		>>> f(10)
		10

		>>> f = log(testExc)
		>>> f(10)
		Traceback (most recent call last):
			...
		Exception: 10

	"""
	def log_it(*args, **kwargs):
		try:
			result = fn(*args, **kwargs)
		except Exception, ex:
			log.error("%s", ex)
			raise
		return result
	return log_it
