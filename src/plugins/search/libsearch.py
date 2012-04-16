# coding: utf-8

import re, os
import contrib
from logger import log

def listfiles(folder):
	for root, dirs, files in os.walk(folder):
		for fname in files:
			if not contrib.ishidden(fname):
				yield os.path.join(root, fname)

def search(folder, path, search_pattern):
	"""
	>>> from tl.testing.fs import new_sandbox
	>>> new_sandbox('''\\
	... f test-1.js asdfg
	... f test-2.js asdft
	... f .test-2.js asdfg
	... f test-3.js hjkl
	... ''')
	>>> search(os.getcwd(), 'cases', 'asdf')
	{'cases/test-2.js': [[(0, 'asdft', 'asdf')]], 'cases/test-1.js': [[(0, 'asdfg', 'asdf')]]}
	"""
	searches = {}
	for filepath in listfiles(folder):
		result = find( filepath,  search_pattern)
		if result:
			log.debug('Got results: %s' % result)
			filepath = filepath.replace(folder, path).replace('\\', '/').replace('//', '/')
			searches[filepath] = result
	
	return searches

def find(filepath, search_pattern):
	regexp = re.compile(r'('+ search_pattern +r')')
	f = open(filepath, 'r')
	filecontent = f.read()
	f.close()
	matches = regexp.finditer(filecontent)
	
	all_results = []

	for match in matches:
		start = match.start()
		lineno = filecontent.count('\n', 0, start)
		if lineno > 0: lineno -= 1
		lines = filecontent.replace('\r','').split('\n')[lineno: lineno+3]
		match_result = []
		for line in lines:

			highlight = re.search( search_pattern, line )
			if highlight: highlight = highlight.group(0)

			match_result += [ (lineno, line, highlight,) ]
			lineno += 1
		all_results +=  [ match_result ]

	return all_results
