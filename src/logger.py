import os

FILENAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'riurik-server.log')
DJANGO_APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'django-app.log')
timeFormat = "%Y-%m-%d %H:%M:%S"

try:
	from logbook import Logger
	log = Logger('logbook')
	
	log.level = logbook.DEBUG
	handler = logbook.RotatingFileHandler(filename=FILENAME, max_size=1024*1024*5, backup_count=10)
	handler.format_string = '{record.extra[localtime]} {record.time} [{record.process}:{record.thread}] ** {record.level_name} ** {record.message}'
	log.handlers.append(handler)
except:
	import logging
	logging.basicConfig(filename=FILENAME, level=logging.INFO, format="%(asctime)s - %(message)s")
	log = logging.getLogger('default')
