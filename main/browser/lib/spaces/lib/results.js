
'use strict';

module.exports = {
	Data:  [
		function (path, req) { return {}; },
	],
	Call: function(path, params, query, body, files, user) {
		return {
			method:	'POST',
			path: 	'/search',
			params: params||{},
			body:	Assign({links:true},body||{}),
			files:	files||[]
		};
	},
	Build: function (Actions, Stores, LID) {
		return function (res) {
			var USR = Map(res).filter(function(v,k){return k!='terms';}),
				FLT = function (v) { return !!v && !['LC','SX'].has(v.tag); },
				SRT = function (v) { return v.score; },
				STB = { from: 'Evectr', name: ['Plaque','Stub'] },
				BDG = {
					provider: { kind: 'norm', icon: 'handshake'  },
					verified: { kind: 'good', icon: 'shield-alt' },
				};

				// console.log('RESULTS:', USR.toList().sortBy(SRT).reverse().toArray())
				// console.log('\nRESULTS:', res, '\n')

			// -----
			return Stores.Apps[LID].singleton.updateStore({
				header: 	{
					searches: 	res.terms.map(function(m) {
						return {
							'value': [m.tag,m.value].join('@'),
							'kind': m.kind, 'label': m.label,
						};
					})
				},
				content: 	{
					built: 		true,
					segments: 	{
						copy: 	[
							{	 // SEARCH RESULTS
								tag:	{ from: 'Evectr', name: ['Content','Panel'] },
								props:	{ 
									name:	'results',
									header: { label: USR.size+' People Found',  icon: 'search' },
									body: 	USR.toList().sortBy(SRT).reverse().map(function (user,uid,i) {
										var fullnm = (user.name||{first:'',last:''}),
											locale = (user.location||{label:''}).label.split(', '),
											smodes = (user.settings||{modes:{}}).modes,
											checks = (user.checks||{}),
											photos = (user.photos||{}),
											detail = (user.details||{}),
											identi = (detail.identity||{}),
											brdate = user.birth_date;
										return { tag: STB, props:	{
											href:	   '/'+user.display_name,
											Account:   user.display_name,
											Photo: 	   photos.profile||'',
											Name: 	  { First: fullnm.first, Last: fullnm.last },
											Badges:	  [
												!!smodes.provider ? BDG.provider : null,
												!!checks.verified ? BDG.verified : null,
											].filter(FLT),
											Age: 	   (
													brdate ? Math.abs(new Date(
														new Date().getTime() - 
														new Date(brdate)
															.getTime()
													).getUTCFullYear() - 1970): 0
												),
											Sex: 	   (identi.sex||''),
											Location: { City: locale[0], Region: locale[1], Country: locale[2] },
											Multis: 	(user.multi||[]).filter(FLT),
										} 	}; 
									}).toArray(),
								},
							},
						],
						other: 	[
							{ 	 // COMMUNITY
								tag:	{ from: 'Evectr', name: ['Content','Panel'] },
								props: 	{ 
									kind:	'side',
									name:	'filter',
									header: { label: 'Filters',  icon: 'filter' },
									align: 	'spaced',
									body:	[],	
								}
							}, { // TIPS & TRICKS
								tag:	{ from: 'Evectr', name: ['Content','Panel'] },
								props: 	{ 
									kind:	'side',
									name:	'tips-tricks',
									header: { label: 'Tip & Tricks',  icon: 'info-circle' },
									align: 	'spaced',
									body:	[
										{
											tag:	{ 
												from: 'Evectr', name: ['Content','Activity'] 
											},
											props:	{ 
												title: 	'Search for Exact Matches:',
												details:'Quae si potest singula consolando levare, universa quo modo sustinebit?',
											},
										}, {
											tag:	{ 
												from: 'Evectr', name: ['Content','Activity'] 
											},
											props:	{ 
												title: 	'Omit Certain Criteria:',
												details:'Praesertim cum in re publica princeps esse velles ad eamque tuendam cum summa tua dignitate maxime a nobis ornari atque instrui posses.',
											},
										}, 
									],
								}
							}, 
						]
					}
				},
			}, true);
		}
	}
}
