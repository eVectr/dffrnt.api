
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
module.exports = {
	Data:  [
		function (path, req) { return {}; },
	],
	Build: function (Actions, Stores, LID) {
		var THS = this;
		return function (res) {
			var PNL 	= { from: 'Evectr', name: ['Content','Panel'] },
				BLK 	= { from: 'Evectr', name: ['Content','Block'] },
				SBMT 	= { from: 'Evectr', name: ['Form','Button'] },
				BR  	= { tag: 'br' },
				HR  	= { tag: 'hr', props: { className: 'MTB spread' } },
				FLT 	= function FLT(v) { return !!v },
				SUBMIT 	= function SUBMIT(label, style, start, size) { 
					return {	
						tag:	'div',
						props:	{ className: [start||'one',size||'spread'].join(' ') },
						items: 	[{ 	
							tag:	SBMT,
							props:	{ 
								kind: 	 'submit',
								styles: [style||'info'],
								block:	 true,
								large:	 true,
								label:	 label||'Submit',
							},
					}]	
				};	};
			// -----
			var selects	= {
					sex: 		[
						{ value: 'M', label: 'Male' 	},
						{ value: 'F', label: 'Female' 	},
						{ value: 'I', label: 'Intersex' },
					],
					marital: 	[
						{ value: 'M', label: 'Married' 			 },
						{ value: 'S', label: 'Single' 			 },
						{ value: 'R', label: 'In a Relationship' },
					],
				};
			// -----
			return Stores.Apps[LID].singleton.updateStore({
				content: 	{
					built: 		true,
					segments: 	{
						copy: 	[
							{ 	// Distinctions
								tag:	PNL,
								props: 	{ 
									name:	'search-details',
									header: { label: 'Options', icon: 'search', subs: [
										{ name: 'search-location',  label: 'By Location'	},
										{ name: 'search-service',   label: 'By Service'		},
										{ name: 'search-distinct', 	label: 'By Distinction'	},
									]	},
									form: 	{
										'id':		'form-search-details',
										'action': 	'/results',
										'method':	'POST',
									},
									body:	[
										{		 // BY LOCATION
											tag:	BLK, props:  { 
												name: 	'search-location', 
												header: { fixed: true, label: 'By Location' },
												align:	'gridSlice',
												items: 	[
													{ 	tag:	'div',
														props:	{ className: 'spread' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Xput'] },
															props:	{
																id: 		'user-locale',
																name: 		'lid',
																kind:		'text',
																icon:		'location-arrow',
																placeholder:'User/Provider Location',
																hide: 		 true,
																data:		{
																	id:   'user-locale-sgst', 
																	url:  '/search/for/locale',
																	list: '/locale',
																},
																validate: 	{
																	pattern: /[\w\d% ,;.-]+/,
																	invalid: 'Please specify a City, Region and/or Country and choose your Locale from the list.',
																},
															}
													}]	},
												],
											}
										}, BR, { // BY SERVICE
											tag:	BLK, props:  { 
												name: 	'search-service', 
												header: { fixed: true, label: 'By Service' },
												align:	'gridSlice',
												items: 	[
													{ 	tag:	'div',
														props:	{ className: 'more' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Xput'] },
															props:	{
																id: 		'svc-name',
																name: 		'svcname',
																icon:		'sign',
																kind:		'text',
																placeholder:'Provider Service Name',
																validate: 	{
																	pattern: /[\w &|\/:;'"#@!?+,.-]+/,
																	invalid: 'Please specify a valid Service Name.',
																},
															}
													}]	},
													{ 	tag:	'div',
														props:	{ className: 'some' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Select'] },
															props:	{
																id: 		'svc-type',
																name:		'svctype',
																icon:		'barcode',
																title:		'Select a Service Type',
																options:	[],
																data:		{ url: '/list/services', id: 'select-type' },
													}	}	]	},
													{ 	tag:	'div',
														props:	{ className: 'spread' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Area'] },
															props:	{
																id: 		'svc-descr',
																name:		'svcdescr',
																icon:		'newspaper',
																rows:		 1,
																placeholder:'Phrases in the Service Description',
															}
													}]	}, 
												]
											}
										}, BR, { // BY DISTINCTIONS
											tag:	BLK, props:  { 
												name: 	'search-distinct', 
												header: { fixed: true, label: 'By Distinction' },
												align:	'gridSlice',
												items: 	[
													{ 	tag:	'div',
														props:	{ className: 'spread' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Xput'] },
															props:	{
																id: 		'user-hobbies',
																name:		'hids',
																icon:		'futbol',
																placeholder:'User/Provider Hobbies',
																tokens:		 [],
																strict: 	 true,
																levels:		[
																	{K: 1,V: 1}, {K: 2,V: 2}, {K: 3,V: 3},
																	{K: 4,V: 4}, {K: 5,V: 5}, {K: 6,V: 6},
																	{K: 7,V: 7}, {K: 8,V: 8}, {K: 9,V: 9},
																	{K:10,V:10}
																],
																more: 		['Casual'],
																data:		{
																	id:   		'user-hobbies-sgst', 
																	url:  		'/search/for/hobbies',
																	list: 		'/list/hobbies',
																	context:     true,
																},
																remove:		 true,
																help:		{ text: [{ tag: 'p', items: [
																	'Please input a list of your hobbies in order of preference. Your favorite should be first, followed by your second-favorite, and so forth.'
																]}]	},
															}
													}]	},
													{ 	tag:	'div',
														props:	{ className: 'spread' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Xput'] },
															props:	{
																id: 		'user-lang',
																name:		'lgids',
																icon:		'language',
																placeholder:'User/Provider Language(s)',
																tokens:		 [],
																strict: 	 true,
																remove:		 true,
																levels:		[
																	{K:'A1',V:1}, {K:'A2',V:2}, 
																	{K:'B1',V:3}, {K:'B2',V:4}, 
																	{K:'C1',V:5}, {K:'C2',V:6}
																],
																data:		{
																	id:   		'user-lang-sgst', 
																	url: 		'/search/for/languages',
																	list: 		'/list/languages',
																	context:     true,
																},
																help:		{ text: [
																	{ tag:  'p', items: ['You can input more than one language in this selection should you choose, but please use the format below:'] },
																	{ tag: 'ul', items: [{ tag: 'li', xerox: true, items: [
																		'Your primary language is entered first;',
																		'followed by a comma ,;',
																		'then all other subsequent languages (comma-separated), in the order of preference or skill.',
																	]}]	},
																	{ tag:  'p', items: ['Please see the placeholder example in the this input-box.'] },
																]	},
															}
													}]	},
													{ 	tag:	'div',
														props:	{ className: 'more' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Xput'] },
															props:	{
																id: 		'user-nations',
																name:		'nids',
																icon:		'flag',
																placeholder:[
																	'User/Provider Nationality',
																	'User/Provider Secondary Nationality',
																],
																limit:		 2,
																tokens:		 [],
																strict: 	 true,
																remove:		 true,
																data:		{
																	id:   		'user-nations-sgst', 
																	url:  		'/search/for/nationalities',
																	list: 		'/list/nationalities',
																	context:     true,
																},
																help:		{ text: [
																	{ tag:  'p', items: ['You can input a combination of two nationalities for instances where immigration or dual nationalities come into play.However, please input your primary identity as your nationality first, followed by a comma (,) then your secondary nationality.For example, Chinese-Americans would:'] },
																	{ tag: 'ul', items: [{ tag: 'li', xerox: true, items: [
																		'Input American first;',
																		'followed by a comma ,;',
																		'and then Chinese.',
																		'So you end up with, American, Chinese',
																	]}]	},
																]	},
															}
													}]	},
													{ 	tag:	'div',
														props:	{ className: 'some' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Xput'] },
															props:	{
																id: 		'user-religion',
																name:		'rid',
																icon:		'hand-peace',
																placeholder:'User/Provider Religion',
																limit:		 1,
																tokens:		[],
																strict: 	 true,
																data:		{
																	id:   'user-religion-sgst', 
																	url:  '/search/for/religions',
																	list: '/list/religions',
																},
																help:		{ kind: 'warn', text: [{tag: 'p', items: [
																	'Something about Religion!!!',
																]}] 	},
															}
													}]	},
													{ 	tag:	'div',
														props:	{ className: 'more' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Select'] },
															props:	{
																kind:		'slc-txt',
																id: 		'user-sex',
																name:		'Sex',
																icon:		'transgender-alt',
																title:		'sex',
																options:	 selects.sex,
																input:		{
																	kind: 		'tokens',
																	id: 		'user-orient',
																	name:		'GID',
																	placeholder:'User Orientation',
																	limit:		 1,
																	tokens:		[],
																	strict: 	 true,
																	data:		{
																		id:   'user-orient-sgst', 
																		url:  '/search/for/orientations',
																		list: '/list/orientations',
																	},
																},
																help:		{ text: [{tag: 'p', items: [
																	'People come in all shapes, sizes and Gender-Identifications. This is where you can express it.',
																]}] 	},
															}
													}]	},
													{ 	tag:	'div',
														props:	{ className: 'some' },
														items: 	[{
															tag:	{ from: 'Evectr', name: ['Form','Select'] },
															props:	{
																id: 		'user-marital',
																name:		'marital',
																icon:		'gem',
																title:		'User Marital Status',
																options:	selects.marital,
															}
													}]	},
												],
											}
										}, HR, SUBMIT('Search!','norm')
									].filter(FLT),		
								},
							},
						],
						other: 	[
							{ 	 // TIPS
								tag:	PNL,
								props: 	{ 
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
