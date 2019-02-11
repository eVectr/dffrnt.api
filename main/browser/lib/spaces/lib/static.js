
'use strict';

module.exports = {
	Data:  [
		function (path) { 
			return { copy: [], other: [] };
		},
	],
	Call: function(path, params, query, body, files, user) {
		return {
			method:	'GET',
			path: 	'/static',
			params: { name: path.replace(/^\//,'') },
			query:	 query||{},
			body:	 body||{},
			files:	 files||[]
		};
	},
	Build: function (Actions, Stores, LID) {
		return function (res) {
			// -----

			console.log('PAGE: Static')

			return Stores.Apps[LID].singleton.updateStore({
				content: 	{
					built: 		true,
					segments: 	{
						sidebar: 	res.sidebar,
						copy: 		res.copy,
						other:		res.other,
					}
				},
			}, true);
		}
	}
}
