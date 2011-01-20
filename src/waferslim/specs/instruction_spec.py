'''
BDD-style Lancelot specifications for the behaviour of the core library classes
'''

import lancelot
from lancelot.comparators import Type, Anything
from waferslim.instructions import Instruction, \
                                   Make, Import, Call, CallAndAssign
from waferslim.execution import ParamsConverter
from waferslim.specs.spec_classes import ClassWithNoArgs, ClassWithOneArg, \
                                         ClassWithTwoArgs, \
                                         ClassWithSystemUnderTestMethod, \
                                         ClassWithSystemUnderTestField

class BaseInstructionBehaviour(object):
    ''' Related Specs for base Instruction behaviour '''
    
    @lancelot.verifiable
    def params_must_be_list(self):
        ''' The params constructor arg must be a list '''
        new_instance_with_bad_parms = lambda: Instruction('id', 'params')
        spec = lancelot.Spec(new_instance_with_bad_parms)
        spec.__call__().should_raise(TypeError)

        new_instance_with_list_parms = lambda: Instruction('id', ['params'])
        spec = lancelot.Spec(new_instance_with_list_parms)
        spec.__call__().should_not_raise(Exception)
        
    @lancelot.verifiable
    def stores_id_and_params(self):
        ''' The id and params constructor args should be assigned to fields.
        The instruction id should be accessible through a method. '''
        class FakeInstruction(Instruction):
            ''' Fake Instruction to get fields from '''
            def execute(self, execution_context, results):
                ''' Get the fields '''
                return self._params
        spec = lancelot.Spec(FakeInstruction('an_id', ['param1', 'param2']))
        spec.instruction_id().should_be('an_id')
        spec.execute(object(), object()).should_be(['param1', 'param2'])
        
    @lancelot.verifiable
    def execute_fails(self):
        ''' The base class execute() method fails with INVALID_STATEMENT '''
        instruction = Instruction('id', ['nonsense'])
        spec = lancelot.Spec(instruction)
        execution_context = lancelot.MockSpec('execution_context')
        results = lancelot.MockSpec('results')
        spec.execute(execution_context, results).should_collaborate_with(
                results.failed(instruction, 'INVALID_STATEMENT nonsense')
            )
    
    @lancelot.verifiable
    def repr_should_be_meaningful(self):
        ''' repr(Instruction) should provide meaningful information'''
        instruction = Instruction('id', ['param1', 'param2'])
        spec = lancelot.Spec(instruction.__repr__)
        spec.__call__().should_be("Instruction id: ['param1', 'param2']")
        
lancelot.grouping(BaseInstructionBehaviour)

@lancelot.verifiable
def make_creates_instance():
    ''' Make.execute() should instantiate the class & add it to context '''
    package = 'waferslim.specs.spec_classes'
    
    classes = [ClassWithNoArgs, ClassWithOneArg, ClassWithTwoArgs]
    arg_params = [[], ['bucket'], ['mr', 'creosote']]
    for i in range(0, 3):
        target = classes[i]
        name = target.__name__
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        params = [name, '%s.%s' % (package, name)]
        params.extend(arg_params[i])
        args = ParamsConverter(execution_context).to_args(params, 2)
        make_instruction = Make(name, params)
        spec = lancelot.Spec(make_instruction)
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_type(params[1]).will_return(target),
            execution_context.to_args(params, 2).will_return(args),
            execution_context.store_instance(name, Type(target)),
            results.completed(make_instruction)
        )

class MakeExceptionBehaviour(object):
    ''' Exception-related Specs for Make-instruction behaviour '''

    @lancelot.verifiable
    def handles_wrong_args(self):
        ''' incorrect num constructor args => COULD_NOT_INVOKE_CONSTRUCTOR'''
        wrong_params = ['creosote', 'FakeClass',
                        ['some unwanted', 'constructor args']
                       ]
        wrong_args = ('some unwanted', 'constructor args')
        cause = 'COULD_NOT_INVOKE_CONSTRUCTOR FakeClass ' \
                + 'object.__new__() takes no parameters'
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        a_class = ClassWithNoArgs
        make_instruction = Make('wrong params', wrong_params)
        spec = lancelot.Spec(make_instruction)
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_type('FakeClass').will_return(a_class),
            execution_context.to_args(wrong_params, 2).will_return(wrong_args),
            results.failed(make_instruction, cause)
        )

    @lancelot.verifiable
    def handles_bad_type(self):
        ''' unknown type => NO_CLASS '''
        wrong_params = ['creosote', 'FakeClass',
                        ['some unwanted', 'constructor args']
                       ]
        type_error = TypeError('x')
        cause = 'NO_CLASS FakeClass x'
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        make_instruction = Make('wrong params', wrong_params)
        spec = lancelot.Spec(make_instruction)
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_type('FakeClass').will_raise(type_error),
            results.failed(make_instruction, cause)
        )

    @lancelot.verifiable
    def handles_bad_import(self):
        ''' import problem => NO_CLASS'''
        wrong_params = ['creosote', 'FakeClass',
                        ['some unwanted', 'constructor args']
                       ]
        import_error = ImportError('y')
        cause = 'NO_CLASS FakeClass y'
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        make_instruction = Make('wrong params', wrong_params)
        spec = lancelot.Spec(make_instruction)
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_type('FakeClass').will_raise(import_error),
            results.failed(make_instruction, cause)
        )

lancelot.grouping(MakeExceptionBehaviour)

@lancelot.verifiable
def call_invokes_method():
    ''' Call instruction should get an instance from context and execute a
    callable method on it, returning the results '''
    methods = {'method_0':[],
               'method_1':['bucket'],
               'method_2':['mr', 'creosote'],
               'method_3':[[['bring', 'me'], ['another', 'bucket']]]}
    for target in methods.keys():
        instance = lancelot.MockSpec(name='instance')
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        params = ['instance', 'aMethod']
        params.extend(methods[target])
        call_instruction = Call('id', params)
        spec = lancelot.Spec(call_instruction)
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_instance(params[0]).will_return(instance),
            execution_context.target_for(instance, params[1]).will_return(lambda life: 'meaning'),
            execution_context.to_args(params, 2).will_return(('life',)),
            results.completed(call_instruction, 'meaning')
            )

@lancelot.verifiable
def call_invokes_system_under_test():
    ''' Will try to access sut when Call target has no such method''' 
    params = ['instance', 'is_dead']
    instances = [ ClassWithSystemUnderTestMethod(), ClassWithSystemUnderTestField() ]
    
    for instance in instances:
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        
        call_instruction = Call('id_blah', params)
        spec = lancelot.Spec(call_instruction)
        
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_instance(params[0]).will_return(instance),
            execution_context.target_for(instance, params[1]).will_return(None),
            execution_context.target_for(instance, 'sut').will_return(instance.sut),
            execution_context.target_for(Anything(), params[1]).will_return(lambda: False),
            execution_context.to_args(params, 2).will_return(()),
            results.completed(call_instruction, False)
            )
    
class CallExceptionBehaviour(object):
    ''' Exception-related Specs for Call-instruction behaviour '''
    
    @lancelot.verifiable
    def handles_bad_instance(self):
        ''' NO_INSTANCE indicates bad instance name in Call ''' 
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        params = ['bad_instance', 'method', 'args']
        cause = 'NO_INSTANCE bad_instance'
        call_instruction = Call('id_9A', params)
        spec = lancelot.Spec(call_instruction)
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_instance(params[0]).will_return(None),
            execution_context.get_library_method(params[1]).will_return(None),
            results.failed(call_instruction, cause)
            )

    @lancelot.verifiable
    def handles_bad_method(self):
        ''' NO_METHOD_IN_CLASS indicates bad method name for Call target ''' 
        execution_context = lancelot.MockSpec(name='execution_context')
        results = lancelot.MockSpec(name='results')
        params = ['instance', 'bad_method', 'args']
        instance = ClassWithNoArgs()
        cause = 'NO_METHOD_IN_CLASS bad_method ClassWithNoArgs'
        
        call_instruction = Call('id_9B', params)
        spec = lancelot.Spec(call_instruction)
        
        spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_instance(params[0]).will_return(instance),
            execution_context.target_for(instance, params[1]).will_return(None),
            execution_context.target_for(instance, 'sut').will_return(None),
            execution_context.get_library_method(params[1]).will_return(None),
            results.failed(call_instruction, cause)
            )

lancelot.grouping(CallExceptionBehaviour)
        
@lancelot.verifiable
def import_adds_to_pythonpath():
    ''' Import should add a path to the pythonpath when a path is supplied '''
    execution_context = lancelot.MockSpec('execution_context')
    results = lancelot.MockSpec('results')
    import_instruction = Import('id', ['/some_path'])
    spec = lancelot.Spec(import_instruction)
    spec.execute(execution_context, results).should_collaborate_with(
            execution_context.add_import_path('/some_path'),
            results.completed(import_instruction)
        )
    execution_context = lancelot.MockSpec('execution_context')
    results = lancelot.MockSpec('results')
    import_instruction = Import('id', ['c:\some_path'])
    spec = lancelot.Spec(import_instruction)
    spec.execute(execution_context, results).should_collaborate_with(
            execution_context.add_import_path('c:\some_path'),
            results.completed(import_instruction)
        )

@lancelot.verifiable
def import_adds_to_type_context():
    ''' Import should add a module / package to the type context 
    when one is supplied '''
    execution_context = lancelot.MockSpec('execution_context')
    results = lancelot.MockSpec('results')
    import_instruction = Import('id', ['some.module'])
    spec = lancelot.Spec(import_instruction)
    spec.execute(execution_context, results).should_collaborate_with(
            execution_context.add_type_prefix('some.module'),
            results.completed(import_instruction)
        )

@lancelot.verifiable
def call_and_assign_sets_variable():
    ''' CallAndAssign should assign a value to an execution context symbol '''
    execution_context = lancelot.MockSpec('execution_context')
    results = lancelot.MockSpec('results')
    call_and_assign = CallAndAssign('id', ['symbol', 'list', '__len__'])
    spec = lancelot.Spec(call_and_assign)
    spec.execute(execution_context, results).should_collaborate_with(
            execution_context.get_instance('list').will_return([]),
            execution_context.target_for([], '__len__').will_return(lambda: 0),
            execution_context.to_args(['list', '__len__'], 2).will_return(()),
            execution_context.store_symbol('symbol', 0),
            results.completed(call_and_assign, 0)
        )

if __name__ == '__main__':
    lancelot.verify()