
'use strict';

module.exports = {
	Data:  [
		function (path, req) { 
			var HLP = Assign({}, this.Help.Document);
			delete HLP.Auth; return HLP; 
		},
	],
	Build: function (Actions, Stores, LID) {
		return function (res) {

			var THS = this, content = Imm.OrderedMap(res), page = 0,
				nav = {}, pages = {}, styles = [], buttons = Imm.OrderedMap({}), 
				dtn = {subs:Imm.OrderedMap({})}, 
				btnOnClick = function (e) {
					Actions.Nav.select(this.state.page);
					return false;
				};

			const 	Selector = {
				Match: 	/%[(]([A-Z]+)[)][ds]/g,
				Parent: 'var[data-page="%(PAGE)d"]#nav~',
				Levels: 'var[data-1="%(ROOT)s"][data-%d="%s"]#nav~nav.sidebar [data-root="%(ROOT)s"][data-level="%d"][data-name="%s"]>.button>label',
				Hidden: Imm.Map({
					Root: 	'.sidebar>[data-root="%(ROOT)s"]',
					// Rest: 	'.sidebar>[data-root="%(ROOT)s"] *',
					Button: '.sidebar [data-page="%(PAGE)d"]>label',
					Blurs: 	'.sidebar .button:not([data-page="%(PAGE)d"])>label',
					Before: '.sidebar .button:not([data-page="%(PAGE)d"])>label:hover::after',
					After: 	'.sidebar [data-page="%(PAGE)d"]>label::after',
					NAfter: '.sidebar .button:not([data-page="%(PAGE)d"])>label::after',
					Others: '.sidebar [data-root="%(ROOT)s"]~[data-level="1"]~[data-level="1"]',
					Editor: 'section.pages>.page:not([data-page="%(PAGE)d"])',
				}),
			};
		
			function getMainStyle (keys) {
				var sel = Selector, mch = sel.Match, parent = sel.Parent, lvl = [sel.Levels],
					res = [], lnh = [3.25,2.75,2.25], rep = function (mch, $key) {  return keys[$key]; };
				// ----------------------------------------------------------
					sel.Hidden.map(function (v,k,i) {
						var slc = [parent, v], lev = [lvl, v], prp = [];
						// ------------------------------------------------------
						switch (k) {
							case 'Root': 	prp = prp.concat([
												['color','#213745',false,true],
												['background','#FFFFFF',false,true],
												['transition','background-color 0s linear',true,true],
											]); break;;
							/* case 'Rest': 	prp = prp.concat([
												['color','#213745',false,true],
												// ['opacity',1,false,true],
											]); break;; */
							case 'Button': 	prp = prp.concat([
												['cursor','default',false,true],
												['border-right','solid 1rem cornFlowerBlue',false,true],
											]); break;;
							case 'Blurs': 	prp = prp.concat([
												['cursor','pointer',false,true],
											]); break;;
							case 'Before': 	prp = prp.concat([
												['position','absolute',false,false],
												['color','cornFlowerBlue',false,true],
												['content',"'\\02003\\2022'",false,false],
											]); break;;
							case 'After': 	prp = prp.concat([
												['color','cornFlowerBlue',false,false],
											]); break;;
							case 'NAfter': 	prp = prp.concat([
												['content',"''",false,false],
											]); break;;
							case 'Others': 	prp = prp.concat([
												['box-shadow','none',true,true],
											]); break;;
							default: 		prp.push([
												'display','none',false,true
											]);
						}
						// ------------------------------------------------------
						res.push(CSS.Declare(slc, prp).replace(mch, rep).replace(/\n([\t]|(?=\}))/g, ' '));
					});
				// ----------------------------------------------------------
					keys.PATH.map(function (v,i,a) {
						var prp = [['display','table',false,true],['line-height',lnh[i]+'rem',false,true],['opacity',1,false,true]];
						res.push(CSS.Declare(lvl, prp)  .replace(mch, rep)
									.replace(/%d/g,i+1) .replace(/%s/g,v)
									.replace(/\n([\t]|(?=\}))/g, ' ')
								);
					});
				// ----------------------------------------------------------
					return res;
			}
		
			function getSortStyle (styl) {
				var brk = function (sel) { return sel.replace(/^[^{}]+(\{[^{}]+\})$/,'$1'); },
					srt = function (a,b) { a=brk(a); b=brk(b); switch (true) { case a>b: return 1; case a<b: return -1; default: return 0; }; }
				// console.log('SORTSTYLE:', styl.sort(srt).join('\n'))
				return 	styl.sort(srt).join('\n')
							.replace(/^([^{]+)( \{[^{}]+\})(?=\n.*\2)/gm,'$1,')
							.replace(/([^\n]+\n)\1+/g,'$1');
			}

			// -----
			content.map(function (space, nmspc, i) {
				var reqs = Imm.OrderedMap(space)
				// -----
				reqs.reverse().map(function (req, act, a) {
					var isAuth = (act.indexOf('/auth/') > -1);
					if (!isAuth) {
						var paths = TC(act).match(/\b(\w+)/g),
							kpath = paths.slice(),
							endpt = paths.slice(-1)[0],
							level = paths.length,
							id    = "Spc"+endpt,
							form  = "Frm"+endpt,
							root  = paths[0],
							btn   = buttons; page++;
						// -----
						for (var l=0; l < (level*2)-1; l+=2) {
							kpath.splice(l+1,0,'subs');
							btn = (btn[paths[l]]||dtn).subs;
						};	kpath = kpath.slice(0,-1);
						// -----
						buttons = buttons.setIn(kpath, Imm.Map({
							key: 	id, 		path: 	act,
							name: 	endpt, 		id: 	id,
							page: 	page, 		level: 	level,
							form: 	form, 		root: 	root,
							onClck: btnOnClick, subs: 	Imm.OrderedMap({})
						}));
						// -----
						nav[act] = { path: act, page: page };
						// -----
						pages[act] = {
							page: 	 page,
							items: 	[{
									tag: 	{ from: 'Explorer', name:[ 'Draft'] },
									props: 	 {
										act: 		act,
										key: 		form,
										id: 		form,
										name: 		endpt,
										paths: 		paths,
										page: 		page,
										method:  	req.method[0],
										body: 		{
											headers: 	req.headers,
											params: 	req.params,
											fills: 		Imm.OrderedMap(req.params)
														.map(function(){return '';})
														.toObject(),
											examples: 	req.examples
										},
										'data-point': act,
									},
								}, {
									tag: 	{ from: 'Stock', name: ['JSONP'] },
									props: 	{
										id: 	 Stores.Data.singleton.setPath(act),
										paths: 	 paths,
										page: 	 page,
										content: {}
									}
							}]
						};
						// -----
						styles = styles.concat(getMainStyle({
							PATH: paths, NAME: endpt, PAGE: page, ROOT: root
						}));
					}
				});
			});
			// console.log({ NAV: nav, BUTTONS: buttons, PAGES: pages });
			// -----
			return Stores.Apps[LID].singleton.updateStore({
			// return {
				page: 		{ num: 1, pth: ['Search'] },
				style: 		getSortStyle(styles),
				content: 	{
					built: 		true,
					nav: 		nav,
					segments: 	[{
						tag: 	{ from: 'Explorer', name: ['SideBar'] },
						props: 	{
							name: 	'requests',
							items: 	 buttons,
						}
					}, {
						tag: 	{ from: 'Explorer', name: ['Pages'] },
						props: 	 {
							name: 	'queries',
							items: 	 Imm.OrderedMap(pages),
						}
					}]
				},
			// };
			}, 	true);
		}
	}
}
