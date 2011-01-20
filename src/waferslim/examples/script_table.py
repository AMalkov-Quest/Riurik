''' Example of a Slim ScriptTable -- 
based on http://fitnesse.org/FitNesse.UserGuide.SliM.ScriptTable
Note that due a limitation of the fitnesse Java code, script tables 
require bool conversion with TrueFalseConverter - however this is the
default bool converter in waferslim.

Fitnesse table markup:

|import|
|waferslim.examples.script_table|

|script|login dialog driver|Bob|xyzzy|
|login with username|Bob|and password|xyzzy|
|check|login message|Bob logged in.|
|reject|login with username|Bob|and password|bad password|
|check|login message|Bob not logged in.|
|ensure|login with username|Bob|and password|xyzzy|
|note|this is a comment|
|show|number of login attempts|
|$symbol=|login message|

This test will pass: all cells will be green. 
'''

class LoginDialogDriver(object):
    ''' Class to be the system-under-test in fitnesse. '''
    
    def __init__(self, user_name, password):
        ''' New instance for the user_name and password specified has 0
        current login attempts and no message '''
        self._user_name = user_name
        self._password = password
        self._login_attempts = 0
        self._message = None
        
    def login_with_username_and_password(self, user_name, password):
        ''' Attempt to login with a user_name/ password combination. Fails
        unless args specified here match those specified in __init__.
        Note: no conversion-related decoration of this method is required 
        because the params are str-s and the return bool value is implicitly
        converted using the default TrueFalseConverter'''
        self._login_attempts += 1
        if self._user_name == user_name and self._password == password:
            self._message = '%s logged in.' % user_name
            return True
        self._message = '%s not logged in.' % user_name
        return False
    
    def login_message(self):
        ''' Expose the internals of the sut to check the login message.
        Note: no conversion-related decoration of this method is required 
        because there are no params and the return value is already a str'''
        return self._message

    def number_of_login_attempts(self):
        ''' Expose the internals of the sut to check number of login attempts.
        Note: no conversion-related decoration of this method is required 
        because there are no params and the numeric return value is 
        implicitly converted by waferslim'''
        return self._login_attempts 
