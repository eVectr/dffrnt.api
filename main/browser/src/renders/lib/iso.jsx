'use strict';

module.exports = function ISO(space, REST) {

	////////////////////////////////////////////////////////////////////////
	// VARIABLES -----------------------------------------------------------

		// Requires
		const PAGE 		= space.page;

		const Redux 	= require('reflux');
		const ReRedux 	= require('react-redux');
		const Reflux 	= require('reflux');
		const Actions 	= require('../../actions')(Reflux);
		const COMPS		= require('./components')(global, Reflux, Actions, null);
		const React 	= COMPS.React;
		const RDOMServ 	= require('react-dom/server');
		const Stores	= COMPS.Stores;
		const Spaces	= {
			Auth: COMPS.Spaces['accessor'],
			Page: COMPS.Spaces[space.name],
		};
		const App		= React.createFactory(COMPS.Elements[TC(PAGE.main)].App);
		const Merger   	= function Merger(data, res) {
			let dta = Imm.fromJS(data), mrg = Imm.fromJS(res);
			return dta.mergeDeepWith((o,n) => { 
				return ((IS(n)=='socket')?(o||null):n);
			}, 	mrg).toJS();
		}

	////////////////////////////////////////////////////////////////////////
	// MAIN ----------------------------------------------------------------

		return class Renders {
			constructor(LID, Path) {
				let THS = this, Data; THS.HTML = '';

				global.NMESPC = space; 
				Data = Spaces.Page.Data[0].bind(REST)(Path);

				Reflux.initStore(Stores.App(LID));
				Reflux.initStore(Stores.Data);

				THS.Single = Stores.Apps[LID].singleton;
				THS.Styles = THS.State.style.replace(/\n */g,' ');
				THS.Build  = {
					Auth: Spaces.Auth.Build(Actions, Stores, LID),
					Page: Spaces.Page.Build(Actions, Stores, LID),
				};
				THS.Render = ((Data, LID) => {
					return (function Render(pay) {
						this.Build.Page(Merger(Data,pay), TITLE);
						let res = {
							HTML:  RDOMServ.renderToString(App({ LID: LID })),
							State: JSON.stringify([this.State]),
						};
						return res;
					}).bind(THS);
				})(Data, LID);
			}

			get State () { return this.Single.state; }
			get Call  () { return Spaces.Page.Call; }
			
			Auth(title, user)  {
				global.TITLE  = title; 
				this.Single.reset();
				this.Build.Auth(user, TITLE);
			}
			Render(pay)  {}
			Clear(LID)   {
				delete Stores.Apps[LID];
			}
		};
};
