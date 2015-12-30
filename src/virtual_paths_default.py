import os

root = os.path.dirname( __file__ )

working_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(working_dir, "..", "TestsRoot")

VIRTUAL_PATHS = {
  'riurik-inner-tests': (root, 'tests', 'cases'),
  'other-tests': (root, 'tests-1', 'cases'),
  'django-app-tests': (root, 'tests-2', 'cases'),
  'daspec-tests': (root, 'daspec', 'cases'),
}