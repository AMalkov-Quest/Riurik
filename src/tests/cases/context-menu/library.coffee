checkActionSucceeded = (actionName, callback)->
  target = _$("#{context.menu_locator} a:contains('#{actionName}')")
  action = target.attr('href').substring(1)
  window.frames[0].ctxMenuActions.dispatcher(action, target)
  $.when( frame.load() ).then ->
    fwnd = frame.window()
    $.wait( -> frame.window().editor? ).then ->
      ok frame.window().editor.getValue()?, 'editor is not empty'
      callback()