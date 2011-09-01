import os
'''
Path to a folder in a product where tests dedicated code is located.
Actually it contains:
 - python code that opens access to tests ('views.py' & 'urls.py');
 - html\javascript code that loads and runs tests (testLoader.html & the 'loader' folder);
 - test cases (the 'cases' folder)
'''
PRODUCT_TESTS_ROOT = 'C:/saip/SharePoint Information Portal/Application/tests'
PRODUCT_TEST_CASES_ROOT = 'cases'
PRODUCT_TESTS_URL = 'tests/execute'
STATIC_TESTS_ROOT = os.path.join(PRODUCT_TESTS_ROOT, PRODUCT_TEST_CASES_ROOT)
STATIC_TESTS_URL = ''
ROOT_TESTS = 'src.tests'

INNER_TESTS_ROOT = 'tests'
TESTS_URL = 'cases'

VIRTUAL_URLS = {
    INNER_TESTS_ROOT: os.path.join(os.path.dirname( __file__ ), INNER_TESTS_ROOT, 'cases'),
}