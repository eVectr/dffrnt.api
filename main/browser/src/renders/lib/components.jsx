/// <reference path="../../index.d.ts" />

'use strict';

module.exports = /**
 * Initializes all of the `Stores`, `Actions`, and `Components` for the App.
 * @param {NodeJS.Global|Window} global The `Window` object, when called from a `Browser`. The `global` object, when called from the `Node` server.
 * @param {ReFlux} Reflux The `ReFlux` object.
 * @param {FluxActions} Actions The `Flux-Actions` for this App.
 * @param {sIOs} IOs The `SocketIO` connections.
 */
function Comps(global, Reflux, Actions, IOs) {

	////////////////////////////////////////////////////////////////////////
	// VARIABLES -----------------------------------------------------------
		
		require('../../utils.js')(global);

		// The Payload
		const 	COMPS 			= {};

		// Requires
		const	React 			= require('react');
		const	RDOM 			= require('react-dom');
		const	StripeJS		= require('react-stripe-elements');
		const	Stores  		= require('../../stores')(Reflux, Actions, IOs);

		// Variables
		COMPS.Token 			= null;
		COMPS.Basic 			= null;
		COMPS.IsAuthd 			= false;
		COMPS.Receivers 		= 0;
		COMPS.Rejecters 		= 0;
		COMPS.React 			= React;
		COMPS.Actions 			= Actions;
		COMPS.Reflux 			= Reflux;
		COMPS.Stores 			= Stores;
		COMPS.Elements  		= {};
		COMPS.Elements.RDOM 	= RDOM;
		COMPS.Elements.StripeJS = StripeJS;

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		require('../../elements')(COMPS); 

		Stores.Content.render = function (LID) {
			const App = COMPS.Elements[TC(NMESPC.page.main)].App,
				  Ste = COMPS.Stores.Apps[LID].singleton.state;
			RDOM.hydrate(<App LID={LID} {...Ste} />, document.getElementById('app-root'));
		}
		
		return COMPS;
};
