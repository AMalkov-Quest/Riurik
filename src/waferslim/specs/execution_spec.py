'''
BDD-style Lancelot specifications for the behaviour of the core library classes
'''
from waferslim import StopTestException

import lancelot, logging, os, sys, types
from lancelot.comparators import Type, SameAs, Anything, Contain
from waferslim.execution import ExecutionContext, Results, Instructions, \
                                instruction_for, ParamsConverter, pythonic
from waferslim.instructions import Make, Import, Call, CallAndAssign, \
                                   Instruction
from waferslim.specs.spec_classes import ClassWithNoArgs

class ExecutionContextBehaviour(object):
    ''' Related Specs for ExecutionContext behaviour '''
    class DeathKnocksAtTheDoor(object):
        ''' Simple class to illustrate library method '''
        def do_come_in_mr_death(self):
            ''' Simple illustrative method '''
            return "won't you have a drink?"
            
    def _nonsrc_path(self, execution_context):
        ''' Path to non-src modules that are known to be outside sys.path '''
        slim_path = execution_context.get_module('waferslim').__path__[0]
        path = os.path.abspath(slim_path 
                               + '%s..%snon-waferslim' % (os.sep, os.sep))
        return path

    @lancelot.verifiable
    def uses_added_import_paths(self):
        ''' add_import_path() should allow packages or modules to be found 
        without altering sys.path'''
        execution_context = ExecutionContext()
        spec = lancelot.Spec(execution_context)
        spec.get_module('import_me').should_raise(ImportError)
        
        path = self._nonsrc_path(execution_context)
        spec.when(spec.add_import_path(path))
        spec.then(spec.get_module('import_me')).should_not_raise(ImportError)
        
        lancelot.Spec(sys.path).it().should_not_contain(path)
        
        execution_context.cleanup_imports()

    @lancelot.verifiable
    def cleansup_sys_modules(self):
        ''' cleanup_imports() should not choke on module that were imported
        but are no longer in sys.modules '''
        execution_context = ExecutionContext()
        path = self._nonsrc_path(execution_context)
        execution_context.add_import_path(path)
        execution_context.get_module('import_me')
        
        spec = lancelot.Spec(execution_context)
        del(sys.modules['import_me'])
        spec.cleanup_imports().should_not_raise(Exception)
        
    @lancelot.verifiable
    def get_isolated_imported_module(self):
        ''' get_module() should return a requested module, which should not
        then exist in sys.modules if it has been loaded isolated.
        The same module should be returned on successive invocations. 
        The same module should not be returned from different contexts '''
        
        same_context = ExecutionContext(isolate_imports=True)
        same_context.add_import_path(self._nonsrc_path(same_context))
        different_context = ExecutionContext(isolate_imports=True)
        different_context.add_import_path(self._nonsrc_path(different_context))
        for mod in ('import_me', 
                     'module_with_state'):
            spec = lancelot.Spec(same_context)
            spec.get_module(mod).should_be(Type(types.ModuleType))

            same_module = same_context.get_module(mod)
            spec.get_module(mod).should_be(SameAs(same_module))
            
            sys_spec = lancelot.Spec(sys.modules)
            sys_spec.it().should_not_contain(mod)
        
            different_module = different_context.get_module(mod)
            spec.get_module(mod).should_not_be(SameAs(different_module))
            
            same_context.cleanup_imports()
            different_context.cleanup_imports()

    @lancelot.verifiable
    def get_unisolated_imported_module(self):
        ''' get_module() should return a requested module, which should 
        remain in sys.modules as it has been loaded unisolated.
        The same module should be returned on successive invocations. 
        The same module should be returned from different contexts '''
        
        same_context = ExecutionContext()
        same_context.add_import_path(self._nonsrc_path(same_context))
        different_context = ExecutionContext(isolate_imports=False)
        different_context.add_import_path(self._nonsrc_path(different_context))
        for mod in ('import_me', 
                     'module_with_state'):
            spec = lancelot.Spec(same_context)
            spec.get_module(mod).should_be(Type(types.ModuleType))

            same_module = same_context.get_module(mod)
            spec.get_module(mod).should_be(SameAs(same_module))
            
            sys_spec = lancelot.Spec(sys.modules)
            sys_spec.it().should_contain(mod)
        
            different_module = different_context.get_module(mod)
            spec.get_module(mod).should_be(SameAs(different_module))
            
            same_context.cleanup_imports()
            different_context.cleanup_imports()

    @lancelot.verifiable
    def get_isolated_module_type(self):
        ''' get_type() should return a requested module type, given the fully
        qualified name including module. The same type should be returned on 
        successive invocations. The same type should not be returned from
        different contexts. State in a module should be isolated within 
        each context'''
        _types = {'StateAlteringClass':'module_with_state'}
        
        execution_context = ExecutionContext(isolate_imports=True)
        execution_context.add_import_path(self._nonsrc_path(execution_context))
        for _type, mod in _types.items():
            fully_qualified_name = '%s.%s' % (mod, _type) 
            same_type = execution_context.get_type(fully_qualified_name)

            lancelot.Spec(same_type.__name__).it().should_be(_type)

            spec = lancelot.Spec(execution_context)
            spec.get_type(fully_qualified_name).should_be(SameAs(same_type))
            
            other_context = ExecutionContext(isolate_imports=True)
            other_context.add_import_path(self._nonsrc_path(other_context))
            different_type = other_context.get_type(fully_qualified_name)
            spec.get_type(fully_qualified_name).should_not_be(
                                                SameAs(different_type))
            
            instances = same_type(), different_type()
            spec = lancelot.Spec(instances[0])
            spec.when(spec.alter_state())
            spec.then(spec.get_state()).should_contain(1)
            spec.then(instances[1].get_state).should_not_contain(1)

            execution_context.cleanup_imports()
            other_context.cleanup_imports()

    @lancelot.verifiable
    def get_unisolated_module_type(self):
        ''' get_type() should return a requested module type, given the fully
        qualified name including module. The same type should be returned on 
        successive invocations. The same type should also be returned from
        different contexts. State in a module should not be isolated within 
        each context'''
        _types = {'StateAlteringClass':'module_with_state'}
        
        execution_context = ExecutionContext(isolate_imports=False)
        execution_context.add_import_path(self._nonsrc_path(execution_context))
        for _type, mod in _types.items():
            fully_qualified_name = '%s.%s' % (mod, _type) 
            same_type = execution_context.get_type(fully_qualified_name)

            lancelot.Spec(same_type.__name__).it().should_be(_type)

            spec = lancelot.Spec(execution_context)
            spec.get_type(fully_qualified_name).should_be(SameAs(same_type))
            
            other_context = ExecutionContext(isolate_imports=False)
            other_context.add_import_path(self._nonsrc_path(other_context))
            different_type = other_context.get_type(fully_qualified_name)
            spec.get_type(fully_qualified_name).should_be(
                                                SameAs(different_type))
            
            instances = same_type(), different_type()
            spec = lancelot.Spec(instances[0])
            spec.when(spec.alter_state())
            spec.then(spec.get_state()).should_contain(1)
            spec.then(instances[1].get_state).should_contain(1)
            
            execution_context.cleanup_imports()
            other_context.cleanup_imports()

    @lancelot.verifiable
    def get_type_all_lowercaps(self):
        ''' get_type(namewithoutspaces) => get_type (Namewithoutspaces) '''
        context = ExecutionContext()
        context.add_type_prefix('waferslim.examples.helper_fixtures')
        multiplication = context.get_type('Multiplication')
        spec = lancelot.Spec(context)
        spec.get_type('multiplication').should_be(multiplication)
        
        context.cleanup_imports()
        
    @lancelot.verifiable
    def target_for_tries_pythonic_conversion(self):
        ''' target_for() should look first for a pythonic method name and
        if that is not found then look for the original method name '''
        method_name = 'aMethod'
        class ClassWithAMethod(object):
            def a_method(self):
                pass 
        instance = ClassWithAMethod()
        context = ExecutionContext()
        
        spec = lancelot.Spec(context)
        spec.target_for(instance, method_name).should_be(instance.a_method)

        class ClassWithACamelCaseMethod(object):
            def aMethod(self):
                pass 
        instance = ClassWithACamelCaseMethod()
        spec = lancelot.Spec(context)
        spec.target_for(instance, method_name).should_be(instance.aMethod)
        
    @lancelot.verifiable
    def handles_builtins(self):
        ''' get_type() should handle builtin types and get_module() should
        not affect sys.modules when module was already loaded, e.g. __builtin__'''
        context = ExecutionContext()
        spec = lancelot.Spec(context)
        spec.get_type('__builtin__.dict').should_be(dict)
        spec.get_type('__builtin__.str').should_be(str)
        spec.get_module('__builtin__').should_be(SameAs(sys.modules['__builtin__']))
        
        context.cleanup_imports()
    
    @lancelot.verifiable
    def raises_exceptions(self):
        ''' Requesting a non-existent module should raise ImportError.
        Requesting a non-existent type should raise TypeError.'''
        context = ExecutionContext()
        spec = lancelot.Spec(context)
        spec.get_module('no.such.module').should_raise(ImportError)
        spec.get_type('no.such.module.Type').should_raise(ImportError)
        spec.get_type('NoSuchType').should_raise(TypeError)
        spec.get_type('waferslim.Mint').should_raise(TypeError)
        
        context.cleanup_imports()
        
    @lancelot.verifiable
    def stores_instance(self):
        ''' store_instance(name, value) should put the name,value pair in the
        instances dict where it can be retrieved by get_instance(name). 
        instances should be isolated across execution contexts'''
        context = ExecutionContext()
        spec = lancelot.Spec(context)
        spec.get_instance('wafer thin').should_be(None)

        spec.when(spec.store_instance('wafer thin', 'mint'))
        spec.then(spec.get_instance('wafer thin')).should_be('mint')

        spec = lancelot.Spec(ExecutionContext())
        spec.get_instance('wafer thin').should_be(None)
        
        context.cleanup_imports()

    @lancelot.verifiable
    def stores_libraries(self):
        ''' store_instance(library, value) should put the value with the
        libraries where it can be retrieved by get_library_method(name). 
        libraries should be isolated across execution contexts'''
        mr_death = ExecutionContextBehaviour.DeathKnocksAtTheDoor()
        context = ExecutionContext()
        spec = lancelot.Spec(context)
        spec.get_library_method('do_come_in_mr_death').should_be(None)
        spec.get_library_method('doComeInMrDeath').should_be(None)

        context.store_instance('libraryXYZ', mr_death)
        spec = lancelot.Spec(context)
        spec.get_library_method('do_come_in_mr_death').should_be(mr_death.do_come_in_mr_death)
        spec.get_library_method('doComeInMrDeath').should_be(mr_death.do_come_in_mr_death)

        spec = lancelot.Spec(ExecutionContext())
        spec.get_library_method('do_come_in_mr_death').should_be(None)
        spec.get_library_method('doComeInMrDeath').should_be(None)
        
        context.cleanup_imports()
        
    @lancelot.verifiable
    def warns_if_library_methods_may_pollute_tests(self):
        ''' libraries with method names "execute" and "reset" may pollute test
        results, since those methods are called for each row in a decision table '''
        polluting_names = ['execute', 'reset', 'table']
        for name in polluting_names:
            logger = lancelot.MockSpec(name='logger')
            context = ExecutionContext(logger=logger)
            library = ClassWithNoArgs()
            setattr(library, name, lambda: None)
            spec = lancelot.Spec(context)
            spec.store_instance('library', library).should_collaborate_with(
                    logger.debug(Anything()),
                    logger.warning(Contain('%s()' % name)))

    @lancelot.verifiable
    def gets_library_methods_from_fifo_stack(self):
        ''' Library methods should be retrieved from a fifo stack '''
        class GrimReaperKnocks(ExecutionContextBehaviour.DeathKnocksAtTheDoor):
            def do_come_in_mr_death(self):
                return "I'm afraid we don't have any beer"
        context = ExecutionContext()
        mr_death = ExecutionContextBehaviour.DeathKnocksAtTheDoor()
        reaper = GrimReaperKnocks()
        context.store_instance('library1', mr_death)
        context.store_instance('library2', reaper)
        
        spec = lancelot.Spec(context)
        spec.get_library_method('do_come_in_mr_death').should_be(reaper.do_come_in_mr_death)

        context.store_instance('library2', mr_death)
        spec = lancelot.Spec(context)
        spec.get_library_method('do_come_in_mr_death').should_be(mr_death.do_come_in_mr_death)
        spec.get_library_method('doComeInMrDeath').should_be(mr_death.do_come_in_mr_death)
        
        context.cleanup_imports()

    @lancelot.verifiable
    def uses_added_type_context(self):
        ''' add_type_context() should allow classes to be found 
        without fully-dot-qualified prefixes. A unicode param may be passed.'''
        ctx = ExecutionContext()
        test_case_type = ctx.get_type('unittest.TestCase')
        spec = lancelot.Spec(ctx)
        spec.get_type('TestCase').should_raise(TypeError)
        
        spec.when(spec.add_type_prefix('unittest'))
        spec.then(spec.get_type('TestCase')).should_not_raise(TypeError)
        spec.then(spec.get_type('TestCase')).should_be(test_case_type)
        
        second_ctx = ExecutionContext()
        spec = lancelot.Spec(second_ctx)
        spec.when(spec.add_type_prefix(u'waferslim.examples.decision_table'))
        spec.then(spec.get_type(u'ShouldIBuyMilk')).should_not_raise(TypeError)
        
        ctx.cleanup_imports()
        
    @lancelot.verifiable
    def stores_symbol(self):
        ''' store_symbol(name, value) should put the name,value pair in the
        symbols dict where it can be retrieved by get_symbol(name). 
        symbols should be isolated across execution contexts.
        If a symbol is undefined then the value returned is the name of the 
        symbol prefixed with $ -- Bug #537020'''
        ctx1 = ExecutionContext()
        spec = lancelot.Spec(ctx1)
        spec.get_symbol('another_bucket').should_be('$another_bucket')

        spec.when(spec.store_symbol('another_bucket', 'for monsieur'))
        spec.then(spec.get_symbol('another_bucket')).should_be('for monsieur')

        ctx2 = ExecutionContext()
        spec = lancelot.Spec(ctx2)
        spec.get_symbol('another_bucket').should_be('$another_bucket')
        
        ctx1.cleanup_imports()
        ctx2.cleanup_imports()
    
    @lancelot.verifiable
    def stores_symbol_as_str(self):
        ''' store_symbol(name, value) should store the value as a str '''
        spec = lancelot.Spec(ExecutionContext())
        spec.when(spec.store_symbol('id', 1))
        spec.then(spec.get_symbol('id')).should_be('1')
        
    @lancelot.verifiable
    def imports_twisted(self):
        ''' Bug #497245: cannot import twisted '''
        from os.path import join, exists
        for location in sys.path:
            pkg = join(location, join('twisted', '__init__.py'))
            if exists(pkg) \
            or exists(pkg + 'c') \
            or exists(pkg + 'o'):
                twisted_found = True
                break 
        lancelot.Spec(twisted_found).it().should_be(True)
        context = ExecutionContext(isolate_imports=False) #TODO: isolated?!
        context.add_import_path(self._nonsrc_path(context))
        spec = lancelot.Spec(context)
        
        spec.get_module('import_twisted').should_be(Type(types.ModuleType))
        spec.get_module('twisted').should_be(Type(types.ModuleType))
        
        context.cleanup_imports()
        
    @lancelot.verifiable
    def log_handles_unrepresentable_objects(self):
        ''' Bug #537032: repr(bad_object) when logging is fatal'''
        class Unrepresentable(object):
            def __repr__(self):
                return self._noSuchAttribute
        
        level = logging.getLogger('Execution').level
        try:
            logging.getLogger('Execution').setLevel(logging.ERROR)
            ctx = ExecutionContext()
            ctx.store_instance('ugh', Unrepresentable())
        finally:
            logging.getLogger('Execution').setLevel(level)

lancelot.grouping(ExecutionContextBehaviour)

@lancelot.verifiable
def instruction_for_behaviour():
    ''' instruction_for should return / instantiate the correct type of 
    instruction, based on the name given in the list passed to it. If the name
    is not recognised the base Instruction class is returned. ''' 
    spec = lancelot.Spec(instruction_for)
    instructions = {'make':Type(Make),
                    'import':Type(Import),
                    'call':Type(Call),
                    'callAndAssign':Type(CallAndAssign),
                    'noSuchInstruction':Type(Instruction)}
    for name, instruction in instructions.items():
        spec.instruction_for(['id', name, []]).should_be(instruction)

class InstructionsBehaviour(object):
    ''' Group of Instructions-related specifications '''

    @lancelot.verifiable
    def loops_through_list(self):
        ''' Instructions should collaborate with instruction_for to instantiate
        a list of instructions, which execute() loops through '''
        mock_fn = lancelot.MockSpec(name='mock_fn')
        mock_make = lancelot.MockSpec(name='mock_make')
        mock_call = lancelot.MockSpec(name='mock_call')
        a_list = [
                  ['id_0', 'make', 'instance', 'fixture', 'argument'],
                  ['id_1', 'call', 'instance', 'f', '3']
                 ]
        instructions = Instructions(a_list, 
                                    lambda item: mock_fn.instruction_for(item))
        spec = lancelot.Spec(instructions)
        ctx = ExecutionContext()
        results = Results() 
        spec.execute(ctx, results).should_collaborate_with(
                mock_fn.instruction_for(a_list[0]).will_return(mock_make),
                mock_make.execute(ctx, results),
                mock_fn.instruction_for(a_list[1]).will_return(mock_call),
                mock_call.execute(ctx, results)
            )
        ctx.cleanup_imports()

    @lancelot.verifiable
    def handles_execute_exceptions(self):
        ''' execute() should catch thrown exceptions and register the 
        instruction as failed '''
        mock_fn = lancelot.MockSpec(name='mock_fn')
        mock_call = lancelot.MockSpec(name='mock_call')
        results = lancelot.MockSpec(name='results')
        a_list = [
                  ['id_', 'call', 'instance', 'fn', 'arg']
                 ]
        instructions = Instructions(a_list, 
                                    lambda item: mock_fn.instruction_for(item))
        spec = lancelot.Spec(instructions)
        ctx = ExecutionContext()
        msg = "I couldn't eat another thing. I'm absolutely stuffed."
        
        # Suppress warning log message that we know will be generated
        logger = logging.getLogger('Instructions')
        log_level = logger.getEffectiveLevel()
        logger.setLevel(logging.ERROR)
        try:
            spec.execute(ctx, results).should_collaborate_with(
                mock_fn.instruction_for(a_list[0]).will_return(mock_call),
                mock_call.execute(ctx, results).will_raise(Exception(msg)),
                results.failed(mock_call, msg, False)
            )
        finally:
            # Put logger back to how it was
            logger.setLevel(log_level)
        ctx.cleanup_imports()

    @lancelot.verifiable
    def handles_stoptest_exceptions(self):
        ''' if stop test exception is thrown  stop executing instructions '''
        mock_fn = lancelot.MockSpec(name='mock_fn')
        mock_call = lancelot.MockSpec(name='mock_call')
        results = lancelot.MockSpec(name='results')
        a_list = [
                  ['id_', 'call', 'instance', 'fn', 'arg'],
                  ['id_', 'call', 'instance2', 'fn2', 'arg2']
                 ]
        instructions = Instructions(a_list, 
                                    lambda item: mock_fn.instruction_for(item))
        spec = lancelot.Spec(instructions)
        ctx = ExecutionContext()
        msg = "I couldn't eat another thing. I'm absolutely stuffed."
        
        # Suppress warning log message that we know will be generated
        logger = logging.getLogger('Instructions')
        log_level = logger.getEffectiveLevel()
        logger.setLevel(logging.ERROR)
        try:
            spec.execute(ctx, results).should_collaborate_with(
                mock_fn.instruction_for(a_list[0]).will_return(mock_call),
                mock_call.execute(ctx, results).will_raise(StopTestException(msg)),
                results.failed(mock_call, msg, True)
            )
        finally:
            # Put logger back to how it was
            logger.setLevel(log_level)
        ctx.cleanup_imports()

lancelot.grouping(InstructionsBehaviour)

class ResultsBehaviour(object):
    ''' Group of related specs for Results behaviour '''
    
    @lancelot.verifiable
    def completed_ok(self):
        ''' completed() for Make should add ok to results list. 
        Results list should be accessible through collection() '''
        instruction = lancelot.MockSpec(name='instruction')
        spec = lancelot.Spec(Results())
        spec.completed(instruction).should_collaborate_with(
            instruction.instruction_id().will_return('a')
            )
        spec.collection().should_be([['a', 'OK']])

    @lancelot.verifiable
    def failed(self):
        ''' failed() should add a translated error message to results list. 
        Results list should be accessible through collection() '''
        formatted_cause = '__EXCEPTION__: message:<<bucket>>'
        instruction = lancelot.MockSpec(name='instruction')
        spec = lancelot.Spec(Results())
        spec.failed(instruction, 'bucket')
        spec.should_collaborate_with(
            instruction.instruction_id().will_return('b')
            )
        spec.collection().should_be([['b', formatted_cause]])

    @lancelot.verifiable
    def failed_with_stoptest(self):
        ''' failed(stop_test=True) should change formatted cause to include
        the stop message '''
        formatted_cause = '__EXCEPTION__:ABORT_SLIM_TEST: message:<<bucket>>'
        instruction = lancelot.MockSpec(name='instruction')
        spec = lancelot.Spec(Results())
        spec.failed(instruction, 'bucket', True)
        spec.should_collaborate_with(
            instruction.instruction_id().will_return('b')
            )
        spec.collection().should_be([['b', formatted_cause]])
        
    @lancelot.verifiable
    def completed_with_result(self):
        ''' completed() for Call should add to results list. 
        Results list should be accessible through collection() '''
        class Fake(object):
            def __str__(self):
                return 'Bon appetit'
        instruction = lancelot.MockSpec(name='instruction')
        spec = lancelot.Spec(Results())
        spec.completed(instruction, result=Fake()).should_collaborate_with(
            instruction.instruction_id().will_return('b'),
            )
        spec.collection().should_be([['b', 'Bon appetit']])
        
    @lancelot.verifiable
    def completed_without_return_value(self):
        ''' completed() should add to results list. 
        Results list should be accessible through collection() '''
        instruction = lancelot.MockSpec(name='instruction')
        spec = lancelot.Spec(Results())
        spec.completed(instruction, result=None).should_collaborate_with(
            instruction.instruction_id().will_return('c')
            )
        spec.collection().should_be([['c', '/__VOID__/']])

lancelot.grouping(ResultsBehaviour)

@lancelot.verifiable
def params_converter_behaviour():
    ''' ParamsConverter should create (possibly nested) tuple of string args
    from a (possibly nested) list of strings (possibly symbols) ''' 
    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args([], 0).should_be(())

    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args(['mint'], 0).should_be(('mint',))

    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args(['wafer', 'thin'], 0).should_be(('wafer', 'thin'))

    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args(['wafer', 'thin'], 1).should_be(('thin', ))

    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args(['$A', '$b_', 'C$'], 0).should_collaborate_with(
        execution_context.get_symbol('A').will_return('X'),
        execution_context.get_symbol('b_').will_return('Y'),
        and_result=(('X', 'Y', 'C$'))
        )

    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args(['$id'], 0).should_collaborate_with(
        execution_context.get_symbol('id').will_return('20'),
        and_result=(('20',))
        )
    
    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args([['bring', 'me'], ['another', 'bucket']], 0).should_be(
                 (('bring', 'me'), ('another', 'bucket'))
        )
                 
    execution_context = lancelot.MockSpec('execution_context')
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args(['$s11$s$s1$s11'], 0).should_collaborate_with(
        execution_context.get_symbol('s11').will_return('I'),
        execution_context.get_symbol('s').will_return('R'),
        execution_context.get_symbol('s1').will_return('O'),
        execution_context.get_symbol('s11').will_return('N'),
        and_result=(('IRON',))
        )

    execution_context = lancelot.MockSpec('execution_context')
    long_multiline_expression = '''$a(long{ \
    multi-line expression})
    $and(another{ \
    multi-line expression})'''
    spec = lancelot.Spec(ParamsConverter(execution_context))
    spec.to_args([long_multiline_expression], 0).should_collaborate_with(
        execution_context.get_symbol('a').will_return('$a'),
        execution_context.get_symbol('and').will_return('$and'),
        and_result=(('%s' % long_multiline_expression,))
        )

@lancelot.verifiable
def pythonic_method_names():
    ''' pythonic should convert camelCase names to pythonic 
    non_camel_case ones'''
    spec = lancelot.Spec(pythonic)
    names = {'method':'method',
             'aMethod':'a_method',
             'camelsHaveHumps': 'camels_have_humps',
             'pythons_are_snakes':'pythons_are_snakes',
             'Parrot':'parrot' }
    for camel, python in names.items():
        spec.pythonic(camel).should_be(python)

if __name__ == '__main__':
    lancelot.verify()