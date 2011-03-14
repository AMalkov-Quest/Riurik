import os

LOG_FILENAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'riurik-server.log')

try:
	from logbook import Logger
	log = Logger('logbook')
	
	log.level = logbook.DEBUG
	handler = logbook.RotatingFileHandler(filename=LOG_FILENAME, max_size=1024*1024*5, backup_count=10)
	handler.format_string = '{record.extra[localtime]} {record.time} [{record.process}:{record.thread}] ** {record.level_name} ** {record.message}'
	log.handlers.append(handler)
	
	#from logbook.queues import ZeroMQHandler
	#log = ZeroMQHandler('tcp://127.0.0.1:5000')
except:
	import logging
	logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
	log = logging.getLogger('waferslim')