describe 'cloud front page', ->
    
before (done) ->
    $.when( frame.go( 'github/logout' ) ).then ->
        done()
        
it 'should show login with github link', (done)->
    $.when( frame.go( '' ) ).then ->
        
        expect( _$('a#github') ).to.be.visible()
        
        done()