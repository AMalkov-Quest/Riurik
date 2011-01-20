from waferslim import WaferSlimException
from waferslim.execution import Results, ExecutionContext, Instructions
import __builtin__, logging, re, sys, threading
from waferslim.instructions import Instruction, Make, Call, CallAndAssign, Import
from waferslim.converters import to_string

_INSTRUCTION_TYPES = {'make':Make,
                      'import':Import,
                      'call':Call,
                      'callAndAssign':CallAndAssign }

class UnpackingError(WaferSlimException):
    ''' An attempt was made to unpack messages that do not conform 
    to the protocol spec '''  
    
    def instruction_id(self):
        ''' Failure needs to be related to an instruction '''
        return 'UnpackingError'
            
    def description(self):
        ''' Describe this failure '''
        return 'MALFORMED_INSTRUCTION %s' % self.args[0]

try:
    # for python 2.6+
    import json
except:
    # for python 2.5
    import simplejson as json

def unpack(message):
    try:
        data = json.loads(message)
    except Exception, ex:
        raise UnpackingError(str(ex))
    return data    

def pack(data):
    message = json.dumps(data)
    return message    



