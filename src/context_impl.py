from logger import log

class context_impl():

	def __init__(self, items):
		self.items = items
		self.items_as_list = list(self.items)

	def has(self, key):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.has('host')
		True
		>>> ci.has('port')
		False
		"""
		return self.as_items().has_key(key)

	def check(self, key, value):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.check('host', 'host-1')
		True
		>>> ci.check('host', 'host-2')
		False
		>>> ci.check('port', '8000')
		False
		"""
		for i, v in self.items:
			if i == key and v == value:
				return True

		return False

	def replace(self, key, value):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.replace('host', 'host-2')
		>>> ci.as_tuple()
		(('host', 'host-2'),)

		"""
		self.remove(key)
		self.add(key, value)

	def replace_if(self, key, new_value, old_value):
		"""
		>>> ci = context_impl([('host', 'host-1')])
		>>> ci.replace_if('port', '8000', '8001')
		>>> ci.as_tuple()
		(('host', 'host-1'),)
		>>> ci.replace_if('host', 'host-2', 'host-1')
		>>> ci.as_tuple()
		(('host', 'host-2'),)

		"""
		try:
			self.remove(key, old_value)
			self.add(key, new_value)
		except ValueError, e:
			log.error(e)

	def get(self, key):
		if self.has(key):
			return self.as_items()[key]

	def add(self, key, value):
		self.items_as_list.append((key, value))

	def remove(self, key, value=None):
		if not value:
			self.items_as_list = [item for item in self.items_as_list if item[0] != key]
		else:
			self.items_as_list.remove((key, value))

	def as_items(self):
		items = {}
		for item in self.items_as_list:
			items[item[0]] = item[1]

		return items

	def as_list(self):
		return self.items_as_list

	def as_tuple(self):
		return tuple(self.items_as_list)

	def add_virtual_root(self, RequestHandler):
		"""
		>>> import serving
		>>> ctximpl = context_impl([])
		>>> import test
		>>> RequestHandler = test.Mock('serving.BaseHandler')
		>>> RequestHandler.get_virtual_root.mock_returns = "/home/"
		>>> ctximpl.add_virtual_root(RequestHandler)
		>>> ctximpl.get("_root_")
		'home'
		>>> RequestHandler.get_virtual_root.mock_returns = "/"
		>>> ctximpl.add_virtual_root(RequestHandler)
		>>> ctximpl.get("_root_")
		'/'
		"""
		root = RequestHandler.get_virtual_root().strip('//')
		self.add( '_root_', root if root else '/' )
