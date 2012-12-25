module 'test'

test 'test', ->
    github = Github {
        username: "Riurik",
        password: "riurik862879",
        auth: "basic"
    }
    
    console.log( github )
	
