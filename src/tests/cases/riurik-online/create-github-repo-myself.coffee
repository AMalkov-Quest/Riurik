describe 'create github repo myself', ->
    
    before (done) ->
        $context.repo_title = 'riurik-tests'
        $.when( frame.go( 'github/logout' ) ).then ->
            $.when( frame.go( $context.signin_url ) ).then ->
                done()
            
    after ->
        delrepo $context.repo_title
        
    describe 'should propose to create repo since given user does not have any one', ->
        
        before ->
            $context.dialog = _$('div#github-dialogs' )
            
        it 'the welcome dialog to login with github should be shown', (done)->
            $.waitFor.condition( -> $context.dialog.is(':visible') ).then ->
                done()
    
        it 'the dialog should have a title', ->
            expect( _$( 'div.modal-header h3', $context.dialog ).text() ).to.be("Hello #{$R.context.login}")
            
        it 'list of repos should not be visible initially', ->
            expect( _$('a.dropdown-toggle').is(':visible') ).to.not.be.ok()


    describe 'should show created repository in the list after refresh', ->
        
        before (done)->
            mkrepo $context.repo_title
            $.when( frame.go( $context.signin_url ) ).then ->
                dialog = _$('div#github-dialogs' )
                $.waitFor.condition( -> dialog.is(':visible') ).then ->
                    done()
                
        it 'should show message to select repo', ->
            expect( _$( 'a.dropdown-toggle' ) ).to.be.visible
            expect( _$( 'a.dropdown-toggle' ) ).to.contain('Select repository')
            
        it 'the repo title should be shown', (done)->
            $context.repo = _$("li:contains('#{$context.repo_title}') a")
            $.waitFor.condition( -> $context.repo.is(':visible') ).then ->
                done()
                    
            _$('a.dropdown-toggle').click()
            
        it 'the repo should have appropriate href for init', ->
            expect( $context.repo.attr('href') ).to.be("/github/initrepo?title=#{$context.repo_title}")
                    
    describe 'should init repository', ->
        
        before (done)->
            $.waitFor.frame(10000).then ->
                done()
                
            $context.repo[0].click()
                
        it 'should show content of the repo', ->
            list = _$( 'div#dir-index-id ul li' )
            expect( list.length ).to.equal(1)
            
        it 'should show and allow to edit content of the file', (done)->
            readme = _$( 'div#dir-index-id ul li' ).first().text().trim()
            $.when( frame.go( "#{readme}?editor" ) ).then ->
                expect( frame.window().editor.getReadOnly() ).to.not.be.ok()
            
                done()