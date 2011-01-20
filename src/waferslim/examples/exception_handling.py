'''
Example of throwing exceptions from fixtures
See http://localhost:8080/FitNesse.UserGuide.SliM.ExceptionHandling

Fitnesse table markup:

|import|
|waferslim.examples.exception_handling|

|script|exceptional|
|raise exception|whoops|
|stop test|no more!|
|should not be called|

|script|should not be called|

'''
from waferslim import StopTestException

class Exceptional:
    ''' Class to illustrate exception handling '''
    def raise_exception(self, message):
        ''' Raise an exception with message ''' 
        raise Exception(message)
    def stop_test(self, message):
        ''' Halt further test execution with message ''' 
        raise StopTestException(message)