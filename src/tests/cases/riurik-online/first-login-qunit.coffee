module 'first login'

asyncTest 'setup', ->
    $.when( frame.go( 'github/logout' ) ).then ->
        $.when( frame.go( '' ) ).then ->
            $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
                _$('select#scope option[value="public_repo"]').attr('selected', 'selected')
                start()
            
            _$('a#github').click()
            
asyncTest 'should show github authorization dialog', ->
    $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
        options = _$('ul.dropdown-menu li')
        
        equal options.length, 3
        equal _$('a', options[0]).attr('href'), context.login_url
        equal _$('a', options[1]).attr('href'), context.login_url + 'public_repo'
        equal _$('a', options[2]).attr('href'), context.login_url + 'repo'
        
        start()

    _$('a.dropdown-toggle').click()
    
asyncTest 'should propose to create repository', ->
    $.when( frame.go( context.signin_url ) ).then ->
        $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
            ok not _$('a.dropdown-toggle').is(':visible')
            start()
        
asyncTest 'should show created repository in the list', ->
    repo_title = 'riurik-tests'
    mkrepo repo_title
    $.when( frame.go( context.signin_url ) ).then ->
        $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
            _$('a.dropdown-toggle').click()
            
            repo = _$("li:contains('#{repo_title}') a")
            $.waitFor.condition( -> repo.is(':visible') ).then ->
                ok repo.is(':visible')
                
                $.waitFor.frame(10000).then ()->
                    start()
                    
                repo[0].click()
            
test 'teardown', ->
    delrepo 'riurik-tests'
