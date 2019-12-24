'use strict';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS ////////////////////////////////////////////////////////////////////////////////////////////////////////

	const encl = { mch: /^(.+?),?$/, arr: '[$1]', obj: '{$1}' };
	const lstx = { mch: /((?:[\/\w]+([;&]|))+)/, rep: '[$1]' };
	const quox = { mch: /([\/\w]+)/g, rep: '"$1"' };
	const numx = { mch: /"(\d+(?:\.\d+)?|true|false)"/g, rep: '$1' };
	const regx = {
		mch: /^((?:\/\w+)+|\/|$)(\/?(?::\w+:.+?)|)(?:(\?(?:\S+=\S+&?)|))$/,
		pnt: { rep: '"$2",', 	  mch: /(\/(\w+))/g },
		prm: { rep: '"$2":"$3",', mch: /(\/:(\w+):((?:[^\/&=?\s]+;?)+)(?=\/:|))/g },
		qry: { rep: '"$2":"$3",', mch: /(\??(\w+)=([^\/&=?\s]+)(?:&|$))/g },
	};
	const conx = {
		dlm: '<|>',
		esc: {  mch: /(^|[^\\])(")/g, rep: function (slash) {
			return function ($0, $1, $2) { return $1+slash+$2; }
		}	},
		col: { 	mch: /(%s)/g, rep: function (cols, i) {
			var d = conx.dlm; return function ($0, $1) { i++; return "'"+d+cols[i]+d+"'"; }
		}	}
	};
	const defx = { point: [""], params: {}, query: {} };
	const dfsx = JSON.stringify(defx);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXPORTS //////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function (global) {

	require('harmony-reflect');

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// REQUIRES /////////////////////////////////////////////////////////////////////////////////////////////////////

		global.RNotify  = '__notify__';
		global.CREATE 	= Object.create;
		global.OWNDESC 	= Object.getOwnPropertyDescriptor;
		global.Assign 	= require('object-assign');
		global.Imm 		= require('immutable');
		global.Dff 		= require('immutablediff');
		global.isKeyed 	= Imm.Iterable.isKeyed;
		global.FromJS 	= function FromJS(js) {
			return Imm.fromJS(js, function FJSO(key, val) {
				return isKeyed(val) ? 
					val.toOrderedMap() : 
					val.toList();
			});
		};
		global.ImmIs 	= Imm.is;
		global.List 	= Imm.List;
		global.Map 		= Imm.Map;
		global.OrdMap 	= Imm.OrderedMap;
		global.Set 		= Imm.Set;
		global.OrdSet 	= Imm.OrderedSet;
		global.Stack 	= Imm.Stack;
		global.Seq 		= Imm.Seq;
		global.Record 	= Imm.Record;
		global.DOHASH 	= function (jsn) { return JSON.stringify(btoa(jsn)); };
		global.UNHASH 	= function (hsh) { return JSON.parse(atob(hsh)); 	 };
		global.classN 	= require('classnames');
		global.ALLSTUFF = Map({});


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// POLY-FILLS ///////////////////////////////////////////////////////////////////////////////////////////////////

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// OBJECT

			// OBJECT ASSIGN
				if (!Object.assign) {
					Object.assign = Assign;
				}


		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// ARRAY

			// HAS ITEM
				if (!Array.prototype.hasOwnProperty('has')) {
					Object.defineProperty(Array.prototype, 'has', {
						enumerable: false, configurable: false, writable: false,
						value: function (val) {
							var ths = this; return !Array.isArray(val) ? ths.indexOf(val) > -1 :
							val.filter(function (v) { return ths.indexOf(v)>-1 }).length > 0;
						},
					});
				}

			// LAST ITEM
				if (!Array.prototype.hasOwnProperty('last')) {
					Object.defineProperty(Array.prototype, 'last', {
						enumerable: false, configurable: false,
						get: function getLast ( ) { return this[(this.length-1)]; },
						set: function setLast (v) { this[(this.length-1)] 	=  v; },
					});
				}

			// SAVE INDEX
				if (!Array.prototype.hasOwnProperty('safeIndex')) {
					Object.defineProperty(Array.prototype, 'safeIndex', {
						enumerable: false, configurable: false, writable: false,
						value: function (idx, dir) {
							dir = ([-1,1].has(dir) ? dir : 1);
							var len = this.length,
								beg = 0, end = len-1,
								def = { '1': beg, '-1': end },
								not = def[dir],
								nxt = (idx+dir),
								can = nxt.amid(beg,end,1),
								res = (can ? nxt : not);
							return res;
						},
					});
				}


		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// NUMBER

			// NUMBER IS BETWEEN
				if (!Number.prototype.hasOwnProperty('amid')) {
					Number.prototype.amid = function(a, b, eq) {
						var min = Math.min.apply(Math, [a, b]),
						max = Math.max.apply(Math, [a, b]);
						switch (Number(!!eq)) {
							case 0: return this> min && this< max;
							case 1: return this>=min && this<=max;
						}
					};
				}


		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// STRING

			// TEXT APPEARANCES
				if (!String.prototype.hasOwnProperty('appears')) {
					String.prototype.appears = function (char) {
						var reg = new RegExp(char, 'g');
						return (this.match(reg) || []).length;
					};
				}

			// DUPLICATE
				if (!String.prototype.hasOwnProperty('dup')) {
					String.prototype.dup = function (amount) {
						var amt = amount+1; return new Array(amt).join(this);
					}
				}

				if (!String.prototype.hasOwnProperty('poop')) {
					String.prototype.poop = function () {
						return this.replace(/(\b\w+\b)/g, 'poop');
					}
				}


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////////

		global.PROPS 	= function (value, descript) {
			var def, val, prp, iGS, dsc = (descript || {});
			try {
				def  = { enumerable: !!dsc.E, configurable: !!dsc.C };
				iGS  = !!value && HASANY(value, ['get', 'set']);
				val  = (!!iGS ? value : { writable: !!dsc.W, value: value });
				prp  = Assign(def, val);
			} catch (e) {
				console.log(e);
			}
			return prp;
		}
		global.HASANY 	= function (obj, props) {
			return props.reduce(function (p, c) {
				return p + obj.hasOwnProperty(c);
			}, 0);
		}
		global.NOW 		= function (offset, fraction) {
			// ---------------------------------------------
			return ((new Date().getTime()+(offset||0))/(fraction||1));
		}
		global.FCHUNK 	= function () {
			var start = NOW(), a = this.a, l = a.length,
				i = this.i, c = this.c, m = this.m,
				f = this.f, diff = (NOW() - start), bnd = {};
			// callback called with args (value, index, array)
			while ((i < l) && (diff <= m)) {
				f.call(c, a[i], i, a); ++i;
				diff = (NOW() - start);
			}
			// set Timeout for async iteration
			bnd = { a: a, c: c, m: m, f: f, i: i };
			if (i < l) setTimeout(FCHUNK.bind(bnd), 1);
		}
		global.FMAP 	= function  (array, func, maxTime, context) {
			FCHUNK.bind({	i: 0,
				a: array, 	c: context||window,
				f: func, 	m: maxTime||200,
			})();
		}
		global.DEFINE 	= function (proto, properties) {
			// Just a Wrapper to Shorten the Call
			Object.defineProperties(proto, properties);
		}
		global.MAX 		= function (arr) {
			return (arr.sort(function (a, b) {
				return b.length - a.length;
			})[0]||'');
		}
		global.MIN 		= function (arr) {
			return (arr.sort(function (a, b) {
				return a.length - b.length;
			})[0]||'');
		}
		global.ISS 		= function (arg) {
			var OBJ = false, RET = {}, STR, NAN = true,
				ANS, BLN, DTE, ARR, NMB, NUM, EML, IMG, LNK, SCK, TXT, RAW, FNC, SYM,
				dReg = /^\d{4}(-\d{2}){2}[T ](\d{2}:){2}\d{2}(?:\.\d{3})?Z?$/,
				lReg = /^(?:\/[^\/\n\t]+)+|\/$/,
				sReg = /^SocketLink\{.+\}$/,
				eReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
				nReg = /^\.?(?:\d+\.){2,}\d+$|^(?:[a-f\d]{2}:){5}[a-f\d]{2}$/i,
				iReg = /^(data:image\/gif;base64,)(.+)$/;
			// String Representation
			STR = !!arg ? arg.toString() : '';
			try { NAN = isNaN(eval(arg)); } catch (e) {}
			// Determine Array
			ARR = (arg instanceof Array);
			// Determine Types w/ Regex
			DTE = (!!!ARR&&!!STR.match(dReg));
			EML = (!!!ARR&&!!STR.match(eReg));
			// LNK = (!!!ARR&&!!STR.match(lReg));
			SCK = (!!!ARR&&!!STR.match(sReg));
			IMG = (!!!ARR&&!!STR.match(iReg));
			NUM = (!!!ARR&&!!STR.match(nReg));
			// Determine Types w/o Regex
			BLN = (typeof(arg) == 'boolean');
			NMB = (!(NUM||ARR||BLN||DTE||NAN));
			TXT = (!(SCK||IMG||EML||LNK||NMB||DTE) && NAN && typeof(arg) == 'string');
			RAW = (arg instanceof RegExp);
			FNC = (typeof(arg) == 'function');
			SYM = (typeof(arg) ==   'symbol');
			// Fill-In Return
			ANS = Imm.OrderedMap({
				'null': 	NIL(arg),
				'date': 	(DTE),
				'email': 	(EML),
				// 'link': 	(LNK),
				'socket': 	(SCK),
				'image': 	(IMG),
				'boolean': 	(BLN),
				'string': 	(TXT),
				'raw': 		(RAW),
				'number': 	(NMB),
				'numeric': 	(NUM),
				'function': (FNC),
				'symbol': 	(SYM),
				'array': 	(ARR),
				'object': 	false,
			});
			// Determine IF Object
			ANS.map(function (V, K) {
				OBJ = !OBJ ? (V ? 1 : 0) : 1;
			});
			RET = ANS.toJS(); RET.object = !OBJ;
			// Return Answers
			return Object.keys(RET).filter(
				function(v) { return RET[v]; }
			)[0];
		}
		global.IS 		= function (arg) {
			var OBJ = false, RET = {}, STR, NAN = true,
				ANS, BLN, DTE, ARR, NMB, NUM, EML, IMG, LNK, SCK, TXT, RAW,
				dReg = /^\d{4}(-\d{2}){2}[T ](\d{2}:){2}\d{2}(?:\.\d{3})?Z?$/,
				lReg = /^(?:<T:.+,U:.+>|(?:\w+:\/)(?:\S+\.|\.\S+)*(?:\/[^\/\s]+)*\/?|(?:\/[^\/\s]+)+\/?)$/,
				sReg = /^SocketLink\{.+\}$/,
				eReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
				nReg = /^\.?(?:\d+\.){2,}\d+$|^(?:[a-f\d]{2}:){5}[a-f\d]{2}$/i,
				iReg = /^(data:image\/gif;base64,)(.+)$/;
			// String Representation
			STR = !!arg ? arg.toString() : '';
			try { NAN = isNaN(eval(arg)); } catch (e) {}
			// Determine Array
			ARR = (arg instanceof Array);
			// Determine Types w/ Regex
			DTE = (!!!ARR&&!!STR.match(dReg));
			EML = (!!!ARR&&!!STR.match(eReg));
			LNK = (!!!ARR&&!!STR.match(lReg));
			SCK = (!!!ARR&&!!STR.match(sReg));
			IMG = (!!!ARR&&!!STR.match(iReg));
			NUM = (!!!ARR&&!!STR.match(nReg));
			// Determine Types w/o Regex
			BLN = (typeof(arg) == 'boolean');
			NMB = (!(NUM||ARR||BLN||DTE||NAN));
			TXT = (!(SCK||IMG||EML||LNK||NMB||DTE) && NAN && typeof(arg) == 'string');
			RAW = (arg instanceof RegExp);
			// Fill-In Return
			ANS = Imm.Map({
				'date': 	(DTE),
				'email': 	(EML),
				'link': 	(LNK),
				'socket': 	(SCK),
				'image': 	(IMG),
				'boolean': 	(BLN),
				'string': 	(TXT),
				'raw': 		(RAW),
				'number': 	(NMB),
				'numeric': 	(NUM),
				'array': 	ARR,
				'null': 	NIL(arg),
				'object': 	false
			});
			// Determine IF Object
			ANS.map(function (V, K) {
				OBJ = !OBJ ? (V ? 1 : 0) : 1;
			});
			RET = ANS.toJS(); RET.object = !OBJ;
			// Return Answers
			return Object.keys(RET).filter(function (v) { return RET[v]; })[0];
		}
		global.NIL 		= function (val) { return [undefined,null].indexOf(val) > -1; }
		global.UoN 		= function (val, def, log) { var is = NIL(val); return (!!def ? (is?def:val) : is); }
		global.IaN 		= function (val) { return !NIL(val) && !isNaN(val); }
		global.dateFrm 	= function (date) {
			try {
				if (!!date) {
					var reg = /^(\d{4}(?:-\d{2}){2})[T ]((?:\d{2}:){2}\d{2})(?:\.\d{3})?Z?$/,
						mch = date.match(reg), dL = "en-US", dateF 	= {
							year: "numeric", month: "short", day: "numeric",
							hour: "2-digit", minute: "2-digit"
						},
						stm = new Date(!!mch ? mch[1]+'T'+mch[2]+'.000Z' : ''),
						dte = stm.toLocaleDateString(dL, dateF),
						tme = stm.toLocaleTimeString(dL, dateF);
					return (dte == tme) ? dte : (dte+' '+tme);
				} else { return "null"; }
			} catch (e) { console.log("%s\n", date, e); }
		}
		global.Lng2IP 	= function (num) {
			if (!isNaN(num)) {
				var OCT = function(nm, base) { return ((nm >> base) & 255); },
					O1 = OCT(num,  0), O2 = OCT(num,  8), O3 = OCT(num, 16), O4 = OCT(num, 24);
				return O4 + "." + O3 + "." + O2 + "." + O1;
			} else { return num; }
		}
		global.IP2Lng 	= function (ip) {
			if (isNaN(ip)) {
				var OCT = ip.split('.').reverse(), Res = 0;
				OCT.map(function (oc, o) { Res += (parseInt(oc) * Math.pow(256, o)); });
				return Res;
			} else { return ip; }
		}
		global.ARGS 	= function (args, from) {
			return Array.prototype.slice.call(args)
						.slice(from || 0);
		}
		global.TC 		= function (txt) {
			return txt.replace(/\b([a-z])/g, function ($0,$1) {
				return $1.toUpperCase();
			});
		}
		global.SOCKET 	= function (options) {
			// -----------------------------------------------------------------------
			var mtch, pnts, prms, qrys, sock, json, link, rslt,
				opts = Assign({ link: "/", escapes: 1 }, options||{}),
				cls  = 'SocketLink', as = { as: 'item' };
			// -----------------------------------------------------------------------
			try {
				link = 	opts.link;
				switch (IS(link)) {
					case 'link':
						mtch = 	link.match(regx.mch);
						pnts = 	mtch[1] .replace(regx.pnt.mch, regx.pnt.rep)
										.replace(encl.mch, encl.arr);
						prms = 	mtch[2] .replace(regx.prm.mch, regx.prm.rep)
										.replace(encl.mch, encl.obj);
						qrys = 	mtch[3] .replace(regx.qry.mch, regx.qry.rep)
										.replace(encl.mch, encl.obj);
						sock = 	{
							point: 	JSON.parse(pnts||'""'),
							params: JSON.parse(prms||'{}'),
							query: 	Assign(as,JSON.parse(qrys||'{}')),
						}; break;;
					case 'object': sock = Assign({}, defx, link); break;;
				}
				json = 	JSON.stringify(sock);
				rslt = 	(cls+json);
			// -----------------------------------------------------------------------
			} catch (e) {
				console.log("\n[%s]:", e.message, {
					opts: opts, mtch: mtch, pnts: pnts, prms: prms,
					qrys: qrys, sock: sock, json: json, rslt: rslt
				}); rslt = 	cls+dfsx;
			}
			// -----------------------------------------------------------------------
			// console.log("\n\tSOCKET: %s\n", rslt);
			return rslt;
		}
		global.FJS 		= function (key, val) {
			var idxd = Imm.Iterable.isIndexed(val);
			return idxd ? val.toList() : val.toOrderedMap();
		}
		global.Iter 	= {
			Count: 		function (itr) {
				var val = Imm.fromJS(itr);
				try { return val.count(); }
				catch (e) { return 0; };
			},
			CountAll: 	function (data, cond) {
				cond = (cond || function (v,c) { return c; });
				var ITR   = (data instanceof Array?'List':'Map'),
					count = 0, CA = Iter.CountAll;
				Imm[ITR](data).map(function (v,k) {
					var is 	  = (typeof(v) === 'object'),
						added = (is ? cond(v,CA(v,cond)) : 0);
					count += (1 + added);
				}); return count;
			},
			Indexed: 	function  (val) {
				// ------------------------------------------
				return Imm.fromJS(val).toIndexedSeq().toJS();
			},
			Is: 		function (val) {
				// ------------------------------------------
				return (!!val && typeof(val) === 'object');
			},
			Has: 		function (val) {
				var itr = Imm.fromJS(val);
				if (Iter.Is(itr)) {
					itr = itr.toArray();
					for (var i=0; i<itr.length; i++) {
						if (Iter.Is(itr[i])) return true;
					};
				}; return false;
			},
		}
		global.INPUT 	= {
			Priority: function (priority) {
				// -----------------------------------------------
				switch (priority) {
					case  true: return '*';
					case false: return ' ';
					default: 	return '~';
				}
			},
			InValid: function (nput, name, fill) {
				// -----------------------------------------------
				var dflt = INPUT.Attr(nput,'data-default'),
					prty = INPUT.Attr(nput,'data-priority'),
					valu = nput.value;
				fill.push({
					name:  name, type:  prty,
					valid: (prty==" "||!!valu||!!dflt)
				});
			},
			Has: function (elm, attr) {
				// -----------------------------------------------
				return elm.hasAttribute(attr);
			},
			Attr: function (elm, attr) {
				// -----------------------------------------------
				return elm.getAttribute(attr);
			},
			Attrs: function (elm, attrs) {
				// -----------------------------------------------
				var res = {}; attrs.map(function (a,i) {
					var key = a.replace(/-([a-z])/g, function ($0, $1) {
						return $1.toUpperCase();
					}); res[key] = elm.getAttribute(a);
				}); return res;
			},
			Email: function (email) { return 'mailto:'+email; },
		}
		global.CSS 		= {
			Declare: function (selectors, properties) {
				var res = selectors.join(' ')+' {\n' +
					properties.map(function (v,i) {
						return CSS.Property.apply(CSS.Property, v);
					}).join('\n') +
				'\n}';
				return res;
			},
			Property: function (property, value, prefix, important) {
				var prefixed = (!!!prefix ? -1 : null),
					prefixs  = ['-webkit-','-moz-','-o-',''].slice(prefixed),
					suffix 	 = (!!important ? ' !important;' : ';'),
					res 	 = prefixs.map(function (v,i) {
						return ('\t'+v+property+': '+value+suffix);
					}).join('\n'); return res;
			},
			Flex: function (options) {
				var opts = (options || {}), f = 'flex', args = ARGS(arguments).slice(1),
					defs = Imm.Map(Assign({ Dir:'Row', Align:'C', Wrap:1 }, opts));
				return  classN.apply(classN,
					args.concat([f].concat(
						defs.map(function (v,k) {
									switch (v) {
										case 0:  return '';
										case 1:  return (f+k);
										default: return (f+k+(v||''));
									}
								}).toArray()
					)) //.join(' ').replace(/(\s{2,})/g, ' ').trim();
				);
			},
		}
		global.Stamp	= /**
		 * Expands a datetime into its various parts.
		 * @param {Date} date A `Date` object. If `null`, uses the current datetime.
		 * @param {('hrs'|'min'|'sec'|'mil')} round Will round the nearest whole as specified.
		 * @param {number} interval If specified with `round`, the rounding will be done at the interval specified.
		 * @param {('floor'|'ceil'|'round')} [method='floor'] The rounding method to use.
		 */
		function Stamp(date, round, interval, method) {
			date = date||new Date();
			var meth = method||'round',
				ints = {mil:1000,sec:60,min:60,hrs:24},
				nIdx = Object.keys(ints).indexOf(round);
			if (!isNaN(interval)) ints[round]=interval;
			var nvls = Object.values(ints);
			var ntvl = nvls.reduce(function(p,c,i){return i>nIdx?p:p*c;},1);
			var rslt = new Date(Math[meth]((date.getTime())/ntvl)*ntvl);
			return {
				yy: rslt.getFullYear(),
				mm: rslt.getMonth()+1,
				dd: rslt.getDate(),
				HH: rslt.getHours(), 
				MM: rslt.getMinutes(),
				ss: rslt.getSeconds(),
				ms: rslt.getMilliseconds(),
			};
		}

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		global.MODE = {};
		var hiddenProp = { enumerable: false, configurable: false, writable: false };
		try { 
			!!window && DEFINE(global.MODE, {
				Server  : Assign({}, hiddenProp, { value: false }),
				Browser : Assign({}, hiddenProp, { value:  true }),
			}); 
		} catch (e) {
			DEFINE(global.MODE, {
				Server  : Assign({}, hiddenProp, { value:  true }),
				Browser : Assign({}, hiddenProp, { value: false }),
			}); 
		}

};
