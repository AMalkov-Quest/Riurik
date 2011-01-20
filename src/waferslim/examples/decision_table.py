''' Example of a Slim DecisionTable -- 
based on http://fitnesse.org/FitNesse.UserGuide.SliM.DecisionTable

Fitnesse table markup:

|import|
|waferslim.examples.decision_table|

|should I buy milk|
|cash in wallet|credit card|pints of milk remaining|go to store?|
|      0       |    no     |      0                |    no      |
|      10      |    no     |      0                |    yes     |
|      0       |    yes    |      0                |    yes     |
|      10      |    yes    |      0                |    yes     |
|      0       |    no     |      1                |    no      |
|      10      |    no     |      1                |    no      |
|      0       |    yes    |      1                |    no      |
|      10      |    yes    |      1                |    nope    |

|should I buy milk alternative implementation|
|cash in wallet|credit card|pints of milk remaining|go to store?|
|      0       |    no     |      0                |    no      |
|      10      |    no     |      0                |    yes     |
|      0       |    yes    |      0                |    yes     |
|      10      |    yes    |      0                |    yes     |
|      0       |    no     |      1                |    no      |
|      10      |    no     |      1                |    no      |
|      0       |    yes    |      1                |    no      |
|      10      |    yes    |      1                |    nope    |

This test will pass apart from the last row in each table 
whose "nope" values will be red.
'''

from waferslim.converters import convert_arg, convert_result, YesNoConverter

# Most conversion can be handled using the standard registered converters
# but we're using (for better table readability) the bool YesNoConverter 
# 'temporarily' here, ie for only this table within the suite.
_YESNO_CONVERTER = YesNoConverter()

class ShouldIBuyMilk(object):
    ''' Class to be the system-under-test in fitnesse. '''
    
    def __init__(self):
        ''' New instance has no cash, credit or pints of milk '''
        self._cash = 0
        self._credit = False
        self._pints = 0
        
    @convert_arg(to_type=int)
    def set_cash_in_wallet(self, int_amount):
        ''' Decorated method to set cash as an int.
        The decorator uses the implicitly registered int converter to 
        translate from a standard slim string value to an int. '''
        self._cash = int_amount
        
    @convert_arg(using=_YESNO_CONVERTER)
    def set_credit_card(self, bool_value):
        ''' Decorated method to set credit as a bool.
        The decorator uses an explicitl bool converter to 
        translate from a standard slim string value. '''
        self._credit = bool_value
        
    @convert_arg(to_type=int)
    def set_pints_of_milk_remaining(self, int_amount):
        ''' Decorated method to set pints of milk as an int.
        The decorator uses the implicitly registered int converter to 
        translate from a standard slim string value to an int. '''
        self._pints = int_amount
    
    @convert_result(using=_YESNO_CONVERTER)
    def go_to_store(self):
        ''' Return whether I should go to the store or not.
        The bool return value will be converted to a str with the
        YesNoConverter we explicitly supplied. For examples of
        methods with return values that are not decorated,
        because the conversion is done implicitly, see script_table).'''
        return self._pints == 0 and (self._credit or self._cash > 2)

class ShouldIBuyMilkAlternativeImplementation(ShouldIBuyMilk):
    ''' Alternative implementation of ShouldIBuyMilk to illustrate
    use of execute() and reset() methods. '''
    
    def __init__(self):
        ''' New instance will not go to store by default '''
        ShouldIBuyMilk.__init__(self)
        self._go_to_store = False
        
    @convert_result(using=_YESNO_CONVERTER)
    def go_to_store(self):
        ''' Return whether I should go to the store or not, this time with
        the calculation done elsewhere.'''
        return self._go_to_store
    
    def execute(self):
        ''' Slim-standard method that will be invoked after variables are set,
        if it is present ''' 
        if self._pints == 0 and (self._credit or self._cash > 2):
            self._go_to_store = True
    
    def reset(self):
        ''' Slim-standard method that will be invoked before each table row, 
        if it is present ''' 
        self._go_to_store = False
