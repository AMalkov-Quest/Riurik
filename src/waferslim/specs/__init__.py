'''
BDD-style Lancelot specifications for the behaviour of the core library classes
Lancelot is distributed at http://pypi.python.org/pypi/lancelot
and the latest source is available at https://launchpad.net/lancelot.
'''

import lancelot

if __name__ == '__main__':
    from waferslim.specs import protocol_spec, instruction_spec, \
                                execution_spec, converter_spec, \
                                fixtures_spec, integration
    lancelot.verify(fail_fast=False)