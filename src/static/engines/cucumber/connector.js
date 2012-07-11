riurik.engine.init = function( next ){
		riurik.trigger( "riurik.engine.initing" );
				
		riurikldr.loader()
		.queue('/static/engines/cucumber/cucumber.js')
		.then(function() {
				connect()
				riurik.trigger( "riurik.engine.inited" );
				next()
		}); 

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
			switch (eventName) {
			case 'BeforeFeature':
				var feature = event.getPayloadItem('feature');
				formatter.feature({
					keyword		 : feature.getKeyword(),
					name				: feature.getName(),
					line				: feature.getLine(),
					description : feature.getDescription()
				});
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
				self.handleAnyStep(step);
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
			this.defineStep.apply(this.defineStep, stepDefinition);
		}
		console.log( '!!!', this )
	};

	var _Spec = riurik.specs.join('\n\n');

	var Cucumber				= require('./cucumber');

	//console.log( _Spec, _Feature, riurik.worldDefinitions, riurik.stepDefinitions );

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

var connect = function() {
	Gherkin = { Lexer: function() { return Lexer; } };
};
