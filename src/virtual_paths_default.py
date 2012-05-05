import os

root = os.path.dirname( __file__ )
VIRTUAL_PATHS = {
  'riurik-inner-tests': (root, 'tests', 'cases'),
  'other-tests': (root, 'tests-1', 'cases'),
  'django-app-tests': (root, 'tests-2', 'cases'),
}