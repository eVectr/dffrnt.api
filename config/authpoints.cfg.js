
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

	const { RouteAU, GNHeaders, GNParam, GNDescr, PT, PType } = require('dffrnt.confs').Definers(); 

/////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT
	module.exports = function () { 
		let OUT  = { path: '/auth/logout' },
			IN   = { path: '/auth/login'  };
		return { // DO NOT CHANGE/REMOVE!!!
			// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			Auth: 		{
				Actions: 	{
					// ======================================================================
					Login: 		new RouteAU({
						Scheme: 	'/',
						Limits: 	['Tries/Day'],
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Examples: 	{ "/": "Starts the {{User}} Session", },
							Params: 	{
								Email:    new GNDescr({ type: PT.Email,    description: "The account's {{Email}}",     required: true, to: 'param' }),
								Password: new GNDescr({ type: PT.Password, description: "The account's {{Password}}",  required: true, to: 'param' }),
							},
						},
						Proc: 		{
							Decrypt: 	 true,
							Error: 		 'ERROR',
							async NoData (req) {
								let THS  = this, SSD = {},
									sess = req.session,
									sid  = req.sessionID,
									bdy  = (req.body||{}), user,
									acct = bdy.username;
								// ----------------------------------------------------------
								function LogUserIn(THS, req) {
									return new Promise((resolve, reject) => {
										THS.Passer.authenticate('local-login', (err, user, info) => {
											let error = err || info;
											switch (true) {
												case !!error: reject([MSG.ERROR, error, null]);
												case !!!user: reject([MSG.EXISTS,   {}, acct]);
												default: resolve(user);
											};
										})(req);
									});
								}
								// ----------------------------------------------------------
								try {
									// ------------------------------------------------------
									SSD  = { sessionID: sid };
									user = await LogUserIn(THS, req);
									acct = user.email_address;
									user = await THS.Profile(acct, true);
									LG.Server(sid, 'Loaded', acct, 'green');
									return {
										send: [
											MSG.LOADED.temp, 
											user, null, Assign(IN, bdy)
										],
										next: ['Save', { 
											id:		user.Scopes.user_id, 
											acct:	user.Account, 
											token:	user.Token, 
										}],
									}; 
								// Handle Errors --------------------------------------------
								} catch (err) { 
									throw [MSG.LOGIN, SSD, (acct||''), Assign(OUT, bdy)]; 
								}
							},
							async Main   (req) {
								let THS  = this, SSD = {}; try {
									let sess = req.session,
										sid  = req.sessionID,
										user = sess.user,
										acct = user.acct,
										bdy  = req.body, ret;
									// ----------------------------------------------------------
									SSD  = { sessionID: sid };
									ret = [MSG.RESTORED.temp, user, null, Assign(IN, bdy)];
									if (acct == bdy.username) {
										ret[1] = await THS.Profile(acct, true);
										LG.Server(sid, 'Restored', acct, 'green');
										return { send: ret, next: ['Renew'] };
									} else {
										return { send: ret, next: ['Regenerate'] };
									}
								// Handle Errors --------------------------------------------
								} catch (err) { 
									console.log(err)
									throw [MSG.LOGIN, SSD, (acct||''), Assign(OUT, bdy)]; 
								}
							}
						}
					}),
					// ======================================================================
					Validate: 	new RouteAU({
						Methods: 	Docs.Kinds.MID,
						Doc: 		{ Headers: { token: Docs.Headers.Token }, },
						Proc: 		{
							Error: 		'NO_DELETE',
							NoData: 	'INVALID',
							async Main  (req) {
								let THS  = this; try {
									let sess = req.session,
										sid  = req.sessionID,
										user = sess.user,
										uid  = user.id,
										acct = user.acct,
										head = req.headers,
										spc  = req.originalUrl,
										bdy  = req.body||{},
										prm  = req.params||{},
										SSD  = { sessionID: sid };
									// ----------------------------------------------------------
									bdy.uuid = uid;
									switch (true) {
										case head.token!==user.token: 
											throw [MSG.TOKEN, SSD, (acct||''), bdy];
										case !!spc.match(/^\/(?:add|edit|dump)/): 
											prm.uids = uid; bdy.single = 'true';
										case !!!prm.uid && !!!bdy.uid: 
											bdy.uid  = uid;
										default: 
											return { 
												send: [
													MSG.VALID.temp, 
													{}, acct, bdy,
												], 
												next: ['Renew', {
													params: prm, body: bdy,
												}] 
											};
									}
								// Handle Errors --------------------------------------------
								} catch (err) { console.log(err); throw err; }
							}
						}
					}),
					// ======================================================================
					Check: 		new RouteAU({
						Methods: 	Docs.Kinds.MID,
						Proc: 		{
							Error: 		'ERROR',
							NoData: 	'INVALID',
							async Main  (req) {
								let THS  = this; try {
									let sess = req.session,
										sid  = req.sessionID,
										user = sess.user,
										acct = user.acct,
										head = req.headers,
										bdy  = req.body,
										SSD  = { sessionID: sid };
									// ----------------------------------------------------------
									switch (true) {
										case !!!sess.user.token:
											throw [MSG.EXISTS, SSD, (acct||''), Assing(OUT, bdy)];
										default:
											THS.sid = req.sessionID;
											user = await THS.Profile(acct, true);
											return {
												send: [
													MSG.PROFILE.temp, 
													user, acct, 
													Assign(IN, bdy),
												],
												next: ['Renew'],
											};
									};	
								// Handle Errors --------------------------------------------
								} catch (err) { console.log(err); throw err; }
							}
						}
					}),
					// ======================================================================
					Logout: 	new RouteAU({
						Scheme: 	'/',
						Methods: 	Docs.Kinds.POST,
						Doc: 		{
							Headers: 	{ token: Docs.Headers.Token },
							Examples: 	{ "/": "Ends the User Session", },
							Params: 	{},
						},
						Proc: 		{
							Error: 		 'ERROR',
							NoData: 	 'LOGIN',
							async Main   (req) {
								let THS  = this; try {
									let sess = req.session,
										sid  = req.sessionID, 
										bdy  = req.body,
										acct = sess.user.acct;
									// Notify client
									LG.Server(sid, 'Ending', acct, 'green');
									// Return
									return {
										send: [MSG.ENDED.temp,{Account:acct},null,bdy],
										next: ['Destroy'],
									};
								// Handle Errors --------------------------------------------
								} catch (err) { throw [MSG.ERROR, {}, {}, bdy]; }
							}
						}
					}),
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
		};	
	};

/////////////////////////////////////////////////////////////////////////////////////////////
