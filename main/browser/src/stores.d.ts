
/** @hidden */
import Immutable = require("immutable");

declare global {
	/**
	 * A container for the `Socket.IO` clients.
	 */
	export type sIOs = {
		IO:     typeof SocketIO;
		Access: SocketIO.Socket;
		Socket: SocketIO.Socket;
	};

	export namespace FluxStore {
		export abstract class App    extends Reflux.Store {
			/**
			 * The reference to the actual `singleton` of this instance.
			 */
			singleton: App;

			abstract constructor();
	
			/**
			 * Retrieves the authentication status of this App page.
			 */
			abstract isIdentified(): boolean;
			
			/**
			 * Starts the connection to all relevant `Sockets`.
			 */
			abstract private onConnect(): void;
			/**
			 * Triggers an overlay that prevents interaction during loading, etc.
			 * @param pause `true` to pause; `false` to resume.
			 */
			abstract private onPause(pause: boolean): void;
			/**
			 * Handles the progression-data while the App is {@link pause|paused}.
			 * @param prog The amount of progress (`0-100`).
			 * @param extra Any extra data to fortify the `Store` with.
			 */
			abstract private onProgress(prog: number, extra: {}): void;
			/**
			 * Handles responses sent by the Auth-API.
			 * @param ret The payload from a logout request.
			 */
			abstract private onIdentify(ret: ROUT.JSN.Response): void;
			/**
			 * Disconnects a client's user-session.
			 * @param pay The payload from a logout request.
			 */
			abstract private onDisconnect(pay: ROUT.JSN.Payload): void;
	
			abstract getPage(path: string): number;
			abstract getPath(path: string): string;
			
			abstract private setInitialState(defaults: TPQryObject): TPQryObject;
			abstract private updateStore(value: TPQryObject, receive: boolean): TPQryObject;
			abstract private secretlyUpdateStore (value: TPQryObject): void;
			
			abstract reset(): void;
	
			static id: string;
		};
	
		export abstract class Nav     extends ReFlux.Store {
			abstract constructor();
	
			/**
			 * Handles pagination for the API Explorer.
			 * @param page The page number.
			 */
			abstract private onSelect(page: number): void;
		
			readonly id = 'Nav';
		};
	
		export abstract class Content extends ReFlux.Store {
			private state: TPQryObject;
			private listenables: [Function];

			abstract constructor();
			
			/**
			 * Calls the API to retrieve the **scaffolding** required to generate a particular page.
			 */
			abstract private onSetup(): void;
			/**
			 * Hydrates the store with the **scaffolding** required to generate a particular page.
			 * @param {TPQryObject} res The **scaffolding** data of a page.
			 */
			abstract private onState(res: TPQryObject): void;
			/**
			 * Renders the page with the **scaffolding** retrieved from the API.
			 */
			abstract private onBuild(): void;
	
			/**
			 * Renders the application.
			 * @param LID A unique identifier for the current Client.
			 */
			abstract public render(LID: string): void;
	
			static id: string;
		};
	
		export abstract class Data    extends ReFlux.Store {
			abstract constructor();
	
			/**
			 * Sends an auth-request to the Auth-API.
			 * @param point The `EndPoint` path (_sans any `path-params`_) to send the request to.
			 * @param data The request data. This **must** include the `method`. The `headers`, `query`/`body`, and `files` objects are `optional`.
			 * @param noProg If `false`; does not {@link pause} the App while waitng for a response.
			 */
			abstract private onAuth(point: string, data: TPAction, noProg: boolean): void;
			/**
			 * Sends an data-request to the Data-API.
			 * @param point The `EndPoint` path (_sans any `path-params`_) to send the request to.
			 * @param data The request data. This **must** include the `method`. The `headers`, `query`/`body`, and `files` objects are `optional`.
			 * @param noProg If `false`; does not {@link pause} the App while waitng for a response.
			 */
			abstract private onSend(point: string, data: TPAction, noProg: boolean): void;
			/**
			 * Accepts an API response, and maps it's rightful place within a `Store`. Any 
			 * `Components` subscribed to that particular piece of data will be triggered to 
			 * handle it. This is determined by the `query.id`/`body.id` that was set on 
			 * the originating request.
			 * @param data The response data.
			 */
			abstract private onReceive(data: ROUT.JSN.Response): void;
			
			/**
			 * Checks if a new state is different from the current state.
			 * @param old The current state.
			 * @param nxt The proposed state.
			 */
			abstract private is(old: TPQryObject, nxt: TPQryObject): boolean;
			/**
			 * Checks if an identifier exists within the current state.
			 * @param id The identifier-path sent during the originating request.
			 */
			abstract private has(id: string): boolean;
	
			/**
			 * ???
			 * @param id The identifier-path sent during the originating request.
			 */
			abstract private poll(id: string): void;
			/**
			 * Maps data to it's rightful place within a `Store`. This is used to update 
			 * a `Store` from within a `Component`. Any `Components` subscribed to that 
			 * particular piece of data will be triggered to handle it.
			 * @param id The identifier-path sent during the originating request.
			 * @param data The response data.
			 */
			abstract public  place(id: string, data: TPQryObject = {}): void;
			/**
			 * Clears data from the `Store` whose `key` matches the given `id`.
			 * @param id The identifier-path sent during the originating request.
			 */
			abstract public  clear(id: string): void;
			/**
			 * Begins timing the request for logging performance statistics.
			 * @param data The request parameter objects.
			 */
			abstract private time(data: ROUT.JSN.Options): void;
			/**
			 * Ends the request timer and logs the performance statistics.
			 * @param id The identifier-path sent during the originating request.
			 * @param data The request parameter objects.
			 * @param isAlert If `true`, this data should be treated as a notification.
			 * @returns The duration of the request that was made.
			 */
			abstract private laspe(id: string, data: ROUT.JSN.Options, isAlert: boolean): number;
	
			
			/**
			 * Sets the response data into the appropriate place within the data-store.
			 * @param qry The originating request's `query` or `body` object.
			 * @param data The full response object.
			 * @param isAlert If `true`, this data should be treated as a notification.
			 * @returns The entire, mutated data-store.
			 */
			abstract private setIn(qry: ROUT.JSN.Query, data: ROUT.JSN.Response, isAlert: boolean): TPQryObject;
			/**
			 * Inserts an API response into the data-store, and gathers statistics.
			 * @param qry The originating request's `query` or `body` object.
			 * @param data The full response object.
			 * @param dur The total time it took to call the request.
			 * @param isAlert If `true`, this data should be treated as a notification.
			 */
			abstract private updateStoreIn(qry: ROUT.JSN.Query, data: ROUT.JSN.Response, dur: number, isAlert: boolean): void;
	
			/**
			 * A logger for performance .
			 * @param id The identifier-path sent during the originating request.
			 * @param path The endpoint path.
			 * @param iterTime The iteration results.
			 * @param rendTime The rendering results.
			 * @param fullTime The total results.
			 * @param state The new Store state.
			 * @param isAlert If `true`, this data should be treated as a notification.
			 */
			abstract private setStats(id: string, path: string, iterTime: number, rendTime: number, fullTime: number, state: TPQryObject, isAlert: boolean): void;
			/**
			 * Logs incoming REST responses.
			 * @param id The identifier-path sent during the originating request.
			 * @param data The reponse-stats object.
			 * @param args Anything you want included in the log
			 */
			abstract private logStore(id: string, data: {}, ...args?: any[]): void;
	
			/**
			 * Transforms an immutable object into plain-js.
			 * @param obj The immutable object.
			 */
			abstract private toJS(obj: Immutable.Map<string,any>): TPQryObject;
	
			readonly id = 'Data';
		};
		
	};

	/**
	 * ...
	 */
	export interface FluxStores {
		Apps:    { [LID: string]: FluxStore.App; };
		Nav:     FluxStore.Nav;
		Content: FluxStore.Content;
		Data:    FluxStore.Data;
		Run:     {
			Access(): void;
			API(): void;
			Socket(): void;
		};
		ISO:     {};
		/**
		 * Creates an application store for the current Client.
		 * @param LID A unique identifier for the current Client.
		 */
		App(LID: string): FluxStore.App;
	};

};

/**
 * Defines the `Flux-Stores` for use within the App.
 * @param Reflux The `Reflux` object.
 * @param Actions The `FluxActions`.
 * @param _Spaces ???
 * @param IOs The `SocketIO` container.
 */
declare function FluxStoreLoader(Reflux: typeof ReFlux, Actions: FluxActions, _Spaces: any, IOs: sIOs): FluxStores;

export = FluxStoreLoader;
