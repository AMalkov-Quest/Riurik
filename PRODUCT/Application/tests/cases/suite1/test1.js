$(document).ready(function() {

function go(url){
  var d = new Deferred();
  $('iframe').unbind();
  $('iframe').attr('src',url);
  $('iframe').load(function(){
    window._$ = window.frames[0].window.jQuery;
    _$(document).ready(function(){ 
      _$(document).unbind();
      if ( typeof d._called == 'undefined' ) {
        d._called = true;
        d.call();
      }
    });
  });
  return d;
};
go('http://sp-2k10-u4:3141/user_permission_report?user=&url=SharePoint_Config@sp-2k10-u4&title=http://sp-2k10-u4:1855&search_limit=20&filter=farms&permScope=farms').
  
next(function(){    
  module("There is no data");
  
  test("toolbar is invisible", function() {
    equals( _$('#btnDelete-button').is(":visible"), false, 'Revoke button is invisible');
    equals( _$('#btnGrant-button').is(":visible"), false, 'Grant button is invisible');
    equals( _$('#btnDuplicate-button').is(":visible"), false, 'Duplicate button is invisible');
    equals( _$('#btnReassign-button').is(":visible"), false, 'Reassign button is invisible');
  });
  
  come_on();
});

});