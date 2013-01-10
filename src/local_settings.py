# this file is intended to hold you local settings those should not be commited
# and pushed into the repository. To ignore it's modifications use next command
# git update-index --assume-unchanged src/local_settings.py

# uncomment this line to switch on the github plugin
# use_github = True
import os

product_jscode_path = ('SharePoint Information Portal', 'Application', 'templates', 'static')
riurik_tests_path = ('tests', 'riurik', 'cases')
root = os.path.dirname( __file__ )

VIRTUAL_PATHS = {
  'info-portal-tests': ('c:\\hunter',) +  riurik_tests_path,
  'warrior': ('c:\\warrior',) +  riurik_tests_path,
  'wizard': ('c:\\wizard',) +  riurik_tests_path,
  'blade': ('c:\\blade',) +  riurik_tests_path,
  'caissa': ('c:\\caissa',) +  riurik_tests_path,
  'hunter-dev': ('c:\\hunter-dev',) +  riurik_tests_path,
  'riurik-inner-tests': (root, 'tests', 'cases'),
}
