
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
module.exports = {
	Data:  function () { return {}; },
	Build: function (Actions, Stores) {
		return function (res) {
			Stores.App.updateStore({
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
