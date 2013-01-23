module 'context view - editor with .context.ini file'

asyncTest 'control panel is available', ->
  url = "#{context.virtual_root}/#{context.context_for_testing}?editor"
  $.when( frame.go url ).then ->
    ok ! _$('a#run').is(':visible'), 'Run button is NOT visible'
    ok ! _$('a#context-preview-ctrl').is(':visible'), 'Context button is NOT visible'
    ok ! _$('a#spec-link').is(':visible'), 'Spec button is not visible'
    ok _$('a#save').is(':visible'), 'Save button is visible'
    ok _$('a#close').is(':visible'), 'Close button is visible'
    start()