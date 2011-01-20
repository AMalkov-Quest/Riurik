'''
Example of how waferslim finds method names in fixtures

Fitnesse table markup:

|import|
|waferslim.examples.method_names|

|scenario|invoke|methodName|with|argValue|
|check|@methodName|@argValue|@argValue|

|script|class with pythonic method names|

All tests will pass...

|script|
|invoke|a method|with|hello world|
|invoke|a Method|with|hello World|
|invoke|A Method|with|Hello World|
|invoke|a_method|with|hello_world|
|invoke|aMethod|with|helloWorld|
|invoke|AMethod|with|Hello World|

|script|class with camel case method names|

"A Method", "a_method" and "AMethod" will fail...

|script|
|invoke|a method|with|hello world|
|invoke|a Method|with|hello World|
|invoke|A Method|with|Hello World|
|invoke|a_method|with|hello_world|
|invoke|aMethod|with|helloWorld|
|invoke|AMethod|with|Hello World|

'''
from waferslim.fixtures import EchoFixture

class ClassWithPythonicMethodNames(EchoFixture):
    ''' Simple class to show waferslim method matching ''' 
    def a_method(self, value):
        ''' A method with a pythonic name '''
        return self.echo(value)
    
class ClassWithCamelCaseMethodNames(EchoFixture):
    ''' Simple class to show waferslim method matching ''' 
    def aMethod(self, value):
        ''' A method with a camel cased name '''
        return self.echo(value)