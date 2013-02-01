describe 'create github repo myself', ->
    
    before (done) ->
        $context.repo_title = 'riurik-tests'
        $.when( frame.go( 'github/logout' ) ).then ->
            done()
            
    after ->
        delrepo $context.repo_title
        
    it 'should propose to create repo since given user does not have any one', (done)->
        
        $.when( frame.go( $context.signin_url ) ).then ->
            dialog = _$('div#github-dialogs' )
            $.waitFor.condition( -> dialog.is(':visible') ).then ->
                expect( _$( 'div.modal-header h3', dialog ).text() ).to.be("Hello #{$R.context.login}")
                expect( _$('a.dropdown-toggle').is(':visible') ).to.not.be.ok()
                expect( _$('a.dropdown-toggle') ).to.be.empty()
            
                done()

    it 'should show created repository in the list after refresh', (done)->
        mkrepo $context.repo_title
        $.when( frame.go( $context.signin_url ) ).then ->
            dialog = _$('div#github-dialogs' )
            $.waitFor.condition( -> dialog.is(':visible') ).then ->
                expect( _$( 'div.modal-header h3', dialog ).text() ).to.be("Hello #{$context.login}")
                $context.repo = _$("li:contains('#{$context.repo_title}') a")
                
                $.waitFor.condition( -> $context.repo.is(':visible') ).then ->
                    expect( $context.repo.attr('href') ).to.be("/github/initrepo?title=#{$context.repo_title}")
                    done()
                    
                _$('a.dropdown-toggle').click()
                    
    it 'should init repository', (done)->
        $.waitFor.frame(10000).then ()->
            
            list = _$( 'div#dir-index-id ul li' )
            expect( list ).to.have.length(1)
            
            readme = _$( 'div#dir-index-id ul li' ).first().text().trim()
            $.when( frame.go( "#{readme}?editor" ) ).then ->
                expect( frame.window().editor.getReadOnly() ).to.not.be.ok()
            
                done()
            
        $context.repo[0].click()