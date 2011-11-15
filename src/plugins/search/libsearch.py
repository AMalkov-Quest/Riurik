# coding: utf-8

import re, os

def make_regexp(search_pattern):
	return re.compile(r'((?:[^\n]*)(?:\n?)(?:[^\n]*)(?:\n?)(?:[^\n]*?)'+ search_pattern +r'(?:[^\n]*)(?:\n?)(?:[^\n]*)(?:\n?)(?:[^\n]*))');

def search_in_file(filepath, search_pattern):
	regexp = make_regexp( search_pattern )
	f = open(filepath, 'r')
	filecontent = f.read()
	f.close()
	matches = regexp.finditer(filecontent)
	
	all_results = []

	for match in matches:
		lines = ''.join(match.group(0))
		start = match.start()
		lineno = filecontent.count('\n', 0, start) + 1
		match_result = []
		for line in lines.replace('\r','').split('\n'):

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
				yield os.path.join(root,fname)

if __name__ == '__main__':

	f = '/home/wraith/projects/quest/sasp/SharePoint Information Portal/Application/tests/cases/scheduler/report-export/api-delete-task-for-report.js'
	for k in search_in_file(f, 'equal'):
		print '\n'
		for l,v,h in k:
			print "%s\t%s\t%s" % (l,v,':'+h if h else '')


