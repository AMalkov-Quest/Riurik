describe 'FrontPage', ->
    
before (done) ->
    $.when( frame.go( 'github/logout' ) ).then ->
        $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
            _$('select#scope option[value="public_repo"]').attr('selected', 'selected')
            done()
            
        _$('a#github').click()
        
after ->
    delrepo 'riurik-tests'

it 'should invite to login with github', (done)->
    $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
        options = _$('ul.dropdown-menu li')
        
        expect( options.length ).to.be( 3 )
        expect( _$('a', options[0]).attr('href') ).to.be( $R.context.login_url )
        expect( _$('a', options[1]).attr('href') ).to.be( $R.context.login_url + 'public_repo' )
        expect( _$('a', options[2]).attr('href') ).to.be( $R.context.login_url + 'repo' )
        
        done()

    _$('a.dropdown-toggle').click()
    
it 'should propose to create repository', (done)->
    $.when( frame.go( $R.context.signin_url ) ).then ->
        $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
            expect( _$('a.dropdown-toggle').is(':visible') ).to.not.be.ok()
            done()
        
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