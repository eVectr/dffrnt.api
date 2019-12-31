
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
				STYLIZE	  = function STYLIZE(tag,text) {
								text = Array.isArray(text)?text:[text];
								return { tag: tag, items: text };
							},
				DSV  	  = function DML(v) {
								if (!!!v) return [];
								var asg = Assign,
									chk = !!v && !isNaN(v),
									num = (chk ? (v>5?5:v) : null),
									mpr = function(v,i){return asg({id:i},dfl);},
									fil = function(n,m){return Array(n).fill(1).map(m);},
									dfl = {
										kind:		 '...',
										name:		 '...',
										description: '...',
										charge:		 0,
										rate:		 'Free',
									};
								return (chk?fil(num,mpr):v);
							},
				user_id	  = res.user_id,
				pdid 	  = res.provider_id,
				photos 	  = res.photos||{},
				services  = DSV(res.services),
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
									body:		[
										{ tag: 'div', props: { style:{marginBottom:'2em'} }, items: [
											{ tag: 'p', xerox: true, props: { className:'text' }, items: [
												{ tag: 'small', items: [
													'Edit the ', 
													STYLIZE('b','Service Name'),', ',STYLIZE('b','Description'),', ',STYLIZE('b','Charge'),'/',STYLIZE('b','Rate'),
													', etc. of any of your Services below. ',
													STYLIZE('i',"Keep in mind; changing this info may hinder your current clientele's ability to find you."),
													' Be sure to alert them of said changes.'
												]	},
												{ tag: 'small', items: [
													'You can ', STYLIZE('b','Delete'), ' your Service as well. Do so with ', 
													STYLIZE('b','caution'),', as it ',STYLIZE('b','cannot'),' be undone!'
												]	}
											]	},
										]	},
										{ tag: SVC, props: { 
											editable: true, 
											services: services 
										}	}
									],
								}
							} : null, { 		  // ADD NEW SERVICE
								tag: PNL, props: { 
									name:	'add-service',
									header: { label: 'Add a Service', icon: 'folder-plus' },
									align:	'gridSlice',
									trail:   true,
									body:	[
										{	tag: { from:'Evectr', name:['Service','Form'] } ,
											props: {
												mode: 'add',
												IDs:  { pdid: pdid },
										}	},
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
