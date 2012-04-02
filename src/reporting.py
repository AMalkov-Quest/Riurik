import os, json
import threading
from logger import log
import contrib

mutex = threading.RLock()

class TestBase(object):

	def __getattr__(self, key):
		return self.result[key]

	def toDict(self):
		return self.result

class TestResult(TestBase):

	def __init__(self, result):
		self.result = {
			'date': result['date'],
			'path': result['path'],
			'context': result['context'],
			'name': result['name'],
			'passed': result['passed'],
			'failed': result['failed'],
			'total': result['total'],
			'duration': result['duration'],
			'html': result['html']
		}

class TestInfo(TestBase):

	def __init__(self, result):
		self.result = {
			'date': result['date'],
			'path': result['path'],
			'context': result['context'],
		}

def getTestsResultRoot():
	cwmodule = os.path.abspath( __file__ )
	cwpackage = os.path.dirname( cwmodule )
	root = os.path.join(cwpackage, '..')
	testsDir = os.path.join(os.path.abspath( root ), 'testsResult' )
	if not os.path.exists(testsDir):
		os.makedirs(testsDir)
	log.info('root for tests result: %s' % testsDir)
	return testsDir

def getTestResultDir(test_path, context):
	"""	
	>>> result = getTestResultDir('/tests/path/', 'localctx') 
	>>> 'tests/path/localctx' in result
	True
	>>> result = getTestResultDir('tests/path', 'localctx') 
	>>> 'tests/path/localctx' in result
	True
	>>> result = getTestResultDir('tests/path/test.js', 'localctx') 
	>>> 'tests/path/localctx' in result
	True
	"""
	testsRoot = getTestsResultRoot()
	if test_path.endswith('.js'):
		testPath = os.path.dirname(test_path)
	else:
		testPath = test_path
	testDir = os.path.join(testsRoot, testPath.strip('/'), context)
	log.info((testsRoot, testPath, context))
	log.info('tests result location: %s' % testDir)
	if not os.path.exists(testDir):
		os.makedirs(testDir)

	return testDir

def getFileName(path, context, date, ext):
	testDir = getTestResultDir(path, context)
	return os.path.join(testDir, '%s.%s' % (date, ext))

def getBeginFile(path, context, date):
	return getFileName(path, context, date, 'begin')
	
def getProgressFile(path, context, date):
	return getFileName(path, context, date, 'progress')

def getResultsFile(path, context, date):
	return getFileName(path, context, date, 'json')

def getDoneFile(path, context, date):
	return getFileName(path, context, date, 'done')

def proceed(fileName, mode, func):
	with mutex:
		with open( fileName, mode ) as f:
			result = func(f)

	return result

def dump(fileName, data):
	proceed(fileName, 'w', lambda f: f.write(json.dumps(data)))

def load(fileName):
	data = proceed(fileName, 'r', lambda f: f.read())
	return json.loads(data)

def start(data):
	start = TestInfo(data)
	
	cwd = getTestResultDir(start.path, start.context)
	contrib.cleandir(cwd, '*.begin')
	contrib.cleandir(cwd, '*.progress')
	contrib.cleandir(cwd, '*.done')
	
	fileName = getBeginFile(start.path, start.context, start.date)
	dump(fileName, [])

def getPrevResults(fileName):
	if os.path.exists(fileName):
		results = load(fileName)
	else:
		results = []

	return results

def appendResults(fileName, test):
	with mutex:
		results = getPrevResults(fileName)
		results.append(test.toDict())
		dump(fileName, results)

def saveProgress(test):
	fileName = getProgressFile(test.path, test.context, test.date)
	if not os.path.exists(fileName):
		fileName = getBeginFile(test.path, test.context, test.date)
	appendResults(fileName, test)

def saveResults(test):
	fileName = getResultsFile(test.path, test.context, test.date)
	appendResults(fileName, test)

def save(result):
	test = TestResult(result)
	saveResults(test)
	saveProgress(test)

def done(data):
	done = TestInfo(data)
	with mutex:
		fileName = getProgressFile(done.path, done.context, done.date)
		if not os.path.exists(fileName):
			fileName = getBeginFile(done.path, done.context, done.date)
		os.rename(
			fileName,
			getDoneFile(done.path, done.context, done.date)
		)
		
def status(path, context):
	def mkstatus(status, date):
		return json.dumps({
			'status': status,
			'date': date
		})
	cwd = getTestResultDir(path, context)
	with mutex:
		for root, dirs, files in os.walk(cwd):
			for name in files:
				root, ext = os.path.splitext(name)
				date = root
				if ext == '.begin' or ext == '.progress' or ext == '.done':
					status = ext.strip('.')
					return mkstatus(status, date)

	return mkstatus('undefined', '')

def progress(path, context):
	cwd = getTestResultDir(path, context)
	for root, dirs, files in os.walk(cwd):
		for name in files:
			#if name.endswith('.begin') or name.endswith('.progress') or name.endswith('.done'):
			if not name.endswith('.json'):
				with mutex:
					root, ext = os.path.splitext(name)
					if ext == '.begin':
						date = root
						fileName = getProgressFile(path, context, date)
						os.rename(
							getBeginFile(path, context, date),
							fileName
						)
					else:
						fileName = os.path.join(cwd, name)
				
					progress = proceed(fileName, 'r', lambda f: f.read())
					dump(fileName, [])
					return progress
				
	return json.dumps([])
	
def getResults(path, context, date):
	fileName = getResultsFile(path, context, date)
	results = load(fileName)
	return results
