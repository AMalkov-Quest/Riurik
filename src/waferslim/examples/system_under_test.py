''' Example of specifying the Slim system under test from a fixture -- 
based on http://fitnesse.org/FitNesse.UserGuide.SliM.SystemUnderTest

Fitnesse table markup:

|import|
|waferslim.examples.system_under_test|

|script|slim driver with sut method|
|init|
|create person|Ben Vonk|
|ensure|exists|Ben Vonk|

|script|slim driver with sut field|
|init|
|create person|Ben Vonk|
|ensure|exists|Ben Vonk|

|script|slim driver with sut property|
|init|
|create person|Ben Vonk|
|ensure|exists|Ben Vonk|
'''

class _PersonInterface(object):
    ''' Example class to use as the system under test to show method redirection'''
    def __init__(self):
        self._people = []
        
    def create_person(self, name):
        ''' this method will be called from fitnesse via redirection due to sut() ''' 
        self._people.append(name)
        
    def exists(self, name):
        ''' this method will be called from fitnesse via redirection due to sut() ''' 
        return name in self._people

class SlimDriverWithSutMethod(object):
    ''' Fixture class to name in fitnesse table, with sut() method '''
    def init(self):
        ''' a simple method to call directly from fitnesse table '''
        self._sut = _PersonInterface()
        
    def sut(self):
        ''' "magic" method to specify the fitnesse system under test ''' 
        return self._sut
    
class SlimDriverWithSutField(object):
    ''' Alternative fixture class to name in fitnesse table, with sut field '''
    def init(self):
        ''' a simple method to call directly from fitnesse table: sets up the sut field'''
        self.sut = _PersonInterface()
        
class SlimDriverWithSutProperty(object):
    ''' Alternative fixture class to name in fitnesse table, with sut property '''
    @property
    def sut(self):
        ''' property for sut '''
        return self._sut
    
    def init(self):
        ''' a simple method to call directly from fitnesse table '''
        self._sut = _PersonInterface()
        