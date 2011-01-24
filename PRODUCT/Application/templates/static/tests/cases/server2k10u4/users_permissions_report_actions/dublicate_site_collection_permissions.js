dublicate_site_collection_permissions = function(url) {
	this.testname = 'Dublicate Site Collection Permissions';
	this.url = url || /http:\/\/.*?\//.exec(window.location.href || document.url)[0];
	this.run = function() { 
        Test = this;
        var farmhost = /http:\/\/(.*?):.*\//.exec(window.location.href || document.url)[1];
        next(function(){
            return Test.import('contrib.stubbing');
        }).
        next(function(){
            return Test.import('contrib.ip_utils');
        }).
        next(function(){
            return Test.import('permissions.selenium2');
        }).
        next(function(){
            return Test.import('permissions.permissions');
        }).
        next(function(){
            return Test.import('permissions.principal');
        }).
        next(function(){
            return Test.import('fixtures.infoportal_log_scanner');
        }).
        next(function(){
            return Test.import('permissions.verification');
        }).
        next(function(){
            return Test.import('permissions.sharepoint');
        }).
        next(function(){
            return Test.make('principal', 'principal');
        }).
        next(function(){
            return Test.make('hi', 'hierarchy');
        }).
        next(function(){
            return Test.call('hi', 'create_web_application', 'WebApp1796', '1796', 'utah\\administrator', 'utah');
        }).
        next(function(){
            return Test.call('hi', 'create_site_collection', 'http://'+farmhost+':1796'+'/sites/Gaia','UTAH\\Administrator');
        }).
        next(function(){
            return Test.make('farms', 'farms'); 
        }).
        next(function(){
            return Test.call('farms', 'add_farm', farmhost)
        }).
        
        //next(function(){
        //   return Test.make('st', 'stub');
        //}).
        //next(function(){
        //    return Test.call('st', 'backup');
        //}).
        next(function(){
            return Test.make('sps', 'spsite', 'http://'+farmhost+':1796/sites/Gaia');
        }).
        next(function(){
            return Test.call('sps', 'create_site', 'Spoon');
        }).
        next(function(){
            return Test.call('sps', 'create_site', 'Fork');
        }).
        next(function(){
            return Test.make('perm', 'permissions');
        }).
        next(function(){
            return Test.call('perm', 'grant', 'Design', 'http://'+farmhost+':1796'+'/sites/Gaia/Spoon', 'UTAH\\Administrator');
        }).
        next(function(){
            return Test.call('perm', 'grant', 'Read', 'http://'+farmhost+':1796'+'/sites/Gaia/Fork', 'UTAH\\Administrator');
        }).
        next(function(){
            return Test.go(Test.url+'user_permission_report?user=UTAH\\Administrator&url=http://'+farmhost+':1796/sites/Gaia&title=Gaia&search_limit=20&filter=tls');
        }). 
        next(function(){
            var d = new Deferred();
            var f = function(){
                if ( _$('#updatingPanel').length === 0 ) {
                    d.call();
                } else {
                    TestRunner.log('waiting for element hiding');
                    setTimeout(f,100);
                }
            }
            setTimeout(f,100);
            return d;
        }).
        next(function(){
            _$('#btnDuplicate-button').trigger('click');
        }).
        next(function(){
            _$('#id_user_dupl_to').val('UTAH\jassange');
            _$('#dlgDuplicateOKButton-button').trigger('click');
        }).
        error(function(error){
            alert(error);
        });



	};
}
dublicate_site_collection_permissions.prototype = new BaseTest();
dublicate_site_collection_permissions.prototype.constructor = dublicate_site_collection_permissions;
dublicate_site_collection_permissions.superClass = BaseTest.prototype;
var dublicate_site_collection_permissions_test = new  dublicate_site_collection_permissions();

TestRunner.addTest(dublicate_site_collection_permissions_test);

