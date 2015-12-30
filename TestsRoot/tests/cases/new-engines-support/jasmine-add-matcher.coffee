describe 'Hello world', ->

    beforeEach ->
        this.addMatchers
            toBeDivisibleByTwo: ->
                return (this.actual % 2) == 0

    it 'is divisible by 2', ->
        expect( 2 ).toBeDivisibleByTwo()
        
        