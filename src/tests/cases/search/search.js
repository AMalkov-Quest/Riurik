module( 'Search Test' );

QUnit.asyncSetup( function() {

  create_test( context.test_name, context.suite_path );
  context.test_path = context.suite_path + '/' + context.test_name;

  write_test( context.test_path, context.test_content );

  start();
});
                 
asyncTest( 'Test regular search pattern', function() {

  context.url_tail = 'search?search_pattern=' + encodeURIComponent( context.search_pattern ) + '&path=' + escape( context.suite_path );
  context.url = contexter.URL( context, context.url_tail );
  QUnit.log( 'Search URL: ' + context.url );

  $.when( frame.go( context.url ) ).then( function( _$ ) {

    expect( context.search_highlights_expected );
    
    var highlights = _$( ".highlight:contains('" + context.search_pattern + "')" );
    _$( highlights ).each( function( index ) { ok( $( this ).text() == context.search_pattern ); });

      start();
  });
});

asyncTest( 'Test RegExp search pattern', function() {

  context.url_tail = 'search?search_pattern=' + encodeURIComponent( context.search_regexp_pattern ) + '&path=' + escape( context.suite_path );
  context.url = contexter.URL( context, context.url_tail );
  QUnit.log( 'Search URL: ' + context.url );

  $.when( frame.go( context.url ) ).then( function( _$ ) {

    expect( context.search_highlights_expected );

    regex = new RegExp( context.search_regexp_pattern );
    var highlights = _$( ".highlight" );
    _$( highlights ).each( function( index ) { ok( regex.test( $( this ).text() ) ); });

      start();
  });
});

QUnit.teardown( function() {

  delete_test( context.test_path );
});

