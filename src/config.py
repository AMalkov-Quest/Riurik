import sys, ConfigParser
from Diagnostics import trace, loge
import path

def read(folder, file):
	config = ConfigParser.RawConfigParser()
	config.read(path.getAbsPath(folder, file))
	return config

def write(path, func):
	try:
		file = open(path, 'w')
		func(file)
	finally:
		if file: file.close()

def get(folder, file, section, option):
	try:
		config = read(folder, file)
		return config.get(section, option)
	except Exception, e:
		loge(e)
		return None

def set(folder, file, section, option, value):
	try:
		config = read(folder, file)
		config.set(section, option, value)
		write(path.getAbsPath(folder, file), config.write)
	except Exception, e:
		loge(e)