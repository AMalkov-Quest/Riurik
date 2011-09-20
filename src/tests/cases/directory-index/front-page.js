module('front page');

asyncTest('is first page', function() {
  $.when( frame.go( contexter.URL(context, '') ) ).then(function(_$) {
    equal( _$('.breadcrumbs').html(), '', 'there are no breadcrumbs' );
    
    var folders = $.map(_$('li.folder'), function(el) { return $.trim($(el).text()); })
    ok( folders.length > 0, 'there are ' + folders.length + ' virtual folders' );
    
    ok( $.inArray( context.vfolder1, folders ) != -1, context.vfolder1.concat(' is in ', folders ) );
    ok( $.inArray( context.vfolder2, folders ) != -1, context.vfolder2.concat(' is in ', folders ) );
    
    ok( _$('a#configure').length == 1, 'the configure button is shown' );
    
    start();
  });
});