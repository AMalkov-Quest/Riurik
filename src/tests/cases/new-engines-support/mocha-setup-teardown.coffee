describe 'before hooks', ->
    
    beforeCounter = 0
    beforeEachCounter = 0
    
    before ->
        beforeCounter++
        
    beforeEach ->
        beforeEachCounter++
    
    it 'first beforeEach call', ->
        expect( beforeEachCounter ).to.be(1)
        
    it 'second beforeEach call', ->
        expect( beforeEachCounter ).to.be(2)

    it 'but before should be called once', ->
        expect( beforeCounter ).to.be(1)