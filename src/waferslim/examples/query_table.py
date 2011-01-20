''' Example of a Slim QueryTable and a custom Converter -- 
based on http://fitnesse.org/FitNesse.UserGuide.SliM.QueryTable

Fitnesse table markup:

|import|
|waferslim.examples.query_table|

|Query:employees hired before|1980-12-10|
|employee number|first name|last name|hire date|
|1429           |Bob       |Martin   |1975-10-10|
|9924           |Bill      |Mitchell |1966-12-19|

This test will fail: Bob Martin's hire date is wrong, Bill Mitchell
will be marked as missing, and James Grenning will be marked as surplus.
'''

from waferslim.converters import convert_arg, Converter, register_converter, \
    converter_for
import datetime

class Employee(object):
    ''' Simple example employee class with data but no behaviour (!) '''
    def __init__(self, emp_no, fname, lname, hiredate_tuple):
        self._emp_no = emp_no
        self._fname = fname
        self._lname = lname
        self._hired = datetime.date(*hiredate_tuple)
        
    def as_dict(self):
        ''' Extract the employee's data as a dict '''
        return {'employee number':self._emp_no,
                'first name':self._fname,
                'last name':self._lname,
                'hire date':self._hired
                }
        
class EmployeeConverter(Converter):
    ''' Custom converter for Employee instances. '''
    
    def to_string(self, employee):
        '''Convert each Employee to a list of [name, value] pairs. 
        Note the final converter.to_string() call to ensure that the 
        contents of the returned lists are str-converted'''
        dict_items = employee.as_dict().items
        converter = converter_for(list)
        return converter.to_string([[key, value] \
                                    for key, value in dict_items()])

# Don't forget to register the custom converter!
register_converter(Employee, EmployeeConverter())

class EmployeesHiredBefore(object):
    ''' Class to be the system-under-test in fitnesse. '''

    @convert_arg(to_type=datetime.date)
    def __init__(self, before_date):
        ''' Specify the before_date for the query. 
        Method decorator ensures that arg passed in is datetime.date type.'''
        self._before_date = before_date
        
    def query(self):
        ''' Standard slim method for query tables. Returns a list of 
        values: each "row" of the query result is an element in the list.''' 
        return self._simulate_query(self._before_date)
    
    def _simulate_query(self, for_date_parameter):
        ''' Simulate performing a query e.g. on a database.
        The Employee instances will be converted to str with the
        custom converter that was registered for them. '''
        return [
                Employee(1429, 'Bob', 'Martin', (1974, 10, 10)),
                Employee(8832, 'James', 'Grenning', (1979, 12, 15))
               ]
