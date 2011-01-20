''' Example of using Slim Markup Hash syntax  -- 
based on http://fitnesse.org/FitNesse.UserGuide.MarkupHashTable

Fitnesse table markup:

|import|
|waferslim.examples.hash_conversion|

|DT:People| !{fname:bob, lname:martin, nname:unclebob} | !{fname:guido, lname:vanRossum, nname:!-BenevolentDictatorForLife-!} |
|Person|nickname?|
|!{fname:bob,lname:martin}|unclebob|
|!{fname:guido,lname:vanRossum}|!-BenevolentDictatorForLife-!|

|DT:People| !{fname:bob, lname:martin, nname:unclebob} | !{fname:guido, lname:vanRossum, nname:!-BenevolentDictatorForLife-!} |
|nickname|Person?|
|unclebob|!{fname:bob, lname:martin}|
|!-BenevolentDictatorForLife-!|!{fname:guido, lname:vanRossum}|

|DT:People| !{fname:bob, lname:martin, id:0} | !{fname:guido, lname:vanRossum, id:1} |
|id|person?|
|0|!{fname:bob, lname:martin}|
|1|!{fname:guido, lname:vanRossum}|
'''

from waferslim.converters import convert_arg, DictConverter

class People:
    ''' Simple class to find a person by matching fname/lname, nickname or id'''
    @convert_arg(using=DictConverter({'id':int}))
    def __init__(self, person1, person2):
        ''' Specify findable people. Note that id values in person dicts will be int ''' 
        self._people = []
        self._people.extend((person1, person2))
        self._current_person = None
        self._current_nickname = None
        self._current_id = None
        
    @convert_arg(to_type=dict)
    def set_person(self, person):
        ''' Specify the person to look for by fname/lname '''
        self._current_person = person
    
    def nickname(self):
        ''' Find the nickname of the matching person '''
        for person in self._people:
            if person['lname'] == self._current_person['lname'] \
            and person['fname'] == self._current_person['fname']:
                return person['nname']
        raise KeyError('No person %s %s' % (self._current_person['fname'],
                                            self._current_person['lname']))
    
    def set_nickname(self, nickname):
        ''' Specify the person to look for by nickname '''
        self._current_nickname = nickname
    
    def person(self):
        ''' Find the fname/lname of the matching person.
        Note that the keys must be sorted in the fitnesse markup,
        i.e. {fname:x,lname:y} is not the same as {lname:y,fname:x} '''
        match = self._current_nickname and self._current_nickname or self._current_id
        match_key = self._current_nickname and 'nname' or 'id'
        for person in self._people:
            if person[match_key] == match:
                return {'fname':person['fname'], 
                        'lname':person['lname']}
        msg = 'No person matching %s %s'
        raise KeyError(msg % (match_key, match))
    
    @convert_arg(to_type=int)
    def set_id(self, value):
        self._current_id = value
