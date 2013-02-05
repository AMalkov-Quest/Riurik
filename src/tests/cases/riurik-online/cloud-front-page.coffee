describe 'cloud front page', ->
    
    before (done) ->
        $context.gitlink_selector = "a#github"
        $context.index_selector = "div#dir-index-id ul li"
        $.when( frame.go( 'github/logout' ) ).then ->
            done()
            
    it 'should show only login with github link on the toolbar', (done)->
        
        $.when( frame.go( '' ) ).then ->
            expect( _$( $context.gitlink_selector ) ).to.be.visible
            expect( _$('#configure') ).not.to.be.visible
            
            done()
            
    it 'should show the welcome dialog to login with github', (done)->
        
        dialog_selector = "div#github-dialogs"
        $.waitFor.condition( -> _$( dialog_selector ).is(':visible') ).then ->
            
            dialog = _$( dialog_selector )
            expect( _$( '#log-in-with-github', dialog ) ).to.contain( 'Log in with Github' )

            done()
            
        _$( $context.gitlink_selector ).click()
        
    it 'should provide options to login with github', (done)->
        dropdown_menu_selector = 'ul.dropdown-menu'
        expect( _$( dropdown_menu_selector ) ).not.to.be.visible
        
        options = _$("#{dropdown_menu_selector} li")
            
        expect( options ).to.have.length( 3 )
        expect( _$('a', options[0]) ).to.have.attr( 'href', $context.login_url )
        expect( _$('a', options[1]) ).to.have.attr( 'href', $context.login_url + 'public_repo' )
        expect( _$('a', options[2]) ).to.have.attr( 'href', $context.login_url + 'repo' )
            
        $.waitFor.condition( -> _$('ul.dropdown-menu' ).is(':visible') ).then ->
            
            expect( _$('a', options[0]) ).to.be.visible
            expect( _$('a', options[1]) ).to.be.visible
            expect( _$('a', options[2]) ).to.be.visible
            
            done()
    
        _$('a.dropdown-toggle').click()
        
    it 'should show the riurik inner tests folder', ->
        
        list = _$( 'div#dir-index-id ul li' )
        expect( list ).to.have.length(1)
        context.folder_root = list.first().text().trim()
        expect( context.folder_root ).to.equal( 'riurik-inner-tests' )
                
    it 'should show content of the riurik inner tests folder', (done)->
        $.when( frame.go( context.folder_root ) ).then ->
            
            $context.list = _$( $context.index_selector )
            expect( $context.list ).not.to.be.empty
            
            expect( _$('ul.horizontal-menu') ).to.have.length(1)
            expect( _$( $context.gitlink_selector ) ).to.be.visible
            expect( _$('#virtual-settings') ).not.to.be.visible
            expect( _$('#new-suite') ).not.to.be.visible
            
            done()

    it 'should show content of the riurik inner tests suite', (done)->
        
            context.subfolder = $context.list.first().text().trim()
            $.when( frame.go( "#{context.folder_root}/#{context.subfolder}" ) ).then ->
                
                list = _$( $context.index_selector )
                expect( list ).not.to.be.empty
                #expect( list ).to.have.length(1)
                
                expect( _$('ul.horizontal-menu') ).to.have.length(1)
                expect( _$( $context.gitlink_selector ) ).to.be.visible
            
                expect( _$('#run-suite-btn') ).not.to.be.visible
                expect( _$('#history') ).not.to.be.visible
                expect( _$('#context-preview-ctrl') ).not.to.be.visible
                expect( _$('#spec-link') ).not.to.be.visible
                expect( _$('#new-test') ).not.to.be.visible
            
                done()

    it 'shold show read only test scripts content', (done)->

        test_script = _$( 'div#dir-index-id ul li' ).first().text().trim()
        context.test_script_fullpath = "#{context.folder_root}/#{context.subfolder}/#{test_script}?editor"
        $.when( frame.go( context.test_script_fullpath ) ).then ->
            
            expect( frame.window().editor.getReadOnly() ).to.be.ok
            expect( _$('#run') ).to.be.visible
            expect( _$('#close') ).to.be.visible
            expect( _$('#unstub') ).not.to.be.visible

            done()

    it 'should not support mutual exclusion mechanism in readonly mode', (done)->
        
        emulateAnotherSession _$
        $.when( frame.go( context.test_script_fullpath ) ).then ->
            expect( _$('#unstub') ).not.to.be.visible
            
            restorePreviousSession _$
            done()