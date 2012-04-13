# coding: utf-8

import re, os
import contrib
from logger import log

def search(folder, path, search_pattern):
	"""
	>>> from tl.testing.fs import new_sandbox
	>>> new_sandbox('''\
	... f test-1.js asdf
	... f test-2.js asdf
	... ''')
	>>> search(os.getcwd(), 'cases', 'asdf')
	"""
	searches = {}
	for filepath in iter_files(folder):
		head, tail = os.path.split(filepath)
		if contrib.ishidden(tail): continue
		print 'Searching in %s' % filepath
		res = search_in_file( filepath,  search_pattern)
		if not res: continue
		log.debug('Got results: %s' % res)
		filepath = filepath.replace(folder, path).replace('\\', '/').replace('//', '/')
		searches[filepath] = res
	
	return searches

def make_regexp(search_pattern):
	return re.compile(r'('+ search_pattern +r')')

def search_in_file(filepath, search_pattern):
	regexp = make_regexp( search_pattern )
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

def iter_files(folders):
	if not isinstance( folders, list ): folders = [ folders ]
	for folder in folders:
		for root,dirs,files in os.walk(folder):
			for fname in files:
				print fname
				yield os.path.join(root,fname)
