
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
		const { createServer 	} = require(!!SSL?'https':'http');

	// Setup Requires
		let api 	= 	express(),
			server 	= 	createServer(!!SSL ? {
							key:  fs.readFileSync(`${ROOTD}/${SSL.Key}`,  'utf8'),
							cert: fs.readFileSync(`${ROOTD}/${SSL.Cert}`, 'utf8'),
						} : {}, api),
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
