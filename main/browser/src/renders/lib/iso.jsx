'use strict';

module.exports = (function ISO(global, space, REST, user, path, LID) {


	////////////////////////////////////////////////////////////////////////
	// VARIABLES -----------------------------------------------------------

		global.NMESPC = space; 

		// Requires
		const 	PAGE 	= NMESPC.page;

		const   React 	= require('react');
		const	Reflux 	= require('reflux');
		const  Actions 	= require('../../actions')(Reflux);
		const   COMPS	= require('./components')(global, Reflux, Actions, null, LID);
		const RDOMServ 	= require('react-dom/server');
		const  Stores	= COMPS.Stores;
		const  Spaces	= {
			Auth: COMPS.Spaces['accessor'],
			Page: COMPS.Spaces[NMESPC.name],
		};
		const    App	= React.createFactory(COMPS.Elements[TC(PAGE.main)].App);
		const   Data	= Spaces.Page.Data[0].bind(REST)(path);
		const   Build	= {
			Auth: Spaces.Auth.Build(Actions, Stores, LID),
			Page: Spaces.Page.Build(Actions, Stores, LID),
		};
		const  Merger   = function Merger(data, res) {
			let dta = Imm.fromJS(data), mrg = Imm.fromJS(res);
			return dta.mergeDeepWith((o,n) => { 
				return ((IS(n)=='socket')?(o||null):n);
			}, 	mrg).toJS();
		}

		Reflux.initStore(Stores.App(LID));
		Reflux.initStore(Stores.Data);

		const   Single	= Stores.Apps[LID].singleton;
		const   State	= Single.state;
		const   Styles	= State.style.replace(/\n */g,' ');

		return {
			Styles:	Styles,
			HTML: 	'',
			State: 	State,
			Call: 	Spaces.Page.Call,
			Auth: 	function Auth(title) {
				global.TITLE  = title; 
				Single.reset();
				Build.Auth(user, TITLE);
			},
			Render: function (Build, Data) {
				return function Render(res) {
					Build.Page(Merger(Data,res), TITLE);
					return RDOMServ.renderToString(App());
				}.bind(this)
			}(Build, Data),
			Build: 	function (Build, Data, Single) {
				return function Builder(res) {
					Build.Page(Merger(Data,res), TITLE);
					return Single.state;
				}.bind(this)
			}(Build, Data, Single),
			Clear:  function Clear(LID) {
				delete Stores.Apps[LID];
			},
		};
});
