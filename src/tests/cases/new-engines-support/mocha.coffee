describe 'Array #indexOf()', ->
        
    it 'should return -1 when the value is not present', ->
        expect( [1,2,3].indexOf(5) ).to.be(-1)
    
    it 'should return appropriate posision when the value is present', ->
        expect( [1,2,3].indexOf(3) ).to.be(2)