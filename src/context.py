import os
from logger import log
import settings, config, contrib
		
def host(instance, resolve=True):
	key = 'host'
	if resolve:
		return contrib.resolveRemoteAddr(instance.get(key))
	return instance.get(key)
		
def get(name, section='default'):
	#if not section: section = 'default'
	return context(name, section)

class context():
	
	def __init__(self, test, section='default'):
		test = os.path.join(settings.STATIC_TESTS_ROOT, test)
		if os.path.isdir(test):
			self.inifile = os.path.join(test, settings.TEST_CONTEXT_FILE_NAME)
		else:
			self.inifile = os.path.join(os.path.dirname(test), settings.TEST_CONTEXT_FILE_NAME)
		self.section = section
		log.debug('context: %s, section: %s' % (self.inifile, self.section))
		
	def get(self, option):
		value = config.get(self.inifile, self.section, option)
		log.debug('context: %s=%s' % (option, value))
		return value

	def items(self):
		return config.items(self.inifile, self.section)
	
	def sections(self):
		return config.sections(self.inifile)