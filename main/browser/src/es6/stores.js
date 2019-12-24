/// <reference path="../stores.d.ts" />

'use strict';

module.exports = /**
 * @type {import('../stores')}
 */
function (Reflux, Actions, IOs) {

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// SOCKET HANDLES ///////////////////////////////////////////////////////////////////////////////////////////////

		const IOptions = {
			reconnectionDelay: 		2500,
			reconnectionDelayMax:	10000,
			rememberUpgrade:		true,
		};

		function SockAuthRoom  (res) { LOG("ROOM | %s", res); 				 }
		function SockConnErr (error) { LOG('CONNECTION ERROR!!',     error); }
		function SockConnTO(timeout) { LOG('CONNECTION TIMEOUT!!', timeout); }
		function SockError	 (error) { LOG('SOCKET ERROR!!',         error); }
		function SockRConnErr(error) { Actions.App.disconnect({result:{code:4}}); }

		function hasIOs() {
			return (!!IOs && !!IOs.IO);
		}
		function chkIO(name) {
			try { return IOs[name].connected; } 
			catch(e) { return false; }
		}

		function runAccess() {
			if (hasIOs() && !chkIO('Access')) {

					console.log('RUNNING ACCESS...');
				
				IOs.Access = IOs.IO(`${NMESPC.host}/accessor`);
				if (!!IOs.Access) {

						console.log(`Connected to Accessor`);

					IOs.Access.on('connect',        Actions.App.connect);
					IOs.Access.on('room',           SockAuthRoom);
					IOs.Access.on('receive',        Actions.Data.receive);
					IOs.Access.on('disconnect',     Actions.App.disconnect);
						// IOs.Access.on('connet_error',    SockConnErr);
						// IOs.Access.on('connect_timeout',	SockConnErr);
						// IOs.Access.on('error',           SockConnErr);
					IOs.Access.on('reconnect_error',SockRConnErr);
				}
			}
		}
		function runAPI() {
			if (hasIOs() && !chkIO('API')) {
				
					console.log('RUNNING API...');

				IOs.API = IOs.IO(`${NMESPC.host}/rest`);
				if (!!IOs.API) {
					
						console.log(`Connected to API`);

					IOs.API.on('connect',         Actions.Content.build);
					IOs.API.on('receive',         Actions.Data.receive);
				}
			}
		}
		function runSocket() {
			if (hasIOs() && !chkIO('Socket')) {

					console.log('NMESPC:',NMESPC);
					console.log('RUNNING BUILD...');

				IOs.Socket = IOs.IO(`${NMESPC.host}/${NMESPC.name}`);
				if (!!IOs.Socket) {
					
						console.log(`Connected to Space, "${NMESPC.name}"`);

					Reflux.initStore(Stores.App(LOCKER));
					Reflux.initStore(Stores.Nav);
					Reflux.initStore(Stores.Content);
					Reflux.initStore(Stores.Data);

					IOs.Socket.on('connect',         Actions.Content.setup);
					IOs.Socket.on('state',           Actions.Content.state);
					IOs.Socket.on('receive',         Actions.Data.receive);
						// IOs.Socket.on('uploaded',        Actions.Data.receive);
						// ?????
							// IOs.Socket.on('connet_error',    SockConnErr);
							// IOs.Socket.on('connect_timeout', SockConnErr);
							// IOs.Socket.on('error',           SockConnErr);
				}
			}
		}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// VARIABLES ////////////////////////////////////////////////////////////////////////////////////////////////////
		
		const 	RError 	 = '/error';
		const 	RLogin 	 = '/auth/login';
		const 	RCheck 	 = '/auth/check';
		const 	RLogout  = '/auth/logout';
		const 	RReload  = '/auth/reload';
		const 	RRenew   = '/auth/renew';
		const 	RSave    = '/auth/save';
		const 	RRegen 	 = '/auth/regenerate';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// STORES ///////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * @type {FluxStores}
		 */
		const Stores = { 
			Apps: {}, 
			App: null, Nav: null, Content: null, Data: null, 
			Run: { Access: runAccess, API: runAPI,  Socket: runSocket },
			ISO: {}, 
		};

		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		// STORE.APP     ////////////////////////////////////////////////////////////////////////////////////////
			Stores.App 		= function App(LID) {
				if (!!!Stores.Apps[LID]) {
					/**
					 * @type {FluxStore.App}
					 * @augments FluxStore.App
					 * @this FluxStore.App
					 */
					Stores.Apps[LID] = class extends Reflux.Store {
						constructor		() {
							super(); let defaults = {
								ready: 		function () {
									var Store = Stores.Apps[LID].singleton.state,
										Chekd = !!Store.header.checked,
										Built = !!Store.content.built,
										Ident = !!Store.header.identified,
										Pause = !!Store.paused;
									return (Chekd && Built && !(!Ident && Pause));
								},
								status: 	1, // 1 = Welcome, 2 = Login, 3 = Expired, 4 = Disconnected
								paused: 	false,
								progress: 	0,
								page: 		{ num: 0, pth: [] },
								style: 		'',
								header: 		{
									title:		'',
									checked: 	true,
									identified: false,
									user: 		{
										Account: '--{{ACCOUNT}}--',
										Profile: {
											Photo: 	 '--{{PHOTO}}--',
											Name: 	 { 
												First: 	'--{{NAME.FIRST}}--', 
												Last: 	'--{{NAME.LAST}}--' 
											},
											Age: 	 0,
											Sex: 	'I',
											Email: 	'--{{EMAIL}}--', 
											Location: 	{ 
												City: 	'--{{LOCATION.CITY}}--', 
												Region: '--{{LOCATION.REGION}}--', 
												Country:'--{{LOCATION.COUNTRY}}--' 
											}
										},
										Scopes:  {},
										Token: 	 null
									},
									messages:	{},
									alerts:		{},
									admin:		{},
									searches: 	[],
								},
								content: 	{ built: false },
								footer: 	{
									credits: 	{
										author:  'Arian Johnson',
										company: 'eVectr Inc.',
										website: 'eVectr.com',
										contact: 'arian.johnson@evectr.com'
									},
									chats:		[]
								},
							};
							this.temps = FromJS(defaults);
							this.state = this.setInitialState(defaults);
							this.listenables = [Actions.App];
						}
						

						isIdentified 	() { return this.state.header.identified; }
						onConnect 		() { 
							this.updateStore({ status: 2 }); 
						}
						onPause 		(pause) { this.updateStore({ paused: !!pause }); }
						onProgress	 	(prog, extra) {
							var config = {}; extra = (extra||{});
							switch (true) {
								case !!!prog: 	config = { progress: 0 }; break;;
								default: 	  	config = {
													progress:	(prog+'%'),
													paused: 	(prog<100)
												};
							}; 	this.updateStore(Assign(config, extra));
						}
						onIdentify	 	(ret) {
							var THS = this, 
								loc = window.location,
								pay = ret.payload, 
								opt = pay.options, usr = {},
								qry = opt.query||opt.body,
								res = pay.result,
								nxt = res.next,
								rdr = null, dsp;
							!!nxt && IOs.Access.emit(nxt[0], nxt[1]);
							switch (qry.path) {
								case RLogin: 	usr = (pay.result.user||{});
												dsp = usr.Scopes.display_name;
												rdr = `/${dsp.toLowerCase()}`;
								case RCheck:	Stores.Run.API();
												THS.updateStore({
													status: 1, paused: false, 
													header: {
														identified: true, 
														checked: true,
														user: usr
												} 	}); 
												if (qry.path==RLogin&&!!rdr) {
													loc.href = rdr;
												};	break;;
								case RLogout: 	THS.onDisconnect(pay);
												loc.href = '/login';
												break;;
							};
						}
						onDisconnect 	(pay) {
							var code 	= (pay.result||{}).code,
								status 	= !isNaN(code),
								idented = this.isIdentified(),
								store 	= {
									paused: false, header: {
										identified: false, checked: true,
										user: this.temps.getIn(['header','user']).toJS()
									}, status: 2
								};
							if (status && (code!=3||idented)) store.status = code;
							this.updateStore(store);
						}
						getPage 		(path) {
							if (isNaN(parseInt(path))) {
								var nav = FromJS(this.state.content.nav);
								return nav.find(function (b) { return b.get('path')===path; })
										.get('page');
							} else { return path; }
						}
						getPath 		(path) {
							var nav = FromJS(this.state.content.nav),
								gtr = (isNaN(parseInt(path))?'path':'page');
							return TC(nav.find(function (b) { return b.get(gtr)===path; })
									.get('path')).match(/\b(\w+)/g);
						}

						setInitialState 	(defaults) {
							var dflts = FromJS(defaults),
								inits = FromJS(Stores.ISO),
								state = dflts.mergeDeep(inits);
							return state.toJS();
						}
						updateStore 		(value, receive) {
							this.secretlyUpdateStore(value);
							if (!!receive) return this.state;
						}
						secretlyUpdateStore (value) {
							let state, imval = FromJS(value||{});
							state = FromJS(this.state).mergeDeep(imval);
							this.setState(state.toJS());
							console.info('APP STATE UPDATED!!')
						}
						reset() { 
							this.state = this.temps.toJS(); 
						}
					}; Stores.Apps[LID].id = LID; 
				}; 	return Stores.Apps[LID];
			};

		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		// STORE.NAV     ////////////////////////////////////////////////////////////////////////////////////////

			/**
			 * @type {FluxStore.Nav}
			 * @augments FluxStore.Nav
			 * @this FluxStore.Nav
			 */
			Stores.Nav 		= class extends Reflux.Store {
				constructor		() {
					super(); this.listenables = [Actions.Nav];
				}

				onSelect 		(page) {
					// --------------------------------------------------------
					var app = Stores.Apps[LOCKER].singleton, start = NOW(),
						num = app.getPage(page), finish,
						pth = app.getPath(page), total,
						pge = {page:{num:num,pth:pth}},
						ste = this.state;

						console.log(ste)
					// --------------------------------------------------------
					app.secretlyUpdateStore(pge); 
					this.setState(pge);
					// --------------------------------------------------------
					finish = NOW(); total = ((finish-start)/1000);
					console.log('PAGE: %d (%s) | %ss', 
						ste.page.num, ste.page.pth, 
						total.toFixed(3))
				}

			}; Stores.Nav.id 		= 'Nav';

		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		// STORE.CONTENT ////////////////////////////////////////////////////////////////////////////////////////

			/**
			 * @type {FluxStore.Content}
			 * @augments FluxStore.Content
			 * @this FluxStore.Content
			 */
			Stores.Content 	= class extends Reflux.Store {

				constructor		() {
					super(); this.state = {};
					this.listenables = [Actions.Content];
				}
				
				onSetup 		() {
					try { var built = Stores.Apps[LOCKER].singleton.state.content.built;
						if (!!!built) IOs.Socket.emit('setup');
					} catch (e) { IOs.Socket.emit('setup'); }
				}
				onState 		(res) { 
					Stores.Run.Access(); 
					Stores.Apps[LOCKER].singleton.updateStore(res);
				}
				onBuild 		() {
					requestAnimationFrame(function () {
						console.log('Building...', LOCKER);
						Stores.Content.render(LOCKER);
					});
				}

			}; Stores.Content.id 	= 'Content';

		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		// STORE.DATA    ////////////////////////////////////////////////////////////////////////////////////////

			/**
			 * @type {FluxStore.Data}
			 * @augments FluxStore.Data
			 * @this FluxStore.Data
			 */
			Stores.Data 	= class extends Reflux.Store {

				constructor		() {
					super();
					this.prefix   	 = ["payload","result"];
					this.statDef 	 = FromJS({
						Request: {
							Emmitted: 	{},
							Received: 	{},
							State: 		{},
						},
						Time: {
							Start: 		 null,
							Calling: 	'0s',
							Iterating: 	'0s',
							Rendering: 	'0s',
							Total:  	'0s',
							End: 		 null,
						},
					});
					this.stats		 = { [RNotify]: {} };
					this.state 		 = { [RNotify]: {} };
					this.defaults 	 = { store: { status: 200, payload: {} } };
					this.temps 		 = Imm.fromJS({});
					this.jids 		 = {};
					this.listenables = [Actions.Data];
					this.lastPath    = null;
				}
				
				onAuth  		(point, data, noProg) {
					// console.log(point)
					this.time(data);
					!!!noProg && Actions.App.progress(99, { paused:true });
					requestAnimationFrame((function () {
						IOs.Access.emit(point, data);
					}).bind(this));
				}
				onSend  		(point, data, noProg) {
					console.log(point)
					this.time(data);
					requestAnimationFrame((function () {
						!!!noProg && Actions.App.progress(99);
						IOs.API.emit(point, data);
					}).bind(this));
				}
				onReceive 		(data) {
					var THS = this,
						opt = data.payload.options, 
						qry = opt.query||opt.body,
						pth = qry.path, id = qry.id, 
						ial = false, tme;
					// ---------
					switch (pth) {
						case RError: 	console.error("Error:", data);
										alert(data.payload.result.message);
										Actions.App.progress(100);
										break;;
						case RLogout:	if (pth==THS.lastPath) return;
						case RLogin: 	case RCheck: case RRegen:
										console.info("Identify:", data);
										Actions.App.identify(data);
										break;;
						default: 		ial = (pth==RNotify);
										tme = THS.lapse(id, data, ial);
										setTimeout(() => (
											THS.updateStoreIn(qry, data, tme, ial)
										), 	0);
										break;;
					};	THS.lastPath = pth;
				}

				is  			(old, nxt) {
					// ----------------------------------------------------
					return Imm.is(FromJS(old), FromJS(nxt))===true;
				}
				has  			(id) {
					try { return !!(this.state[id]||{}).stamp; }
					catch (e) { console.log(e); return false; }
				}

				poll 			(id) {
					if (this.has(id)) { 
						this.setState({ [id]: this.state[id] });
						return true;
					} else return false;
				}
				grab			(id, callback) {
					if (this.has(id)) { 
						callback(this.state[id]);
					};
				}
				place			(id, data = {}) {
					let THS = this, state = THS.state[id]||{};
					this.setState({ [id]: Assign(
						state, data, { stamp: new Date() }
					) 	});
				}
				clear 			(id) {
					this.setState({ [id]: { 
						stamp: new Date(), items: [] 
					} 	});
				}
				time			(data) {
					let {query,body} = data, id = (query||body).id;
					this.stats[id] = this.statDef.toJS();
					this.stats[id].Time.Start = NOW();
					this.stats[id].Request.Emmitted = data;
				}
				lapse 			(id, data, isAlert = false) {
					let rn = RNotify, stat = {}, str = 0, tme = 0;
					// ---
					if (!!isAlert) {
						stat = this.stats[rn][id] = this.statDef.toJS();
						stat.Time.Start = 0;
					} else {
						stat = this.stats[id];
					}
					// ---
					str = stat.Time.Start;
					tme = ((NOW() - str) / 1000);
					stat.Time.Calling = (tme.toFixed(3)+'s');
					stat.Request.Received = data.payload;
					// ---
					return tme;
				}

				setIn  			(qry, data, isAlert = false) {
					let THS = this, { id, to, at } = qry,
						dta = FromJS(data).getIn(to||THS.prefix), 
						def = { 'object': Map({}), 'array': List([]) }, 
						ste = FromJS(THS.state), typ = IS(dta.toJS()), 
						nvl = def[typ], res = {}, alr = [];
					// -------------------------------------------------
					try { 
						// ---------------------------------------------
							// console.log({ 
								// DATA: 	dta.toJS(),
								// STRE: 	ste.getIn([id],nvl).toJS(),
								// MRGE: 	ste.getIn([id],nvl)
											// .mergeDeep(dta)
											// .toJS(),
							// });
							// res = 	ste.setIn([id], 
										// ste	.getIn([id],nvl)
											// .mergeDeep(dta)
									// ).toJS();
							!!isAlert && (alr = [RNotify]);
							res = ste.setIn([...alr,id], Map({
								stamp: new Date(), 
								items: dta,
							}	)	).toJS();
						// ---------------------------------------------
							return res;
					} catch (e) { console.log(e); return null; }
				}
				updateStoreIn  	(qry, data, dur, isAlert = false) {
					var THS = this, res = {}, iT, rT, fT, sT = NOW();
					// -------------------------------------------------
						res = this.setIn(qry, data, isAlert);
							// if (!!!res) { Actions.App.progress(100); return; }
						iT  = NOW(-sT, 1000);
					// -------------------------------------------------
						sT  = NOW(); THS.setState(res);
						rT  = NOW(-sT, 1000); fT = (dur+iT+rT);
					// --------------------------------------------------
						THS.setStats(qry.id, qry.path, iT, rT, fT, res, isAlert);
					// -------------------------------------------------
				}

				setStats 		(id, path, iterTime, rendTime, fullTime, state, isAlert = false) {
					var stats = (!!isAlert?this.stats[RNotify]:this.stats)[id], 
						LG    = this.logStore;
					if (!!!stats) return;
					setTimeout(function () {
						stats.Time.Iterating 	= iterTime.toFixed(3)+'s';
						stats.Time.Rendering 	= rendTime.toFixed(3)+'s';
						stats.Time.Total 		= fullTime.toFixed(3)+'s';
						stats.Time.End 			= NOW();
						stats.Request.State 	= FromJS(state).toJS();
						LG(path, stats);
					}, 	0);
				}
				logStore (id, data, ...args) {
					// ----------------------------------------
					console.info("[#%s]:", id, data, ...args);
				}

				toJS  			(obj) {
					try { return obj.toJS(); }
					catch (er) { return obj; }
				}

			}; Stores.Data.id 		= 'Data';
	
	return Stores;
};
