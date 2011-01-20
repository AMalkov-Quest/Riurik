'''
BDD-style Lancelot specifications for the behaviour of the core library classes
'''

import lancelot
from lancelot.comparators import Type, Anything
from waferslim.protocol import pack, unpack, UnpackingError, RequestResponder
from waferslim.protocol import is_chunk
from waferslim.execution import ExecutionContext, Results

SAMPLE_DATA = [
               ([],                    '[000000:]'),
               (['hello'],             '[000001:000005:hello:]'),
               (['hello','world'],     '[000002:000005:hello:000005:world:]'),
               ([['element']],         '[000001:000024:[000001:000007:element:]:]'),
               (['[square] braces'],   '[000001:000015:[square] braces:]'),
               ([['[square] braces']], '[000001:000032:[000001:000015:[square] braces:]:]')
              ]

class PackBehaviour(object):
    ''' Group of specs for pack() behaviour '''
    
    @lancelot.verifiable
    def items_length_item_format(self):
        ''' Encoding as described in fitnesse.slim.ListSerializer Javadoc:
        Format:  [iiiiii:llllll:item...]
        All lists (including lists within lists) begin with [ and end with ].  
        After the [ is the 6 digit number of items in the list followed by a :.
        Then comes each item which is composed of a 6 digit length a : and 
        then the value of the item followed by a :. '''
        spec = lancelot.Spec(pack)
        for unpacked, packed in SAMPLE_DATA:
            spec.pack(unpacked).should_be(packed)
    
    @lancelot.verifiable
    def cant_pack_non_strings(self):
        ''' Non string values should be rejected, as packed items have
        already been str-ified via the Results() collecting parameter ''' 
        spec = lancelot.Spec(pack)
        spec.pack([1]).should_raise(TypeError)

lancelot.grouping(PackBehaviour)

class UnpackBehaviour(object):
    ''' Group of specs for unpack() behaviour '''
    
    @lancelot.verifiable
    def unpack_strings_only(self):
        ''' Unpacking a non-string should raise an error ''' 
        spec = lancelot.Spec(unpack)
        spec.unpack(None).should_raise(TypeError('None is not a string'))
        spec.unpack(1).should_raise(TypeError('1 is not a string'))
        spec.unpack([]).should_raise(TypeError('[] is not a string'))
        
    @lancelot.verifiable
    def require_square_brackets(self):
        ''' Unpacking a string without a leading square bracket, 
        or a string without an ending square bracket should raise an error ''' 
        spec = lancelot.Spec(unpack)
        spec.unpack('').should_raise(
            UnpackingError("'' has no leading '['"))
        spec.unpack('[hello').should_raise(
            UnpackingError("'[hello' has no trailing ']'"))
        spec.unpack('hello]').should_raise(
            UnpackingError("'hello]' has no leading '['"))

    @lancelot.verifiable
    def require_separators(self):
        ''' Unpacking a string without separators should raise an error ''' 
        spec = lancelot.Spec(unpack)
        spec.unpack('[000000]').should_raise(
            UnpackingError("'[000000]' has no ':' separator at pos 7"))
        spec.unpack('[000001:000000]').should_raise(
            UnpackingError("'[000001:000000]' has no ':' separator at pos 14"))
        
    @lancelot.verifiable
    def items_length_item_format(self):
        ''' Unpacking should reverse the encoding process '''
        spec = lancelot.Spec(unpack)
        for unpacked, packed in SAMPLE_DATA:
            spec.unpack(packed).should_be(unpacked)

lancelot.grouping(UnpackBehaviour)

@lancelot.verifiable
def request_responder_behaviour():
    ''' RequestResponder should send an ACK then recv a message 
    header and message contents: then EITHER send a response and loop back 
    to recv; OR if the message content is a "bye" then terminate '''
    request = lancelot.MockSpec(name='request')
    instructions = lancelot.MockSpec(name='instructions')
    request_responder = RequestResponder()
    request_responder.request = request
    spec = lancelot.Spec(request_responder)
    spec.respond_to_request(instructions=lambda data: instructions)
    spec.should_collaborate_with(
        request.send('Slim -- V0.1\n'.encode('utf-8')).will_return(2),
        request.recv(7).will_return('000009:'.encode('utf-8')),
        request.recv(1024).will_return('[000000:]'.encode('utf-8')),
        instructions.execute(Type(ExecutionContext), Type(Results)),
        request.send('000009:[000000:]'.encode('utf-8')).will_return(4),
        request.recv(7).will_return('000003:'.encode('utf-8')),
        request.recv(1024).will_return('bye'.encode('utf-8')),
        and_result=(7+9+7+3, 2+4))
    
    request = lancelot.MockSpec(name='request')
    instructions = lancelot.MockSpec(name='instructions')
    request_responder = RequestResponder()
    request_responder.request = request
    spec = lancelot.Spec(request_responder)
    spec.respond_to_request(instructions=lambda data: instructions)
    spec.should_collaborate_with(
        request.send('Slim -- V0.1\n'.encode('utf-8')).will_return(2),
        request.recv(7).will_return('000009:'.encode('utf-8')),
        request.recv(1024).will_return('[000000:]'.encode('utf-8')),
        instructions.execute(Type(ExecutionContext), Type(Results)),
        request.send('000009:[000000:]'.encode('utf-8')).will_return(4),
        request.recv(7).will_return('000009:'.encode('utf-8')),
        request.recv(1024).will_return('[000000:]'.encode('utf-8')),
        instructions.execute(Type(ExecutionContext), Type(Results)),
        request.send('000009:[000000:]'.encode('utf-8')).will_return(8),
        request.recv(7).will_return('000003:'.encode('utf-8')),
        request.recv(1024).will_return('bye'.encode('utf-8')),
        and_result=(7+9+7+9+7+3, 2+4+8))
    
@lancelot.verifiable
def responder_handles_errors():
    ''' RequestResponder should handle UnpackingError-s gracefully'''
    request = lancelot.MockSpec(name='request')
    instructions = lancelot.MockSpec(name='instructions')
    request_responder = RequestResponder()
    request_responder.request = request
    spec = lancelot.Spec(request_responder)
    spec.respond_to_request(instructions=lambda data: instructions)
    unpacking_error = '000109:[000001:000092:' \
        + '[000002:000014:UnpackingError:000053:' \
        + '__EXCEPTION__: message:<<MALFORMED_INSTRUCTION mint>>:]:]'
    spec.should_collaborate_with(
        request.send('Slim -- V0.1\n'.encode('utf-8')).will_return(2),
        request.recv(7).will_return('000009:'.encode('utf-8')),
        request.recv(1024).will_return('[000000:]'.encode('utf-8')),
        instructions.execute(Anything(), 
                             Anything()).will_raise(UnpackingError('mint')),
        request.send(unpacking_error.encode('utf-8')).will_return(6),
        request.recv(7).will_return('000003:'.encode('utf-8')),
        request.recv(1024).will_return('bye'.encode('utf-8')),
        and_result=(7+9+7+3, 2+6))

@lancelot.verifiable
def is_chunk_should_ignore_square_braces_in_data():
    spec = lancelot.Spec(is_chunk)
    is_a_chunk = '[000002:000005:input:000006:output:]'
    not_a_chunk = '[a, b, c]'
    spec.is_chunk(is_a_chunk).should_be(True)
    spec.is_chunk(not_a_chunk).should_be(False)
    
@lancelot.verifiable
def is_chunk_should_ignore_multiple_lines_in_data():
    ''' Bug #537026 '''
    spec = lancelot.Spec(is_chunk)
    is_a_chunk = '''[000002:000005:in
    put:000006:out
    put:]'''
    not_a_chunk = '''[in
    put a, in
    put b, in
    put c]'''
    spec.is_chunk(is_a_chunk).should_be(True)
    spec.is_chunk(not_a_chunk).should_be(False)

if __name__ == '__main__':
    lancelot.verify()