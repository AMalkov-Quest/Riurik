'''
Simplistic classes and functions for use only in specs
'''

class ClassWithNoArgs(object):
    ''' A class to instantiate with a no-arg constructor'''
    pass

class ClassWithOneArg(object):
    ''' A class to instantiate with a one-arg constructor'''
    def __init__(self, arg):
        pass

class ClassWithTwoArgs(object):
    ''' A class to instantiate with a two-arg constructor'''
    def __init__(self, arg1, arg2):
        pass

class _Parrot(object):
    ''' A class to use as an underlying system under test ''' 
    def is_dead(self):
        return False

class ClassWithSystemUnderTestMethod(object):
    ''' A class that wishes to expose an underlying sut '''
    def sut(self):
        return _Parrot() 
    
class ClassWithSystemUnderTestField(object):
    ''' Another class that wishes to expose an underlying sut '''
    def __init__(self):
        self.sut = _Parrot() 