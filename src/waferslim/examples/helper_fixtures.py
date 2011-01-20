'''
Examples to illustrate the helper fixture 'echo'

Fitnesse table markup:

|import|
|waferslim.fixtures|

|script|echo fixture|
|$value_1=|echo|9|
|$value_2=|echo|11|

|import|
|waferslim.examples.helper_fixtures|

|DT:multiplication|
|value 1|value 2|result?|
|$value_1|$value_2|99|

'''
from waferslim.converters import convert_arg

class Multiplication(object):
    ''' Simple class to show how to use echo fixture and symbols.
    echo sets the symbol value, which is in turn passed to set_XXX()
    and then used in result()''' 
    @convert_arg(to_type=int)
    def set_value1(self, value1):
        ''' Sets a value - from a symbol that was created with echo '''
        self.value1 = value1
    @convert_arg(to_type=int)
    def set_value2(self, value2):
        ''' Sets a value - from a symbol that was created with echo '''
        self.value2 = value2
    def result(self):
        ''' E.g. multiply the 2 values together '''
        return self.value1 * self.value2
        
