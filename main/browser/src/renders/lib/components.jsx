'use strict';

module.exports = function Comps(global, Reflux, Actions, IOs, LID) {


	////////////////////////////////////////////////////////////////////////
	// VARIABLES -----------------------------------------------------------

		require('../../utils.js')(global);
		
		global.LOG 			= console.log;

		const 	PAGE 		= NMESPC.page;
		const 	COMPS 		= {};

		// Requires
		const	React 		= require('react');
		const	RDOM 		= require('react-dom');
		const	Spaces		= require('../../spaces');
		const	Stores  	= require('../../stores')(Reflux, Actions, Spaces, IOs);
			
		// Variables
		COMPS.Token 		= null;
		COMPS.Basic 		= null;
		COMPS.IsAuthd 		= false;
		COMPS.Receivers 	= 0;
		COMPS.Rejecters 	= 0;
		COMPS.Elements  	= { "/": function () { return; } };
		COMPS.React 		= React;
		COMPS.Actions 		= Actions;
		COMPS.Reflux 		= Reflux;
		COMPS.Spaces		= Spaces;
		COMPS.Stores 		= Stores;
		COMPS.Elements.RDOM = RDOM;

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		require('../../elements')(COMPS, LID); 

		const App = COMPS.Elements[TC(PAGE.main)].App;

		Stores.Content.render = function () {
			RDOM.hydrate(<App />, document.getElementById('app-root'));
		}
		
		return COMPS;
};
