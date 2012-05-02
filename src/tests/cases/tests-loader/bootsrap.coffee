module 'bootstrap'

test 'environmen variables should be defined', ->
  ok riurik?, 'Top level namespace for Riurik is defined'
    
  equal riurik.src.jquery, '/static/js/jquery.min.js', 'jquery source'
  equal riurik.src.bootstrap, '/static/js/bootstrap.js', 'bootsrtap script source'
  equal riurik.args.server, riurik.GetArgument 'server', 'Riurik server URL'
  equal riurik.args.path, riurik.GetArgument 'path', 'current executed test or suite path'
  
test 'GetArgument method should warn if argument can not be found by name', ->
  arg1 = 'arg1'
  sinon.stub window, "alert"
  
  riurik.GetArgument "#{arg1}"
  
  ok window.alert.withArgs("Can not find argument #{arg1}").calledOnce
  
test 'BuildHttpUri should return absolute http URI for the Riurik server', ->
  equal riurik.BuildHttpUri('/path/to/js/script'), "http://#{riurik.args.server}/path/to/js/script"
  
test 'GetCwd should return a suite path if executed target is suite', ->
  path = '/riurik-inner-tests/tests-loader'
  equal riurik.GetCwd(path), path
  
test 'GetCwd should return a test parent dir if executed target is test', ->
  parentDir = '/riurik-inner-tests/tests-loader'
  equal riurik.GetCwd("#{parentDir}/bootsrap.js"), parentDir