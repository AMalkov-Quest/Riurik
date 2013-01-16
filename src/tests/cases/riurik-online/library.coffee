mkrepo = (title)->
    $.ajax $.URI( $R.context, 'github/mkrepo' ),
        type: 'GET'
        async: false
        data: { 'title': title }
        success: (data)=>
            riurik.log "repository '#{title}' is created"
            
delrepo = (title)->
    $.ajax $.URI( $R.context, 'github/delrepo' ),
        type: 'GET'
        async: false
        data: { 'title': title }
        success: (data)=>
            riurik.log "repository '#{title}' is deleted"
            
logout = ->
    $.ajax $.URI( $R.context, 'github/logout' ),
        type: 'GET'
        async: false
        success: (data)=>
            riurik.log "you are loged out"            
