/// <reference path="../node_modules/dffrnt.confs/types/authpoints.cfg.d.ts" />
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

	const { 
		RouteAU, GNHeaders, GNParam, GNDescr, PType, PT, _Methods
	} = require('dffrnt.confs'); 

/////////////////////////////////////////////////////////////////////////////////////////////
// EXPORT

	/** 
	 * @return {CFG.AuthPoints}
	 */
	module.exports = function () { 
		/////////////////////////////////////////////////////////////////////////////////////
		let SSIG = "stripe-signature";
		/////////////////////////////////////////////////////////////////////////////////////
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
						Limits: 	['Tries/Second'],
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
										Format 	(cls) { return cls.password; },
										Default:'', 
									}),
									Remember: new GNParam({
										Name: 	'Remember',	
										Desc: 	new GNDescr({ type: PT.Bool, description: "Remember this Session for a while", required: false, to: 'query' }),
										Format 	(cls) { return cls.remember; },
										Default:false, 
									}),
								},
							},
							Proc: 		{
								Decrypt: 	 true,
								Error: 		 'ERROR',
								async NoData (req) {
									let THS  = this, SSD = {},
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
										acct = user.account;
										user = await THS.Profile(acct, true);
										LG.Server(sid, 'Loaded', acct, 'green');
										return {
											send: [
												MSG.LOADED.temp, 
												user, null, STATE('IN', bdy)
											],
											next: ['Save', { 
												id:		user.UID, 
												acct:	user.Account, 
												token:	user.Token, 
												__rem:  bdy.remember,
											}],
										}; 
									// Handle Errors --------------------------------------------
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.body]; 
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
										ret = [MSG.RESTORED.temp, user, null, STATE('IN', bdy)];
										if (acct == bdy.username) {
											ret[1] = await THS.Profile(acct, true);
											LG.Server(sid, 'Restored', acct, 'green');
											return { send: ret, next: ['Renew'] };
										} else {
											return { send: ret, next: ['Regenerate'] };
										}
									// Handle Errors --------------------------------------------
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.body]; 
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
											if (k=='token'&&!v.Desc.type.sanitize({ head, user }))
												throw [MSG.TOKEN, SSD, (acct||''), bdy];
										});
										if (!!bdy.cliip) {
											bdy.cliip = TLS.Lng2IP(req.connection.remoteAddress);
										};
										if (!!spc.match(/^\/(?:add|edit|dump)/)) {
											prm.uids = uid; bdy.single = 'true';
											if (!!!prm.uid && !!!bdy.uid) {
												bdy.uid  = uid;
											}
										};
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
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.body]; 
									}
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
												throw [MSG.EXISTS, SSD, (acct||''), STATE('OUT', bdy)]
											default:
												THS.sid = req.sessionID;
												user = await THS.Profile(acct, true);
												return {
													send: [
														MSG.PROFILE.temp, 
														user, acct, 
														// STATE('IN', bdy),
														bdy,
													],
													next: ['Renew'],
												};
										};	
									// Handle Errors --------------------------------------------
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.body]; 
									}
								}
							}
						};	},
						POST        () { return 'MIDDLEWARE'; },
					}),
					// ======================================================================
					Sessions: 	new RouteAU({ 
						Methods: 	[
							..._Methods.GET,
							..._Methods.DELETE,
						],
						Scheme: 	'/',
						GET		() { return {
							Scheme: 	 '/',
							Doc: 		{
								Headers: 	{ Token: Docs.Headers.Token },
								Examples: 	{ "/": "Retrieve all User Sessions", },
								Params: 	{},
							},
							Proc: 		{
								Error: 		 'ERROR',
								NoData: 	 'INVALID',
								async Main   (req) { try {
									let ssID = req.sessionID,
										sess = req.session,
										uid  = sess.user.id,
										bdy  = req.query,
										rslt;
									// Get Session List ---------------------------------- //
									rslt = (await Sessions.List(uid))
											.map(ss => (ss.current=(ss.ssid==ssID),ss))
											.sort((a,b) => (
												a.since<b.since?1:(a.since>b.since?-1:0)
											));
									// Return -------------------------------------------- //
									return {
										send: [MSG.VALID.temp,rslt,null,bdy],
										next: ['Renew'],
									};
									// Handle Errors ------------------------------------- //
								} catch (err) { 
									if (Array.isArray(err)) throw err;
									else throw [MSG.ERROR, {}, {}, req.body]; 
								}	}
							}
						};	},
						DELETE	() { return {
							Scheme: 	'/:ssid([\\w_-]{32})/',
							Doc: 		{
								Headers: 	{ 
									Token: Docs.Headers.Token 
								},
								Examples: 	{ 
									"/:ssid:rE3HwYO6dPLv_6yE9IAXwvEY6itZ1NlU": "Delete a User Session", 
								},
								Params: 	{
									SSID: new GNParam({
										Name: 	'Session ID', 
										Format 	(cls) { return cls.ssid; }, 
										Desc: 	new GNDescr({ 
											type: PT.Text({ regex: /^[\w_]{32}$/ }), 
											description: "The ID of the Session you'd like to delete.", 
											required: true, to: 'param' 
										}), 
										Default:null, 
									}),
									Invert: new GNParam({
										Name: 	'Invert', 
										Format 	(cls) { return cls.invert; },
										Desc: 	new GNDescr({ 
											type: PT.Bool, 
											description: "If {{true}}, removes all sessions except for {{SSID}}", 
											required: false, to: 'query' 
										}),
										Default:false, 
									}),
								},
							},
							Proc: 		{
								Error: 		 'ERROR',
								NoData: 	 'INVALID',
								async Main   (req) { try {
									let ssID = req.sessionID, 
										sess = req.session, 
										uid  = sess.user.id, 
										prm  = req.params, 
										bdy  = req.body, 
										rslt;
									// Remove the Session(s)
									if (bdy.invert) {
										await Sessions.Rem(uid, ssID, true);
									} else if (ssID != prm.ssid) {
										await Sessions.Rem(uid, prm.ssid, false);
									};
									// Get List of Sessions
									rslt = (await Sessions.List(uid))
											.map(ss => (ss.current=(ss.ssid==ssID),ss))
											.sort((a,b) => (
												a.since<b.since?1:(a.since>b.since?-1:0)
											));
									// Return
									return {
										send: [MSG.VALID.temp,rslt,null,bdy],
										next: ['Renew'],
									};
									// Handle Errors --------------------------------------------
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.query]; 
									}
								}
							}
						};	}
					}),
					// ======================================================================
					Alerts: 	new RouteAU({ 
						Methods: 	[
							..._Methods.POST,
							..._Methods.GET,
							..._Methods.DELETE,
						],
						Scheme: 	'/',
						POST		() { return {
							Doc: 		{
								Headers: 	{ Token: Docs.Headers.Token },
								Examples: 	{ "/": "Retrieve all User Sessions", },
								Params: 	{},
							},
							Proc: 		{
								Error: 		 'ERROR',
								NoData: 	 'INVALID',
								async Main   (req) { try {
									let sess = req.session,
										acct = sess.user.acct,
										bdy  = req.body,
										rslt;
									// Get Alerts List ----------------------------------- //
									rslt = await Alert.Post(acct, {
										type: bdy.type, 
										payload: JSON.parse(bdy.content||{})
									});
									// Return -------------------------------------------- //
									return {
										send: [MSG.VALID.temp,rslt,null,bdy],
										next: ['Renew'],
									};
									// Handle Errors ------------------------------------- //
								} catch (err) { 
									console.log(err)
									if (Array.isArray(err)) throw err;
									else throw [MSG.ERROR, false, {}, req.body]; 
								}	}
							}
						};	},
						GET		() { return {
							Doc: 		{
								Headers: 	{ Token: Docs.Headers.Token },
								Examples: 	{ "/": "Retrieve all User Sessions", },
								Params: 	{},
							},
							Proc: 		{
								Error: 		 'ERROR',
								NoData: 	 'INVALID',
								async Main   (req) { try {
									let sess = req.session,
										acct = sess.user.acct,
										bdy  = req.query;
									// Get Alerts List ----------------------------------- //
									let rslt = await Alert.List(acct);
									// Return -------------------------------------------- //
									return {
										send: [MSG.VALID.temp,rslt,null,bdy],
										next: ['Renew'],
									};
									// Handle Errors ------------------------------------- //
								} catch (err) { 
									if (Array.isArray(err)) throw err;
									else throw [MSG.ERROR, {}, {}, req.body]; 
								}	}
							}
						};	},
						DELETE	() { return {
							Scheme: 	'/:alids([A-z0-9_;-]+(?!;))/',
							Doc: 		{
								Headers: 	{ 
									Token: Docs.Headers.Token 
								},
								Examples: 	{ 
									"/:alid:TJ7ymXXs;OJsP0OwU": "Delete a User Session", 
								},
								Params: 	{
									ALIDs: new GNParam({
										Name: 	'Session ID', 
										Format 	(cls) { return cls.alids; }, 
										Desc: 	new GNDescr({ 
											type: PT.L.Text({ join: ',' }),
											description: "The ID of the Session you'd like to delete.", 
											required: true, to: 'param' 
										}), 
										Default:[], 
									}),
								},
							},
							Proc: 		{
								Error: 		 'ERROR',
								NoData: 	 'INVALID',
								async Main   (req) { try {
									let sess = req.session, 
										acct = sess.user.acct, 
										prm  = req.params, 
										bdy  = req.body, 
										rslt = [], 
										alids;
									// Remove the Alert(s)
									alids = prm.alids.match(/([\w_-]{8})(?:(?=;)|$)/g);
									if (!!alids) {
										await Alert.Acknowledge(alids);
										// Get Alerts List 
										rslt = Alert.List(acct);
									};
									// Return
									return {
										send: [MSG.VALID.temp,rslt,null,bdy],
										next: ['Renew'],
									};
									// Handle Errors --------------------------------------------
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.query]; 
									}
								}
							}
						};	}
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
									} catch (err) { 
										if (Array.isArray(err)) throw err;
										else throw [MSG.ERROR, {}, {}, req.query]; 
									}
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
