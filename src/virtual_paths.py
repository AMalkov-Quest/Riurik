import os, sys

product_jscode_path = ('SharePoint Information Portal', 'Application', 'templates', 'static')
riurik_tests_path = ('tests', 'riurik', 'cases')
VIRTUAL_PATHS = {
  'info-portal-tests': ('c:\\hunter',) +  riurik_tests_path,
  'warrior': ('c:\\warrior',) +  riurik_tests_path,
  'wizard': ('c:\\wizard',) +  riurik_tests_path,
  'blade': ('c:\\blade',) +  riurik_tests_path,
  'caissa': ('c:\\caissa',) +  riurik_tests_path,
  'hunter-dev': ('c:\\hunter-dev',) +  riurik_tests_path,
}

sys.path.append('C:\\hunter\\tests')