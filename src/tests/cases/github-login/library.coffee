mkrepo = (title)->
    $.ajax $.URI(context, 'github/mkrepo'),
        type: 'GET'
        async: false
        data: { 'title': title }
        success: (data)=>
            riurik.log "repository '#{title}' is created"
            
delrepo = (title)->
    $.ajax $.URI(context, 'github/delrepo'),
        type: 'GET'
        async: false
        data: { 'title': title }
        success: (data)=>
            riurik.log "repository '#{title}' is deleted"
            
logout = ->
    $.ajax $.URI(context, 'github/logout'),
        type: 'GET'
        async: false
        success: (data)=>
            riurik.log "you are loged out"            
