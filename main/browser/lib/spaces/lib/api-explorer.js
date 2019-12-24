
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
module.exports = {
	Data:  function () { return this.Help; },
	Build: function (Actions, Stores) {
		return function (res) {
			var THS = this, content = Imm.Map(res), page = 0,
				buttons = {}, pages = {}, nav = {}, styles = [],
				dtn = {subs:{}}, btnOnClick = function (e) {
					Actions.Nav.select(this.state.page);
					return false;
				};
			// -----
			content.map(function (space, nmspc, i) {
				var reqs = Imm.Map(space);
				reqs.reverse().map(function (req, act, a) {
					var isAuth = (act.indexOf('/auth/') > -1);
					if (!isAuth) {
						var paths = TC(act).match(/\b(\w+)/g),
							endpt = paths.slice(-1)[0],
							level = paths.length,
							id    = "Spc"+endpt,
							form  = "Frm"+endpt,
							root  = paths[0],
							btn   = buttons; page++;
						// -----
						for (var l=0; l < level-1; l++) btn = (btn[paths[l]]||dtn).subs;
						// -----
						btn[endpt] = {
							key: 	id,
							path: 	act,
							name: 	endpt,
							id: 	id,
							page: 	page,
							level: 	level,
							form: 	form,
							root: 	root,
							onClck: btnOnClick,
							subs: 	{}
						}
						// -----
						nav[act] = { path: act, page: page };
						// -----
						pages[act] = {
							page: 	 page,
							items: 	[{
									tag: 	'Draft',
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
											fills: 		Imm.Map(req.params).map(function (v,k) {
															return '';
														}).toObject(),
											examples: 	req.examples
										},
										'data-point': act,
									},
								}, {
									tag: 	'JSONP',
									props: 	{
										id: 	 Stores.Data.setPath(act),
										page: 	 page,
										content: {}
									}
							}]
						};
						// -----
						styles = styles.concat(THS.getMainStyle({
							PATH: paths, NAME: endpt, PAGE: page, ROOT: root
						}));
					}
				});
			});

			// console.log('NAV', nav, 'BUTTONS', buttons, 'PAGES', pages)

			// -----
			Stores.App.updateStore({
				page: 		{ num: 2, pth: ['Search'] },
				styles: 	THS.getSortStyle(styles),
				content: 	{
					built: 		true,
					nav: 		nav,
					segments: 	[
						{
							tag: 	'SideBar',
							props: 	{
								name: 	'requests',
								items: 	 buttons,
							}
						}, {
							tag: 	'Pages',
							props: 	 {
								name: 	'queries',
								items: 	 pages,
							}
						}
					]
				}
			});
		}
	}
}
