
module.exports = {
	Debug: 		false,
	Port: 		8443,
	SSL:		{
		Cert: 	"../SSL/evectr.2018-2020.certificate.pem",
		Key: 	"../SSL/evectr.2018-2020.privatekey.pem",
	},
	Services: 	[
		'https://localhost:8443/gbl-accessor',
		'https://localhost:8443/gbl-rest',
	],
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
			Main:	'Client',
			Stores: [
				'Users',
				'Limits',
				'Lockers',
				'Messages',
				'Alerts',
				'Comments',
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
					"LEFT  JOIN locale_search         l ON d.location   = l.city_id",
					"LEFT  JOIN locale_regions        r ON l.region_id  = r.id",
					"LEFT  JOIN locale_countries      f ON l.country_id = f.id",
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
				"IP/Day": {
					total: 5000, method: 'all',
					lookup: ['connection.remoteAddress'],
				},
				"API/Second": {
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
				"TokenIP/Day": {
					total: 2500, method: 'all', 
					lookup: ['headers.token', 'connection.remoteAddress']
				}
			},
			Optional: {
				"New/Day": {
					total: 3,    method: 'post',
					lookup: ['connection.remoteAddress']
				},
				"Tries/Day": {
					total: 5,    method: 'post', 
					lookup: ['connection.remoteAddress']
				},
				"Tries/Second": {
					total: 5,     method: 'post', 
					lookup: ['connection.remoteAddress']
				},
				"Constant/Second": {
					total: 200,   method: 'get',
					lookup: ['connection.remoteAddress']
				}
			}
		}
	}
};
