describe 'create github repo myself', ->
    
    before ->
        repo_title = 'riurik-tests'
        #mkrepo repo_title
        github = new Github
            username: "#{$R.context.login}"
            password: "#{$R.context.password}"
            auth: "basic"

        @repo = github.getRepo "#{$R.context.login}", "#{repo_title}"
            
    #after ->
    #    delrepo 'riurik-tests'
        
    it 'should propose to create repo since given user does not have any one', ->
        console.log @repo
        refSpec =
            "ref": "refs/heads/master"
            "sha": "827efc6d56897b048c772eb4087f854f46256132"

        @repo.createRef( refSpec, (error)-> console.log error )
        @repo.write( 'master', 'test.coffee', 'test', 'first commit', (error)-> console.log error  )