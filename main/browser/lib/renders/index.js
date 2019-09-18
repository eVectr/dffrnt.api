
'use strict';

try { 
	module.exports = {
		Components: require('./lib/components'),
		ISO: 		require('./lib/iso'),
		Render: 	require('./lib/render'),
	}
} catch(e) { 
	module.exports = {
		Components: require('./lib/components'),
		ISO: 		null,
		Render: 	require('./lib/render'),
	}
}
