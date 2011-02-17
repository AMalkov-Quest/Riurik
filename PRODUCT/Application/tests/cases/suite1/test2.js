
        var context = {
            
                url: 'http://atimiskov-w2k3:3141/tests/',
            
                host: 'atimiskov-w2k3'
            
        };
          console.log(QUnit.equals);
      QUnit.module("There is no data");
      QUnit.test("toolbar is invisible", function() {
        QUnit.equals( _$('#btnDelete-button').is(":visible"), false, 'Revoke button is invisible');
        QUnit.equals( _$('#btnGrant-button').is(":visible"), false, 'Grant button is invisible');
        QUnit.equals( _$('#btnDuplicate-button').is(":visible"), false, 'Duplicate button is invisible');
        QUnit.equals( _$('#btnReassign-button').is(":visible"), false, 'Reassign button is invisible');
      });
  
      QUnit.come_on();
