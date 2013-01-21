describe 'create github repo myself', ->
    
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
            
    it 'should not show repos list since given user does not have any ones', ->
        
        expect( _$('a.dropdown-toggle').is(':visible') ).to.not.be.ok()
        expect( _$('a.dropdown-toggle') ).to.be.empty()
        
    it 'should show created repository in the list', (done)->
        repo_title = 'riurik-tests'
        mkrepo repo_title
        $.when( frame.go( $R.context.signin_url ) ).then ->
            $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
                _$('a.dropdown-toggle').click()
                
                repo = _$("li:contains('#{repo_title}') a")
                $.waitFor.condition( -> repo.is(':visible') ).then ->
                    expect( repo.is(':visible') ).to.be.ok()
                    $.waitFor.frame(10000).then ()->
                        done()
                        
                    repo[0].click()
