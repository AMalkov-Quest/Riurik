module 'context menu inside suite'

QUnit.asyncSetup ->
  using context, ->
    @menu_locator = '#dir-index-menu li'
    @suite_path = "#{@root}/#{@cws}/first-suite"
    set_context(@suite_path, "[#{@cws}]")
    $.when( frame.go( @suite_path ) ).then ->
      start()
      
test 'should have appropriate actions', ->
  using context, ->
    equal _$("#{@menu_locator}").length, 6, 'there are context menu items'
    equal _$("#{@menu_locator} a:contains('Context')").attr('href'), '#editctx', 'Edit context'
    equal _$("#{@menu_locator} a:contains('Specification')").attr('href'), '#editspec', 'Edit specification'
    equal _$("#{@menu_locator} a:contains('Delete')").attr('href'), '#remove', 'Remove a suite or a test'
    equal _$("#{@menu_locator} a:contains('Rename')").attr('href'), '#rename', 'Rename a suite or a test'
    equal _$("#{@menu_locator} a:contains('Move')").attr('href'), '#move', 'Move a suite or a test'
    equal _$("#{@menu_locator} a:contains('Run')").attr('href'), '#run', 'Execute a suite or a test'
        
asyncTest 'Edit context should open context for editing', ->
  $.when( frame.go( context.suite_path ) ).then ->
    checkActionSucceeded 'Context', ->
      QUnit.substring _$('.CodeMirror-lines').text(), "[#{context.cws}]", 'editor content OK'
      start()

asyncTest 'Edit spec should open spec urls for editing', ->
  $.when( frame.go( context.suite_path ) ).then ->
    checkActionSucceeded 'Specification', ->
      QUnit.substring _$('.CodeMirror-lines').text(), "url=http://google.com", 'editor content OK'
      start()

QUnit.teardown ->
  delete_folder context.suite_path