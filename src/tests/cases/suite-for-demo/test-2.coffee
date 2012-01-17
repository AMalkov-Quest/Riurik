module 'demo'
    
asyncTest 'create suite', ->
  
  $.when( frame.go(context.root) ).then(
    () ->
      _$('a#new-suite').click();
      start()
  )