describe( 'Array', function() {
    describe( '#indexOf()', function() {
        it( 'should return -1 when the value is not present', function() {
            expect([1,2,3].indexOf(5)).to.eql(-1);
        })
        it( 'should return appropriate posision when the value is present', function() {
            expect([1,2,3].indexOf(3)).to.eql(2);
        })
    })
})