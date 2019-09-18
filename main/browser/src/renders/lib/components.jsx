'use strict';

module.exports = function Comps(global, Reflux, Actions, IOs) {

	////////////////////////////////////////////////////////////////////////
	// VARIABLES -----------------------------------------------------------
		
		require('../../utils.js')(global);

		// The Payload
		const 	COMPS 			= {};

		// Requires
		const	React 			= require('react');
		const	RDOM 			= require('react-dom');
		const	StripeJS		= require('react-stripe-elements');
		const	Spaces			= require('../../spaces');
		const	Stores  		= require('../../stores')(Reflux, Actions, Spaces, IOs);

		// Variables
		COMPS.Token 			= null;
		COMPS.Basic 			= null;
		COMPS.IsAuthd 			= false;
		COMPS.Receivers 		= 0;
		COMPS.Rejecters 		= 0;
		COMPS.Elements  		= { "/": function () { return; } };
		COMPS.React 			= React;
		COMPS.Actions 			= Actions;
		COMPS.Reflux 			= Reflux;
		COMPS.Spaces			= Spaces;
		COMPS.Stores 			= Stores;
		COMPS.Elements.RDOM 	= RDOM;
		COMPS.Elements.StripeJS = StripeJS;

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		require('../../elements')(COMPS); 

		Stores.Content.render = function (LID) {
			const App = COMPS.Elements[TC(NMESPC.page.main)].App;
			RDOM.hydrate(<App LID={LID}/>, document.getElementById('app-root'));
		}
		
		return COMPS;
};
