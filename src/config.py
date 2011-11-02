import os
from ConfigParser import SafeConfigParser as ConfigParser
from logger import log

def read(file, defaults=None):
	config = ConfigParser(defaults)
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
		log.debug(e)
		return None

def items(file, section, vars=None):
	try:
		config = read(file, vars)
		return config.items(section=section)
	except Exception, e:
		log.debug(e)
		return None

def set(file, section, option, value):
	try:
		config = read(file)
		config.set(section, option, value)
		write(file, config.write)
	except Exception, e:
		log.error(e)

def sections(file):
	try:
		return read(file).sections()
	except Exception, e:
		log.error(e)
		return None
