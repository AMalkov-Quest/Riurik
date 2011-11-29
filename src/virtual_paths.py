import os

VIRTUAL_PATHS = {
  'riurik-inner-tests': os.path.join(os.path.dirname( __file__ ), 'tests', 'cases'),
  'other-tests': os.path.join(os.path.dirname( __file__ ), 'tests-1', 'cases'),
  'django-app-tests': os.path.join(os.path.dirname( __file__ ), 'tests-2', 'cases'),
}
