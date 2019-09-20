
module.exports = {
	Debug: 		true,
	Port: 		8443,
	SSL:		{
		CA: 	"../SSL/evectr.com.ca-bundle",
		Cert: 	"../SSL/evectr.com.chain.pem",
		Key: 	"../SSL/evectr.com.key.pem",
		DHP:	"/opt/local/etc/nginx/ssl/dhparam.pem",
	},
	Services: 	[
		'https://arian.evectr.com:8443/gbl-accessor',
		'https://arian.evectr.com:8443/gbl-rest',
	],
	APIDoc:		{
		info: {
			title: "eVectr.API",
			description: "The official eVectr™ API.",
			termsOfService: "https://arian.evectr.com:8443/terms",
			contact: { 
				name: "eVectr™ Support",
				email: "support@evectr.com",
				url: "https://arian.evectr.com:8443/help",
			},
			version: "1.0.0"
		},
		externalDocs: {},
		servers: [
			{ url: "https://arian.evectr.com:8443" }
		],
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
			In:  (((1000*60*60)*24)*30),
		},
		REDIS: 	{
			Config: {
				Host: 		'localhost',
				Port: 		6379,
				Password: 	'Pion33r247',
			},
			Main:	{ Index: 0, Name: 'Client' },
			Stores: [
				{ Index: 1, Name: 'Users'   },
				{ Index: 2, Name: 'Limits'  },
				{ Index: 3, Name: 'Lockers' },
				{ Index: 4, Name: 'Messages' },
				{ Index: 5, Name: 'Alerts'   },
				{ Index: 6, Name: 'Comments' },
			]
		},
		Auth: 	{
			Flush: 	false,
			SQL: 	{
				Login: 	 "SELECT email_address, user_pass FROM users WHERE email_address = ?",
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
				Account: 	'email_address',
				Profile: 	[
					'Photo', 'Name', 'Email', 'Age', 'Sex', 'Location'
				],
				Scopes: [
					'user_id',
					'display_name',
					'email_address',
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
						'/locale/',
						'/locale/search/',
						'/locale/search/city/',
						'/locale/search/region/',
						'/locale/search/country/',
						'/locale/timezone/',
						'/hobbies/search/',
						'/languages/search/',
						'/nationalities/search/',
						'/religions/search/',
						'/genders/search/'
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
				"Tries/Second": 	{
					total: 5,     method: 'post', 
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
	},
};
