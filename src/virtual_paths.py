import os, sys

product_jscode_path = ('SharePoint Information Portal', 'Application', 'templates', 'static')
riurik_tests_path = ('tests', 'riurik', 'cases')
VIRTUAL_PATHS = {
  'warrior': ('c:\\SASPWarriorBranches',) +  riurik_tests_path,
  'wizard': ('c:\\SASPWizardBranch1',) +  riurik_tests_path,
}

sys.path.append('C:\\SASPWizardBranch1\\tests')