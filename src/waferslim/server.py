'''
Server classes. 

Run this module to start the WaferSlimServer listening on a host / port:

    Usage: 
        python2 -m waferslim.server [options]
        
    Options:
     -h, --help                  see the full list of options
     -p PORT, --port=...         listen on port PORT (required!)
     -i HOST, --inethost=...     listen on inet address HOST 
                                 (default: localhost)
     -e ENCODING, --encoding=... use byte-encoding ENCODING
                                 (default: utf-8)
     -v, --verbose               log verbose messages at runtime
                                 (default: False)
     -k, --keepalive             keep the server alive to service multiple
                                 requests (requires fork of fitnesse java code)
                                 (default: False)
     -l FILE, --logconf=...      use logging configuration from FILE
     -s PATH, --syspath=...      add entries from PATH to sys.path
    
    A "trailing" numeric value is assumed to be a port number
    if no explicit PORT is specified, so the following are equivalent
    within fitnesse :
    COMMAND_PATTERN {python2 -m waferslim.server --syspath %p } 
    COMMAND_PATTERN {python2 -m waferslim.server --syspath %p --port } 
    
The latest source code is available at http://code.launchpad.net/waferslim.

Copyright 2009-2010 by the author(s). All rights reserved 
'''
import codecs, logging.config, os, SocketServer, sys
from optparse import OptionParser
import waferslim.protocol

_LOGGER_NAME = 'WaferSlimServer'
_ALL_LOGGER_NAMES = (_LOGGER_NAME, 'Instructions', 'Execution')

class SlimRequestHandler(SocketServer.BaseRequestHandler, 
                         waferslim.protocol.RequestResponder):
    ''' Delegated the responsibility of handling TCP socket requests from
    the server -- in turn most of the work is passed off to the mixin class
    RequestResponder '''
    
    def __new__(cls, *args, **kwds):
        ''' Support for IronPython 2.6 '''
        return object.__new__(SlimRequestHandler, *args, **kwds)
      
    def handle(self):
        ''' log some info about the request then pass off to mixin class '''
        from_addr = '%s:%s' % self.client_address
        self.info('Handling request from %s' % from_addr)
        
        try:
            received, sent = self.respond_to_request(isolate_imports=SlimRequestHandler.ISOLATE_IMPORTS)
            done_msg = 'Done with %s: %s bytes received, %s bytes sent'
            self.info(done_msg % (from_addr, received, sent))
        except Exception, error:
            logging.error(error, exc_info=1)

        self.server.done(self)
        
    def info(self, msg):
        ''' log an info msg - present in this class to allow use from mixin'''
        logging.getLogger(_LOGGER_NAME).info(msg)
        
    def debug(self, msg):
        ''' log a debug msg - present in this class to allow use from mixin'''
        logging.getLogger(_LOGGER_NAME).debug(msg)

class WaferSlimServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    ''' Standard python library threaded TCP socket server __init__-ed 
    to delegate request handling to SlimRequestHandler ''' 
    
    def __init__(self, options):
        ''' Initialise socket server on host and port, with logging '''
        self._keepalive = options.keepalive
        SlimRequestHandler.ISOLATE_IMPORTS = options.keepalive
        if options.verbose:
            for name in _ALL_LOGGER_NAMES:
                logging.getLogger(name).setLevel(logging.DEBUG)
                
        if not hasattr(self, 'shutdown'): # only introduced in 2.6
            self._up = [True]
            self.shutdown = lambda: self._up and self._up.pop() or self._up
            self.serve_forever = self._serve_until_shutdown
        
        prestart_msg = "Starting server v%s with options: %s" % \
                        (waferslim.__version__ ,options)
        logging.getLogger(_LOGGER_NAME).info(prestart_msg)
        
        server_address = (options.inethost, int(options.port))
        SocketServer.TCPServer.__init__(self, 
                                        server_address, SlimRequestHandler)
        
        start_msg = "Started and listening on %s:%s" % self.server_address
        logging.getLogger(_LOGGER_NAME).info(start_msg)
        
    def done(self, request_handler):
        ''' A request_handler has completed: if keepalive=False then gracefully
        shut down the server'''
        if not self._keepalive:
            logging.getLogger(_LOGGER_NAME).info('Shutting down')
            self.shutdown()
            
    def _serve_until_shutdown(self):
        ''' Handle requests until shutdown is called '''
        import time
        if self._keepalive:
            while self._up:
                self.handle_request()
        else:
            self.handle_request()
            while self._up:
                time.sleep(1)
                pass

def _get_options():
    ''' Convenience method to parse command line args'''
    parser = OptionParser()
    parser.add_option('-p', '--port', dest='port', 
                      metavar='PORT',
                      help='listen on port PORT')
    parser.add_option('-i', '--inethost', dest='inethost', 
                      metavar='HOST', default='localhost',
                      help='listen on inet address HOST (default: localhost)')
    parser.add_option('-e', '--encoding', dest='encoding', 
                      metavar='ENCODING', default='utf-8',
                      help='byte (de-)encode with ENCODING (default: utf-8)')
    parser.add_option('-v', '--verbose', dest='verbose', 
                      default=False, action='store_true',
                      help='log verbose messages at runtime (default: False)')
    parser.add_option('-k', '--keepalive', dest='keepalive', 
                      default=False, action='store_true',
                      help='keep alive for multiple requests (default: False)')
    parser.add_option('-l', '--logconf', dest='logconf', 
                      metavar='CONFIGFILE', default='', 
                      help='use logging configuration from CONFIGFILE')
    parser.add_option('-s', '--syspath', dest='syspath', 
                      metavar='SYSPATH', default='', 
                      help='add entries from SYSPATH to sys.path')
    return parser.parse_args()

def _setup_logging(options):
    ''' Configure standard logging package '''
    if os.path.exists(options.logconf):
        logging.config.fileConfig(options.logconf)
    else:
        logging.basicConfig()
        if options.logconf:
            logging.warn('Invalid logging config file: %s' % options.logconf)

def _setup_syspath(options):
    ''' Configure syspath '''
    for element in options.syspath.split(os.pathsep):
        sys.path.append(element)

def _setup_encoding(options):
    ''' Configure byte (de-)encoding to use '''
    if codecs.lookup(options.encoding):
        waferslim.protocol.BYTE_ENCODING = options.encoding    
    
def _setup_port(options, args):
    ''' If port is not explicitly specified and there are leftover args, the
    last numeric arg must be the port number passed in from fitnesse '''
    if args and not options.port:
        args.reverse()
        for arg in args:
            if arg.isdigit():
                options.port = arg
                break

def start_server():
    ''' Convenience method to start the server (used by __main__)'''
    (options, args) = _get_options()

    _setup_logging(options)
    _setup_syspath(options)
    _setup_encoding(options)
    _setup_port(options, args)
    WaferSlimServer(options).serve_forever()

if __name__ == '__main__':
    start_server()
