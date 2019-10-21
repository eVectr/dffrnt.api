
module.exports = {
	Debug: 		false,
	Port: 		8080,
	Services: 	[
		'http://localhost:8080/gbl-accessor',
		'http://localhost:8080/gbl-rest',
	],
	APIDoc:		{
		info: {
			title: "eVectr.API",
			description: "The official eVectr™ API.",
			termsOfService: "http://localhost:8080/terms",
			contact: { 
				name: "eVectr™ Support",
				email: "support@evectr.com",
				url: "http://localhost:8080/help",
			},
			version: "1.0.0"
		},
		externalDocs: {},
		servers: [
			{ url: "http://localhost:8080" }
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
				Password: 	'r4nd0m',
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
		// MONGO DATABASE PLUGIN
		Mongo: 		async function Mongo() {
			let mongoose = require('mongoose'),
				sch_path  = '../../../main/mongo/',
				
				// COLLECTION SCHEMAS
				schemas  = {
					ContactCategory: require(`${sch_path}/contactcategory.js`),
				},
				connstr  = 'mongodb://evectrContact:r4nd0m@localhost:27017/contact',
				result   = false;
			
			// CONNECTION RESULT
			result = await new Promise((resolve, reject) => mongoose.connect(connstr, err => {
				if (err) {console.log("PROMISE ERROR MONGOOOSEEE"); console.log(err); reject(false);}
				console.log('Mongoose connected')
				//console.log(mongoose)
				resolve(mongoose);
			})	);
			// IF CONNECTRION OBJECT EMPTY
			if (Object.keys(result).length === 0) {
				console.log("MONGOOSE FELL DOWN REALLY BAD");
				throw result;
				
			} else {
				//console.log("THERE IS A VALID CONNEXXX");
				//console.log(result);
				let MongoPromiseFactory = (name, filter, type) => {
					return new Promise((resolve, reject) => {
						if(type === "find" || type === undefined) {
							console.log("Finding collection data for "+name);
							schemas[name].find(filter, (error, result) => {
								if (!!error) reject(error);
								else resolve(result);
							});
						} else {
							console.log("Mongo Lookup failed for: "+name);
						}
						//if (type === "save") {}
					});
				};
				return {
					result,
					ContactCategory: (filter) => {
						return MongoPromiseFactory('ContactCategory', filter, "find");
					},
				};
			};
		},
		// POPULATE STATIC MONGO DATA
		MongoImport: 		async function MongoImport() {
			var remakeCollections = true; // SET TO TRUE IF YOU WANT TO RE-IMPORT COLLECTIONS OR COLLECTIONS DONT ALREADY EXIST
			if(remakeCollections === true) {
				let mongoose = require('mongoose'),
				connstr  = 'mongodb://evectrContact:r4nd0m@localhost:27017/contact',
				result   = false;
			
			// CONNECTION RESULT
			result = await new Promise((resolve, reject) => mongoose.connect(connstr, err => {
				if (err) {console.log("MONGOOSE PROMISE ERRoR"); console.log(err); reject(false);}
				console.log('Mongoose connected')
				//console.log(mongoose)
				resolve(mongoose);
			})	);
			// IF CONNECTION OBJECT EMPTY
			if (Object.keys(result).length === 0) {
				console.log("FAILED TO ESTABLISH MONGO CONNECTION");
				throw result;
			} else {
				console.log("MongoImport: Re-creating collections");
				var Schema = mongoose.Schema;
		
				var evContactReasonsSchema = new Schema({
					reason_title:  String,
					category: String,
					form_type:   String,
					date: { type: Date, default: Date.now },
					hidden: Boolean
				});
	
				var evContactReasonsModel = mongoose.model('evContactReasons', evContactReasonsSchema);
				
				// Drop all entries in evcontactreasons collection
				var dropCollection = evContactReasonsModel.bulkWrite([
					{
						deleteMany: {
							filter: {}
						}
					}
				]).then(res => {
					console.log("Removed "+ res.deletedCount+" documents from evcontactreasons collection.");
				});

				// DOCUMENT IMPORTS

				var contactReasons = [
					// GENERAL HELP REQUESTS
					{reason_title: 'Login Issue', category: "General Help Request", form_type: "Standard"},
                    {reason_title: 'Request to Deactivate Account', category: "General Help Request", form_type: "Standard"},
					{reason_title: 'Inquiry about Suspended or Locked Account', category: "General Help Request", form_type: "Standard"},
					{reason_title: 'Request to Restore an Account', category: "General Help Request", form_type: "Standard"},
					{reason_title: 'Report a Hacked Account', category: "General Help Request", form_type: "MandatoryUploads"},
					{reason_title: 'Report Transaction related issue', category: "General Help Request", form_type: "OptionalUploads"},
					{reason_title: 'Other Questions or Concerns', category: "General Help Request", form_type: "Standard"},
					// REPORT A VIOLATION
					{reason_title: 'Impersonation', category: "Report a Violation", form_type: "MandatoryUploads"},
					{reason_title: 'Report Trademarks and Copyright Inftringement', category: "Report a Violation", form_type: "MandatoryUploads"},
					{reason_title: 'Harassment', category: "Report a Violation", form_type: "MandatoryUploads"},
					{reason_title: 'Privacy Information', category: "Report a Violation", form_type: "MandatoryUploads"},
					{reason_title: 'Report Spamming Activity', category: "Report a Violation", form_type: "MandatoryUploads"},
					{reason_title: 'Report Suspicious Ad(s)', category: "Report a Violation", form_type: "MandatoryUploads"},
					{reason_title: 'Report an issue with Service Provider', category: "Report a Violation", form_type: "OptionalUploads"},
					{reason_title: 'Report an issue with Service User', category: "Report a Violation", form_type: "OptionalUploads"},
					{reason_title: 'Report Harassment related to a Service Provider', category: "Report a Violation", form_type: "OptionalUploads"},
					{reason_title: 'Report Harassment related to a Service User', category: "Report a Violation", form_type: "OptionalUploads"},
					{reason_title: 'Other Violations Related Questions or Concerns', category: "Report a Violation", form_type: "OptionalUploads"},
					// REQUEST A PROFILE AUDIT
					{reason_title: 'Report Fake Credentials', category: "Request a Profile Audit", form_type: "MandatoryUploads"},
					{reason_title: 'Report Misleading Claims', category: "Request a Profile Audit", form_type: "MandatoryUploads"},
					{reason_title: 'Other Suspicious Activity', category: "Request a Profile Audit", form_type: "MandatoryUploads"},
				];

				var insertResult = evContactReasonsModel.insertMany(contactReasons, function(error, docs) {
					if (error){
						return console.error(error);
					} else {
						console.log("Finished impoorting Contact Reasons");
					}
				});
				
				return result;
				}
			} else {
				return false;
			}
		}
	},
};
