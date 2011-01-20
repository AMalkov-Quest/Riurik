'''
WaferSlim is a python port of the fitnesse slim server 
(see http://fitnesse.org/FitNesse.SliM for more details).
    
The latest source code is available at http://code.launchpad.net/waferslim.

Copyright 2009-2010 by the author(s). All rights reserved 
'''

__version__ = "1.0.2"

class WaferSlimException(Exception):
    ''' Base Exception class for this package '''
    pass

class StopTestException(WaferSlimException):
    ''' Exception class to throw from fixtures that will stop test execution.
    See http://localhost:8080/FitNesse.UserGuide.SliM.ExceptionHandling '''
    pass

__all__ = ['StopTestException']

