
'use strict';

module.exports = function (COMPS, LID) {
	require("./lib/stock"	)(COMPS, LID);
	require("./lib/explorer")(COMPS, LID);
	require("./lib/evectr"	)(COMPS, LID);
}
