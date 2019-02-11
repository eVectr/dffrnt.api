
'use strict';

module.exports = {
	Data:  [
		function (path, req) { return {}; },
	],
	Call: function(path, params, query, body, files, user) {
		return {
			method:	'GET',
			path: 	'/static',
			params: { name: 'terms' },
			query:	 query||{},
			body:	 body||{},
			files:	 files||[]
		};
	},
	Build: function (Actions, Stores, LID) {
		return function (res) {
			var BR 	 	= { tag: 'br' },
				BLCK 	= { from: 'Evectr', name: ['Content','Block'] },
				TABS 	= { from: 'Evectr', name: ['Content','Tabs'] };

			Stores.Apps[LID].singleton.updateStore({
				content: 	{
					built: 		true,
					nav: 		{},
					segments: 	{
						copy:  [{
							tag :	BLCK,
							props: 	{
								name:	'enter',
								align:	'gridSlice',
								items: 	[{
									tag:	TABS,
									props: 	{ 
										name: 	'main',
										start:	'two',
										size:	'mostly',
										tabs:	[
											{ 	name: 	'login',
												icon:	'sign-in-alt',
												label:	'Login',
												checked: true,
												body: 	[BR, {
													tag: 	{ from:'Evectr', name:['App','Login'] },
													props: 	{},
											}],	},
											{ 	name: 	'signup',
												icon:	'edit',
												label:	'Sign Up',
												body: 	[BR, {
													tag: 	{ from:'Evectr', name:['App','Signup'] },
													props: 	{ terms: res.copy },
											}]	},
										],
									}, 
								}]
							}
						}],
					}
				},
			});
		}
	}
}
