

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (Reflux, Actions, IOs) {

	var IOptions = {
		reconnectionDelay: 2500,
		reconnectionDelayMax: 10000,
		rememberUpgrade: true
	};

	function SockAuthRoom(res) {
		LOG("ROOM | %s", res);
	}
	function SockConnErr(error) {
		LOG('CONNECTION ERROR!!', error);
	}
	function SockConnTO(timeout) {
		LOG('CONNECTION TIMEOUT!!', timeout);
	}
	function SockError(error) {
		LOG('SOCKET ERROR!!', error);
	}
	function SockRConnErr(error) {
		Actions.App.disconnect({ result: { code: 4 } });
	}

	function hasIOs() {
		return !!IOs && !!IOs.IO;
	}
	function chkIO(name) {
		try {
			return IOs[name].connected;
		} catch (e) {
			return false;
		}
	}

	function runAccess() {
		if (hasIOs() && !chkIO('Access')) {

			console.log('RUNNING ACCESS...');

			IOs.Access = IOs.IO(NMESPC.host + '/accessor');
			if (!!IOs.Access) {

				console.log('Connected to Accessor');

				IOs.Access.on('connect', Actions.App.connect);
				IOs.Access.on('room', SockAuthRoom);
				IOs.Access.on('receive', Actions.Data.receive);
				IOs.Access.on('disconnect', Actions.App.disconnect);

				IOs.Access.on('reconnect_error', SockRConnErr);
			}
		}
	}
	function runAPI() {
		if (hasIOs() && !chkIO('API')) {

			console.log('RUNNING API...');

			IOs.API = IOs.IO(NMESPC.host + '/rest');
			if (!!IOs.API) {

				console.log('Connected to API');

				IOs.API.on('connect', Actions.Content.build);
				IOs.API.on('receive', Actions.Data.receive);
			}
		}
	}
	function runSocket() {
		if (hasIOs() && !chkIO('Socket')) {

			console.log('NMESPC:', NMESPC);
			console.log('RUNNING BUILD...');

			IOs.Socket = IOs.IO(NMESPC.host + '/' + NMESPC.name);
			if (!!IOs.Socket) {

				console.log('Connected to Space, "' + NMESPC.name + '"');

				Reflux.initStore(Stores.App(LOCKER));
				Reflux.initStore(Stores.Nav);
				Reflux.initStore(Stores.Content);
				Reflux.initStore(Stores.Data);

				IOs.Socket.on('connect', Actions.Content.setup);
				IOs.Socket.on('state', Actions.Content.state);
				IOs.Socket.on('receive', Actions.Data.receive);
			}
		}
	}

	var RError = '/error';
	var RLogin = '/auth/login';
	var RCheck = '/auth/check';
	var RLogout = '/auth/logout';
	var RReload = '/auth/reload';
	var RRenew = '/auth/renew';
	var RSave = '/auth/save';
	var RRegen = '/auth/regenerate';

	var Stores = {
		Apps: {},
		App: null, Nav: null, Content: null, Data: null,
		Run: { Access: runAccess, API: runAPI, Socket: runSocket },
		ISO: {}
	};

	Stores.App = function App(LID) {
		if (!!!Stores.Apps[LID]) {
			Stores.Apps[LID] = function (_Reflux$Store) {
				_inherits(_class, _Reflux$Store);

				function _class() {
					_classCallCheck(this, _class);

					var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

					var defaults = {
						ready: function ready() {
							var Store = Stores.Apps[LID].singleton.state,
							    Chekd = !!Store.header.checked,
							    Built = !!Store.content.built,
							    Ident = !!Store.header.identified,
							    Pause = !!Store.paused;
							return Chekd && Built && !(!Ident && Pause);
						},
						status: 1,
						paused: false,
						progress: 0,
						page: { num: 0, pth: [] },
						style: '',
						header: {
							title: '',
							checked: true,
							identified: false,
							user: {
								Account: '--{{ACCOUNT}}--',
								Profile: {
									Photo: '--{{PHOTO}}--',
									Name: {
										First: '--{{NAME.FIRST}}--',
										Last: '--{{NAME.LAST}}--'
									},
									Age: 0,
									Sex: 'I',
									Email: '--{{EMAIL}}--',
									Location: {
										City: '--{{LOCATION.CITY}}--',
										Region: '--{{LOCATION.REGION}}--',
										Country: '--{{LOCATION.COUNTRY}}--'
									}
								},
								Scopes: {},
								Token: null
							},
							messages: {},
							alerts: {},
							admin: {},
							searches: []
						},
						content: { built: false },
						footer: {
							credits: {
								author: 'Arian Johnson',
								company: 'eVectr Inc.',
								website: 'eVectr.com',
								contact: 'arian.johnson@evectr.com'
							},
							chats: []
						}
					};
					_this.temps = FromJS(defaults);
					_this.state = _this.setInitialState(defaults);
					_this.listenables = [Actions.App];
					return _this;
				}

				_createClass(_class, [{
					key: 'isIdentified',
					value: function isIdentified() {
						return this.state.header.identified;
					}
				}, {
					key: 'onConnect',
					value: function onConnect() {
						this.updateStore({ status: 2 });
					}
				}, {
					key: 'onPause',
					value: function onPause(pause) {
						this.updateStore({ paused: !!pause });
					}
				}, {
					key: 'onProgress',
					value: function onProgress(prog, extra) {
						var config = {};extra = extra || {};
						switch (true) {
							case !!!prog:
								config = { progress: 0 };break;;
							default:
								config = {
									progress: prog + '%',
									paused: prog < 100
								};
						};this.updateStore(Assign(config, extra));
					}
				}, {
					key: 'onIdentify',
					value: function onIdentify(ret) {
						var THS = this,
						    loc = window.location,
						    pay = ret.payload,
						    opt = pay.options,
						    usr = {},
						    qry = opt.query || opt.body,
						    res = pay.result,
						    nxt = res.next,
						    rdr = null,
						    dsp;
						!!nxt && IOs.Access.emit(nxt[0], nxt[1]);
						switch (qry.path) {
							case RLogin:
								usr = pay.result.user || {};
								dsp = usr.Scopes.display_name;
								rdr = '/' + dsp.toLowerCase();
							case RCheck:
								Stores.Run.API();
								THS.updateStore({
									status: 1, paused: false,
									header: {
										identified: true,
										checked: true,
										user: usr
									} });
								if (qry.path == RLogin && !!rdr) {
									loc.href = rdr;
								};break;;
							case RLogout:
								THS.onDisconnect(pay);
								loc.href = '/login';
								break;;
						};
					}
				}, {
					key: 'onDisconnect',
					value: function onDisconnect(pay) {
						var code = (pay.result || {}).code,
						    status = !isNaN(code),
						    idented = this.isIdentified(),
						    store = {
							paused: false, header: {
								identified: false, checked: true,
								user: this.temps.getIn(['header', 'user']).toJS()
							}, status: 2
						};
						if (status && (code != 3 || idented)) store.status = code;
						this.updateStore(store);
					}
				}, {
					key: 'getPage',
					value: function getPage(path) {
						if (isNaN(parseInt(path))) {
							var nav = FromJS(this.state.content.nav);
							return nav.find(function (b) {
								return b.get('path') === path;
							}).get('page');
						} else {
							return path;
						}
					}
				}, {
					key: 'getPath',
					value: function getPath(path) {
						var nav = FromJS(this.state.content.nav),
						    gtr = isNaN(parseInt(path)) ? 'path' : 'page';
						return TC(nav.find(function (b) {
							return b.get(gtr) === path;
						}).get('path')).match(/\b(\w+)/g);
					}
				}, {
					key: 'setInitialState',
					value: function setInitialState(defaults) {
						var dflts = FromJS(defaults),
						    inits = FromJS(Stores.ISO),
						    state = dflts.mergeDeep(inits);
						return state.toJS();
					}
				}, {
					key: 'updateStore',
					value: function updateStore(value, receive) {
						this.secretlyUpdateStore(value);
						if (!!receive) return this.state;
					}
				}, {
					key: 'secretlyUpdateStore',
					value: function secretlyUpdateStore(value) {
						var state = void 0,
						    imval = FromJS(value || {});
						state = FromJS(this.state).mergeDeep(imval);
						this.setState(state.toJS());
						console.info('APP STATE UPDATED!!');
					}
				}, {
					key: 'reset',
					value: function reset() {
						this.state = this.temps.toJS();
					}
				}]);

				return _class;
			}(Reflux.Store);Stores.Apps[LID].id = LID;
		};return Stores.Apps[LID];
	};

	Stores.Nav = function (_Reflux$Store2) {
		_inherits(_class2, _Reflux$Store2);

		function _class2() {
			_classCallCheck(this, _class2);

			var _this2 = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this));

			_this2.listenables = [Actions.Nav];
			return _this2;
		}

		_createClass(_class2, [{
			key: 'onSelect',
			value: function onSelect(page) {
				var app = Stores.Apps[LOCKER].singleton,
				    start = NOW(),
				    num = app.getPage(page),
				    finish,
				    pth = app.getPath(page),
				    total,
				    pge = { page: { num: num, pth: pth } },
				    ste = this.state;

				console.log(ste);

				app.secretlyUpdateStore(pge);
				this.setState(pge);

				finish = NOW();total = (finish - start) / 1000;
				console.log('PAGE: %d (%s) | %ss', ste.page.num, ste.page.pth, total.toFixed(3));
			}
		}]);

		return _class2;
	}(Reflux.Store);Stores.Nav.id = 'Nav';

	Stores.Content = function (_Reflux$Store3) {
		_inherits(_class3, _Reflux$Store3);

		function _class3() {
			_classCallCheck(this, _class3);

			var _this3 = _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).call(this));

			_this3.state = {};
			_this3.listenables = [Actions.Content];
			return _this3;
		}

		_createClass(_class3, [{
			key: 'onSetup',
			value: function onSetup() {
				try {
					var built = Stores.Apps[LOCKER].singleton.state.content.built;
					if (!!!built) IOs.Socket.emit('setup');
				} catch (e) {
					IOs.Socket.emit('setup');
				}
			}
		}, {
			key: 'onState',
			value: function onState(res) {
				Stores.Run.Access();
				Stores.Apps[LOCKER].singleton.updateStore(res);
			}
		}, {
			key: 'onBuild',
			value: function onBuild() {
				requestAnimationFrame(function () {
					console.log('Building...', LOCKER);
					Stores.Content.render(LOCKER);
				});
			}
		}]);

		return _class3;
	}(Reflux.Store);Stores.Content.id = 'Content';

	Stores.Data = function (_Reflux$Store4) {
		_inherits(_class4, _Reflux$Store4);

		function _class4() {
			_classCallCheck(this, _class4);

			var _this4 = _possibleConstructorReturn(this, (_class4.__proto__ || Object.getPrototypeOf(_class4)).call(this));

			_this4.prefix = ["payload", "result"];
			_this4.statDef = FromJS({
				Request: {
					Emmitted: {},
					Received: {},
					State: {}
				},
				Time: {
					Start: null,
					Calling: '0s',
					Iterating: '0s',
					Rendering: '0s',
					Total: '0s',
					End: null
				}
			});
			_this4.stats = _defineProperty({}, RNotify, {});
			_this4.state = _defineProperty({}, RNotify, {});
			_this4.defaults = { store: { status: 200, payload: {} } };
			_this4.temps = Imm.fromJS({});
			_this4.jids = {};
			_this4.listenables = [Actions.Data];
			_this4.lastPath = null;
			return _this4;
		}

		_createClass(_class4, [{
			key: 'onAuth',
			value: function onAuth(point, data, noProg) {
				this.time(data);
				!!!noProg && Actions.App.progress(99, { paused: true });
				requestAnimationFrame(function () {
					IOs.Access.emit(point, data);
				}.bind(this));
			}
		}, {
			key: 'onSend',
			value: function onSend(point, data, noProg) {
				console.log(point);
				this.time(data);
				requestAnimationFrame(function () {
					!!!noProg && Actions.App.progress(99);
					IOs.API.emit(point, data);
				}.bind(this));
			}
		}, {
			key: 'onReceive',
			value: function onReceive(data) {
				var THS = this,
				    opt = data.payload.options,
				    qry = opt.query || opt.body,
				    pth = qry.path,
				    id = qry.id,
				    ial = false,
				    tme;

				switch (pth) {
					case RError:
						console.error("Error:", data);
						alert(data.payload.result.message);
						Actions.App.progress(100);
						break;;
					case RLogout:
						if (pth == THS.lastPath) return;
					case RLogin:case RCheck:case RRegen:
						console.info("Identify:", data);
						Actions.App.identify(data);
						break;;
					default:
						ial = pth == RNotify;
						tme = THS.lapse(id, data, ial);
						setTimeout(function () {
							return THS.updateStoreIn(qry, data, tme, ial);
						}, 0);
						break;;
				};THS.lastPath = pth;
			}
		}, {
			key: 'is',
			value: function is(old, nxt) {
				return Imm.is(FromJS(old), FromJS(nxt)) === true;
			}
		}, {
			key: 'has',
			value: function has(id) {
				try {
					return !!(this.state[id] || {}).stamp;
				} catch (e) {
					console.log(e);return false;
				}
			}
		}, {
			key: 'poll',
			value: function poll(id) {
				if (this.has(id)) {
					this.setState(_defineProperty({}, id, this.state[id]));
					return true;
				} else return false;
			}
		}, {
			key: 'grab',
			value: function grab(id, callback) {
				if (this.has(id)) {
					callback(this.state[id]);
				};
			}
		}, {
			key: 'place',
			value: function place(id) {
				var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				var THS = this,
				    state = THS.state[id] || {};
				this.setState(_defineProperty({}, id, Assign(state, data, { stamp: new Date() })));
			}
		}, {
			key: 'clear',
			value: function clear(id) {
				this.setState(_defineProperty({}, id, {
					stamp: new Date(), items: []
				}));
			}
		}, {
			key: 'time',
			value: function time(data) {
				var query = data.query,
				    body = data.body,
				    id = (query || body).id;

				this.stats[id] = this.statDef.toJS();
				this.stats[id].Time.Start = NOW();
				this.stats[id].Request.Emmitted = data;
			}
		}, {
			key: 'lapse',
			value: function lapse(id, data) {
				var isAlert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

				var rn = RNotify,
				    stat = {},
				    str = 0,
				    tme = 0;

				if (!!isAlert) {
					stat = this.stats[rn][id] = this.statDef.toJS();
					stat.Time.Start = 0;
				} else {
					stat = this.stats[id];
				}

				str = stat.Time.Start;
				tme = (NOW() - str) / 1000;
				stat.Time.Calling = tme.toFixed(3) + 's';
				stat.Request.Received = data.payload;

				return tme;
			}
		}, {
			key: 'setIn',
			value: function setIn(qry, data) {
				var isAlert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
				var THS = this,
				    id = qry.id,
				    to = qry.to,
				    at = qry.at,
				    dta = FromJS(data).getIn(to || THS.prefix),
				    def = { 'object': Map({}), 'array': List([]) },
				    ste = FromJS(THS.state),
				    typ = IS(dta.toJS()),
				    nvl = def[typ],
				    res = {},
				    alr = [];
				try {
					!!isAlert && (alr = [RNotify]);
					res = ste.setIn([].concat(_toConsumableArray(alr), [id]), Map({
						stamp: new Date(),
						items: dta
					})).toJS();

					return res;
				} catch (e) {
					console.log(e);return null;
				}
			}
		}, {
			key: 'updateStoreIn',
			value: function updateStoreIn(qry, data, dur) {
				var isAlert = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

				var THS = this,
				    res = {},
				    iT,
				    rT,
				    fT,
				    sT = NOW();

				res = this.setIn(qry, data, isAlert);

				iT = NOW(-sT, 1000);

				sT = NOW();THS.setState(res);
				rT = NOW(-sT, 1000);fT = dur + iT + rT;

				THS.setStats(qry.id, qry.path, iT, rT, fT, res, isAlert);
			}
		}, {
			key: 'setStats',
			value: function setStats(id, path, iterTime, rendTime, fullTime, state) {
				var isAlert = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

				var stats = (!!isAlert ? this.stats[RNotify] : this.stats)[id],
				    LG = this.logStore;
				if (!!!stats) return;
				setTimeout(function () {
					stats.Time.Iterating = iterTime.toFixed(3) + 's';
					stats.Time.Rendering = rendTime.toFixed(3) + 's';
					stats.Time.Total = fullTime.toFixed(3) + 's';
					stats.Time.End = NOW();
					stats.Request.State = FromJS(state).toJS();
					LG(path, stats);
				}, 0);
			}
		}, {
			key: 'logStore',
			value: function logStore(id, data) {
				var _console;

				for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
					args[_key - 2] = arguments[_key];
				}

				(_console = console).info.apply(_console, ["[#%s]:", id, data].concat(args));
			}
		}, {
			key: 'toJS',
			value: function toJS(obj) {
				try {
					return obj.toJS();
				} catch (er) {
					return obj;
				}
			}
		}]);

		return _class4;
	}(Reflux.Store);Stores.Data.id = 'Data';

	return Stores;
};