module( 'search UI' );

asyncTest( 'root page should not have search', function() {

  context.url = contexter.URL( context, '' );
  QUnit.log( 'Root URL: ' + context.url );

  $.when( frame.go( context.url ) ).then( function( _$ ) {

    var search = _$( "div#search" );
    ok( search.length == 0, "No search input, ok" );

    start();
  });
});

asyncTest( 'search is available inside virtual folder', function() {

  context.url = contexter.URL( context, context.virtual_root );
  QUnit.log( 'Virtual folder URL: ' + context.url );

  $.when( frame.go( context.url ) ).then( function( _$ ) {

    var search = _$( "div#search" );
    ok( search.length == 1, "One search input, ok" );

    var form = _$( "form", search );
    var input = _$( "input[name=search_pattern]", form );
    
    input.val( context.search_pattern );
    
    ok( form.attr( 'target' ) == context.search_form_target, 'Search form target is OK' );
    
    form.attr( 'target', '' );
    form.submit();

    $.wait( function() {

      return frame.window().jQuery && frame.window().jQuery( "div[class=search]" ).length > 0;
    }).then( function() {

      ok( frame.window().jQuery( "h1:contains('Search results')" ).length > 0, 'Search results is not empty, OK' );
      start();
    });
  });
});

