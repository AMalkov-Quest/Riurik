module 'exclude tests'

QUnit.setup ->
  path = "actions/suite/run/?path=/#{context.root}/suite-for-testing&context=test-exclude"
  context.url = contexter.URL context, path

asyncTest 'runs tests those were not given', ->
  $.when( frame.go context.url ).then ->
    fwnd = frame.window()
    $.wait( -> fwnd.QUnit? and fwnd.QUnit.riurik?).then ->
      fwnd.QUnit.done = ->
        equal _$('.test-name').length, 2, 'given tests are not ran'
        equal _$('.test-name').first().text(), 'first test'
        equal _$('.test-name').last().text(), 'second test'

        start()