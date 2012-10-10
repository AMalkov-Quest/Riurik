import os, platform
import logging

cwd = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(cwd, '..')

if not os.access(root, os.W_OK):
	if platform.system() == 'Linux':
		logs = r'/var/log/apache2'
	elif platform.system() == 'Windows':
		logs = r'C:'
else:
	logs = os.path.join(root, 'logs')
	if not os.path.exists(logs):
		os.mkdir(logs)

FILENAME = os.path.join(logs, 'riurik-server.log')
timeFormat = "%Y-%m-%d %H:%M:%S"

logging.basicConfig(filename=FILENAME, level=logging.DEBUG, format="%(asctime)s - %(message)s")
log = logging.getLogger('default')
