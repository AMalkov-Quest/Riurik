module 'for suite'

QUnit.asyncSetup ->
  using context, ->
    @menu_locator = '#dir-index-menu li'
    @suite_path = "#{@root}/#{@cws}/second-suite"
    set_context(@suite_path, "[#{@cws}]")
    $.when( frame.go( "#{@root}/#{@cws}" ) ).then ->
      start()