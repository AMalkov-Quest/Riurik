
        var context = {
            
                url: 'http://atimiskov-w2k3:3141/tests/',
            
                host: 'atimiskov-w2k3'
            
        };
    bus = function(url) {
  this.testname = 'Dublicate Site Collection Permissions';
  this.url = url || /http:\/\/.*?\//.exec(window.location.href || document.url)[0];
  this.run = function() {
    go('http://'+this.host+':3141/user_permission_report?user=&url=SharePoint_Config@'+this.host+'&title=http:/'+this.host+':1855&search_limit=20&filter=farms&permScope=farms').
    do(function(d){
        setTimeout(function(){
          d.call();
        }, 500);
      }).
    next(function(){
      console.log(window._$);
      alert(2)
      QUnit.module("There is no data");
      QUnit.test("toolbar is invisible", function() {
        QUnit.equals( $('#btnDelete-button').is(":visible"), false, 'Revoke button is invisible');
        QUnit.equals( $('#btnGrant-button').is(":visible"), false, 'Grant button is invisible');
        QUnit.equals( $('#btnDuplicate-button').is(":visible"), false, 'Duplicate button is invisible');
        QUnit.equals( $('#btnReassign-button').is(":visible"), false, 'Reassign button is invisible');
      });
      come_on();
   });

  };
}
bus.prototype = new BaseTest();
bus.prototype.constructor = bus;
bus.superClass = BaseTest.prototype;
var test = new  bus();
