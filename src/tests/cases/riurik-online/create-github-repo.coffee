describe 'create github repo', ->
    
    before (done) ->
        $.when( frame.go( 'github/logout' ) ).then ->
            $.when( frame.go( $R.context.signin_url ) ).then ->
                done()
            
    after ->
        delrepo 'riurik-tests'
        
    it 'should propose to create repository after login', (done)->
        
        dialog = _$('div#github-dialogs' )
        $.waitFor.condition( -> dialog.is(':visible') ).then ->
            expect( _$( 'div.modal-header h3', dialog ).text() ).to.be("Hello #{$R.context.login}")
            done()