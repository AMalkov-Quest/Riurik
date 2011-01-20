'''
Helper fixture classes that are available for use as libraries.

The latest source code is available at http://code.launchpad.net/waferslim.

Copyright 2009-2010 by the author(s). All rights reserved 
'''

class EchoFixture(object):
    ''' Simple fixture to echo a value back e.g. for variable substitution '''  
    def echo(self, value):
        ''' Echo back the value passed in as a str'''
        return value
