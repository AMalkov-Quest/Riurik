'''
Illustrate the use of the IterableConverter.

Fitnesse table markup:

|import|
|waferslim.examples.iterable_conversion|

|Iterable Conversion|
|input|output?|
|a, b, c|[a, b, c]|
|[a, b, c]|[a, b, c]|

|Iterable Conversion|
|input with int|output?|
|a, 1, b|[a, 1, b]|
|[a, 1, b]|[a, 1, b]|

'''
from waferslim.converters import convert_arg, IterableConverter

class IterableConversion(object):
    ''' Simple class to illustrate conversion from a comma-separated string
    to a tuple of values using an IterableConverter '''
    @convert_arg(using=IterableConverter())
    def set_input(self, values):
        ''' values has been converted to a tuple''' 
        self._values = values
    @convert_arg(using=IterableConverter(to_type=(str, int, str)))
    def set_input_with_int(self, values):
        ''' values has been converted to a tuple whose elements are types 
        (str,int,str)''' 
        self._values = values
    def output(self):
        ''' Conversion of a list or tuple return type is automatic '''
        return self._values
