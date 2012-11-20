riurik.engine = {}

riurik.engine.init = function( next ){
		riurik.trigger( "riurik.engine.initing" );
				
		riurik.engine.config();
		riurik.trigger( "riurik.engine.inited" );
		next();

		load_remote_style('/static/engines/cucumber/cucumber.css');
};

riurik.cucumber = {}

riurik.on("riurik.tests.loaded", function(){
	RunCucumber();
});

riurik.CucumberHTMLListener = function($root) {
	var CucumberHTML = require('cucumber-html');
	var formatter		= new CucumberHTML.DOMFormatter($root);

	formatter.uri('report.feature');

	var currentStep;

	var self = {
		hear: function hear(event, callback) {
			var eventName = event.getName();
			console.log( 'HEAR hook', eventName, event )
			switch (eventName) {
			case 'BeforeFeature':
				var feature = event.getPayloadItem('feature');
				formatter.feature({
					keyword		 : feature.getKeyword(),
					name				: feature.getName(),
					line				: feature.getLine(),
					description : feature.getDescription()
				});
				riurik.trigger("riurik.tests.suite.start", feature.getName());
				break;

			case 'AfterFeature':
				var feature = event.getPayloadItem('feature');
				riurik.trigger("riurik.tests.suite.done", feature.getName());
				break;

			case 'BeforeScenario':
				var scenario = event.getPayloadItem('scenario');
				formatter.scenario({
					keyword		 : scenario.getKeyword(),
					name				: scenario.getName(),
					line				: scenario.getLine(),
					description : scenario.getDescription()
				});
				break;

			case 'BeforeStep':
				var step = event.getPayloadItem('step');
				riurik.trigger("riurik.tests.test.start", step.getName());
				riurik.cucumber.total = 0;
				riurik.cucumber.passed = 0;
				riurik.cucumber.failed = 0;
				self.handleAnyStep(step);
				break;

			case 'AfterStep':
				var step = event.getPayloadItem('step');
				console.log(step)
				var stat = riurik.cucumber;
				riurik.trigger("riurik.tests.test.done", step.getName(), stat.passed, stat.failed, stat.total);
				break;

			case 'StepResult':
				var result;
				var stepResult = event.getPayloadItem('stepResult');
				if (stepResult.isSuccessful()) {
					result = {status: 'passed'};
				} else if (stepResult.isPending()) {
					result = {status: 'pending'};
				} else if (stepResult.isUndefined() || stepResult.isSkipped()) {
					result = {status:'skipped'};
				} else {
					var error = stepResult.getFailureException();
					var errorMessage = error.stack || error;
					result = {status: 'failed', error_message: errorMessage};
				}
				riurik.log( result );
				formatter.match({uri:'report.feature', step: {line: currentStep.getLine()}});
				formatter.result(result);
				break;
			}
			callback();
		},

		handleAnyStep: function handleAnyStep(step) {
			formatter.step({
				keyword: step.getKeyword(),
				name	 : step.getName(),
				line	 : step.getLine(),
			});
			currentStep = step;
		}
	};
	return self;
};

riurik.matchers.pass = function(message) {
	riurik.log( 'pass: ' + message )
	riurik.cucumber.total += 1;
	riurik.cucumber.passed += 1;
};

riurik.matchers.fail = function(message) {
	riurik.log( 'fail: ' + message )
	riurik.cucumber.total += 1;
	riurik.cucumber.failed += 1;
	riurik.cucumber.next.fail( message );
	riurik.cucumber.next = function(){};
};

riurik.matchers.substring = function(actual, expected, message) {
	actual = actual.replace(/\xA0/g, ' ');
	expected = expected.replace(/\xA0/g, ' ');

	var i = actual.indexOf(expected);
	if( i >= 0 ) {
		actual = actual.substring(i, i + expected.length);
	}

	if (! i >= 0 ) {
		riurik.matchers.fail( "'"+message+"'" + ": expected '"+expected+"', but actual '"+actual+"'");
	} else {
		riurik.matchers.pass( message );
	}
};

window.ok = function( result, message ) {
	if ( result ) {
		riurik.matchers.pass( message );
	} else {
		riurik.matchers.fail( message );
	}
}

window.equal = function( actual, expected, message ) {
	if ( actual === expected ) {
		riurik.matchers.pass( message );
	} else {
		riurik.matchers.fail( "'"+message+"'"+ ": expected '"+expected+"', but actual '"+actual+"'" );
	}
}
riurik.World = function(callback){
	$.extend(this, context);
	callback();
};

riurik.worldDefinitions = []; 
riurik.specs = [];
riurik.stepDefinitions = [];

var Spec = function( text ){
	riurik.specs.push( text );
}

var Given = When = Then = function() {
	riurik.stepDefinitions.push( $.makeArray( arguments ) );
}

var World = function( doF ){
	riurik.worldDefinitions.push( doF );
}

riurik.reporter.getHtmlTestResults = function(){
	return '<p>Not implemented</p>';
}

riurik.reporter.engine = 'cucumber';

function RunCucumber() {
	var _Feature = function(){
		this.World = riurik.World;

		var stepDefinition, worldDefinition, _i, _j, _len, _len1, _ref, _ref1;

		_ref = riurik.worldDefinitions;
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			worldDefinition = _ref[_i];
			worldDefinition.call(this);
		}

		_ref1 = riurik.stepDefinitions;
		for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
			stepDefinition = _ref1[_j];
			console.log( stepDefinition, this.defineStep );
			function successExtraction( stepCallback ) {
				return function stepCallbackProxy() {
					var stepCallbackArgs = $.makeArray( arguments );
					riurik.cucumber.next = stepCallbackArgs[ stepCallbackArgs.length - 1 ];
					var newArgs = stepCallbackArgs.slice(0, stepCallbackArgs.length-1);
					newArgs.push(function(){
						riurik.matchers.pass( 'test passed successfuly' );
						riurik.cucumber.next();
					});
					stepCallback.apply(this, newArgs);
				}
			}
			var _regexp = stepDefinition[0];
			var _fn = successExtraction( stepDefinition[1] );
			this.defineStep.apply(this.defineStep, [_regexp, _fn]);
		}
	};

	var _Spec = riurik.specs.join('\n\n');

	var Cucumber				= require('./cucumber');

	console.log( _Spec, _Feature, riurik.worldDefinitions, riurik.stepDefinitions );

	var cucumber				= Cucumber(_Spec, _Feature);
	var $output					= $('#engine');
	$output.empty();
	var listener				= riurik.CucumberHTMLListener($output);
	cucumber.attachListener(listener);

	riurik.trigger("riurik.tests.begin");
	cucumber.start(function() {
		riurik.trigger("riurik.tests.end");
	});
};

riurik.engine.config = function() {
	Gherkin = { Lexer: function() { return Lexer; } };
};

$.extend(riurik.exports);
