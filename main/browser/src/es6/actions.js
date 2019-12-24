/// <reference path="../actions.d.ts" />

'use strict'

module.exports = /**
 * @type {import('../actions')}
 */
function (Reflux) { return {
	App: 		Reflux.createActions([
		"connect",
		"pause",
		"progress",
		"identify",
		"disconnect",
	]),
	Nav: 		Reflux.createActions([
		"select",
	]),
	Content: 	Reflux.createActions([
		"setup",
		"state",
		"build",
	]),
	Data: 		Reflux.createActions([
		"auth",
		"send",
		"receive",
		"place",
		"poll",
		"grab",
		"clear",
	]),
};	};
