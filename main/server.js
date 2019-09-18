
'use strict';

// ----------------------------------------------------------------------------------------------
// Handle Requires ------------------------------------------------------------------------------

	// System Requires
		// --------------------------------------------
		const { fs, ROOTD, LG, SetSettings } = require('dffrnt.utils');
		const { Settings } = require('dffrnt.confs').Init();
		SetSettings(Settings);

	// Route/Session Requires
		const 	express 		  = require('express');
		const { Routes, Session } = require('dffrnt.route');
		const { SSL, Port 		} = Settings;
		const { createServer 	} = require(!!SSL?'spdy':'http');

		function getSSL(file) { try {
			return fs.readFileSync(`${ROOTD}/${file}`,'utf8');
		} catch (e) { return null; } }

	// Setup Requires
		let api 	= 	express(),
			server 	= 	createServer(...(!!SSL ? [{
							ca:   		getSSL(SSL.CA),
							key:  		getSSL(SSL.Key),
							cert: 		getSSL(SSL.Cert),
							dhparam:	getSSL(SSL.DHP),
							minVersion: 'TLSv1.1',
							honorCipherOrder: true,
							ciphers: 	[
								"EECDH+ECDSA+AESGCM",
								"EECDH+aRSA+AESGCM",
								"EECDH+ECDSA+SHA512",
								"EECDH+ECDSA+SHA384",
								"EECDH+ECDSA+SHA256",
								"ECDH+AESGCM",
								"ECDH+AES256",
								"DH+AESGCM",
								"DH+AES256",
								"RSA+AESGCM",
								// "ECDHE-RSA-AES256-SHA384",
								// "DHE-RSA-AES256-SHA384",
								// "ECDHE-RSA-AES256-SHA256",
								// "DHE-RSA-AES256-SHA256",
								// "ECDHE-RSA-AES128-SHA256",
								// "DHE-RSA-AES128-SHA256",
								"HIGH",
								"!aNULL",
								"!eNULL",
								"!EXPORT",
								"!RSA",
								"!DES",
								"!RC4",
								"!MD5",
								"!PSK",
								"!SRP",
								"!CAMELLIA",
							].join(':'),
						}, api] : [api])),
			sess 	= 	Session(server, api);

// ----------------------------------------------------------------------------------------------
// Setup Server ---------------------------------------------------------------------------------

	// Start the DB Connection; Configure Routes
		// -----------------------------------------
		Routes.Init( api, express, sess, Settings );

	// The http server listens on port 3000
		process.on('uncaughtException', function (err) {
			if (!!err) {
				console.log(err)
				LG.Error(err.code || '????', 'ERROR', err.syscall || err.toString());
			} else {
				LG.Error(err.code || '????', 'ERROR', "Throws Error; Gives you nothing to work with.");
			}
		});
		server.timeout = 0;
		server.listen(Port, function (err) {
			if (err) throw err; LG.Server(Port, 'Listen', 'initialized', 'yellow');
		});

// ----------------------------------------------------------------------------------------------
