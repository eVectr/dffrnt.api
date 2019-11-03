
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
			// -----
			if (!provider) throw new Error('Not a Service Provider');
			// -----
			return Stores.Apps[LID].singleton.updateStore({
				header:		{
					title: 	{
						cover: 	photos.cover,
						user:	{
							mode:	'edit',
							photo: 	photos.profile,
							uname: 	'',
							name: 	{ First: 'My', Last: 'Services' },
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
							!!services.length ? { // MY SERVICES
								tag: PNL, props: { 
									name:		'services',
									accordian: 	true,
									header: 	{ label: 'Edit Services', icon: 'edit' },
									body:		[{ 
										tag: SVC, props: { 
											editable: true, 
											services: services 
										} 
									}],
								}
							} : null, { 		  // ADD NEW SERVICE
								tag: PNL, props: { 
									name:	'add-service',
									header: { label: 'Add a Service', icon: 'folder-plus' },
									align:	'gridSlice',
									form: 	{
										'id':			'add-service-form',
										'rid':			'services',
										'data-action': 	'/provider/service',
										'method':		'POST',
										'clear':		 true,
										'buttons':		[
											{ kind:'submit',label:'Add Service',style:'norm' },
										],
										'params':		{ pdid: pdid },
										'query':		{ uids: user_id },
									},
									body:	[
										{ 	tag:	'div',
											props:	{ className: 'spread' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['Form','Xput'] },
												props:	{
													id: 		'svc-name',
													name: 		'SvcName',
													icon:		'sign',
													kind:		'text',
													placeholder:'Service Name',
													priority:	'*',
													validate: 	{
														pattern: /[\w &|\/:;'"#@!?+,.-]+/,
														invalid: 'Please specify a valid Service Name.',
													},
												}
										}]	},
										{ 	tag:	'div',
											props:	{ className: 'more' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['Form','Select'] },
												props:	{
													id: 		'svc-type',
													name:		'SvcType',
													icon:		'barcode',
													title:		'Select a Service Type',
													priority:	'*',
													options:	[],
													data:		{ url: '/list/services', id: 'select-type' },
										}	}	]	},
										{ 	tag:	'div',
											props:	{ className: 'eight some' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['Form','Select'] },
												props:	{
													kind:		'slc-txt',
													id: 		'svc-rate',
													name:		'SvcRate',
													icon:		'dollar-sign',
													reverse:	 true,
													title:		'Rate',
													priority:	'*',
													options:	[],
													data:		{ url: '/list/rates', id: 'select-rate' },
													input:			{
														kind: 		'number',
														id: 		'svc-charge',
														name:		'SvcCharge',
														placeholder:'0.00',
														min:		'0.00',
														max:		'10000.00',
														step:		'0.01',
														validate: 	{
															pattern: /\d{1,5}\.\d{2}/,
															invalid: 'That price ain\'t legit',
														},
														restrict: 	['Free','Quote'],
													},
										}	}	]	},
										{ 	tag:	'div',
											props:	{ className: 'spread' },
											items: 	[{
												tag:	{ from: 'Evectr', name: ['Form','Area'] },
												props:	{
													id: 		'svc-descr',
													name:		'SvcDescr',
													icon:		'newspaper',
													rows:		 3,
													priority:	'*',
													placeholder:'Use this to provide as many details as possible regarding your Service. This can contain any Rules or Restrictions, Hours of Preparation, etc.',
												}
										}]	}, 
									],	
								}
							}, 
						].filter(fnull),
						other: [
							{	 // ACHIEVEMENTS
								tag: PNL, props: { 
									kind:	'side',
									name:	'achievements',
									header: { label: 'Trust & Achievements', icon: 'trophy' },
									align: 	'gridPair',
									body:	[
										{	tag:	{ from: 'Evectr', name: ['Trusts'] },
											props:	{  
												shields: {
													items: ['identified','credential'],
												},
												rating:	 {
													rating:  4.5,
													strikes: 1,
													count: 	 525,
										},	},	}, 
									],	
								}
							}, { // STATISTICS
								tag: PNL, props: { 
									kind:	'side',
									name:	'statistics',
									header: { label: 'My Stats', icon: 'chart-line' },
									align: 	'gridPair',
									body:	[],	
								}
							}, 
						],
					}
				},
			}, true);
		}
	}
}
