
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
	Call: function Call(path, params, query, body, files, user) {
		var acc = path.replace(/^\//,''),
			dsp = user.Scopes.display_name;
		return {
			method:	'GET',
			path: 	'/user',
			params: { account: (acc!='profile'?acc:dsp) },
			query:	Assign({},{
						uuid: user.Scopes.user_id,
						single:true,links:true,
					}, query||{}),
			body:	body||{},
			files:	files||[]
		};
	},
	Build: function Build(Actions, Stores, LID) {
		var THS = this;
		return function (res) {
			var FLT  = 	function FLT(v) { return !!v }, 
				DSV  = 	function DML(v) {
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
				DML  = 	function DML(v, e, o, s) {
							var asg = Assign,
								slc = IS(s)=='object'?s:null,
								bse = {label:'...',value:0},
								ext = {adjct:'',level:{K:1,V:1}},
								dfl = asg(bse,!!e?ext:{}),
								mpr = function(v,i){return asg({},dfl);},
								chk = !!v && !isNaN(v),
								drs = (chk ? Array(v).fill(1).map(mpr) : null);
							return (!!drs?(!!o?drs[0]:drs):(!!slc?slc[v]:v));
						},
				PNL  = 	{ from: 'Evectr', name: ['Content','Panel'] },
				MLT  = 	{ from: 'Evectr', name: ['Content','Multis'] },
				BDG  = 	{
							provider: { kind: 'norm', icon: 'handshake'  },
							verified: { kind: 'good', icon: 'shield-alt' },
						};
			// -----
			var photos 			= res.photos||{},
				details 		= res.details||{},
				settings 		= res.settings||{},
				checks 			= res.checks||{},
				misc			= details.misc||{},
				description		= misc.description||"...",
				education		= misc.education||{},
				institutions	= education.institutions,
				edudesc			= education.edudesc,
				hobbies			= DML(details.hobbies||5, 1),
				languages		= DML(details.languages, 1),
				nationalities	= DML(details.nationalities),
				religion		= DML(details.religion, 0, 1),
				identity		= details.identity||{},
				marital			= DML(identity.marital||1, 0, 1, { 
									M: { value: 'M', label: 'Married'			},
									S: { value: 'S', label: 'Single'			},
									R: { value: 'R', label: 'In a Relationship'	},
								}),
				gender			= null, /*DML(identity.gender,0,1),*/
				orient			= DML(identity.orient, 0, 1),
				services 		= DSV(res.services||5),
				modes			= settings.modes||{},
				provider 		= !!modes.provider && services.length,
				verified		= !!checks.verified;
			// -----
			return Stores.Apps[LID].singleton.updateStore({
				header:		{
					title: 	{
						cover: 	photos.cover,
						user:	{
							mode:	'show',
							photo: 	photos.profile,
							uname: 	res.display_name,
							name: 	res.name,
							badges: [
								provider ? BDG.provider : null,
								verified ? BDG.verified : null,
							].filter(FLT),
							locale: res.location.label,
							sex:	identity.sex,
							age: 	(
								res.birth_date ? Math.abs(new Date(
									new Date().getTime() - 
									new Date(res.birth_date)
										.getTime()
								).getUTCFullYear() - 1970): 0
							),
						},
					},
				},
				content: 	{
					built: 		true,
					segments: 	{
						copy: [
							// ABOUT ME
							{
								tag: PNL, props: { 
									name:	'about',
									header: { label: 'About Me',  	icon: 'smile' },
									body:	[
										{
											tag:	'p', 
											xerox: 	true,
											props:	{ className: 'text' },
											items: 	description.split(/\n/g),
										}, { tag: 'br' }, ( !!hobbies ? {
											tag:	{ from: 'Evectr', name: ['Content','Multis'] },
											props:	{ 
												name: 	'hobbies',
												kind:	'good',
												size:	 1,
												items: 	hobbies.map(function (v,k) {
													var url = '/hobbies/'+v.label;
													return Assign({}, v, {
														href: url, level: {
															href: 	url+'/'+v.level.K,
															label:	v.level.K,
														}, more: Boolean(!!v.more)
													})
												}),
											},
										} : null ),
									].filter(FLT),		
								}
							}, 
							// MY SERVICES
							provider ? { 
								tag: PNL, props: { 
									name:		'services',
									accordian: 	true,
									header: 	{ label: 'My Services', icon: 'handshake' },
									body:		services.map(function(s) { return {
										tag: { from: 'Evectr', name: ['Service'] }, props: s,
									};	}	)
								}
							} : null, 
							// OTHER INFO
							{ 
								tag: PNL, props: { 
									name:	'info',
									header: { label: 'Other Info',  icon: 'briefcase' },
									align: 	'gridPair',
									body:	[
										!!languages ? {
											tag: MLT, props: { 
												name: 	'languages',
												align: 	'split',
												header:	{ label: 'Language' },
												kind:	'info',
												size:	 1,
												items: 	languages.map(function (v) {
													var url = '/languages/'+v.label;
													return Assign({}, v, {
														href: url, level: {
															href: 	url+'/'+v.level.K,
															label:	v.level.K,
														}, more: Boolean(!!v.more)
													})
												}),
											},
										} : null, !!nationalities ? {
											tag: MLT, props: { 
												name: 	'background',
												align: 	'split',
												header:	{ label: 'Background' },
												kind:	'info',
												size:	 1,
												items: 	nationalities.map(function (v) {
													return Assign({},v,{href: '/nationalities/'+v.label})
												}),
											},
										} : null, !!religion ? {
											tag: MLT, props: { 
												name: 	'spirituality',
												align: 	'split',
												header:	{ label: 'Spirituality' },
												kind:	'nope',
												size:	 1,
												items: 	[
													Assign({},religion,{href:'/religion/'+religion.label}),
												],
											},
										} : null, !!(marital||orient||gender) ? {
											tag: MLT, props: { 
												name: 	'status',
												align: 	'split',
												header:	{ label: 'Status' },
												kind:	'warn',
												size:	 1,
												items: 	[
													!!marital ? Assign({},marital,{href:'/marital/'+marital.label}) : null,
													!!orient  ? Assign({}, orient,{href: '/orient/'+ orient.label}) : null,
													!!gender  ? Assign({}, gender,{href: '/gender/'+ gender.label}) : null,
												].filter(FLT),
											},
										} : null, !!institutions ? {
											tag:	{ 
												from: 'Evectr', name: ['Content','List'] 
											},
											props:	{ 
												name: 	'education',
												align: 	'spread',
												style: 	'bare',
												header:	{ label: 'Education' },
												items: 	institutions.split(/\n/g),
											},
										} : null,  
									].filter(FLT),	
								}
							}, 
						],
						other: [
							// ACHIEVEMENTS
							!!modes.provider ? {
								tag: PNL, props: { 
									kind:	'side',
									name:	'achievements',
									header: { label: 'Trust & Achievements',  icon: 'trophy' },
									align: 	'gridPair',
									body:	[
										{
											tag: { from: 'Evectr', name: ['Trusts'] },
											props:	{  
												shields: { items: [
													!!checks.accredited ? 'accredited' : null,
													!!checks.identified ? 'identified' : null,
												].filter(FLT) },
												rating:	 checks.rating,
											},
										}, 
									],	
								}
							} : null, 
							// COMMUNITY
							{ 
								tag: PNL, props: { 
									kind:	'side',
									name:	'community',
									header: { label: 'My Community',  icon: 'users' },
									align: 	'gridPair',
									body:	[
										{ 
											name: 	'Ben Ashton',
											img:	null, // 'public/images/profile.jpg',
											href:	'theBigBen',
										}, 	{ 
											name: 	'Marc Djoudi',
											img:	null, // 'public/images/profile.jpg',
											href:	'mdjoudi',
										},	{ 
											name: 	'Darren Sun',
											img:	null, // 'public/images/profile.jpg',
											href:	'dsun',
										},	
									].map(function (user, i) {
										return {
											tag:  { from: 'Evectr', name: ['Content','Person'] },
											props:	user,
										}
									}),	
								}
							},
							// ACTIVITY 
							{ 
								tag: PNL, props: { 
									kind:	'side',
									name:	'activity',
									header: { label: 'Recent Activity',  icon: 'compress' },
									align: 	'spaced',
									body:	[
										{
											tag:	{ 
												from: 'Evectr', name: ['Content','Activity'] 
											},
											props:	{ 
												title: 	'Comment to Marc Djoudi',
												details:'Quae si potest singula consolando levare, universa quo modo sustinebit?',
											},
										}, {
											tag:	{ 
												from: 'Evectr', name: ['Content','Activity'] 
											},
											props:	{ 
												title: 	'Review for Darren Sun',
												details:'Praesertim cum in re publica princeps esse velles ad eamque tuendam cum summa tua dignitate maxime a nobis ornari atque instrui posses.',
											},
										}, 
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
