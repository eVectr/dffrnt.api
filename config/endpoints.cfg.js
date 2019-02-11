
/////////////////////////////////////////////////////////////////////////////////////////////
// THINGS TO KNOW:
	//
	// SQL  - <Object> - See help for dffrnt.model
	// AMP  - <String> - AND character (+), for HTTP queries
	// ORS  - <String> -  OR character (;), for HTTP queries
	// PIP  - <String> -  OR character (|), for  SQL queries
	//
	// UER  - <Array>  - See help for Errors.js in dffrnt.router
	// MSG  - <Array>  - See help for Errors.js in dffrnt.router
	// PRM  - <Array>  - See help for Errors.js in dffrnt.router
	//
	// Docs - <Object> - See help for dffrnt.router
	//
	// LG   - <Object> - See help for dffrnt.utils
	// TLS  - <Object> - See help for dffrnt.utils
	// JSN  - <Object> - See help for dffrnt.utils
	//

/////////////////////////////////////////////////////////////////////////////////////////////
// IMPORT

const { RouteDB, GNHeaders, GNParam, GNDescr, PT, PType } = require('dffrnt.confs').Definers(); 

/////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT

	module.exports = function () { // DO NOT CHANGE/REMOVE!!!
		
		PT.L.JSON_ARRAY  =  PT.L.Int({ join: ',', enclosed: ["'[","]'"], min: 1 });
		PT.O.JSON_SETS   =  (new PType({ 
								name: 'Set', type: 'Object', 
								iterable: true,  sanitizers(v) {
									// ------------------------------------- 
										if (UoN(v)) return null;
										if (CNAME(v)!=='Object') return null;
										if (UoN(v.K)||UoN(v.V)) return null;
									// ------------------------------------- 
									let THS = this;
									// -------------------------------------
										v.K = PT.Int.sanitize(v.K);
										v.V = PT.Int.sanitize(v.V);
									// ------------------------------------- 
										if (UoN(v.K)||UoN(v.V)) return null;
									// -------------------------------------
										return `'$.${v.K}','${v.V}'`;
								},
							}))({ join: ',' });
		PT.O.JSON_REMS   =  PT.L.Int({ join: ',', map(v) { return `'$.${v}'`; } })
		PT.L.JSON_EDITS  =  (new PType({ 
								name: 'Edits', type: 'Number', 
								iterable: false,  sanitizers(v) {
									let THS = this, 
										col = THS.tags[0],
										val = PT.L.Leveled.sanitize(v),
										set = PT.O.JSON_SETS.sanitize(val[0]),
										rem = PT.O.JSON_REMS.sanitize(val[1]),
										res = null;
									if (!!set||!!rem) {
										res = (!!set ? `JSON_SET(${col},${set})`: col);
										if (!!rem) res = `JSON_REMOVE(${res},${rem})`;	
									};	return res;
								},
							}))({ tags: ['t.column'] });
		PT.SearchTerm	 = 	(new PType({
								name: 'Text', type: 'String', iterable: false, 
								sanitizers(v) {
										if (UoN(v)) return;
									// ------------------------------------------------------------
										function ftxts(term) { 
											let x =[/\w+/g, /("(?:\\"|[^"])+")/g],
												a = term.match(x[1])||[],
												r =[term.replace(x[1],'')
														.replace(/([;.-]+|\b(the|of)\b)/g,' ')
														.split(/[,\s]+/)
														.filter((v,i)=>!!v&&!a.has(v))
														.join(', ')
														.replace(/(\b\S{3,}\b)(?!,)/g, '+(<$1* >"$1")')
														.replace(/(\b\S{3,}\b),/g, '+"$1"')
														.replace(/(\b\S{1,2}\b),/g, '$1'),
													(!!a.length?a.join(' +'):'')
														.replace(/(^.+$)/,'+$1')];
											return r.filter(v=>!!v).join(' ');
										}
									// ------------------------------------------------------------
									let mch = v.match(/^[^\s\d]{0,3}(\d+(,\d{2,3})*([.]\d{2})?)( [A-Z]{1,3}|)$/);
									// ------------------------------------------------------------
										return [(!!mch ? mch[0] : ftxts(v)), v];
								}
							}));

		/////////////////////////////////////////////////////////////////////////////////////

		const 	FJS   = Imm.fromJS,
				optns = { 
							Sex: [
								{ value: 'M', label: 'Male'		},
								{ value: 'F', label: 'Female'	},
								{ value: 'I', label: 'Intersex'	},
							],
							Marital: [
								{ value: 'M', label: 'Married'		},
								{ value: 'R', label: 'Relationship'	},
								{ value: 'S', label: 'Single'		},
							],
							SvcType: [
								{ value: '01100', label: 'Accounting/Tax' 		},
								{ value: '01101', label: 'Artist' 				},
								{ value: '01102', label: 'Child Care' 			},
								{ value: '01103', label: 'Cleaner' 				},
								{ value: '01104', label: 'Cooking/Catering' 	},
								{ value: '01105', label: 'Designing' 			},
								{ value: '01106', label: 'DJ' 					},
								{ value: '01107', label: 'Entertainment' 		},
								{ value: '01108', label: 'Equipment Rental' 	},
								{ value: '01109', label: 'Fitness' 				},
								{ value: '01110', label: 'Installation' 		},
								{ value: '01111', label: 'Labour' 				},
								{ value: '01112', label: 'Massage/Chiropractic' },
								{ value: '01113', label: 'Mobile Services' 		},
								{ value: '01114', label: 'Moving/Delivery' 		},
								{ value: '01115', label: 'Pet Sitting' 			},
								{ value: '01116', label: 'Photography' 			},
								{ value: '01117', label: 'Teaching/Tutoring' 	},
								{ value: '01118', label: 'Tech Support' 		},
								{ value: '01119', label: 'Tour Guide' 			},
								{ value: '01120', label: 'Translation' 			},
								{ value: '01121', label: 'Web/Programming' 		},							
							],
							SvcRate: [
								{ value: 'Free',	label: 'Free'		},
								{ value: 'Flat',	label: 'Flat'		},
								{ value: 'Hourly',	label: 'Hourly'		},
								{ value: 'Daily',	label: 'Daily'		},
								{ value: 'Monthly',	label: 'Monthly'	},
								{ value: 'Quote',	label: 'Quote'		},
							],
							Context: [
								{ value: 'VT', label: 'Service Type' 		},
								{ value: 'VD', label: 'Service Description' },
								{ value: 'VC', label: 'Service Charge' 		},
								{ value: 'VR', label: 'Service Rate' 		},
								{ value: 'LC', label: 'Locale' 				},
								{ value: 'HB', label: 'Hobby' 				},
								{ value: 'LG', label: 'Language' 			},
								{ value: 'NL', label: 'Nationality' 		},
								{ value: 'RL', label: 'Religion' 			},
								{ value: 'SX', label: 'Sex' 				},
								{ value: 'MS', label: 'Marital Status' 		},
								{ value: 'OR', label: 'Orientation' 		},
								{ value: 'GD', label: 'Gender' 				},
							],
							RUnits:  [
								{ value: 'K', label: 'Kilometers' 	},
								{ value: 'M', label: 'Miles' 		}
							]
						},
				cntxp = {	'LC' : 'lid', 
							'VT' : 'svctype',   'VD' : 'svcdescr',  
							'VR' : 'svcrate',   'VC' : 'svccharge',
							'HB' : 'hids',      'LG' : 'lgids',
							'NL' : 'nids',      'RL' : 'Rids',
							'GD' : 'gids',      'SX' : 'sex',
							'MS' : 'marital',   'OR' : 'oids',
							'AG' : 'age' },
				lcale = function lcale() { 
							return function Parse(res) {
								var RQ = this.RQ, QY = this.QY;
								return 	Imm.Map(JSN.Objectify(
											res, RQ.Key, RQ.Columns, QY
										)).map(v=>v.user).toJS();
							};
						},
				scqry = function scqry(TAG, QRY, VERB) { 
							let CNT, CQY, BEG, END, TG = 'S.tag', 
								TB = `\n${' '.dup(17)}`, SP = ' '.dup(13),
								TYP = TYPE(TAG, Array); 
							// Build Counters ---------------------------------------------- //
								if (TYP) { // Multi  Counters
									let CSE = TAG.map(v=>{ let C = `@CNT_${v}`;
											return `${TG} = '${v}' THEN ${C}:=${C}+1`;
										});
									CNT = `(CASE${TB}WHEN ${CSE.join(`${TB}WHEN `)}\n${SP}END)`; 
									CQY = `${TAG.map(v=>`@CNT_${v}:=0`).join(',')}`;
								} else {   // Single Counters
									CNT =  `@CNT_${TAG}`; CQY = `${CNT}:=0`; 
									CNT += `:=${CNT}+1`; TG  = `'${TAG}' AS tag`;
								}
							// Build Verbage ----------------------------------------------- //
								VERB = ( !TYP ? `'${VERB}' AS verb` : `S.verb` );
							// Build Wrapper Statemnets ------------------------------------ //
								BEG = 	`SELECT  S.score, ${CNT} AS idx, S.verb,`
										.split('\n').concat([
										`        S.value, S.tag, S.label, S.description`,
										"FROM    (",
										"    SELECT Q.* FROM (",
										`         SELECT  (S.score+(S.score/S.len)) AS score, ${VERB}, S.value,`,
										`                 ${TG}, S.label, S.description`,
										"         FROM    ("
										]);
								END = [ `         ) AS S, (SELECT ${CQY}) C`,
									  	"    ) AS Q ORDER BY Q.score DESC",
									  	`) AS S`,
									  	":LIMIT: :PAGE:"];
							// Build & Return Query ---------------------------------------- //
								return BEG.concat(QRY.map(v=>`${SP}${v}`),END);
						},
				spars = function sparse() { 
							return function Parse(res) {
								var RQ  = this.RQ, QY = this.QY,
									all = FJS(res),
									IDs = [], obj, avg, MAP, C, ret,
									cat = Imm.Map({ user: 'user' }), 
									sgl = !!eval(QY.single),
									dls = Imm.List([]);
									dmp = Imm.Map({});
								// ------------------------------------------------------------
									obj = 	all .slice(1).groupBy(v=>v.get('user_id'));
									MAP = 	obj.map(v=>v.get(0));
											C = MAP.size;
									avg =  (MAP .reduce((s,v)=>s+v.get('score'),0)/C);
									ret =	MAP	.filter(r=>((r.get('score')/avg)>=.6));
								// ------------------------------------------------------------
									if (IDs = ret.keySeq().toArray(), IDs) { 
										var qry = `?${[ 'to=["payload","result"]',
														`single=${sgl}`,
														`links=["${[
															'photos',
															'identity',
															'settings',
														].join('","')}"]`,
														'as=item',
													].join('&')}`,
											prm = `:uids:${IDs.join(';')}`;
										cat.map((l,c)=>{
											var lnk = `/${l}/${prm}${qry}`;
											RQ.links[c]=SQL.SOCKET({ link: lnk });
										});
									};
								// ------------------------------------------------------------
									ret = 	ret.set('terms', all.get(0,dmp).get('multi',dls));
								// ------------------------------------------------------------
									return 	ret.toJS();
							};
						};
		
		/////////////////////////////////////////////////////////////////////////////////////
		return { 
			// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			__DEFAULTS: 	{
				// BASICS ===================================================================
					UID: 		new GNParam({
									Name:	 	'User ID',
									Default: 	 0,
									Format 		(cls) { return cls.uid; },
									Desc: 		new GNDescr({
										type: PT.Int, 
										description: 'A valid {{User ID}}', 
										required: 	  true, 
										matches: 	{ 'User ID': 'Matches the {{User ID}} (([0-9]+))' },
										to: 		'param',
									})
								})
								.AddVersion('QUERY',  { Desc: { required: true, to: 'query' } })
								.AddVersion('QHIDE',  { Desc: { hidden: true } })
								.AddVersion('PHIDE',  { Desc: { to: 'param' } })
								.AddVersion('HIDDEN', { Desc: { hidden: false } }),
					UIDs: 		new GNParam({
									Name:	 	'User IDs',
									Default: 	 0,
									Format 		(cls) { return cls.uids; },
									Desc: 		new GNDescr({
										type: PT.L.Int({ join: ',' }), 
										description: 'A semi-colon-separated list of valid {{User IDs}}',
										required: null, 
										matches: { 'User ID': 'Matches ANY of the {{UID}} Items (([0-9]+))' },
										to: 'param',
									})
								})
								.AddVersion('QUERY', { Desc: { required: true, to: 'query' } }),
					MD5: 		new GNParam({
									Name:	 	'MD5 Checksum',
									Default: 	'',
									Format 		(cls) { return cls.md5; },
									Desc: 		new GNDescr({
										type: PT.MD5, 
										description: "An {{<<NAME>>}} Record", 
										required: true, 
										matches: { '<<NAME>>': 'The {{<<NAME>>}} of the {{User}} (([\\w@_.-]+))' },
										to: 'param', 
									})
								}),
					Email: 		new GNParam({
									Name: 		'Email',
									Default: 	'',
									Format 		(cls) { return cls.email; },
									Desc: 	 	new GNDescr({
										type: PT.Email,
										description: "The user's {{Email Address}}", 
										required: null, 
										matches: { 'Email Address': 'The {{Email Address}} to check (([\\w@_.-]+))' },
										to: 'param',
									})
								})
								.AddVersion('EDIT', { Desc: { 
									required: false, 
									matches: { 'Email Address': 'The {{Email Address}} of the {{User}} (([\\w@_.-]+))' },
									to: 'query', 
								} }),
					UserName: 	new GNParam({
									Name: 		'Display Name',
									Default: 	'',
									Format		(cls) { return cls.username; },
									Desc: 	 new GNDescr({
										type: PT.Uname,
										description: "The user's {{Display Name}}", 
										required: null, 
										matches: { 'Display Name': 'The {{Display Name}} to check (([A-Za-z0-9_.-]+))' },
										to: 'param', 
									})
								})
								.AddVersion('QUERY',  { Desc: { required: false, to: 'query' } }),
					Account: 	new GNParam({
									Name: 	 'Display Name',
									Default: '',
									Format 	 (cls) { return `(${cls.account.map(v=>`"${v}"`).join(',')})`; },
									Desc: 	 new GNDescr({
										type: PT.L.Text({ separator: "','", regex: /^[A-Za-z0-9._-]+|$/ }), 
										required: null, 
										description: "A list of User {{<<NAME>>s}}", 
										matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} of the {{User}} (([A-Za-z0-9_.-]+))' }, 
										to: 'param', 
									})
								})
								.AddVersion('HIDDEN', { Desc: { hidden: true, required: false, to: 'query' } }),
					Password:	new GNParam({
									Name:	 'Password',
									Aliases: ['Current','ConfPass'],
									Default: '',
									Format	 (cls) { return cls.password; },
									Desc: 	 new GNDescr({
										type: PT.Password, 
										description: "A valid {{<<NAME>>}}", 
										required: true,
										to: 'query', 
									})
								})
								.AddVersion('CURRENT', {
									Format	 (cls) { return cls.current; },
									Desc: 	 { description: "The user's current {{<<NAME>>}}" }
								})
								.AddVersion('CONFIRM', {
									Format	 (cls) { return cls.confpass; },
									Desc: 	 { description: "Confirms a new {{<<NAME>>}}" }
								}),	
					FirstName: 	new GNParam({
									Name:	 'First Name',
									Default: '',
									Format 	 (cls) { return cls.firstname; },
									Desc: 	 new GNDescr({
										type: PT.Name, 
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': `Updates the {{<<NAME>>}} of the {{User}} (([A-z0-9 .-]))` },
										required: false,
										to: 'query', 
									})
								}),
					LastName: 	new GNParam({
									Name:	 'Last Name',
									Default: '',
									Format 	 (cls) { return cls.lastname; },
									Desc: 	 new GNDescr({
										type: PT.Name, 
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': `Updates the {{<<NAME>>}} of the {{User}} (([A-z0-9 .-]))` },
										required: false,
										to: 'query', 
									})
								}),
					BirthDate: 	new GNParam({
									Name:	 'Birth Date',
									Default: '',
									Format 	 (cls) { return cls.birthdate; },
									Desc: 	 new GNDescr({
										type: PT.Date,
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} ((\\d{2}-\\d{2}-\\d{4}))' },
										required: false,
										to: 'query', 
									})
								}),
					Picture: 	new GNParam({
									Name:	 'Profile Image',
									Default: 'NULL',
									Format	 (cls) { return cls.picture; },
									Desc: 	 new GNDescr({
										type: PT.Int({ min: 1 }), 
										description: "A valid {{Image ID}}", 
										matches: { '<<NAME>>': `Updates the {{<<NAME>>}} of the {{User}} (([0-9]+))` },
										required: true,
										to: 'query', 
									})
								}),
					Cover: 		new GNParam({
									Name:	 'Cover Image',
									Default: 'NULL',
									Format	 (cls) { return cls.cover; },
									Desc: 	 new GNDescr({
										type: PT.Int({ min: 1 }), 
										description: "A valid {{Image ID}}", 
										matches: { '<<NAME>>': `Updates the {{<<NAME>>}} of the {{User}} (([0-9]+))` },
										required: true,
										to: 'query', 
									})
								}),
					Visibles: 	new GNParam({
									Name:	 'Visiblity Flags',
									Default: -1,
									Format 	 (cls) { return cls.visibles; },
									Desc: 	 new GNDescr({
										type: PT.Bitwise, 
										description: "The user's {{<<NAME>>}}",
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} ((\\d^10))' },
										required: false, 
										to: 'query', 
									})
								}),
				// DISTINCTIONS =============================================================
					Age: 		new GNParam({
									Name:		'Age',
									Default: 	'',
									Format		(cls) { return cls.age; },
									Desc: 		new GNDescr({
										type: PT.Int({ min: 13, max: 99 }), 
										description: "The user's {{Age}}", 
										required: false, 
										matches: { 'Age': 'Matches the {{Age}} of the {{User}} (([0-9]+))' },
										to: 'query',
										// style: 'half', 
									})
								})
								.AddVersion('SEARCH', { 
									Desc: { type: PT.IRange({ tags: ['AG-','AG+'], min: 13, max: 99 }) },
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true },
								}, 	'SEARCH'),
					Sex: 		new GNParam({
									Name:		'Sex',
									Default: 	'NULL',
									Format		(cls) { return cls.sex; },
									Desc: 		new GNDescr({
										type: 	PT.Text({ selects: optns.Sex }), 
										description: "The user's {{Sex}}", 
										required: false, 
										matches: { 'Sex': 'Matches the {{Sex}} of the {{User}} ((M|F|I))' },
										to: 'query', 
										// style: 'half', 
									})
								})
								.AddVersion('SEARCH', { 
									Desc: { type: PT.L.Text({ select: optns.Sex }) },
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true },
								}, 	'SEARCH'),
					Marital: 	new GNParam({
									Name:		'Marital Status',
									Default: 	'NULL',
									Format		(cls) { return cls.marital; },
									Desc: 		new GNDescr({
										type: 	PT.Text({ select: optns.Marital }), 
										description: "The user's {{Marital Status}}", 
										required: false, 
										matches: { 'Marital Status': 'Matches the {{Marital Status}} of the {{User}} ((M|R|S))' },
										to: 'query', 
										// style: 'half', 
									})
								})
								.AddVersion('SEARCH', { 
									Desc: { type: PT.L.Text({ select: optns.Marital }) },
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true },
								}, 	'SEARCH'),
					LID:		new GNParam({
									Name: 	 'Locale ID', 
									Default: '', 
									Format   (cls) { return cls.lid||'(SELECT location FROM users WHERE user_id = :UID:)'; },
									Desc: 	 new GNDescr({
										type: PT.Int({ min: 1 }), 
										description: `A valid {{Locale ID}}`,
										matches: { 'Locale ID': 'Matches ANY of the {{Locale ID}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('SEARCH', { Desc: { to: 'query' } })
								.AddVersion('SEARCH_HID', { Desc: { hidden: true } }, 'SEARCH')
								.AddVersion('SIGNUP', { 
									Default: 'NULL',
									Format 	 (cls) { return cls.lid; },
									Desc:	 {
										matches: {
											'Location': 'Updates the {{Location}} of the {{User}} ((\\d{2}+))'
										},
									}
								}, 'SEARCH'),
					LIDs: 		new GNParam({
									Name: 	 'Locale IDs', 
									Default: 'NULL', 
									Format   (cls) { return cls.lids; },
									Desc: 	 new GNDescr({
										type: PT.L.Int, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('SEARCH', { 
									Format	 (cls) { return `'[${cls.lids}]'`; },
									Desc: 	 { type: PT.L.Int({ join: ',', min: 1 }), to: 'query' } 
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true } 
								}, 'SEARCH'),
					HIDs: 		new GNParam({
									Name: 	 'Hobby IDs', 
									Default: 'NULL',
									Format   (cls) { return cls.hids; },
									Desc: 	 new GNDescr({
										type: PT.L.JSON_ARRAY, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('LOCALE', { 
										Default: ["AND JSON_CONTAINS(","    JSON_KEYS(d.profile_hobbies),","    JSON_QUOTE(CONVERT(h.hobby_id,CHAR(5)",")))"].join(`\n${'    '.dup(11)}`), 
										Desc: 	 { type: PT.L.Int({ join: ',', enclosed: ["AND h.hobby_id IN (",")"], min: 1 }) } 
									})
								.AddVersion('SEARCH', { 
										Desc: 	{ to: 'query' } 
									})
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true } 
									}, 'SEARCH')
								.AddVersion('EDIT', { 
										Name:	 'Hobby Edits',
										Default: 'd.profile_hobbies',
										Desc: 	 { 
											type: PT.L.JSON_EDITS({ tags: ['d.profile_hobbies'] }), 
											description: "The user's {{<<NAME>>}}",
											matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} for the {{User}} (([0-9]+(?:@[0-9]+)?))' },
											to: 'query',
											style: 'full',
										} 
									}),
					LGID:		new GNParam({
									Name: 	 'Site Language',
									Default: -1,
									Format 	 (cls) { return cls.lgid; },
									Desc: 	 new GNDescr({
										type: PT.Int({ min: 1 }),
										description: "The user's {{<<NAME>>}}",
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} (([\\w(,) -]+))' },
										required: false, 
										to: 'query', 
									})
								}),
					LGIDs: 		new GNParam({
									Name: 	 'Language IDs', 
									Default: 'NULL',
									Format   (cls) { return cls.lgids; },
									Desc: 	 new GNDescr({
										type: PT.L.JSON_ARRAY, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('LOCALE', { 
										Default: ["AND JSON_CONTAINS(","    JSON_KEYS(d.profile_languages),","    JSON_QUOTE(CONVERT(l.language_id,CHAR(5)",")))"].join(`\n${'    '.dup(11)}`), 
										Desc: 	 { type: PT.L.Int({ join: ',', enclosed: ["AND l.language_id IN (",")"], min: 1 }) } 
									})
								.AddVersion('SEARCH', { 
										Desc: 	{ to: 'query' } 
									})
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true } 
									}, 'SEARCH')
								.AddVersion('EDIT', { 
										Name:	 'Language Edits',
										Default: 'd.profile_languages',
										Desc: 	 { 
											type: PT.L.JSON_EDITS({ tags: ['d.profile_languages'] }), 
											description: "The user's {{<<NAME>>}}",
											matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} for the {{User}} (([0-9]+(?:@[0-9]+)?))' },
											to: 'query',
											style: 'full',
										} 
									}),
					NIDs: 		new GNParam({
									Name: 	 'Nationality IDs', 
									Default: 'NULL',
									Format   (cls) { return cls.nids; },
									Desc: 	 new GNDescr({
										type: PT.L.JSON_ARRAY, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('LOCALE', { 
									Default: ["AND JSON_CONTAINS(","d.profile_nationalities,","n.nationality_id)"].join(`\n${' '.dup(5)}${'    '.dup(10)}`), 
									Desc: 	 { type: PT.L.Int({ join: ',', enclosed: ["AND n.nationality_id IN (",")"], min: 1 }) } 
								})
								.AddVersion('SEARCH', { 
									Desc: 	{ to: 'query' } 
								})
								.AddVersion('SEARCH_HID', { 
									Desc:    { hidden: true } 
								}, 'SEARCH')
								.AddVersion('EDIT', { 
									Default: 'd.profile_nationalities',
									Desc:    { type: PT.L.Int({ slice: [0,2], join: ',', enclose: [`'[`,`]'`], min: 1 }) } 
								}, 'SEARCH'),
					RID: 		new GNParam({
									Name:		'Religion ID',
									Default: 	'NULL',
									Format 		(cls) { return cls.rid; },
									Desc: 		new GNDescr({
										type: PT.Int({ min: 1 }),
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} of the {{User}} (([0-9]+))' },
										required: false,
										to: 'query', 
										style: 'half', 
									})
								}),
					RIDs: 		new GNParam({
									Name: 	 'Religion IDs', 
									Default: 'NULL',
									Format   (cls) { return cls.rids; },
									Desc: 	 new GNDescr({
										type: PT.L.JSON_ARRAY, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('LOCALE', { 
									Default: 'AND r.religion_id = d.profile_religion',
									Desc: 	 { type: PT.L.Int({ join: ',', enclosed: ["AND r.religion_id IN (",")"], min: 1 }) } 
								})
								.AddVersion('SEARCH', { 
									Desc: 	{ to: 'query' } 
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true } 
								}, 'SEARCH'),
					OID: 		new GNParam({
									Name:		'Orientation ID',
									Default: 	'NULL',
									Format 		(cls) { return cls.oid; },
									Desc: 		new GNDescr({
										type: PT.Int({ min: 1 }),
										description: "The user's {{<<NAMES>>}}", 
										matches: { '<<NAMES>>': 'Matches the {{<<NAMES>>}} of the {{User}} (([0-9]+))' },
										required: false,
										to: 'query', 
										style: 'half', 
									})
								}),
					OIDs: 		new GNParam({
									Name: 	 'Orientation IDs', 
									Default: 'NULL',
									Format   (cls) { return cls.oids; },
									Desc: 	 new GNDescr({
										type: PT.L.JSON_ARRAY, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('LOCALE', { 
									Default: 'AND o.orient_id = d.profile_orient', 
									Desc: 	 { type: PT.L.Int({ join: ',', enclosed: ["AND o.orient_id IN (",")"], min: 1 }) } 
								})
								.AddVersion('SEARCH', { 
									Desc: 	{ to: 'query' } 
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true } 
								}, 'SEARCH'),
					GID: 		new GNParam({
									Name:		'Gender ID',
									Default: 	'NULL',
									Format 		(cls) { return cls.gid; },
									Desc: 		new GNDescr({
										type: PT.Int({ min: 1 }),
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} of the {{User}} (([0-9]+))' },
										required: false,
										to: 'query', 
										style: 'half', 
									})
								}),
					GIDs: 		new GNParam({
									Name: 	 'Genders IDs', 
									Default: 'NULL',
									Format   (cls) { return cls.gids; },
									Desc: 	 new GNDescr({
										type: PT.L.JSON_ARRAY, 
										description: `A semi-colon-separated list of {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										required: false,
										to: 'param',
									})
								})
								.AddVersion('LOCALE', { 
									Default: 'AND g.gender_id = d.profile_identity', 
									Desc: 	 { type: PT.L.Int({ join: ',', enclosed: ["AND g.gender_id IN (",")"], min: 1 }) } 
								})
								.AddVersion('SEARCH', { 
									Desc: 	{ to: 'query' } 
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true } 
								}, 'SEARCH'),
					Descr: 		new GNParam({
									Name: 	 'Profile Description',
									Default: '',
									Format 	 (cls) { return cls.descr; },
									Desc: 	 new GNDescr({
										type: PT.TextArea, 
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} (([\S\s]+))' },
										required: false, 
										to: 'query', 
										// style: 'full', 
									})
								})
								.AddVersion('SVC_DOC', {
									Name: 	 'Document Description',
									Default: '',
									Format 	 (cls) { return cls.descr; },
									Desc: 	 {
										type: PT.TextArea, 
										description: "The Service {{<<NAME>>}}", 
										required: true, 
										to: 'query', 
										// style: 'full', 
									}
								}),
					Edu: 		new GNParam({
									Name: 	 'Education',
									Default: '',
									Format 	 (cls) { return cls.edu; },
									Desc: 	 new GNDescr({
										type: PT.TextArea, 
										description: "The user's {{<<NAME>>}}", 
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} (([\S\s]+))' },
										required: false, 
										to: 'query', 
										// style: 'full', 
									})
								}),
					EduDescr: 	new GNParam({
									Name:	 'Education Description',
									Default: '',
									Format 	 (cls) { return cls.edudescr; },
									Desc: 	 new GNDescr({
										type: PT.TextArea, 
										description: "The user's {{Education Description}}", 
										matches: { 'Education Description': 'Updates the {{Education Description}} of the {{User}} (([\S\s]+))' },
										required: false, 
										to: 'query', 
										// style: 'full', 
									})
								}),
				// SEARCH ===================================================================
					Term:		new GNParam({
									Name: 	 'Search Term',
									Default: '',
									Format 	 (cls) { cls.rawterm = cls.term[1]; return cls.term[0]; },
									Desc: 	 new GNDescr({
										type: PT.SearchTerm, 
										description: `A {{Search Term}} for the {{<<NAME>> Name}}`, 
										matches: { '<<NAME>> Name': 'Matches the name of the {{<<NAME>>}}, (([A-z0-9,.-]+))' }, 
										required: true, 
										to: 'param', 
									})
								})
								.AddVersion('Miscs',         { Name: 'Misc' })
								.AddVersion('Genders',       { Name: 'Gender' })
								.AddVersion('Orientations',  { Name: 'Orientation' })
								.AddVersion('Religions',     { Name: 'Religions' })
								.AddVersion('Nationalities', { 
									Name: 'Nationality', Desc: { matches: {
										'Nationality Name': 'Matches the name of the {{Nationality}}, (([A-z0-9,.-]+))',
											'Country Name': 'Matches the name of the {{Nation}} itself, (([A-z0-9,.-]+))',
									} 	} 	})
								.AddVersion('Languages',     { Name: 'Language' })
								.AddVersion('Hobbies',       { Name: 'Hobby' })
								.AddVersion('Locales',       { 
									Name: 'Locale', Desc: { matches: {
										'City': 	'Matches the {{City}}, unless omitted (([A-z0-9,.-]+))',
										'Region': 	'Matches the {{Region}}, unless omitted (([A-z0-9,.-]+))',
										'Country': 	'Matches the {{Country}}, unless omitted (([A-z0-9,.-]+))',
									} 	} 	})
								.AddVersion('Cities',        { Name: 'City' })
								.AddVersion('Regions',       { Name: 'Region' })
								.AddVersion('Countries',     { Name: 'Country' })
								.AddVersion('Charges',       { 
									Name: 'Charge', Desc: { matches: { 
										'Currency Name':'Matches the name of the {{Currency}}, (([^\\s\\d]{0,3}(\\d+(,\\d{2,3})*([.]\\d{2})?)?))' 
									}	} 	})
								.AddVersion('Providers',     { 
									Name: 'Provider', Desc: { matches: {
										'Service Name':'Matches the {{Name}} of the {{Provider Service}}, (([A-z0-9,/.-]+))',
										'Service Description':'Matches the {{Description}} of the {{Provider Service}}, (([A-z0-9,/.-]+))',
									} 	} 	})
								.AddVersion('Services',      { Name: 'Service' })
								.AddVersion('Suggestions',   { 
									Name: 'Suggest', Desc: { matches: {
										'Service Type': 		'Matches the {{Service Type}} (([A-z0-9,/.-]+))',
										'Service Charge': 		'Matches the {{Service Charge}} ((\\w?\\d+(\\.\\d{2})?\\w?))',
										'Service Rate': 		'Matches the {{Service Rate}} (([A-z0-9,/.-]+))',
										'Locale': 				'Matches the {{Locale}} (([A-z0-9,/.-]+))',
										'Hobby': 				'Matches the {{Hobby}} (([A-z0-9,/.-]+))',
										'Language': 			'Matches the {{Language}} (([A-z0-9,/.-]+))',
										'Nationality': 			'Matches the {{Nationality}} (([A-z0-9,/.-]+))',
										'Religion': 			'Matches the {{Religion}} (([A-z0-9,/.-]+))',
										'Sex': 					'Matches the {{Sex}} (([A-z0-9,/.-]+))',
										'Marital Status': 		'Matches the {{Marital Status}} (([A-z0-9,/.-]+))',
										'Orientation': 			'Matches the {{Orientation}} (([A-z0-9,/.-]+))',
										'Gender': 				'Matches the {{Gender}} (([A-z0-9,/.-]+))',
									} 	} 	}),
					Terms: 		new GNParam({
									Name: 	 'Search Terms',
									Default: '',
									Format 	 (cls) {
										let trms = Imm.Map(cls.terms);
										trms.map((V,K)=>(cls[cntxp[K]]=V.join(ORS)));
										return null;
									},
									Desc: 	new GNDescr({
										type: PT.L.Multi, 
										description: 'A list of {{Search Terms}} for querying',
										matches: {
											'Locale': 				'Matches the {{Locale}}, unless omitted (([A-z0-9,/.-]+))',
											'Service Type': 		'Matches the {{Service Type}}, unless omitted (([A-z0-9,/.-]+))',
											'Service Description': 	'Matches the {{Service Description}}, unless omitted (([A-z0-9,/.-]+))',
											'Service Charge': 		'Matches the {{Service Charge}}, unless omitted ((\\w?\\d+(\\.\\d{2})?\\w?))',
											'Service Rate': 		'Matches the {{Service Rate}}, unless omitted (([A-z0-9,/.-]+))',
											'Hobby': 				'Matches the {{Hobby}}, unless omitted (([A-z0-9,/.-]+))',
											'Language': 			'Matches the {{Language}}, unless omitted (([A-z0-9,/.-]+))',
											'Nationality': 			'Matches the {{Nationality}}, unless omitted (([A-z0-9,/.-]+))',
											'Religion': 			'Matches the {{Religion}}, unless omitted (([A-z0-9,/.-]+))',
											'Sex': 					'Matches the {{Sex}}, unless omitted (([A-z0-9,/.-]+))',
											'Marital Status': 		'Matches the {{Marital Status}}, unless omitted (([A-z0-9,/.-]+))',
											'Orientation': 			'Matches the {{Orientation}}, unless omitted (([A-z0-9,/.-]+))',
											'Gender': 				'Matches the {{Gender}}, unless omitted (([A-z0-9,/.-]+))',
										},
										required: true, 
										to: 'query', 
									})
								}),
					Context:	new GNParam({
									Name: 	 'Search Context',
									Default: '[]',
									Format   (cls) { return cls.context; },
									Desc: 	{
										type: PT.L.Text({ 
												map(v) { return v.replace(/\b\d+@/g,''); },
												join: ',', enclose: [`[`,`]`],
											}),
										description: 'The {{<<NAME>>}} (the previous {{Search Terms}})',
										matches: {
											'VT': 'Matches the {{<<NAME>>}} of a {{Service Type}} ((VT))',
											'VD': 'Matches the {{<<NAME>>}} of a {{Service Description}} ((VD))',
											'VC': 'Matches the {{<<NAME>>}} of a {{Service Charge}} ((VC))',
											'VR': 'Matches the {{<<NAME>>}} of a {{Service Rate}} ((VR))',
											'LC': 'Matches the {{<<NAME>>}} of a {{Locale}} ((LC))',
											'HB': 'Matches the {{<<NAME>>}} of a {{Hobby}} ((HB))',
											'LG': 'Matches the {{<<NAME>>}} of a {{Language}} ((LG))',
											'NL': 'Matches the {{<<NAME>>}} of a {{Nationality}} ((NL))',
											'RL': 'Matches the {{<<NAME>>}} of a {{Religion}} ((RL))',
											'SX': 'Matches the {{<<NAME>>}} of a {{Sex}} ((SX))',
											'MS': 'Matches the {{<<NAME>>}} of a {{Marital Status}} ((MS))',
											'OR': 'Matches the {{<<NAME>>}} of a {{Orientation}} ((OR))',
											'GD': 'Matches the {{<<NAME>>}} of a {{Gender}} ((GD))',
										},
										required: false, 
										to: 'query', 
									}
								})
								.AddVersion('MULTI', { 
									Default: '{}',
									Format   (cls) { return JSON.stringify(cls.context); },
									Desc: 	 { type: PT.L.Multi } 
								}),
					RawTerm: 	new GNParam({
									Name:	 'Raw Search Term',
									Default: '',
									Format	 (cls) { return cls.rawterm; },
									Desc: 	 new GNDescr({
										type: PT.Text, 
										description: 'The {{raw}} {{Search Terms}}', 
										matches: {},
										required: false, 
										hidden: true, 
										to: 'query',
									})
								}), 
					Radius: 	new GNParam({
									Name:	 'Radius',
									Default:  25,
									Format 	 (cls) { return cls.radius; },
									Desc: 	 new GNDescr({
										type: PT.Int({ min: 25, max: 500, step: 25 }), 
										description: "The {{<<NAME>>}} for the {{Locale}}", 
										matches: { '<<NAME>>': 'Specifies the {{<<NAME>>}}, unless omitted (([1-5]?[0-9]{1,3}|6[0-3][0-7][0-1]))' },
										required: false, 
										to: 'query', 
									})
								})
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true },
									}, 	'SEARCH'),
					Units: 		new GNParam({
									Name: 	 'Radial Unit',
									Default: 'K',
									Format 	(cls) { 
										let units = cls.units, rdius = (cls.radius||25);
										cls.radius = (units=='K' ? rdius : rdius*1.60934); 
										return null;
									},
									Desc: 	new GNDescr({
										type: PT.Text({ selects: optns.RUnits }), 
										description: "The {{<<NAME>>}} for the {{Locale Radius}}", 
										matches: { '<<NAME>>': 'Either {{Kilometers}} or {{Miles}}, unless omitted ((K|M))' },
										required: false, 
										to: 'query', 
									})
								})
								.AddVersion('SEARCH_HID', { 
									Desc: { hidden: true },
								}, 	'SEARCH'),
				// SERVICES =================================================================
					PDID: 		new GNParam({
									Name:	 	'Provider ID',
									Default: 	 0,
									Format 		(cls) { return cls.pdid; },
									Desc: 		new GNDescr({
										type: PT.Int, 
										description: 'The {{Service <<NAME>>}}', 
										required: true, 
										matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} (([0-9]+))' },
										to: 'param',
									})
								}),
					PDIDs: 		new GNParam({
									Name:	 	'Provider IDs',
									Default: 	 0,
									Format 		(cls) { return cls.pdids; },
									Desc: 		new GNDescr({
										type: PT.L.Int({ join: ',' }), 
										description: 'A semi-colon-separated list of valid {{Service <<NAME>>}}',
										required: null, 
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										to: 'param',
									})
								})
								.AddVersion('POST', { 
										Desc: { 
											required: false,
											hidden: true, 
											to: 'query', 
										}	
									}),
					SID: 		new GNParam({
									Name:	 	'Service ID',
									Default: 	 0,
									Format 		(cls) { return cls.pdid; },
									Desc: 		new GNDescr({
										type: PT.Int({ min: 1 }), 
										description: 'A valid {{<<NAME>>}}', 
										required: true, 
										matches: { '<<NAME>>': 'Matches the {{<<NAME>>}} (([0-9]+))' },
										to: 'param',
									})
								})
								.AddVersion('DOC', { Desc: { to: 'query' } }),
					SIDs: 		new GNParam({
									Name:	 	'Service IDs',
									Default: 	 0,
									Format 		(cls) { return cls.sids; },
									Desc: 		new GNDescr({
										type: PT.L.Int({ join: ',' }), 
										description: 'A semi-colon-separated list of valid Provider {{<<NAME>>}}',
										required: null, 
										matches: { '<<NAME>>': 'Matches ANY of the {{<<NAME>>}} Items (([0-9]+))' },
										to: 'param',
									})
								})
								.AddVersion('SVC_DOC', {
									Name:	 'Document Service ID',
									Default: '@SID',
									Format	 (cls) { return null; },
									Desc: 	 {
										type: PT.Text, 
										description: 'The {{<<NAME>>}}', 
										required: true, 
										hidden: true, 
										to: 'query',
									}
								}),
					VTIDs: 		new GNParam({
									Name:	 	'Service Type Code',
									Default: 	'',
									Format 		(cls) { return cls.vtids; },
									Desc: 		new GNDescr({
										type: PT.L.Text({ select: optns.SvcType, join: `','` }), 
										description: `A semi-colon-separated list of valid {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches a valid {{<<NAME>>}} (((?:0[0-9]{4};?)+))' },
										required: false, 
										to: 'param',
									})
								})
								.AddVersion('GET', { 
										Default: 'NULL',
										Desc: 	 { 
											type: PT.L.Text({ select: optns.SvcType, join: `,`, enclose: [`'[`,`]'`] }),
											required: true 
										} 
									}),
					CIDs: 		new GNParam({
									Name:	 	'Currency ID',
									Default: 	'NULL',
									Format 		(cls) { return cls.cids; },
									Desc: 		new GNDescr({
										type: PT.L.Text({ select: optns.SvcType, join: `,`, enclose: [`'[`,`]'`] }),
										description: `A semi-colon-separated list of valid {{<<NAME>>s}}`,
										matches: { '<<NAME>>': 'Matches a valid {{<<NAME>>}} (((?:[0-9]+;?)+))' },
										required: false, 
										to: 'param',
									})
								}),
					SvcName: 	new GNParam({
									Name: 	 'Service Name',
									Default: '',
									Format	 (cls) { return cls.svcname; },
									Desc: 	 new GNDescr({
										type: PT.NoWrap,
										description: "The {{<<NAME>>}}",
										required: true,
										to: "query", 
									})
								})
								.AddVersion('EDIT', {
									Desc:	{ required: false }
								}),
					SvcDescr:	new GNParam({
									Name:		'Service Description',
									Default: 	'',
									Format		(cls) { return cls.SvcDescr; },
									Desc: 		new GNDescr({
										type: 	PT.TextArea, 
										description: "The {{<<NAME>>}}", 
										required: false, 
										to: 'query', 
										// style: 'half', 
									})
								})
								.AddVersion('EDIT', { 
										Default: 	'',
										Desc: 		{ matches: {}, required: false },
									})
								.AddVersion('SEARCH', { 
										Default: 	'NULL',
										Desc: 		{ 
											matches: { '<<NAME>>': 'Matches the contents in a {{<<NAME>>}}' }
										},
									},	'EDIT')
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true },
									}, 	'SEARCH'),
					SvcType:	new GNParam({
									Name:		'Service Type Code',
									Default: 	'Free',
									Format		(cls) { return cls.svctype; },
									Desc: 		new GNDescr({
										type: 	PT.Text({ selects: optns.SvcType }), 
										description: "The Provider's {{<<NAME>>}}", 
										required: true, 
										matches: { '<<NAME>>': 'Matches a valid {{<<NAME>>}} ((0[0-9]{4}))' },
										to: 'query', 
										// style: 'half', 
									})
								})
								.AddVersion('EDIT', { 
										Default: 	'',
										Desc: 		{ required: false },
									})
								.AddVersion('SEARCH', { 
										Default: 	'NULL',
									},	'EDIT')
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true },
									}, 	'SEARCH'),
					SvcCharge:	new GNParam({
									Name: 		'SvcCharge',
									Default: 	 0.00,
									Format   	(cls) { return cls.svccharge; },
									Desc: 		{
										type: PT.Float({ min: 0.00, step: 0.10 }), 
										description: "The provider's {{Charge}}", 
										matches: { 'Charge': 'Matches the {{Charge}} of the {{Service}} (([0-9](?:[.][0-9]{1,2})))' },
										required: true, 
										to: 'query', 
										// style: 'half', 
									}
								})
								.AddVersion('EDIT', { 
										Default: 	'',
										Desc: 		{ required: false },
									})
								.AddVersion('SEARCH', { 
										Desc: { type: PT.CRange({ tags: ['VC-','VC+'], min: 0.00, step: 0.10 }) },
									},	'EDIT')
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true },
									},	'SEARCH'),
					SvcRate:	new GNParam({
									Name:		'Service Rate',
									Default: 	'Free',
									Format		(cls) { return `'${cls.svcrate}'`; },
									Desc: 		new GNDescr({
										type: 	PT.Text({ selects: optns.SvcRate }), 
										description: "The provider's {{Rate}}", 
										required: true, 
										matches: { 'Rate': 'Matches the {{Rate}} of the {{Service}} ((Free|Flat|Hourly|Daily|Monthly|Quote))' },
										to: 'query', 
										// style: 'half', 
									})
								})
								.AddVersion('EDIT', { 
										Default: 	'',
										Desc: 		{ required: false },
									})
								.AddVersion('SEARCH', { 
										Default: 	'NULL',
									},	'EDIT')
								.AddVersion('SEARCH_HID', { 
										Desc: { hidden: true },
									}, 	'SEARCH'),
					SCID:		new GNParam({
									Name:	 'Document ID',
									Default:  0,
									Format	 (cls) { return cls.scid; },
									Desc: 	 new GNDescr({
										type: PT.Int({ min: 1 }), 
										description: 'The Service credential {{<<NAME>>}}', 
										required: false, 
										hidden: true, 
										to: 'param',
									})
								}),
				// MISC =====================================================================
					Name:		new GNParam({
									Name: 	 'Page Name',
									Default: '',
									Format 	 (cls) { return cls.name; },
									Desc: 	 new GNDescr({
										type: PT.NoWrap, 
										description: "The content's {{<<NAME>>}}", 
										matches: { '<<NAME>>': 'Matches the name of the {{<<NAME>>}} ((\\b[\\w-]+\\b))' },
										required: true, 
										to: 'param', 
									})
								})
								.AddVersion('SVC_DOC', {
									Name: 	 'URL Name',
									Desc: 	 {
										description: "The service {{<<NAME>>}}",
										to: "query",
									}
								}),
					Location: 	new GNParam({
									Name: 	 'URL Location',
									Default: '',
									Format 	 (cls) { return cls.location; },
									Desc: 	 new GNDescr({
										type: PT.URL,
										description: 'A valid {{<<NAME>>}}', 
										required: true, 
										hidden: true, 
										to: 'query', 
									})
								}),
					TZone: 		new GNParam({
									Name: 	 'Timezone',
									Default: '',
									Format 	 (cls) { return cls.tzone; },
									Desc: 	 new GNDescr({
										type: PT.Text({ select: Object.keys(TZ.zones) }), 
										description: "The user's {{<<NAME>>}}",
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} (([\\w@/_-]+))' },
										required: false, 
										to: 'query', 
									})
								}),
					UserFlag:	new GNParam({
									Name:	 'User Flag',
									Aliases: ['Provider','Transact'],
									Default: -1,
									Format 	 (cls) { return cls.userflag; },
									Desc: 	 new GNDescr({
										type: PT.Int({ selects: [0,1,true,false] }), 
										description: "The user's {{<<NAME>>}}",
										matches: { '<<NAME>>': 'Updates the {{<<NAME>>}} of the {{User}} ((0|1|true|false))' },
										required: false, 
										to: 'query', 
									})
								})
								.AddVersion('Provider', {
									Name:	 'Provider Status',
									Format 	 (cls) { return cls.provider; },
								})
								.AddVersion('Transact', {
									Name:	 'Transactional Status',
									Format 	 (cls) { return cls.transact; },
								}),
					Bucket: 	new GNParam({
									Name:	 'Bucket',
									Default: 'profile',
									Format 	 (cls) { return (cls.bucket||this.Default).replace(/[+]/g,'/'); },
									Desc: 	 new GNDescr({
										type: PT.Text,
										description: 'A valid {{Bucket}} location for {{Uploads}}', 
										required: true, to: 'query', 
									})
								})
								.AddVersion('SVC_DOC', {
										Name:	 'Document Bucket',
										Default: 'documents',
										Format	 () { return null; },
										Desc: 	 {
											type: PT.Text, 
											description: 'The valid {{Bucket}} location for the {{Service Document}}', 
											required: false, 
											hidden: true, 
										}
									}),
					File: 		{
									Default: null,
									Format 	 (cls) { return cls.file||this.Default; },
									Desc: 	 {
										type: { File: { 
											accept: 'audio/*,video/*,image/*,application/pdf',
											'data-limit': 8388608,
										} 	}, 
										description: 'A valid {{File Stream}}', 
										matches: {}, required: true, to: 'query', 
									}
								},

			},
			// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			Search: 		{
				Actions: 	{
					// DISTINCTS ============================================================
						Misc: 			new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:male": "Displays the {{Misc}} with a {{Misc Name}} matching 'male'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Misc}} results per {{Page}}",
								},
							},
							Query:  	[
								`CALL prcSugTerms(1, '["SX","MS","VR"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Miscs'],	
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Genders: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:cisgender": "Displays the {{Genders}} with a {{Gender Name}} matching 'cisgender'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Genders}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["GD"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Genders'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Orientations: 	new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:cisgender": "Displays the {{Orientations}} with a {{Orientation Name}} matching 'cisgender'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Orientations}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["OR"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Orientations'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Religions: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:islam": "Displays the {{Religions}} with a {{Religion Name}} matching 'islam'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Religions}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["RL"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Religions'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Nationalities: 	new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:canadian": "Displays the {{Nationalities}} with a {{Nationality Name}} matching 'canadian'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Nationalities}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["NL"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Nationalities'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[]
						}),
						// ==================================================================
						Languages: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:basketball": "Displays the {{Languages}} with a {{Language Name}} matching 'basketball'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Languages}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["LG"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Languages'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Hobbies: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:basketball": "Displays the {{Hobbies}} with a {{Hobby Name}} matching 'basketball'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Hobbies}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["HB"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Hobbies'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
					// LOCALES   ============================================================
						Country: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d% ,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:camer": "Searches for any {{Countries}} matching 'camer' (like 'Cameroon')",
									"?page=3": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Locales}} per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["LC"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Countries'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Region: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d% ,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:misiss": "Searches for any {{Regions}} matching 'misiss' (like 'Mississippi')",
									"?page=10": "Displays the 10th {{Page}} at a {{Limit}} of 'ten' {{Locales}} per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["LC"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Regions'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						City: 			new RouteDB({
							Scheme: 	'/:term([\\w\\d% ,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:calgar": "Searches for any {{Cities}} matching 'calgar' (like 'Calgary')",
									"?page=7": "Displays the 7th {{Page}} at a {{Limit}} of 'ten' {{Locales}} per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["LC"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Cities'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Locale: 		new RouteDB({
							Scheme: 	'/(:term([\\w\\d% ,;.-]+)(?:/:in((?:(?:city|region|country)(?=;|$))*))?)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:account:ajohnson": "Displays the {{Users}} with a {{User Name}} of 'ajohnson'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["LC"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Locales'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
					// SERVICES  ============================================================
						Charge:   		new RouteDB({
							Scheme: 	'/:term([^\\s\\d]{,3}(\\d+(,\\d{2,3})*([.]\\d{2})?)( [A-Z]{1,3}|))?/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:¥10,000": "Displays the {{Currency}} infomation for Japanese Yen ({{¥}})",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Currencies}} results per {{Page}}",
								},
							},
							Query:  	[
								`CALL prcSugTerms(1, '["VC"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Charges'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Providers: 		new RouteDB({
							Scheme: 	'/:term([^\\s\\d]{0,3}(\\d+(,\\d{2,3})*([.]\\d{2})?)?)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:DJ Frico": "Searches for the {{Provider Service}} whose {{Service Name}} or {{Service Description}} matches, '{{DJ}}'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Provider Services}} results per {{Page}}",
								},
							},
							Query:  	scqry('VD',[
										"SELECT   p.provider_svc_id    AS value,",
										"         p.provider_svc_name  AS label,",
										"         p.provider_svc_descr AS description,",
										"         MATCH(p.provider_svc_name,p.provider_svc_descr) AGAINST",
										"         (':TERM:' IN BOOLEAN MODE) AS score,",
										"         LENGTH(p.provider_svc_name) AS len",
										"FROM     user_provider_services p",
										"WHERE    MATCH(p.provider_svc_name,p.provider_svc_descr) AGAINST",
										"         (':TERM:' IN BOOLEAN MODE)",
										"LIMIT    10",
									], 'Run the Service,'),
							Params: 	{
								Term: ['Providers'], Page: ['SQL'], Limit: ['SQL'], ID: true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Services: 		new RouteDB({
							Scheme: 	'/:term([\\w\\d,;.-]+)/',
							Limits: 	["Constant/Second"],
							Sub: 		['for'],
							Routes: 	['for'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:term:labour": "Displays the {{Service Type}} matching 'labour'",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services}} results per {{Page}}",
								},
							},
							Query: 		[
								`CALL prcSugTerms(1, '["VT"]', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);`
							],
							Params: 	{
								Context:  true,
								Term: 	 ['Services'],
								RawTerm:  true,
								Page: 	 ['SQL'], 
								Limit: 	 ['SQL'], 
								ID: 	  true
							},
							Links: 		[],
							Key: 	''
						}),
					// FOR       ============================================================
					For: RouteDB.Namespace(),
					// ======================================================================
					Suggest: 		new RouteDB({
						Scheme: 	`/:term([^\\n\\t]+)/`,
						Limits: 	["Constant/Second"],
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:term:calg": [
									"Suggests any  {{Service Type}}, {{Locale}}, {{Hobby}}, {{Language}}, {{Nationality}},",
									"{{Religion}}, {{Orientation}}, {{Gender}} that match the {{Serach Term}}, 'calg*'."
								].join(' '),
								"/:context:LG@124;HB@32;LG@142;VT@01120;SX@F/:term:New York": [
									"Suggests {{Search Terms}} matching, 'New York', omitting any",
									"that match the previously selected {{Search Terms}}",
									"within the {{Search Context}}",
								].join(', '),
							},
						},
						Query:		[
							"CALL prcSugTerms(1, '', ':TERM:', ':RAWTERM:', ':CONTEXT:', 10);",
						],
						Params: 	{ 
							Context: ['MULTI'],
							Term:  	 ['Suggestions'], 
							RawTerm:  true,
							ID: 	  true
						}
					}),
					// ======================================================================
					Advanced: 		new RouteDB({
						Scheme: 	'/',
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"?uid=14&lid=2717431&svctype=01120": [
									'Executes a {{Search}} for  the {{User}} at {{User ID}}: {{14}}, located in',
									'New York ({{LID}}: {{2717431}}) who provides a Translation {{Service}}.'
								].join(' ')
							},
						},
						Query: 		[ 
							"CALL prcSearch(",
							"    :UID:,",
							"    :LID:,",
							"    :RADIUS:,",
							"    :SVCTYPE:,",
							"    ':SVCCHARGE:',",
							"    ':AGE:',",
							"    :HIDS:,",
							"    :LGIDS:,",
							"    :NIDS:,",
							"    :RIDS:,",
							"    :GIDS:,",
							"    :OIDS:,",
							"    :SEX:,",
							"    :MARITAL:",
							");",
						],
						Params: 	{
							Terms: 		{
								Default: '',
								Format 	(cls) {
									return this.Default;
								},
								Desc: 	{
									description: '{{Search Terms}} for the {{Query}}',
									type: { List: "Text", Separator: ORS }, 
									hidden: true, to: 'query', required: true, matches: {
										'Locale': 				'Matches the {{Locale}}, unless omitted (([A-z0-9,/.-]+))',
										'Service Type': 		'Matches the {{Service Type}}, unless omitted (([A-z0-9,/.-]+))',
										'Service Description': 	'Matches the {{Service Description}}, unless omitted (([A-z0-9,/.-]+))',
										'Service Charge': 		'Matches the {{Service Charge}}, unless omitted ((\\w?\\d+(\\.\\d{2})?\\w?))',
										'Service Rate': 		'Matches the {{Service Rate}}, unless omitted (([A-z0-9,/.-]+))',
										'Hobby': 				'Matches the {{Hobby}}, unless omitted (([A-z0-9,/.-]+))',
										'Language': 			'Matches the {{Language}}, unless omitted (([A-z0-9,/.-]+))',
										'Nationality': 			'Matches the {{Nationality}}, unless omitted (([A-z0-9,/.-]+))',
										'Religion': 			'Matches the {{Religion}}, unless omitted (([A-z0-9,/.-]+))',
										'Sex': 					'Matches the {{Sex}}, unless omitted (([A-z0-9,/.-]+))',
										'Marital Status': 		'Matches the {{Marital Status}}, unless omitted (([A-z0-9,/.-]+))',
										'Orientation': 			'Matches the {{Orientation}}, unless omitted (([A-z0-9,/.-]+))',
										'Gender': 				'Matches the {{Gender}}, unless omitted (([A-z0-9,/.-]+))',
									}
								}
							},
							LID: 		['SEARCH'],
							SvcType:	['SEARCH'],
							SvcDescr:	['SEARCH'],
							SvcCharge:	['SEARCH'],
							SvcRate:	['SEARCH'],
							HIDs: 		['SEARCH'],
							LGIDs: 		['SEARCH'],
							NIDs: 		['SEARCH'],
							RIDs: 		['SEARCH'],
							GIDs: 		['SEARCH'],
							OIDs: 		['SEARCH'],
							Sex: 		['SEARCH'],
							Marital: 	['SEARCH'],
							Age: 		['SEARCH'],
							UID: 		true, 
							Units: 		true, 
							Radius: 	true, 
							Page:		['SQL'],
							Limit: 		['SQL'],
							ID: 		true,
						},
						Parse: 		spars(),
						Key: 		'user_id'
					}),
					// ======================================================================
					"/": 			new RouteDB({
						Scheme: 	'/', 
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:terms:LG@124;HB@32;LG@142;LC@2717431;VT@01120;SX@F?uid=14": [
									"Finds New York City ({{LC@2717431}}) Females ({{SX@F}})",
									"who provide Translation ({{VT@01120}}) service",
									"speaks French ({{LG@142}}) & English ({{LG@124}})",
									"and enjoy Reading ({{HB@32}})",
								].join(', '),
								"/:terms:LG@142?uid=14&page=3&limit=10": [
									"Displays the 3rd {{Page}} ––",
									"at a {{Limit}} of 'ten' {{Users}} results per {{Page}} ––",
									"who speak French ({{LG@142}}) in the {{User's}} own {{Location}}",
								].join(' '),
							},
						},
						Query: 		[":/Search/Advanced:"],
						Params: 	{
							Terms: 		 true,
							LID: 		['SEARCH_HID'],
							Units: 		['SEARCH_HID'],
							Radius: 	['SEARCH_HID'],
							SvcType:	['SEARCH_HID'],
							SvcDescr:	['SEARCH_HID'],
							SvcCharge:	['SEARCH_HID'],
							SvcRate:	['SEARCH_HID'],
							HIDs: 		['SEARCH_HID'],
							LGIDs: 		['SEARCH_HID'],
							NIDs: 		['SEARCH_HID'],
							RIDs: 		['SEARCH_HID'],
							GIDs: 		['SEARCH_HID'],
							OIDs: 		['SEARCH_HID'],
							Sex: 		['SEARCH_HID'],
							Marital: 	['SEARCH_HID'],
							Age: 		['SEARCH_HID'],
							UID: 		 true,  
							Page:		['SQL'],
							Limit: 		['SQL'],
							ID: 		 true,
						},
						Parse:	 	spars(),
						Key: 		'user_id'
					}),
				},
				Errors: 	{ /* BAD_REQ: ['/'] */ }
			},
			User: 			{
				Actions: 	{
					// SETTINGS =============================================================
						Visibility: 	new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['settings'],
							Routes: 	['settings'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Visibility}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{User}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT    v.user_fk as user_id, JSON_OBJECT(",
								"              'visibility', JSON_OBJECT(",
								"                  'items', JSON_COMPACT(CONCAT('[',",
								"                      GROUP_CONCAT(JSON_COMPACT(JSON_OBJECT(",
								"                          'id',      f.id,    'kind',  f.type,",
								"                          'field',   f.field, 'name',  f.name,",
								"                          'level',   f.level, 'value', f.value,",
								"                          'follows', COALESCE(f.follows, ''),",
								"                          'status',  IF(v.value & f.value, 'true', 'false')",
								"                      )   ) ORDER BY f.order SEPARATOR ','),",
								"                  ']')),",
								"                  'value', v.value",
								"          )) As settings",
								"FROM      user_visibilities   v",
								"LEFT JOIN visibility_fields   f ON f.level > 1",
								"WHERE     v.user_fk IN (:UIDS:)",
								"AND       f.order > -1",
								"GROUP BY  v.user_fk"
							],
							Params: 	{ UIDs: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Settings: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Settings}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id, JSON_COMPACT(",
								"               JSON_INSERT(JSON_OBJECT(",
								"                   'email',      u.email_address,",
								"                   'timezone',   s.timezone,",
								"                   'language',   JSON_OBJECT(",
								"                       'label', l.language_name,",
								"                       'value', l.language_id),",
								`                   'visibility', ${SQL.SOCKET({link:'/user/settings/visibility/:uids:%s',columns:['u.user_id']})}`,
								"               ),",
								"               '$.modes',               JSON_OBJECT(),",
								"               '$.modes.admin',         s.is_admin,",
								"               '$.modes.transactional', s.is_transactional,",
								"               '$.modes.provider',      s.is_provider,",
								"               '$.modes.scount',        COUNT(p.provider_svc_id)",
								"           )) AS settings",
								"FROM       users                  u",
								"INNER JOIN user_settings          s  ON u.user_id            = s.user_fk",
								"INNER JOIN languages              l  ON s.language_id        = l.language_id",
								"LEFT  JOIN user_provider_details  d  ON s.is_provider        = 1",
								"                                    AND u.user_id            = d.user_fk",
								"LEFT  JOIN user_provider_services p  ON d.provider_detail_id = p.user_provider_fk",
								"WHERE      u.user_id IN (:UIDS:)",
								"GROUP BY   u.user_id :LIMIT: :PAGE:"
							],
							Params: 	{ UIDs: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
					// DETAILS  =============================================================
						Misc: 			new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Returns the {{Misc}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_fk AS user_id, JSON_COMPACT(IF(v.value & 8192, ",
								"               JSON_OBJECT('misc', JSON_OBJECT(",
								"           		'description', u.profile_description",
								"           	)),",
								"               JSON_INSERT(",
								"                   JSON_OBJECT('misc', JSON_OBJECT(",
								"               		'description', u.profile_description",
								"               	)), '$.misc.education', JSON_OBJECT(),",
								"               	'$.misc.education.institutions', u.profile_education,",
								"               	'$.misc.education.description',  u.profile_edu_descr",
								"           ))) AS details",
								"FROM       user_profile_details  AS u",
								"LEFT  JOIN user_visibilities     AS v ON u.user_fk <> :UUID: AND u.user_fk = v.user_fk",
								"WHERE      u.user_fk IN (:UIDS:)",
								"GROUP BY   u.user_fk :LIMIT: :PAGE:",
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Identity: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Returns the {{Identity}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_fk AS user_id, JSON_SET(",
								"               JSON_OBJECT('identity', JSON_OBJECT(",
								"                   'sex','','marital','',",
								"                   'gender',JSON_OBJECT('value','','label',''),",
								"                   'orient',JSON_OBJECT('value','','label','')",
								"           	)   ),",
								"           	'$.identity.sex',    getVis(v.value, 2048, u.profile_sex),",
								"           	'$.identity.gender', JSON_COMPACT(getVis(",
								"                   v.value, 1024, JSON_OBJECT(",
								"                       'value', CAST(g.gender_id AS CHAR(20)),",
								"                       'label', g.gender_name)   )   ),",
								"           	'$.identity.orient', JSON_COMPACT(getVis(",
								"                   v.value, 1024, JSON_OBJECT(",
								"                       'value', CAST(o.orient_id AS CHAR(20)),",
								"                       'label', o.orient_name)   )   ),",
								"           	'$.identity.marital',getVis(v.value, 4096, u.profile_marital_status)",
								"           ) AS details",
								"FROM       user_profile_details  AS u",
								"LEFT  JOIN user_visibilities     AS v ON u.user_fk <> :UUID: AND u.user_fk = v.user_fk",
								"INNER JOIN genders               AS g ON u.profile_identity = g.gender_id",
								"INNER JOIN orients               AS o ON u.profile_orient   = o.orient_id",
								"WHERE      u.user_fk IN (:UIDS:) :LIMIT: :PAGE:",
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Religion: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Religion}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_fk AS user_id, JSON_SET(",
								"               JSON_OBJECT('religion', JSON_OBJECT('value',NULL,'label','')),",
								"           	'$.religion.value', CAST(r.religion_id AS CHAR(20)),",
								"           	'$.religion.label', r.religion_name",
								"           ) AS details",
								"FROM       user_profile_details  AS u",
								"LEFT  JOIN user_visibilities     AS v ON u.user_fk <> :UUID: AND u.user_fk = v.user_fk",
								"INNER JOIN religions             AS r ON u.profile_religion = r.religion_id",
								"                                     AND !(COALESCE(v.value,0) & 512)",
								"WHERE      u.user_fk IN (:UIDS:) :LIMIT: :PAGE:",
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),				
						// ==================================================================
						Nationalities: 	new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Nationalities}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_fk AS user_id, JSON_COMPACT(",
								"           CONCAT('{\"nationalities\":[',",
								"               IF(n.nationality_id, GROUP_CONCAT(JSON_OBJECT(",
								"                   'value', CAST(n.nationality_id AS INT),",
								"                   'label', n.nationality_name",
								"               ) SEPARATOR ','),''),",
								"           ']}')) as details",
								"FROM       user_profile_details AS u",
								"LEFT  JOIN user_visibilities    AS v ON u.user_fk <> :UUID: AND u.user_fk = v.user_fk AND true",
								"LEFT  JOIN nationalities        AS n ON !(COALESCE(v.value,0) & 256)",
								"                                    AND JSON_CONTAINS(",
								"                                         u.profile_nationalities,",
								"                                         n.nationality_id)",
								"WHERE      u.user_fk IN (:UIDS:)",
								"GROUP BY   u.user_fk :LIMIT: :PAGE:"
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Languages: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Languages}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								`SELECT     u.user_fk AS user_id, CONCAT('{"languages":[',`,
								"           IF(l.language_id, GROUP_CONCAT(JSON_MERGE(",
								"               JSON_OBJECT(",
								"                   'value', CAST(l.language_id AS INT),",
								"                   'label', l.language_name),",
								"               JSON_OBJECT(",
								"                   'level', JSON_OBJECT(",
								"                        'V', CAST(@KV:=chkJSINT(u.profile_languages,l.language_id) AS INT),",
								"                        'K', getLangLvl(@KV)))",
								"           ) SEPARATOR ','),''),']}') as details",
								"FROM       user_profile_details AS u",
								"LEFT  JOIN shw_visibility       AS v ON u.user_fk <> :UUID: AND u.user_fk = v.user_fk",
								"LEFT  JOIN languages            AS l ON chkJSVIS(v.obj,'LG')",
								"                                    AND chkJSOBJ(u.profile_languages,l.language_id)",
								"WHERE      u.user_fk IN (:UIDS:)",
								"GROUP BY   u.user_fk :LIMIT: :PAGE:",
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Hobbies: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Hobbies}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								`SELECT     u.user_fk AS user_id, CONCAT('{"hobbies":[',`,
								"           IF(h.hobby_id, GROUP_CONCAT(JSON_MERGE(",
								"               JSON_OBJECT(",
								"                   'value', CAST(h.hobby_id AS INT),",
								"                   'label', h.hobby_name,",
								"                   'adjct', h.hobby_type,",
								"                   'more', EXISTS( SELECT * FROM hobbies b",
								"                                   WHERE  b.hobby_name = h.hobby_name",
								"                                   AND    b.hobby_id  <> h.hobby_id)),",
								"               JSON_OBJECT(",
								"                   'level', JSON_OBJECT(",
								"                        'K', CAST(@KV:=chkJSINT(u.profile_hobbies,h.hobby_id) AS INT),",
								"                        'V', @KV))",
								"           ) SEPARATOR ','),''),']}') as details",
								"FROM       user_profile_details AS u",
								"LEFT  JOIN shw_visibility       AS v ON u.user_fk <> :UUID: AND u.user_fk  = v.user_fk",
								"LEFT  JOIN hobbies              AS h ON chkJSVIS(v.obj,'HB')",
								"                                    AND chkJSOBJ(u.profile_hobbies,h.hobby_id)",
								"WHERE      u.user_fk IN (:UIDS:)",
								"GROUP BY   u.user_fk :LIMIT: :PAGE:",
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Details: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Details}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id, JSON_OBJECT(",
								`               'hobbies',       ${SQL.SOCKET({link:'/user/details/hobbies/:uids:%s',      columns:['u.user_id']})},`,
								`               'languages',     ${SQL.SOCKET({link:'/user/details/languages/:uids:%s',    columns:['u.user_id']})},`,
								`               'nationalities', ${SQL.SOCKET({link:'/user/details/nationalities/:uids:%s',columns:['u.user_id']})},`,
								`               'religion',      ${SQL.SOCKET({link:'/user/details/religion/:uids:%s',     columns:['u.user_id']})},`,
								`               'identity',      ${SQL.SOCKET({link:'/user/details/identity/:uids:%s',     columns:['u.user_id']})},`,
								`               'misc',          ${SQL.SOCKET({link:'/user/details/misc/:uids:%s',         columns:['u.user_id']})}`,
								"           ) AS details",
								"FROM       users     AS u",
								"WHERE      u.user_id IN (:UIDS:)",
								":LIMIT: :PAGE:"
							],
							Params: 	{ UIDs: true, UUID: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
					// PHOTOS   =============================================================
						Photos: 		new RouteDB({
							Scheme: 	'/:uids([\\d;]+\\b)/',
							Sub: 		null,
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Returns the {{Images}} of the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_fk AS user_id, JSON_OBJECT(",
								"               'profile', u.profile_picture,",
								"               'cover',   u.profile_cover",
								"           ) AS photos",
								"FROM       user_profile_details  AS u",
								"WHERE      u.user_fk IN (:UIDS:)",
								":LIMIT: :PAGE:",
							],
							Params: 	{ UIDs: true, ID: true, Page: ['SQL'], Limit: ['SQL'] },
							Links: 		[],
							Key: 		'user_id',
						}),
					// USER     =============================================================
					"/": 			new RouteDB({
						Scheme: 	'/:uids([\\d;]+\\b)|:account([A-z0-9;._-]+\\b)/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:account:leshaunj": "Displays the {{Users}} with a {{User Name}} of 'LeShaunJ'",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT     u.user_id, u.display_name,",
							"           getVis(v.value, 1, u.email_address) AS email_address,",
							"           JSON_OBJECT(",
							"               'first', getVis(v.value, 2, u.first_name),",
							"               'last',  getVis(v.value, 4, u.last_name)",
							"           ) AS name,",
							`           ${SQL.SOCKET({link:'/user/photos/:uids:%s',		columns:['u.user_id']})} AS photos,`,
							"           IF(v.value & 32, JSON_OBJECT(), JSON_OBJECT(",
							"               'id',    u.location,",
							"               'label', getLocale(l.city, l.region, l.country),",
							"               'codes', JSON_OBJECT(",
							"                   'region',  UPPER(r.iso),",
							"                   'country', UPPER(f.iso)",
							"           ))) AS location,",
							"           JSON_OBJECT(",
							`               'hobbies',       ${SQL.SOCKET({link:'/user/details/hobbies/:uids:%s',      columns:['u.user_id']})},`,
							`               'languages',     ${SQL.SOCKET({link:'/user/details/languages/:uids:%s',    columns:['u.user_id']})},`,
							`               'nationalities', ${SQL.SOCKET({link:'/user/details/nationalities/:uids:%s',columns:['u.user_id']})},`,
							`               'religion',      ${SQL.SOCKET({link:'/user/details/religion/:uids:%s',     columns:['u.user_id']})},`,
							`               'identity',      ${SQL.SOCKET({link:'/user/details/identity/:uids:%s',     columns:['u.user_id']})},`,
							`               'misc',          ${SQL.SOCKET({link:'/user/details/misc/:uids:%s',         columns:['u.user_id']})}`,
							"           ) AS details,",
							`           ${SQL.SOCKET({link:'/provider/service/:uids:%s',columns:['u.user_id']})} AS services,`,
							`           ${SQL.SOCKET({link:'/user/settings/:uids:%s',   columns:['u.user_id']})} AS settings,`,
							"           JSON_OBJECT(",
							"               'verified',  u.verified, ",
							"               'status',    u.status, ",
							"               'tour_done', u.tour_done",
							"           ) AS checks,",
							"           getVis(v.value, 16, u.birth_date) AS birth_date,",
							"           u.inserted_at    AS member_since",
							"FROM       users            AS u",
							"LEFT  JOIN user_visibilities   v ON u.user_id    = v.user_fk",
							"LEFT  JOIN locale_search    AS l ON u.location   = l.city_id",
							"LEFT  JOIN locale_regions   AS r ON l.region_id  = r.id",
							"LEFT  JOIN locale_countries AS f ON l.country_id = f.id",
							"WHERE      u.user_id       IN (:UIDS:)",
							"OR         u.display_name  IN :ACCOUNT:",
							":LIMIT: :PAGE: # :UUID:"
						],
						Params: 	{
							UIDs:   	true, 
							Account: 	true, 
							UUID: 		true, 
							Single: 	true, 
							ID:    		true, 
							Page:   	['SQL'], 
							Limit: 		['SQL']
						},
						Links: 		[],
						Parse  		(res) {
							var RQ  = this.RQ, QY = this.QY, IDs = [], 
								rgx = {'user_id': '\\\\d+'}, cat = Imm.Map({
									photos: 		'user/photos',
									identity: 		'user/details/identity',
									misc: 			'user/details/misc',
									services: 		'provider/service',
									hobbies: 		'user/details/hobbies',
									languages: 		'user/details/languages',
									nationalities: 	'user/details/nationalities',
									religion: 		'user/details/religion',
									settings: 		'user/details/settings',
									visibility: 	'user/details/settings/visibility',
								}), sgl = !!eval(QY.single);
							if (IDs = res.map((v,i)=>v.user_id), IDs) { 
								var qry = `?${[ `uuid=${QY.uuid}`,
												'to=["payload","result"]',
												`single=${sgl}`,
												'links=true',
												'as=item',
											].join('&')}`,
									prm = `:uids:${IDs.join(';')}`;
								cat.map((l,c)=>{
									var toE = (sgl?'':'","'+rgx.user_id),
										lnk = `/${l}/${prm}${qry}`;
									RQ.links[c]=SQL.SOCKET({ link: lnk });
								});
							};
							return (sgl ? res[0] : JSN.Objectify(
								res, RQ.Key, RQ.Columns, QY
							)	);
						},
						Key: 		'user_id',
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Provider: 		{
				Actions: 	{
					// ======================================================================
					Documents: 		new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:sids:1;3": "Returns the {{Service Documents}} for {{Services}} at the {{SIDs}}, 1 and 3",
								"/:sids:1;3?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services Documents}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT   d.user_fk AS user_id, getProviderFiles(",
							"             'documents', GROUP_CONCAT(JSON_OBJECT(",
							"                 'id', c.id, 'name', c.file,",
							"                 'description', c.description,",
							"                 'location', c.location ",
							"         ) SEPARATOR ',')) services",
							"FROM     user_provider_details d",
							"JOIN     service_documents c ON d.provider_detail_id = c.provider_detail_id",
							"WHERE    c.provider_svc_id IN (:SIDS:)",
							"GROUP BY c.provider_svc_id",
							":LIMIT: :PAGE:",
						],
						Params: 	{
							SIDs: true, Page: ['SQL'], Limit: ['SQL'], ID: true
						},
						Links: 		[]
					}),
					// ======================================================================
					Credentials: 	new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:sids:1;3": "Returns the {{Service Credentials}} for {{Services}} at the {{SIDs}}, 1 and 3",
								"/:sids:1;3?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services Credentials}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT   d.user_fk AS user_id, getProviderFiles(",
							"             'credentials', GROUP_CONCAT(JSON_OBJECT(",
							"                 'id', c.id, 'name', c.file,",
							"                 'description', c.description,",
							"                 'location', c.location ",
							"         ) SEPARATOR ',')) services",
							"FROM     user_provider_details d",
							"JOIN     service_credentials c ON d.provider_detail_id = c.provider_detail_id",
							"WHERE    c.provider_svc_id IN (:SIDS:)",
							"GROUP BY c.provider_svc_id",
							":LIMIT: :PAGE:",
						],
						Params: 	{
							SIDs: true, Page: ['SQL'], Limit: ['SQL'], ID: true
						},
						Links: 		[]
					}),
					// ======================================================================
					Images: 		new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:sids:1;3": "Returns the {{Service Images}} for {{Services}} at the {{SIDs}}, 1 and 3",
								"/:sids:1;3?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services Images}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT   d.user_fk AS user_id, getProviderFiles(",
							"             'images', GROUP_CONCAT(JSON_OBJECT(",
							"                 'id', c.id, 'name', c.file,",
							"                 'description', c.description,",
							"                 'location', c.location ",
							"         ) SEPARATOR ',')) services",
							"FROM     user_provider_details d",
							"JOIN     service_images c ON d.provider_detail_id = c.provider_detail_id",
							"WHERE    c.provider_svc_id IN (:SIDS:)",
							"GROUP BY c.provider_svc_id",
							":LIMIT: :PAGE:",
						],
						Params: 	{
							SIDs: true, Page: ['SQL'], Limit: ['SQL'], ID: true
						},
						Links: 		[]
					}),
					// ======================================================================
					URLs: 			new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:sids:1;3": "Returns the {{Service URLs}} for {{Services}} at the {{SIDs}}, 1 and 3",
								"/:sids:1;3?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services URLs}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT   d.user_fk AS user_id, getProviderFiles(",
							"             'urls', GROUP_CONCAT(JSON_OBJECT(",
							"                 'id', c.id, 'name', c.name,",
							"                 'description', c.description,",
							"                 'location', c.location ",
							"         ) SEPARATOR ',')) services",
							"FROM     user_provider_details d",
							"JOIN     service_urls c ON d.provider_detail_id = c.provider_detail_id",
							"WHERE    c.provider_svc_id IN (:SIDS:)",
							"GROUP BY c.provider_svc_id",
							":LIMIT: :PAGE:",
						],
						Params: 	{
							SIDs: true, Page: ['SQL'], Limit: ['SQL'], ID: true
						},
						Links: 		[]
					}),
					// ======================================================================
					Files: 			new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:sids:1;3": "Returns the {{Service Files}} for {{Services}} at the {{SIDs}}, 1 and 3",
								"/:sids:1;3?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services Files}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT   F.user_id, F.services",
							"FROM     ((",
							"    :/Provider/Documents:",
							") UNION (",
							"    :/Provider/Credentials:",
							") UNION (",
							"    :/Provider/Images:",
							") UNION (",
							"    :/Provider/URLs:",
							")) F",
						],
						Params: 	{
							SIDs: true, Page: ['SQL'], Limit: ['SQL'], ID: true
						},
						Links: 		[],
						Parse	(res) {
							let ret = Imm.fromJS(res), key = 'services';
							return 	ret	.groupBy(u=>u.get('user_id'))
										.map(u=>u.reduce((a,c)=>a.mergeIn(
											[key],c.get(key)),Imm.Map()
										)).toList().toJS();
						},
					}),
					// ======================================================================
					Service: 		new RouteDB({
						Scheme: 	'/(:pdids((?:\\d+)(?=;|$))?|:uids((?:\\d+)(?=;|$))?)/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:pdid:3;4": "Returns the {{Services}} for {{Providers}} at the {{PDIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Services}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT     pd.user_fk AS user_id, ",
							"           pd.provider_detail_id AS provider_id,",
							"           JSON_COMPACT(CONCAT('[',",
							"               GROUP_CONCAT(JSON_OBJECT(",
							"                   'id',          ps.provider_svc_id,",
							"                   'kind',        s.service_description,",
							"                   'name',        ps.provider_svc_name,",
							"                   'description', ps.provider_svc_descr,",
							"                   'charge',      ps.provider_svc_charge,",
							"                   'rate',        ps.provider_svc_rate",
							"           )  SEPARATOR ','), ']')) AS services",
							"FROM       user_provider_services AS ps",
							"INNER JOIN user_provider_details  AS pd ON pd.provider_detail_id = ps.user_provider_fk",
							"INNER JOIN services               AS  s ON s.service_cpc_code    = ps.provider_svc_type",
							"WHERE      pd.provider_detail_id  IN (:PDIDS:)",
							"OR         pd.user_fk             IN (:UIDS:)",
							"GROUP BY   pd.provider_detail_id",
							":LIMIT: :PAGE:",
						],
						Params: 	{
							PDIDs: true, UIDs:  true,
							Page:  ['SQL'], Limit: ['SQL'], ID: true
						},
						Key: 		'user_id',
						Links: 		[]
					}),
					// ======================================================================
					"/": 			new RouteDB({
						Scheme: 	'/(:pdids((?:\\d+)(?=;|$))?|:uids((?:\\d+)(?=;|$))?)/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:pdid:1;2": "Returns the {{Providers}} at the {{PDIDs}}, 1 and 2",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Providers}} results per {{Page}}",
							},
						},
						Query: 		[
							"SELECT     pd.user_fk            AS user_id,",
							"           pd.provider_detail_id AS provider_id,",
							"           pd.provider_name      AS name,",
							"           JSON_OBJECT(",
							"               'id',    pd.provider_location,",
							"               'label', getLocale(l.city, l.region, l.country),",
							"               'codes', JSON_OBJECT(",
							"                   'region',  UPPER(r.iso),",
							"                   'country', UPPER(f.iso)",
							"           )   )                 AS location,",
							`           ${SQL.SOCKET({
											link:'/provider/service/:pdids:%s',
											columns:['pd.provider_detail_id']
										})}                   AS services`,
							"FROM       user_provider_details AS pd",
							"INNER JOIN users                 AS u  ON pd.user_fk   = u.user_id",
							"LEFT  JOIN locale_search         AS l  ON pd.provider_location = l.city_id",
							"LEFT  JOIN locale_regions        AS r  ON l.region_id  = r.id",
							"LEFT  JOIN locale_countries      AS f  ON l.country_id = f.id",
							"WHERE      pd.provider_detail_id IN (:PDIDS:)",
							"OR         u.user_id             IN (:UIDS:)",
							":LIMIT: :PAGE:",
						],
						Params: 	{
							PDIDs: true, UIDs:  true,
							Page:  ['SQL'], Limit: ['SQL'], ID: true
						},
						Key: 		'user_id',
						Links: 		[]
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Locale: 		{
				Actions: 	{
					// MISC    ==============================================================
						Radius: 		new RouteDB({
							Scheme: 	'/:lid(\\d+)/',
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:lid:312844": "Returns the {{Locales}} within a 25km {{Radius}} of 'Calgary, Canada' ({{LID:312844}})",
									"/:lid:312844?radius=50": "Returns the {{Locales}} within a 50km {{Radius}} of 'Calgary, Canada' ({{LID:312844}})",
									"?page=3": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Locales}} per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     R.*, ROUND(ACOS(",
								"               (SIN(@radLAT) * SIN(RADIANS(R.latitude))) + (",
								"                   COS(@radLAT) * COS(RADIANS(R.latitude)) * ",
								"                   COS(RADIANS(R.longitude) - @radLON)",
								"           )   ) * @RE, 1) AS distance",
								"FROM       (",
								"    SELECT   M.* FROM locale_places M, (",
								"        SELECT getRadians(:UID:,':LID:',:RADIUS:) region_id",
								"    )   X",
								"    WHERE    M.latitude  BETWEEN @minLAT AND @maxLAT",
								"    AND      M.longitude BETWEEN @minLON AND @maxLON",
								"    AND      M.region_id = X.region_id",
								")   R",
								"WHERE      (ACOS(",
								"               (SIN(@radLAT) * SIN(RADIANS(R.latitude))) + (",
								"                   COS(@radLAT) * COS(RADIANS(R.latitude)) * ",
								"                   COS(RADIANS(R.longitude) - @radLON)",
								"           )   ) * @RE) < @RAD",
								"ORDER BY   distance",
								":LIMIT: :PAGE:",
							],
							Params: 	{
								LID:  true, Units: true, Radius: true, UID: ['HIDDEN'],
								Page: ['SQL'], Limit: ['SQL'], ID: true
							},
							Links: 		[],
							Key: 	''
						}),
						// ==================================================================
						Timezone: 		new RouteDB({
							Scheme: 	'/:term(.+)?/',
							Limits: 	["Constant/Second"],
							Sub: 		null,
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query (cls) {
								var TZone = Object.keys(TZ.zones), 
									pgx   = /[^\d]/g, tgx = /(\[|[.({/})?+]|\])/g,
									term  = new RegExp(`^(.*)(${cls.Term.replace(tgx,'\\$1')})(.*)$`),
									page  = Number(cls.Page .replace(pgx,'')),
									limit = Number(cls.Limit.replace(pgx,'')),
									res   = [ null,
										TZone	.filter(v=>!!v.match(term))
												.map(v=>({ m: v.match(term), k: v }))
												.map(v=>({ m: v.m[1]+v.m[3], k: v.k }))
												.sort((a,b)=>{ 
													switch (true) {
														case a.m < b.m: return -1;
														case a.m > b.m: return  1;
														default:		return  0;
													};	
												})
												.map(v=>v.k)
												.slice(page,limit)
												.map(v=>({label:v,value:v}))
									]; 	return res;
							},
							Params: 	{
								Term: {
									Default: '',
									Format 	(cls) { return cls.term||''; },
									Desc: 	{
										description: "A {{Search Term}} for the {{Timezone}}",
										type: "Text", to: 'param', required: true, matches: {
											'Timezone': 'Matches the {{Timezone}}, unless omitted ((\\b[A-z0-9/+-]+\\b))',
										},
									}
								},
								Page: ['SQL'], Limit: ['SQL'], ID: true
							},
							Links: 		[],
							Key: 	''
						}),
					// WITH    ==============================================================
						// ==================================================================
						Genders: 		new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:gids(\\d(?:[\\d;]+))|/:gids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:gids:1?uid=14": "Returns the {{Users}} whose {{Genders}} match the {{GID}}, 1, in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN user_profile_details AS d ON x.user_id   = d.user_fk",
								"INNER JOIN users                AS u ON u.user_id  <> :UID:",
								"                                    AND chkRadDist(u.location,:UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_profile_details AS p ON u.user_id   = p.user_fk",
								"LEFT  JOIN user_visibilities    AS v ON u.user_id   = v.user_fk AND true",
								"INNER JOIN genders              AS g ON !(COALESCE(v.value,0) & 1024)",
								"                                    :GIDS:",
								"                                    AND g.gender_id = p.profile_identity",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:",
							],
							Params: 	{ 
								GIDs: ['LOCALE'],	LID: true, UID: true, Units: true, Radius: true, 
								Page: ['SQL'], Limit: ['SQL'], ID: true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================
						Orientations: 	new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:oids(\\d(?:[\\d;]+))|/:oids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:oids:1?uid=14": "Returns the {{Users}} whose {{Orientation}} match the {{OID}}, 1, in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN user_profile_details AS d ON x.user_id   = d.user_fk",
								"INNER JOIN users                AS u ON u.user_id  <> :UID:",
								"                                    AND chkRadDist(u.location,:UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_profile_details AS p ON u.user_id   = p.user_fk",
								"LEFT  JOIN user_visibilities    AS v ON u.user_id   = v.user_fk AND true",
								"INNER JOIN orients              AS o ON !(COALESCE(v.value,0) & 1024)",
								"                                    :OIDS:",
								"                                    AND o.orient_id = p.profile_orient",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:",
							],
							Params: 	{ 
								OIDs: ['LOCALE'], LID: true, UID: true, Units: true, Radius: true, 
								Page: ['SQL'], Limit: ['SQL'], ID: true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================
						Religions: 		new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:rids(\\d(?:[\\d;]+))|/:rids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:rids:1?uid=14": "Returns the {{Users}} whose {{Religions}} match the {{RID}}, 1, in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN user_profile_details AS d ON x.user_id   = d.user_fk",
								"INNER JOIN users                AS u ON u.user_id  <> :UID:",
								"                                    AND chkRadDist(u.location,:UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_profile_details AS p ON u.user_id   = p.user_fk",
								"LEFT  JOIN user_visibilities    AS v ON u.user_id   = v.user_fk AND true",
								"INNER JOIN religions            AS r ON !(COALESCE(v.value,0) & 512)",
								"                                    :RIDS:",
								"                                    AND r.religion_id = p.profile_religion",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:",
							],
							Params: 	{ 
								RIDs: ['LOCALE'], LID: true, UID: true, Units: true, Radius: true, 
								Page: ['SQL'], Limit: ['SQL'], ID: true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================
						Nationalities: 	new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:nids(\\d(?:[\\d;]+))|/:nids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:nids:1?uid=14": "Returns the {{Users}} whose {{Nationalities}} match the {{NID}}, 1, in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN user_profile_details AS d ON x.user_id   = d.user_fk",
								"INNER JOIN users                AS u ON u.user_id  <> :UID:",
								"                                    AND chkRadDist(u.location,:UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_profile_details AS p ON u.user_id   = p.user_fk",
								"LEFT  JOIN user_visibilities    AS v ON u.user_id   = v.user_fk AND true",
								"INNER JOIN nationalities        AS n ON !(COALESCE(v.value,0) & 256)",
								"                                    :NIDS:",
								"                                    AND JSON_CONTAINS(",
								"                                         p.profile_nationalities,",
								"                                         n.nationality_id)",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:",
							],
							Params: 	{ 
								NIDs: ['LOCALE'], LID: true, UID: true, Units: true, Radius: true, 
								Page: ['SQL'], Limit: ['SQL'], ID: true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================
						Languages: 		new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:lgids(\\d(?:[\\d;]+))|/:lgids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									":lgids:1?uid=14": "Returns the {{Users}} whose {{Languages}} match the {{LGID}}, 1, in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN user_profile_details AS d ON x.user_id  = d.user_fk",
								"INNER JOIN users                AS u ON u.user_id  <> :UID:",
								"                                    AND chkRadDist(u.location,:UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_profile_details AS p ON u.user_id  = p.user_fk",
								"LEFT  JOIN user_visibilities    AS v ON u.user_id  = v.user_fk AND true",
								"INNER JOIN languages            AS l ON !(COALESCE(v.value,0) & 128)",
								"                                    :LGIDS:",
								"                                    AND JSON_CONTAINS(",
								"                                            JSON_KEYS(p.profile_languages),",
								"                                            JSON_QUOTE(CONVERT(l.language_id,CHAR(5)",
								"                                        )))",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:"
							],
							Params: 	{ 
								LGIDs: ['LOCALE'], LID: true, UID: true, Units: true, Radius: true, 
								Page:  ['SQL'], Limit: ['SQL'], ID: true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================
						Hobbies: 		new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:hids(\\d(?:[\\d;]+))|/:hids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:hids:1?uid=14": "Returns the {{Users}} whose {{Hobbies}} match the {{HID}}, 1 in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN user_profile_details AS d ON x.user_id   = d.user_fk",
								"INNER JOIN users                AS u ON u.user_id  <> :UID:",
								"                                    AND chkRadDist(u.location,:UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_profile_details AS p ON u.user_id   = p.user_fk",
								"LEFT  JOIN user_visibilities    AS v ON u.user_id   = v.user_fk AND true",
								"INNER JOIN hobbies              AS h ON !(COALESCE(v.value,0) & 64)",
								"                                    :HIDS:",
								"                                    AND JSON_CONTAINS(",
								"                                            JSON_KEYS(p.profile_hobbies),",
								"                                            JSON_QUOTE(CONVERT(h.hobby_id,CHAR(5)",
								"                                        )))",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:",
							],
							Params: 	{ 
								HIDs: ['LOCALE'], LID: true, UID: true, Units: true, Radius: true, 
								Page: ['SQL'], Limit: ['SQL'], ID: true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================	
						Services: 		new RouteDB({
							Scheme: 	'/((?:/:lid(\\d(?:[\\d;]+))/:vtids(\\d(?:[\\d;]+))|/:vtids(\\d(?:[\\d;]+)))?)/',
							Sub: 		['with'],
							Routes: 	['with'],
							Methods: 	Docs.Kinds.GET,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:vtids:1?uid=14": "Returns the {{Providers}} whose {{Service Type}} match the {{VTIDs}}, 1, in the same {{Locale}} as the {{User}} at the {{User ID}}, 14",
									"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Users}} results per {{Page}}",
								},
							},
							Query: 		[
								"SELECT     u.user_id,",
								`           ${SQL.SOCKET({link:'/user/:uids:%s', columns:['u.user_id']})} AS user`,
								"FROM      (SELECT * FROM users WHERE user_id = :UID:) AS x",
								"INNER JOIN users                  AS u ON u.user_id           <> :UID:",
								"                                      AND chkRadDist(u.location, :UID:,:LID:,:RADIUS:)",
								"INNER JOIN user_provider_details  AS d ON u.user_id            = d.user_fk",
								"INNER JOIN user_provider_services AS s ON s.user_provider_fk   = d.provider_detail_id",
								"                                      AND s.provider_svc_type IN (':VTIDS:')",
								"GROUP BY   u.user_id",
								":LIMIT: :PAGE:",
							],
							Params: 	{ 
								VTIDs:   true, LID:  true, UID:   true, Units: true, 
								Radius: true, Page: ['SQL'], Limit: ['SQL'],    ID:    true 
							},
							Links: 		[],
							Parse:  	lcale(),
							Key: 		'user_id'
						}),
						// ==================================================================
						With: RouteDB.Namespace(),
					// LOCALES ==============================================================
					"/": 			new RouteDB({
						Scheme: 	'/:lids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:lid:312844": "Displays the {{Locale}} at the {{LID}}, 312844 (Calgary, Alberta, Canada)",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Locales}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "LC", :LIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, LIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					})
				},
				Errors: 	{ BAD_REQ: [
					'/with/',
				] }
			},
			Get: 			{
				Actions: 	{
					// ======================================================================
					Rate: 			new RouteDB({
						Scheme: 	'/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{},
						},
						Query: 		[
							`CALL prcGetMulti(1, "VR", NULL, ':CONTEXT:', 10, 0);`,
						],
						Params: 	{ Context: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Currencies: 	new RouteDB({
						Scheme: 	'/:cids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:cids:3;4": "Returns the {{Currency}} at the {{CIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Currencies}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "VC", :CIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, CIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Genders: 		new RouteDB({
						Scheme: 	'/:gids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:gids:3;4": "Returns the {{Gender}} at the {{GIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Genders}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "GD", :GIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, GIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Orientations: 	new RouteDB({
						Scheme: 	'/:oids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:oids:3;4": "Returns the {{Orientation}} at the {{OIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Orientations}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "OR", :OIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, OIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Religions: 		new RouteDB({
						Scheme: 	'/:rids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:rids:3;4": "Returns the {{Religion}} at the {{RIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Religions}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "RL", :RIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, RIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Nationalities: 	new RouteDB({
						Scheme: 	'/:nids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:nids:3;4": "Returns the {{Nationality}} at the {{NIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Nationalities}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "NL", :NIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, NIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Languages: 		new RouteDB({
						Scheme: 	'/:lgids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:lgids:3;4": "Returns the {{Language}} at the {{LGIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Languages}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "LG", :LGIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, LGIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Hobbies: 		new RouteDB({
						Scheme: 	'/:hids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:hids:3;4": "Returns the {{Hobby}} at the {{HIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Hobbies}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "HB", :HIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, HIDs: true, Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					Services: 		new RouteDB({
						Scheme: 	'/:vtids((?:\\d+)(?=;|$))?/',
						Sub: 		null,
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:vtids:3;4": "Returns the {{Service Type}} at the {{VTIDs}}, 3 and 4",
								"?page=3&limit=10": "Displays the 3rd {{Page}} at a {{Limit}} of 'ten' {{Service Types}} results per {{Page}}",
							},
						},
						Query: 		[
							`CALL prcGetMulti(1, "VT", :VTIDS:, ':CONTEXT:', :LIMIT:, :PAGE:);`,
						],
						Params: 	{ Context: true, VTIDs: ['GET'], Limit: true, Page: true, ID: true },
						Links: 		[]
					}),
					// ======================================================================
					"/": RouteDB.Namespace()
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Add: 			{
				Actions: {
					// ======================================================================
					Document: 		new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Files: 		{
								field:	'file',
								max:	1,
								dest 	(prm, bdy, file) { return `${bdy.bucket}/${prm.uid}`; 	},
								name	(prm, bdy, file) { return `${file.originalname}`; 		}
							},
							Examples: 	{
								"/:sid:3": [
									"Uploads an {{Service Document}} for the {{Service ID}}, 3.",
								].join(' '),
							},
						},
						Query: 		[
							"INSERT INTO service_documents (",
							"    provider_detail_id, provider_svc_id, file, description, location, date_created",
							") SELECT s.user_provider_fk, s.provider_svc_id, ':FILE:', ':DESCR:', ':LOCATION:', NOW()",
							"  FROM   user_provider_services s",
							"  JOIN   user_provider_details  p ON s.user_provider_fk = p.provider_detail_id",
							"  WHERE  p.user_fk          =  :UID:",
							"  AND    s.provider_svc_id IN (:SIDS:);",
							":/Provider/Documents:",
						],
						Params: 	{
							UID: 	true,
							SIDs:	true,
							File:	true,
							Descr:	['SVC_DOC'],
							Bucket: ['SVC_DOC'],
						},
						Links: 		[],
						Key: 		'',
					}),
					// ======================================================================
					Credential: 	new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Files: 		{
								field:	'file',
								max:	1,
								dest 	(prm, bdy, file) { return `${bdy.bucket}/${prm.uid}`; 	},
								name	(prm, bdy, file) { return `${file.originalname}`; 		}
							},
							Examples: 	{
								"/:sid:3": [
									"Uploads an {{Service Document}} for the {{Service ID}}, 3.",
								].join(' '),
							},
						},
						Query: 		[
							"INSERT INTO service_credentials (",
							"    provider_detail_id, provider_svc_id, file, description, location, date_created",
							") SELECT s.user_provider_fk, s.provider_svc_id, ':FILE:', ':DESCR:', ':LOCATION:', NOW()",
							"  FROM   user_provider_services s",
							"  JOIN   user_provider_details  p ON s.user_provider_fk = p.provider_detail_id",
							"  WHERE  p.user_fk          =  :UID:",
							"  AND    s.provider_svc_id IN (:SIDS:);",
							":/Provider/Credentials:",
						],
						Params: 	{
							UID: 	true,
							SIDs:	true,
							File:	true,
							Descr:	['SVC_DOC'],
							Bucket: ['SVC_DOC'],
						},
						Links: 		[],
						Key: 		'',
					}),
					// ======================================================================
					Image: 			new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Files: 		{
								field:	'file',
								max:	1,
								dest 	(prm, bdy, file) { return `${bdy.bucket}/${prm.uid}`; 	},
								name	(prm, bdy, file) { return `${file.originalname}`; 		}
							},
							Examples: 	{
								"/:sid:3": [
									"Uploads an {{Service Document}} for the {{Service ID}}, 3.",
								].join(' '),
							},
						},
						Query: 		[
							"INSERT INTO service_images (",
							"    provider_detail_id, provider_svc_id, file, description, location, date_created",
							") SELECT s.user_provider_fk, s.provider_svc_id, ':FILE:', ':DESCR:', ':LOCATION:', NOW()",
							"  FROM   user_provider_services s",
							"  JOIN   user_provider_details  p ON s.user_provider_fk = p.provider_detail_id",
							"  WHERE  p.user_fk          =  :UID:",
							"  AND    s.provider_svc_id IN (:SIDS:);",
							":/Provider/Images:",
						],
						Params: 	{
							UID: 	true,
							SIDs:	true,
							File:	true,
							Descr:	['SVC_DOC'],
							Bucket: ['SVC_DOC'],
						},
						Links: 		[],
						Key: 		'',
					}),
					// ======================================================================
					URL: 			new RouteDB({
						Scheme: 	'/:sids([\\d;]+\\b)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:pdid:2": "Add a {{Service url}}",
							},
						},
						Query: 		[
							"INSERT INTO service_urls (",
							"    provider_detail_id, provider_svc_id, name, description, location, date_created",
							") SELECT s.user_provider_fk, s.provider_svc_id, ':NAME:', ':DESCR:', ':LOCATION:', NOW()",
							"  FROM   user_provider_services s",
							"  JOIN   user_provider_details  p ON s.user_provider_fk = p.provider_detail_id",
							"  WHERE  p.user_fk          =  :UID:",
							"  AND    s.provider_svc_id IN (:SIDS:)",
							"  AND    NULLIF(':LOCATION:','') IS NOT NULL;",
							":/Provider/URLs:",
						],
						Params: 	{
							UID: 	   true,
							SIDs: 	   true,
							Name:     ['SVC_DOC'],
							Descr:    ['SVC_DOC'],
							Location:  true,
						},
						Links: 		[],
						Key: 		'',
					}),
					// ======================================================================
					Service: 		new RouteDB({
						Scheme: 	'/',
						Limits: 	["Tries/Second"],
						Sub: 		null,
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/": "Create new {{Service}}",
							},
						},
						Query: 		[
							"INSERT INTO user_provider_services (",
							"    user_provider_fk,   provider_svc_type,   provider_svc_name, ",
							"    provider_svc_descr, provider_svc_charge, provider_svc_rate",
							") SELECT p.provider_detail_id,':SVCTYPE:',NILLIF(':SVCNAME:',''),NULLIF(':SVCDESCR:',''),:SVCCHARGE:,':SVCRATE:'",
							"  FROM   user_provider_details p WHERE p.user_fk IN (:UIDS:);",
							":/Provider/Service:",
						],
						Params: 	{
							SvcName: 	true,
							SvcType: 	true,
							SvcDescr: 	true,
							SvcCharge: 	true,
							SvcRate: 	true,
							PDIDs: 		['POST'],
							UIDs: 		['QUERY'],
							Page: 		['SQL'],
							Limit: 		['SQL'],
						},
						Links: 		[],
						Key: 		'user_id',
					}),
					// ======================================================================
					"/": RouteDB.Namespace()
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Edit: 			{
				Actions: 	{
					// SERVICES =============================================================
						Documents: 		new RouteDB({
							Scheme: 	'/:scid(\\d+)/',
							Limits: 	["Tries/Second"],
							Sub: 		['service'],
							Routes: 	['service'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:did:14": "Updates the {{Service Document}} at the {{Document ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE service_documents dc",
								"JOIN   user_provider_details p ON dc.provider_detail_id = p.provider_detail_id",
								"SET    dc.description     = COALESCE(NULLIF(':DESCR:', ''), dc.description),",
								"       dc.provider_svc_id = @SID := dc.provider_svc_id",
								"WHERE  p.user_fk = :UID:",
								"AND    dc.id     = :SCID:;",
								":/Provider/Documents:",
							],
							Params: 	{
								SCID: 	true,
								Descr: 	['SVC_DOC'],
								SIDs:   ['SVC_DOC'],
								UID: 	['QHIDE'],
							},
							Links: 		[],
						}),
						// ==================================================================
						Credentials: 	new RouteDB({
							Scheme: 	'/:scid(\\d+)/',
							Limits: 	["Tries/Second"],
							Sub: 		['service'],
							Routes: 	['service'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:did:14": "Updates the {{Service Credential}} at the {{Credential ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE service_credentials cd",
								"JOIN   user_provider_details p ON cd.provider_detail_id = p.provider_detail_id",
								"SET    cd.description     = COALESCE(NULLIF(':DESCR:', ''), cd.description),",
								"       cd.provider_svc_id = @SID := cd.provider_svc_id",
								"WHERE  p.user_fk = :UID:",
								"AND    cd.id     = :SCID:;",
								":/Provider/Credentials:",
							],
							Params: 	{
								SCID: 	true,
								Descr: 	['SVC_DOC'],
								SIDs:   ['SVC_DOC'],
								UID: 	['QHIDE'],
							},
							Links: 		[],
						}),
						// ==================================================================
						Images: 		new RouteDB({
							Scheme: 	'/:scid(\\d+)/',
							Limits: 	["Tries/Second"],
							Sub: 		['service'],
							Routes: 	['service'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:iid:14": "Updates the {{Service image}} at the {{image ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE service_images im",
								"JOIN   user_provider_details p ON im.provider_detail_id = p.provider_detail_id",
								"SET    im.description     = COALESCE(NULLIF(':DESCR:', ''), im.description),",
								"       im.provider_svc_id = @SID := im.provider_svc_id",
								"WHERE  p.user_fk = :UID:",
								"AND    im.id     = :SCID:;",
								":/Provider/Images:",
							],
							Params: 	{
								SCID: 	true,
								Descr: 	['SVC_DOC'],
								SIDs:   ['SVC_DOC'],
								UID: 	['QHIDE'],
							},
							Links: 		[],
						}),
						// ==================================================================
						URLs: 			new RouteDB({
							Scheme: 	'/:scid(\\d+)/',
							Limits: 	["Tries/Second"],
							Sub: 		['service'],
							Routes: 	['service'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:did:14": "Updates the {{Service url}} at the {{Url ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE service_urls ul",
								"JOIN   user_provider_details p ON ul.provider_detail_id = p.provider_detail_id",
								"SET    ul.description     = COALESCE(NULLIF(':DESCR:', ''), ul.description),",
								"       ul.provider_svc_id = @SID := ul.provider_svc_id",
								"WHERE  p.user_fk = :UID:",
								"AND    ul.id     = :SCID:;",
								":/Provider/URLs:",
							],
							Params: 	{
								SCID: 	true,
								Descr: 	['SVC_DOC'],
								SIDs:   ['SVC_DOC'],
								UID: 	['QHIDE'],
							},
							Links: 		[],
						}),
						// ==================================================================
						Service: 		new RouteDB({
							Scheme: 	'/:sids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		null,
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:sids:14": "Updates the {{Service}} at the {{Service ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE  user_provider_services s",
								"JOIN    user_provider_details  p ON s.user_provider_fk = p.provider_detail_id",
								"SET     s.provider_svc_name    = COALESCE(NULLIF(':SVCNAME:',  ''), s.provider_svc_name),",
								"        s.provider_svc_descr   = COALESCE(NULLIF(':SVCDESCR:', ''), s.provider_svc_descr),",
								"        s.provider_svc_charge  = COALESCE(NULLIF( :SVCCHARGE:, ''), s.provider_svc_charge),",
								"        s.provider_svc_rate    = COALESCE(NULLIF(':SVCRATE:',  ''), s.provider_svc_rate)",
								"WHERE   p.user_fk              = (:UIDS:)",
								"AND     s.provider_svc_id     IN (:SIDS:);",
								":/Provider/Service:",
							],
							Params: 	{
								SIDs: 	 	true,
								SvcName: 	['EDIT'],
								SvcDescr: 	['EDIT'],
								SvcCharge: 	['EDIT'],
								SvcRate: 	['EDIT'],
								PDIDs: 		['POST'],
								UIDs: 	 	['QUERY'],
								Page: 		['SQL'],
								Limit: 		['SQL'],
							},
							Links: 		[],
							Key: 		'user_id',
						}),
					// SETTINGS =============================================================
						Email: 			new RouteDB({
							Scheme: 	'/:uid(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['settings'],
							Routes: 	['settings'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Email}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     users u",
								"SET        u.email_address = COALESCE(",
								"               NULLIF(':EEMAIL:',''),",
								"               u.email_address",
								"           )",
								"WHERE      u.user_id  IN (:UIDS:)",
								"AND NOT    ':EEMAIL:' IN (",
								"    SELECT email_address FROM users",
								");",
								":/Exists/Email:",
							],
							Params: 	{ Email: ['EDIT'], UIDs: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						Password: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['settings'],
							Routes: 	['settings'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Password}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"SET character_set_client  = latin1;",
								"SET character_set_results = latin1;",
								"SET collation_connection  = @@collation_database;",
								"SET @PASS := MD5(NULLIF( ':CURRENT:',''));",
								"SET @PNEW := MD5(NULLIF(':PASSWORD:',''));",
								"SET @CONF := MD5(NULLIF(':CONFPASS:',''));",
								"UPDATE  users u",
								"SET     u.user_pass  = @PNEW",
								"WHERE   u.user_id   IN (:UIDS:)",
								"AND     u.user_pass  = @PASS",
								"AND     @PNEW        = @CONF",
								"AND     @PNEW IS NOT NULL",
								"AND     @CONF IS NOT NULL;",
							],
							Params: 	{ 
								Current:  ['CURRENT'], 
								Password:  true, 
								ConfPass: ['CONFIRM'], 
								UIDs: 	   true, 
								Single:    true 
							},
							Links: 		[],
							Key: 		'user_id',
						}),
						Visibility: 	new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['settings'],
							Routes: 	['settings'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Visibility}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE user_visibilities v",
								"SET    v.value   = COALESCE(NULLIF(:VISIBLES:,-1), v.value)",
								"WHERE  v.user_fk = :UIDS:;",
								":/User/Visibility:"
							],
							Params: 	{ 
								Visibles: 	true, 
								UIDs: 		true, 
								Single: 	true 
							},
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Settings: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Settings}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_settings s",
								"INNER JOIN users         u ON s.user_fk = u.user_id",
								"SET        s.timezone         = COALESCE(NULLIF(':TZONE:',  ''), s.timezone),",
								"           s.language_id      = COALESCE(NULLIF( :LGID:,    -1), s.language_id),",
								"           s.is_provider      = COALESCE(NULLIF( :PROVIDER:,-1), s.is_provider),",
								"           s.is_transactional = COALESCE(NULLIF( :TRANSACT:,-1), s.is_transactional)",
								"WHERE      s.user_fk IN (:UIDS:);",
							],
							Params: 	{ 
								TZone: 		true,
								LGID: 		true,
								Provider: ['Provider'],
								Transact: ['Transact'], 
								UIDs: 		true, 
								Single: 	true 
							},
							Links: 		[],
							Key: 		'user_id',
						}),
					// DETAILS  =============================================================
						Education: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Misc}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"SET        d.profile_education = COALESCE(",
								"               NULLIF(':EDU:',''),",
								"               d.profile_education),",
								"           d.profile_edu_descr = COALESCE(",
								"               NULLIF(':EDUDESCR:',''),",
								"               d.profile_edu_descr)",
								"WHERE      d.user_fk IN (:UIDS:);",
								":/User/Misc:"
							],
							Params: 	{ Edu: true, EduDescr: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Description: 	new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Misc}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"SET        d.profile_description = COALESCE(",
								"               NULLIF(':DESCR:',''),",
								"               d.profile_description)",
								"WHERE      d.user_fk IN (:UIDS:);",
								":/User/Misc:"
							],
							Params: 	{
								Descr: true, UIDs: true, UUID: true, Single: true
							},
							Links: 		[],
							Parse  	(res) {
								var RQ  = this.RQ, keys = Object.keys(res); 
								keys.map((k,i)=>{ 
									let det = JSON.parse(res[k].details),
										ins = det.misc.education.institutions;
									det.misc.education.institutions = ins.split(/\n|,\s+/g);
									res[k].details = det;
								});
								return JSN.Objectify(res, RQ.Key, RQ.Columns, this.QY);
							},
							Key: 		'user_id',
						}),
						// ==================================================================
						Marital: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Identity}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"SET        d.profile_marital_status = COALESCE(",
								"               NULLIF(':MARITAL:',''),d.profile_marital_status",
								"           )",
								"WHERE      d.user_fk IN (:UIDS:);",
								":/User/Identity:"
							],
							Params: 	{ Marital: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Sex: 			new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Identity}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"SET        d.profile_sex = COALESCE(NULLIF(':SEX:',''),d.profile_sex)",
								"WHERE      d.user_fk IN (:UIDS:);",
								":/User/Identity:"
							],
							Params: 	{ Sex: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Gender: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Identity}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"LEFT  JOIN genders               AS g ON g.gender_id = :GID:",
								"LEFT  JOIN orients               AS o ON o.orient_id = :OID:",
								"SET        d.profile_identity = COALESCE(g.gender_id, d.profile_gender),",
								"           d.profile_orient   = COALESCE(o.orient_id, d.profile_orient)",
								"WHERE      d.user_fk         IN (:UIDS:);",
								":/User/Identity:"
							],
							Params: 	{ GID: true, OID: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Religion: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Religion}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"LEFT  JOIN religions             AS r ON r.religion_id = :RID:",
								"SET        d.profile_religion = COALESCE(r.religion_id, d.profile_religion)",
								"WHERE      d.user_fk         IN (:UIDS:);",
								":/User/Religion:"
							],
							Params: 	{ RID: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),				
						// ==================================================================
						Nationalities: 	new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Nationalities}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details AS u",
								"INNER JOIN (",
								"    SELECT     d.user_fk, CONCAT('[',",
								"                   GROUP_CONCAT(h.nationality_id SEPARATOR ','),",
								"               ']') as nationalities",
								"    FROM       user_profile_details AS d",
								"    INNER JOIN (",
								"        SELECT     d.user_fk, JSON_COMPACT(",
								"                       :NIDS:",
								"                   ) AS profile_nationalities",
								"        FROM       user_profile_details AS d",
								"        WHERE      d.user_fk IN (:UIDS:)",
								"    ) AS E ON d.user_fk = E.user_fk",
								"    LEFT  JOIN nationalities AS h ON ",
								"        JSON_CONTAINS(E.profile_nationalities,h.nationality_id)",
								"    GROUP BY   d.user_fk",
								") P ON u.user_fk = P.user_fk",
								"SET    u.profile_nationalities = P.nationalities",
								"WHERE  u.user_fk = P.user_fk;",
								":/User/Nationalities:"
							],
							Params: 	{ NIDs: ['EDIT'], UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Languages: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Languages}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details AS u",
								"INNER JOIN (",
								"    SELECT     d.user_fk, CONCAT('{\"', GROUP_CONCAT(",
								"                   h.language_id, '\":', CAST(JSON_VALUE(",
								"                        E.profile_languages, CONCAT('$.',h.language_id)",
								"                   ) AS INT)",
								"               SEPARATOR ',\"'),'}') as languages",
								"    FROM       user_profile_details AS d",
								"    INNER JOIN (",
								"        SELECT     d.user_fk, JSON_COMPACT(",
								"                       :LGIDS:",
								"                   ) AS profile_languages",
								"        FROM       user_profile_details AS d",
								"        WHERE      d.user_fk IN (:UIDS:)",
								"    )                    AS E ON d.user_fk = E.user_fk",
								"    LEFT  JOIN languages AS h ON JSON_CONTAINS(",
								"                                     JSON_KEYS(E.profile_languages),",
								"                                     JSON_QUOTE(CONVERT(h.language_id,CHAR(5)",
								"                                 )))",
								"    GROUP BY   d.user_fk",
								") P ON u.user_fk = P.user_fk",
								"SET    u.profile_languages = P.languages",
								"WHERE  u.user_fk = P.user_fk;",
								":/User/Languages:"
							],
							Params: 	{ LGIDs: ['EDIT'], UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Hobbies: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['details'],
							Routes: 	['details'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Hobbies}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details AS u",
								"INNER JOIN (",
								"    SELECT     d.user_fk, CONCAT('{\"', GROUP_CONCAT(",
								"                   h.hobby_id, '\":', CAST(JSON_VALUE(",
								"                        E.profile_hobbies, CONCAT('$.',h.hobby_id)",
								"                   ) AS INT)",
								"               SEPARATOR ',\"'),'}') as hobbies",
								"    FROM       user_profile_details AS d",
								"    INNER JOIN (",
								"        SELECT     d.user_fk, JSON_COMPACT(",
								"                       :HIDS:",
								"                   ) AS profile_hobbies",
								"        FROM       user_profile_details AS d",
								"        WHERE      d.user_fk IN (:UIDS:)",
								"    )                  AS E ON d.user_fk = E.user_fk",
								"    LEFT  JOIN hobbies AS h ON JSON_CONTAINS(",
								"                                   JSON_KEYS(E.profile_hobbies),",
								"                                   JSON_QUOTE(CONVERT(h.hobby_id,CHAR(5)",
								"                               )))						  ",
								"    GROUP BY   d.user_fk",
								") P ON u.user_fk = P.user_fk",
								"SET    u.profile_hobbies = P.hobbies",
								"WHERE  u.user_fk = P.user_fk;",
								":/User/Hobbies:"
							],
							Params: 	{ HIDs: ['EDIT'], UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Details: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uid:14": "Returns the {{Details}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								":/Edit/Hobbies:", 		 ":/Edit/Languages:",
								":/Edit/Nationalities:", ":/Edit/Religion:",
								":/Edit/Sex:",			 ":/Edit/Marital:", 	//":/Edit/Gender:",		 
								":/Edit/Description:",	 ":/Edit/Education:"
							],
							Params: 	{
								HIDs:	   ['EDIT'], LGIDs:	['EDIT'],
								NIDs:	   ['EDIT'], RID:	  true,
								Marital: 	 true,   Sex: 	  true,
								GID: 		 true,   OID: 	  true, 
								Descr:		 true,   Edu:	  true, 
								EduDescr:	 true,   UIDs:	  true, 
								UUID:        true,
								// Single:		true,
							},
							Links: 		[],
							Parse  	(res) { 
								var ret = Imm.Map({}); res.map(v=>{
									ret = ret.mergeDeep(Imm.fromJS(Imm.Map(v).toJS()))
								}); return ret.toJS();
							},
							Key: 		'user_id'
						}),
					// PHOTOS   =============================================================
						Cover: 			new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['photos'],
							Routes: 	['photos'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Cover Image}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"LEFT  JOIN user_photos           AS i ON d.user_fk = i.user_fk",
								"                                     AND i.id      = :COVER:",
								"SET        d.profile_cover    = COALESCE(i.id, d.profile_cover)",
								"WHERE      d.user_fk IN (:UIDS:);",
								":/User/Photos:"
							],
							Params: 	{ Cover: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Picture: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Sub: 		['photos'],
							Routes: 	['photos'],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Profile Image}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[
								"UPDATE     user_profile_details  AS d",
								"LEFT  JOIN user_photos           AS i ON d.user_fk = i.user_fk",
								"                                     AND i.id      = :PICTURE:",
								"SET        d.profile_picture  = COALESCE(i.id, d.profile_picture)",
								"WHERE      d.user_fk IN (:UIDS:);",
								":/User/Photos:"
							],
							Params: 	{ Picture: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
						// ==================================================================
						Photos: 		new RouteDB({
							Scheme: 	'/:uids(\\d*)/',
							Limits: 	["Tries/Second"],
							Methods: 	Docs.Kinds.PUT,
							Doc: 		{
								Headers: 	{ token: Docs.Headers.Token },
								Examples: 	{
									"/:uids:14": "Updates the {{Photos}} of the {{User}} at the {{User ID}}, 14",
								},
							},
							Query: 		[":/Update/Picture:",":/Update/Cover:",":/User/Photos:"],
							Params: 	{ Picture: true, Cover: true, UIDs: true, UUID: true, Single: true },
							Links: 		[],
							Key: 		'user_id',
						}),
					// USER     =============================================================
					"/": 			new RouteDB({
						Scheme: 	'/:uids(\\d*)/',
						Limits: 	["Tries/Second"],
						Methods: 	Docs.Kinds.PUT,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:uids:14": "Updates the {{User Info}} of the {{User}} at the {{User ID}}, 14",
							},
						},
						Query: 		[
							"UPDATE     users         AS u",
							"LEFT  JOIN users         AS d  ON d.user_id NOT IN (:UIDS:) ",
							"                              AND d.display_name = ':USERNAME:'",
							"LEFT  JOIN locale_search AS l  ON l.city_id      =  :LID:",
							"SET        u.display_name = COALESCE(NULLIF(':USERNAME:', COALESCE(d.display_name,'')), u.display_name),",
							"           u.first_name   = COALESCE(NULLIF(':FIRSTNAME:',''), u.first_name),",
							"           u.last_name    = COALESCE(NULLIF(':LASTNAME:', ''), u.last_name),",
							"           u.birth_date   = COALESCE(NULLIF(':BIRTHDATE:',''), u.birth_date),",
							"           u.location     = COALESCE(l.city_id, u.location)",
							"WHERE      u.user_id     IN (:UIDS:);",
							":/User:"
						],
						Params: 	{
							UserName: 	['QUERY'],
							FirstName: 	  true,
							LastName: 	  true,
							BirthDate: 	  true,
							LID: 		  true, 
							UIDs: 		  true, 
							Account: 	['HIDDEN'],
							Single: 	  true 
						},
						Links: 		[],
						Parse  	(res) {
							var RQ  = this.RQ, QY = this.QY, IDs = [], 
								rgx = {'user_id': '\\\\d+'}, cat = Imm.Map({
									photos: 		'user/photos',
									identity: 		'user/details/identity',
									misc: 			'user/details/misc',
									services: 		'provider/service',
									hobbies: 		'user/details/hobbies',
									languages: 		'user/details/languages',
									nationalities: 	'user/details/nationalities',
									religion: 		'user/details/religion',
									settings: 		'user/details/settings',
									visibility: 	'user/details/settings/visibility',
								}), sgl = !!eval(QY.single);
							if (IDs = res.map((v,i)=>v.user_id), IDs) { 
								var qry = `?${[ 'to=["payload","result"]',
												`single=${sgl}`,
												'links=true',
												'as=item',
											].join('&')}`,
									prm = `:uids:${IDs.join(';')}`;
								cat.map((l,c)=>{
									var toE = (sgl?'':'","'+rgx.user_id),
										lnk = `/${l}/${prm}${qry}`;
									RQ.links[c]=SQL.SOCKET({ link: lnk });
								});
							};
							return (sgl ? res[0] : JSN.Objectify(
								res, RQ.Key, RQ.Columns, QY
							)	);
						},
						Key: 		'user_id',
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Dump: 			{
				Actions: {
					// ======================================================================
					Document: 		new RouteDB({
						Scheme: 	'/:scid(\\d+)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.DELETE,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:scid:14": "Delete the {{Service Document}} at the {{Document ID}}, 14",
							},
						},
						Query: 		[
							"DELETE FROM service_documents WHERE id = :SCID:;",
							":/Provider/Documents:",
						],
						Params: 	{ SCID: true, UID: ['QHIDE'] },
						Links: 	[],
						Key: 	'',
					}),
					// ======================================================================
					Credential: 	new RouteDB({
						Scheme: 	'/:scid(\\d+)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.DELETE,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:scid:14": "Delete the {{Service Credential}} at the {{Credential ID}}, 14",
							},
						},
						Query: 		[
							"DELETE FROM service_credentials WHERE id = :SCID:;",
							":/Provider/Documents:",
						],
						Params: 	{ SCID: true, UID: ['QHIDE'] },
						Links: 	[],
						Key: 	'',
					}),
					// ======================================================================
					Image: 			new RouteDB({
						Scheme: 	'/:scid(\\d+)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.DELETE,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:scid:14": "Delete the {{Service image}} at the {{image ID}}, 14",
							},
						},
						Query: 		[
							"DELETE FROM service_images WHERE id = :SCID:;",
							":/Provider/Documents:",
						],
						Params: 	{ SCID: true, UID: ['QHIDE'] },
						Links: 	[],
						Key: 	'',
					}),
					// ======================================================================
					Url: 			new RouteDB({
						Scheme: 	'/:scid(\\d+)/',
						Limits: 	["Tries/Second"],
						Sub: 		['service'],
						Routes: 	['service'],
						Methods: 	Docs.Kinds.DELETE,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:scid:14": "Delete the {{Service url}} at the {{Url ID}}, 14",
							},
						},
						Query: 		[
							"DELETE FROM service_urls WHERE id = :SCID:;",
							":/Provider/Documents:",
						],
						Params: 	{ SCID: true, UID: ['QHIDE'] },
						Links: 	[],
						Key: 	'',
					}),
					// ======================================================================
					Service: 		new RouteDB({
						Scheme: 	'/:sid(\\d+)/',
						Limits: 	["Tries/Second"],
						Methods: 	Docs.Kinds.DELETE,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{
								"/:sid:14": "Delete the {{Service}} at the {{Service ID}}, 14",
							},
						},
						Query: 		[
						   "DELETE FROM user_provider_services WHERE provider_svc_id = :SID:;",
						   ":/Provider/Service:",
						],
						Params: 	{
							SID:	true,
							UIDs:  ['QUERY'],
							Page:  ['SQL'],
							Limit: ['SQL'],
						},
						Links: 	[],
						Key: 	'',
					}),
					// ======================================================================
					"/": RouteDB.Namespace()
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Upload: 		{
				Actions: 	{
					// ======================================================================
					"/": 			new RouteDB({
						Scheme: 	'/:uid(\\d+)/',
						Methods: 	Docs.Kinds.PUT,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Files: 		{
								field:	'file',
								max:	1,
								dest 	(prm, bdy, file) { return `${bdy.bucket}/${prm.uid}`; 	},
								name	(prm, bdy, file) { return `${file.originalname}`; 		}
							},
							Examples: 	{
								"/:uid:14?bucket=images+profile": [
									"Uploads an {{Profile Image}} to the {{images/profile}} Bucket for",
									"{{User}} with the {{User ID}}, 14."
								].join(' '),
							},
						},
						Query: 		[
							""
						],
						Params: 	{ UID: true, Bucket: true, File: true },
						// Parse  	(res) {}
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Signup: 		{
				Actions: 	{
					// ======================================================================
					Valid: 			new RouteDB({
						Scheme: 	'/:uid(\\d+)/',
						Limits: 	['Tries/Day'],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{},
							Examples: 	{
								"/:uid:14": "Returns TRUE if the {{User}} with the {{UID}}, 14, is validated; otherwise, FALSE."
							},
						},
						Query: 		[
							"SELECT (CASE WHEN u.validated = 1",
							"             THEN 'true' ELSE 'false'",
							"       END) AS validated",
							"FROM   users u WHERE u.user_id = :UID:"
						],
						Params: 	{ ID: true, UID: true },
						Parse  	(res) { return res[0].validated; }
					}),
					// ======================================================================
					Validate: 		new RouteDB({
						Scheme: 	'/:md5([A-Fa-f0-9]+)/',
						Limits: 	['Tries/Day'],
						Methods: 	Docs.Kinds.GET, 
						Doc: 		{ 
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{ "/:md5:a35f64aa9fb86ba2b556d7d585122a4a": 
								"Validates the new {{User}} account with the {{Validation Record}}, 'a35f64aa9fb86ba2b556d7d585122a4a'",
							}
						},
						Query: 		[
							"SET @VREC = (",
							"    SELECT  v.user_fk FROM user_validations v",
							"    WHERE   v.validation_auth = ':MD5:'",
							");",
							"UPDATE users u SET u.validated = 1 WHERE u.user_id = @VREC;",
							":/Signup/Valid:"
						],
						Params: 	{ MD5: true },
						Parse  	(res) { return res[0].exists; }
					}),
					// ======================================================================
					"/": 			new RouteDB({
						Scheme: 	'/',
						Limits: 	['New/Day'],
						Methods: 	Docs.Kinds.POST,
						Doc: 		{ Examples: {} },
						Query: 		[
							"SET character_set_client  = latin1;",
							"SET character_set_results = latin1;",
							"SET collation_connection  = @@collation_database;",
							"INSERT INTO users (",
							"    email_address, user_pass",
							") SELECT i.email, MD5(i.pass) FROM (",
							"    SELECT ':EEMAIL:'   AS email,",
							"           ':PASSWORD:' AS  pass,",
							"           ':CONFPASS:' AS  conf",
							") AS i WHERE NOT EXISTS(",
							"    SELECT u.user_id FROM users u ",
							"    WHERE  u.email_address = i.email",
							") AND NOT (",
							"    NULLIF(i.pass,'') OR NULLIF(i.conf,'')",
							") IS NULL AND i.pass = i.conf;",
							":/Exists/Email:"
						],
						Params: 	{ 
							Email: 		['EDIT'], 
							Password: 	 true, 
							ConfPass: 	['CONFIRM'], 
						},
						Parse  	(res) { return res[0].exists; }
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Exists: 		{
				Actions: 	{
					// ======================================================================
					Email: 			new RouteDB({
						Scheme: 	'/:email([\\w_.-]+@[\\w_.-]+\\.[A-z]+)/',
						Limits: 	["Constant/Second"],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{},
							Examples: 	{
								"/:email:leshaun.j@mail.com": "Determines if the {{Email}}, 'leshaun.j@mail.com' is tied to a {{User}}",
							},
						},
						Query: 		[
							"SELECT (CASE WHEN EXISTS(",
							"    SELECT email_address FROM users",
							"    WHERE  email_address = ':EMAIL:'",
							") THEN 'true' ELSE 'false' END) AS `exists`;"
						],
						Params: 	{ ID: true, Email: true },
						Parse  	(res) { return res[0].exists; }
					}),
					// ======================================================================
					UserName: 		new RouteDB({
						Scheme: 	'/:username([\\w_.-]+)/',
						Limits: 	["Constant/Second"],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{},
							Examples: 	{
								"/:username:LeShaunJ": "Determines if the {{Display Name}}, 'LeShaunJ' is tied to a {{User}}",
							},
						},
						Query: 		[
							"SELECT (CASE WHEN EXISTS(",
							"    SELECT display_name FROM users",
							"    WHERE  display_name = ':USERNAME:'",
							") THEN 'true' ELSE 'false' END) AS `exists`;"
						],
						Params: 	{ ID: true, UserName: true },
						Parse  	(res) { return res[0].exists; }
					}),
					// ======================================================================
					"/": 			new RouteDB({
						Scheme: 	'/:username([\\w_.-]+)|:email([\\w_.-]+@[\\w_.-]+\\.[A-z]+)/',
						Limits: 	["Constant/Second"],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{},
							Examples: 	{
								"/:username:LeShaunJ": "Determines if the {{Display Name}}, 'LeShaunJ' is tied to a {{User}}",
								"/:email:leshaun.j@mail.com": "Determines if the {{Email}}, 'leshaun.j@mail.com' is tied to a {{User}}",
							},
						},
						Query: 		[
							":/Exists/UserName:",
							":/Exists/Email:"
						],
						Params: 	{ ID: true, UserName: true, Email: true },
						Parse  	(res) { return (!!res.filter(v=>JSON.parse(v.exists)).length).toString(); }
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
			Static: 		{
				Actions: 	{
					// ======================================================================
					"/": 			new RouteDB({
						Scheme: 	'/:name(\\b[\\w-]+\\b)/',
						Limits: 	["Constant/Second"],
						Methods: 	Docs.Kinds.GET,
						Doc: 		{
							Headers: 	{},
							Examples: 	{
								"/:name:about": "Gets the {{Content}} for the, 'About Us', {{Page Name}}",
							},
						},
						Query: 		[
							"SELECT     s.static_id AS id, s.static_page AS page,",
							"                    NULLIF(s.static_sidebar, '')       AS sidebar,",
							"           COALESCE(NULLIF(s.static_copy,    ''),'[]') AS copy,",
							"           COALESCE(NULLIF(s.static_other,   ''),'[]') AS other",
							"FROM       statics s",
							"WHERE      s.static_page = ':NAME:'",
						],
						Params: 	{ Name: true, ID: true },
						Parse  	(res) { 
							let ctn = res[0]||{}, ret = { 
								id: 		ctn.id||-1, 
								page: 		ctn.page||'none', 
								sidebar: 	ctn.sidebar||null,
								copy: 		ctn.copy||[],
								other: 		ctn.other||[],
							};	return ret;
						}
					})
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
		};	
	};

/////////////////////////////////////////////////////////////////////////////////////////////
