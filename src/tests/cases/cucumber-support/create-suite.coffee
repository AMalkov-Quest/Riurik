Given /it is necessary to create the (.+) suite in the riurik directory index/, (name, next)->
  @given_folder = name
  next()

When /user is on the front-page/, (next)->
  $.when( frame.go('') ).then (_$)->
    next()
    
Then /he dose not see the given folder/, (next)->
  equal _$("li##{@given_folder}.folder").length, 0
  next()
  
Then /he sees the (.+) link/, (link_title, next)->
  @create_suite = _$('a#new-suite')
  equal @create_suite.text(), link_title
  next()
  
When /the link is pushed/, (next)->
  $.when( @create_suite.click() ).then ()->
    next()
  
Then /the user sees the (.+) dialog/, (dialog_title, next)->
  equal _$('#create-dir-index-dialog').is(":visible"), true
  equal _$('.ui-dialog-title').text(), dialog_title
  next()
  
When /he types given folder name/, (next)->
  _$('#object-name').val(@given_folder)
  next()
  
When /press the (.+) button/, (button, next)->
  $.waitFor.frame().then ()->
    next()
  _$("button :contains(#{button})").click()
  
Then /new folder should be created/, (next)->
  equal _$("li##{@given_folder}.folder").length, 1
  delete_folder("/#{@given_folder}")
  next()