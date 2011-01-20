'''
Classes for converting to/from strings and python types, in a manner similar
to that described at http://fitnesse.org/FitNesse.UserGuide.SliM.CustomTypes.

Import this module and use the method decorators 
    convert_arg(to_type=...) 
    convert_arg(using=...)
    convert_result(using=...) 
in your own classes (see decision_table and script_table in the examples).

Converters are provided for bool, int, float and datetime (date, time 
and datetime), list, tuple and dict types. You can obtain the appropriate
converter using the converter_for() function or just make use of it for
stringification with the to_string() function. You can register a custom 
converter with this module using register_converter(), after which it will 
be accessible both to decorated methods and to the waferslim code that 
translates return values into standard slim strings.

The latest source code is available at http://code.launchpad.net/waferslim.

Copyright 2009-2010 by the author(s). All rights reserved 
'''
import datetime, threading, HTMLParser
from waferslim import WaferSlimException

__THREADLOCAL = threading.local()

class _ReIterable(object):
    ''' Class to allow repeatable iteration over to_type / using converters ''' 
    def __init__(self, underlying):
        ''' Specify the iterable for repeatable iteration '''
        self._underlying = underlying
    def reset(self, num_params):
        ''' Reset iteration and note num_params supplied in method call '''
        self._num_params = num_params
        try:
            self._iterator = iter(self._underlying)
        except TypeError:
            self._iterator = None
        return True
    def next(self):
        ''' Get next value from the iterable '''
        try:
            return self._iterator and next(self._iterator) or self._underlying
        except StopIteration:
            msg = '%s to_type or using args insufficient to convert %s params'
            raise WaferSlimException(msg % (len(self._underlying), 
                                            self._num_params))
            
class TableTableConstants(object):
    ''' String constants for returning results from a TableTable '''
    @classmethod
    def cell_no_change(cls):
        ''' Leave the cell uncoloured '''
        return 'no change'
    @classmethod
    def cell_correct(cls, message=None):
        ''' Colour the cell green '''
        return 'pass%s' % (message and ':%s' % message or '')
    @classmethod
    def cell_incorrect(cls, actual_value):
        ''' Colour the cell red and provide an actual_value to display '''
        return 'fail:%s' % actual_value
    @classmethod
    def cell_ignore(cls, message=None):
        ''' Colour the cell grey '''
        return 'ignore%s' % (message and ':%s' % message or '')
    @classmethod
    def cell_report(cls, message):
        ''' Show the message in the cell'''
        return 'report:%s' % message 
    @classmethod
    def cell_error(cls, error_details):
        ''' Colour the cell yello and display the error_details '''
        return 'error:%s' % str(error_details)

class Converter(object):
    ''' Base class for converting to/from strings from/to python types'''
    
    def to_string(self, value):
        ''' Use default str() to convert from a value into a string '''
        if isinstance(value, str) or isinstance(value, unicode):
            return value
        return str(value)
    
    def from_string(self, value):
        ''' NotImplemented! '''
        msg = 'from_string(%s) must be implemented in subclasses' % value
        raise NotImplementedError(msg)

# Default when no type-specific instance is present
_DEFAULT_CONVERTER = Converter()   

class StrConverter(Converter):
    ''' "Converter" (really a Null-Converter) to/from str type.
    Only used by methods whose arguments have multiple types.'''
    def from_string(self, value):
        ''' The value is already a string so simply return it'''
        return value

class TrueFalseConverter(Converter):
    ''' Converter to/from bool type using true/false. This is the standard.'''
    
    def from_string(self, value):
        ''' true/True are bool True; anything else is False '''
        return value.lower() == 'true'
    
    def to_string(self, value):
        ''' "true" if value==bool True; "false" otherwise '''
        return value == True and 'true' or 'false'

class YesNoConverter(Converter):
    ''' Converter to/from bool type using yes/no. Offered as an alternative
    to TrueFalseConverter.'''
    
    def from_string(self, value):
        ''' yes/Yes are bool True; anything else is False '''
        return value.lower() == 'yes'
    
    def to_string(self, value):
        ''' "yes" if value==bool True; "no" otherwise '''
        return value == True and 'yes' or 'no'
    
class FromConstructorConverter(Converter):
    ''' Converter for types that implement __new__(str) e.g. int and float '''
    
    def __init__(self, _type):
        ''' Specify the _type whose constructor will be used'''
        Converter.__init__(self)
        self._type = _type

    def from_string(self, value):
        ''' Delegate to the type(str) constructor to perform the conversion '''
        return self._type(value)
    
class DateConverter(Converter):
    ''' Converter to/from datetime.date type via iso-standard format 
    (4digityear-2digitmonth-2digitday, e.g. 2009-02-28) '''
    
    DATE_FORMAT = '%Y-%m-%d'
    
    def from_string(self, value):
        ''' Generate datetime.date from iso-standard format str '''
        return datetime.datetime.strptime(value, 
                                          DateConverter.DATE_FORMAT).date()

class TimeConverter(Converter):
    ''' Converter to/from datetime.date type via iso-standard format 
    (2digithour:2digitminute:2digitsecond - with or without
    an additional optional .6digitmillis, e.g. 01:02:03 or 01:02:03.456789).
    Does not take any time-zone UTC offset into account!'''
    
    TIME_FORMAT_WITHOUT_MICROSECONDS = '%H:%M:%S'
    TIME_FORMAT_WITH_MICROSECONDS = TIME_FORMAT_WITHOUT_MICROSECONDS + '.%f'
    
    def from_string(self, value):
        ''' Generate datetime.time from formatted str '''
        try:
            return datetime.datetime.strptime(value, 
                TimeConverter.TIME_FORMAT_WITH_MICROSECONDS).time()
        except ValueError:
            return datetime.datetime.strptime(value, 
                TimeConverter.TIME_FORMAT_WITHOUT_MICROSECONDS).time()
    
class DatetimeConverter(Converter):
    ''' Converter to/from datetime.datetime type via iso-standard formats 
    ("dateformat<space>timeformat", e.g. "2009-02-28 21:54:32.987654"). '''

    FORMAT_WITH_MICROSECONDS = '%s %s' % (DateConverter.DATE_FORMAT, 
                                TimeConverter.TIME_FORMAT_WITH_MICROSECONDS)
    FORMAT_WITHOUT_MICROSECONDS = '%s %s' % (DateConverter.DATE_FORMAT, 
                                TimeConverter.TIME_FORMAT_WITHOUT_MICROSECONDS)

    def from_string(self, value):
        ''' Generate a datetime.datetime from a str '''
        try:
            return datetime.datetime.strptime(value, 
                                DatetimeConverter.FORMAT_WITH_MICROSECONDS) 
        except ValueError:
            return datetime.datetime.strptime(value, 
                                DatetimeConverter.FORMAT_WITHOUT_MICROSECONDS) 

class IterableConverter(Converter):
    ''' Converter to/from an iterable type (e.g. list, tuple). 
    Delegates to type-specific converters for each item in the list.'''
    
    def __init__(self, to_type=None, using=None):
        ''' Determine how conversion will be handled in from_string().
        If neither to_type nor using is supplied then perform no conversion.
        If to_type is supplied then perform conversion to the type(s) specified.
        If using is supplied then perform conversion with the converter(s) 
        specified. '''
        Converter.__init__(self)
        if using:
            converters = using
        elif to_type is None:
            converters = StrConverter()
        elif type(to_type) is tuple:
            converters = _converters_for(to_type)
        else:
            converters = _strict_converter_for(to_type)
        self._converters = _ReIterable(converters)
    
    def to_string(self, iterable_values):
        ''' Generate a list of str values from a list of typed values.
        Note the slightly misleading name of this method: it actually returns
        a list (of str) rather than an actual str...'''
        return [to_string(value) for value in iterable_values]
    
    def from_string(self, value):
        ''' Generate a tuple from a str.
        If value contains comma-separated values then the tuple will contain
        each of these values individually.
        If a to_type or using keyword argument was supplied to the constructor
        then this will be used to perform conversion (similarly to convert_arg)
        on each of the individual values. See the iterable_conversion example
        for more details. '''
        if value.startswith('[') and value.endswith(']'):
            return self.from_string(value[1:len(value)-1])
        items = value.split(',')
        self._converters.reset(len(items))
        return tuple([self._convert(item.strip()) for item in items])
    
    def _convert(self, item):
        ''' Perform the actual conversion of an item '''
        return self._converters.next().from_string(item)

class _MarkupHashTableParser(HTMLParser.HTMLParser):
    ''' Subclass HTMLParser to extract name-value pairs from an html table ''' 
    def __init__(self):
        ''' Set up instance variables '''
        HTMLParser.HTMLParser.__init__(self)
        self._name = None
        self._get_data = False
        self._dict = {}
    def handle_starttag(self, tag, attrs):
        ''' Identify columns within table rows whose data contains 
        a name or value '''
        if tag == 'tr':
            self._name = None
        elif tag == 'td':
            self._get_data = True
    def handle_data(self, data):
        ''' Extract the name or value from column data and store it '''
        if self._get_data:
            if self._name:
                self._dict[self._name] = data
            else:
                self._name = data 
    def to_dict(self, markup):
        ''' Convert html markup into a dict by extracting name-value pairs '''
        self.feed(markup)
        return self._dict

class DictConverter(Converter):
    ''' Converter to/from dict type via slim-table format 
    (see http://fitnesse.org/FitNesse.UserGuide.MarkupHashTable) '''
    TABLE_CLASS = 'class="hash_table"'
    TR_CLASS = 'class="hash_row"'
    TD_KEY_CLASS = 'class="hash_key"'
    TD_VALUE_CLASS = 'class="hash_value"'
    
    def __init__(self, item_conversion_dict=None):
        ''' If item_conversion_dict is passed, its key/value pairs
        will determine how items within a converted dict are themselves
        converted. E.g.
          DictConverter({'id':int}) converts id values to int 
          DictConverter({'emp':converter}) converts emp values using converter
        See also waferslim.examples.hash_conversion 
        ''' 
        Converter.__init__(self)
        self._item_conversion_dict = item_conversion_dict \
                                     and item_conversion_dict or {}
    
    def to_string(self, a_dict):
        ''' Generate a str value in the fitnesse HashMarkupTable format 
        from a dict of typed name,value pairs '''
        names = [key for key in a_dict.keys()]
        names.sort()
        rows = ['<tr %s><td %s>%s</td><td %s>%s</td></tr>' \
                % (DictConverter.TR_CLASS,
                   DictConverter.TD_KEY_CLASS, 
                   to_string(name), 
                   DictConverter.TD_VALUE_CLASS, 
                   to_string(a_dict.get(name)))
                for name in names]
        return '<table %s>%s</table>' % \
                (DictConverter.TABLE_CLASS, ''.join(rows))

    def from_string(self, hash_table_markup):
        ''' Generate a dict of typed name,value pairs from a str value
        in the fitnesse HashMarkupTable format '''
        dict_of_str = _MarkupHashTableParser().to_dict(hash_table_markup)
        return self.convert_items(dict_of_str)
    
    def convert_items(self, a_dict):
        ''' Convert individual items within a dict via to_type or using
        conversion strategies passed in constructor '''
        for key in self._item_conversion_dict.keys():
            if key in a_dict:
                to_type_or_using = self._item_conversion_dict[key]
                a_dict[key] = from_string(a_dict[key], to_type_or_using)
        return a_dict
        
def register_converter(for_type, converter_instance):
    ''' Register a converter_instance to be used with all for_type instances.
    Registration is 'forever' (across all fitnesse tables run as a suite): the
    decision_table example demonstrates how to use an alternative converter 
    with the @using method decorator.  
    A converter_instance must implement from_string() and to_string(). '''
    if hasattr(converter_instance, 'from_string') and \
    hasattr(converter_instance, 'to_string'):
        __init_converters()
        __THREADLOCAL.converters[for_type] = converter_instance
        return
    msg = 'Converter for %s requires from_string() and to_string()' % for_type
    raise TypeError(msg)

def __init_converters():
    ''' Ensure standard converters exist for bool, int, float, datetime, ...
    All registered converters, keyed on type, are held as thread-local to 
    ensure that ExecutionContext-s (which are created per thread by the 
    server) really are isolated from each other when the server is run 
    in keepalive (multi-user) mode'''
    if hasattr(__THREADLOCAL, 'converters'):
        return
    
    __THREADLOCAL.converters = {} 
    register_converter(bool, TrueFalseConverter())
    register_converter(int, FromConstructorConverter(int))
    register_converter(float, FromConstructorConverter(float))
    register_converter(datetime.date, DateConverter())
    register_converter(datetime.time, TimeConverter())
    register_converter(datetime.datetime, DatetimeConverter())
    register_converter(list, IterableConverter())
    register_converter(tuple, IterableConverter())
    register_converter(str, StrConverter())
    register_converter(dict, DictConverter())

def _converters_for(to_types):
    ''' Return a list of converters based on the target types in to_types '''
    return [_strict_converter_for(_type) for _type in to_types]

def convert_arg(to_type=None, using=None):
    ''' Method decorator to convert a slim-standard string arg to a specific
    python datatype. Only 1 of "to_type" or "using" should be supplied. 
    If "to_type" is supplied then a type-specific Converter is found from
    those added through this module. If "using" is supplied then the arg
    is taken as the converter to be used - however this converter will only
    be used 'temporarily' (not 'forever', as it would have been if 
    register_converter() had been called.) 
    "to_type" and "using" may be supplied as single objects, in which case
    the same conversion strategy will be applied to each argument in the target
    method, e.g. 
        @convert_arg(to_type=int)
        def some_method(self, an_int, another_int)...
    or they may be suppplied as tuples, in which case they will be iterated
    over to provide a different converter for each argument in the target 
    method, e.g. 
        @convert_arg(to_type=(int, float))
        def some_method(self, an_int, a_float)...
    '''
    conversion_strategy = to_type and to_type or using
    if not conversion_strategy:
        raise TypeError('One of "to_type" or "using" must be supplied')
    def conversion_decorator(base_fn):
        ''' callable that performs the actual decoration '''
        if type(conversion_strategy) is tuple:
            converter = using and using or _converters_for(to_type)
        else:
            converter = using and using or _strict_converter_for(to_type)
        reiterable = _ReIterable(converter)
        _reset = reiterable.reset
        _next = reiterable.next
        def convert_args_and_return_result(self, *args):
            ''' callable that delegates to the decorated fn '''
            _reset(len(args))
            return base_fn(self, 
                    *tuple([_next().from_string(arg) for arg in args]))
        return convert_args_and_return_result 
    return conversion_decorator

def convert_result(using):
    ''' Method decorator to convert a method result from a python datatype 
    using a specific converter. The argument "using" is required.
    Ordinarily this decorator is not needed by client code,
    as result conversion is performed automatically using an appropriate
    converter registered for the datatype of the result value. It is included
    for specific conversion done 'temporarily' for a single fitnesse table 
    within a suite '''
    if not (using):
        raise TypeError('"using" converter must be supplied')
    def conversion_decorator(base_fn):
        ''' callable that performs the actual decoration '''
        return lambda self, *args: using.to_string(base_fn(self, *args))
    return conversion_decorator

def converter_for(type_or_value): 
    ''' Returns the appropriate converter for a particular type_or_value.
    This will be a registered type-specific converter if one exists,
    otherwise the default (base Converter).''' 
    try:
        return _strict_converter_for(type_or_value)
    except KeyError:
        return _DEFAULT_CONVERTER
    
def to_string(value, using=None):
    ''' Shortcut for converter_for(value).to_string(value) or 
    using.to_string(value). 
    if using is specified: stringify value its to_string().
    if using is unspecified: stringify value with an appropriate 
        registered converter. 
    ''' 
    if using and hasattr(using, 'to_string'):
        return using.to_string(value)
    return converter_for(value).to_string(value)
    
def from_string(value, to_type_or_using):
    ''' Shortcut for converter_for(to_type).from_string(value) or 
    using.from_string(value). 
    if to_type_or_using is a converter: de-stringify value with 
        its from_string().
    if to_type_or_using is a type: de-stringify value with an appropriate 
        registered converter.
    '''
    if hasattr(to_type_or_using, 'from_string'):
        return to_type_or_using.from_string(value)
    return converter_for(to_type_or_using).from_string(value)
    
def _strict_converter_for(type_or_value): 
    ''' Returns the exact converter for a particular type_or_value.
    This will be a registered type-specific converter if one exists,
    otherwise a KeyError will be raised.'''
    __init_converters() 
    try:
        return __THREADLOCAL.converters[type_or_value]
    except (KeyError, TypeError):
        return __THREADLOCAL.converters[type(type_or_value)]