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
