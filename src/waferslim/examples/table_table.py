''' Example of a Slim 'Table' Table -- 
based on http://fitnesse.org/FitNesse.UserGuide.SliM.TableTable
This kind of table has to do all the calculation work for determining whether
an actual result for a cell is the same as the expected result, and passes
back cell-by-cell result values.

Fitnesse table markup:

|import|
|waferslim.examples.table_table|

|Table:Bowling|
|3|5|4|/|X||X||3|4|6|/|7|2|3|4|9|-|4|/|3|
||8||28||51||68||75||92||101||108||117|||130|

This test fails as the code for calculating scores is not implemented:
all the "score" cells in the second row of the table will be coloured red
and contain the text "NOT IMPLEMENTED". 
'''
from waferslim.converters import TableTableConstants

class Bowling(object):
    ''' Class to be the system-under-test in fitnesse. '''
    
    def do_table(self, table_rows):
        ''' Standard entry point for Slim Table Table. 
        table_rows is a tuple containing a tuple for each row in the 
        fitnesse table (in this case 1 row for rolls and 1 row for scores)'''
        return self._score_game(table_rows[0], table_rows[1])
        
    def _score_game(self, rolls, expected_scores):
        ''' Calculate the actual scores for each roll, and determine 
        how they differ from the expected scores '''
        actual_scores = []
        game = BowlingGame(actual_scores)
        for roll in rolls:
            game.roll(roll)
        score_differences = [self._differs(i, expected_scores, actual_scores) \
                             for i in range(0, len(expected_scores)) ]
        return [[TableTableConstants.cell_no_change() for roll in rolls], 
                score_differences]
    
    def _differs(self, at_position, expected, actual):
        ''' Determine if expected and actual results at_position match''' 
        if expected[at_position] == actual[at_position]:
            return TableTableConstants.cell_correct()
        return TableTableConstants.cell_incorrect(actual[at_position])

class BowlingGame(object):
    ''' A bowling game -- scoring is not implemented ;-) '''
    _NO_PINS = '-'
    _STRIKE = 'X'
    _SPARE = '/'
    
    def __init__(self, score_holder):
        ''' Set up a new game with a list to act as score_holder''' 
        self._score_holder = score_holder
        
    def roll(self, outcome):
        ''' Roll a ball that knocks down some pins to produce the outcome '''
        self._score_holder.append('NOT IMPLEMENTED')

