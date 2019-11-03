
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
			/* Set true to flush Redis */
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
				connstr  = 'mongodb://evbashton:r4nd0m@evportal.bashton.ca:27017/contact',
				result   = false;
			
			// CONNECTION RESULT
			result = await new Promise((resolve, reject) => mongoose.connect(connstr, err => {
				if (err) {console.log("PROMISE ERROR MONGOOOSEEE"); console.log(err); reject(false);}
				console.log('Mongoose connected')
				//console.log(mongoose)
				resolve(mongoose);
			}));
			// IF CONNECTRION OBJECT EMPTY
			if (Object.keys(result).length === 0) {
				console.log("Mongoose connection failed!");
				throw result;
			} else {
				//console.log("Mongo connection is valid");
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
							console.log("Func MongoPromiseFactory - Mongo Lookup failed for: "+name);
						}
						//if (type === "save") {}
					});
				};
				return {
					result,
					ContactCategory: (filter) => {
						return MongoPromiseFactory('ContactCategory', filter, "find");
					},
					SubmitContact: (data) => {
						console.log(data);
						return true;
					}
				};
			};
		},
		Mongo2: 		async function Mongo2() {
			let mongoose = require('mongoose'),
				//   [CONFIG]  COLLECTION SCHEMAS
				schemaDir = '../../../main/mongo/',
				connstr  = 'mongodb://evbashton:r4nd0m@evportal.bashton.ca:27017/contact',
				result   = false;
			
			// CONNECTION RESULT
			result = await new Promise((resolve, reject) => mongoose.connect(connstr, err => {
				if (err) {
					console.log("(2) Failed to connect to mongo");
					console.log(err);
					reject(err);
				}
				console.log('(2) Mongoose connected')
				resolve(mongoose);
			}));
			
			// IF Mongo object empty
			if (Object.keys(result).length === 0) {
				console.log("(2) Mongoose connection failed!");
				throw result;
			} else {
				let MongoQuery = (schemaFile, type, data) => {
					
					// data accepts a single dimentional key:value object (eg: {'col_1':'VALUE 1','col_2':'VALUE 2'})

					return new Promise((resolve, reject) => {
						let model = require(`${schemaDir}/${schemaFile}.js`);
						//let insertModel = new schema(data);

						// MONGO SAVE (insert)
						if(type === "save") {
							let insert = new model(data);
							console.log("Inserting mongo collection data ("+ schemaFile +")");
							console.log(data);
							insert.save(data, (error, result) => {
								if (!!error) reject(error);
								else resolve(result);
							});
						} else {
							console.log("Unkown MongoQuery type");
						}
					});
					
				};
				return {
					result,
					MongoResult: (schemaFile, type, data) => {
						return MongoQuery(schemaFile, type, data);
					},
				};
			};
		},
		// POPULATE STATIC MONGO DATA -- TO BE DEPRECATED / REVISED
		MongoImport: 		async function MongoImport() {
			// SET TO TRUE IF YOU WANT TO RE-IMPORT COLLECTIONS OR IF COLLECTIONS DONT ALREADY EXIST
			var remakeContactReasons = false;
			if(remakeContactReasons === true) {
				let mongoose = require('mongoose'),
				connstr  = 'mongodb://evbashton:r4nd0m@evportal.bashton.ca:27017/contact',
				sch_path  = '../../../main/mongo/',
				result   = false;
			
			// CONNECTION RESULT
			result = await new Promise((resolve, reject) => mongoose.connect(connstr, err => {
				if (err) {console.log("MONGOOSE PROMISE ERRoR"); console.log(err); reject(false);}
				console.log('(Import) Mongoose connected')
				//console.log(mongoose)
				resolve(mongoose);
			})	);
			// IF CONNECTION OBJECT EMPTY
			if (Object.keys(result).length === 0) {
				console.log("FAILED TO ESTABLISH MONGO CONNECTION");
				throw result;
			} else {
				console.log("MongoImport: Re-creating collections");

				let evContactReasonsModel = require(`${sch_path}/contactcategory.js`);
				
				// Drop all entries in evcontactreasons collection
				var dropCollection = evContactReasonsModel.bulkWrite([
					{
						deleteMany: {
							filter: {}
						}
					}
				]).then(res => {
					console.log("MongoImport: Removed "+ res.deletedCount+" documents from evcontactreasons collection.");
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
						console.log("MongoImport: Finished Impoorting Contact Reasons");
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
