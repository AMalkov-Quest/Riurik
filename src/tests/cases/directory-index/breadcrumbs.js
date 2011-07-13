module('breadcrumbs');

QUnit.setup(function() {
  context.folder_name = 'first-folder';
  context.suite_name = 'first-suite';
  context.suite_path = context.folder_name + '/' + context.suite_name;
  context.test_name = 'first-test.js';
  context.test_path = context.suite_path + '/' + context.test_name;
  create_folder(context.folder_name, '/');
  create_folder(context.suite_name, context.folder_name);
  create_test( context.test_name, context.suite_path );
});

asyncTest('for root', function() {
  var URL = contexter.URL(context, '');
  $.when( frame.go(URL) ).then(function(_$) {
    ok( _$('p.breadcrumbs').length > 0, 'bredcrumbs are exist' );
    equal( _$('p.breadcrumbs').html(), '', 'but empty' );
    
    start();
    
  });
});

asyncTest('for folder', function() {
  var URL = contexter.URL(context, context.folder_name);
  $.when( frame.go(URL) ).then(function(_$) {
    ok( _$('p.breadcrumbs').length > 0, 'bredcrumbs are exist' );
    ok( _$('p.breadcrumbs > a').length == 3, 'bredcrumbs contain all links' );
    equal( _$('p.breadcrumbs > a').first().html(), "•" );
    equal( _$('p.breadcrumbs > a').first().attr('href'), '/', 'first link leads to root' );
    equal( _$('p.breadcrumbs > a').last().attr('href'), '/', 'last link leads to root too' );
    equal( $(_$('p.breadcrumbs > a')[1]).html(), context.folder_name + '&nbsp;&nbsp;' );
    equal( $(_$('p.breadcrumbs > a')[1]).attr('href'), undefined, 'current level link does not have href' );
    ok( _$('p.breadcrumbs > a').last().find('img').length == 1, 'last link is image' );
    equal( _$('p.breadcrumbs > a').last().find('img').attr('src'), '/static/img/up.png' );
    
    start();
    
  });
});

asyncTest('for suite', function() {
  var URL = contexter.URL(context, context.suite_path);
  $.when( frame.go(URL) ).then(function(_$) {
    
    ok( _$('p.breadcrumbs').length > 0, 'bredcrumbs are exist' );
    ok( _$('p.breadcrumbs > a').length == 4, 'bredcrumbs contain all links' );
    equal( _$('p.breadcrumbs > a').first().html(), "•" );
    equal( _$('p.breadcrumbs > a').first().attr('href'), '/', 'first link leads to root' );
    equal( _$('p.breadcrumbs > a').last().attr('href'), '/' + context.folder_name + '/', 'last link leads to upper level' );
    equal( $(_$('p.breadcrumbs > a')[2]).html(), context.suite_name + '&nbsp;&nbsp;' );
    equal( $(_$('p.breadcrumbs > a')[2]).attr('href'), undefined, 'current level link does not have href' );
    
    start();
    
  });
});

asyncTest('for test', function() {
  var URL = contexter.URL(context, context.test_path + '?editor' );
  $.when( frame.go(URL) ).then(function(_$) {
    
    ok( _$('p.breadcrumbs').length > 0, 'bredcrumbs are exist' );
    ok( _$('p.breadcrumbs > a').length == 4, 'bredcrumbs contain all links' );
    equal( _$('p.breadcrumbs > a').first().html(), "•" );
    equal( _$('p.breadcrumbs > a').first().attr('href'), '/', 'first link leads to root' );
    equal( $(_$('p.breadcrumbs > a').last()).html(), context.test_name + '&nbsp;&nbsp;', 'script name is last element');
    equal( _$('p.breadcrumbs > a').last().attr('href'), undefined, 'script name does not have link' );
    equal( $(_$('p.breadcrumbs > a')[2]).html(), context.suite_name );
    equal( $(_$('p.breadcrumbs > a')[2]).attr('href'), '/' + context.folder_name + '/' + context.suite_name + '/', 'second link leads to parent suite' );
    
    start();
    
  });
});

QUnit.teardown(function() {
  delete_folder(context.folder_name);
});