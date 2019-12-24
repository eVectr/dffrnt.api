/// <reference types="react"/>

import React, { ReactDOM, CSSProperties, StatelessComponent as SFC } from "react";
import * as PropTypes from 'prop-types';
import { Address } from "cluster";

declare global {
    export interface LinkObj {
        href: string;
        target?: '_blank'|'_self'|'_parent'|'_top'|string;
    }
    
    /**
     * The `cell` properties of the `EV.Content.Table` component.
     */
    export interface TableCell {
        /**
         * The content of the `cell`.
         */
        text: (string | JSX.Element);
        /**
         * A string of classes to add to the inner-`div` of the `cell`.
         */
        className?: string;
        /**
         * An object of `CSS` properties.
         */
        style?: CSSProperties;
        /**
         * When set, wraps the {@link text} in an `<a>` tag using the specified properties.
         */
        link?: LinkObj;
        /**
         * A `ReactKey` to identify the `<a>` tag created when {@link link} is set.
         */
        key?: string;
    }
    /**
     * A key/value object of `cell` objects to form a `row` in the `EV.Content.Table` component.
     */
    export interface TableRow {
        [columnName: string]: TableCell;
    }
    /**
     * The properties of the `EV.Content.Table` component.
     */
    export interface TableProps {
        /**
         * The id `attribute` of the Table.
         */
        id: string;
        /**
         * An `Array(n)`, where `n` is the amount of columns. Each element is string of a column's desired `fraction` (`#fr`) within the grid.
         */
        cols: string[];
        /**
         * An Array of `row` objects, with the first `row` is used as the **column-headers**.
         */
        items: TableCell[];
        /**
         * A `FormProps` object. This will render the Table as a. `EV.Form`, allowing you to leveerage it's capabilities.
         */
        form?: {};
        /**
         * ...
         */
        editable?: boolean;
    }
    /**
     * The properties of the `EV.Content.Table` component.
     */
    export interface TableProps2 {
        /**
         * The id `attribute` of the Table.
         */
        id: string;
        /**
         * An `Array(n)`, where `n` is the amount of columns. Each element is string of a column's desired `fraction` (`#fr`) within the grid.
         */
        cols: string[];
        /**
         * An `Array(n)`, where `n` is the amount of columns. Each element is string of a column's desired `alignment` (left|center|right) within the grid.
         */
        align?: ('L'|'C'|'R')[];
        /**
         * A list `rows`.
         */
        items: TableRow[];
        /**
         * A `FormProps` object. This will render the Table as a. `EV.Form`, allowing you to leveerage it's capabilities.
         */
        form?: {};
        /**
         * ...
         */
        editable?: boolean;
    }

    export namespace Props {
        /**
         * Properties of a `User`.
         */
        namespace User {
            interface Obj {
                uid: number;
                display_name?: string;
                email_address?: string;
                name: NameObj;
                photos?: Photos;
                location?: Location;
                details?: Details;
                provider_id?: number;
                services?: Props.SVC.JSN[];
                settings?: Settings;
                checks?: Checks;
                birth_date?: Date;
                member_since?: Date;
            }
            interface Photos {
                cover: string;
                profile: string;
            }
            interface Location {
                id: number;
                label: string;
                parts: {
                    city: string;
                    region: string;
                    country: string;
                };
                codes: {
                    region: string;
                    country: string;
                }
            }
            interface Details {
                hobbies: MultiObj[];
                languages: MultiObj[];
                nationalities: MultiObj[];
                religion: MultiObj;
                identity: {
                    sex: string;
                    marital: number;
                    gender: MultiObj;
                    orient: MultiObj;
                };
                misc: {
                    description: string;
                    education: {
                        institutions: string;
                        description: string;
                    };
                }
            }
            interface Settings {
                email: string;
                timezone: string;
                currency: string;
                language: MultiObj;
                modes: {
                    admin: boolean;
                    transactional: boolean;
                    provider: boolean;
                };
                stripe: {
                    acct_id: string;
                    cust_id: string;
                }
            }
            interface Checks {
                validated: boolean;
                verified: boolean;
                status: boolean;
                tour_done: boolean
            }
        }
        /**
         * Properties of an Address form.
         */
        interface Address {
            /**
             * The id-prefix.
             */
            id: string; 
            /**
             * A valid street line.
             */
            line1: string; 
            /**
             * A valid, secondary street line.
             */
            line2: string; 
            /**
             * A valid city.
             */
            city:  string; 
            /**
             * A valid region/province/state.
             */
            state: string; 
            /**
             * A valid postal/zip code.
             */
            postal_code: string; 
            /**
             * A valid country ISO-code.
             */
            country: string; 
            /**
             * A valid phone-number
             */
            phone: string; 
            /**
             * If `true`, renders the inputs closer together.
             */
            compact?: boolean;
            /**
             * If `true`, does **not** defer any invisible items from rendering.
             */
            noDefer: boolean;
        }
        /**
         * Properties of a saved payment-method Card.
         */
        interface Card {
            /**
             * The id of Card.
             */
            id: string;
            /**
             * The type of Card.
             */
            type: ('visa'|'master'|'discover'|'diners'|'amex'|'jcb');
            /**
             * The name of the Card.
             */
            name: string;
            /**
             * The last 4 digits of the Card number.
             */
            number: string;
            /**
             * The account-holder of the Card.
             */
            holder: string;
            /**
             * An 2-length array of the expiry month & year.
             */
            exp: [number,number];
            /**
             * The card's billing address.
             */
            address?: Address;
            /**
             * The card's checks-status.
             */
            checks?: {
                street: string;
                postal: string;
                cvc: string;
            };
            /**
             * ...
             */
            select?: boolean;
            /**
             * ...
             */
            small?: boolean;
        }
        /**
         * Properties of a new `PoS.Methods` component.
         */
        interface Cards {
            /**
             * The user's Stripe Account ID, if needed.
             */
            acct_id: string;
            /**
             * The user's Stripe Customer ID, if needed.
             */
            cust_id: string;
            /**
             * A list of CardProps.
             */
            cards: Props.Card[];
            /**
             * ...
             */
            form: {};
            /**
             * If `true`, the cards will be selectable as part of a form.
             */
            select: boolean;
            /**
             * If `true`, the cards will be rendered in a more compact way.
             */
            small: boolean;
            /**
             * If `true`, renders the the form to Add/Save a new card.
             */
            addNew: boolean;
        }

        namespace Transact {
            /**
             * Valid Transaction Statuses.
             */
            type Statuses = ('INQUIRED'|'IN_REVIEW'|'BOUNCED'|'REJECTED'|'OFFER'|'ACCEPTED'|'DECLINED'|'ESCROW'|'CANCELLED'|'CONFIRMED'|'DISPUTED'|'REFUNDED'|'COMPLETE');
            /**
             * ...
             */
            type Rate = ('Free'|'Flat'|'Hourly'|'Daily'|'Monthly'|'Quote');
            /**
             * ...
             */
            interface Interval<U extends string> {
                unit: U; value: number;
            }
            /**
             * ...
             */
            interface Quantity<U extends string> {
                step?: Interval<U>; 
                min?:  number; 
                max?:  number; 
            }
            /**
             * ...
             */
            interface Range extends Quantity<string> { 
                from:  number; 
                to:    number; 
            }
            /**
             * ...
             */
            interface DateRange extends Quantity<('minutes'|'hours'|'days'|'weeks')> { 
                from:  Date; 
                to:    Date; 
            }
            /**
             * ...
             */
            type When = {
                Free:     DateRange,
                Flat:     DateRange,
                Hourly:  { step: number; hours: number; },
                Daily:   { step: number; at: number; for: number; },
                Monthly: { every: number },
                Quote:    DateRange,
            }

            /**
             * An object representing when a statuse had changed.
             */
            interface History {
                stat: Statuses;
                time: Date;
                reason?: string;
                who?: number;
            }
            /**
             * The properties of Transaction Detail types.
             */
            interface Details<R extends Rate, Q extends boolean, D extends boolean, S extends boolean> {
                notes:    string;
                when:     S extends true ? When[R] : never;
                location: D extends true ? Address : never;
                quantity: Q extends true ? Quantity<string> : never;
                availability: {
                    Sunday: {  }
                };
            }
            /**
             * Properties of a Service Transaction.
             */
            interface Obj {
                /**
                 * The identifier of the transaction.
                 */
                id: number;
                /**
                 * The user_id of the customer.
                 */
                uuid: number;
                /**
                 * The provider_id of the propvider.
                 */
                pdid: number;
                /**
                 * The serice_id of the service that was––or is to be––rendered.
                 */
                svid: number;
                /**
                 * The service name.
                 */
                service: string;
                /**
                 * The service type.
                 */
                type: string;
                /**
                 * For providers, the name of the customer requiring the service. For customers, the name of the service provider.
                 */
                who: User.Obj;
                /**
                 * The status of the transaction.
                 */
                status: Statuses;
                /**
                 * Any details for this transaction.
                 */
                details: Details<Rate,boolean,boolean,boolean>;
                /**
                 * The charge of this transaction.
                 */
                charge: number;
                /**
                 * The datetimes of when any previous statuses had changed.
                 */
                history: History[];
                /**
                 * The date this transaction was last modified.
                 */
                modified: Date;
            }
            /**
             * Properties of a `PoS.Transacts`.
             */
            interface Table {}
        }

        namespace SVC {
            interface Quantity {
                enabled: boolean;
                unit: string;
                step: number;
                min: number;
                max: number;
            }
            interface OrderObj {
                card?: Card;
                datetime?: Date;
                quantity?: number;
                notes: string;
                subtotal: number;
            }

            interface Base {
                name: string;
                description: string;
                charge: number;
                rate: number;
                interact: boolean;
                quantity: Quantity;
                recurring: boolean;
            }
            interface JSN extends Base {
                id: number;
                kind: string;
            }
            interface Obj extends JSN {
                acct_id: string;
                cust_id: string;
                editable: boolean;
                inquire: boolean;
                step: number;
                order: OrderObj;
            }
            interface Sub {
                IDs: {
                    svid: number;
                    svc: string;
                    info: string;
                };
                order: OrderObj;
                name: string;
                desc: string;
                charge: number;
                rate: number;
                interact: boolean;
                quant: Quantity;
                recur: boolean;
                handle?: (e: React.SyntheticEvent<Element,Event>) => void
                onSubmit?: (r: TPQryObject) => void
            }
        }
    }

    export namespace FluxElements {
        namespace Evectr {
            namespace PoS {
                /**
                 * Renders an Address form.
                 */
                const Address: SFC<Props.Address>;
                /**
                 * Renders a saved payment-method Card.
                 */
				const Method: SFC<Props.Card>;
                /**
                 * Renders a user's saved payment-methods.
                 */
				class Methods extends React.Component<Props.Cards, Props.Cards> {}
            }
        }
    }
};
