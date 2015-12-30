module 'coffee-script'
    
asyncTest 'test', ->
  
  $.when( frame.go('') ).then(
    (_$) ->
      folders = $.map _$('li.folder'), (el)-> return $.trim($(el).text())
    
      ok folders.length > 0, "there are #{folders.length} virtual folders"    
      ok $.inArray( context.vfolder1, folders ) != -1, "#{context.vfolder1} is in #{folders}"
      ok $.inArray( context.vfolder2, folders ) != -1, "#{context.vfolder2} is in #{folders}"
      
      ok _$('a#configure').length == 1, 'the configure button is shown'
      start()
  )