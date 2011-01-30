import os, logging, ConfigParser
import settings
	
def read(file):
	config = ConfigParser.RawConfigParser()
	config.read(file)
	return config

def write(path, func):
	try:
		file = open(path, 'w')
		func(file)
	finally:
		if file: file.close()

def get(file, section, option):
	try:
		config = read(file)
		return config.get(section, option)
	except Exception, e:
		logging.info(e)
		return None

def items(file, section):
	try:
		config = read(file)
		return config.items(section)
	except Exception, e:
		logging.info(e)
		return None

def set(file, section, option, value):
	try:
		config = read(file)
		config.set(section, option, value)
		write(file, config.write)
	except Exception, e:
		logging.info(e)

class context():
	
	def __init__(self, test):
		test = os.path.join(settings.STATIC_TESTS_ROOT, test)
		self.inifile = os.path.join(os.path.dirname(test), settings.TEST_CONTEXT_FILE_NAME)
		
	def get(self, option, section='default'):
		return get(self.inifile, section, option)

	def items(self, section='default'):
		return items(self.inifile, section)
