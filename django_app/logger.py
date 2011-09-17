import os
import logging

FILENAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../src', 'django-app.log')
timeFormat = "%Y-%m-%d %H:%M:%S"

logging.basicConfig(filename=FILENAME, level=logging.DEBUG, format="%(asctime)s - %(message)s")
log = logging.getLogger('default')
