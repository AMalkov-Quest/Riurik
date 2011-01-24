(function(win){
	win.TestRunner = function(){
		TestRunner.instance = this;
		this.tests = [];
	};
	TestRunner.addTest =  function(test){
		if (TestRunner.instance == 'undefined' ) { new TestRunner(); }
		if ( test == 'undefined' ) { 
			TestRunner.error('Test is undefined')	
			return false; 
		}
		if ( typeof(test.testname) == 'undefined' || typeof(test.run) == 'undefined' ) {
			TestRunner.error(test+' is not a valid test');
			return false;
		}
		TestRunner.instance.tests.push(test);
		return true;
	};
	TestRunner.run = function(){
		if (TestRunner.instance == 'undefined' ) { new TestRunner(); TestRunner.lastTest = null; }
		var i = TestRunner.instance;
		if ( typeof(i.lastTest) == 'undefined' ) { i.lastTest = 0; } else { i.lastTest += 1; }
		var k = i.lastTest;
		if ( i.tests.length <= k ) { 
			TestRunner.log('All tests completed');
		    //$('iframe').unbind();
			//$('iframe').attr('src','');
			//$('iframe').remove();
			return; 
		}
		(function(TestRunner){
			var test = i.tests[k];
			if ( typeof(test.testname) == 'undefined' || typeof(test.run) == 'undefined' || typeof(test.url) == 'undefined' ) {
				TestRunner.error(test+' is not a valid test');
				continue;
			}
			$('iframe').unbind();
			$('iframe').attr('src',test.url);
			$('iframe').load(function(){
				window._$ = window.frames[0].window.jQuery;
				_$(document).ready(function(){ 
					try {
						TestRunner.log('Runing test "'+test.testname+'"');
						test.run();	
						test.markSuccess();
					} catch (ex) {
						test.markFail(ex);
					}
					TestRunner.run();
				});
			});
		}(TestRunner));
	};
	TestRunner.error = function(ex){
		try { console.log('(error) '+ex); } catch (ee){};
		$('#results').html( $('#results').html() + '<br/>(<span style="color:red;">error</span>) '+ex )	
	};
	TestRunner.log = function(ex){
		try { console.log('(log) '+ex); } catch (ee){};
		$('#results').html( $('#results').html() + '<br/>(log) '+ex )	
	};
	TestRunner.debug = function(ex){
		try { console.log('(debug) '+ex); } catch (ee){};
		$('#results').html( $('#results').html() + '<br/>(<span style="color:#a8a643;">debug</span>) '+ex )	
	};


	win.BaseTest = function(){
		this.testname = 'NoName test';
		this.url = /http:\/\/.*?\//.exec(window.location.href || document.url)[0];
		this.result = null;
		this.gotErrors = false;
		this.firstError = null;
        this._test = this;
        this._id = parseInt(Math.random() * 1000);
		this.run = function() { 
			TestRunner.error(this.testname+': Method run() is not implemented');
			return null; 
		};
		this.markFail = function(ex){
			TestRunner.log(this.testname+': FAILED with error: '+ex);
			this.result = false;
			return false;
		};
		this.markSuccess = function(){
			if ( this.gotErrors == true ) { return this.markFail(this.firstError); }
			TestRunner.log(this.testname+': SUCCESSED ');
			this.result = true;
			return true;
		};

		this.checkSuccess = function(A, B) {
			TestRunner.debug(this.testname+': check "'+A.toString()+'" with "'+B.toString()+'" passed');
		};
		this.checkFail = function(A, B) {
			var error = this.testname+': check got "'+A.toString()+'", but expects "'+B.toString()+'"';
			if ( this.gotErrors == false ) {
				this.gotErrors = true;
				this.firstError = error;
			}
			TestRunner.error(error);
		};

        this.getNextID = function() {
            this._id = this._id + 1;
            return 'id-' + this._id;
        };

        this.websocket = function(deferred) {
            var args = new Array();
            $(arguments).each(function(i, val){
                if ( i == 0 ) return true;
                if ( typeof val == 'object' ) {
                    $(val).each(function(i2,val2){ args.push(val2); });
                } else {
                    args.push(val);
                }
            });
            var id = this.getNextID();
            var _this = this;
            args.unshift(id);
            console.log(args, deferred, typeof this._ws);
            this._wsd = deferred;
            if ( typeof this._ws == 'undefined' ) {
                console.log('creating websocket')
                var host = /http:\/\/(.*?)\//.exec(window.location.href || document.url)[1];
                if ( /:/.test(host) ) {
                    host = /(.*?):.*/.exec(host)[1] + ':8000';
                }
                console.log('Websocket connecting to '+host)
                this._ws = new WebSocket('ws://'+host+'/');
                console.log('websocket created')
                this._ws.onopen = function(event) {
                    _this._ws.send($.toJSON([args]));
                    console.log('websocket sends ' + args)
                }
                this._ws.onclose = function(event) {
                    console.log('websocket closed')
                    _this._ws.close();
                    _this._ws = null;
                }
                this._ws.onmessage = function(event) {
                    console.log('websocket received '+ event.data)
                    var data = '';
                    try {
                        data = $.evalJSON(event.data);
                    } catch (ex) {
                        _this._ws.close();
                        _this._ws = null;
                        console.log('websocket error ' + ex)
                        _this._wsd.error(ex + ':' + data);
                        return;
                    }
                    console.log(data);
                    _this._wsd.call(data);
                }
            } else {
                 console.log('websocket already exists');
                 this._ws.send($.toJSON([args]));
                 console.log('websocket sends ' + args)
            }
            return deferred;
        };

		this.check = function(A, B) {
			if ( typeof(A) == 'function' ){
				var A = A();
			};
			if ( typeof(B) == 'function' ) {
				var B = B();
			};
			if ( A.toString() === B.toString() ) {
				this.checkSuccess(A,B);
				return true;
			};
			this.checkFail(A,B);
			return false;
		};

        this.new = function() {
            var d = new Deferred();
            d.ok = d.call;
            return d;
        };
    
        this.import = function(){
            var d = Deferred();
            return this.websocket(d, 'import',arguments);
        };
        this.make = function(){
            var d = Deferred();
            return this.websocket(d, 'make',arguments);
        };
        this.call = function(){
            var d = Deferred();
            return this.websocket(d, 'call',arguments);
        };
        this.go = function(url){
            var d = Deferred();
            $('iframe').unbind();
			$('iframe').attr('src',url);
			$('iframe').load(function(){
				window._$ = window.frames[0].window.jQuery;
				_$(document).ready(function(){ 
                    d.call();
				});
			});
            return d;
        };

	};
    Deferred.define();
}(window));
new TestRunner();

$(document).ready(function(){
	TestRunner.run();
});

