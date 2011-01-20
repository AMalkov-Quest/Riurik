login_as_different_user_frontend = function(url) {
	this.testname = 'login_as_different_user_front-end';
	this.url = url || 'http://atimiskov-w2k3:3141/';
	this.run = function() { 
		this.check(_$('#loginas-menu').css('display'), 'none');
		_$('#loginas-img').click();
		this.check(_$('#loginas-menu').css('display'), 'block');
		var m = _$('#loginas-menu').position();
		var i = _$('#loginas-img').position(); 
		this.check(function(){
				var c = m.top - i.top - _$('#loginas-img').height(); 
				if ( c  > 10 ) { return c; };
				return true;
			}, 
			true
		);
		this.check(function(){
				var c = i.left - m.left - _$('#loginas-menu').width(); 
				if ( c  > 10 ) { return c; };
				return true;
			},
			true
		);
		this.check(_$('#loginas-menu a:first').attr('href'),'/loginas');
		_$('body').click();
		this.check(_$('#loginas-menu').css('display'), 'none');
		this.check(_$('#loginas-img').attr('src'), '/static/images/change_user.gif');
		_$('#loginas-img').mouseover();
		this.check(_$('#loginas-img').attr('src'), '/static/images/change_user_hover.gif');
		_$('#loginas-img').mouseout();
		this.check(_$('#loginas-img').attr('src'), '/static/images/change_user.gif');
		_$('#loginas-img').mouseover();
		_$('#loginas-img').click();
		this.check(_$('#loginas-img').attr('src'), '/static/images/change_user_pressed.gif');
		_$('body').click();
		this.check(_$('#loginas-img').attr('src'), '/static/images/change_user.gif');
		_$('body').click();
	};
}
login_as_different_user_frontend.prototype = new BaseTest();
login_as_different_user_frontend.prototype.constructor = login_as_different_user_frontend;
login_as_different_user_frontend.superClass = BaseTest.prototype;
var login_as_different_user_frontend_test = new login_as_different_user_frontend();

TestRunner.addTest(login_as_different_user_frontend_test);

