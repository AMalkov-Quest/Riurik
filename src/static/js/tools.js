if ( typeof console == 'undefined' || typeof console.log == 'undefined' ) {
	var console = { log: function(){} };
}

function clone(o) {
	if(!o || 'object' !== typeof o)  {
		return o;
	}
 
	var c = 'function' === typeof o.pop ? [] : {};
	var p, v;
	for(p in o) {
		if(o.hasOwnProperty(p)) {
			v = o[p];
			if(v && 'object' === typeof v) {
				c[p] = clone(v);
			} else {
				c[p] = v;
			}
		}
	}
	
	return c;
}

String.prototype.strip = function(c) {
	return this.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
};
