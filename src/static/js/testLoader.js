var frame = {
	
	go: function(url) {
	  var dfd = $.Deferred();
	  
	  $('#frame').attr('src', url);
	  $('#frame').load(function() {
		  dfd.resolve(window.frames[0].window.jQuery);
	  });
	  
	  return dfd.promise();
	},
	
	load: function() {
		var dfd = $.Deferred();
		  
		  $('#frame').load(function() {
			  dfd.resolve(window.frames[0].window.jQuery);
		  });
		  
		  return dfd.promise();
	}
};

function extractScript(fragment) {
	var pattert = '\\/\\*([\\S\\s]*?)\\*\\/';
	var matchAll = new RegExp(pattert, 'img');
	var matchOne = new RegExp(pattert, 'im');

	return (fragment.toString().match(matchAll) || []).map(function(scriptTag) {
		return (scriptTag.match(matchOne) || ['', ''])[1];
    });
}

function out(res) {
	//window.frames[0].document.body.appendChild(res);
	console.log( res );
}

function argumentNames(func) {
	var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
		.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
		.replace(/\s+/g, '').split(',');
    
	return names.length == 1 && !names[0] ? [] : names;
}

var ps = {}

ps.exec = function(cmd) {    
	var script = document.createElement('script');    
    
    script.src = "http://" + ps.server + ":35/?cmd=" + cmd + "&callback=out&_=" + Math.floor( Math.random() * 1000000000 ).toString(); 
    window.document.body.appendChild( script );
    
    return "Running...";
}

ps.eval = function(func) {
	var args = {};
  
	names = argumentNames(func);
	for (var i = 1; i < arguments.length; i++) {
		args[names[i-1]] = arguments[i];
	}
  
	//var re = /(?!\/\*)[^\/\*]*(?=\*\/)/m;
	//script = re.exec(func.toString())[0];
	script = extractScript(func);
	
	var cmd = '';
	for (var i = 0; i < script.length; i++) {
		var line = script[i];
		for (arg in args) {
			var regexp = new RegExp('\\{' + arg + '\\}', 'gi');
			line = line.replace(regexp, args[arg]);
		}
		cmd += line;
	}
	
	ps.exec(cmd);
}

function _NewSPSite(url, name) {
	/*
  	$spSite = Get-SPSite {url};
  	$spWeb = $spSite.OpenWeb();
  	$spWeb.Webs.Add("{name}");
	*/
}