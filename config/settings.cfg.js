
/** @type {CFG.Settings} */
module.exports = {
	Debug: 		false,
	Port: 		8443,
	SSL:		{
		CA: 	"../SSL/evectr.com.ca-bundle",
		Cert: 	"../SSL/evectr.com.chain.pem",
		Key: 	"../SSL/evectr.com.key.pem",
		DHP:	"/opt/local/etc/nginx/ssl/dhparam.pem",
	},
	Services: 	[
		'https://evectr.com:8443/gbl-accessor',
		'https://evectr.com:8443/gbl-rest',
	],
	APIDoc:		{
		info: {
			title: "eVectr.API",
			description: "The official eVectr™ API.",
			termsOfService: "https://evectr.com/terms",
			contact: { 
				name: "eVectr™ Support",
				email: "support@evectr.com",
				url: "https://evectr.com/help",
			},
			version: "1.0.0"
		},
		servers: [
			{ url: "https://evectr.com" }
		],
		externalDocs: {},
	},
	Folders: 	{
		Uploads: 	{
			Folder:  'storage',
			Age: 	 365*86400,
			Matcher: /\?(?:\w+=.+)$/,
			Headers: null,
		},
		Publics: 	{
			Folder:  'public',
			Age: 	 365*86400,
			Matcher: /\?(?:\w+=.+)$/,
			Headers: null,
		}
	},
	Session: 	{
		Secret: "jy24xsFDWU5jYnZ2MNFmtCvJOhcDoxlL",
		Age: 	{
			Out: (1000*300),
			In:  ((1000*60*60)*24),
			Rem: (((1000*60*60)*24)*30),
		},
		REDIS: 	{
			Config: {
				Host: 		'localhost',
				Port: 		 6379,
				Password: 	'Pion33r247',
			},
			Main:	{ Index: 0, Name: 'Client' },
			Stores: [
				{ Index: 1, Name: 'Users'    },
				{ Index: 2, Name: 'Groups'   },
				{ Index: 3, Name: 'Limits',   Flush: false },
				{ Index: 4, Name: 'Lockers'  },
				{ Index: 5, Name: 'Alerts',   Flush: false },
				{ Index: 6, Name: 'Messages', Flush: false },
				{ Index: 7, Name: 'Comments' },
			],
			PSubs: {},
		},
		Auth: 	{
			Paths:  {
				IN:  '/auth/login',
				OUT: '/auth/logout',
			},
			Flush: 	false,
			SQL: 	{
				Login: 	 [
					"SELECT user_id       `uid`,",
					"       email_address `account`,",
					"       user_pass     `password`",
					"FROM   users",
					"WHERE  email_address = ?"
				].join('\n'),
				Profile: [
					"SELECT u.user_id, u.email_address,",
					"       u.display_name, u.user_pass,",
					"       d.profile_picture AS Photo,",
					"       JSON_COMPACT(JSON_OBJECT(",
					"           'First', u.first_name,",
					"           'Last',  u.last_name",
					"       )) AS Name,",
					"       u.email_address AS Email,",
					"       getAgeFromStr(u.birth_date) AS Age,",
					"       d.profile_sex AS Sex,",
					"       JSON_OBJECT(",
					"           'City',    l.city,",
					"           'Region',  l.region,",
					"           'Country', l.country",
					"       ) AS Location,",
					"       JSON_OBJECT(",
					"           'admin',         s.is_admin,",
					"           'transactional', s.is_transactional,",
					"           'provider',      s.is_provider",
					"       ) AS modes,",
					"       JSON_OBJECT(",
					"           'verified',  u.verified, ",
					"           'status',    u.status, ",
					"           'tour_done', u.tour_done",
					"       ) AS checks",
					"FROM       users                 u",
					"INNER JOIN user_profile_details  d ON u.user_id    = d.user_fk",
					"INNER JOIN user_settings         s ON u.user_id    = s.user_fk",
					"LEFT  JOIN locale_search         l ON u.location   = l.city_id",
					"WHERE      email_address = ?"
				].join('\n')
			},
			Format: {
				UID:        'user_id',
				Account: 	'email_address',
				Profile: 	[
					'Photo', 'Name', 'Email', 'Age', 'Sex', 'Location'
				],
				Scopes: [
					'user_id',
					'display_name',
					'user_pass',
					'checks',
					'modes',
				]
			}
		},
		Limits: {
			All: {
				"IP/Day": 			{
					total: 5000, method: 'all',
					lookup: ['connection.remoteAddress'],
				},
				"API/Second": 		{
					total: 50,   method: 'all',
					lookup: ['connection.remoteAddress'],
					omit: [
						'/search/for/misc',
						'/search/for/genders',
						'/search/for/orientations',
						'/search/for/religions',
						'/search/for/nationalities',
						'/search/for/languages',
						'/search/for/hobbies',
						'/search/for/country',
						'/search/for/region',
						'/search/for/city',
						'/search/for/locale',
						'/search/for/charge',
						'/search/for/providers',
						'/search/for/services',
						'/search/suggest',
						'/search/advanced',
						'/search',
					]
				},
				"TokenIP/Day": 		{
					total: 2500, method: 'all', 
					lookup: ['headers.token', 'connection.remoteAddress']
				}
			},
			Optional: {
				"New/Day": 			{
					total: 3,    method: 'post',
					lookup: ['connection.remoteAddress']
				},
				"Tries/Second": 	{
					total: 1,    method: 'post', 
					lookup: ['connection.remoteAddress']
				},
				"Tries/Day": 		{
					total: 5,    method: 'post', 
					lookup: ['connection.remoteAddress']
				},
				"5Tries/Second": 	{
					total: 5,     method: 'all', 
					lookup: ['connection.remoteAddress']
				},
				"Constant/Second": 	{
					total: 200,   method: 'get',
					lookup: ['connection.remoteAddress']
				}
			}
		}
	},
	Plugins:	{
		Stripe: 	function Stripe() {
						let apiKey = "sk_test_ilOh0bPhIuDC0beq97wPf8Zr",
							StrSig = 'whsec_5TnyhyT1O9QXq45Iz3zLn6Na0510ARJu',
							Stripe = require("stripe")(apiKey),
							PlugIn = {};
						// -------------------------------------------------------------- //
							DEFINE(PlugIn, { Signature: HIDDEN({
								get() { return StrSig; }
							}, 1) });
						// -------------------------------------------------------------- //
							function Asyncify(MODL) {
								let result = {};
								// -------------------------------------------------------------- //
									function Traverse(obj, level = []) {
										var rslt = {}, idn = '    '.dup(level);
										for (let p in obj) {
											let prop = `${idn}${p.padEnd(25)} : `,
												valu = obj[p], typs = ISS(valu);
											switch (typs) {
												case   'object':
													if (p[0] !== '_') {
														let subobj = Traverse(valu,[...level,p]);
														DEFINE(rslt, { [p]: HIDDEN({ get() { return subobj; } },1) }); 
													}; 	break;;
												case 'function':
													let fstr = valu.toString();
													if ((fstr.has('stripeMethod') || fstr.has('Promise'))) {
														DEFINE(rslt, { 
															[p]: HIDDEN(async (...args) => {
																return new Promise((resolve, reject) => {
																	valu.bind(obj)(...args)
																		.then(payload=>resolve(payload))
																		.catch(errors=>{
																			LG.Error(errors.message, 'STRIPE', 'Asyncify')
																			reject(errors)
																		})
																});
															})
														});
														// LG.Server([...level,p].join('.'), 'STRIPE', 'Exposed', 'blue');
													};	break;;
												default:break;;
											}
										};
										return Object.freeze(rslt);
									}
								// -------------------------------------------------------------- //
									result = Traverse(MODL); 
								// -------------------------------------------------------------- //
									return result;
							}
						// -------------------------------------------------------------- //
							PlugIn = Asyncify(Stripe);
						// -------------------------------------------------------------- //
							return PlugIn;
					},
		// Mongo: 		async function Mongo() {
					// 	let mongoose = require('mongoose'),
					// 		sch_path  = '../../../main/mongo/',
					// 		schemas  = {
					// 			ContactCategory: require(`${sch_path}/contactcategory.js`),
					// 			AnotherOne: require(`${sch_path}/anotherone.js`),
					// 			AndAnotherOne: require(`${sch_path}/andanotherone.js`),
					// 			AndAnotherNotherOne: require(`${sch_path}/andanothernotherone.js`),
					// 			AndTheLastOne: require(`${sch_path}/andthelastone.js`),
					// 		},
					// 		connstr  = 'mongodb://evectrContact:r4nd0m@localhost:27017/contact',
					// 		result   = false;

					// 	result = await new Promise((resolve, reject) => mongoose.connect(connstr, err => {
					// 		if (err) reject(err);
					// 		console.log('Mongoose connected')
					// 		resolve(mongoose);
					// 	})	);
			
					// 	if (result === true) {
					// 		let MongoPromiseFactory = (name, filter) => {
					// 				return new Promise((resolve, reject) => {
					// 					schemas[name].find(filter, (error, result) => {
					// 						if (!!error) reject(error);
					// 						else resolve(result);
					// 					});
					// 				});
					// 			};
					// 		return {
					// 			mongoose,
					// 			ContactCategory: (filter) => {
					// 				return MongoPromiseFactory('ContactCategory', filter);
					// 			},
					// 			AnotherOne: (filter) => {
					// 				return MongoPromiseFactory('AnotherOne', filter);
					// 			},
					// 			AndAnotherOne: (filter) => {
					// 				return MongoPromiseFactory('AndAnotherOne', filter);
					// 			},
					// 			AndAnotherNotherOne: (filter) => {
					// 				return MongoPromiseFactory('AndAnotherNotherOne', filter);
					// 			},
					// 			AndTheLastOne: (filter) => {
					// 				return MongoPromiseFactory('AndTheLastOne', filter);
					// 			},
					// 		};
					// 	} else {
					// 		throw result;
					// 	};
					// }
	},
};
