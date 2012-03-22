import os, json
import threading

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
			'name': result['name'],
			'passed': result['passed'],
			'failed': result['failed'],
			'total': result['total']
		}

class TestInfo(TestBase):

	def __init__(self, result):
		self.result = {
			'date': result['date'],
			'path': result['path'],
		}

def getTestsResultRoot():
	cwmodule = os.path.abspath( __file__ )
	cwpackage = os.path.dirname( cwmodule )
	root = os.path.join(cwpackage, '..')
	testsDir = os.path.join(os.path.abspath( root ), 'testsResult' )
	if not os.path.exists(testsDir):
		os.makedirs(testsDir)

	return testsDir

def getTestResultDir(test_path):
	testsRoot = getTestsResultRoot()
	testPath = os.path.dirname(test_path).strip('/')
	testDir = os.path.join(testsRoot, testPath)
	if not os.path.exists(testDir):
		os.makedirs(testDir)

	return testDir

def getFileName(path, date, ext):
	testDir = getTestResultDir(path)
	return os.path.join(testDir, '%s.%s' % (date, ext))

def getProgressFile(path, date):
	return getFileName(path, date, 'progress')

def getResultsFile(path, date):
	return getFileName(path, date, 'json')

def getDoneFile(path, date):
	return getFileName(path, date, 'done')

def proceed(fileName, mode, func):
	with threading.RLock():
		with open( fileName, mode ) as f:
			result = func(f)

	return result

def dump(fileName, data):
	proceed(fileName, 'w', lambda f: f.write(data))

def load(fileName):
	data = proceed(fileName, 'r', lambda f: f.read())
	return json.loads(data)

def start(data):
	start = TestInfo(data)
	fileName = getProgressFile(start.path, start.date)
	dump(fileName, json.dumps([]))

def getPrevResults(fileName):
	if os.path.exists(fileName):
		results = load(fileName)
	else:
		results = []

	return results

def appendResults(fileName, test):
	with threading.RLock():
		results = getPrevResults(fileName)
		results.append(test.toDict())
		dump(fileName, json.dumps(results))

def saveProgress(test):
	fileName = getProgressFile(test.path, test.date)
	appendResults(fileName, test)

def saveResults(test):
	fileName = getResultsFile(test.path, test.date)
	if not os.path.exists(fileName):
		fileName = getDoneFile(test.path, test.date)
	appendResults(fileName, test)

def save(result):
	test = TestResult(result)
	saveResults(test)
	saveProgress(test)

def done(data):
	done = TestInfo(data)
	with threading.Lock():
		os.rename(
			getProgressFile(done.path, done.date),
			getDoneFile(done.path, done.date)
		)
