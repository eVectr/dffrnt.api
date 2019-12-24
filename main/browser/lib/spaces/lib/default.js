
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
module.exports = {
	Data:  [
		function (path, req) { return {}; },
	],
	Build: function (Actions, Stores, LID) {
		return function (res) {
			Stores.Apps[LID].singleton.updateStore({
				page: 		1,
				styles: 	'',
				content: 	{
					built: 		true,
					nav: 		{},
					segments: 	[
						{
							tag: 	'SideBar',
							props: 	{
								name: 	'requests',
								items: 	 {},
							}
						}, {
							tag: 	'Pages',
							props: 	 {
								name: 	'queries',
								items: 	 {},
							}
						}
					]
				}
			});
		}
	}
}
