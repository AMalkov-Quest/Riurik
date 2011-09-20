class RiurikException(Exception):
	issue = 'Unknown problem'
class InvalidLoaderFolder(RiurikException):
	def __init__(self, _loader_dir_path):
		self.issue = 'Please, check your loader folder: %s . It can not be accessed.' % _loader_dir_path
		self.message = _loader_dir_path
class InvalidCasesFolder(RiurikException):
	def __init__(self, _cases_dir_path):
		self.issue = 'Please, check your cases folder: %s . It can not be accessed.' % _cases_dir_path
		self.message = _cases_dir_path
class TestFileNotSpecified(RiurikException):
	issue = 'No file or suite specified for testing. It should be URL GET argument: "path" or "suite"'
class SuiteFolderDoesNotExists(RiurikException):
	def __init__(self, urlpath, fullpath):
		self.issue = 'Suite path "%s" (at "%s") does not exists. Please, check this path or runner.' % (urlpath, fullpath)
class NoSuiteSpecified(RiurikException):
	issue = 'No suite specified for running'
class TestFileDoesNotExists(RiurikException):
	def __init__(self, urlpath, fullpath):
		self.issue = 'Test path "%s" (at "%s") does not exists. Please, check this path or runner.' % (urlpath, fullpath)
class NoTestSpecified(RiurikException):
	issue = 'No test specified for running'

class NoPathSpecifiedForUpload(RiurikException):
	issue = 'No argument PATH specified in request.'
class NoContentSpecifiedForUpload(RiurikException):
	issue = 'No content received from request POST.'
class InvalidDocumentRoot(RiurikException):
	def __init__(self, root):
		self.issue = 'Folder document_root "%s" does not exists or invalid' % root
class ErrorCreatingFolders(RiurikException):
	def __init__(self, folders, exception):
		self.issue = 'Error while creating folders "%s". Failed with exception: "%s"' % (folders, exception)
		self.message = folders
class ErrorWritingFile(RiurikException):
	def __init__(self, path, exception):
		self.issue = 'Error while writing test content to file "%s". Failed with exception: "%s"' % (path, exception)
		self.message = path

