import os, inspect, minimock
import __builtin__
#from minimock import mock, Printer, lookup_by_name
 
def stub(name, **kw):
	kw['tracker'] = minimock.Printer(open(os.devnull, "w"))

	stack = inspect.stack()
	globals_ = stack[1][0].f_globals
	locals_ = stack[1][0].f_locals
	kw['nsdicts'] = (locals_, globals_, __builtin__.__dict__)

	minimock.mock(name, **kw)

def restore():
	minimock.restore()
