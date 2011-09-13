module('front page');

asyncTest('is first page', function(){
  $.when( frame.go(contexter.URL(context, ''))).then(function(_$){
    equal( _$('.breadcrumbs').html(), '', 'there are no breadcrumbs' );
  
    var folders = _$('li.folder');
    equal( folders.length, 2, 'there are ' + folders.length + ' virtual folders' );
  
    equal( $.trim(folders.first().text()), 'other-tests');
    equal( $.trim(folders.last().text()), 'riurik-inner-tests');
    
    ok( _$('a#configure').length == 1, '', 'the configure button is shown' );
    
    start();
  });
});