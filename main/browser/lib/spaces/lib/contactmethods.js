
'use strict';

module.exports = {
	Data:  [ 
		function (path, req) { 
			return   {
				"user_id": null,
				"display_name": null,
				"email_address": null,
				"name": { "first": null, "last": null },
				"birth_date": null,
				"photos": { "profile": null, "cover": null },
				"location": {
					"id": null,
					"label": "",
					"codes": { "region": "", "country": "" }
				},
				"details": {
					"hobbies": 		 null,
					"languages": 	 null,
					"nationalities": null,
					"religion": 	 null,
					"identity": {
						"sex": 		null,
						"marital": 	null,
						"gender": 	null,
						"orient": 	null
					},
					"misc": {
						"description": null,
						"education": { "institutions": null, "description": null }
					}
				},
				"provider_id": null,
				"services": [],
				"settings": {
					"email": 	  null,
					"timezone":   null,
					"language":   null,
					"visibility": {
						"items": [],
						"value": 0
					},
					"modes": 	  { 
						"admin": 		 0, 
						"transactional": 0, 
						"provider": 	 0,
						"scount":		 0
					}
				},
				"checks": { 
					"tour_done": 	0,
					"status": 		0, 
					"verified": 	0, 
					"identified": 	0, 
					"accredited": 	0, 
					"rating": 		null
				},
				"member_since": null
			};
		}, 
	],
	Redirect: 	'settings#user-modes',
	Call:  function (path, params, query, body, files, user) {
		return {
			method:	'GET',
			path: 	'/user',
			params: { uids: user.Scopes.user_id },
			query:	Assign({},{
						uuid: user.Scopes.user_id,
						links:['photos','services','settings'],
						single:true,
					}, 	query||{}),
		};
	},
	Build: function (Actions, Stores, LID) {
		var THS = this;
		return function (res) {
			var fnull 	  = function(v) { return !!v; },
				PNL 	  = { from: 'Evectr', name: ['Content','Panel'] },
				SVC 	  = { from: 'Evectr', name: ['Services'] },
				RAD  	  = { tag: 'input', props:{id:'closeSvc',name:'svcs',className:'reveal'}},
				BR  	  = { tag: 'br' },
				user_id	  = res.user_id,
				pdid 	  = res.provider_id,
				photos 	  = res.photos||{},
				services  = res.services||[],
				settings  = res.settings||{},
				modes	  = settings.modes||{},
				provider  = !!modes.provider;

			return Stores.Apps[LID].singleton.updateStore({
				header:		{
					title: 	{
						cover: 	photos.cover,
						user:	{
							mode:	'edit',
							photo: 	photos.profile,
							uname: 	'',
							name: 	{ First: 'Contact', Last: 'Us' },
							badges: [],
							locale: null,
							sex:	null,
							age: 	null,
						},
					},
				},
				content: 	{
					built: 		true,
					segments: 	{
						copy: [
							{ 		  // SELECT REASON
								tag: PNL, props: {
									name:	'select-reason',
									header: { label: 'Select a Reason', icon: null },
									align:	'gridSlice',
									
									body:	[
										{ 	tag:	'div',
											props:	{ className: 'spread' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['Contactmethods'] },
												props:	{
													id: 		'contact-methods',
													name:		'ContactMethods',
													icon:		'barcode',
													title:		'Contact eVectr',
													priority:	'*',
													options:	[],
													data:		{ url: '/contactreason', id: 'select-type' },
										}	}	]	},
										/*{ 	tag:	'div',
											props:	{ className: 'spread' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['StandardForm'] },
												props:	{
													//
												}
											}]
										},
										
										{ 	tag:	'div',
												props:	{ className: 'spread' },
												items: 	[{
													tag:	{ from: 'Evectr', name: ['Form','StandardXput'] },
													props:	{
														id: 		'contact-subject',
														name: 		'Subject',
														kind:		'text',
														placeholder:'Subject',
														value:		 '',
														priority:	'*',
														validate: 	{
															pattern: /[A-z'-]+/,
															invalid: 'Please specify a valid Subject',
														},
														visible: false,
														category: "Standard",
													}
												}
											]
										},
										{ 	tag:	'div',
											props:	{ className: 'spread' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['Form','StandardArea'] },
												props:	{
													id: 		'contact-message',
													name:		'Message',
													icon:		'newspaper',
													rows:		 3,
													priority:	'*',
													placeholder:'Type your message here',
													visible: false,
													category: "Standard",
												}
										}]	},*/
										/*{ 	tag:	'div',
												props:	{ className: 'spread' },
												items: 	[{
													tag:	{ from: 'Evectr', name: ['Form','StandardArea'] },
													props:	{
														id: 		'contact-message',
														name: 		'Message',
														kind:		'text',
														placeholder:'Your Message',
														value:		 '',
														priority:	'*',
														/*validate: 	{
															pattern: /[A-z'-]+/,
															invalid: 'Please specify a valid message',
														},//
													}
												}
											]
										},*/
									],	
								}
							}, 
						].filter(fnull),
						other: [
							{	 // ACHIEVEMENTS
								tag: PNL, props: { 
									kind:	'side',
									name:	'asd',
									header: { label: 'Call Us', icon: 'phone' },
									align: 	'gridPair',
									body:	[
										
									],	
								}
							},
						],
					}
				},
			}, true);
		}
	}
}
