
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
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
					"hobbies": [],
					"languages": [],
					"nationalities": [],
					"religion": { "value": null, "label": null },
					"identity": {
						"sex": null,
						"marital": null,
						"gender": { "value": null, "label": null },
						"orient": { "value": null, "label": null }
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
						"items": [
							{
								"id": 2,
								"kind": "column",
								"field": "email_address",
								"name": "Email Address",
								"level": 4,
								"value": 1,
								"follows": "",
								"status": false
							},
							{
								"id": 6,
								"kind": "column",
								"field": "birth_date",
								"name": "Age & Birthday",
								"level": 2,
								"value": 16,
								"follows": "",
								"status": false
							},
							{
								"id": 3,
								"kind": "column",
								"field": "first_name",
								"name": "First Name",
								"level": 2,
								"value": 2,
								"follows": "",
								"status": false
							},
							{
								"id": 4,
								"kind": "column",
								"field": "last_name",
								"name": "Last Name",
								"level": 2,
								"value": 4,
								"follows": "first_name",
								"status": false
							},
							{
								"id": 7,
								"kind": "column",
								"field": "location",
								"name": "Location",
								"level": 3,
								"value": 32,
								"follows": "",
								"status": false
							},
							{
								"id": 10,
								"kind": "table",
								"field": "user_hobbies",
								"name": "Hobbies",
								"level": 5,
								"value": 64,
								"follows": "",
								"status": false
							},
							{
								"id": 11,
								"kind": "table",
								"field": "user_languages",
								"name": "Languages",
								"level": 5,
								"value": 128,
								"follows": "",
								"status": false
							},
							{
								"id": 12,
								"kind": "table",
								"field": "user_nationalities",
								"name": "Nationalities",
								"level": 5,
								"value": 256,
								"follows": "",
								"status": false
							},
							{
								"id": 13,
								"kind": "table",
								"field": "user_religion",
								"name": "Spirituality",
								"level": 5,
								"value": 512,
								"follows": "",
								"status": false
							},
							{
								"id": 16,
								"kind": "column",
								"field": "profile_sex",
								"name": "Sex",
								"level": 2,
								"value": 2048,
								"follows": "",
								"status": false
							},
							{
								"id": 14,
								"kind": "table",
								"field": "user_gender",
								"name": "Gender Indentity",
								"level": 5,
								"value": 1024,
								"follows": "profile_sex",
								"status": false
							},
							{
								"id": 15,
								"kind": "table",
								"field": "user_orient",
								"name": "Orientation",
								"level": 5,
								"value": 1024,
								"follows": "profile_sex",
								"status": false
							},
							{
								"id": 17,
								"kind": "column",
								"field": "profile_marital_status",
								"name": "Marital Status",
								"level": 5,
								"value": 4096,
								"follows": "",
								"status": false
							},
							{
								"id": 18,
								"kind": "column",
								"field": "profile_education",
								"name": "Education",
								"level": 4,
								"value": 8192,
								"follows": "",
								"status": false
							}
						],
						"value": 0
					},
					"modes": 	 { 
						"admin": 		 0, 
						"transactional": 0, 
						"provider": 	 0 
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
	Call: function(path, params, query, body, files, user) {
		return {
			method:	'GET',
			path: 	'/user',
			params: { uids: user.Scopes.user_id },
			query:	Assign({},{
						uuid: user.Scopes.user_id,
						single:true,links:true,
					}, query||{}),
			body:	body||{},
			files:	files||[]
		};
	},
	Build: function (Actions, Stores, LID) {
		var THS = this;
		return function (res) {
			var PNL 	= 	{ from: 'Evectr', name: ['Content','Panel'  ] },
				BLK 	= 	{ from: 'Evectr', name: ['Content','Block'  ] },
				METHS 	= 	{ from: 'Evectr', name: [    'PoS','Methods'] },
				XPUT 	= 	{ from: 'Evectr', name: [   'Form','Xput'   ] },
				BR  	= 	{ tag: 'br' },
				HR  	= 	{ tag: 'hr', props: { className: 'spread' } },
				FLT 	= 	function FLT(v) { return !!v },
				BIZNES  = 	function BIZNES(user) {
								var linksty  = {fontWeight:'bold'},
									settings = user.settings||{},
									modes 	 = settings.modes||{},
									provider = modes.provider;
								return (!!provider ? [
									{	tag: 'div', props: { className: 'C12' }, items: [ 
										{	tag: 'p', xerox: true, props: { className:'spread', style:{fontSize:'medium'}}, items: [[
											"As a Provider, you'll need to give your ",
											{tag:'a',props:{href:'#user-contact',style:linksty},items:["Business Address"]},
											" for verification purposes, as noted in the ",
											{tag:'a',prop:{href:""},items:["Terms & Services"]},
											". Your business address is not actually used by eVectr or any of it's partners, nor is it stored on our databases or sold.",
										],	[
											"Add your ",
											{tag:'a',props:{href:'#user-banking',style:linksty},items:["Bank Account Information"]},
											" to recieve your payouts. You can still provide your service to clientele, but we won't ",
											"be able to pay you out, so try to get his done as soon as possible!",
										]]	}, 
									]	},
									{	tag:	BLK, props:  { 
										name: 	'user-biz-contact', 
										header: { fixed: true, label: 'Business Address' },
										align:	'spread gridSlice',
										form: 	{
											'id':			'user-contact',
											'data-action': 	'/pos',
											'method':		'PUT',
											'buttons':		[
												{ kind:'submit',label:'Update Business Address',style:'info' },
											],
										},
										items: 	[
											{ 	tag:	'div',
												props:	{ className: 'half' },
												items: 	[{
													tag:	XPUT, props:	{
														id: 		'user-biz-st1',
														name: 		'Street1',
														icon:		'map-pin',
														kind:		'text',
														placeholder:'Street 1',
														value:		 null,
														compact:	 true,
														priority:	'*',
														validate: 	{
															pattern: /^(?:[A-z0-9'\/#+-]+\b[?,.]?(?: \b|$))+$/,
															invalid: 'Please specify a valid Street Address for your Service(s).',
														},
													}
											}]	},
											{ 	tag:	'div',
												props:	{ className: 'half' },
												items: 	[{
													tag:	XPUT, props:	{
														id: 		'user-biz-st2',
														name: 		'Street2',
														kind:		'text',
														placeholder:'Street 2',
														value:		 null,
														compact:	 true,
														validate: 	{
															pattern: /^(?:[A-z0-9'\/#+-]+\b[?,.]?(?: \b|$))+$/,
															invalid: 'Please specify a valid Unit/Apt/Suite for your Service(s).',
														},
													}
											}]	},
											{ 	tag:	'div',
												props:	{ className: 'spread' },
												items: 	[{
													tag:	{ from: 'Evectr', name: ['Form','Xput'] },
													props:	{
														id: 		'user-biz-locale',
														name: 		'LID',
														kind:		'text',
														icon:		'location-arrow',
														placeholder:'Your Location',
														priority:	'*',
														hide: 		 true,
														value:		{
															value: user.location.id,
															label: user.location.label,
														},
														compact:	 true,
														data:		{
															id:   'user-locale-sgst', 
															url:  '/search/for/locale',
															list: '/locale',
														},
														validate: 	{
															pattern: /[\w\d% ,;.-]+/,
															invalid: 'Please specify a City, Region and/or Country and choose your Service\'s Locale from the list.',
														},
													}
											}]	},
											{ 	tag:	'div',
												props:	{ className: 'half' },
												items: 	[{
													tag:	XPUT, props:	{
														id: 		'user-biz-postal',
														name: 		'PostalCode',
														icon:		'mail-bulk',
														kind:		'text',
														placeholder:'Postal/Zip Code',
														value:		 null,
														compact:	 true,
														priority:	'~',
														validate: 	{
															pattern: /^(?:[A-Z0-9]+\b(?:[ -]\b|$))+$/,
															invalid: 'Please specify a valid Postal/Zip Code for your Service(s).',
														},
													}
											}]	},
											{ 	tag:	'div',
												props:	{ className: 'half' },
												items: 	[{
													tag:	XPUT, props:	{
														id: 		'user-biz-phone',
														name: 		'Phone',
														icon: 		'phone',
														kind:		'tel',
														placeholder:'Phone Number',
														value:		 null,
														compact:	 true,
														priority:	'*',
														validate: 	{
															pattern: /^(?:[0-9]){1,14}[0-9]$/,
															invalid: 'Please specify a valid Phone Humber for your Service(s).',
														},
													}
											}]	},
										]
									}	}, BR,
									{	tag:	BLK, props:  { 
										name: 	'user-biz-bank', 
										header: { fixed: true, label: 'Bank Account' },
										align:	'spread gridSlice',
										form: 	{
											'id':			'user-banking',
											'data-action': 	'/pos/bank',
											'method':		'PUT',
											'buttons':		[
												{ kind:'submit',label:'Update Business Bank',style:'info' },
											],
										},
										items: 	[
											{ 	tag:	'div',
												props:	{ className: 'half' },
												items: 	[{
													tag:	XPUT, props:	{
														id: 		'user-biz-chequing',
														name: 		'AcctNo',
														icon:		'university',
														kind:		'text',
														placeholder:'Account Number',
														compact:	 true,
														priority:	'*',
														validate: 	{
															pattern: /^[0-9]+$/,
															invalid: 'Please specify a valid Account Number for your Service(s) Bank.',
														},
													}
											}]	},
											{ 	tag:	'div',
												props:	{ className: 'half' },
												items: 	[{
													tag:	XPUT, props:	{
														id: 		'user-biz-routing',
														name: 		'RouteNo',
														icon:		'random',
														kind:		'text',
														placeholder:'Transit and/or Routing No.',
														value:		 null,
														priority:	'*',
														validate: 	{
															pattern: /^\b[0-9-]+\b$/,
															invalid: 'Please specify a valid Transit and/or Routing Number for your Service(s).',
														},
													}
											}]	},
										]
									}	},
								] : []);
							},
				dta 	= 	Imm.fromJS(THS.Data[0]()),
				mrg 	= 	Imm.fromJS(res);
			// -----
			res = dta.mergeDeepWith(
				function(o,n,k) { 
					return (IS(n)=='socket'?o||null:n);
				}, 	mrg
			).toJS();
			// -----
			var photos 			= res.photos||{},
				settings 		= res.settings||{},
				modes 			= settings.modes||{},
				provider		= modes.provider;
			// -----
			return Stores.Apps[LID].singleton.updateStore({
				header:		{
					title: 	{
						cover: 	photos.cover,
						user:	{
							mode:	'edit',
							photo: 	photos.profile,
							uname: 	'',
							name: 	{ First: 'My', Last: 'Wallet' },
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
							{ 					// TRANSACTIONS
								tag:	PNL, props: 	{ 
									name:	'wallet-transacts',
									header: { label: 'Transactions',  icon: 'dollar-sign' },
									align:	'gridSlice broad',
									body:	[
										{	tag: 'p', props : { className: 'spread MLR', style: { fontSize: 'medium' } }, items: [
											'...'
										]	}, 
										{	tag: { from: 'Evectr', name: ['PoS','Transacts'] }, 
											props: { id: 'transact', transactions: [
												{
													date: new Date().getTime(),
													svid: 3,
													service: 'Pretentious Caricatures by Ari',
													who: { uid: 47, name: { First: 'Sarah', Last: 'Jefferson' } },
													charge: 80,
													status: 'BOUNCED',
													history: [
														{ stat: "INQUIRED", time: 1576082731 }, 
														{ stat:  "BOUNCED", time: 1576083741, reason: "Data/Time not available" },
													]
												}
											]
										}	},
									], 	
							}	},
							(!!provider ? { 	// BUSINESS
								tag:	PNL, props: 	{ 
								name:	'wallet-business',
								header: { 
									label: 'Banking',  icon: 'money-check-alt', subs: [
										{ name: 'user-contact', label: 'Business Address' },
										{ name: 'user-banking', label: 'Bank Account'     },
									]	},
								align:	'gridSlice',
								body:	BIZNES(res)
							}	} : null),   {  // PAY-METHODS
								tag:	PNL, props: 	{ 
									name:	'wallet-methods',
									header: { label: 'Pay Method(s)',  icon: 'credit-card' },
									align:	'gridSlice',
									trail:	true,
									body:	[
										{	tag: 'p', props : { className: 'spread', style: { fontSize: 'medium' } }, items: [
											"As a Transactional User, you can save your Credit Cards here for later use, and manage them at any time. eVectr does ",
											"not store (or pass) any Credit Card information on (or through) our servers.",
										]	}, 
										{	tag:   BLK, 
											props: { name: "new-pay-method", align: "spread gridSlice" }, 
											items: [{tag: METHS, props: {} }
										]	},
									]	
								}
							}, 
						].filter(FLT),
						other: [
							{ 	 // TIPS
								tag:	PNL, props: 	{ 
									kind:	'side',
									name:	'tips',
									header: { label: 'Tips',  icon: 'info-circle' },
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
