describe 'front page page for github', ->
    
    before (done)->
        $.when( frame.go( 'github/logout' ) ).then ->
            $.when( frame.go( '' ) ).then ->
                done()
            
    describe 'only login with github link on the toolbar should be snown', ->
        
        it 'login with github link should be visible', ->
            expect( _$( $context.gitlink_selector ) ).to.be.visible
            
        it 'the Configure link should not be visible', ->
            expect( _$('#configure') ).not.to.be.visible
            
    describe 'the welcome dialog to login with github should be shown', (done)->
        
        before ->
            $context.dialog_selector = "div#github-dialogs"
            _$( $context.gitlink_selector ).click()
            
        it 'the dialog should be shown', (done)->
            $.waitFor.condition( -> _$( $context.dialog_selector ).is(':visible') ).then ->
                done()
                
        it 'the dialog should have title', ->
            dialog = _$( $context.dialog_selector )
            expect( _$( '#log-in-with-github', dialog ) ).to.contain( 'Log in with Github' )
            
    describe 'the dialog should provide options to login with github', ->
        
        before ->
            $context.dropdown_menu_selector = 'ul.dropdown-menu'
            $context.options = _$("#{$context.dropdown_menu_selector} li")
            
        it 'a message to procede with options is shown', ->
            expect( _$( 'div.dropdown#scope' ) ).to.be.visible
            
        it 'but the options as a dropdown menu is not visible initially', ->
            expect( _$( $context.dropdown_menu_selector ) ).not.to.be.visible
            
        it 'OAuth protocol is used to let Riurik request authorization to github. Read-only access by default', ->
            expect( _$( 'a', $context.options[0] ) ).to.have.attr( 'href', $context.login_url )
            
        it 'to initialize Riurik workspace a user can allow read/write access to public repos', ->
            expect( _$('a', $context.options[1]) ).to.have.attr( 'href', $context.login_url + 'public_repo' )
            expect( _$('a', $context.options[1] ).text() ).to.equal( 'I would like to create new repository myself' )
            
        it 'to simplify the initialization a user can allow read/write access to private repos', ->
            expect( _$('a', $context.options[2]) ).to.have.attr( 'href', $context.login_url + 'repo' )
            expect( _$('a', $context.options[2] ).text() ).to.equal( 'Create new repository on my behalf' )
        
        it 'the options dropdown menu should be visible by click', (done)->
            $.waitFor.condition( -> _$( $context.dropdown_menu_selector ).is(':visible') ).then ->
                done()
                
            _$('a.dropdown-toggle').click()
        