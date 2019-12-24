
declare global {
	export const ReFlux = await import("reflux");

	export interface FluxActions {
		/**
		 * Actions used for initializing an App.
		 */
		private App:     {
			/**
			 * Starts the connection to all relevant `Sockets`.
			 */
			private connect(): void;
			/**
			 * Triggers an overlay that prevents interaction during loading, etc.
			 * @param pause `true` to pause; `false` to resume.
			 */
			private pause(pause: boolean): void;
			/**
			 * Handles the progression-data while the App is {@link pause|paused}.
			 * @param prog The amount of progress (`0-100`).
			 * @param extra Any extra data to fortify the `Store` with.
			 */
			private progress(prog: number, extra: {}): void;
			/**
			 * Handles responses sent by the Auth-API.
			 * @param ret The payload from a logout request.
			 */
			private identify(ret: ROUT.JSN.Payload): void;
			/**
			 * Disconnects a client's user-session.
			 * @param pay The payload from a logout request.
			 */
			private disconnect(pay: ROUT.JSN.Payload): void;
		};
		/**
		 * Actions used for API-Explorer navigation.
		 */
		private Nav:     {
			/**
			 * Handles pagination for the API Explorer.
			 * @param page The page number.
			 */
			private select(page: number): void;
		};
		/**
		 * Actions used for setting up the App's content.
		 */
		private Content: {
			/**
			 * Calls the API to retrieve the **scaffolding** required to generate a particular page.
			 */
			private setup(): void;
			/**
			 * Hydrates the store with the **scaffolding** required to generate a particular page.
			 * @param res The **scaffolding** data of a page.
			 */
			private state(res: TPQryObject): void;
			/**
			 * Renders the page with the **scaffolding** retrieved from the API.
			 */
			private build(): void;
		};
		/**
		 * Actions used for retrieving data from the API(s).
		 */
		public Data:    {
			/**
			 * Sends an auth-request to the Auth-API.
			 * @param point The `EndPoint` path (_sans any `path-params`_) to send the request to.
			 * @param data The request data. This **must** include the `method`. The `headers`, `query`/`body`, and `files` objects are `optional`.
			 * @param noProg If `false`; does not {@link pause} the App while waitng for a response.
			 */
			public auth(point: string, data: TPAction, noProg: boolean): void;
			/**
			 * Sends an data-request to the Data-API.
			 * @param point The `EndPoint` path (_sans any `path-params`_) to send the request to.
			 * @param data The request data. This **must** include the `method`. The `headers`, `query`/`body`, and `files` objects are `optional`.
			 * @param noProg If `false`; does not {@link pause} the App while waitng for a response.
			 */
			public send(point: string, data: TPAction, noProg: boolean): void;
			/**
			 * Accepts an API response, and maps it's rightful place within a `Store`. Any 
			 * `Components` subscribed to that particular piece of data will be triggered to 
			 * handle it. This is determined by the `query.id`/`body.id` that was set on 
			 * the originating request.
			 * @param data The response data.
			 */
			private receive(data: ROUT.JSN.Response): void;
			/**
			 * Maps data to it's rightful place within a `Store`. This is used to update 
			 * a `Store` from within a `Component`. Any `Components` subscribed to that 
			 * particular piece of data will be triggered to handle it.
			 * @param id The identifier of the subscriber `Component`.
			 * @param data The response data.
			 */
			public place(id: string, data: TPQryObject = {}): void;
			/**
			 * Clears data from the `Store` whose `key` matches the given `id`.
			 * @param id The identifier of the subscriber `Component`.
			 */
			public clear(id: string): void;
		};
	};

};

/**
 * Defines the `Flux-Actions` for use within the App.
 * @param Reflux The `Reflux` object.
 */
declare function FluxActionLoader(Reflux: typeof ReFlux): FluxActions;

export = FluxActionLoader;
