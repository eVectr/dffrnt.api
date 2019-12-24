
import React, { ReactDOM, CSSProperties } from "react";
import PropTypes from 'prop-types';

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
            
        }
    }

    export namespace FluxComponents {
        /**
		 * Run actions that should only be executed in a Browser.
		 * @param callback A function that will execute Browser-specific actions.
		 */
		function onBrowser(callback: ()=>void): void;
    }
};
