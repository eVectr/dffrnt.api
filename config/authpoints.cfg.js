
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
			IN   = { path: '/auth/login'  },
			SSIG = "stripe-signature";
		return { // DO NOT CHANGE/REMOVE!!!
			// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			__DEFAULTS: 	{
				Headers: 	{
					[SSIG]: new GNParam({
						Name: 	SSIG,	
						Desc: 	new GNDescr({ 
							type: 	new PType({ 
										name: 'SSIG', type: 'String', sanitizers(v) {
											let { head } = v, sig = head[SSIG];
											return sig==Plugins.Stripe.Signature;
									} 	}), 
							description: "A verification {{Signature}} for Stripe™ messages", 
							required: true, 
							to: 'header'
						}),
						Format 	() {},
						Default:'', 
					}),
				},
			},
			// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			Auth: 		{
				Actions: 	{
					// ======================================================================
					Login: 		new RouteAU({
						Methods: 	Docs.Kinds.POST,
						Limits: 	['Tries/Day'],
						Scheme: 	'/',
						POST		() { return {
							Doc: 		{
								Examples: 	{ "/": "Starts the {{User}} Session", },
								Params: 	{
									Email:    new GNParam({
										Name: 	'Email',	
										Desc: 	new GNDescr({ type: PT.Email, description: "The account's {{Email}}", required: true, to: 'query' }),
										Format 	(cls) { return cls.email; },
										Default:'', 
									}),
									Password: new GNParam({
										Name: 	'Password',	
										Desc: 	new GNDescr({ type: PT.Password, description: "The account's {{Password}}", required: true, to: 'query' }),
										Format 	(cls) { return cls.password },
										Default:'', 
									}),
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
						};	}
					}),
					// ======================================================================
					Validate: 	new RouteAU({
						Methods: 	Docs.Kinds.MID,
						Scheme: 	'/',
						MID			() { return {
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
										Imm.Map(Docs.Headers).map((v,k)=>{
											// console.log('HEADER:', k)
											if (!v.Desc.type.sanitize({ head, user }))
												throw [MSG.TOKEN, SSD, (acct||''), bdy];
										})
										
										if (!!bdy.cliip) {
											bdy.cliip = TLS.Lng2IP(req.connection.remoteAddress);
										}
										if (!!spc.match(/^\/(?:add|edit|dump)/)) {
											prm.uids = uid; bdy.single = 'true';
											if (!!!prm.uid && !!!bdy.uid) {
												bdy.uid  = uid;
											}
										}
										return { 
											send: [
												MSG.VALID.temp, 
												{}, acct, bdy,
											], 
											next: ['Renew', {
												params: prm, body: bdy,
											}] 
										};
									// Handle Errors --------------------------------------------
									} catch (err) { console.log(err); throw err; }
								}
							}
						}; 	}
					}),
					// ======================================================================
					Check: 		new RouteAU({
						Methods: 	Docs.Kinds.MPOS,
						Scheme: 	'/',
						MID			() { return {
							Proc: 		{
								Error: 		'ERROR',
								NoData: 	'INVALID',
								async Main  (req) { 
									let THS  = this; try {
										let sess = req.session,
											sid  = req.sessionID,
											user = sess.user,
											acct = user.acct,
											bdy  = req.body,
											SSD  = { sessionID: sid };
										// ----------------------------------------------------------
										switch (true) {
											case !!!sess.user.token:
												throw [MSG.EXISTS, SSD, (acct||''), Assing(OUT, bdy)]
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
									} catch (err) { 
										console.log(err); throw err; 
									}
								}
							}
						};	},
						POST        () { return 'MIDDLEWARE'; },
					}),
					// ======================================================================
					Logout: 	new RouteAU({
						Methods: 	Docs.Kinds.POST,
						Scheme: 	'/',
						POST		() { return {
							Doc: 		{
								Headers: 	{ Token: Docs.Headers.Token },
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
						};	}
					}),
				},
				Errors: 	{ BAD_REQ: ['/'] }
			},
		};	
	};

/////////////////////////////////////////////////////////////////////////////////////////////
