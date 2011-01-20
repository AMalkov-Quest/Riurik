'''
BDD-style Lancelot specifications for the behaviour of the core library classes
integrating various parts together via the example classes. 
'''

import lancelot.comparators
from waferslim.execution import Instructions, ExecutionContext, Results
from waferslim.converters import TableTableConstants

@lancelot.verifiable
def decision_table():
    ''' Simulate the invocation of the example decision table.
    Note that the standard slim table() / execute() / reset() steps 
    are missing from this simplistic sequence '''
    execution_context = ExecutionContext()
    results = Results()
    instr_list = [
                     ['1', 'import', 'waferslim.examples.decision_table'],
                     ['2', 'make', 'table', 'ShouldIBuyMilk'],
                     ['3', 'call', 'table', 'setCashInWallet', '10'],
                     ['4', 'call', 'table', 'setCreditCard', 'yes'],
                     ['5', 'call', 'table', 'setPintsOfMilkRemaining', '1'],
                     ['6', 'call', 'table', 'goToStore', ],
                 ]
    Instructions(instr_list).execute(execution_context, results)
    spec = lancelot.Spec(results.collection())
    spec.it().should_contain(['1', 'OK'])
    spec.it().should_contain(['2', 'OK'])
    spec.it().should_contain(['3', '/__VOID__/'])
    spec.it().should_contain(['4', '/__VOID__/'])
    spec.it().should_contain(['5', '/__VOID__/'])
    spec.it().should_contain(['6', 'no'])

@lancelot.verifiable
def script_table():
    ''' Simulate the invocation of the example script table. '''
    execution_context = ExecutionContext()
    results = Results()
    instr_list = [
                  ['1', 'import', 'waferslim.examples.script_table'],
                  ['2', 'make', 'table', 'LoginDialogDriver', 'wafer', 'slim'],
                  ['3', 'call', 'table', 'loginWithUsernameAndPassword', \
                   'wafer', 'thin' ],
                  ['4', 'call', 'table', 'loginMessage', ],
                  ['5', 'call', 'table', 'numberOfLoginAttempts', ],
                 ]
    Instructions(instr_list).execute(execution_context, results)
    spec = lancelot.Spec(results.collection())
    spec.it().should_contain(['1', 'OK'])
    spec.it().should_contain(['2', 'OK'])
    spec.it().should_contain(['3', 'false'])
    spec.it().should_contain(['4', 'wafer not logged in.'])
    spec.it().should_contain(['5', '1'])
    
@lancelot.verifiable
def query_table():
    ''' Simulate the invocation of the example query table.
    Note that the standard slim table() step is missing from this 
    simplistic sequence '''
    execution_context = ExecutionContext()
    results = Results()
    instr_list = [
                  ['1', 'import', 'waferslim.examples.query_table'],
                  ['2', 'make', 'table', 'EmployeesHiredBefore', '1999-12-12'],
                  ['3', 'call', 'table', 'query', ],
                 ]
    Instructions(instr_list).execute(execution_context, results)
    spec = lancelot.Spec(results.collection())
    spec.it().should_contain(['1', 'OK'])
    spec.it().should_contain(['2', 'OK'])
    spec.it().should_contain(['3', lancelot.comparators.Type(list)])
    
    # 3rd result, 2nd item is list with query results
    spec = lancelot.Spec(results.collection()[2][1])
    spec.it().should_be(lancelot.comparators.Type(list))
    spec.__len__().should_be(2) # list, len 2
    
    # 3rd result, 2nd item, 1st item is list with one "row" from query
    spec = lancelot.Spec(results.collection()[2][1][0]) 
    spec.it().should_be(lancelot.comparators.Type(list))
    spec.__len__().should_be(4) # list, len 4
    spec.it().should_contain(['employee number', 
                              lancelot.comparators.Type(str)])
    spec.it().should_contain(['first name', 
                              lancelot.comparators.Type(str)])
    spec.it().should_contain(['last name', 
                              lancelot.comparators.Type(str)])
    spec.it().should_contain(['hire date', 
                              lancelot.comparators.Type(str)])

@lancelot.verifiable
def table_table():
    ''' Simulate the invocation of the example "table" table. '''
    execution_context = ExecutionContext()
    results = Results()
    instr_list = [
                  ['1', 'import', 'waferslim.examples.table_table'],
                  ['2', 'make', 'tableTable_1', 'Bowling'],
                  ['3', 'call', 'tableTable_1', 'doTable', 
                   [
                    ['3', '5', '4', '/', 'X', '', 'X', '', '3', '4', '6', '/', '7', '2', '3', '4', '9', '-', '4', '/', '3'], 
                    ['', '8', '', '28', '', '51', '', '68', '', '75', '', '92', '', '101', '', '108', '', '117', '', '', '130']
                   ]
                  ],
                 ]
    Instructions(instr_list).execute(execution_context, results)
    spec = lancelot.Spec(results.collection())
    spec.it().should_contain(['1', 'OK'])
    spec.it().should_contain(['2', 'OK'])
    spec.it().should_contain(['3', lancelot.comparators.Type(list)])

    # 3rd result, 2nd item is list with query results
    spec = lancelot.Spec(results.collection()[2][1])
    spec.it().should_be(lancelot.comparators.Type(list))
    spec.__len__().should_be(2) # list, len 2
    
    # 3rd result, 2nd item, 1st item is list with 1st "row" from results
    spec = lancelot.Spec(results.collection()[2][1][0]) 
    spec.it().should_be(lancelot.comparators.Type(list))
    spec.it().should_be([TableTableConstants.cell_no_change() for cell in results.collection()[2][1][0]])

    # 3rd result, 2nd item, 2ndt item is list with 2nd "row" from results
    spec = lancelot.Spec(results.collection()[2][1][1]) 
    spec.it().should_be(lancelot.comparators.Type(list))
    spec.it().should_not_be([TableTableConstants.cell_no_change() for cell in results.collection()[2][1][1]])

@lancelot.verifiable
def symbols():
    ''' Simulate the invocation of the decision table that uses symbols.
    Note that the standard slim table() / execute() / reset() steps 
    are missing from this simplistic sequence '''
    execution_context = ExecutionContext()
    results = Results()
    instr_list = [
                     ['1', 'import', 'waferslim.examples.values_and_symbols'],
                     ['2', 'make', 'table', 'SomeDecisionTable'],
                     ['3', 'call', 'table', 'setInput', '3'],
                     ['4', 'callAndAssign', 'V', 'table', 'output'],
                     ['5', 'call', 'table', 'setInput', '$V'],
                     ['6', 'call', 'table', 'output'],
                 ]
    Instructions(instr_list).execute(execution_context, results)
    spec = lancelot.Spec(results.collection())
    spec.it().should_contain(['1', 'OK'])
    spec.it().should_contain(['2', 'OK'])
    spec.it().should_contain(['3', '/__VOID__/'])
    spec.it().should_contain(['4', '4'])
    spec.it().should_contain(['5', '/__VOID__/'])
    spec.it().should_contain(['6', '8'])
    
if __name__ == '__main__':
    lancelot.verify()

