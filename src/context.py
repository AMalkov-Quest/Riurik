import os
from logger import log
import settings, config
		
def get(name):
	return context(name)

class context():
	
	def __init__(self, test):
		test = os.path.join(settings.STATIC_TESTS_ROOT, test)
		self.inifile = os.path.join(os.path.dirname(test), settings.TEST_CONTEXT_FILE_NAME)
		log.debug('context: %s' % self.inifile)
		
	def get(self, option, section='default'):
		value = config.get(self.inifile, section, option)
		log.debug('context: %s=%s' % (option, value))
		return value

	def items(self, section='default'):
		return config.items(self.inifile, section)
