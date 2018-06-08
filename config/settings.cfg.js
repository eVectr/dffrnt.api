
module.exports = {
	Debug: 	true,
	Port: 	3001,
	Public: {
		Folder:  'public',
		Age: 	 365*86400,
		Matcher: /\?(?:\w+=.+)$/,
		Headers: null,
	},
	Session: {
		Secret: "jy24xsFDWU5jYnZ2MNFmtCvJOhcDoxlL",
		Age: 	(((3600*1000)*24)*30),
		REDIS: 	{
			Host: 		'localhost',
			Port: 		6379,
			Password: 	'Pion33r247',
		},
		Auth: {
			Flush: 	false,
			SQL: 	{
				Login: 	 "SELECT email_address, user_pass FROM users WHERE email_address = ?",
				Profile: "SELECT * FROM users WHERE email_address = ?"
			},
			Format: {
				Account: 'email_address',
				Profile: "*",
				Scopes: [
					'user_id',
					'display_name',
					'email_address',
					'user_pass',
				]
			}
		}
	}
};