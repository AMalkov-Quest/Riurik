module 'bootstrap'

test 'environmen variables should be defined', ->
  ok riurik?, 'Top level namespace for Riurik is defined'
    
  equal riurik.src.jquery, '/static/js/jquery.min.js', 'jquery source'
  equal riurik.src.bootstrap, '/static/js/bootstrap.js', 'bootsrtap script source'
  equal riurik.args.server, riurik.GetArgument 'server', 'Riurik server URL'
  equal riurik.args.path, riurik.GetArgument 'path', 'current executed test or suite path'
  
test 'tests context should be defined', ->
  ok context?
  
test 'GetArgument method should warn if argument can not be found by name', ->
  arg1 = 'arg1'
  sinon.stub window, "alert"
  
  riurik.GetArgument "#{arg1}"
  
  ok window.alert.withArgs("Can not find argument #{arg1}").calledOnce
  window.alert.restore()
  
test 'BuildHttpUri should return absolute http URI for the Riurik server', ->
  equal riurik.BuildHttpUri('/path/to/js/script'), "http://#{riurik.args.server}/path/to/js/script"
  
test 'GetCwd should return a suite path if executed target is suite', ->
  path = '/riurik-inner-tests/tests-loader'
  equal riurik.GetCwd(path), path
  
test 'GetCwd should return a test parent dir if executed target is test', ->
  parentDir = '/riurik-inner-tests/tests-loader'
  equal riurik.GetCwd("#{parentDir}/bootsrap.js"), parentDir
  
test 'getQUnit should return QUnit', ->
  equal riurik.getQUnit(), QUnit
  
test 'getContext should return context', ->
  equal riurik.getContext(), context
  
test 'init should check if QUnit is loaded', ->
  sinon.stub riurik, "getQUnit"
  sinon.stub window, "alert"
  
  riurik.init()
  
  ok window.alert.withArgs("QUnit should be preliminary loaded").calledOnce, 'warning alert is called'
  window.alert.restore()
  riurik.getQUnit.restore()
  
test 'init should check if context is loaded', ->
  sinon.stub riurik, "getContext"
  sinon.stub window, "alert"
  
  riurik.init()
  
  ok window.alert.withArgs("context should be preliminary loaded").calledOnce, 'warning alert is called'
  window.alert.restore()
  riurik.getContext.restore()
  
test 'init should create the Waits object with context.timeout', ->
  riurik.init()
  
  ok riurik.exports.wait?, 'object is created'
  equal riurik.exports.wait.timeout, context.timeout, 'timeout is fine'
  
test 'init should create the QUnit namespace', ->
  riurik.init()
  
  ok riurik.QUnit?, 'object is created'
  equal riurik.QUnit.status, 'started'
  ok riurik.QUnit.current.module
  ok riurik.QUnit.current.test