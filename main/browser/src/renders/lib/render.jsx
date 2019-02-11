'use strict';

module.exports = function Elem(global) {


	////////////////////////////////////////////////////////////////////////
	// VARIABLES -----------------------------------------------------------

		// Requires
		const	IO 		= require('socket.io-client');
		const	IOs 	= { IO: IO, Access: null, Socket: null };
		const	Reflux 	= require('reflux');
		const  Actions 	= require('../../actions')(Reflux);

		const  COMPS 	= require('./components')(global, Reflux, Actions, IOs, LOCKER);

		COMPS.Stores.Run.Socket();
};
