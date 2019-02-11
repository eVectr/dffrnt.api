
'use strict';

module.exports = {
	Data:  [
		function (path, req) { return {}; },
	],
	Build: function (Actions, Stores, LID) {
		return function (res, title) {
			var fnull = function(v) { return !!v; };
			return Stores.Apps[LID].singleton.updateStore({
				header:		Assign({
					checked: 	true,
					identified: !!res,
					title: 		title||'',
				}, !!res ? {
					user: 		res,
					messages:	{
						kind:	'MSG',
						group:	'navDrops',
						id:		'navMessages',
						tab:	 1,
						icon:	'envelope',
						igroup: 'navMsg',
						all:	'/messages',
						items:	[
							{
								label: 	'John Smith',
								time:	'Yesterday',
								detail:	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...',
							}, {
								label: 	'John Smith',
								time:	'Yesterday',
								detail:	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...',
							}, {
								label: 	'John Smith',
								time:	'Yesterday',
								detail:	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...',
							}, 
						],
					},
					alerts: 	{
						kind:	'ALRT',
						group:	'navDrops',
						id:		'navNotify',
						tab:	 2,
						icon:	'bell',
						igroup: 'navNotif',
						all:	'/alerts',
						items: [
							{
								icon: 	'comment',
								label: 	'New Comment',
								time: 	'4 minutes ago',
							}, {
								icon: 	'user-friends',
								label: 	'3 New Connections',
								time: 	'12 minutes ago',
							}, {
								icon: 	'handshake',
								label: 	'1 Provider Response',
								time: 	'40 minutes ago',
							}, 
						],
					},
					admin:		{
						kind:	'BTN',
						group:	'navDrops',
						id:		'navUser',
						tab:	 3,
						icon:	'user-circle',
						label:	 Object.values(res.Profile.Name||'').join(' '),
						igroup: 'navAdmin',
						items: [
							{
								label: 	' Profile',
								href:	'/'+res.Scopes.display_name,
								icon:	'user',
							}, {
								label: 	' Update',
								href:	'/update',
								icon:	'edit',
							}, !!res.Scopes.modes.provider ? {
								label: 	' Services',
								href:	'/services',
								icon:	'handshake',
							} : null, {
								label: 	' Settings',
								href:	'/settings',
								icon:	'cog',
							}, {
								label: 	' Logout',
								icon:	'sign-out-alt',
								kind:	'submit',
								wrap: 	{ tag: { 
									from: 'Evectr', name: ['App','Logout'] 
								}	}
							}, 
						].filter(fnull),
					},
				} : {}),
			}, true);
		}
	}
}
