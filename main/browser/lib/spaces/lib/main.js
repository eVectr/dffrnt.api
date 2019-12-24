
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
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
					style:      { 
						backgroundImage: 'url(/public/images/backs/main.jpg)' 
					},
					segments: 	{
						copy:  [{
							tag :	BLCK,
							props: 	{
								name:	'enter',
								align:	'gridSlice',
								items: 	[{
									tag:	TABS,
									props: 	{ 
										name: 	 'main',
										start:	 'two',
										size:	 'mostly',
										default: true,
										tabs:	 [
											{ 	name: 	'login',
												icon:	'sign-in-alt',
												label:	'Login',
												checked: true,
												body: 	[{
													tag: 	{ from:'Evectr', name:['App','Login'] },
													props: 	{},
											}],	},
											{ 	name: 	'signup',
												icon:	'edit',
												label:	'Sign Up',
												body: 	[{
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
