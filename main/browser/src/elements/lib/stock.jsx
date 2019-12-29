/// <reference path="./stock.d.tsx" />
'use strict';

/**
 * @typedef {{[props: string]: any}} ReactProps
 */

/**
 * Defines "_stock_" `Handlers`, `Components`, and `Mixins`.
 * @param {FluxComponents} COMPS The `global` `Components` bucket.
 * @void
 */
module.exports = function Comps(COMPS) {

	////////////////////////////////////////////////////////////////////////
	// CONSTANTS -----------------------------------------------------------

		const 	Actions 	= COMPS.Actions;
		const 	Reflux 		= COMPS.Reflux;
		const 	React 		= COMPS.React;
		const 	Frag 		= React.Fragment;
		const 	RDOM 		= COMPS.RDOM;

		const	STOCK		= {};
		const	RNotify		= '__notify__';

	////////////////////////////////////////////////////////////////////////
	// FIXINS --------------------------------------------------------------

		let RFLXC = Reflux.Component.prototype;
		if (!RFLXC.hasOwnProperty('componentDidMount')) {
			let _reflux = RFLXC.componentWillMount;
			delete RFLXC.componentWillMount;
			Object.defineProperties(RFLXC, {
				componentDidMount: {
					writable: true, enumerable: true, 
					value: function componentDidMount() {
						_reflux.bind(this)();
					}
				},
				mapState: {
					writable: true, enumerable: true, 
					value: function mapState(mappers = {}) {
						let THS = this, 
							chkStamp = (stmp)=>(!!stmp&&stmp>THS.state.stamp),
							maps = Imm.Map(mappers).map(m=>(
								m.isAlert=(!!m.isAlert),
								m.state=(m.state||(items=>items)).bind(THS),
								m.default=(m.default||{}), m
							));
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let which = { true:store[RNotify]||{}, false:store };
							return maps.reduce((prev, map, id) => { try {
								let { stamp, items = map.default } = (
										which[map.isAlert][id]||{}
									);
								return (chkStamp(stamp) ? Assign({  
									loaded: true, status: 'done', stamp
								},	map.state(items)) : prev);
							} catch (e) {
								console.error(e)
							} },	null)
						});
					}
				},
			});
		};

	////////////////////////////////////////////////////////////////////////
	// UTILITIES -----------------------------------------------------------

		/**
		 * Run actions that should only be executed in a Browser.
		 * @param {()=>void} callback A function that will execute Browser-specific actions.
		 * @void
		 */
		function onBrowser(callback) {
			!!MODE.Browser && callback();
		};
		/**
		 * A general, in-house `Logger` for `Components`.
		 * @param {string} task An identifier for the log-message.
		 * @void
		 */
		function onLog 		(task) {
			var LG = function () { console.log("%s%s %s", this.lvl, task, this.name); }
			// setTimeout(LG.bind({ lvl: this.lvl, name: this.name }), 0);
		}
		/**
		 * Carries out some default-initializations before hydrating a `Component` with new `Props`.
		 * @returns {ReactProps}
		 */
		function onInitial 	() {
			var nme = this.name, cnt = nme.appears('\\.');
			this.lvl = '\t'.dup(cnt); return this.props;
		}
		/**
		 * Carries out some default-actions when a `Component` is mounted.
		 * @void
		 */
		function onMounted 	() {
			let THS = this, { props, state } = THS,
				pmeta = props._meta||{}, nme, 
				smeta = state._meta||{}, cnt;
			// -------------------------------------------------------- //
				nme = THS.name; cnt = nme.appears('\\.');
				THS.lvl = '\t'.dup(cnt); 
				!!THS.addReceiver && THS.addReceiver();
				THS.componentLog("{} Mounted");
			// -------------------------------------------------------- //
				onBrowser(() => { try { 
					if (pmeta.defer!==false && smeta.load===false) {
						THS.setState({ _meta: Assign(
							{}, smeta||{}, { load: true }
						) 	});
				}	} catch(e) {}; });
			
		}
		/**
		 * Checks if `props` or `state` has been changed.
		 * @param {ReactProps} prev The old `props` or `state`.
		 * @param {ReactProps} next The new `props` or `state`.
		 * @returns {boolean}
		 */
		function onShouldChk(prev, next) {
			return FromJS(prev).equals(FromJS(next))===false;
		}
		/**
		 * Determines whether or not to re-render a `Component`.
		 * @param {ReactProps} nextProps The new props.
		 * @param {ReactProps} nextState The new state.
		 * @returns {boolean} `true`, if `nextProps` is different from the `Component's` current `props`.
		 */
		function onShouldB  (nextProps, nextState) {
			let { props, state } = this, result = {
					props: onShouldChk(props,nextProps),
					state: onShouldChk(state,nextState),
				};
			/* if (['PORTAL'].has(this.name)) {
				console.log(this.constructor.name, {
					result,
					props:     FromJS(props).toJS(),
					nextProps: FromJS(nextProps).toJS(),
					state:     FromJS(state).toJS(),
					nextState: FromJS(nextState).toJS(),
				})
			} */
			return (result.props || result.state)
		}
		/**
		 * Determines whether or not to re-render a Static `Component`.
		 * @param {ReactProps}  nextProps The new props.
		 * @param {ReactProps} _nextState The new state.
		 * @returns {boolean} `true`, if `nextProps` is different from the `Component's` current `props`.
		 */
		function onShouldP 	(nextProps, _nextState) {
			return onShouldChk(this.props,nextProps) === false;
		}
		/**
		 * Determines whether or not to re-render a Dynamic `Component`.
		 * @param {ReactProps} _nextProps The new props.
		 * @param {ReactProps} nextState The new state.
		 * @returns {boolean} `true`, if `nextState` is different from the `Component's` current `props`.
		 */
		function onShouldS 	(_nextProps, nextState) {
			return onShouldChk(this.state,nextState) === false;
		}
		/**
		 * An internal `logger` used for debugging renders.
		 * @void
		 */
		function onUpdate	() { this.componentLog("[] Updated"); }
		const 	 onShould 	= { B: onShouldB, P: onShouldP, S: onShouldS };

	////////////////////////////////////////////////////////////////////////
	// MIXINS --------------------------------------------------------------

		const Elements 	= COMPS.Elements;
		const MixBase  	= { 
			React: 	React.Component, 
			Pure: 	React.PureComponent, 
			Reflux: Reflux.Component 
		};

		COMPS.RNotify   = RNotify;
		COMPS.ExLinks 	= {};
		COMPS.qryOmit 	= Imm.List(['id','as','at','to','path','offset','kind']);

		COMPS.Tag 		= (tag) => {
			if (IS(tag)==='string') return tag;
			let From = [tag.from].concat(tag.name);
			return eval(`COMPS.Elements.${From.join('.')}`);
		};
		COMPS.Agnostic 	= (config, key) => {
			if (!!!config) return config;
			let tag    = config.tag,
				xerox  = !!config.xerox,
				props  = Assign({},config.props||{},{key:key}),
				childA = (v,i)=>(IS(v)==='string'?v:Agnostic(v,i)),
				xeroxA = (v,i) => Agnostic(Assign(
					{}, config, {items:[v],xerox:null}
				),	i);
			if (IS(config)==='array') {
				return (<React.Fragment key={key}>{config.map(childA)}</React.Fragment>);
			} else if (!!tag) {
				if (IS(tag)==='string') {
					let items = (config.items||[]),
						chldn = items.map(childA);
					if (xerox) {
						return Agnostic(chldn.map(xeroxA),key);
					} else {
						return COMPS.React.createElement(
							tag, props, chldn.length?chldn:null
						);
					}
				} else {
					let TagName = COMPS.Tag(tag),
						items = (config.items||[]),
						chldn = items.map(childA);
					if (!!chldn.length) {
						return (<TagName {...props}>{chldn}</TagName>);
					} else {
						return (<TagName {...props} />);
					}
				}
			} else { return config; }
		};
		COMPS.Agnolist 	= (list = []) => {
			let items = list.filter(i=>!!i),
				agnos = COMPS.Agnostic;
			return items.map((v,i)=>agnos(v, i));
		},

		COMPS.FA 		= (icon, theme = 'fas') => {
			if (!!icon && !!theme) {
				let fa = ' fa-', sfx = ['','fw'];
				return [theme].concat((
					sfx.splice(1,0,icon),
					sfx.join(fa)
				)).join('');
			} else return null;
		};

		COMPS.iURL 		= (url) => {
			return !!url ? `url('${url||''}')` : null;
		};

		COMPS.joinV 	= (obj, delim = ' ') => {
			try { return Object.values(obj).join(delim); }
			catch(e) { return ''; }
		};

		COMPS.stopEvent = (e) => { try {
			e.stopPropagation();
			e.preventDefault();
		} catch(e) {}; }

		COMPS.onSocket 	= (props) => {
			var links, socks; 
			try {
				links = props.value.replace('SocketLink','')
								   .replace(/\\"/g,'"');
				socks = JSON.parse(links);
			} catch (e) {
				console.log(e, links, socks)
			}
 			return {
				sid: 	 props.master,
				key: 	 props.id,
				path: 	 props.path,
				display: props.display,
				link: 	 COMPS.onRequest(socks),
				point: 	 ('/'+socks.point.join('/')),
				params:  socks.params,
				query: 	 socks.query
			}
		};
		COMPS.onRequest = (obj) => {
			var req = obj.point.join('/'), omt = COMPS.qryOmit,
				map = function (v,k) { return (k+'='+v); },
				flt = function (v,k) { return !omt.contains(k); },
				prm = Imm.Map(obj.params).toList().toArray().join('/'),
				qry = Imm.Map(obj.query).filter(flt).map(map).toArray().join('&');
			return ('/')+(req+(!!prm?'/'+prm:''))+(!!qry?'?'+qry:'');
		};

		COMPS.onBrowser = onBrowser;

		COMPS.Mixins 	= {
			Defer:      {
				componentDidMount() {
					let THS = this;
					// ---------------------------------------------- //
						// THS.callSuperMethod('componentDidMount');
					// ---------------------------------------------- //
						if (MODE.Browser) {
							let state = THS.state;

								// console.log(`DEFERRING ${THS.name}...`)

							THS.setState({ _meta: Assign(
								{}, state._meta||{}, { load: true }
							) 	});
						}
				},
			},
			General: 	{
				getInitialState: 			onInitial,
				shouldComponentUpdate:		onShould.B,
				componentDidMount: 			onMounted,
				componentDidUpdate:			onUpdate,
				componentLog: 				onLog,
			},
			Static: 	{
				getInitialState: 			onInitial,
				shouldComponentUpdate:		onShould.B,
				componentDidMount: 			onMounted,
				componentDidUpdate:			onUpdate,
				componentLog: 				onLog,
			},
			Dynamic: 	{
				getInitialState: 			onInitial,
				shouldComponentUpdate:		onShould.B,
				componentDidMount: 			onMounted,
				componentDidUpdate:			onUpdate,
				componentLog: 				onLog,
			},
			MonoSpacer: {
				toMono(text) {
					let regex = /(?:[{]{2}.*?[}]{2}|[(]{2}.*?[)]{2}|'[^']*?')(?=\s|)|(?:[^{(')}]|([{()}])(?!\1))+/g,
						items = (text.match(regex)||[]);
					return (<span>{items.map((m,i) => {
						let mno = m.match(/^[{]{2}(.+)[}]{2}$/),
							brk = m.match(/^[(]{2}(.+)[)]{2}$/),
							quo = m.match(/^'([^']+)'$/),
							cnd = !!(mno||brk||quo),
							prp = (cnd ? {className:'mono'+(!!brk?' bracket':(!!quo?' quote':''))} : {}),
							val = (cnd ? (mno||brk||quo)[1] : m);
						return (<span key={i} {...prp}>{val}</span>);
					})}</span>);
				},
			},
			Requests: 	{
				Required: 	[],
				Latest: 	{},
				isUpload:	false,
				getInitialState: 			onInitial,
				componentDidMount: 			onMounted,
				shouldComponentUpdate: 		onShould.P,
				componentLog: 				onLog,
				typeIsUpload(method) {
					this.isUpload = (method == 'PUT');
				},
				setValue(obj, key, val, def) {
					var mch = new RegExp(key,'i'),
						res = (val || (!!def.match(mch) ? '' : def));
					if (!!res) obj[key] = res;
				},
				setRequest(params) {
					var THS = this, prms = Imm.Map(params);
					// --------------------------------------------
					Imm.Map(this.refs).map(function (v,k) {
						let sfx = { nrm: '', tag: ';' },
							typ = (!!v.refs.field?'nrm':'tag'),
							fld = v.refs.field||v.refs.taggr.refs.input,
							val = (prms.has(k)?unescape(prms.get(k)):"");
						fld.value = val+(!!val?sfx[typ]:'');
						// if (!!val && typ=='tag') {
						if (typ=='tag') {
							v.refs.taggr.refs.value.value = val;
							v.refs.taggr.tagAdd(true);
						}
					}); THS.hndRequest();
				},
				lenRequest(typ, req) {
					return req.filter(v=>(v.type==typ)).length||null;
				},
				impRequest(typ) {
					return ((p, c)=>(p+Number(!c.valid && c.type==typ)));
				},
				chkRequest(req) {
					var req = this.Required,
						ast = req.reduce(this.impRequest('*'), 0),
						tld = req.reduce(this.impRequest('~'), 0),
						tln = this.lenRequest('~',req);
					if (ast > 0 || tld == tln) {
						window.alert([
							'<',this.props.paths.join('/'),'>',
							'Must fill in Required Field',
							[	this.Required
									.filter(function(v){return v.type=='*';})
									.map(function(v){return '[ '+v.name+' ]';})
									.join(' and '),
							 	this.Required
									.filter(function(v){return v.type=='~';})
									.map(function(v){return '[ '+v.name+' ]';})
									.join(' or ')
							].filter(function(v){return !!v;})
							 .join(' or ')+'.'
						].join(' ')); return false;
					}; this.Latest = req; return true;
				},
				getRequest(point, fields) {
					let THS = this, prm = {}, qry = {},
						att = ['placeholder','data-to'],
						pth = ['payload'], res = {}, 
						qnm = this.isUpload?'body':'query';
					THS.Required = [];
					Imm.Map(fields).map((v,k) => {
						// let ref = v.refs, fld;
						// if (!!ref.field) {
							// fld = ref.field;
						// } else {
							// ref = ref.taggr.refs;
							// fld = ref.value;
							// ref.input.value = fld.value;
						// }
						let fld = v.refs.field||v.refs.taggr.refs.value;
						let key = k.toLowerCase(),
							atr = INPUT.Attrs(fld, att), obj = {},
							plc = atr.placeholder, def = (plc==k?'':plc),
							val = fld.value;
						INPUT.InValid(fld, k, THS.Required);
						switch (atr.dataTo) {
							case 'param': obj = prm; break;;
							case 'query': obj = qry; break;;
						}; THS.setValue(obj, k, val, def);
					});
					res.headers = { token: COMPS.Token, /* authorization: COMPS.Basic */ };
					res.params	= prm;
					res[qnm]	= Assign(qry, { id: point, at: pth, to: pth });
					return res;
				},
				hndRequest(e) {
					COMPS.Rejecters = 0;
					if (!!e) { e.preventDefault(); e.stopPropagation(); }
					if (!!COMPS.IsAuthd) {
						// -----------------------------------------
						var fields 	= this.refs, req = {},
							point 	= this.state.act,
							upload 	= this.isUpload;
						// -----------------------------------------
						req = this.getRequest(point, fields);
						// -----------------------------------------
						if (!this.chkRequest(req)) return false;
						// -----------------------------------------
						if (upload) {
							var field = fields.file.refs.field;
							req.files = field.files;
							req.files = [];
							for (var x=0; x<field.files.length; x++) {
								req.files[x] = { 
									fieldname: 		field.name,
									originalname: 	field.files[x].name,
									mimetype:		field.files[x].type,
									stream: 		field.files[x]
								};
							};
							Actions.Data.send(point, req);
						} else {
							console.log('POINT:', point)
							Actions.Data.send(point, req);
						}
						// -----------------------------------------
					}
					return false;
				},
				uplRequest(field, point, req) {
					var files = field.files;
					console.log(point, files);
					// iterate over the files dragged on to the browser
					for (var x=0; x<files.length; x++) {
						// instantiate a new FileReader object
						var FR = new FileReader(), file = files[x];
						// // loading files from the file system is an asynchronous
						// // operation, run this function when the loading process
						// // is complete
						// FR.addEventListener('loadend', function () {
						// 	// send the file over web sockets
						// 	console.log('FILE:', FR.result);
						// 	IOs.Socket.emit('upload', { file: FR.result });
						// });
						// // load the file into an array buffer
						// FR.readAsArrayBuffer(file);
						IOs.Socket.emit('upload', { file: file });
					}
				}
			},
			Items: 		{
				extClass: { array: 'iterator', object: 'iterator' },
				getInitialState: 			onInitial,
				shouldComponentUpdate: 		onShould.S,
				componentDidMount: 			onMounted,
				componentDidUpdate() 		{ console.log("[] Updated"); },
				componentLog: 				onLog,
				types: 						{},
				hndAccords(e) {
					e.stopPropagation(); var chk = this.refs.accord;
					chk.checked = !chk.checked; return false;
				},
				isIP(key, val) {
					// --------------------------------------
					return (key == 'ip' ? Lng2IP(val) : val);
				},
				toSocket: COMPS.onSocket,
				toImage(val) {
					var dims = '70px'; return {
						backgroundImage: 'url("'+val+'")'
					}
				},
				toValue(props) {
					var value = props.value, name = props.name, type = props.type, tag = {_:'div'}, elems = [];
					switch (type) {
						case 'date': 	elems = [dateFrm(value)]; break;;
						case 'image': 	elems = [<Bubble 	 key="img" {...{img:value,opts:['lite','large']}} />]; break;;
						case 'email': 	elems = [<NormalLink key="a" kind="email" value={value} safe={true} />]; break;;
						case 'link': 	elems = [<NormalLink key="a" kind="link"  value={value} safe={true} />]; break;;
						case 'socket': 	return  (<SocketLink {...this.toSocket(props)} />);
						case 'array': 	return  (<JSONP.Iter {...value} obj={props.obj} />);
						case 'object': 	return  (<JSONP.Iter {...value} obj={props.obj} />);
						default: 		elems = [<span 		 key="span" className={type}>{this.isIP(name,value)}</span>];
					}
					return (<tag._ key={'val-'+props.id} className="value">{elems||'null'}</tag._>);
				},
			},
			Receivers:  {
				name: 'SOCKET',
				logReceiver() { this.componentLog('Receivers: '+COMPS.Receivers); },
				addReceiver() { COMPS.Receivers++; this.logReceiver(); },
				remReceiver() { COMPS.Receivers--; this.logReceiver(); },
				logRejecter() { this.componentLog('Rejecters: '+COMPS.Rejecters); },
				setRejecter() { COMPS.Rejecters=0; this.logRejecter(); },
				addRejecter() { COMPS.Rejecters++; this.logRejecter(); },
				remRejecter() { COMPS.Rejecters--; this.logRejecter(); },
				componentWillUnmount() { this.remReceiver(); super.componentWillUnmount(); },
			},
			Sockets: 	{
				name: 				'SOCKET',
				getInitialState: 	onInitial,
				request: 			{},
				kind: 	 			{
					int: {
						classes: 'value socketLink',
						tip: 	 '[Double-Click] to Load the Full Result...',
						handles: {
							setRequest: function (e) {
								var props = this.state, qry = props.query, at = ['payload','result'];
								qry.id = props.sid; qry.to = (qry.to||props.path); //qry.at = at;
								if (qry.as=='item') qry.at = qry.to;
								this.request = {
									headers: { token: COMPS.Token },
									params:  props.params,
									query: 	 qry
								};
							},
							hndRequest: function (e) {
								COMPS.Rejecters = 0; e.stopPropagation(); e.preventDefault();
								if (!!COMPS.IsAuthd) {
									var pnt = this.state.point, req = this.request;
									Actions.Data.send(pnt, req);
								}
								return false;
							}
						}
					},
					ext: {
						classes: 'value socketLink exlink',
						tip: 	 '[Double-Click] to Load this Request...',
						handles: {
							setRequest(e) {
								var props = this.state, prm = props.params, qry = props.query;
								this.request = Imm.Map(prm).mergeDeep(qry).toObject();
							},
							hndRequest(e) {
								COMPS.Rejecters = 0; e.stopPropagation(); e.preventDefault();
								COMPS.ExLinks[this.state.sid](this.request);
								return false;
							}
						}
					}
				},
				getRID() {
					// --------------------------------------------
					return this.state.link.split('/').slice(-1)[0];
				},
				cncRequest(e) {
					e.stopPropagation(); e.preventDefault();
					return false;
				},
			},
			Phone: 		{
				getLink(num) {
					let mp = c=>((v,i)=>({ 
							'className':c.toLowerCase(),
							'key':`${c}${i}`,'data-v':v
						})),
						fl = v=>!!v, rg = /\d+/g,
						pr = (num['#']||'').match(rg)||[], 
						er = (num.Ext ||'').match(rg)||[],
						ph = [pr.join('') ].filter(fl),
						ex = [er.join(';')].filter(fl);
					return {
						parts: pr.map(mp('NUM')).concat(er.map(mp('EXT'))),
						link: `tel:${ph.concat(ex).join(';')}`
					};
				},
			},
			Taggr: 		{
				/////////////////////////////////////////////////////////////////////////////////////////////////
				// REACTORS
					getInitialState() {
						let nme  = this.name, cnt = nme.appears('\\.');
						this.lvl = '\t'.dup(cnt);
						return FromJS({
							fcsed: false,
							tags:  [],
							value: {},
							input: {},
							range: [0],
							text:  '',
						})
						.mergeDeep(FromJS(this.props))
						.toJS();
					},
					componentDidMount() {
						// -------------------------------------------------------
						this.onRefresh(); // this.componentLog("[] Mounted");
					},
					componentDidUpdate() {
						// -------------------------------------------------------
						this.onRefresh(); this.componentLog("[] Updated");
					},
					componentMerge(props) {
						// -------------------------------------------------------
						return Assign({}, this.state, props);
					},
					shouldComponentUpdate: 	onShould.S,
					componentLog: 			onLog,
					// componentLog(task) {
					// 	var LG = function () { console.log("%s%s %s", this.lvl, task, this.name); }
					// 	setTimeout(LG.bind({ lvl: this.lvl, name: this.name }), 0);
					// },

				/////////////////////////////////////////////////////////////////////////////////////////////////
				// CACHE
					Mods: 						{
						Shf: 						false,
						Ctl: 						false,
						Alt: 						false,
						Met: 						false,
					},
					tagOpt: 					[ 'none','must','and','not' ],
					tagMch: 					[ 'none','brand','ctid','code','navision','name' ],
					tagOptWhich: 				{ true:'Mch', false:'Opt' },
					tagDir: 					{ 37:-1, 38:-1, 39:1, 40:1 },
					tagAnchor: 					-1,
					tagSubmit: 					false,

				/////////////////////////////////////////////////////////////////////////////////////////////////
				// EVENTS
					onModifiers(e, log=true) {
						let { Key: Key, Shf: Shf, Ctl: Ctl, Alt: Alt, Met: Met } = this.Mods = {
								Key: e.keyCode, Shf: e.shiftKey, Ctl: e.ctrlKey, Alt: e.altKey, Met: e.metaKey,
							}, Pos = this.tagAnchor;
						if (Shf) { Pos = this.tagAnchor = ((Pos==-1) ? this.tagLast() : Pos); }
						else 	 { Pos = this.tagAnchor = (-1); }
						if (log) {
							//console.log(`Tag [ ANC:${Pos} | KEY:${Key} | SHF:${Shf} | CTL:${Ctl} | ALT:${Alt} | MET:${Met} ]`);
						}
					},
					onKeyUp(e) { this.onModifiers(e, 0); },
					onKeyDown(e) {
						e.stopPropagation();
						if (!!!this.refs.input.value) {
							this.onModifiers(e, 1);
							switch (this.Mods.Key) {
								case 35: case 36: this.tagGoto(e); break;;
								case 37: case 39: this.tagMove(e); break;;
								case 38: case 40: this.tagOpts(e); break;;
								case 46: case  8: this.tagBack(e); break;;
							}
						} else if (e.keyCode==13) { this.tagAdd(); }
					},
					onInput(e) {
						let text = this.refs.input.value;
						console.log('INPUTTED!!!!!!');
						if (!!text.match(/^([^;]+;)+.*$/)) this.tagAdd();
					},
					onEnter(e) {
						e.stopPropagation();
						if (e.keyCode == 13) this.onSave(e);
						return false;
					},
					onEdit(e) {
						let elm = e.target, idx = this.tagIndex(elm), tag = this.state.tags[idx];
						elm .parentElement.lastChild.firstChild.focus();
						if (!tag.edt) return false;
					},
					onSave(e) {
						e.preventDefault();
						let elm = e.target, val = elm.value, idx = this.tagIndex(elm), nws;
						nws = this.tagSetIn([idx,'txt'], val);
						nws = this.tagSetIn([idx,'edt'], false);
						this.tagUpdate(nws, [idx], 'onEnter');
						return false;
					},
					onWrite(e) {
						e.stopPropagation();
						let elm = e.target, pos = this.tagIndex(elm), val = elm.value;
						this.tagUpdate(this.tagSetIn([pos,'txt'], val), null, 'onWrite');
						return false;
					},
					onFocus(e) {
						var anch = this.state.tags.length,
							next = FromJS(this.state.tags)
										.map((v,i) => v.set('edt',false))
										.toJS();
						this.tagUpdate(next, [anch], 'onFocus',  true);
					},
					onBlur(e) {
						// ----------------------------------------
						var trg = e.nativeEvent.relatedTarget;
						if (!!!trg || !!!trg.name.match(/^[A-Z]\w+Tag\d+$/)) {
							this.tagUpdate(null, null, 'onBlur', false);
						}
					},
					onClick(e) {
						let evt = e.nativeEvent,
							elm = evt.path[0],
							idx = this.tagIndex(elm),
							ted = this.tagGetIn(idx,'edt'),
							tin = this.tagIn(idx);
						// console.log(`\tTag IN ? ${tin} | Tag EDITS ? ${ted}`)
						if (!ted) {
							if (tin) {
								e.stopPropagation(); e.preventDefault();
								let nxt = this.tagSetIn([idx,'edt'], true);
								// console.log('\t\tGoing into Edit Mode.')
								this.tagUpdate(nxt, [idx], 'onClick');
							} else {
								// console.log('\t\tGoing to Selection.')
								this.tagGoto(idx, e);
							}
						}; return false;
					},
					onRefresh() {
						let refcs = this.refs,
							items = Map(refcs)
									.filter((v,k) => !isNaN(k)).toArray()
									.filter((v,i) => v.checked).reverse();
						if (!!this.state.fcsed) {
							if (!!!items.length) { refcs.input.focus(); }
							else {
								let last = items.last, nput = this.tagInput(last);
								if (nput.disabled) last.focus();
								else nput.focus();
							}
						}; 	// console.log('REFRESH:', this.state)
					},

				/////////////////////////////////////////////////////////////////////////////////////////////////
				// UPDATERS
					tagUpdate(next, range, action, focus) {
						let prop = this.state,
							rnge = (range||prop.range),
							tags = (next||prop.tags),
							fcus = (!!focus),
							text = this.tagJoin(this.tagFormat(tags));
						// -----------------------------------------------------
							// console.log(`${action} NEXT (${focus}):`, this.componentMerge({
							// 	text: text, range: rnge, tags: tags, fcsed: fcus
							// }), next);
						// -----------------------------------------------------
						this.setState(this.componentMerge({
							text: text, range: rnge, tags: tags, fcsed: fcus
						}));
					},
					tagAdd(reset) {
						let nput = 	this.refs.input,
							vals = 	this.refs.value,
							text = 	nput.value,
							opts =  {'':0,';':0,'!':1,'+':2,'-':3},
							prev = 	!!!reset?this.state.tags||[]:[],
							next = 	prev.concat((text.match(/(?:[^;+]|\\[;+])*[^\\](?:[;+]|$)/g)||[])
													 .map((v,i) => {
														var o = 0, m = [
															v.match(/^((?:[^;]|\\;)+)(;|)$/),
															v.match(/^"((?:\\"|[^"])+)";?$/),
															v.match(/^((?:[^+]|\\\+)+)\+;?$/),
															v.match(/^\[((?:\\[\[\]]|[^\[\]])+)\];?$/),
														];
														switch (true) {
															case !!m[1]: o = 1; break;;
															case !!m[2]: o = 2; break;;
															case !!m[3]: o = 3; break;;
														}
														return {
															txt:m[o][1], opt:o, mch:0, quo:false, edt:false
													}; 	})),
							anch = 	next.length;
						nput.blur();
						this.tagUpdate(next, [anch], 'tagAdd', true);
						nput.value = '';
					},
					tagBack(e) {
						e.preventDefault();
						let prop = 	this.state,
							rnge = 	prop.range,
							lnth = 	rnge.length,
							tags =  FromJS(prop.tags),
							anch =  (rnge.last||1)-1,
							next = 	[], amnt = '';
						// ---
						if (lnth == 1 && rnge[0] == tags.count()) {
							amnt = 	'One';
							next =  tags.filter((v,i) => !(i==anch))
										.toJS();
						} else {
							amnt = 	'Many';
							next =  tags.filter((v,i) => !this.tagIn(i))
										.toJS();
						}
						// ---
						// console.log(`Deleting ${amnt} | Remaining`, next, rnge);
						anch =  next.length-1;
						this.tagUpdate(next, [anch], 'tagBack', true);
					},
					tagGoto(idx) {
						let next = this.state.range.concat(),
							mod  = this.Mods; idx = idx||0;
						switch (this.Mods.Key) {
							case 35: idx = this.state.tags.length; break;;
							case 36: idx = 0; break;;
						}
						if (this.tagLimit(idx)) {
							let lmt = ((mod.Ctl||mod.Met)&&!mod.Shf);
							if (this.tagIn(idx)) {
								next = List(next).filter((v,i) => v!=idx);
							} else {
								next = lmt ? next.concat(idx) : [idx];
							}
							this.tagUpdate(null, next, 'tagGoto', true);
						}
					},
					tagMove(e) {
						let key  = this.Mods.Key,
							move = { 37: -1, 39: 1 },
							prop = this.state,
							l 	 = prop.tags.length,
							last = prop.range.last,
							next = last + move[key],
							rnge = prop.range.concat();
						// console.log(`\tPREV: ${prev} | (${rnge}>=0 && ${rnge}<=${l}) == ${(rnge>=0 && rnge<=l)}`);
						if (this.tagLimit(next)) {
							this.setState(this.componentMerge({
								range: this.tagShift(key, last, next, rnge),
								fcsed: true
							}));
						} else if (key==39) {
							this.tagBlur();
						}
						e.preventDefault();
					},
					tagShift(key, last, next, range) {
						let res = [next], mod = this.Mods;
						if (mod.Shf&&!mod.Ctl) {
							let rng = List(range), fst = range[0],
								lst = last, nxt = next, pop = {
									L: { '-1': 'push', '1':  'pop' },
									C: { '-1':  'pop', '1': 'push' },
									R: { '-1':  'pop', '1': 'push' },
								},
								anc = this.tagAnchor,
								dir = (fst<next?'R':(fst>next?'L':'C')),
								inc = (nxt-lst).toString(),
								// dir = ((nxt-lst)>),
								wch = pop[dir][inc];
							res = rng[wch](next).toArray();
						}; return res;
					},
					tagBlur() {
						let anch = this.state.tags.length;
						this.setState(this.componentMerge({ range: [anch] }));
					},
					tagOpts() {
						let { Key: key, Ctl: ctl } = this.Mods;
						if ([38,40].has(key)) {
							let wch = this.tagOptWhich[ctl],
								ops = this[`tag${wch}`],
								pos = this.state.range.last,
								dir = this.tagDir[key],
								nws = this.tagIncIn(wch, pos, ops, dir);
							// console.log(`\tPOS: ${pos} | OPT: ${opt} | NXT: ${res} |`, this.tagOpt);
							this.tagUpdate(nws, null, 'tagOpts', true);
						}
					},

				/////////////////////////////////////////////////////////////////////////////////////////////////
				// HELPERS
					tagNew() {
						// -----------------------------------------------------
						return FromJS(this.state.tags);
					},
					tagGetIn(...path) {
						// -----------------------------------------------------
						return FromJS(this.state.tags).getIn(path);
					},
					tagSetIn(path, val) {
						// -----------------------------------------------------
						return FromJS(this.state.tags).setIn(path, val).toJS();
					},
					tagIncIn(which, tag, ops, dir) {
						which = which.toLowerCase();
						let opt = this.tagGetIn(tag, which), nxt = ops.safeIndex(opt, dir);
						return this.tagSetIn([tag, which], nxt);
					},
					tagInput(elm) {
						// -----------------------------------------------------
						return elm.parentElement.lastChild.children[1];
					},
					tagLast() {
						// -----------------------------------------------------
						return this.state.range.last;
					},
					tagFormat(next) {
						var opts = (val) => {
								let txt = `${val.txt
												.replace(/"(\w+)"/g, '$1')
												.replace(/(^\[+|\]+$|[+])/g, '')}`;
								switch (val.opt) {
									case  3: txt = `${txt.replace(/\\(?=[\[\]])/g,'')
														 .replace(/([\[\]])/g,"\\$1")
														 .replace(/^(.+)$/, '[$1]')}`;
													break;;
									case  2: txt = `${txt.replace(/\\(?=\+)/g,'')
														 .replace(/(\+)/g,"\\$1")
														 .replace(/^(.+[^+])$/, '$1+')}`;
													break;;
									case  1: txt = `${txt.replace(/\\(?=")/g,'')
														 .replace(/(")/g,"\\$1")
														 .replace(/^(.*)$/,'"$1"')}`;
													break;;
								}
								// console.log(`\tOPT: ${val.opt} [${this.tagOpt[val.opt]}] | ${txt}`);
								return { txt: txt };
							};
						return 	next.map((v,i) => Assign({}, v,opts(v)));
					},
					tagJoin(next) {
						// ----------------------------------------------
						return 	next.map((v,i) => v.txt).join(';').replace(/([+];)/g, '+');
					},
					tagIn(idx) {
						let range = this.state.range,
							reslt = List(range).includes(idx);
						return reslt;
					},
					tagLimit(idx) {
						let b = 0, e = this.state.tags.length;
						return idx.amid(b,e,1);
					},
					tagIndex(elm) {
						// --------------------------------
						let idx = INPUT.Attr(elm, 'data-ref');
						return Number(idx || 0);
					},
			}
		};

		/**
		 * A React Mixin Factory.
		 * @kind function
		 * @param {('React'|'Pure'|'Reflux')} kind ...
		 * @param {...string} mixes ...
		 * @returns {(React.Component<{},{},any>|React.PureComponent<{},{},any>|Reflux.Component<{},{},any>)}
		 */
		COMPS.Mix 		= (kind, ...mixes) => {
			let All = {}, Mixed, Defaults = {};
			// Declare Base Class -------------------------------------------- //
				All[kind] = class extends MixBase[kind] {
					constructor(props) { 
						super(props); this.state = props; 
						Object
							.keys(Mixed)
							.filter((F)=>(Mixed[F]!=this[F]))
							.map((F) => {
								let over = this[F].bind(this),
									mixs = Mixed[F].bind(this);
								this[F] = function(...args) {
									return (mixs(...args),over(...args));
								};
							});
					}
					callSuperMethod(name, ...args) { 
						// let method = super[name];
						let method = this.__proto__.__proto__.__proto__[name];
						// console.log(`${this.name}.${name}:`, method);
						if (!!method) return method(...args);
					}
					static get defaultProps(   ) { 
						return FromJS(Defaults).toJS(); 
					}
					static set defaultProps(def) { 
						Defaults = FromJS(Defaults).mergeDeep(def).toJS(); 
					}
				};	
				// Establish Name & Default meta-prop
				All[kind].defaultProps = { _meta: {} };
				DEFINE(All[kind].constructor, { name: {
					enumerable:0, configurable:0, 
					writable:1, value: kind
				}	});
			// Setup Reflux Mixin; if needed --------------------------------- //
				if (kind == "Reflux") {
					let RFLX = All[kind].prototype;
					Defaults = Assign(Defaults, {
						loaded: false,
						stamp:  null,
						status: null,
					});
					// RFLX.getDerivedStateFromProps = function(props, state) {
						// console.log({ props, state })
						// if (!!!state.stamp||props.stamp!==state.stamp) {
							// return Assign({}, props.stamp>state.stamp?props:state);
						// };	return null;
					// };
				};
			// Inherit Mixin Classes ----------------------------------------- //
				Mixed = {};
				mixes.map((M) => { try {
					let PRTO = All[kind].prototype;
					Imm.Map(MX[M]).map((F,N) => {
						if (!!!Mixed[N]) Mixed[N] = [PRTO[N]].filter(P=>!!P);
						Mixed[N].push(F);
					});
				} catch(err) {
					console.log(C); throw err;
				} 	});
				Mixed = Imm.Map(Mixed).map((FNS,N) => {
					return All[kind].prototype[N] = function(...args) {
						let prev = args.last; args = args.slice(0,-1);
						return FNS.reduce((P,C)=>(
							C.bind(this)(...args, P)
						), 	prev);
					};
				}).toObject();
			// Return Extended Class ----------------------------------------- //
				return All[kind];
		};

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		const 	MX 			= COMPS.Mixins;
		const 	Mix 		= COMPS.Mix;
		const 	Agnostic 	= COMPS.Agnostic;
		const 	FA 			= COMPS.FA;
		const 	iURL 		= COMPS.iURL;
		const 	joinV 		= COMPS.joinV;

		// DEFER ///////////////////////////////////////////////////////////
			STOCK.Defer 		= function Defer({ load = false, what }) {
				// console.log('DEFERRING:', load, what)
				return (!!!load ? null : what());
			}

		// JSONP ///////////////////////////////////////////////////////////
			STOCK.JSONP 		= class extends Mix('Reflux','Dynamic','Receivers') {
				constructor(props) {
					super(props); this.name = 'JSONP';
					let THS = this, store = COMPS.Stores.Data;

					THS.mapStoreToState(store, data => {
						let path = THS.state.paths.join('/'),
							epnt = `/${path.toLowerCase()}`,
							cont = data[epnt];
						return { content: cont };
					});
				}

				componentDidUpdate() { Actions.App.progress(100); }
				render() {
					var props = this.state, content = props.content;
					return (
						<div data-page={props.page} className='jsonp' ref="jsonp" >
							<div className="object" ref="objct">
								<span key="obrk" className="obrckt" />
								<JSONP.Iter {...content} id={props.id} key={props.id} />
								<span key="cbrk" className="cbrckt" />
							</div>
						</div>
					);
				}
			};
			STOCK.JSONP.Iter 	= class extends Mix('React', 'Dynamic') {
				constructor(props) {
					super(props)
					this.name = 'JSONP.ITER';
				}

				render() {
					var th  = this, props = th.state, size = (props.size || 0), sbsz = 0, items;
					try {
						// console.log("PROPS:", props.map((k,v) => k))
						items = props/*.slice(0,20)*/.map( function (v,k) {
							// console.log("k,v:", k, v)
							return (<JSONP.Item {...v} key={v.id} />);
						});
						//
						if ( items.length>0 ) { let prp = props[props.keys[0]];
							sbsz = ( ['array','object'].has(prp.type) ? prp.size : 1 );
						}
					} catch (e) { items = []; }
					// console.log("ITEMS:", items)
					return (
						<ul id={props.id} data-cnt={`${size}.${sbsz}`} className="value gpu">
							{items}
						</ul>
					);
				}
			};
			STOCK.JSONP.Item 	= class extends Mix('Reflux','Items','Receivers') {
				constructor(props) {
					super(props); this.name = 'JSONP.ITEM';
					let THS = this, store = COMPS.Stores.Data;
					
					console.log('JSONi+', this,state)

					THS.mapStoreToState(store, data => {

							console.log('JSONi:', data)

						return {};

						// var ste = THS.state, 
							// mst = ste.master, 
							// pto, cur, pth, 
							// rgx, dth, sth, 
							// gti, rej, mch,
							// res;

						// if (mst == data.master) {
							// pto = path.slice();
							// pth = mst+'/'+ste.path.join('/');
							// cur = data.path;
							// dth = pto.join("/");
							// sth = ste.path;

							// if (pth == dth) {
								// res = data;
							// } else if (rgx = new RegExp('^'+pto.join("\\/")+'$'), mch = pth.match(rgx), !!mch) {
								// var nth = mch[0].split('/').slice(2), nme = ste.name,
								// 	dta = data.value.getIn(nth, true).Child.toObject();
								// // console.log('\tRECD:', dta)
								// dta.name = nme; res = dta;
							// } else if (gti = data.value.getIn(sth, true), !!gti.Child && gti.Child.name == ste.name) {
								console.log('\tRECD:', sth, gti.Child.toObject())
								// res = gti.Child.toObject();
							// } else { THS.addRejecter(); (COMPS.Rejecters == COMPS.Receivers) &&
								// Actions.App.progress(100);
							// }

							// return res;
						// } else return {}
					});
				}

				componentDidUpdate() { Actions.App.progress(100); }
				render() {
					var props 	= this.state,
						name 	= props.name,
						type 	= props.type,
						value 	= this.isIP(props.name, props.value),
						alone 	= props.alone,
						iter 	= (this.extClass[type]||''),
						checked = ['result','user'].indexOf(name) > -1 ? '' : 'checked',
						classLI = CSS.Flex({Align:'L'/*,Wrap:!!iter*/},type,'gpu',iter),
						classOB = classN("obrckt", { alone: alone }),
						classCB = classN("cbrckt", { alone: alone }),
						collps 	= ('chbx-'+props.id),
						accord 	= ('acrd-'+props.id);
					// -------------------------------------------------
					return (
						<li key={props.id} className={classLI} id={props.id}>
							<input type='checkbox' ref="collps" id={collps} name={collps}
								key={collps} disabled={alone} className="collps"
								defaultChecked={checked} />
							<label key={collps+'-L1'} htmlFor={collps} />
							{ (props.inside == 'object') ?
								<div className="key" key='KEY' onDoubleClick={this.hndAccords}>
									{name}
									<span 	className="colon" key="CLN"
											dangerouslySetInnerHTML={{
												__html: [props.pad.join('&nbsp;')]
											}} />
								</div>
							: null }
							<span key="obrk" className={classOB} />
							<input type='checkbox' id={accord} name={accord}
								key={accord} ref="accord" className="accord" />
							<span key="elps" className="ellipse">
								{(() => { try { return value.size } catch (e) { return 0; }})()}
							</span>
							{this.toValue(props)}
							<span key="cbrk" className={classCB} />
							<span key="cma" className="comma" />
							<label key={collps+'-L2'}></label>
							<div className="highlight" />
						</li>
					);
				}
			};

		// TAGS ////////////////////////////////////////////////////////////
			STOCK.Tags 			= class extends Mix('React', 'Taggr') {
				constructor(props) {
					super(props)
					this.name = 'TAGS';
				}

				render() {
					let props 	= (FromJS(this.state||{}).toJS()),
						focused = (!!props.fcsed?' focused':''),
						tags 	= (props.tags ||[]),
						text 	= (props.text ||''),
						value 	= (props.value||{}),
						input 	= (props.input||{}),
						sClick 	= (this.onClick),
						dClick 	= (this.onDblClick);
					if (!!tags.length) input.placeholder = "";
					// console.log('TAGS:', tags);
					return (
						<div className={'taggr paramInput'+focused} ref='tags'
							onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}>{[(!!tags ? (
							<div key='tags' className='tags'>{
								tags.map((v,i) => {
									let id = `${input.name}Tag${i}`,
										md = `${input.name}Mch${i}`,
										od = `${input.name}Opt${i}`,
										mp = this.tagMch[v.mch],
										op = this.tagOpt[v.opt],
										ch = this.tagIn(i),
										ed = !!v.edt,
										tx = v.txt,
										ln = tx.length,
										sz = ln||1; // (ln>1?ln-1:ln);
									return (
										<div key={i} className={'tag'+(op=='and'?' plus':'')} data-ref={i}>
											<input 	key='iL' name={id} className='focal' ref={i}
													type='checkbox' checked={ch} data-ref={i}
													data-mch={mp} data-opt={op} onFocus={this.onEdit} />
											{this.tagMch.map((o,n) => (
												<input 	key={o} name={md} checked={o==mp}
														type='radio' className={'matcher '+o}
														value={o} readOnly={true} data-ref={i} />
											))}
											{this.tagOpt.map((o,n) => (
												<input 	key={o} name={od} checked={o==op}
														type='radio' className={'modifier '+o}
														value={o} readOnly={true} data-ref={i} />
											))}
											<label 	key='tL' htmlFor={id} data-ref={i}
													onClick={sClick} data-ref={i}>
												<span className="field" />
												<input 	data-ref={i}
														name='tag'
														type='text'
														disabled={!ed}
														value={tx}
														onBlur={this.onSave}
														onKeyDown={this.onEnter}
														onChange={this.onWrite}
														size={sz}
												/>
												<span className="option" />
											</label>
										</div>
									);
								})
							}</div> ) : null),
							<input 	key='vals' ref='value' {...value} value={text}
									onChange={(e) => { console.log("I INPUTTED!!!!!!"); }}
									onInput={(e) => { console.log("I INPUTTED!!!!!!"); }}
									/>,
							<input 	key='flds' ref='input' {...input} className='taggee'
									onFocus={this.onFocus} onBlur={this.onBlur} onInput={this.onInput}
									data-value={text} />
						]}</div>
					);
				}
			};

		// BUBBLE //////////////////////////////////////////////////////////
			STOCK.Bubble 		= class Bubble extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'BUBBLE';
					this.icons = {user:'user',add:'plus',more:'ellipsis-h','':''}
				}

				/**
				 * Converts a `NameObj` into a full-string.
				 * @param {NameObj} name The user's name-object
				 */
				getName(name) { 
					return joinV(name||{First:'',Last:''}); 
				}
				/**
				 * Grabs the initials of a user's name.
				 * @param {string} name The name of the user.
				 */
				getInitials(name) {
					return name.replace(/[^A-Z]|\B[A-Z]/g,'')||null
				}
				/**
				 * Parses the `multi` prop into a digestible object.
				 * @param {boolean|number} multi Either a `boolean` denoting it's multi-state, or a 
				 *   `Number`, with `0` being `false`. When a `Number` is used, the amount of other 
				 *   users this bubble represents will be shown to the right of the primary user's 
				 *   name.
				 * @returns {{cName:string,count:number}}
				 */
				getMulti(multi) {
					let res = { cName: { multiple: !!multi }, count: null },
						typ = (multi||false).constructor.name;
					(typ=='Number' && !!multi) && (res.count = (multi-1));
					return res;
				}

				render() {
					var props 	= this.props,
						id 		= props.id,
						Name 	= this.getName(props.name),
						Multi   = this.getMulti(props.multi),
						Photo 	= props.img,
						Kind 	= props.kind,
						Click   = !!props.onClick?props.onClick.bind(this):null,
						Opts 	= [Kind].concat(props.opts),
						Icons 	= this.icons,
						classes = classN('bubble', Multi.cName, Opts),
						style 	= Assign({}, props.style, {
									backgroundImage: iURL(Photo),
								});
					return (
						<div key="bub" id={id} style={style} className={classes} onClick={Click} data-name={Name} data-cnt={Multi.count} role="img">
							{!!!Photo ? (<i {...{
								'className':    FA(Icons[Kind]),
								'data-initial':	this.getInitials(Name),
								'aria-hidden':	true,
							}}></i>) : null}
						</div>
					);
				}
			};
			STOCK.Bubble.defaultProps = {
				id:	 null,
				kind:	 '',
				name: 	{First:'',Last:''},
				img: 	 null,
				opts:	[],
				style:	{},
			};

		// LINK ////////////////////////////////////////////////////////////
			STOCK.NormalLink 	= class extends Mix('React', 'Static') {
				constructor(props) {
					super(props)
					this.name = 'NORMALLINK';
					this.href = "#";
				}

				onSafeClick(e) {
					e.preventDefault(); window.open(this.href, "_self"); return false;
				}
				toMail(val, safe) {
					var prop = { className:'email', href:'#' },
						prts = val.match(/([^@.]+|@|\.)/g),
						link = INPUT.Email(val);
					if (!!safe) {
						prop.onClick = this.onSafeClick;
						this.href = link; delete prop.href;
					} else { prop.href = link; }
					return (<a {...prop}>{prts.map((v,i)=>{
						let C = (['@','.'].has(v)?'special':null);
						return <span key={`EML${i}`} className={C}>{v}</span>
					})}</a>)
				}
				toLink(val, safe) {
					var prop = { className:'link', href:'#' }, disp = val,
						mtch = val.match(/^<T:(.+?),U:(.+)>$/);
					if (!!mtch) {
						disp = mtch[1];
						if (!!safe) {
							prop.onClick = this.onSafeClick;
							this.href = mtch[2]; delete prop.href;
						} else { prop.href = mtch[2]; }
					}
					return (<a {...prop}>{disp}</a>);
				}
				render() {
					var prop = this.props, kind = prop.kind,
						hndl = (kind=='email'?'toMail':'toLink');
					return this[hndl](prop.value, prop.safe);
				}
			};
			STOCK.SocketLink 	= class extends Mix('React', 'Sockets') {
				constructor(props) {
					super(props)
				}

				toText(value) {
					return (<span className="sck">{value}</span>);
				}
				toLink(kind, props) {
					var point = props.point.split('/').slice(1),
						param = Imm.Map(props.params),
						query = Imm.Map(props.query).filter(
							function (v,k) { return !COMPS.qryOmit.contains(k);
						}), cnt = 0;
					return [
						(point.map(function (v,i) {
							return (<span key={v+i} className='sck pnt'>{v}</span>);
						})),
						((!!param.count()) ?
							param.map(function (v,k) {
								return (<span key={k} className='sck prm'>{
									v.split(';').map(function (p,i) {
										return (<span key={i}>{p}</span>);
									})
								}</span>);
							}).toArray()
						: null),
						((kind == 'ext' && !!query.count()) ?
							<span key='qry' className="sck qry">{
								query.map(function (v,k) {
									cnt++; return [
										<span key={k+'K'+cnt} className='k'>{k}</span>,
										<span key={k+'V'+cnt} className='v'>{v}</span>,
									];
								}).toArray()
							}</span>
						: null)
					];
				}
				render() {
					var props = this.state,
						kind  = (props.query.kind || 'int'),
						disp  = props.display,
						cnfgs = this.kind[kind],
						hndls = cnfgs.handles,
						attrs = {
							className: 		 cnfgs.classes,
							href: 			 'javascript:void(0);', //props.link,
							title: 			 cnfgs.tip,
							onClick: 		 hndls.hndRequest.bind(this),
							// onClick: 	 	 cnfgs.cncRequest,
						}; hndls.setRequest.bind(this)();
					return (<a {...attrs}>{!!disp ?
						this.toText(disp) : this.toLink(kind, props)
					}</a>);
				}
			};

		// LOCALE //////////////////////////////////////////////////////////
			STOCK.PhoneNum 		= class extends Mix('React', 'General','Phone') {
				constructor(props) {
					super(props)
					this.name = 'PHONE';
					this.classes = 'number';
				}

				render() {
					var th = this, pr = th.props, nm = pr.number,
						lk = th.getLink(nm), ph = lk.parts;
					return (
						<span className="phone">
							<a href={lk.link}>{ph.map(v=>(
								<span {...v}>{v['data-v']}</span>
							))}</a>
						</span>
					);
				}
			};
			STOCK.Address  		= class extends Mix('React', 'General') {
				constructor(props) { 
					super(props); this.name = 'ADDRESS'; 
					// ----------------------------------------------- //
						this.handleCopy = this.handleCopy.bind(this);
					// ----------------------------------------------- //
						let { Name, Street, Line2, City, Region, Postal, Country, flat } = props,
							filt = (l,s)=>(l.filter(p=>!!p).join(s)),
							sepr = ({true:', ',false:'\n'})[!!flat];
						this.full = filt([
							Name, Street, Line2, filt([
								City, filt([Region, Postal],' ')],
							sepr), Country
						], 	sepr);
				}

				handleCopy(e) {
					e.clipboardData.setData('text/plain', this.full);
					e.preventDefault();
				}

				render() {
					var { props, handleCopy, full } = this,
						{ collapse, flat } = props;
					return (
						<address className={classN("address",{collapse,flat})} onCopy={handleCopy} aria-label={full}>
							<span key="name"    className="name"   >{props.Name   }</span>
							<span key="street"  className="street" >{props.Street.replace(/-/g,'\u2014') }</span>
							<span key="street"  className="street" >{props.Line2  }</span>
							<span key="city"    className="city"   >{props.City   }</span>
							<span key="region"  className="region" >{props.Region }</span>
							<span key="postal"  className="postal" >{props.Postal }</span>
							<span key="country" className="country">{props.Country}</span>
						</address>
					);
				}
			};

		// EXPORTS /////////////////////////////////////////////////////////

			const {
				JSONP, Tags, Bubble, NormalLink, SocketLink, 
				PhoneNum, PhoneExt, Address, 
			} = STOCK;
			
			COMPS.Elements.Stock = STOCK;

};
