def use_proxy(host, port):
	def _fn(fn):
		def _wrap(*args, **kwargs):
			import httplib
			_origHTTPS = httplib.HTTPSConnection
			
			class httpsClass( _origHTTPS ):
				def __init__(self, *args, **kwargs):
					kwargs.update({'host':host, 'port':port})
					return _origHTTPS.__init__(self, *args, **kwargs)
			httplib.HTTPSConnection		= httpsClass

			rv = fn(*args, **kwargs)

			httplib.HTTPSConnection = _origHTTPS
			return rv
		return _wrap
	return _fn
