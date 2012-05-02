import os
import logging

cwd = os.path.dirname(os.path.abspath(__file__))
logsd = os.path.join(cwd, '..', 'logs')
FILENAME = os.path.join(logsd, 'riurik-server.log')
timeFormat = "%Y-%m-%d %H:%M:%S"

if not os.path.exists(logsd):
	os.mkdir(logsd)

logging.basicConfig(filename=FILENAME, level=logging.DEBUG, format="%(asctime)s - %(message)s")
log = logging.getLogger('default')
