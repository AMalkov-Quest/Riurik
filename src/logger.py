import os

LOG_FILENAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'riurik-server.log')

try:
	from logbook import Logger
	log = Logger('logbook')
	#from logbook.queues import ZeroMQHandler
	#log = ZeroMQHandler('tcp://127.0.0.1:5000')
except:
	import logging
	logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
	log = logging.getLogger('waferslim')