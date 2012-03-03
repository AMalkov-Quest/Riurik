module 'context menu items'

asyncTest '...', ->
  $.when( frame.go context.root ).then ->
    ok _$('#dir-index-menu').length > 0
	start()