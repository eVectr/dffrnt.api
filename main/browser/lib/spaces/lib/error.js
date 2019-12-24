
'use strict';

/** @type {CFG.SPCE.SpaceHandler} */
module.exports = {
	Data:  [
		function (path, req) { return {}; },
	],
	Build: function (Actions, Stores, LID) {
		return function (res) {
			return Stores.Apps[LID].singleton.updateStore({
				content: 	{
					built: 		true,
					segments: 	{
						copy:  [{
							tag: 	'p', 
							props: 	{ className: 'lead text' }, 
							xerox:	true,
							items: 	[
								'Sorry, but the page you\'re looking for does not exist!',
								{ 	tag: 'a', 
									props: { 
										href: 	'javascript:history.back()',
										style: 	{ textAlign: 'right' },
									},
									items: [{ tag:'b', items:['Go Back'] }],
								},
							],
						}],
					}
				},
			}, 	true);
		};
	}
}
