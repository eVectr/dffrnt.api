
import React, { ReactDOM, CSSProperties } from "react";
import PropTypes, { func } from 'prop-types';

declare global {
    export interface FluxMixins {
        /**
         * ...
         */
        Defer:      {};
        General:    {};
        Static:     {};
        Dynamic:    {};
        MonoSpacer: {};
        Requests:   {};
        Items:      {};
        Receivers:  {};
        Sockets:    {};
        Phone:      {};
        Taggr:      {};
    }

    export namespace FluxElements {
        namespace Stock {
            /**
             * Renders a Bubble Immage/Button.
             */
            class Bubble extends React.Component<BubbleProps, BubbleProps> {}
        }
    }

    export namespace FluxComponents {
        /**
		 * Run actions that should only be executed in a Browser.
		 * @param callback A function that will execute Browser-specific actions.
		 */
		function onBrowser(callback: ()=>void): void;
        /**
         * A React Mixin Factory. Starts with a Base-Component, `kind`, and inherits the mixins specifified in `mixes`.
         * @param kind The Component type to base this Component on.
         * @param {...string} mixes A list of mixins for the Base-Component to inherit from.
         * @returns The mixed-in Base-Compenent for your new Component to extend.
         */
        function Mix<T extends keyof MixBase>(kind: T, mixes?: string[]): MixBase[T];
        /**
         * Takes a tag object and returns the Component class it represents.
         * @param tag The tag object that describe the Component.
         * @returns The specified Component.
         */
        function Tag<F extends string, N extends string>(tag: AgnoTag<F,N>): DFFComponent;
        /**
         * Takes a plain-object description of an Element and returns the appropriate Component.
         * @param config The plain-object description of the Component.
         * @param key An optional Component `key` for Elements within a list.
         */
        function Agnostic(config: AgnoProps, key: string): DFFComponent;
        /**
         * Returns a list of the appropriate Components with their `ReactKeys` set.
         * @param list A list of AgnoProps.
         */
        function Agnolist(list: AgnoProps[]): DFFComponent[];
        /**
         * Retrieves the classes needed for a specified **[Font-Awesome](https://fontawesome.com)** icon.
         * @param icon The name of the icon.
         * @param theme The theme of the icon.
         * @returns An array of strings needed to render the icon.
         */
        function FA(icon: string, theme?: ('fas'|'far'|'fal'|'fad'|'fab')): string[];
        /**
         * Wraps a `URL` inside of a `url(...)` statement for `CSS` stylings.
         * @param url A `URL` string.
         */
        function iURL(url: string): string;
        /**
         * Joins the string values of a plain object into a string.
         * @param obj A plain-object of `{ key: string }`.
         * @param delim A string to join the object values by.
         */
        function joinV(obj: { [key: string]: string }, delim: string): string;
        /**
         * Ensures an event **does not** perform it's default action.
         * @param e The event object.
         */
        function stopEvent(e: React.SyntheticEvent<Element,Event>): void;
        /**
         * A factory that creates an upload-handlers.
         * @param uri The request URI.
         * @param method The HTTP Method of this Upload Request.
         * @param id An arbitrary identifier to of the Reflux Receiver-Component
         * @param headers A plain-object of HTTP-Headers/Values
         * @returns An upload-handler to use in form-components.
         */
        function Uploader(uri: string, method: 'POST'|'PUT', id: string, headers: { [header:string]: string }): (e: React.UIEvent<HTMLInputElement>) => void;
    }
};
