'use strict';

module.exports = /**
 * Custom Components for the **eVectr** front-end Application.
 * @param {FluxComponents} COMPS The global Component interface.
 * @void
 */
function Comps(COMPS) {

	////////////////////////////////////////////////////////////////////////
	// CONSTANTS -----------------------------------------------------------

		const 	MX 			= COMPS.Mixins;
		const 	Mix 		= COMPS.Mix;
		const 	Agnostic 	= COMPS.Agnostic;
		const 	Agnolist 	= COMPS.Agnolist;
		const 	Tag 		= COMPS.Tag;
		const 	Actions 	= COMPS.Actions;
		const 	Reflux 		= COMPS.Reflux;
		const 	React 		= COMPS.React;
		const 	Frag 		= React.Fragment;
		const 	KIDS 		= React.Children;
		const 	RClone 		= React.cloneElement;
		const 	RDOM 		= COMPS.Elements.RDOM;
		const 	FA 			= COMPS.FA;
		const 	iURL 		= COMPS.iURL;
		const 	joinV 		= COMPS.joinV;
		const 	onBrowser 	= COMPS.onBrowser;
		const 	stopEvent 	= COMPS.stopEvent;
		const 	Uploader 	= COMPS.Uploader;
		const 	DATA_TMR 	= {};

		const { StripeProvider,
				injectStripe: INJECT,
				PaymentRequestButtonElement,
				CardElement,
				CardNumberElement,
				CardExpiryElement,
				CardCVCElement,
				Elements
		} = COMPS.Elements.StripeJS;
		const   Stripe 		= { Key: null };

		COMPS.Elements.Evectr = {};
		const 	EV 			= COMPS.Elements.Evectr;

		// Configs
		const	RSignUp		= '/signup';
		const	RLogin 		= '/auth/login';
		const	RLogout 	= '/auth/logout';
		const 	RNotify	 	= COMPS.RNotify;

		function getBasic 	(user, pass) {
			COMPS.Basic = 'Basic '+btoa(user.value+':'+pass.value);
			return COMPS.Basic;
		}
		
		function stripeOpts (config = {}) {
			return Map({ style: {
				invalid:  { color: '#c23d4b', },
				base: 	  {
					color: '#424770',
					fontSize: '14px',
					letterSpacing: '0.025em',
					'::placeholder': {
						fontSize: '12px',
						color: '#aab7c4',
					},
					':-webkit-autofill': {
						backgroundColor:'white'
					}
				},
			}	}).mergeDeep(config).toJS();
		};

	////////////////////////////////////////////////////////////////////////
	// MIXINS --------------------------------------------------------------

		MX.Forms 	= {
			getAutoComp(name, props) {
				let hasAC = props.hasOwnProperty('complete'),
					compl = hasAC?props.complete:null;
				switch (IS(compl)) {
					case 'boolean': return name||'off';
					case  'string': return compl||'off';
					default: return null;
				}
			},
			getDefault(value) {
				return !!value?{defaultValue:value||undefined}:{};
			},
			getValue(value) {
				return !!value?{value:value||undefined}:{};
			},
			getFormats() {
				let THS = this, props = THS.props, 
					formatters = props.formatters,
					keys = Object.keys(props);
				if (!!formatters&&!keys.has('onChange')) {
					return { onChange(e) {
						e.stopPropagation(); e.preventDefault(); 
						let elem = e.target;
						elem.value = formatters.reduce((a,c)=>(
							a.replace(c.pattern, c.replace)
						),	elem.value);
					}	};
				} else return {};
			},
		};
		MX.BTN		= {
			Kinds: { button: 'button', submit: 'submit', a: 'a' },
			Elems: { button: 'button', submit: 'button', a: 'a' },
			Types: { button: 'button', submit: 'submit', a: 'text/html' },
		};
		MX.Trans 	= {
			/**
			 * @type {{[status: string]: MultiObj}}
			 */
			Status: {
				INQUIRED:  { kind: 'info', label: 'Inquired'  },
				IN_REVIEW: { kind: 'info', label: 'In Review' },
				BOUNCED:   { kind: 'warn', label: 'Bounced'   },
				REJECTED:  { kind: 'nope', label: 'Rejected'  },
				OFFER:     { kind: 'info', label: 'Offer'     },
				ACCEPTED:  { kind: 'warn', label: 'Accepted'  },
				DECLINED:  { kind: 'nope', label: 'Declined'  },
				ESCROW:    { kind: 'norm', label: 'Escrow'    },
				CANCELLED: { kind: 'nope', label: 'Cancelled' },
				CONFIRMED: { kind: 'warn', label: 'Confirmed' },
				DISPUTED:  { kind: 'nope', label: 'Disputed'  },
				REFUNDED:  { kind: 'mayb', label: 'Refunded'  },
				COMPLETE:  { kind: 'good', label: 'Complete'  },
			},
			Shared: [
				'OFFER',
				'ACCEPTED',
				'CANCELLED',
				'CONFIRMED',
			],
			/**
			 * Gets the Multi-props to create a Status token with.
			 * @param {Props.Transact.Obj} props 
			 * @returns {MultiObj}
			 */
			GetStatus(props) {
				let stat = props.status, 
					{ Status, Shared } = MX.Trans,
					rslt = Assign({}, Status[stat]);
				if (Shared.has(stat)) {
					let isMe = COMPS.UID==props.history.who;
					Assign(rslt, { level: ({
						true: 'You', false: 'Them'
					})[isMe] });
				}; 	return rslt;
			},
		};

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		// IMPORTS /////////////////////////////////////////////////////////

			const {
				Defer, Tags, Bubble, NormalLink, SocketLink, 
				PhoneNum, PhoneExt, Address, 
			} = COMPS.Elements.Stock;

		// ERRORS  /////////////////////////////////////////////////////////
		
			class ErrorBoundary extends React.Component {
				constructor(props) {
					super(props);
					this.state = { hasError: false };
				}
			
				static getDerivedStateFromError(error) {
					// Update state so the next render will show the fallback UI.
					return { hasError: true };
				}
			
				componentDidCatch(error, errorInfo) {
					// You can also log the error to an error reporting service
					console.error('REACT ERROR:', error, errorInfo);
				}
			
				render() {
					if (this.state.hasError) {
						// You can render any custom fallback UI
						return <h1>Something went wrong.</h1>;
					}
				
					return this.props.children; 
				}
			}

		// APP     /////////////////////////////////////////////////////////
			EV.App 				= class App 		extends Mix('Reflux','General') {
				
				/**
				 * 
				 * @param {*} props 
				 */
				constructor(props) {
					super(props); this.name  = 'APP'; 
					this.state = Assign({},props,{stripe:null});
					this.mode  = NMESPC.page.type||'';
					this.store = COMPS.Stores.App(props.LID); 
				}
				
				/**
				 * Gets the Header.
				 * @param {("stock"|"jumbo"|"main")} mode The structural style of the page.
				 * @param {{cover:{},user:{}}} title ghdfghfhfdgh
				 * @param {string[]} searches gdfghdfghfghd
				 */
				getHeader(mode, title, searches = []) {
					let elems = [];
					switch (mode) { 
						case 'cover': case 'stock': 
							elems = elems.concat([
								<Search key="sch" tokens={searches||[]}/>
							]);
					};
					switch (mode) {
						case 'cover': 
							title = title||{};
							elems = elems.concat([
								<Frag key="plq">
									<Cover uid={title.user.uid} img={title.cover} />
									<Plaque {...title.user} />
								</Frag>]); break;;
						case 'stock': 
							elems = elems.concat(
								<Frag key="ttl">
									<Title {...{
										kind: 		'page', 
										size: 		'large', 
										mode: 		'shadowed', 
										title: 		 title,
									}}/>
								</Frag>
							);
					};
					switch (mode) { case 'stock': case 'jumbo': 
						elems = elems.concat([<hr key="div" className="gridItemDivide"/>]);
					};
					return (<Frag key="hdr">{elems}</Frag>);
				}

				/**
				 * Render the Chat Threads.
				 * @param {("stock"|"jumbo"|"main")} mode The structural style of the page.
				 * @param {ChatProps[]} chats A list of the user's current Message Threads. 
				 */
				getThreads(mode, chats) {
					if (mode=='jumbo') return null;
					else return (<Threads {...{max:8,chats}} />);
				}

				render() {
					var props 	= this.state,
						mode 	= this.mode,
						header 	= props.header||{},
						search  = header.searches||[],
						title 	= header.title||null,
						user 	= header.user||{},
						scopes  = user.Scopes||{},
						content = props.content||{},
						footer 	= props.footer||{},
						credits	= footer.credits||{},
						chats	= footer.chats||[],
						ident	= !!header.identified,
						ready 	= props.ready||(()=>false),
						classes = classN({
							'gridMain':		true,
							'loggedIn': 	ident,
							'loggedOut': 	!ident,
							// 'pause': 		!!props.paused,
							'ready': 		ready(),
						},	mode);
					// ------------------------------------------------- //
						COMPS.Token 	= user.Token; 
						COMPS.IsAuthd 	= ident;
						COMPS.UID 		= scopes.user_id; 
						COMPS.Email		= user.Account; 
					// ------------------------------------------------- //
						return (<ErrorBoundary>
							<main id="content" className={classes}>
								{this.getHeader(mode,title,search)}
								<Foot credits={credits} />
								<Content {...content} />
								<Head home={credits.website} 
									alerts={header.alerts||{}}
									messages={header.messages||{}} 
									admin={header.admin||{}}
									title={title} />
								{this.getThreads(mode,chats)}
								<div className="searchDim"></div>
							</main>
						</ErrorBoundary>);
				}
			};

			EV.App.Signup 		= class Signup 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); let _refs = {
						'form'    : React.createRef(),
						'username': React.createRef(),
						'password': React.createRef(),
						'confirm' : React.createRef(),
						'agree'   : React.createRef(),
					};
					// ---------------------------------------------------------- //
						this.name  		  = 'SIGNUP';
						this.handleSignup = this.handleSignup.bind(this);
						this._refs 		  = _refs;
						this.REFS 		  = {
							/**
							 * @type {HTMLFormElement}
							 */
							get     form() { return _refs.form.current; 	},
							/**
							 * @type {HTMLInputElement}
							 */
							get username() { return _refs.username.current; },
							/**
							 * @type {HTMLInputElement}
							 */
							get password() { return _refs.password.current; },
							/**
							 * @type {HTMLInputElement}
							 */
							get  confirm() { return _refs.confirm.current; 	},
							/**
							 * @type {HTMLInputElement}
							 */
							get    agree() { return _refs.agree.current; 	},
						};
					// ---------------------------------------------------------- //
						
				}

				handleSignup(e) {
					e.stopPropagation(); e.preventDefault();
					let { username, password, confirm, agree } = this.REFS
					Actions.Data.send(RSignUp, { 
						method: 'POST', body: { 
							email:    username.value,
							password: password.value,
							confpass: confirm.value,
							agree: 	  !!agree.checked,
						}
					}, 	false);
				}

				render() {
					let THS 	= this,
						REFS 	= this._refs,
						props	= this.props,
						size	= props.size||'some',
						start	= props.start||'eight',
						name	= 'user-signup',
						styles	= ['spread','gridSlice','spaced'],
						align	= classN(start,size),
						terms 	= props.terms||[],
						attrs 	= {
							'id':			 name,
							'name':			'signup',
							'data-action': 	'/signup',
							'method':		'POST',
							'className':	 classN(styles),
							'buttons':		[{
								kind:    "submit", 
								label:   "Sign Up!",
								styles: ['good'], 
								large:   true, 
								block:   true, 
								start, size,
							}],
						};
					return (
						<Form key='signupfrm' ref={REFS.form} {...attrs}>
							<Form.Xput 	   {...{id:			'signup-email',
												name:		'email',
												kind:		'email',
												icon:		'envelope',
												styles:		 align,
												placeholder:'you@email-domain.com',
												complete:	'username email',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.username} />
							<Form.Xput     {...{id:			'signup-password',
												name:		'password',
												kind:		'password',
												icon:		'key',
												styles:		 align,
												placeholder:'Password',
												complete:	'new-passowrd',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.password} />
							<Form.Xput     {...{id:			'signup-confirm',
												name:		'confpass',
												kind:		'password',
												icon:		'unlock-alt',
												styles:		 align,
												placeholder:'Confirm Password',
												complete:	'new-passowrd',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.confirm} />
							<Form.Checkbox {...{id: 		'signup-agree',
												name: 		'agree',
												label:		'I agree to these Terms:',
												styles: 	[start,size,'good-y','nope-n'],
												required:	 true,
												yes:		'YES',
												no:			'NO',
											}} forRef={REFS.agree} />
							<div className="code one more reach" style={{fontSize:'.9rem',gridRowEnd:7}}>
								<div style={{paddingLeft:0}}>
									{terms.map((t,i) => Agnostic(t,i))}
								</div>
							</div>
							<hr  className={align}/>
						</Form>
					);
				}

			}

			EV.App.Login 		= class Login 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); let _refs = {
						'form': 	React.createRef(),
						'username': React.createRef(),
						'password': React.createRef(),
						'remember': React.createRef(),
					};
					this.name  		 = 'LOGIN';
					this.id			 = 'user-login',
					this.handleLogin = this.handleLogin.bind(this);
					this._refs 		 = _refs;
					this.REFS 		 = {
						/**
						 * @type {HTMLFormElement}
						 */
						get     form() { return _refs.form.current; },
						/**
						 * @type {HTMLInputElement}
						 */
						get username() { return _refs.username.current; },
						/**
						 * @type {HTMLInputElement}
						 */
						get password() { return _refs.password.current; },
						/**
						 * @type {HTMLInputElement}
						 */
						get remember() { return _refs.remember.current; },
					};
				}

				handleLogin(e) {
					e.stopPropagation(); //e.preventDefault();
					let enc, { username:usr, password:pss, remember:rem, form } = this.REFS;
					usr.disabled = pss.disabled = true;
					enc = `'Basic ${btoa(`${usr.value}:${pss.value}`)}`;
					usr.value = pss.value = '';
					Actions.Data.auth(RLogin, { 
						method: 'POST',
						headers: { authorization: enc },
						body: { 
							remember: rem.checked, 
							id: this.id 
						}
					}, 	false);
					form.submit(); 
				}

				getAutoCompFix(name, source) {
					return (<iframe key={name} {...{
						src: source, id: name, name: name, 
						style: {display:'none'}
					}}/>);
				}

				render() {
					let THS 	= this,
						REFS 	= THS._refs,
						name	= THS.id,
						props	= THS.props,
						size	= props.size||'some',
						start	= props.start||'one',
						styles	= ['spread','gridSlice'],
						align	= classN(start,size),
						autoc 	= 'auto-login',
						source 	= '/public/html/auto.htm',
						attrs 	= {
							'id':			 name,
							'name':			'login',
							'action':		 source,
							'data-action': 	'/login',
							'method':		'post',
							'encType':		'multipart/form-data',
							'target':		 autoc,
							'className':	 classN(styles),
							'onSubmit': 	 THS.handleLogin,
						};
					return ([
						this.getAutoCompFix(autoc, source),
						<form key='loginfrm' ref={REFS.form} {...attrs}>
							<div className={classN(['submit'],start,size)} style={{order:1000}}>
								<Form.Button kind="submit" label="Login!"
										styles={['info']} large block
										action={THS.handleSignup}/>
							</div>
							<Form.Xput 	   {...{id:			'login-email',
												kind:		'email',
												icon:		'envelope',
												styles:		 align,
												placeholder:'you@email-domain.com',
												complete:	'username email',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.username} />
							<Form.Xput     {...{id:			'login-password',
												kind:		'password',
												icon:		'key',
												styles:		 align,
												placeholder:'Password',
												complete:	'current-password',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.password} />
							<Form.Checkbox {...{id: 		'login-remember',
												label:		'Remember Me:',
												styles: 	[start,size,'good-y','info-n'],
												complete:	 true,
												yes:		'YES',
												no:			'NO',
											}} forRef={REFS.remember} />
							<hr  className={align}/>
						</form>
					]);
				}

			}

			EV.App.Logout 		= class Logout	 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'LOGOUT';
					this.id = 'user-logout';
					this.handleLogout = this.handleLogout.bind(this);
				}

				handleLogout(e) {
					e.preventDefault(); e.stopPropagation();
					let req = { 
							method: 'POST',
							headers: { token: COMPS.Token },
							body: { id: this.id }
						};
					Actions.Data.auth(RLogout, req, true);
					return false;
				}

				render() {
					let THS 	= this,
						props 	= THS.props,
						name  	= THS.id,
						tab 	= props.tabIndex,
						autoc 	= 'autocomp',
						source 	= '#',
						attrs 	= {
							'id':			 name,
							'name':			 name,
							'action':		 source,
							'data-action': 	'/logout',
							'method':		'POST',
							'target':		 autoc,
							'onSubmit': 	 THS.handleLogout,
							'tabIndex': 	 (tab||'').toString(),
						};
					return (<form key='auth' {...attrs}>{props.children}</form>);
				}
			};

			EV.App.Sessions 	= class Sessions 	extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'SESSIONS';
					// ---------------------------------------------------
						THS.id    = 'user-sessions-tbl';
					// ---------------------------------------------------
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let { stamp, items = {} } = (store[THS.id]||{});
							if (!!stamp&&stamp!==THS.state.stamp) return {  
								loaded: true, status: 'done', 
								list: items.user||[], stamp,
							};	else return null;
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { stamp, status, list } = ( 
								props.stamp>state.stamp?props:state
							);  return {
								stamp:	stamp, 
								status:	status, 
								list:	list,
							};
						};	return null;
					}

					componentDidMount() {
						let prop = this.state, 
							send = Actions.Data.auth,
							load = !!prop.loaded;
						if (!!document&&!load) {
							let url = '/auth/sessions',
								id  = this.id; 
							setTimeout(() => send(url, {
								method:	 'GET', 
								headers: { token: COMPS.Token },
								params:	 {}, 
								query:   { id },
							}	),	1000);	}
					}

				// FUNCTION  /////////////////////////////////////////////////////////

					/**
					 * Renders the user-sessions table.
					 * @param {Object} props The component properties.
					 * @param {{}[]} props.list A list of user sessions.
					 */
					SessList({ id, list = [], stamp, status } = props) {
						let data, rslt,
							NA   =  'N/A',
							cnt  =  list.length,
							empt =  cnt==0,
							SSID =  '',
							emph =  (SS) => (SS.current?{fontStyle:'italic'}:{}),
							ofst =  (new Date().getTimezoneOffset()*60000),
							dig2 =  '2-digit',
							dopt =  [ 'en-US', { 
										year: dig2, month:  dig2, day:  dig2, 
										hour: dig2, minute: dig2, 
									}	],
							clnm =  { ipa:"IP",dev:"Device",brw:"Browser",snc:"Since",act:"..." },
							dflt = 	FromJS({ 
										cols:  ['.8fr','auto','1fr','1fr','.4fr'], 
										items: [{ 	
											[clnm.ipa]: { text: "" }, 
											[clnm.dev]: { text: "" }, 
											[clnm.brw]: { text: "No Sessions Here!" }, 
											[clnm.snc]: { text: "" }, 
											[clnm.act]: { text: "" },
									}	] 	}), 
							itms =  list.map((SS,i,_a,B) => (B=emph(SS), SS.current&&(SSID=SS.ssid), ({
										[clnm.ipa]: { style: B, text: SS.ip||NA },
										[clnm.dev]: { style: B, text: !!SS.browser ? (`${SS.device} [${SS.os}]`).replace('[]','').trim()||NA : NA },
										[clnm.brw]: { style: B, text: SS.browser||SS.device||NA },
										[clnm.snc]: { style: B, text: new Date(SS.since+ofst).toLocaleString(...dopt) },
										[clnm.act]: { style: B, text: (<Frag>
											<input key="ssid" type="hidden" name={`ssid@${i}`} value={SS.ssid} data-param/>
											<Form.Button key="btn" styles={['nope']} kind="submit" id={`Kill@${i}`} 
														action={(e)=>(e.currentTarget.dataset.id=i)}
														font=".5rem" icon="trash" disabled={SS.current} 
														/>
										</Frag>)}
									}))),
							clra =  (!empt ? [{
										[clnm.ipa]: { text: "" },
										[clnm.dev]: { text: "" },
										[clnm.brw]: { text: "" },
										[clnm.snc]: { text: "Clear All Devices", style: { fontWeight:'bold' } },
										[clnm.act]: { text: (<Frag>
											<input key="vert" type="hidden" name={`invert@${cnt}`} value="true" />
											<input key="ssid" type="hidden" name={`ssid@${cnt}`} value={SSID} data-param />
											<Form.Button key="btn" styles={['nope']} kind="submit" id={`Kill@All`} 
														action={(e)=>(e.currentTarget.dataset.id=i)} 
														font=".5rem" icon="trash" />
										</Frag>) }
									}] : []);
						// -----------------------------------------------------------
							data = FromJS(Assign({ 
								items: 	[...itms, ...clra]
							},{ form: 	{
								'id':			`${id}-form`,
								'rid':			`${id}`,
								'method':		'DELETE',
								'data-action': 	`/auth/sessions`,
								'data-differ':	 true,
								'api':          'auth',
								'params':		{},
								'query':		{},
								'stamp':		 stamp,
								'status':		 status,
								'style':		{ fontSize: 'small' },
							}	}));
						// -----------------------------------------------------------
							rslt = 	dflt.mergeDeepWith((o,n)=>n||o,data).toJS();
						// -----------------------------------------------------------
							return (<Content.Table2 key="sess" {...rslt} />);
					};

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS = this, ID = THS.id, SESS = THS.SessList, { list, stamp, status } = THS.state;
						return <SESS key="sess" id={ID} list={list} stamp={stamp} status={status}/>;
					}
			};
			EV.App.Sessions.defaultProps = {
				stamp:  new Date(),
				status: 'load',
				loaded: false,
			};

			EV.App.Modal 		= class Modal	 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'PORTAL';
					// --------------------------------------------------
						this.Root = document.getElementById('modal-root');
						this.Elem = document.createElement('div');
				}

				componentDidMount	() { 
					let { Root, Elem, props } = this;
					Elem.setAttribute("role","dialogue");
					Elem.setAttribute("aria-label",props.label);
					Root.appendChild(Elem); 
				}
				componentWillUnmount() { 
					this.Root.removeChild(this.Elem); 
				}

				render() {
					let { Elem, props } = this,	kids = props.children;
					return RDOM.createPortal(kids, Elem);
				}
			};

			EV.App.Dialogue  = function Dialogue({ show = [], steps = [], step = 1, closer } = props) {
				// ---------------------------------------------------------------------------------- //
					steps = steps.filter(s=>!!s);
				// ---------------------------------------------------------------------------------- //
				let cnts = steps.length,
					grid = { style: { gridTemplateColumns: `repeat(${cnts}, auto)` } },
					stat = { true: { className: 'current trunc' }, false: { className: 'trunc' } },
					stpr = (s,i)=>(s.step=(i+1), s.show=(step==s.step), s.key=`step-${s.step}`, s);
				// ---------------------------------------------------------------------------------- //
					steps = steps.map(stpr);
				// ---------------------------------------------------------------------------------- //
					return (!!show ? (
						<App.Modal step={step} label={steps[step-1].title}>
							<div className="dialog header" data-step={step}>
								<h6 className="heading trunc noSelect" {...grid}>
									{steps.filter(s=>!!!s.hidden).map(s=>(
										<span key={s.key} {...stat[s.show]}><span className="trunc">{s.title}</span></span>
									))}
								</h6>
								<button title="Close this Window" className="close tkn nope" onClick={closer}>X</button>
							</div>
							<div className="dialog box" data-step={step} {...grid}>{steps.map((s,i)=>(
								<div key={`step${i}`} className={classN({show:s.show})}>{s.content}</div>
							))}</div>
						</App.Modal>
					) : null);
			};

		// HEAD    /////////////////////////////////////////////////////////
			EV.Head 			= function Head(props) {
				let mode  = NMESPC.page.type||'',
					title = props.title,
					home  = props.home,
					msgs  = props.messages,
					alert = props.alerts,
					admin = props.admin,
					jumbo = mode=='jumbo',
					space = jumbo?'S':'B',
					flex  = ['flex','flexDirRow',`flexSpace${space}`],
					clss  = ['noSelect','gridItemBranding'],
					style = { 
						// backgroundImage: `url('public/images/Logo.png')` 
					};
				return (
					<header className={classN('gridItemHeader','gridHeader')} id="header">
						{/* <!-- BANNER --> */}
							<section className={classN(...clss.concat(flex))} id="banner" role="banner">
								<a href={`http://${home}`}>
									<div id="logo" className="gpu" style={style} role="logo"></div>
								</a>{jumbo && !!title ? 
								<header><h1 className="title gpu"><span className="trunc">{title}</span></h1></header> 
								: null}
							</section>
						{/* <!-- NAVIGATION --> */}
							{ !jumbo ?
							<nav className="gridItemNav gridTabs compact" tabIndex="0" role="menubar">
								<Head.SearchBtn />
								<Head.Drop {...msgs} />
								<Head.Drop {...alert} />
								<Head.Drop {...admin} />
								<input type="radio" className="ctrl" name="navDrops" id="navNone" tabIndex="1" defaultChecked/>
							</nav> : null}
					</header>
				);
			};
			EV.Head.defaultProps = {
				title: 		'',
				home: 		'',
				messages:	[],
				alerts:		[],
				admin:		[],
			};

			EV.Head.SearchBtn	= function SearchBtn({} = props) {
				return (COMPS.IsAuthd ? 
					<div className="gridDrop">
						<label role="menuitem" id="btnSearch">
							<a id="gotoSearch" className={FA('search')} href="#app-root"></a>
						</label>
					</div>
				: null)
			};

			EV.Head.Drop 		= class Drop		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'DROP';
				}

				render() {
					let props = this.props, 
						state = this.state, 
						load  = state._meta.load,
						group = props.group, 
						id 	  = props.id, 
						lid   = `${id}-lbl`, 
						mid   = `${id}-mnu`, 
						tab   = props.tab, 
						icon  = props.icon,
						label = props.label,
						igroup= props.igroup,
						items = props.items||[],
						all   = (!!props.all?{
									id:     `${igroup}-${items.length}`,
									igroup: igroup,
									href:   props.all,
									label:  props.allLbl,
								}:null),
						DItem = Head.Drop[props.kind||'MItem'];
					return (
						<div className="gridDrop">
							<input type="radio" className="reveal" name={group} id={id} aria-hidden="true" role="presentation"/>
							<label id={lid} className="reveal" htmlFor={id} tabIndex={tab} role="menuitem" aria-haspopup="true" aria-controls={mid}>
								<i className={FA(icon)} role="none"></i>
								{!!label?(<span className="hidden-xs hidden-sm" role="none">{label}</span>):null}
							</label>
							<Defer load={load} what={()=>(
								<div id={mid} className="drop reveal" role="presentation">
									<div className="menu" aria-labelledby={lid} role="menu">
										{items.map((v,i) => {
											let id = `${igroup}-${i}`;
											return (<DItem key={id} id={id} group={igroup} tab={tab} {...v}/>);
										}).concat(!!all?[
											<Head.Drop.ALL key={all.id} {...all} tab={tab} />
										]:[])}
									</div>
								</div>
							)} 	/>
						</div>
					);
				}
			};
			EV.Head.Drop.defaultProps = {
				_meta:	{
					load: false
				},
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	null, 
				label:	'',
				igroup:	'',
				items:	[],
				all:	'',
			};

			EV.Head.Drop.MItem 	= function MItem({ MenuItem, BtnElem, hasOpt = true, group, id, tab, href } = props) {
				let BProps = BtnElem.props||{}, BTag = Tag(BtnElem.tag);
				return (<Frag>
					{ !!hasOpt ? <input type="radio" className="ctrl" name={group} id={id} aria-hidden="true" role="presentation"/> 
					: null }<BTag {...BProps} href={href} tabIndex={tab} role="menuitem">{MenuItem}</BTag>
				</Frag>);
			};
			
			EV.Head.Drop.MSG 	= function MSG({ group, id, tab, href, time, label, detail } = props) {
				return (
					<Head.Drop.MItem {...{ group, id, tab, href }}
						MenuItem={(
							<div className="message prev">
								<header>
									<strong>{label}</strong>
									<span className="pull-right muted">
										<em>{time}</em>
									</span>
								</header>
								<div>{detail}</div>
							</div>
						)} 
						BtnElem={{ tag: 'a' }} />
				);
			};
			EV.Head.Drop.MSG.defaultProps = {
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	null, 
				label:	'',
				href:	'#',
				time:	'',
				detail:	'',
			};

			EV.Head.Drop.ALRT 	= function ALRT({ group, id, tab, href, time, label, icon } = props) {
				return (
					<Head.Drop.MItem {...{ group, id, tab, href }}
						MenuItem={(
							<div className="notification">
								<i className={FA(icon)}></i>{` ${label.trim()}`}
								<span className="pull-right muted small">{time}</span>
							</div>
						)} 
						BtnElem={{ tag: 'a' }} />
				);
			};
			EV.Head.Drop.ALRT.defaultProps = {
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	null, 
				label:	'',
				href:	'#',
				time:	'',
			};

			EV.Head.Drop.BTN 	= function BTN({ group, id, tab, href, kind, label, icon, wrap } = props) {
				let Kind	= MX.BTN.Kinds[kind||'a'],
					hasWrap = !!wrap,
					mattrs  = { group, id, tab, href },
					iattrs  = { 
						tag: 	MX.BTN.Elems[Kind], 
						props: 	{ type: MX.BTN.Types[Kind] }	
					},
					attrs  = (hasWrap ? wrap : iattrs), 
					item 	= (
						<label htmlFor={id}>
							<i className={FA(icon)}></i>{` ${label.trim()}`}
						</label>
					);
				return (
					<Head.Drop.MItem {...mattrs}
						MenuItem={(
							hasWrap ? (<Head.Drop.MItem {...mattrs}
								MenuItem={item} BtnElem={iattrs} hasOpt={false} 
							/>) : item
						)} 
						BtnElem={attrs} />
				);
			};
			EV.Head.Drop.BTN.defaultProps = {
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	null, 
				label:	'',
				href:	'#',
			};

			EV.Head.Drop.ALL 	= function ALL({ group, id, tab, href, label, icon } = props) {
				return (
					<Head.Drop.MItem {...{ group, id, tab, href }}
						MenuItem={(<div className="msg all"><strong>{label}</strong> <i className={FA(icon)}></i></div>)} 
						BtnElem={{ tag: 'a' }} />
				);
			};
			EV.Head.Drop.ALL.defaultProps = {
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	'angle-right', 
				label:	'Read All Messages',
				href:	'#',
			};

		// SEARCH  /////////////////////////////////////////////////////////
			EV.Search 			= function Search(props) {
				let id		=  "search",
					name	=  "terms",
					attrs 	= { id:id,name:id,method:'POST',action:'/results',accept:'text/html'},
					classes = ["gridItemSearch","gridSearch"],
					tokens	=   props.tokens||[],
					isSrch	=   NMESPC.name == 'results';
				return ( COMPS.IsAuthd ?
					<form {...attrs} className={classN('norm-b',...classes)} role="search">
						<div className="tkn norm" role="presentation"><span><i className={FA('search')}></i></span></div>
						<Form.Tokens {...{
							kind:			 "token",
							search:			  true,
							id:				  name,
							name:			  name, 
							placeholder: 	["i.e. New York, French, Tutor, etc."],
							// placeholder: 	["I'm looking for People who...","and/or..."],
							styles:			["gridItemSearchBox","bare"],
							complete:	 	 "off", 
							tokens:			  tokens,
							clear:		 	  true,
							verbs:		 	  true,
							removal:		 "delete",
							more: 			['Casual'],
							data:			{
								id:   		`${name}-sgst`, 
								url:  		'/search/suggest',
								context:     true,
							},
						}}/>
						<input  type="hidden" id="search-uid" name="uid" value={COMPS.UID} required/>
						<button type="submit" id="search-go"  className="tkn norm">
							<span>GO</span>{ !isSrch ? <Frag> <a href="/defined">Defined Search</a></Frag> : null }
						</button>
					</form> : <div className={classN(...classes)} role="presentation"></div>
				);
			}

		// COVER   /////////////////////////////////////////////////////////
			EV.Cover 			= class Cover 		extends Mix('Reflux', 'Static') {
				/**
				 * @param {{uid:number,img:string,load:boolean}} props 
				 */
				constructor(props) {
					super(props); let THS = this;
					// --------------------------------------------- //
						THS.name = 'COVER';
						THS.id = 'user_cover';
					// --------------------------------------------- //
						THS.handlePic  = Uploader(
							`/user/${COMPS.UID}/photos/cover`,
							"PUT", THS.id, {token:COMPS.Token}
						).bind(THS);
					// --------------------------------------------- //
						THS.mapState({
							[THS.id]: {
								default: {},
								/**
								 * @param {Props.User.Obj} user
								 */
								state({ photos = {} } = user) {
									let { cover } = photos;
									if (!!cover) return { 
										img: `${cover}?v=${(new Date().getTime())}`
									}; else return null;
								}
							},
						});
				}

				/**
				 * Renders a User's Cover Pic. Editable; if applicable.
				 * @param {Object} props 
				 * @param {string} props.image 
				 * @param {boolean} props.isUser 
				 * @param {(e:Event)=>void} props.onSubmit 
				 */
				Picture({ image, isUser = false, onSubmit } = props) {
					let id    = "cover_file",
						style = (!!image ? { 
							backgroundImage: `url('${image}')` 
						}  : null);
					return (
						<header className={classN("gridItemCover",{edit:isUser})} role="complementary">
							<div className="gpu" style={style} role="img"></div>
							{ isUser ? <Frag>
								<form className="coverForm" encType="multipart/form-data">
									<input type="hidden" name="single" value="true" required/>
									<input type="file" id={id} name="cover" onChange={onSubmit} required/>
								</form>
								<label className="coverLbl btn tkn norm some" htmlFor={id}>
									<span>Edit</span>
								</label>
							</Frag> : null }
						</header>
					);
				}

				render() {
					let { state, props, handlePic, Picture } = this,
						uid     = props.uid,
						isUser  = COMPS.UID == uid,
						image   = state.img||'';

							console.log('COVER:', Assign({}, props))

					return (
						<Picture {...{ image, isUser }} onSubmit={handlePic}/>
					)
				}
			};
			EV.Cover.defaultProps = {
				img: '',
				load: false,
			}

		// TITLE   /////////////////////////////////////////////////////////

			EV.Title 			= class Title 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'TITLE';
				}

				getSub(subtitle, isShadow) {
					let res = Assign(
						{ label: '', badges: []}, 
						FromJS(subtitle||{}).toJS()
					);
					if (!!res.label  ) res.label  = ['\u000a(',res.label,')'];
					if (!!!res.badges) res.badges = [];
					else if (isShadow) res.badges = res.badges.map(v => (
						v.kind = v.kind/*.split('').reverse().join('')*/,v)
					);	return res;
				}
				getFull(isShadow, title, subtitle) {
					return (isShadow?[title].concat(subtitle.label).join(''):null);
				}
				getAttrs(isShadow, id, title, subtitle) {
					return {
						className: 			classN('gridItemName',isShadow?'d':''),
						'aria-hidden': 		isShadow.toString(),
						'aria-labelledby': 	isShadow?null:id,
						'data-full':		this.getFull(isShadow, title, subtitle),
					};
				}
				getTitle(props, isShadow = false, size = 'large') {
					let id 		 = props.id,
						kind 	 = props.kind||'page',
						title 	 = props.title,
						subtitle = this.getSub(props.subtitle, isShadow),
						isUser 	 = kind=='user',
						shadow 	 = isShadow?'noShadow':null,
						attrs	 = this.getAttrs(isShadow, id, title, subtitle),
						subs     = (isUser?(
							<sup aria-hidden="true">
								<span>{subtitle.label[1]||''}</span>
								<Frag>
									{subtitle.badges.map((v,i) =>
										<Trusts.Badge key={`badge-${i}`} {...v}/>
									)}
								</Frag>
							</sup>
						):null);
					
					return (size!='small' ? (
						<header {...attrs} role="complementary">
							<div className={shadow}>
								<h1 id={isShadow?null:id} className="gpu">
									<span className="trunc">{title}</span>
									{subs}
								</h1>
							</div>
						</header>
					) : (
						<Frag>
							<h3 className="gpu" role="complementary"><span className="trunc">{title}</span></h3>
							<h3>{subs}</h3>
						</Frag>
					));
				} 

				render() {
					let props = this.props, size = props.size,
						isShadow = (props.mode=='shadowed'),
						isOnly   = (props.mode=='shadow-only');
					return (
						<Frag>
							{isShadow?this.getTitle(props, true, size):null}
							{this.getTitle(props, isOnly, size)}
						</Frag>
					);
				}
			}
			EV.Title.defaultProps = {
				id:			'pageTitle',
				kind: 		'page', 
				mode: 		'shadowed', 
				title: 		'...',
				size:		'large',
			}

		// PLAQUE  /////////////////////////////////////////////////////////
			
			EV.Plaque 			= class Plaque 		extends Mix('Reflux', 'Static') {
				constructor(props) {
					super(props); let THS = this;
					// --------------------------------------------- //
						THS.name = 'PLAQUE';
						THS.id = 'user_photo';
					// --------------------------------------------- //
						THS.handleChat = THS.handleChat.bind(THS);
						THS.handleJoin = THS.handleJoin.bind(THS);
						THS.handlePic  = Uploader(
							`/user/${COMPS.UID}/photos/picture`,
							"PUT", THS.id, {token:COMPS.Token}
						).bind(THS);
					// --------------------------------------------- //
						THS.mapState({
							[THS.id]: {
								default: {},
								/**
								 * @param {Props.User.Obj} user
								 */
								state({ photos = {} } = user) {
									let { profile } = photos;
									if (!!profile) return { 
										photo: `${profile}?v=${(new Date().getTime())}`
									}; else return null;
								}
							},
						});
				}

				/**
				 * Starts a new Chat with the User of this Profile.
				 * @param {React.UIEvent} e The click event.
				 * @void
				 */
				handleChat(e) {
					stopEvent(e);
					let { uid } = this.props, req = {
							method: 'POST',
							headers: { token: COMPS.Token },
							params: { uids: [uid].join(';') },
							body: { id: 'newchat' },
						};
					console.log('CHAT REQ:', req)
					Actions.Data.send('/threads', req, true);
				}
				/**
				 * Add the User of this Profile to the current User's Community.
				 * @param {React.UIEvent} e The click event.
				 * @void
				 */
				handleJoin(e) {
					stopEvent(e);
				}

				/**
				 * Renders a User's Profile Pic. Editable; if applicable.
				 * @param {Object} props 
				 * @param {string} props.name 
				 * @param {string} props.pic 
				 * @param {boolean} props.isUser 
				 * @param {(e:Event)=>void} props.onSubmit 
				 */
				Picture({ name, pic, isUser = false, onSubmit } = props) {
					let id = "picture_file";
					return (
						<header className="gridItemPic" role="complementary">
							<Bubble kind="user" name={name} img={pic} opts={['huge','cutout',{edit:isUser}]} id="profile_picture" htmlFor={id}/>
							{ isUser ? <form encType="multipart/form-data">
								<input type="hidden" name="single" value="true" required/>
								<input type="file" id={id} name="picture" onChange={onSubmit} required/>
							</form> : null }
						</header>
					);
				}

				render() {
					let { 	props, state, 
							handleChat, handleJoin, handlePic, 
							Picture 
						} = this,
						uid     = props.uid,
						isUser  = COMPS.UID == uid,
						mode	= props.mode||'show',
						pic		= state.photo,
						uname	= props.uname||'',
						fname	= props.name,
						badges	= props.badges||[],
						locale	= props.locale,
						age		= props.age,
						sex 	= { 
							M: 'mars', F: 'venus', I: 'transgender-alt' 
						}[props.sex];
					return (
						<Frag>
							{/* <!-- PROFILE PHOTO  --> */}
								<header className="gridItemPic d" role="complementary">
									<Bubble kind="user" name={fname} img={pic} opts={['small','er','lite']} />
								</header>
								<Picture name={fname} {...{ pic, isUser }} onSubmit={handlePic}/>
							{/* <!-- PROFILE INFO   --> */}
								<Title {...{
									id:			'profileName',
									kind: 		'user', 
									mode: 		'shadowed', 
									title: 		 joinV(props.name),
									subtitle: 	{ label: uname, badges: badges },
								}}/>
								<header className="gridItemInfo PLR" role="complementary">
									<div className="noShadow">
										<h4>{locale}</h4>
										<h6>{!!sex?<i className={FA(sex)}></i>:null}
											{!!age?<Frag>
												{age}<sup>years old</sup>
											</Frag>:null}
										</h6>
									</div>
								</header>
							{/* <!-- PROFILE SOCIAL --> */}
								{mode=='show' && !isUser ? (
								<header className="gridItemJoin" role="complementary">
									<div className="cutout">
										<button className="tkn mayb large" title={`Chat with ${uname}!`} onClick={handleChat}>
											<span><i className={FA('comments')}></i></span>
										</button>
									</div>
									<div className="cutout">
										<button className="tkn good large block" title={`Invite ${uname} into your world!`} onClick={handleJoin}>
											<span><i className={FA('user-plus')}></i> Join my Community</span>
										</button>
									</div>
								</header>
								) : null }
						</Frag>
					);
				}
			};

			EV.Plaque.Stub 		= class Stub 		extends EV.Plaque {
				constructor(props) {
					super(props); this.name = 'STUB';
				}

				render() {
					let props 	= this.props,
						pic		= props.Photo,
						user	= props.Account,
						name	= joinV(props.Name),
						badges	= props.Badges,
						locale	= joinV(props.Location,', '),
						age		= props.Age,
						sex 	= { 
							M: 'mars', F: 'venus', I: 'transgender-alt' 
						}[props.Sex],
						multis	= props.Multis;

					return (
						<a href={props.href||'#'} className="gridStub spread">
							{/* <!-- STUB PHOTO --> */}
								<Bubble kind="user" opts={['medium','dark']} name={props.Name} img={pic}/>
							{/* <!-- STUB INFO  --> */}
								<Title {...{
									kind: 		'user', 
									size: 		'small', 
									mode: 		 null, 
									title: 		 name,
									subtitle: 	{ label: user, badges: badges },
								}}/>
								<h6><span className="trunc">{locale}</span></h6>
								<h6>{!!sex?<i className={FA(sex)}></i>:null}
									{!!age?<Frag>
										{age}<sup>years old</sup>
									</Frag>:null}
								</h6>
								<div><div>{multis.map((v,i) => (
									<Content.Multi key={`stub-${i}`} weight="small" {...v}/>
								))}</div></div>
						</a>
					);
				}
			};

			EV.Plaque.defaultProps = {
				Account: '--{{ACCOUNT}}--',
				Photo: 	 '--{{PHOTO}}--',
				Name: 	 { 
					First: 	'--{{NAME.FIRST}}--', 
					Last: 	'--{{NAME.LAST}}--' 
				},
				Badges:  [],
				Age: 	 0,
				Sex: 	'I',
				Email: 	'--{{EMAIL}}--', 
				Location: 	{ 
					City: 	'--{{LOCATION.CITY}}--', 
					Region: '--{{LOCATION.REGION}}--', 
					Country:'--{{LOCATION.COUNTRY}}--' 
				},
			};
			EV.Plaque.Stub.defaultProps = {
				Account: '--{{ACCOUNT}}--',
				Photo: 	 '--{{PHOTO}}--',
				Name: 	 { 
					First: 	'--{{NAME.FIRST}}--', 
					Last: 	'--{{NAME.LAST}}--' 
				},
				Badges:  [],
				Age: 	 0,
				Sex: 	'I',
				Location: 	{ 
					City: 	'--{{LOCATION.CITY}}--', 
					Region: '--{{LOCATION.REGION}}--', 
					Country:'--{{LOCATION.COUNTRY}}--' 
				},
				Multis:	[],
			};

		// CONTENT /////////////////////////////////////////////////////////
			EV.Content 			= class Content 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'CONTENT';
				}

				getSegments(segments = {}) {
					return Map(segments).map((s,n)=>(
						IS(s)=='object'?s:{name:n,items:s}
					)	).toObject();
				}

				getSideBar(segments = {}) {
					let { copy, other, sidebar } = segments;
					if (!!sidebar&&!!sidebar.items) return sidebar; else {
						copy  =  copy||{items:[]}; 
						other = other||{items:[]};
						let dflts = { label: '', href: '#', icon: null },
							items = copy.items.concat(other.items).filter(v=>!!v);
						return {
							name:	'sidebar',
							items: 	items.map(v => {
								let prps = (v||{}).props||{}, 
									head = prps.header||{},
									href = {href:`#${prps.name}`};
								return (!!head?Assign({},dflts,head,href):null);
							}).filter(v=>!!v)
					}; 	}
				}

				render() {
					let { SideBar, Copy, Other  } = Content;
					let props = this.props, 
						sgmnt = this.getSegments(props.segments),
								{ copy, other } = sgmnt,
						sideb = this.getSideBar(sgmnt),
						jumbo = NMESPC.page.type=='jumbo',
						style = props.style;
						
					return (
						<section className="gridItemContent gridContent" style={style} role="main">
							{!jumbo?<SideBar {...sideb||[]} />:null}
									<Copy    {...copy ||[]} />
							{!jumbo?<Other   {...other||[]} />:null}
						</section>
					);
				}
			};

			EV.Content.SideBar 	= class SideBar 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'SIDEBAR';
				}

				render() {
					let props = this.props, name = props.name||'', bttns = props.items||[];
					return (
						<nav id={name} className="gridItemSidebar gridMenu" aria-controls="copy other">
							{bttns.map((v,i) => (
								<Frag key={i}>
									<label key={`sbttn-${i}`} className={classN("btn",!!v.small?'sub':null)}>
										<a href={v.href}>{`${v.label} `}
											{!!v.icon?(<i className={FA(v.icon)}></i>):null}
										</a>
									</label>
									{(v.subs||[]).map((s,k) => (
										<label key={`sbttn-${i}${k}`} className="btn sub">
											<a href={`#${s.name}`}>{`${s.label} `}
												{!!s.icon?(<i className={FA(s.icon)}></i>):null}
											</a>
										</label>
									))}
								</Frag>
							))}
						</nav>
					);
				}
			};

			EV.Content.Copy 	= class Copy 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'COPY';
				}

				render() {
					let props 	= this.props, 
						name 	= props.name, 
						panels 	= props.items||[],
						form 	= props.form||{},
						Elem 	= !!props.form?Form:'section';
					return (
						<Elem id={name} className="gridItemCopy PLR" {...form}>
							{panels.map((v,i) => Agnostic(v, i))}
						</Elem>
					);
				}
			};

			EV.Content.Other 	= class Other	 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'OTHER';
				}

				render() {
					let props = this.props, name = props.name, panels = props.items||[];
					return (
						<aside id={name} className="gridItemOther" aria-hidden="true">
							{panels.map((v,i) => Agnostic(v, i))}
						</aside>
					);
				}
			};

			EV.Content.Panel 	= class Panel 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'PANEL';
				}

				render() {
					let props = this.props,   name  = props.name, 
						head  = props.header, body  = props.body,
						accrd = !!props.accordian?'accordian':null,
						kind  = classN("panel",props.kind||'',{full:!!props.full},{trail:!!props.trail}), 
						fixed = !!(head||{}).fixed?'fixed':null,
						align = props.align||'',
						form  = props.form||null,
						Elem  = !!form?Form:'article';
					return (
						<section id={name} className={kind}>
							{!!head?<header className={classN('heading',fixed)}>
								<h3>{head.label}{!!head.icon?<i className={FA(head.icon)}></i>:null}</h3>
							</header>:null}
							<Elem className={classN('body',align,accrd)} {...form}>
								{body.map((v,i) => Agnostic(v, i))}
							</Elem>
						</section>
					);
				}
			};

			EV.Content.Slab 	= class Slab 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'SLAB';
					THS.kind  = {true:'radio',false:'checkbox'};
					THS.clss  = {true:'swap',false:''};
					THS.icon  = {'data-open':'','data-close':''};
					THS.hcls  = "heading reveal tkn norm block close";
				}

				getContent({ load = false, children }) {
					return ((!!load ? (
						<div key="ctn" className="body gridSlice gap reveal" aria-hidden="true">
							{children}
						</div>
					) : null));
				}

				render() {
					let THS = this, Elem = THS.getContent, hclass = THS.hcls, { 
							title, id, group, children, load, swap 
						} = THS.props;
					return (
						<div key={id} className={classN("panel","slab","block",THS.clss[!!swap])}>
							<input type={THS.kind[!!swap]} id={id} name={group||id} className="reveal open"/>
								{ !!swap ?
							<input type="radio" id={`${id}-cls`} name={group||id} className="reveal close"/>
								: null }
							<label className={hclass} htmlFor={id}><h6>{title}</h6></label>
								{ !!swap ? (
							<label htmlFor={`${id}-cls`} className={hclass}><h6 {...THS.icon}></h6></label>
								) : null }
							<Elem key="content" load={load}>{children}</Elem>
						</div>
					);
				}
			};
			EV.Content.Slab.defaultProps = {
				load: false
			};

			EV.Content.Trader 	= class Trader 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'TRADER';
				}

				get styles () {
					return ['tkn','block','reveal'];
				}

				render() {
					let THS   	=  this,
						props 	=  THS.props,
						id    	=  props.id,
						divide  =  !!props.divide,
						styles 	=  this.styles.concat(props.style||['norm']),
						lattr 	=  { 'htmlFor': id, 'className': classN(styles) },
						kids  	=  KIDS.toArray(props.children),
						label 	=  props.label||{};
					return (<Frag>
						<input type="checkbox" id={id} name={id} className="reveal trade"/>
						{kids[0]}
						<div className={classN(['label','spread'],{divide})}>
							<label {...lattr}><span {...label}></span></label>
						</div>
						{kids[1]}
					</Frag>);
				}
			};
			EV.Content.Trader.defaultProps = {
				divide: true,
			};

			EV.Content.Tabs 	= function Tabs(props) {

				function getLabel(props) {
					let label = props.label; return (!!label ?
						<span className="hidden thin">{`${label} `}</span>
					: null);
				} 

				function getIcon(props) {
					let iclass = ['hidden','wide'],
						icon   = props.icon; return (
						!!icon?<i className={classN(FA(icon),iclass)}></i>
						: null )
				}

				let main   	= `tab-${props.id||props.name}`,
					dflted  =  props.default,
					tabs 	=  props.tabs||[],
					count   =  tabs.length,
					gridEnd = {gridColumnEnd:count+1},
					start 	=  props.start||'one',
					size 	=  props.size||'spread';
				// --------------------------------------------------------------------------------- //
				return (
					<div className={classN('tabs','flex','flexDirColR',start,size)}>
						<nav className="gridTabs buttons" role="tabgroup">
							{tabs.map((t,i,_l,k,id,s,e)=>(
								/* Comp-Key  */ k  = `${main}-${i}`, 
								/* Elem ID   */ id = `${main}-${t.name}`,
								/* Tab-Start */ s  = i==0,
								/* Tab-End   */ e  = i==(count-1),
								<Frag key={k}>
									<input type="radio" id={id} name={main} className="reveal open" defaultChecked={i==0}/>
									<label key={`tab-btn-${i}`} className={classN({start:s,end:e})} htmlFor={`${main}-${t.name}`}>{
										getLabel(t)}{getIcon(t)
									}</label>
									<div key={`tab-ctn-${i}`} className={classN("reveal","gridSlice",{default:dflted})} style={gridEnd}>{
										Agnolist(t.body||[])
									}</div>
								</Frag>))}
						</nav>
					</div>
				);
			};

			/**
			 * Renders a Grid-based Table.
			 * @param {TableProps} props The parameter object.
			 */
			EV.Content.Table 	= function Table({ id, cols, items, form, editable } = props) {
				let hFrm = 	IS(form)=='object',
					Elem = 	hFrm ? Form : 'div', 
					cnum = 	(cols||[]).length,
					edit = 	!!editable?'edit':null,
					modu = 	(n)=>((n+1)%cnum), 
					attr = 	FromJS({
								className: classN(["table","spread","reveal"],edit),
								style: { gridTemplateColumns: cols.join(' ') },
							}).mergeDeep(FromJS(
								hFrm ? form : {}
							)).toJS();
				// -----------------------------------------------------------
				return (<Frag key={id}>
					<Elem key="tbl" id={id} {...attr}>
						{(items||[]).map((v,n)=>{
							let /* is header-row */ h = (n<cnum),
								/* modulo number */ m = modu(n),
								/* is 1st-column */ f = (m==1),
								/* is end-column */ e = (m==0);
							return (
								<div key={`${id}-n${n}`} className={classN("column",{nowrap:f,head:h,left:f,right:e})} style={v.style}>
									<div className={classN({trunc:f},v.className)}>{!!!v.link ? 
										(IS(v.text)!='object'?<span>{v.text}</span>:v.text) :
										(<a key={v.key||null} {...v.link}>{v.text}</a>)
									}</div>
								</div>
							);
						})}
					</Elem>
				</Frag>);
			}

			/**
			 * Renders a Grid-based Table.
			 * @param {TableProps2} props The parameter object.
			 */
			EV.Content.Table2 	= function Table2({ id, cols, align, items, form, editable } = props) {
				align = align||[];
				/**
				 * @type {TableRow[]}
				 */
				let clmn =  Imm.Map(items[0]).map((_C,CL)=>({text:CL}));
				/**
				 * @type {JSX.Element[]}
				 */
				let rows =  [], L = clmn.size-1, UND = undefined;
				let hFrm = 	IS(form)=='object', 
					Elem = 	hFrm ? Form : 'div', 
					edit = 	!!editable?'edit':null, 
					attr = 	FromJS({
								className: classN(["table","spread","reveal"],edit),
								style: { gridTemplateColumns: cols.join(' ') },
							}).mergeDeep(FromJS(
								hFrm ? form : {}
							)).toJS();
				// -----------------------------------------------------------
				return (<Frag key={id}>
					<Elem key="tbl" id={id} {...attr}>
						{Imm.List([clmn.toJS()].concat(items)).reduce((T,R,RN) => {
							Imm.Map(R).toList().map((C,CN) => {
								let /* TableCell Key */ K = `${id}[${CN}:${RN}]`,
									/* is header-row */ H = (RN==0),
									/* is 1st-column */ F = (CN==0),
									/* is end-column */ E = (CN==L),
									/* column aligns */ A = align[CN]||'L';
								T.push(
									<div key={K} className={classN("column",A,{nowrap:F,head:H,left:F,right:E})} style={C.style}>
										<div className={classN({trunc:F},C.className)||UND}>{ !!!C.link ? 
											(IS(C.text)!='object'?<span>{C.text}</span>:C.text) :
											(<a key={C.key||null} {...C.link}>{C.text}</a>)
										}</div>
									</div>
								);
							});	return T;
						},	rows)}
					</Elem>
				</Frag>);
			}

			/**
			 * ...
			 * @param {Object} props ...
			 * @param {string} props.name ...
			 * @param {{label:string,icon:string}} props.header ...
			 * @param {AgnoProps[]} [props.items] ...
			 * @param {JSX.Element[]} [props.children=[]] ...
			 * @param {{}} props.form ...
			 * @param {string} props.align ...
			 */
			EV.Content.Block 	= function Block({ name, header: head, items, children = [], form, align } = props) {
				let slice = !!(align||'').match(/\bgrid(Slice|Pair)\b/),
					Elem  = !!form?Form:'div';
				return (
					<Elem id={name} className={classN('block',align)} {...form}>
						{!!head?<h4 key={name} className={slice?"spread":null}>
							{head.label}<i className={FA(head.icon)}></i>
						</h4>:null}
						{!!items ? Agnolist(items) : children}
					</Elem>
				);
			};

		// SERVICE /////////////////////////////////////////////////////////

			EV.Services 		= class Services 	extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'SERVICES';
					// ---------------------------------------------------
						THS.fid = 'services';
					// ---------------------------------------------------
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let id = THS.fid, {stamp,items=[]} = (store[id]||{});
							if (!!stamp&&stamp!==THS.state.stamp) return { 
								stamp:  stamp,  loaded: true, 
								status: 'done', services: (items[0]||{}).services,
							}; 	else return null;	
						}	);
				}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS		= this,
							props 	= THS.state,
							edit  	= !!props.editable,
							srvcs	= props.services||[];

						console.log('SERVICES:', Assign({}, props));

						return (
							<Frag>{srvcs.map((s) => (
								<Service key={`svc-slab-${s.id}`} {...s} editable={edit}/>
							))}</Frag>
						);
					}
			};

			EV.Service 			= class Service 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'SERVICE';
					// -------------------------------------------------- //
						THS.tags  = {true:'edit',false:'show'};
						THS.state = props;
					// -------------------------------------------------- //
						THS.inquiryOpen  = THS.inquiryOpen.bind(THS);
						THS.inquiryClose = THS.inquiryClose.bind(THS);
						THS.gotoStep     = THS.gotoStep.bind(THS);
						THS.prevStep     = THS.prevStep.bind(THS);
						THS.nextStep     = THS.nextStep.bind(THS);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					//

				// EVENTS    /////////////////////////////////////////////////////////

					inquiryOpen(e) {
						e.stopPropagation(); e.preventDefault(); 
						this.setState({ inquire: true })
					}
					inquiryClose(e) {
						e.stopPropagation(); e.preventDefault(); 
						this.setState({ inquire: false })
					}

					gotoStep(step = 1) {
						this.setState({ step });
					}
					prevStep(nextState = {}) {
						let state = this.state;
						nextState.step = state.step-1;
						this.setState(nextState);
					}
					nextStep(nextState = {}) {
						let state = this.state;
						nextState.step = state.step+1;
						this.setState(nextState);
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					/**
					 * Renders a display version of the Service.
					 * @param {Props.SVC.Sub} props 
					 */
					showService({ IDs, desc, rate, charge, interact, quant, recur, handle } = props) {
						quant = quant||{};
						let svid  =  IDs.svid,
							dllar = (<span className="muted">$</span>),
							slash = (<span className="muted">/</span>),
							chrg  = [null,
								(c)=>('Free!'),
								(c)=>(<Frag key="chrg">{dllar}{c}</Frag>),
								(c)=>(<Frag key="chrg">{dllar}{c}{slash}hour</Frag>),
								(c)=>(<Frag key="chrg">{dllar}{c}{slash}day</Frag>),
								(c)=>(<Frag key="chrg">{dllar}{c}{slash}week</Frag>),
								(c)=>(<Frag key="chrg">{dllar}{c}{slash}month</Frag>),
								(c)=>('Quote'),
							][rate](charge);
						return (<Frag>
							<div className="greedy">{
								desc.match(/(\S[\S\s]+?)(?=\n\n|$)/g).map((p,i) => (
									<p key={`${IDs.svc}-${i}`} className="lead">
										{p.match(/([^\n]+)(?=\n|$)/g).map((t,k)=>
											<Frag key={`${i}-${k}`}>{t}<br/></Frag>
										)}
									</p>
								)	)
							}</div>
							<div className="sliver gridR"><h5><dt>{chrg}</dt></h5></div>
							<button className="tkn good some" onClick={handle}><span><i className="fas fa-credit-card"></i> Inquire</span></button>
							<label className="tkn info more reveal" htmlFor={IDs.info}><span><i className="fas fa-binoculars"></i> Get more Info</span></label>
							<input type="checkbox" id={IDs.info} name={IDs.info} className="reveal open"/>
							<div className="reveal spread">
								<p><small>Check out any relavent <b>Documents</b>, <b>Credentials</b>, <b>Images</b> &amp; <b>Links</b> regarding this Service below!</small></p>
								<br/>
								<Service.Files svid={svid} />
							</div>
						</Frag>);
					}
					/**
					 * Renders an editable version of the Service.
					 * @param {Props.SVC.Sub} props 
					 */
					editService({ IDs, name, desc, rate, charge, interact = 1, quant, recur = false } = props) {
						let id    = `${IDs.svc}-edit`,
							svid  =  IDs.svid,
							attrs = {
								id: 	id,
								style: ['info','large'],
								label: {
									'data-top':    ` Edit '${name}'`,
									'data-tcon':   "",
									'data-btm':    ` Add/Edit Credentials`,
									'data-bcon':   "",
								},
							};
						return (
							<Content.Trader {...attrs}>
								<Service.Form {...{ IDs, name, desc, rate, charge, interact, quant, recur }}/>
								<div className="C12 reveal btm">
									<p>
										<small>Check out any relavent <b>Documents</b>, <b>Credentials</b>, <b>Images</b> &amp; <b>Links</b> regarding this Service below!</small>
									</p>
									<br/>
									<Service.Files svid={svid} editable/>
								</div>
							</Content.Trader>
						);
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS   = this,
							tag   = THS.tags,
							props = THS.props,
							state = THS.state,
							meta  = state._meta,
							order = state.order,
							compl = state.complete,
							svid  = props.id,
							accid = props.acct_id,
							cusid = props.cust_id,
							inqr  = state.inquire,
							IDs   = {
								svid:	 svid,
								svc: 	`showSvc-${svid}`,
								info: 	`showSvcInfo-${svid}`,
							},
							edit  = !!props.editable,
							Serv  = THS[`${tag[edit]}Service`],  
							kind  = props.kind, 
							name  = props.name, 
							title = (<Frag>{name}<span className="mirror">{kind}</span></Frag>),
							desc  = props.description,
							chrg  = props.charge,
							rate  = props.rate,
							inter = props.interact,
							quant = props.quantity,
							recur = !!props.recurring,
							nonDR = [1,7].has(rate),
							step  = state.step,
							load  = meta.load,
							addr  = {
								holder: "Arian LeShaun Johnson",
								line1: "909-210 15 Ave SE",
								line2: "",
								city: "Calgary",
								state: "AB",
								postal_code: "T2G 0B5",
								country: "CA",
								phone: "4035619332",
							};

						return (
							<Content.Slab key={IDs.svc} load={load} id={IDs.svc} group="svcs" title={title} swap>
								<Defer load={load} what={()=>(
									<Serv {...{ IDs, name, desc, rate, charge:chrg, interact:inter, quant, recur }} handle={THS.inquiryOpen}/>
								)} 	/>{ edit ? null : 
								<App.Dialogue key="inquire" show={inqr} steps={[{ 
									title: `Purchasing ${name}`,
									content: (
										<PoS.Order {...{ 
											order, rate, charge:chrg, interact:inter, quant, recur, 
											onSubmit(req) {
												let { quantity, datetime, notes, subtotal } = req.body, order;
												subtotal = parseFloat(subtotal.replace(/[^\d.]+/g,''));
												subtotal = (isNaN(subtotal) ? 0 : subtotal);
												quantity = parseFloat(quantity||0);
												order    = { unit: quant.unit, quantity, datetime, notes, subtotal };
												THS.setState({ order, step: 2, complete: nonDR });
											}
										}} />
									)
								}].concat(( !nonDR ? [{ 
									title: 'Payment Method',
									content: (
										<div className="gridSlice C12" style={{gridGap:'0'}}>
											<Content.Trader {...{
												id: 	'pay-options',
												style: ['info','large','C12'],
												divide:  false,
												label: {
													'data-top':    'Or Use a Saved-Card',
													'data-tcon':   "\uf14a ",
													'data-btm':    'Or Use a Different Card',
													'data-bcon':   "\uf044 ",
												},
											}	}>
												<div className="C12 reveal top">
													<PoS.Methods {...{ 
														select: true,
														small: true,
														form: { 
															'repeated': true,
															'data-action': (req)=>{
																let order = THS.state.order, 
																	card  = JSON.parse(req.body.pmethod||'{}'), {
																		id, type, number, holder, exp, address = {}
																	} = card, rslt = Assign({}, order, {
																		card: { id, type, number, holder, exp, address }
																	});
																THS.setState({ step: 3, order: rslt });
															},
															'buttons': [{ 
																kind:'button', label:'Previous Section',
																style:'warn',   icon:'chevron-circle-left',
																action(e) { THS.setState({ step:1 }); }, 
																size:'C6', iconProps: { edge:true },
															},	{ 
																kind:'submit', label:'Use this Card',
																style:'good',   icon:'chevron-circle-right', 
																start:'S7',     size:'C6', iconProps: { 
																	after: true, edge: true,
															}	}]
														},
														cards: []	
													}} />
												</div>
												<div className="C12 reveal btm">
													<PoS.Card id="user-pay" mode="pick"
														ids={{ acct_id: accid, cust_id: cusid }}  
														onSubmit={(req)=>{
															let { id, billing_details: bill, card } = req,
																order = THS.state.order, 
																rslt = Assign({}, order, {
																	card: { id,
																		type: card.brand,
																		number: card.last4,
																		holder: bill.name,
																		exp: [
																			card.exp_month,
																			card.exp_year
																		],
																		address: Assign({
																			phone: bill.phone
																		}, 	bill.address),
																}	});
															THS.setState({ step: 3, order: rslt });
														}}
														form={{ 
															stamp: new Date(),
															buttons: [{ 
																kind:'button', label:'Previous Section',
																style:'warn',   icon:'chevron-circle-left',
																action(e) { THS.setState({ step:1 }); }, 
																size:'C6', iconProps: { edge:true },
															},	{ 
																kind:'submit', label:'Use this Card',
																style:'good',   icon:'chevron-circle-right', 
																start:'S7',     size:'C6', iconProps: { 
																	after: true, edge: true,
															}}]
														}}
														compact/>
												</div>
											</Content.Trader>
										</div>
									)
								}, 	{ 
									title: 'Summary',
									content: (
										<PoS.Summary {...{ svid, order }} form={{
											'repeated': true,
											'data-action': ((req)=>{
												console.info('SUMMARY:', req);
												THS.setState({ step: 4, complete: true });
											}),
											'buttons': [{ 
												kind:'button', label:'Previous Section',
												style:'warn',   icon:'chevron-circle-left',
												action(e) { THS.setState({ step:2 }); }, 
												size:'C6', iconProps: { edge:true },
											},	{ 
												kind:'submit', label:'Confirm',
												style:'good',   icon:'check-double', 
												start:'S7',     size:'C6',
												iconProps: { after:true },
											}],
										}} stamp={(step==3?new Date():undefined)} />
									)
								}] : [] ), [{ 
									title: 'Confirm',
									hidden: true,
									content: (
										<PoS.Confirm {...{ 
											svid, rate, order, complete:compl, stamp:new Date() 
										}} form={{
											'repeated': true,
											'data-action': ((req)=>{
												console.info('CONFIRM:', req);
												THS.setState({ inquire: false });
											})
										}} />
									)
								}])} step={step} closer={THS.inquiryClose}/> }
							</Content.Slab>
						);
					}
			};
			EV.Service.defaultProps = {
				_meta:	  {
					load: false
				},
				IDs: 	  {
					svid:	null,
					pdid:	null,
					svc: 	'svc',
					info: 	null,
				},
				inquire:  false,
				order:    {},
				step:     1,
			};

			EV.Service.Form  = function Form({ mode = 'edit', IDs, name, desc, rate, charge, interact = 1, quant, recur = false } = props) {
				IDs = Assign({ svid: null, pdid: null, svc: 'svc', info: null }, IDs||{}); quant = quant||{};
				// ------------------------------------------------------------------- //
				let add   = mode=='add', 
					edit  = mode=='edit', 
					id    = ({add:'addSvc',edit:`${IDs.svc}-${mode}`})[mode],
					pdid  =  IDs.pdid,
					svid  =  IDs.svid,
					quid  = `${IDs.svc}-quant`,
					unid  = `${IDs.svc}-QUnit`,
					btns  = { font:'.8em' },
					rates = (O=>({
						vals: O, keys: Object.keys(O)
					}))({ 
						3:'Hour', 4:'Day', 5:'Week', 6:'Monthly' 
					}),
					rtStr = (rate||'').toString(),
					isRTE = rates.keys.has(rtStr),
					form  = ({
						add:  () => ({
							'id':			`${id}-form`,
							'rid':			'services',
							'data-action': 	'/provider/service',
							'method':		'POST',
							'clear':		 true,
							'className':	'C12 block gridSlice',
							'buttons':		[
								{ kind:'submit',label:'Add Service',style:'norm' },
							],
							'params':		{ pdid: pdid },
							'query':		{ uids: COMPS.UID },
						}),
						edit: () => ({
							'id':			`${id}-form`,
							'data-action': 	`/service`,
							'method':		'PUT',
							'className':	'gridSlice spread reveal top',
							'buttons':		[
								Assign({}, btns, { 
									kind:'submit',	  style:'good',  label:'Save Changes',	
									icon:'save', 	  start:'one',	 size: 'more' }),	
								Assign({}, btns, { 
									kind:'button',	  style:'nope',  label:'Delete Service',	
									icon:'trash-alt', start:'eight', size: 'some' })
							],
							'params':		{ sids: svid },
							'query':		{ uids: COMPS.UID },
						}),
					})[mode](),
					inter = (v)=>(interact==v||undefined),
					rattr = {
						kind: 'radio',
						name: 'SvcInteract',
						labelRight: true,
						compact:    true,
					},
					intid = `${IDs.svc}-int`,
					chttr = {
						styles: 	['C5','info-y','warn-n'],
						yes:		'YES',
						no:			'NO',
						HOC:		true,
					},
					aattr = {
						styles: 	['third'],
						compact:	true,
					},
					nattr = Assign({
						kind:		'number',
						step:		 0.25,
						min:		 0.25,
					},	aattr),
					dattr = {
						className: 	"S5 C8",
						style: {
							fontSize: 'smaller',
							alignSelf: 'center',
						},
					};
				// ------------------------------------------------------------------- //
				return (
					<EV.Form {...form}>
						<div className="C7">
							<EV.Form.Xput {...{
								id:			`${IDs.svc}-name`,
								name:		"SvcName",
								icon:		'sign',
								kind:		'text',
								placeholder:'Service Name',
								priority:	'*',
								value:		 name,
								compact:	 true,
								validate: 	{
									pattern: /[\w &|\/:;'"#@!?+,.-]+/,
									invalid: 'Please specify a valid Service Name.',
								},
							}	} />
						</div>
						<div className="S8 C5">
							<EV.Form.Select {...{
								kind:		 'slc-txt',
								id: 		 `${IDs.svc}-rate`,
								name:		 'SvcRate',
								icon:		 'dollar-sign',
								reverse:	  true,
								title:		 'Rate',
								priority:	 '*',
								options:	[   ],
								value:		  rate,
								nullValue:	  "",
								compact:	  true,
								data:		{ url:'/list/rates',id:'select-rate' },
								onChange(e) {
									let targ  = e.currentTarget, { form, value } = targ,
										check = form.querySelector(`#${quid}`),
										input = form.querySelector(`#${unid}`);
									if (rates.keys.has(value)) {
										input.disabled = false;
										input.value = rates.vals[value];
										check.checked = check.disabled = input.disabled = true;
									} else {
										check.disabled = input.disabled = false;
										input.value = null;
									}
								},
								input:		{
									kind: 		'number',
									id: 		`${IDs.svc}-charge`,
									name:		'SvcCharge',
									placeholder:'0.00',
									min:		'0.00',
									max:		'10000.00',
									step:		'0.01',
									value:		 (Number(charge)||0).toFixed(2),
									validate: 	{
										pattern: /\d{1,5}\.\d{2}/,
										invalid: 'That price ain\'t legit',
									},
									restrict: 	[1,7,"1","7"],
								},
							}	} />
						</div>
						<div className="C12">
							<EV.Form.Area {...{
								id: 		`${IDs.svc}-descr`,
								name:		'SvcDescr',
								icon:		'newspaper',
								rows:		 5,
								priority:	'*',
								placeholder:'Use this to provide as many details as possible regarding your Service. This can contain any Rules or Restrictions, Hours of Preperation, etc.',
								value:		 desc,
							}	}/>
						</div>
						<div className="C12 flex flexDirRow flexAlignC flexSpaceB MB">
							<span style={{fontSize:'smaller'}}>Client Interaction Method:</span>
							<EV.Form.Xput {...rattr} id={`${intid}-1`} value={1} defaultChecked={inter(1)} label="In-Person" />
							<EV.Form.Xput {...rattr} id={`${intid}-2`} value={2} defaultChecked={inter(2)} label="Mobile" />
							<EV.Form.Xput {...rattr} id={`${intid}-3`} value={3} defaultChecked={inter(3)} label="Correspondence" />
							<EV.Form.Xput {...rattr} id={`${intid}-4`} value={4} defaultChecked={inter(4)} label="Shipment" />
						</div>
						<EV.Form.Checkbox {...Assign({
							id: 	quid,
							name:	'SvcQuant',
							label:	'Is this a Quantified Service?',
							checked: quant.enabled || isRTE,
							disabled: isRTE,
						},	chttr)} />
						<div className="C12 reveal gridSlice PB" style={{order:500}}>
							<EV.Form.Xput {...Assign({
								id:			unid,
								name:		"SvcQUnit",
								kind:		'text',
								label:      'Unit Name',
								placeholder:'Item',
								value:		 add ? undefined : (quant.unit || rates.vals[rtStr]),
								disabled: 	 isRTE,
							},	aattr)} />
							<div {...dattr}>The unit at which the quantity measured. (i.e.: per [UNIT])</div>
							<EV.Form.Xput {...Assign({
								id:			`${IDs.svc}-QStep`,
								name:		"SvcQStep",
								label:      'Multiples',
								value:		add ? 1 : quant.step,
							},	nattr)} />
							<div {...dattr}>The multiple of quantities your Clients must purchase in.</div>
							<EV.Form.Xput {...Assign({
								id:			`${IDs.svc}-QMin`,
								name:		"SvcQMin",
								label:      'Minimum',
								value:		 add ? 1 : quant.min,
							},	nattr)} />
							<div {...dattr}>The minimum quanity your Clients must purchase.</div>
							<EV.Form.Xput {...Assign({
								id:			`${IDs.svc}-QMax`,
								name:		"SvcQMax",
								label:      'Maximum',
								value:		 add ? 1 : quant.max,
							},	nattr)} />
							<div {...dattr}>The maximum quanity your Clients can purchase.</div>
						</div>
					</EV.Form>
				);
			}

			EV.Service.Files 	= class Files 		extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'FILES'; THS.state = props;
					// ---------------------------------------------------
						THS.dtid = `svc-${props.svid}`;
						THS.kind = {
							documents:	'file',
							credentials:'file',
							images:		'file',
							urls:		'link',
						};
						THS.dflt =  FromJS([
							{ 	name:  'documents',  icon: 'file', 
								label: 'Documents',  body: []	},
							{ 	name:  'credentials',icon: 'id-card', 
								label: 'Credentials',body: []	},
							{ 	name:  'images', 	 icon: 'images', 
								label: 'Images', 	 body: []	},
							{ 	name:  'urls', 		 icon: 'link', 
								label: 'URLs', 		 body: []	},
						]);
					// ---------------------------------------------------
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let id = THS.dtid, {stamp,items=[]} = (store[id]||{});
							if (!!stamp&&stamp!==THS.state.stamp) return { 
								stamp: stamp, loaded: true, 
								tabs:  (items[0]||{}).services,	
							}; 	else return null;
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					componentDidMount() {
						let prop = this.state, 
							send = Actions.Data.send,
							load = !!prop.loaded;
						if (!!document&&!load) {
							let url  = '/service/files',
								svid = prop.svid, id = this.dtid; 
							setTimeout(() => send(url, {
								method:	'GET', headers: { token: COMPS.Token },
								params:	{ sids: svid }, query: { id: id },
							}	),	0);	}
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS		= this,
							props 	= THS.state,
							dflt	= THS.dflt,
							kind	= THS.kind,
							edit  	= !!props.editable,
							id    	= THS.dtid,
							stamp 	= props.stamp||100,
							svid 	= props.svid,
							tabs 	= props.tabs||{};
						return (
							<Content.Tabs key={id} id={id} 
								tabs={dflt.map((t,i)=>(
									t.set('body',[ 
										<Service.Bucket 
											key={t.get('name')} 
											which={t.get('name')} 
											dtid={id} svid={svid}
											files={tabs[t.get('name')]} 
											kind={kind[t.get('name')]} 
											stamp={stamp}
											editable={edit}/>,
										<Service.Uploader
											key={`${t.get('name')}-add`} 
											dtid={id} svid={svid}
											which={t.get('name')} 
											stamp={stamp}
											editable={edit}/>
									].filter(v=>!!v))
								)).toJS()}/>
						);
					}
			};

			EV.Service.Bucket 	= class Bucket 		extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this, which; THS.name = 'BUCKET';
					// ---------------------------------------------------
						THS.dtid = props.dtid;
						THS.mode = {true:'edit',false:'show'};
						THS.dflt =  FromJS({ 
							cols: ['1fr','1.5fr'], 	items: [
								{ text: 'Document' }, 
								{ text: 'Description' },
						] 	});
					// ---------------------------------------------------
						this.showBucket = this.showBucket.bind(this);
						this.editBucket = this.editBucket.bind(this);
					// ---------------------------------------------------
						which = THS.which;
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let id = THS.fid, {stamp,items={}} = (store[id]||{});
							if (!!stamp&&stamp!==THS.state.stamp) {
								let files = (((items||{}).services||{})[which]||[]);
								return { 
									loaded: true, status: 'done', 
									stamp,  files,	
								}; 	
							} else return null;
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { stamp, status, files } = ( 
								props.stamp>state.stamp?props:state
							);  return {
								stamp:	stamp, 
								status:	status, 
								files:	files,
							}
						};	return null;
					}

				// GETTERS   /////////////////////////////////////////////////////////

					get fid  	() { return `${this.dtid}-${this.which}`; }
					get which 	() { return this.props.which; }

				// FUNCTION  /////////////////////////////////////////////////////////

					getLink(item) {
						let THS = this, kind = THS.props.kind, i = item;
						return `${i.location}${kind=='file'?i.name:''}`
								.replace(/^(?!http)(.+)$/,'http://$1');
					}

					showBucket(svid, files, editable = false) {
						let THS  = 	this,
							fid  =  THS.fid,
							id   =  THS.dtid,
							wich = 	THS.which,
							edit = 	!!editable,
							mrge = 	(o,n)=>n||o,
							edts = 	FromJS({	
										cols:  ['1fr','1.5fr','auto'],
										items: [null,null,{text:'Action(s)'}],
										editable: true, }),
							dflt = 	edit?THS.dflt.mergeDeepWith(mrge,edts):THS.dflt, 
							data, 	rslt;
						// -----------------------------------------------------------
							data = FromJS(Assign({ 
								items: 	(edit?[null,null,null]:[null,null]).concat(
									...files.map(c=>[
										{ text: c.name, link: {
											href: THS.getLink(c), target: '_blank'
										},	key: `text@${c.id}` }
									].concat(edit ? [{ text: (<Frag>
										<input key="1" type="hidden" name={`scids@${c.id}`} value={c.id} data-param/>
										<Form.Area 	key={`Descr@${c.id}`} id={`Descr@${c.id}`} value={c.description} 
													placeholder="Description" rows="1"/>
									</Frag>)}] : [{ 
										text: c.description 
									}]).concat(edit ? [{ text: (<Frag>
										<Form.Button 	key="1" styles={['info']} kind="submit" id={`Save@${c.id}`} 
														action={(e)=>(e.currentTarget.dataset.id=c.id)}
														font=".75rem" icon="save"/>
										<Form.Button 	key="2" styles={['nope']} kind="button" id={`Kill@${c.id}`} 
														font=".75rem" icon="trash"/>
									</Frag>)}] : [])))
							}, edit ? { form: {
								'id':			`${fid}-form`,
								'rid':			`${fid}`,
								'method':		'PUT',
								'data-action': 	`/files/${wich}`,
								'data-differ':	 true,
								'params':		{},
								'query':		{ uid: COMPS.UID },
								'stamp':		 THS.state.stamp,
								'status':		 THS.state.status,
							}	} : {}));
						// -----------------------------------------------------------
							rslt = 	dflt.mergeDeepWith((o,n)=>n||o,data).toJS();
						// -----------------------------------------------------------
							// console.log(rslt)
							return 	(<Frag>
								<Content.Table 
									key={THS.fid} 
									id={`${THS.fid}-form`} 
									{...rslt} />
							</Frag>);
					}

					editBucket(svid, files) {
						return this.showBucket(svid, files, true);
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS		= this,
							mode  	= THS.mode,
							props 	= THS.state,
							edit  	= !!props.editable,
							Buck	= THS[`${mode[edit]}Bucket`], 
							svid 	= props.svid,
							files 	= props.files;
						return Buck(svid,files||[]);
					}
			};

			EV.Service.Uploader = class Uploader 	extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'UPLOADER';
					// ---------------------------------------------------
						THS.dtid = props.dtid;
						THS.mode = {true:'edit',false:'show'};
						THS.buck = {
							documents:	'Document',
							credentials:'Credential',
							images:		'Image',
							urls:		'URL',
						};
						THS.attr = {
							documents:	{ kind:'file', icon:'file',  placeholder:null,      id:'file'     },
							credentials:{ kind:'file', icon:'file',  placeholder:null,      id:'file'     },
							images:		{ kind:'file', icon:'file',  placeholder:null,      id:'file'     },
							urls:		{ kind:'url',  icon:'globe', placeholder:'http://', id:'location' },
						};
					// ---------------------------------------------------
						this.showUploader = this.showUploader.bind(this);
						this.editUploader = this.editUploader.bind(this);
					// ---------------------------------------------------
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let id = THS.fid, {stamp,items=[]} = (store[id]||{});
							if (!!stamp&&stamp!==THS.state.stamp) return { 
								stamp:  stamp,  loaded: true, status: 'done', 
							}; 	else return null;	
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { stamp, status } = ( 
								props.stamp>state.stamp?props:state
							);  return {
								stamp:	stamp, 
								status:	status, 
							}
						};	return null;
					}

				// GETTERS   /////////////////////////////////////////////////////////

					get fid  	() { return `${this.dtid}-${this.which}`; }
					get which 	() { return this.props.which; }

				// FUNCTION  /////////////////////////////////////////////////////////

					showUploader(svid, which, editable = false) {
						let THS   =   this,
							props =   THS.state,
							{ buck, attr } = THS,
							tnme  =   which,
							fnme  =   buck[tnme],
							edid  = `${THS.dtid}-${tnme}`,
							adid  = `${edid}-add`;
						if (!!editable) {
							if (!!!THS.adder) THS.adder = (
								<div key="add" className="gridSlice PTB" style={{width:'100%'}}>
									<input key="sid" type="hidden" name="sids" value={svid} data-param/>
										{ tnme == 'urls' ? 
									<div key="nme" className="some"><Form.Xput icon="signature" kind="text" placeholder="URL Name" id="name" data-rel="*"/></div>
										: null }
									<div key="itm" className={tnme=='urls'?"more":"spread"}><Form.Xput {...attr[tnme]} data-rel="*"/></div>
									<div key="dsc" className="spread"><Form.Area icon="newspaper" placeholder="Description" id="descr" rows="2" data-rel="*"/></div>
								</div>);
							return (
								<Content.Table key={adid} id={adid} {...{ 
									cols:  ['100%'], 
									form:  {
										'id':			 adid,
										'rid':			 edid,
										'method':		'POST',
										'data-action': 	`/service/${fnme}`.toLowerCase(),
										'params':		{ },
										'query':		{ uid: COMPS.UID },
										'stamp':		 props.stamp,
										'status':		 props.status,
										'clear':		 true,
										'buttons':		[{ 
											kind: 'submit', label: `Add New ${fnme}`,
											style:'good',   icon:  'save' 
										},	],
									},
									items: [
										{ text: `Add a ${fnme}` }, 
										{ text: THS.adder },
									] 
								}}/>
							);
						} else return null;
					}

					editUploader(svid, which) {
						return this.showUploader(svid, which, true);
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS		= this,
							mode  	= THS.mode,
							props 	= THS.state,
							edit  	= !!props.editable,
							Upload	= THS[`${mode[edit]}Uploader`], 
							svid 	= props.svid,
							which 	= props.which;
						return Upload(svid,which);
					}
			};

		// STRIPE  /////////////////////////////////////////////////////////

			EV.PoS = {
				/**
				 * Renders an Address form.
				 * @param {Props.Address} props 
				 */
				Address({ id, line1, line2, city, state, postal_code, country, phone, compact = false, noDefer = false } = props) {
					let NDF = !!noDefer?{defer:false}:undefined; compact = !!compact;
					return (<Frag key="address">
						<div key="street1" className="half">
							<Form.Xput _meta={NDF} id={`${id}-st1`} name="line1"
								icon="map-signs" kind="text" placeholder="Street 1"
								value={line1} priority="~" validate={{
									pattern: /^(?:[A-z0-9"\/#+-]+\b[?,.]?(?: \b|$))+$/,
									invalid: "You have to provide either your Full Address, or Postal/Zip Code.",
								}}	compact={compact}/>
						</div>
						<div key="street2" className="half">
							<Form.Xput _meta={NDF} id={`${id}-st2`} name="line2"
								kind="text" placeholder="Street 2"
								value={line2} validate={{
									pattern: /^(?:[A-z0-9"\/#+-]+\b[?,.]?(?: \b|$))+$/,
									invalid: "Invalid Unit/Apt/Suite/Building.",
								}} compact={compact}/>
						</div>
						<div key="city"  className="some">
							<Form.Xput _meta={NDF} id={`${id}-city`} name="city"
								icon="city" kind="text" placeholder="City" 
								value={city} priority="~" formatters={[{
									pattern: /(\b[a-z])/g, replace: $0=>$0.toUpperCase() 
								}]}
								validate={{
									pattern: /[\w\d% ,;.-]+/,
									invalid: 'Invalid City.',
								}} 	compact={compact}/>
						</div>
						<div key="state"  className="quart">
							<Form.Xput _meta={NDF} id={`${id}-state`} name="state"
								kind="text" placeholder="Region" 
								value={state} formatters={[{
									pattern: /(\b[a-z])/g, replace: $0=>$0.toUpperCase() 
								}]}
								validate={{
									pattern: /^\b(?:[\w\d]|\b[% ,;.-]\b)+(?:\.|\b)$/,
									invalid: 'Invalid Province/State.',
								}} 	compact={compact}/>
						</div>
						<div key="postal"  className="third">
							<Form.Xput _meta={NDF} id={`${id}-postal`} name="postal_code"
								icon="mail-bulk" kind="text" placeholder="Postal/Zip Code" 
								value={postal_code} priority="~" formatters={[{
									pattern: /([a-z]+)/g, 
									replace: $0=>$0.toUpperCase() 
										}, {
									pattern: /^([A-Z]\d[A-Z]) ?(\d(?:[A-Z]\d?)?)$/,
									replace: ($0,$1,$2)=>(`${$1} ${$2}`)
								}]}
								validate={{
									pattern: /^\b(?:[A-Z0-9 -]){3,10}\b$/,
									invalid: 'Invalid Postal/Zip Code.',
								}} 	compact={compact}/>
						</div>
						<div key="country"  className="more">
							<Form.Select _meta={NDF} id={`${id}-country`} name="country"
								title="Select a Country" value={country} nullValue="" 
								priority="*" icon="globe-americas" compact={compact} data={{ 
									id: "user-pay-country", url: "/locale/countryiso" 
								}} 	
								validate={{
									pattern: /^[A-Z]{2}$/,
									invalid: 'Please select your Country.',
								}}  />
						</div>
						<div key="phone"  className="some">
							<Form.Xput _meta={NDF} id={`${id}-phone`} name="phone"
								icon="phone" value={phone} 
								placeholder="Phone Number" validate={{
									pattern: /^(\+?\b[0-9( )-]+\b)$/,
									invalid: 'Invalid Phone Number.',
								}} 	compact={compact}/>
						</div>
					</Frag>);
				},
				/**
				 * Renders a Service-Order form.
				 * @param {Props.SVC.Sub} props 
				 */
				Order({ order = {}, rate, charge, interact, quant = {}, recur = false, onSubmit } = props) {
					// ------------------------------------------------------------------------- //
						function GetTotal(quantity) {
							if (rate==7) return "TBD";
							return `$${(quantity*charge).toFixed(2)}`;
						}
					// ------------------------------------------------------------------------- //
					let today = new Date(),
						ordID = 'order',
						noPay = [1].has(rate),
						isDur = [1,2].has(interact),
						isQnt = !!quant.enabled,
						qMin  = quant.min||1,
						qVal  = order.quantity||qMin,
						year  = today.getFullYear(),
						ttREF = React.createRef(),
						attrs = {
							name: 	'svc-order', 
							align:	'spread gridSlice',
							header: { fixed: true, label: 'Your Order' },
							form: {
								'id':			'user-order',
								'method':		'POST',
								'data-action':	onSubmit,
								'aria-label':	'Service Order Form',
								'buttons': 		[{ 
									kind:   'submit',
									label:  ({	1: 'Confirm Your Order',
												2: 'Select Pay Method',
												3: 'Select Pay Method',
												4: 'Select Pay Method',
												5: 'Select Pay Method',
												6: 'Select Pay Method',
												7: 'Get a Quote',
											})[rate],
									style:  'good',
									icon:   'chevron-circle-right',
									iconProps: { 
										after: true, 
										edge: true, 
									},
								}],
								'no1stSnap':	true,
								'noLoad':		true,
								'repeated':		true,
							},
						}; 
					// ------------------------------------------------------------------------- //
					return (
						<Content.Block key="block" {...attrs}>
								{ isQnt ? (
							<div className="C12 flex flexDirRow flexAlignC flexSpaceB">
								<EV.Form.Xput {...{
									id:			`${ordID}-quant`,
									name:		"quantity",
									kind:		'number',
									label:      `${quant.unit}(s):`,
									value:		 qVal,
									step:		 quant.step||1,
									min:		 qMin,
									max:		 quant.max,
									priority:	'*',
									compact:	 true,
									styles:		['compact'],
									onInput(e)	{
										let valu = GetTotal(e.currentTarget.value);
										ttREF.current.value = valu;
									},
								}	} />
								<span className="PLR">Price:</span>
								<input type="value" name="subtotal" defaultValue={GetTotal(qVal)} ref={ttREF} disabled/>
							</div>
								) : (<Frag>
							<div className="C6">Price:</div>
							<div className="C6" style={{textAlign:'right'}}>{`$${charge.toFixed(2)}`}</div>
								</Frag>) }
							{ !noPay && isDur ? (<Frag>
								<div className="C6 center">What date is this to occur?</div>
								<div className="C6 center" style={{justifySelf:'end'}}>
									<Form.DateTime {...{
										id: 		`${ordID}-date`,
										name: 		'datetime',
										icon:		'clock',
										limit:		{ min: year, max: year+1 },
										value:		order.date || `${year}-${today.getMonth()+1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}`,
										time:  		true,
										compact: 	true,
										priority:	'*',
										validate: 	{
											pattern: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/,
											invalid: 'Specify',
											allowed: ['mm','dd','yyyy'],
										},
									}} />
								</div>	
							</Frag>) : null }
							<div className="C12">
								<EV.Form.Area {...{
									id: 		`${ordID}-notes`,
									name:		'notes',
									icon:		'sticky-note',
									rows:		 3,
									priority:	'~',
									compact:	true,
									placeholder:'Any notes that the Provider should know.',
									value:		 order.notes,
								}	}/>
							</div>
							<hr key="divide" className="MTB spread"/>
						</Content.Block>
					);
				},
				/**
				 * 
				 * @param {*} props 
				 */
				Summary({ svid, order = {}, form = {}, stamp } = props) {
					if (!!!order.card) return null;
					let { card = {}, datetime, notes, unit, quantity, subtotal:price } = order,
						{ line1:Street, line2:Line2, city:City, state:Region, postal_code:Postal, country:Country } = card.address, 
						grGP  = {gridGap:'.5em 0'},
						grTC  = Assign({gridTemplateColumns:'75% 25%'},grGP),
						clss  = "C12 gridPair MLR",
						fees  = ((price*0.029)+0.30),
						subtl = price+fees,
						tax   = subtl*0.05,
						total = subtl+tax,
						attrs = {
							name: "pay-summary",
							align: "spread gridSlice",
							header: { fixed: true, label: 'Order Summary' },
							form: Assign({
								'id':			'pay-summary',
								'method':		'POST',
								'aria-label':	'Order Summary',
								'stamp':		 stamp,
								'style':		{ fontSize:'smaller' },
								'buttons':		[{ 
									kind:'submit',   label:'Confirm',
									style:'good',     icon:'check-double', 
									size:'C12', iconProps:{ after:true },
								}],
								'no1stSnap':	true,
								'noLoad':		true,
								'repeated':		true,
							},	form)
						};
					return (
						<Content.Block {...attrs}>
							{/* Expand for Conditions */}
								{ !!(datetime||notes) ? <Frag>
							<div className={clss} style={grGP}>
								{/* Expand for Conditions */}
									{ !!datetime ? <Frag>
								<span>Service Date:</span><span align="right">
									<time dateTime={datetime}>{new Date(...(
										datetime.split(/[: -]/).map((p,i)=>Number(i==1?p-1:p))
									)	).toLocaleString('en-US', { 
										year:'numeric', month:'long', day:'numeric', 
										hour:'numeric', minute:'numeric' 
									})}</time>
								</span> 
									</Frag> : null }{ !!notes ? <Frag>
								<span>Notes for Provider:</span><span align="right">{notes}</span>
									</Frag> : null }
							</div>
							<hr className="spread dashed" />
								</Frag> : null }
							<div className={clss} style={grGP}>
								<span>Payment Method:</span><div align="right"><i className={`fab fa-cc-${card.type}`}/><strong> {card.number.toString().padStart(4,'0')}</strong></div>
								<span>Billing Address:</span><span align="right"><Address key="addr" {...{ Street, Line2, City, Region, Postal, Country }} collapse/></span>
								<span> </span><span align="right">PH: <PhoneNum number={{'#':card.address.phone}} /></span>
							</div>
							<hr className="spread dashed" />
							<div className={clss} style={grTC}>
								{/* Expand for Conditions */}
									{ quantity ? <Frag>
								<span>Quantity:</span><span align="right">{`${quantity} ${unit}(s)`}</span>
									</Frag> : null }
								<span>Price:</span><span className="accounting" align="right">{price.toFixed(2)}</span>
								<span>Fees:</span><span className="accounting" align="right">{fees.toFixed(2)}</span>
							</div>
							<hr className="spread dashed" />
							<div className={clss} style={grTC}>
								<span>Subtotal:</span><span className="accounting" align="right">{subtl.toFixed(2)}</span>
								<span>Estimated Tax:</span><span className="accounting" align="right">{tax.toFixed(2)}</span>
								<strong>Order Total:</strong><strong className="accounting" align="right">{total.toFixed(2)}</strong>
							</div>
							<br/>
						</Content.Block>
					);
				},
				/**
				 * 
				 * @param {*} props 
				 */
				Confirm({ svid, rate, order = {}, form = {}, complete, stamp } = props) {
					if (!!!complete) return null;
					let attrs = {
							name: "pay-confirm",
							align: "spread gridSlice",
							header: { fixed: true, label: 'All Set.' },
							form: Assign({
								'id':			'pay-confirm',
								'method':		'POST',
								'aria-label':	'Order Confirmation',
								'stamp':		stamp || new Date(),
								'style':		{ fontSize:'smaller' },
								'buttons':		[{ 
									kind:'submit',   label:'Got It',
									style:'good',     icon:'thumbs-up', 
									size:'C12', iconProps:{ after:true },
								}],
								'no1stSnap':	true,
								'noLoad':		true,
								'repeated':		true,
							},	form)
						};
					return (<Content.Block {...attrs}>
						<div className="C12">
							<p>You'll be notified once the Provider {({true:`accepts your Order`, false:`is ready with your Quote`})[rate<7]}. A couple things:</p>
							<ul style={{fontSize:'smaller'}}>
								<li>You can always review, manage, and check the <b>Status</b> of your Order in your <a href="/wallet"><b>Wallet</b></a>.</li>
								<li>If you've changed you mind, or need to change your order, head over to your <a href="/wallet"><b>Wallet</b></a>, cancel the order, and re-order (<i>if applicable</i>).</li>
								<li>You will be <b>charged</b> {({true:`once the Provider confirms their acceptance of your Order`, false:`when both you, and the Provider agree on the Quoted pricing`})[rate<7]}:</li>
								<ul>
									<li>The Provider only be paid-out when <b>both parties confirm</b> the Service has been rendered; or if the Provider confirms on their end, but you fail to do so within <b>24 hours</b>.</li>
									<li>You have the option of disputing this Purchase if you feel it was not satifactory. This must be requested within 24 hours of the Service's completion.</li>
									<li>It is possible to receive a <b>Refund</b> in the event of a cancellation or a dispute; however{'\u2014'}unless your Order is cancelled by the Provider{'\u2014'}all fees are <b>final</b>, and <b>will not</b> be refunded.</li>
								</ul>
							</ul>
							<small><p><i>By clicking "<b>Got It</b>" below, you acknowledge that you have <b>read</b> and <b>understand</b> the above, in addition to your prior agreement to our <a href="/terms"><b>Terms of Service</b></a>.</i></p></small>
						</div>
					</Content.Block>);
				},
			};
			const CardForm  = INJECT(class _Card extends Mix('React', 'General') {
				constructor(props) {
					super(props); let THS = this; THS.name = '_CARD';
					// Handles ------------------------------------------- //
						THS.handleChange = THS.handleChange.bind(THS);
						THS.handleSubmit = THS.handleSubmit.bind(THS);
						THS.onSubmit = props.onSubmit||(()=>null);
					// Properties ---------------------------------------- //
						THS.fid = (props.form||{}).id||'user-newcard';
						THS.state = props;
						THS._refs = {
							Number: React.createRef(),
							Expiry: React.createRef(),
							CVCNum: React.createRef(),
							Change: React.createRef(),
						};
						THS.form  = Assign({
							'id':			THS.fid,
							'method':		'POST',
							'data-action':	THS.handleSubmit,
							'aria-label':	'Credit Card & Billing Address',
							'stamp':		props.stamp,
							'buttons': 		[
								{ kind:'submit',label:'Update Pay Method',style:'info' },
							],
						},	props.form||{});
					// Attributes ---------------------------------------- //
						let bill = 'billing_details', addr = 'address';
						THS.attrs = {
							name:			[bill],
							email:			[bill],
							phone:			[bill],
							line1:			[bill,addr],
							line2:			[bill,addr],
							city:			[bill,addr],
							state:			[bill,addr],
							postal_code:	[bill,addr],
							country:		[bill,addr],
						};
				}

				// EVENTS    /////////////////////////////////////////////////////////

					handleChange({ error }) {
						this.cntChanges();
						if (error) this.setState({
							errorMessage: error.message
						});
					};

					handleSubmit(req) {
						let THS = this, props = THS.props, 
							FID = THS.fid, stripe = props.stripe;
						if (stripe) {
							let paym  = Map({}),
								pths  = THS.attrs,
								attr  = Object.keys(pths),
								fltr  = (v,k)=>(!!v&&attr.has(k)),
								pthr  = (k)=>(pths[k].concat([k])),
								mapr  = (v,k)=>(paym=paym.setIn(pthr(k),v)),
								body  = req.body,
								rqst  = { metadata: { 
									UID: COMPS.UID, 
									nickname: body.nickname 
								} 	};
							// ------------------------------------------------ //
								Map(body).filter(fltr).map(mapr);
								Assign(rqst, paym.toJS());
								stripe
									.createPaymentMethod('card', rqst)
									.then(({ error, paymentMethod: method }) => {
										if (!!!error) {
											let send = Actions.Data.send,
												pmid = method.id;
											console.info('StripeMethod:', method);
											// THS.setState({ brand: method.card.brand });
											send('/pos/customer/cards', { 
												method:	 	'POST',
												headers:    { token: COMPS.Token },
												params:	 	{ uid: COMPS.UID },
												body: 		{ pmid: pmid, id: FID },
											});
											THS.onSubmit(method);
										} else console.error('StripeERROR:', error);
									});
						} else {
							console.error("Stripe.js hasn't loaded yet.");
						}
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					cntChanges() {
						let change = this._refs.Change.current,
							amount = parseInt(change.value)+1;
						change.value = amount;
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS   = this, 
							refs  = THS._refs,
							state = THS.state,
							props = THS.props,
							mode  = props.mode||'add',
							id    = props.id,
							defer = {defer:false},
							cmpct = !!props.compact,
							style = { width: '100%' },
							cls   = 'fill card',
							cattr = Assign(stripeOpts(), { 
										onChange: THS.handleChange,
										// onReady(e) { e.focus(); },
									}),
							attrs = Assign({}, {
										name: 	'pay-method', 
										align:	'spread gridSlice',
										header: { fixed: true, label: 'New Payment Method' },
										form: 	THS.form,
									}, 	state.block||{}); 
						return (<ErrorBoundary>
							<Content.Block key="block" {...attrs}>
								<input key="email" type="hidden" name="email" defaultValue={COMPS.Email}/>
								<div key="card" className="more">
									<Form.Xput key="card" priority="*" style={style} icon="credit-card" _meta={defer} compact>
										<div key="scaffold" className="fill scaffold">&nbsp;</div>
										<input key="change" ref={refs.Change} type="hidden" name="changes" defaultValue={0} />
										<CardNumberElement key="num" ref={refs.Number} className={`${cls} number`} {...cattr}/>
										<CardExpiryElement key="exp" ref={refs.Expiry} className={`${cls} expiry`} {...cattr}/>
										<CardCVCElement    key="cvc" ref={refs.CVCNum} className={`${cls} cvcnum`} {...cattr}/>
										<Form.Validate     key="vld" invalid="Please fill-in your Card/CVC numbers, as well as it's Expiry Date."/>
									</Form.Xput>
								</div>
								<div key="holder" className="some">
									<Form.Xput id={`${id}-holder`} _meta={defer} name="name" 
										kind="text" priority="*" placeholder="Card-Holder Name" 
										value={state.holder||null} validate={{
											pattern: /^\b(?:[A-z'-]+(?:\b|\.) ?)+\b\.?$/i,
											invalid: "Please specifiy a valid Card Holder name.",
										}} compact/>
								</div>
								<h6 key="bill_head" className="spread">Billing Address</h6>
								<PoS.Address key="address" noDefer={true} id={id} {...(state.address||{})} compact={cmpct}/>
									{({add:(
								<Form.Xput id={`${id}-nick`} _meta={defer} name="nickname" 
									kind="text" priority="~" placeholder="Card Nickname" 
									validate={{ invalid: "Please specifiy a valid Nickname." }} 
									styles={['C6']} value={state.name||null} 
									compact/>
										),pick:(<Frag>
								<EV.Form.Checkbox {...{
									id: 	 'saveCard',
									name:	 'saveCard',
									label:	 'Save this Card',
									checked:  state.save,
									styles: ['C4','good-y','warn-n'],
									yes:	 'YES',
									no:		 'NO',
									HOC:	  true,
									compact:  true,
								}	} />
								<Form.Xput id={`${id}-name`} _meta={defer} name="holder" 
									kind="text" priority="~" placeholder="Card Nickname" 
									validate={{ invalid: "Please specifiy a valid Nickname." }} 
									styles={['S7','C6','reveal']} value={state.name||null} 
									maxlength="25" compact/>
								</Frag>)})[mode]}
								<hr key="divide" className="MTB spread"/>
							</Content.Block>
						</ErrorBoundary>);
					}
			});
			EV.PoS.Card  = class Card extends Mix('React', 'General') {
				constructor(props) {
					super(props); let THS = this; 
					THS.name = 'CARD'; THS.state = props;
				}

				render() { 
					return (
						<StripeProvider apiKey='pk_test_O3cwbaxfELRW69hj3mpwJpOB'>
							<Elements><CardForm {...this.state}/></Elements>
						</StripeProvider>
					);
				}
			};

			EV.PoS.Method =  function Method({ id = 'card', type = 'visa', name, number = 1234, holder, exp = [1,1970], address = {}, select = false, small = true } = props) {
				/**
				 * @param {number} val 
				 * @param {number} by 
				 */
				let zeroPad = (val,by) => (val.toString().padStart(by,'0')),
					third   = !!small ? '' : 'third',
					checkid = `${type}-${number}`,
					CardEl  = (<Frag>
						{/* Expand to see Conditions */}
							{ !!select ? 
						<input key="rdo" type="radio" name="pmethod" id={checkid} defaultChecked={false} 
							   value={JSON.stringify({id,type,name,number,holder,exp,address})}
							   required />
							: null }
						<label key="lbl" htmlFor={checkid} className={`ccard noSelect ${type} ${third}`.trim()}>
							<div>
								<div className="cname trunc">{name}</div>
								<i className="cedit" title="Manage Your Card"/>
								<div className="cnum">{zeroPad(number,4)}</div>
								<div className="chold trunc">{holder}</div>
								<div className="cexp">
									<span>{zeroPad(exp[0],2)}</span>
									<span>{zeroPad(exp[1],2).slice(-2)}</span>
								</div>
								<div className="ciss">
									<i className={`fab fa-cc-${type}`}/>
								</div>
							</div>
						</label>
					</Frag>);
				// --------------------------------------------------------------------------- //
					return ( !!small ? 
						<small className="third">{CardEl}</small> : CardEl 
					);
			};

			EV.PoS.Methods 		= class Methods 	extends Mix('Reflux', 'Static') {
				/**
				 * Instantiates a new `PoS.Methods` component.
				 * @param {Props.Cards} props The props.
				 */
				constructor(props) {
					super(props); let THS = this; THS.name = 'METHODS';
					// -------------------------------------------------- //
						THS.fid = 'user-cards';
						if (!!props.form&&!!props.select) {
							THS.form  = Assign({
								'id':			THS.fid,
								'method':		'POST',
								'aria-label':	'Saved Card Selection',
								'buttons': 		[{ 
									kind:'submit',label:'Use This Card',style:'good' 
								}],
							},	props.form||{});
						};
					// -------------------------------------------------- //
						THS.addOpen  = THS.addOpen.bind(THS);
						THS.addClose = THS.addClose.bind(THS);
					// -------------------------------------------------- //
						let smap = {
							default: [],
							state(items) {
								return { 
									cards: ISS(items)=='array'?items:[],
									addNew: false,
								}
							}
						};
						THS.mapState({
							[THS.fid]: smap,
							'user-newcard': smap,
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					componentDidMount() {
						let prop = this.state, 
							send = Actions.Data.send,
							load = !!prop.loaded;
						if (!!document&&!load) {
							let url = '/pos/customer/cards'; 
							setTimeout(() => send(url, { 
								method:	 	'GET',
								headers:    { token: COMPS.Token },
								params:	 	{ uid: COMPS.UID },
								body: 		{ id: this.fid },
							}),	0);	
						}
					}

				// EVENTS    /////////////////////////////////////////////////////////

					addOpen(e) {
						stopEvent(e);
						this.setState({ addNew:  true });
					}
					addClose(e) {
						stopEvent(e);
						this.setState({ addNew: false });
					}
				
				// FUNCTIONS /////////////////////////////////////////////////////////

					GetMethods({ addNew = false, stamp, acct_id, cust_id, form, cards = [], select = false, small = false, addOpen, addClose } = props) {
						let Elem = (!!form?Form:'div'); !!form && (form.stamp = stamp);
						/**
						 * 
						 * @param {*} props 
						 */
						function Cards({ cards, select, small } = props) {
							return (<Frag>
								{/* Expand to see Conditions */}
									{ !!select ?
								<h4 key="head" className="spread">Choose a Payment Method</h4>
									: null }
									{!!cards&&!!cards.length ? cards.map((C,I) => (
								<PoS.Method key={`cc${I}`} id={C.id} type={C.type} name={C.name} number={C.number} 
											exp={C.exp} holder={C.holder} address={C.address}
											select={select} small={small}/>
									)) : 
								<p key="none" className="spread" style={{textAlign:'center'}}><i>You have no Saved Pay-Methods.</i></p>
									}
								<hr key="hr" className="MTB spread"/>
							</Frag>);
						}
						// ---------
						return (<Frag>
							<Elem key="cont" className="spread gridSlice" {...(form||{})}>
								<Cards key="cards" cards={cards} select={select} small={small} />
							</Elem>
								{ !select ? <Frag>
							<button key="btn" className={`tkn good block spread`} onClick={addOpen}>
								<span><i className="fas fa-credit-card"></i> Add a New Card</span>
							</button>
							<App.Dialogue key="save" show={addNew} steps={[{ 
								title: 'Save a Payment Method', 
								content: (
									<PoS.Card id="user-pay" ids={{ 
										uid: COMPS.UID, acct_id, cust_id
									}}  form={{ 'bid':"heloo", 'buttons': [{ 
										kind:'submit', label:'Save this Card',
										style:'good',  icon:'chevron-circle-right'
									}]	}} 
									compact/>
							)}]} step={1} closer={addClose}/>
								</Frag> : null }
						</Frag>);
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS = this, 
							{ GetMethods, addOpen, addClose, form, props, state } = THS, 
							{ addNew = false, cards, stamp } = state, 
							{ acct_id, cust_id, select = false, small = false } = props;
						// ------------------------------------------------------------------------ //
						console.log('METHODS:', Assign({}, state))
						return (
							<GetMethods {...{ addNew, stamp, acct_id, cust_id, form, cards, select, small, addOpen, addClose }}/>
						);
					}
				
			};
			EV.PoS.Methods.defaultProps = {
				_meta:	{ load: false, defer: false },
				addNew: false,
				cards: [],
			};

			EV.PoS.Transacts 	= class Transacts 	extends Mix('Reflux','General') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'TRANSACTS';
					// -------------------------------------------------- //
						THS.state = props;
					// -------------------------------------------------- //
						// THS.addOpen  = THS.addOpen.bind(THS);
						// THS.addClose = THS.addClose.bind(THS);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { stamp, status, transactions, loaded } = ( 
								props.stamp>state.stamp?props:state
							);  return { 
								stamp, status, transactions, loaded
							};
						};	return null;
					}

					componentDidMount() {
						if (!!document) {
							/* let url  = '/threads', 
								id   = this.id.all,
								send = Actions.Data.send; 
							setTimeout(() => send(url, {
								method:	 'GET', 
								headers: { token: COMPS.Token },
								query:   { id },
							}	),	0);	 */
						}
					}

				// GETTERS   /////////////////////////////////////////////////////////

					//

				// FUNCTION  /////////////////////////////////////////////////////////

					/**
					 * Renders the user-sessions table.
					 * @param {Object} props The component properties.
					 * @param {('client'|'provider')} props.mode The mode of this table.
					 * @param {string} props.id The element identifier.
					 * @param {Props.Transact.Obj[]} props.trnscts A list of user transactions.
					 */
					TransList({ mode = 'provider' , id, trnscts = [], stamp, status } = props) {
						// ------------------------------------------------------------------------ //
						let data, rslt,
							isCl =  mode=="client",
							isPr =  mode=="provider",
							NA   =  'N/A',
							cnt  =  trnscts.length,
							GetS =  MX.Trans.GetStatus,
							ofst =  (new Date().getTimezoneOffset()*60000),
							dig2 =  '2-digit',
							dopt =  [ 'en-US', { year:dig2, month:dig2, day:dig2 }],
							dtop =  [ 'en-US', { year:dig2, month:dig2, day:dig2, hour:dig2, minute:dig2, second:dig2 }],
							clnm =  { dte:"Date",nme:"Service",who:"Client",chg:"Amount",sts:"Status",act:"..." },
							dflt = 	FromJS({ 
										cols:  ['.35fr','auto','auto','auto','auto','.2fr'], 
										align: ['C','L','L','R','C','C'], 
										items: [{ 	
											[clnm.dte]: { text: "" }, 
											[clnm.nme]: { text: "" }, 
											[clnm.who]: { text: "No Orders Yet!" }, 
											[clnm.chg]: { text: "" }, 
											[clnm.sts]: { text: "" },
											[clnm.act]: { text: "" },
									}	] 	}), 
							itms =  trnscts.map((TR,i,_a,L,D) => (L=`/user_${TR.who.uid}`, 
									D=new Date(TR.date+ofst), {
										[clnm.dte]: { text: (<span className="mono" title={D.toLocaleString(...dtop)}>{D.toLocaleString(...dopt)}</span>) },
										[clnm.nme]: Assign({ text: TR.service||NA }, (isPr?{}:{link:{href:`${L}#service_${TR.svid}`}})),
										[clnm.who]: { text: joinV(TR.who.name,' '), link: { href:L } },
										[clnm.chg]: { text: (TR.charge||0).toFixed(2), className:'accounting bold' },
										[clnm.sts]: { text: (<Content.Multi weight="small" {...GetS(TR)} collapse/>) },
										[clnm.act]: { text: (<Frag>
											<input key="trid" type="hidden" name={`trid@${i}`} value={TR.trid} data-param/>
											<Form.Button key="btn" styles={['info']} kind="button" id={`More@${i}`} 
														action={(e)=>(e.currentTarget.dataset.id=i)}
														font=".5rem" icon="bars" />
										</Frag>)}
									}));
						// ------------------------------------------------------------------------ //
							data = FromJS(Assign({ items: itms },{ form: {
								'id':			`${id}-form`,
								'rid':			`${id}`,
								'method':		'PUT',
								'data-action': 	`/pos/transactions`,
								'data-differ':	 true,
								'params':		{},
								'query':		{},
								'stamp':		 stamp,
								'status':		 status,
								'style':		{ fontSize: 'small' },
							}	}));
						// ------------------------------------------------------------------------ //
							rslt = 	dflt.mergeDeepWith((o,n)=>n||o,data).toJS();
						// ------------------------------------------------------------------------ //
							return (<Content.Table2 {...rslt} />);
					};

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let TransList = this.TransList, { mode, charges, transactions } = this.state,
							Chrg = (<TransList key="chrg" id="charges" trnscts={charges} mode="client" />);
						return (mode == 'client' ? Chrg :
							<Content.Tabs name="dashboard" size="C12" tabs={[{
								name: 	'orders',
								label:	'Orders',
								icon: 	"file-invoice-dollar",
								checked: true, 
								body: 	[<TransList key="trans" id="trnscts" trnscts={transactions} mode="provider" />]
							}, {
								name: 	'charge',
								label:	'Charges',
								icon: 	"receipt",
								body:   [Chrg]
							}]} />
						);
					}
			};
			EV.PoS.Transacts.defaultProps = {
				_meta:	{ defer: false },
				transactions: [],
				charges: [],
			};

		// FORMS   /////////////////////////////////////////////////////////

			EV.Form 			= class Form 		extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'FORM';
					// ---------------------------------------------------
						THS.handleSubmit = THS.handleSubmit.bind(THS);
						THS.handleReset  = THS.handleReset.bind(THS);
					// ---------------------------------------------------
						THS.SnapShot    = null;
						THS.Statuses    = { true:'fail', false:'done' };
						THS.ShouldClear = !!props.clear;
						THS.deferSS 	= !!props.no1stSnap;
						THS.noLoad    	= !!props.noLoad;
					// ---------------------------------------------------
						THS.mapStoreToState(
							COMPS.Stores.Data, store => {
								let id = THS.eid, {items,stamp} = (store[id]||{});
								if (!!stamp&&stamp!==THS.state.stamp) {
									let cde = !!items.code,
										sts = THS.Statuses[cde],
										itm = cde?items:null;
									THS.clrForm(cde);
									return { 
										stamp: 	stamp,
										result: (itm||{}),
										status: sts,
										loaded: true, 
									};
								} else return null;	
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					componentDidMount() {
						!!!this.deferSS && this.mkeSnapShot();
					}

					componentDidUpdate() {
						this.mkeSnapShot();
					}

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { loaded, stamp, status, children } = ( 
									props.stamp>state.stamp?props:state
								), 	result = {
									loaded, stamp, status, children
								};
							return result;
						};	return null;
					}

				// GETTERS   /////////////////////////////////////////////////////////

					/**
					 * @type {string}
					 */
					get eid 	() { return this.props.rid||this.props.id; }
					/**
					 * @type {string}
					 *//**
					 * @type {(req:TPAction)=>void}
					 */
					get action 	() { return this.props['data-action']; }
					get differ  () { return !!this.props['data-differ']; }
					/**
					 * @type {HMETHOD}
					 */
					get method 	() { return this.props.method; }
					/**
					 * @type {number}
					 */
					get timeout () { return this.props.timeout; }
					get is 		() { 
						let THS = this, stat = THS.state.status;
						return {
							done: stat == 'done',
							load: stat == 'load',
							time: stat == 'time',
							fail: stat == 'fail',
						}; 	
					}
					get subid   () { 
						let form = 	this.refs.form, slct = 'button[data-id]',
							rslt = ((form.querySelector(slct)||{}).dataset||{}); 
						return !!rslt.id ? `[name$="@${rslt.id}"]` : '';
					}
					/**
					 * @type {boolean}
					 */
					get changed () {
						return !!this._changed;
					}
					/**
					 * @type {TPAction}
					 */
					get request () {
						let THS = this, bdy = 'body', qry = 'query', mth = THS.method,
							wch = {'GET':qry,'POST':bdy,'PUT':bdy,'DELETE':bdy}[mth],
							inputs = THS.getForm(), eid = THS.eid, req = {}, prm = {},
							fillVals = (kind,name,value,dataset,checked) => {
								name = name.toLowerCase().replace(/@\d+$/,'');
								// console.log('TYPE:', kind, checked)
								if (!!dataset.param) prm[name]=value;
								else if (kind=='checkbox') req[name]=Number(checked);
								else if (kind=='radio'&&!checked) return;
								else req[name]=value;
							}, { params, query } = THS.props;
						// ------------------------------------------------------------
							for (let {type,name,value,dataset,checked} of inputs) 
								fillVals(type,name,value,dataset,checked);
						// ------------------------------------------------------------
							return { 
								method:	 	mth,
								headers:    { token: COMPS.Token },
								params:	 	Assign({}, params, prm),
								[wch]: 		Assign({}, query, req, {
												id: eid, single: true
											}),
							};
					}

				// EVENTS    /////////////////////////////////////////////////////////

					handleSubmit(e) {
						let THS = this, props = THS.props, 
							api = props.api||'send';
						if (!!this.action) {
							e.stopPropagation(); e.preventDefault(); 
							if (THS.chkSnapShot()) {
								let doLD = THS.noLoad,
									send = Actions.Data[api], { 
										action:act, request:req, changed:chg
									} = THS, typ = ISS(act), wch = {
										'function': ['function',()=>(act(req,chg),
														doLD||THS.setState({status:'done'})
													)],
										'string': 	[act,()=>(send(act,req))],
									};
								console.info('REQUEST:',wch[typ][0],req);
								setTimeout(wch[typ][1],0);
								THS.noLoad||THS.setState({status:'load'});
							}
						} else e.submit();
					}

					handleReset() {
						this.setSnapShot();
					}

				// FUNCTIONS /////////////////////////////////////////////////////////
				
					getAll() {
						let THS   = this,
							elems = ['input','textarea','select'], 
							query = `${elems.join(',')}`;
						return THS.refs.form.querySelectorAll(query);
					}
					getForm() {
						let THS   = this, 
							subid = THS.subid,
							css   = `[name]:not([form])${subid}`,
							elems = ['input','textarea','select'], 
							query = `${elems.join(`${css},`)}${css}`;
						return THS.refs.form.querySelectorAll(query);
					}
					clrForm(code) {
						let THS = this;
						if (THS.ShouldClear && !!!code) {
							let inputs = THS.getForm();
							for (let el of inputs) {
								switch (el.tagName) {
									case 'SELECT': 
										el.value = 'none'; break;;
									case 'RADIO': case 'CHECKBOX': 
										el.checked = false; break;;
									default: 
										el.value = '';
								};
							}
						}
					}

					getAttrs(props) {
						let stats = props.status,
							omttd = ['rid','loaded','clear','stamp','status','timeout','api','no1stSnap','repeated','noLoad'],
							mappr = (v,k)=>(IS(v)=="boolean"),
							filtr = (v,k)=>(!omttd.has(k)&&(k=='style'||!['object','array'].has(IS(v)))),
							attrs = Map(props).filter(filtr).toJS();
						attrs.className = classN(attrs.className,'loaded'); 
						return Assign({onSubmit:this.handleSubmit},attrs);
					}
					getCheckAttr(props) {
						let stid = `${props.id}-status`,
							stat = props.status;
						return {
							type: 		'checkbox',
							id:			 stid,
							name:		 stid,
							form:		 stid,
							className:	'invisible loadit',
							value:	 	 stat||undefined,
							readOnly:	 true,
							checked:	 !!{
								done: 0, time: 0,
								fail: 0, load: 1
							}[stat]||0,
						}
					}
					getButtons(buttons) {
						let THS = this, bKinds = ['button','submit'];
						return buttons.map((b,i) => {
							let {kind,label,style,start,size,font,icon,iconProps,action} = b,
								type = !bKinds.has(kind)?bKinds[0]:kind,
								rset = kind=='reset',
								key  = `btn-${i}`,
								attr = { 
									className: 	classN(
													type,
													start||'one',
													size||'spread'
												),
									style:     	{ order: 1000+i },
								};
							return (
								<div key={key} {...attr}><Form.Button key={`${key}-elem`} {...{
									kind, font, icon, iconProps,
									styles: [style||'info'],
									block:	 true,
									label:	 label||'Submit',
									action:  rset?THS.handleReset:action,
								}}/></div>
							);
						});
					}

					mkeSnapShot() {
						let THS = this, {load,time,fail} = THS.is; 
						if (!!!(load||time||fail)) {
							THS.SnapShot = THS.getSnapShot();
						}
					}
					getSnapShot() {
						let THS   = this,
							nputs = THS.getAll(),
							snap  = {};
						nputs.forEach(EL => {
							let name = EL.name||EL.id, 
								kind = EL.type;
							switch (kind) {
								case 'checkbox': 
									snap[name] = EL.checked; break;;
								case 'radio': 
									if (!EL.checked) break;;
								default: 
									snap[name] = EL.value;
							}
						});
						return snap;
					}
					setSnapShot() {
						let THS   = this,
							nputs = THS.getAll(),
							snap  = THS.SnapShot;
						nputs.forEach(EL => {
							let name = EL.name||EL.id, 
								kind = EL.type;
							switch (kind) {
								case 'radio': 
									if (snap[name]!=EL.value) break;;
								case 'checkbox': 
									EL.checked = snap[name]; break;;
								default: 
									EL.value = snap[name];
							}
						});
					}
					chkSnapShot() {
						let { repeated, method } = this.props,
							current = Map(this.getSnapShot()),
							snapsht = Map(this.SnapShot);
						this._changed = (ImmIs(current,snapsht)===false);
						return (!!repeated||method!='DELETE')||this.changed;
					}

					setTimer() {
						try { !!document;
							let THS = this; 
							!!!THS.timer && THS.is.load && (
								THS.timer = setTimeout(()=>{
									THS.timer = null;
									THS.setState({status:'time'})
								},	THS.timeout*1000));
						} catch (e) {};
					}
					clrTimer() {
						let THS = this; !!THS.timer && (
							clearTimeout(THS.timer),
							THS.timer = null);
					}

					clrDone() {
						try { !!document; if (this.state.status=='done') {
							setTimeout(()=>this.setState({status:'idle'}),2000)
						};	} catch (e) {};
					}

				// DOERS     /////////////////////////////////////////////////////////
					
					//

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS 	= this, 
							state 	= THS.state, 
							id 		= state.id,
							chattr  = THS.getCheckAttr(state),
							attrs 	= THS.getAttrs(state),
							buttons = state.buttons||[];
						THS.clrTimer(); THS.setTimer(); THS.clrDone();
						return (<Frag key={id}>
							<input key="status" ref="status" {...chattr}/>
							<form key="form" ref="form" {...attrs}>
								{THS.getButtons(buttons)}
								{state.children}
							</form>
						</Frag>);
					}
			};
			EV.Form.defaultProps = {
				get params() { return { uids: COMPS.UID }; },
				method:  'GET',
				query:	 {},
				timeout: 30,
			}

			EV.Form.Validate 	= function Validate({ more, invalid, allowed, delim } = props) {
				let clss = classN({ trunc: true, more: !!more });
				return (
					<div className="validate" role="alert">
						<label className={clss}>
							{ invalid }
							{ !!allowed ? (
								<Frag>&nbsp;<div className="bracket">
									{allowed.map((a,k) => 
										<span key={k} className="mono" data-delim={delim}>{a}</span>
									)}
								</div></Frag>
							) : null }
						</label>
					</div>
				);
			}

			EV.Form.Input 		= class Input 		extends Mix('React', 'Static', 'Forms') {
				constructor(props) {
					super(props); let THS = this; THS.name = 'INPUT';
					// ------------------------------------------------ //
						THS.handleInput   = THS.handleInput.bind(THS);
						THS.handleInvalid = THS.handleInvalid.bind(THS);
					// ------------------------------------------------ //
						THS.onInput = props.onInput||(()=>null);
						THS.validator = {pattern:{}};
						THS.getValidate(props);
				}

				handleInput(e) {
					this.onInput(e);
					e.target.setCustomValidity('');
				}
				handleInvalid(e) {
					e.target.setCustomValidity(' ');
				}

				getValidate(props = {}) {
					let THS = this, vldtr = THS.validator;
					if (!!props.validate) {
						THS.validator = Assign({},vldtr,props.validate);
						if (!!THS.validator.invalid) THS.validMsg = (
							<Form.Validate key="valid" {...THS.validator}/>
						);
					}; 	return THS.validator;
				} 

				getAttrs(props = {}, calculated = {}) {
					let omits = [true,false,'onInput'],
						filtr = (p,n)=>(!omits.has(p)&&!!n.match(regex)), 
						regex = /^(on([A-Z][a-z]+)+|data-\w+)$/;
					return Map(Assign(
						{}, calculated,
						Map(props).filter(filtr).toJS(),
						this.getDefault(props.value),
						this.getFormats()
					)).filter(v=>!!v).toJS();
				}

				render() {
					let THS    = this,
						props  = THS.state, 
						meta   = props._meta, 
						defer  = meta.defer,
						load   = meta.load,
						kind   = props.kind, 
						token  = kind=='tokens',
						num    = kind=='number',
						search = !!props.search,
						contnr = !!props.container,
						id     = props.id, 
						name   = props.name||id, 
						Elem   = (contnr ? 'div' : 'input'),
						valid  = THS.getValidate(props),
						autoc  = THS.getAutoComp(name,props),
						attrs  = THS.getAttrs(props, { 
							type: 			!!!kind||search||token?'text':kind,
							id: 			id, 
							name: 			name, 
							form: 			props.form, 
							placeholder:	props.placeholder, 
							tabIndex: 		props.tab,
							className:		classN(...(props.classes||[]).
												concat(['fill','grow'],
													props.kind=='radio'?['rdo']:[]
												)),
							autoComplete:	autoc,
							autoFocus:		props.autoFocus,
							required:		props.required||props.priority=='*',
							disabled:		props.disabled,
							pattern:		valid.pattern.source,
							min:			!!num ? props.min  : null,
							max:			!!num ? props.max  : null,
							step:			!!num ? props.step : null,
							defaultChecked: props.defaultChecked,
							onInput:		THS.handleInput,
							onInvalid:		THS.handleInvalid,
						});

					return (<Frag>
						<Elem key={name} ref={props.forRef||'input'} {...attrs}/>
						{ !!valid.invalid ? ( !!defer ?
							<Defer key="defer" load={load} what={()=>(THS.validMsg)} /> :
							THS.validMsg
						) : null }
					</Frag>);
				}
			};
			EV.Form.Input.defaultProps = {
				_meta: { load: false, defer: true },
				defer: true,
			}

			EV.Form.Xput 		= function Xput(props) {
				let id    = props.id, 
					icon  = props.icon?`fa-${props.icon}`:'',
					cmpct = !!props.compact,
					isRdo = props.kind=='radio',
					lblRt = !!props.labelRight,
					attr  = {
						'htmlFor':	 !!!props.noFor?id:null,
						'data-nfo':   !!props.help?'':null,
						'data-rel': 	props.priority||" ",
						'className':	classN(...[
											'input',
										].concat(
											isRdo?['rdo']:[],
											cmpct?[]:['MB'],
											props.styles||[],
											[!!icon?'glyph':'',icon],
										)),
					};
				// -----------------------------------------------------------------------
					function Labl(props) {
						let label = props.label;
						return ( !!label ?
							<span key="lbl">{label}</span>
						: null );
					};
					function Nput(props) {
						let kids  = props.children,
							token = props.hasOwnProperty('tokens'),
							data  = props.data;
						switch (true) {
							case !!kids: return <Frag key="npt">{kids}</Frag>;
							case  token: return <Form.Tokens   {...props}/>;
							case !!data: return <Form.DataList {...props}/>;
							default:     return <Form.Input    {...props}/>;
						}
					};
					function Help(props) {
						let help = props.help;
						return ( !!help  ? 
							<div  key="hlp" className={classN(["help",help.kind||"info"])}>
								{help.text.map((t,i)=>Agnostic(t,i))}
							</div> 
						: null );
					};
				// -----------------------------------------------------------------------
					return (<Frag>
						{isRdo ? <Nput key="npt" {...props}/> : null}
						<label {...attr}>
							{lblRt ? null : <Labl key="lbl" {...props}/>}
							{isRdo ? null : <Nput key="npt" {...props}/>}
							{lblRt ? <Labl key="lbl" {...props}/> : null}
							<Help key="hlp" {...props}/>
						</label>
					</Frag>);
			};

			EV.Form.DataList 	= class DataList 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'DATALIST';
					// ----------------------------------------------------
						this.handleFocus 	= this.handleFocus.bind(this);
						this.handleBlur 	= this.handleBlur.bind(this);
						this.handleChange 	= this.handleChange.bind(this);
						this.handleKeyDown 	= this.handleKeyDown.bind(this);
					// ----------------------------------------------------
						this.input  	= React.createRef();
						this.hidden  	= React.createRef();
						this._focused 	= false;
						this.timer  	= null;
					// ----------------------------------------------------
						if (!!this.props.data) {
							this._drop 		= React.createRef();
							this.previous 	= null;
						}
				}

				// GETTERS   /////////////////////////////////////////////////////////

					get data    () { return this.props.data; }
					get drop    () { return this._drop.current; }

					get ctx     () { return !!this.data.context; }
					get focused () { return this._focused; }
					get suggest () { return !!this.data; }
					get strict  () { return (this.data||{}).strict; }

					get start   () { return (this.data||{}).start||3; }
					get max  	() { 
						let THS = this, p = THS.state;
						return ((p.data||{}).max||10); 
					}
					get listCnt () { try { 
						return this.drop.parentElement.childElementCount/2; 
					} catch(e) { return 0; } }

					get typed 	() { return this.input.current.dataset.typed; }
					get value 	() { return this.input.current.value; }
					get current	() { return this.hidden.current.value; }

					get attrs 	() {
						return {
							input: 	((group, props, maxed, data) => {
										let token = props.hasOwnProperty('tokens'),
											seprt = !!props.separate,
											value = props.value;
										return {
											kind:		  token?'tokens':'text',
											id:			 `${group}-input`,
											form:		  seprt?null:group,
											disabled:	!!maxed,
											placeholder:  this.getPlacehold(props,maxed),
											forRef:		  this.input,
											onKeyDown:	  this.handleKeyDown,
											onFocus:	  this.handleFocus,
											onBlur:	 	  this.handleBlur,
											onChange:	!!data?this.handleChange:null,
											// change:		!!data?this.handleChange:null,
											complete:	!!data?'off':null,
											value:		 (value||{}).label,
										};
									}).bind(this),
							hiden: 	((group, props, value) => {
										let {id,name,required,priority,separate} = props;
										value = value||props.value;
										return {
											type: 		'hidden',
											name:		 name||id,
											id:			 id,
											form:		 separate?group:null,
											required:   !!required||priority=='*',
											value:		(value||{}).value,
										}
									}).bind(this),
							compl: 	((open, tokens = []) => {
										let state = Assign({}, this.data, {
												click:	this.doAdd.bind(this), 
												input:	this.input, 
												forRef: this._drop,
												verbs:  !!this.props.verbs,
												open: 	open,
											});
										return state;
									}).bind(this),
						};
					}

				// EVENTS    /////////////////////////////////////////////////////////

					handleFocus		(e) { 
						let THS = this; THS._focused = 1; 
						THS.suggest && THS.getList(THS.value);
					}
					handleBlur		(e) {
						let THS = this, data = THS.state.data; THS._focused = 0; 
						THS.suggest && Actions.Data.place(data.id,{open:false});
					}
					
					handleChange	(e) {
						let timer = this.timer; clearTimeout(timer); 
						this.focused && this.getList(e.target.value);
					}

					handleKeyDown	(e) {
						switch (e.keyCode) {
							case 40: this.doDropdown(); break;;
							case 13: this.doSubmit();   break;;
						}
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					getPlacehold(props, maxed) {
						let token = props.hasOwnProperty('tokens');
						if (token) {
							let plc = props.placeholder, tkn = props.tokens, 
								iAR = IS(plc)=='array',  cnt = tkn.length,
								len = plc.length-1;
							return !!maxed?null:(iAR?plc[cnt>len?len:cnt]:plc);
						}; 	return props.placeholder;
					}

					getList(text = '') {
						let THS = this; text = text.trim();
						// --------------------------------------------
						let ACTS  = Actions.Data,
							prev  = THS.previous, 
							data  = THS.data||{},
							cntx  = THS.ctx,
							val   = THS.current,
							start = THS.start,
							leng  = text.length,
							id    = data.id,
							list  = data.list,
							max   = data.max||10,
							count = this.listCnt,
							delay = 150,
							req   = { 
								method:	 'GET',
								headers: { token: COMPS.Token },
								params:	 {},
								query:	 Assign({ 
									id: id, limit: THS.max,
								},  cntx?{context:val}:{}),
							},
							func  = {
								typd:   () => (THS.previous=text),
								list: 	() => (func.typd(),ACTS.send(list, req, true)),
								data: 	() => (func.typd(),ACTS.send(data.url, 
												Assign(req ,{params:{term:text}}), 
												true)),
							}, 
							call  = func.data,
							maxed = count>=max,
							shrt  = leng<start,
							stat  = {
								equals: text==prev&&maxed,
								shortN: !!!list&&shrt,
								shortL: !!list&&shrt,
							};
						// --------------------------------------------

							console.log('ID: %s | MAX: %s | CNT: %s', id, max, count);

						THS.setTyped(text)
						switch (true) {
							case stat.equals: return ACTS.place(id,{open:true});
							case stat.shortN: return THS.clrList();
							case stat.shortL: call = func.list; break;;
						};
						// --------------------------------------------
						THS.timer = setTimeout(call, delay);
					}
					
					setTyped(text = '') {
						let THS = this; THS.suggest && (
							THS.input.current.dataset.typed = text||''
						);
					}

					clrList() {
						if (this.suggest) {
							let id = this.state.data.id;
							this.previous = '';
							Actions.Data.place(id, Assign(
								{}, (!!this.typed?{items:[]}:{})
							)	);
						}
					}
					clrValue(text = '') {
						if (!this.suggest) return;
						let NPT = this.input.current;
						NPT.value = text||'';
						NPT.dataset.typed = '';
						NPT.focus();
					}

				// DOERS     /////////////////////////////////////////////////////////

					doAdd(idx, tag) {
						let THS = this, L = 1, state = THS.state, id = state.id;
						// ------------------------------------------------
						if (idx == Infinity) idx = L;
						// ------------------------------------------------
						if (idx == L) {
							tag = !!tag ? tag : {}; 
							// --------------------------------------------
							THS.clrList(); THS.setTyped();
							THS.setState({ value: {
								label: tag.label, value: tag.value,
							} 	});
						};
					}

					doDropdown() {
						this.drop.focus(); this.drop.checked = true;
					}

					doSubmit() {
						let slct = 'button[type="submit"]',
							form = this.hidden.current.form;
						form.querySelector(slct).click();
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS 	= this,
							props 	= THS.state, 
							data 	= props.data,
							group 	= `tag-${props.id}`,
							open	= props.open,
							iattr 	= THS.attrs.input(group,props,false,data),
							hattr 	= THS.attrs.hiden(group,props);
						return (
							<div id={group} className="tags fill grow">
								<Frag key={group}>
									<Form.Input    {...props} {...iattr} spellcheck="off"/>
									<input         {...hattr} ref={this.hidden}/>
										{ !!data ?
									<Form.Complete {...THS.attrs.compl(open)}/>
										: null }
								</Frag>
							</div>
						);
					}
			}

			EV.Form.Tokens 		= class Tokens 		extends EV.Form.DataList {
				constructor(props) {
					let cls = 'tag', arw; super(props); this.name = 'TOKENS';
					// ----------------------------------------------------
						this.handleKeyDown 	= this.handleKeyDown.bind(this);
						this.handleFocus 	= this.handleFocus.bind(this);
						this.handleBlur 	= this.handleBlur.bind(this);
						this.handleChange 	= this.handleChange.bind(this);
						this.handleSelect 	= this.handleSelect.bind(this);
						this.handleClear 	= this.handleClear.bind(this);
						this.doArrows 		= this.doArrows.bind(this);
						this.doDelete 		= this.doDelete.bind(this);
					// ----------------------------------------------------
						this.attrRadio   = { type:'radio', className:cls }
						this.attrLabel   = { className:cls };
					// ----------------------------------------------------
						this.levels 	 = this.state.levels||[];
						this.level_dflt  = this.levels[0]||{K:undefined,V:null};
						this.verbs 	 	 = !!this.state.verbs;
						this.clearer 	 = this.getClear(props);
						this.mounted	 = false;
					// ----------------------------------------------------
						arw = [37,38,39,40];
						this.__arrows	 = arw;
						this.__arrows.H	 = [arw[0],arw[2]];
						this.__arrows.V	 = [arw[1],arw[3]];
						this.__arrows.L	 =  arw[0];
						this.__arrows.U	 =  arw[1];
						this.__arrows.R	 =  arw[2];
						this.__arrows.D	 =  arw[3];
				}

				// CYCLE     /////////////////////////////////////////////////////////

					componentDidUpdate() {
						let filt = (v)=>(!!v.attributes.autofocus),
							refs = Map(this.refs), elm;
						elm = refs.filter(filt).toArray()[0];
						try {elm.checked = true; elm.focus();}catch(e){}
					}

					componentDidMount() {
						this.mounted = true;
					}

				// GETTERS   /////////////////////////////////////////////////////////

					get size	() { return Object.keys(this.refs).length; }
					get length	() { return this.value.length; }
					get last	() { return this.size-1; }
					get removal	() { return this.props.removal||'mark'; }

					get arrows	() { return this.__arrows; }
					get remers	() { return [8,46]; }
					get adders	() { return [186]; }
					get enters	() { return [13]; }

					get leveled () { return this.levels.length > 0; }
					get more    () { return this.props.more; }
					
					get cursor	() { 
						let cond = {
							Zero: P => P!=0, Cont: P => false, Omit: P => true, 
						};
						return {
							  8: cond.Zero, 46: cond.Zero,
							 37: cond.Zero, 38: cond.Cont, 
							 39: cond.Omit, 40: cond.Cont, 
							186: cond.Cont, 13: cond.Cont,
							
						}; 
					}
					get move	() { return {
						37: (L,i) => i==0?0:i-1, 38: (L,i) => 0, 
						39: (L,i) => i==L?L:i+1, 40: (L,i) => L,
					}; }

					get attrs 	() {
						return Assign({
							token: 	((group, tag, i) => {
										let mnt = this.mounted,
											id 	= `${group}-${i}`,
											chk	= !!tag.checked,
											lvl = tag.level; 
										return {
											rad: Assign({},this.attrRadio,{
												'data-index':		i,
												'id': 				id, 
												'name': 			group, 
												'form':				group,
												'value': 			tag.value,
												'defaultChecked':	chk,
												'autoFocus':		mnt && chk,
												'onKeyDown': 		this.handleKeyDown,
											}),
											lbl: Assign({},this.attrLabel,{
												'htmlFor': 			id, 
												'data-level': 		!!lvl?lvl.V||lvl:lvl,
												'onClick': 			this.handleSelect(i),
											}),
										};
									}).bind(this),
						}, super.attrs);
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					getIndex(target) {
						return (
							target.type == 'text' ? this.last :
							parseInt(target.dataset.index)
						);
					}
					getPosition(target) {
						try { let P = target.selectionStart;
							if (!IaN(P)) throw {}; return P;
						} catch(e) { return -1; }
					}
					getValue(tokens) {
						let modes   = ['mark','delete'],
							origin  = this.props.tokens,
							removal = this.removal,
							mark    = removal==modes[0],
							k = List(tokens),
							e = (t)=>this.getLevel(t.value,t.level),
							r = [
								(v,t)=>`${v}${
									k.find(o=>o.value==t.value)?
										'':`${!!v?';':''}${t.value}`
								}`,
								(v,t)=>`${v}${!!v?';':''}${e(t)}`,
							],
							d = mark?origin.reduce(r[0],''):'',
							v = tokens.reduce(r[1],'');
						return `${[v,d].filter(v=>!!v).join(';')}`;
					}
					getLevel(value, level) {
						let THS  = this,
							lvls = List(THS.levels),
							lvld = THS.level_dflt,
							lvlv = lvls.find(l=>l.V==level),
							filt = v=>!!v, 
							res  = [];
						res.push((lvlv||lvld).V, value);
						return res.filter(filt).join('@');
					}
					getAdjct(should, adjct) {
						let THS = this, more = THS.more;
						if (!!should) {
							switch (IS(more)) {
								case 'array': return (
									more.has(adjct)?null:adjct
								);	 default: return adjct;
							}
						} else {
							return null;
						}
					}
					getMore(more) {
						let THS = this, isMore = THS.more;
						return !!isMore && !!Number(more)
					}
					getClear(props) {
						return ( !!props.clear ?
							<button type="button" className="clear" onClick={this.handleClear}>
								<i className={FA('times-circle')}></i>
							</button>
						: null );
					}

					hasItem(item = {}) {
						let THS = this, state = THS.state;
						return !!state.tokens.filter(
								t => t.value==item.value
							).length;
					}

				// EVENTS    /////////////////////////////////////////////////////////

					handleFocus		(e) { 
						let THS = this, ref = THS.refs[THS.last]; 
						ref.checked = true; super.handleFocus(e);
					}
					handleBlur		(e) {
						let THS = this; super.handleBlur(e);
					}

					handleChange	(e) {
						let THS = this; super.handleChange(e);
					}

					handleSelect	(i) { 
						return (e => this.refs[i].focus()).bind(this);
					}

					handleKeyDown	(e) {
						let THS 	= this,  
							arrows 	= THS.arrows, 
							remers 	= THS.remers,
							adders 	= THS.adders,
							enters 	= THS.enters,
							keys	= [].concat(arrows,remers,adders,enters),
							curs 	= THS.cursor,
							code 	= e.keyCode, 
							targ 	= e.target,
							i 		= THS.getIndex(targ), 
							P 		= -1;
						// Get text-selection status
						P = THS.getPosition(targ);
						// Filter key-codes

							// console.log('KEYCODE:', code, i)

						if (keys.has(code)) {
							// Ignore Processing if cursor is between text
							if (P>-1&&curs[code](P)) return;
							// Prevent any default actions
							e.preventDefault();
							// Handle Scenarios
							switch (true) {
								// Handle Arrows
								case arrows.has(code): THS.doArrows(i,code); break;;
								// Handle Backspace
								case remers.has(code): THS.doDelete(i,code,P); break;;
								// Handle Semi-Colon
								case adders.has(code): THS.doAdd(i); break;;
								// Handle Enter
								case enters.has(code): THS.doSubmit(); break;;
							}
						} else if (targ !== THS.input.current) {
							THS.input.current.focus();
						}
					}

					handleClear     (e) {
						this.setState({ tokens: [] });
					}

				// DOERS     /////////////////////////////////////////////////////////

					doTokens(props,nxt) {
						let tokens = props.tokens;
						tokens = tokens.map(
							(t,i)=>(t.checked=(i==nxt),t)
						);	this.setState(props);
					}

					doArrows(idx, code) {
						let L = this.last, 
							A = this.arrows, 
							i = idx, M, ref;
						// Move to Drop; if needed
						if (A.V.has(code)&&i==L) {
							this.drop.focus();
							this.drop.checked = true;
						} else {
							// Get Next Tag
							M = this.move[code](L,i); ref = this.refs[M];
							ref.checked = true; ref.click(); ref.focus();
							if (M == L) {
								this.input.current.selectionStart = this.length;
								ref.nextSibling.focus();
								ref.nextSibling.click();
							}
						}
					}

					doDelete(idx, code, pos) {
						let props = FromJS(this.state).toJS(), nxt;
						if (pos==0) this.doArrows(idx,37); else {
							let tokens = props.tokens;
							switch (code) {
								case  8: nxt = idx-Number(idx>0); break;;
								case 46: nxt = idx; break;;
							}
							tokens.splice(idx,1);
							this.doTokens(props,nxt);
						} 
					}

					doAdd(idx, tag) {
						let THS = this, L = THS.last;
						if (idx == Infinity) idx = L;
						// ------------------------------------------------
						if (idx == L) {
							tag = !!tag ? tag : {};
							// --------------------------------------------
							let props 	= FromJS(THS.state).toJS(),
								tokens	= props.tokens,
								label	= tag.label||THS.value,
								value	= tag.value||value,
								more    = tag.more,
								adjct   = tag.adjct,
								item  	= Assign({ 
									value:		value,
									label:		label,
									adjct:		adjct,
									more:		more,
									checked:	true,
								}, THS.leveled ? {
									level: THS.levels[0] 
								} : {});
							// --------------------------------------------
							if (!THS.hasItem(item)) {
								tokens.push(item); 
								THS.clrList();
								THS.doTokens(props,idx);
							}; 	THS.clrValue();
						}
					}
				
				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS 	= this,
							props 	= THS.state, 
							tokens 	= props.tokens||[], 
							value 	= { value: this.getValue(tokens) },
							classes = classN('tags','fill','grow',props.styles),
							data 	= props.data,
							clear 	= this.clearer,
							limit 	= props.limit||999,
							length 	= tokens.length,
							maxed 	= length>=limit,
							group 	= `tag-${props.id}`,
							open	= props.open,
							mounted = this.mounted,
							iattr 	= THS.attrs.input(group,props,maxed,data),
							hattr 	= THS.attrs.hiden(group,props,value),
							tattr 	= {},
							more    = false,
							adjct   = '';
						return (
							<div id={group} className={classes}>
								<Frag>
									{tokens.map((t,i) => (i<=limit ? ( 
										tattr = THS.attrs.token(group,t,i),
										more  = THS.getMore(t.more),
										adjct = THS.getAdjct(more,t.adjct),
										<Frag key={tattr.rad.id}>
											<input {...tattr.rad} ref={i}/>
											<label {...tattr.lbl}>
												<span>{t.label}</span>
													{ more && !!adjct ?
												<span className="more">{adjct}</span>
													: null }
											</label> 
										</Frag>
									) : null ) )}{(
										tattr = THS.attrs.token(group,{
													value: '', checked: !!!length
												},length),
										<input ref={length} {...tattr.rad}/> )}
									<Form.Input    {...props} {...iattr} autoFocus={mounted&&!!!length} spellcheck="off"/>
									<Frag>
										<input         {...hattr} ref={this.hidden}/>
										{ clear }
									</Frag>
										{ !!data ?
									<Form.Complete {...THS.attrs.compl(open,tokens)}/> 
										: null }
								</Frag>
							</div>
						);
					}
			};

			EV.Form.Complete 	= class Complete	extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); let THS = this, state = THS.state, id = state.id; 
					// ------------------------------------------------------------
						THS.handleOpen 		= THS.handleOpen.bind(THS);
						THS.handleClose 	= THS.handleClose.bind(THS);
						THS.handleChange 	= THS.handleChange.bind(THS);
						THS.handleKeyDown 	= THS.handleKeyDown.bind(THS);
						THS.handleMEnter 	= THS.handleMEnter.bind(THS);
						THS.handleMLeave 	= THS.handleMLeave.bind(THS);
						THS.handleMDown 	= THS.handleMDown.bind(THS);
						THS.handleMUp 		= THS.handleMUp.bind(THS);
					// ------------------------------------------------------------
						THS.name 		= 'COMPLETE';
						THS.click 		=  state.click||(()=>false);
						THS.url 		=  state.url;
						THS.sleep 		=  false;
						THS.lock 		=  false;
						THS.verbs 		=  !!state.verbs;
						THS._max		=  state.max;
						THS.more 		=  state.more;
					// ------------------------------------------------------------
						THS.mapStoreToState(
							COMPS.Stores.Data, store => {
								let gOpen  = (o,i)=>(NIL(o)?(i||[]).length>0:o),
									{items,stamp,open} = (store[id]||{});
								if (!!stamp&&stamp!==THS.state.stamp) {
									return Assign({
										open:  gOpen(open,items),
										stamp: stamp, 
										items: items,
								});	} else return {};	
							}
						);
				}

				// GETTERS   /////////////////////////////////////////////////////////

					get input  () { return this.props.input.current||{}; }
					get max    () { return this._max||10; }

				// FUNCTIONS /////////////////////////////////////////////////////////

					getIndex(target) {
						try{return parseInt(target.dataset.idx);}
						catch(e){console.log(`${THS.name} | getIndex |`,e)}
					}
					getItem(target) {
						let THS = this, state = THS.state, items = state.items||[];
						return items[THS.getIndex(target)];
					}
					getAdjct(should, adjct) {
						let THS = this, more = THS.more;
						if (!!should) {
							switch (IS(more)) {
								case 'array': return (
									more.has(adjct)?null:adjct
								);	 default: return adjct;
							}
						} else {
							return null;
						}
					}
					getMore(more) {
						let THS = this, isMore = THS.more;
						return !!isMore && !!Number(more)
					}

					setItem(target) {
						let THS   = this,
							state = THS.state,
							targ  = target,
							item  = THS.getItem(targ);
						setTimeout(() => {
							THS.handleClose({target:target});
							THS.setState({ open: false });
							THS.input.dataset.typed = '';
						},  10);
						!!item && state.click(Infinity, { 
							value:		item.value,
							label:		item.label,
							adjct:		item.adjct,
							more:		item.more,
						}); 
					}
					setSuggest(targ) {
						let THS = this, NPT = THS.input,
							cls = targ.parentElement.className;
						if (!cls.split(' ').has('open')) return;
						NPT.value = THS.getItem(targ).label;
					}

					clrSuggest() {
						let THS = this, NPT = THS.input;
						NPT.value = NPT.dataset.typed;
					}

				// EVENTS    /////////////////////////////////////////////////////////

					handleOpen  (e) { 
						let THS = this, targ = e.target;
						THS.setState({ open: true }); 
						THS.setSuggest(targ);
					}
					handleClose (e) { 
						let targ = e.target; if (this.sleep) return;
						if (!!targ.checked) targ.checked = false;
						else this.setState({ open: false }); 
					}

					handleChange(e) { 
						let targ = e.target; [
							this.handleClose, this.handleOpen
						][targ.checked+0](e);
					}

					handleKeyDown(e) {
						e.stopPropagation();
						let THS  = this,
							code = e.keyCode,
							targ = e.target,
							prnt = targ.parentElement,
							indx = THS.getIndex(targ),
							last = (prnt.children.length/2)-1,
							prvn = ()=>e.preventDefault(),
							clrs = ()=>THS.clrSuggest(),
							fcus = ()=>THS.input.focus(),
							hndl = {
								first: ()=>indx==0&&(prvn(),clrs(),fcus()),
								last:  ()=>indx==last&&(prvn(),clrs(),fcus()),
								enter: ()=>this.setItem(targ),
							},
							func = ({ 
								13: hndl.enter,
								37: hndl.first, 
								38: hndl.first, 
								39: hndl.last, 
								40: hndl.last,
							})[code];
						if (!!func) { func(); return false; }
					}

					handleMEnter(e) {
						e.stopPropagation(); if (this.lock) return;
						let THS = this, targ = e.target.previousSibling;
						targ.focus(); THS.setSuggest(targ);
					}
					handleMLeave(e) {
						e.stopPropagation(); if (this.lock) return;
						let THS = this, targ = e.target.previousSibling;
						targ.blur();  THS.clrSuggest(targ);
					}
					handleMDown(e) {
						let THS = this; THS.sleep = true; THS.lock = true;
					}
					handleMUp(e) {
						let THS = this; THS.sleep = false; 
						THS.setItem(e.target.previousSibling);
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS 	= this,
							state 	= THS.state,
							id		= state.id,
							items 	= state.items||[],
							open    = !!state.open,
							morerr  = (s) => { 
								let THS   = this, 
									more  = THS.getMore(s.more),
									adjct = THS.getAdjct(more, s.adjct),
									clss  = more?"more":null,
									rslt  = !!adjct ? (<span className={clss}>{adjct}</span>) : null;
								// console.log('TOKEN:', more, !!rslt, s)
								return rslt;
							},
							labelr 	= {
								true:  (s)=>(<Frag><i>{`${s.verb} `}</i><b>{s.label}</b></Frag>),
								false: (s)=>(<Frag>{s.label}</Frag>),
							}[!!(THS.verbs)];
						THS.lock = false;
						return (
							<div id={id} className={classN("suggest",{open:open})} onBlur={THS.handleClose}>
								{items.map((s,i,a,n) => (
									n = `${id}-${i}`,
									<Frag key={n}>
										<input 	type="radio" id={n} form={id} name={id} 
												defaultChecked={false} value={s.value} 
												ref={i==0?state.forRef:null}
												onKeyDown={THS.handleKeyDown}
												onChange={THS.handleChange}
												onFocus={THS.handleOpen} 
												data-idx={i}/>
										<label 	className="trunc"
												onMouseEnter={THS.handleMEnter}
												onMouseLeave={THS.handleMLeave}
												onMouseDown={THS.handleMDown}
												onMouseUp={THS.handleMUp}
												htmlFor={n}>{labelr(s)}{morerr(s)}</label>
									</Frag>
								))}
							</div>
						);
					}
			};
			EV.Form.Complete.defaultProps = {
				id: 	'',
				url: 	'/',
				max:	10,
				open: 	false,
				more: 	true,
			};

			EV.Form.Area 		= class Area 		extends Mix('React', 'Static', 'Forms') {
				constructor(props) {
					super(props); this.name = 'AREA';
					this.forRef = props.forRef||React.createRef();
				}

				componentDidUpdate() {
					let props = this.props,
						value = (props.value||''),
						len   = value.length,
						input = this.forRef.current;
					input.setSelectionRange(len,len);
				}

				render() {
					let props 	= this.props, 
						id      = props.id, 
						name    = props.name||id, 
						place 	= props.placeholder,
						kyPress = props.onKeyPress,
						value   = this.getDefault(props.value);
					return (
						<Form.Xput {...props}>
							<textarea key={id} {...{  
								ref:            this.forRef||null,
								id: 			id, 
								name: 			name, 
								rows: 			props.rows||'2',
								placeholder:	IS(place)=='function'?place.bind(props)():place, 
								autoFocus:      props.autoFocus,
								tabIndex: 		props.tab,
								className:		'fill grow',
								onKeyPress:     kyPress,
							}} {...value}/>
						</Form.Xput>
					);
				}
			};

			EV.Form.Select 		= class Select 		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'SELECT';
				}

				// FUNCTIONS /////////////////////////////////////////////////////////

					getInputProps(input) {
						let restrict = input.restrict||[];
						return Assign({
							'style': ['slc','grow'],
						}, 	input);
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let props 	= Assign({},this.props), 
							kind  	= props.kind, 
							id      = props.id, 
							name    = props.name||id, 
							input 	= props.input,
							rev 	= !!props.reverse,
							styles 	= [kind].concat(rev?['rev']:[]),
							valid 	= props.validate,
							attrs 	= {  
								id: 		id, 
								name: 		name, 
								title: 		props.title, 
								tabIndex: 	props.tab,
								className:	classN('fill',!!input?'':'grow'),
								value:		props.value,
								options:	props.options,
								nullValue:	props.nullValue,
								data:		props.data,
								required:	props.required||props.priority=='*',
								restrict:	!!input?input.restrict:null,
								onChange: 	props.onChange,
							};
						return (
							<Form.Xput {...props} id={!!input?input.id:id} styles={styles} name={!!input?input.name:name}>
								<Form.Selector {...attrs} />
								<span></span>
									{ !!valid ?
								<Form.Validate {...valid} /> 
									: null }
								{ !!input ? ( input.kind=='tokens' ?
									<Form.Tokens {...this.getInputProps(input)}/> :
									<Form.Input  {...this.getInputProps(input)}/>
								): null }
							</Form.Xput>
						);
					}
			};
			EV.Form.Selector 	= class Selector 	extends Mix('Reflux','Static') {
				constructor(props) {
					super(props); this.name = 'SELECT';
					// ------------------------------------------------------------
						let THS = this, data = props.data, id;
					// ------------------------------------------------------------
						THS.handleChange  = THS.handleChange.bind(THS);
						THS.handleInput   = THS.handleInput.bind(THS);
						THS.handleInvalid = THS.handleInvalid.bind(THS);
						THS.change = props.onChange||(()=>(null));
					// ------------------------------------------------------------
						onBrowser(() => {
							if (!!data&&data.id) { id = data.id;
								Actions.Data.grab(id, (store) => {
									console.log('SELECT ITEMS:', id, store)
									THS.state = {
										stamp: store.stamp,
										options: store.items,
										loaded: true
									};
								});
								THS.mapStoreToState(COMPS.Stores.Data, store => {
									let data = store[id]||{}, stamp = data.stamp;
									if (!!stamp&&stamp!==THS.state.stamp) return { 
										stamp: stamp, loaded: true, options: data.items, 
									}; 	else return null;	
								}	);
							}
						});
				}

				// CYCLE     /////////////////////////////////////////////////////////

					componentDidMount() {
						let THS  = this,
							prop = THS.state, 
							actn = Actions.Data,
							send = actn.send,
							data = prop.data,
							load = !!prop.loaded;
						if (!!data&&!!document&&!load) {
							let url = data.url, id = data.id; 
							if (!!!DATA_TMR[id]) DATA_TMR[id] = setTimeout(
								() => { send(url, {
										method:	'GET', headers: { token: COMPS.Token },
										params:	{}, query: { id: id, limit: 100 },
									}	); 
									setTimeout(()=>(DATA_TMR[id]=null), 100);
								}, 	100);
						};
					}

				// GETTERS   /////////////////////////////////////////////////////////

					get restrictions () { return this.props.restrict||[]; }
					get selector	 () { return this.refs.slc; }
					get selected 	 () { return this.selector.selectedOptions[0]; }
					get value		 () { return this.selected.value; }

				// EVENTS    /////////////////////////////////////////////////////////

					handleChange(e) {
						let strct = this.restrictions,
							value = this.value,
							will  = strct.has(value),
							key   = 'restrict'; 
						if (!will) {
							delete this.selector.dataset[key];
						} else {
							this.selector.dataset[key] = "";
						};	this.change(e);
					}

					handleInput(e) {
						e.target.setCustomValidity('');
					}
					handleInvalid(e) {
						e.target.setCustomValidity(' ');
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					//

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS     = this,
							props 	= THS.props, 
							state 	= THS.state, 
							opts  	= state.options||[],
							title 	= props.title,
							nullval = props.nullValue,
							hasOpts = !!opts.length,
							selval  = hasOpts?state.value:undefined,
							rstrct  = THS.restrictions.has(selval)?"":undefined,
							attrs 	= {  
								id: 			props.id, 
								name: 			props.name, 
								title: 			title, 
								tabIndex: 		props.tab,
								className:		props.className,
								required:		!!props.required,
								defaultValue:	selval,
								onChange:		THS.handleChange,
								onInput:		THS.handleInput,
								onInvalid:		THS.handleInvalid,
							};
						return (
							<select ref="slc" {...attrs} data-restrict={rstrct}>{ 
								[{ disabled:true, value:nullval, label:title }].concat(opts).map((o,i) => {
									let { disabled, value, label } = o, selected = (value==selval); return (
										<option key={`opt-${i}`} {...{ value, disabled, selected }}>{label}</option>
								); 	}
							)}</select>
						);
					}
			};

			EV.Form.DateTime 	= class DateTime 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'DATETIME'; this._date = null;
					// -------------------------------------------------------------//
						this.limit  = {min:1900,max:new Date().getFullYear()};
						this.hidden = (props.hide||[]);
						this.timer  = null;
					// -------------------------------------------------------------//
						let { id, names = {}, autos = {} } = props
					// -------------------------------------------------------------//
						let defNM = `${id}-group`,
							NAMES = Map(Assign({
								mth: defNM, day: defNM, yrs: defNM,
								hrs: defNM, min: defNM,
							},	names));
						this.names 	= NAMES.map(v=>({name:v})).toJS();
					// -------------------------------------------------------------//
						let AUTOS = Map(Assign(autos, {
								mth: 'bday-month', 
								day: 'bday-day', 
								yrs: 'bday-year',
								hrs:  null, 
								min:  null,
							}));
						this.autos 	= AUTOS.map(v=>({
							autoComplete: v
						})).toJS();
				}

				// GETTERS ///////////////////////////////////////////////////////////

					get Date ( ) { return this._date; }
					set Date (d) { this._date = d; 	 }

					get Which( ) { return Map({mth:1,day:0,yrs:0,hrs:0,min:0}); }
					get Acts ( ) { return {mth:'Month',day:'Date',yrs:'FullYear',hrs:'Hours',min:'Minutes',}; }

					get Get  ( ) {
						let THS   = this,
							date  = THS.Date,
							which = THS.Which,
							acts  = THS.Acts,
							gtNum = (act,ofs)=>(date[`get${act}`]()+ofs),
							frNum = (num)=>(num.toString().padStart(2,'0')),
							hndl  = (wch)=>(()=>{
								let res = '', act = acts[wch], ofs = which.get(wch);
								try { res = frNum(gtNum(act,ofs)); } catch (e) {}
								return res;
							}).bind(THS);
						return {
							mth: hndl('mth'),
							day: hndl('day'),
							yrs: hndl('yrs'),
							hrs: hndl('hrs'),
							min: hndl('min'),
						};
					}
					get Set  ( ) {
						let THS   = this,
							prs   = parseInt,
							which = THS.Which,
							acts  = THS.Acts,
							getr  = (e)=>{
								let t = e.target,   s = prs(t.size),
									n = prs(t.min), x = prs(t.max),
									v = t.value,    l = v.length, r;
								r = prs(v.slice(l-s));
								r = r>x?x:r; r = r<n?n:r; 
								return r;
							},
							hndl  = (wch)=>((e)=>{
								let dte =  new Date(THS.Date);
								// -----------------------------------------
								let act =  acts[wch], 
									hnd = `set${act}`,
									ofs =  which.get(wch),
									val =  getr(e),
									res =  Math.abs(val-ofs),
									prt;
								// -----------------------------------------
								THS.Date[hnd](res);
								prt = prs(THS.getParts()[wch]);
								// Handle EoM / Leap Years -----------------
								if (prt!=val) {
									THS.Date = dte;
									switch (wch) {
										case 'mth': case 'yrs': 
											let yrs = wch=='yrs'?res:dte.getFullYear(),
												mth = wch=='mth'?res:dte.getMonth(),
												day = THS.getEoM(mth,yrs);
											THS.Date.setDate(1); 
											THS.Date[hnd](res);
											THS.refs.day.value = day;
											THS.Date.setDate(day); 
											break;;
										default: THS.Date[hnd](val-prt);
									}
								}; THS.timer = null;
							});
						return {
							mth: hndl('mth'), day: hndl('day'), yrs: hndl('yrs'),
							hrs: hndl('hrs'), min: hndl('min'),
						};
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					hasLeap(year) {
						if (!!!year) return false;
						return ((year%4==0)&&(year%100!=0))||(year%400==0);
					}

					hasHidden(which) {
						return this.hidden.has(which)
					}

					getLimit(limit) { 
						return Assign({},this.limit,limit||{}); 
					}

					getEoM(month, year) {
						let leap = this.hasLeap(year),
							filt = (m)=>(m.months.has(month)&&m.leap==leap),
							rslt = [
								{ leap: 0, days: 31, months: [0,2,4,6,7,9,11] },
								{ leap: 0, days: 30, months: [3,5,8,10] },
								{ leap: 0, days: 28, months: [1] },
								{ leap: 1, days: 29, months: [1] },
							].filter(filt);
						return rslt[0].days;
					}

					getAttrs(props) {
						let THS 	= this, {
								id, value, limit, tab, required, 
								priority, separate = false
							} 		= props, 
							parts 	= THS.getParts(value),
							specs 	= {
								mth: Assign({ min: "01", max: "12" }),
								day: Assign({ min: "01", max: "31" }),
								yrs: Assign({ size: 4 },THS.getLimit(limit)),
								hrs: Assign({ min: "00", max: "23" }),
								min: Assign({ min: "00", max: "59", step: 10 }),
							},
							split	= (separate?{}:{form:`${id}-form`}),
							names   = THS.names,
							autos   = THS.autos,
							attrs 	= Assign({ 
								type: 		 'number', 
								align: 		 'center', 
								tabIndex: 	  tab,
								className:	 'fill',
								size:		  2,
								required:	  !!required||priority=='*',
							}, 	split);
						return THS.Which.map((i,w)=>Assign(
							{}, attrs, {
								id: 			`${id}-${w}`, 
								onChange: 		 THS.setParts(w),
								defaultValue:	 parts[w],
							},  specs[w], names[w], autos[w])
						).toObject();
					}

					getParts(value = '') {
						let THS = this; try { 
							let spl = value.match(/\d+/g).map(p=>parseInt(p));
							if (spl.length>1) spl.splice(1,1,spl[1]-1);
							THS.Date = new Date(...spl);
						} catch(e) {};
						return {
							mth: this.Get.mth(), day: this.Get.day(),
							yrs: this.Get.yrs(), hrs: this.Get.hrs(),
							min: this.Get.min(),
						};
					}
					setParts(which) {
						return ((e) => {
							let targ = e.target,  val = targ.value,
								size = targ.size, len = val.length;
							if (!!!val||val=='0'||(size==4&&len<size)) {
								this.refs.input.value = ''; return;
							}
							// ----------------------------------------------
							e.persist(); clearTimeout(this.timer);
							if (!!!this.Date) this.Date = new Date();
							// ----------------------------------------------
							this.timer = setTimeout((() => {
								let time = !!this.props.time, 
									vals = ['','',''], part;
								// ------------------------------------------
								this.Set[which](e);
								part = this.getParts(this.Date); 
								this.refs[which].value = part[which];
								// ------------------------------------------
								vals = [[part.yrs, part.mth, part.day].join('-')]
										.concat(time?[[part.hrs,part.min].join(':')]:[]);
								// ------------------------------------------
								this.refs.input.value = vals.join(' ');
							}).bind(this), 250)
						}).bind(this);
					}

				// MAIN    ///////////////////////////////////////////////////////////

					render() {
						let props 	 = this.props, 
							id  	 = props.id, 
							name  	 = props.name||id, 
							value 	 = props.value||"", 
							hide	 = this.hasHidden.bind(this),
							attrs 	 = this.getAttrs(props),
							valid 	 = props.validate,
							time  	 = !!props.time,
							separate = !!props.separate,
							divider  = (<i className="fill"></i>),
							nputAttr = Assign({
								type: "hidden", id: id, name: name,
								pattern: (valid||{}).pattern,
								defaultValue: value,
							}, (separate ? { 
								form: `${id}-validate` 
							} : {}));
						return (
							<Form.Xput priority=" " {...props} styles={['date',time?'time':'']}>
								{/* Expand to see conditions... */}
									{	!hide("mth") ? <Frag>
								<input ref="mth" {...attrs.mth} placeholder="MM"  />{divider}</Frag> : null 
									}{	!hide("day") ? <Frag>
								<input ref="day" {...attrs.day} placeholder="DD"  />{divider}</Frag> : null 
									}{	!hide("yrs") ? <Frag>
								<input ref="yrs" {...attrs.yrs} placeholder="YYYY"/></Frag> : null }{time ? <Frag>
									{	!hide("hrs") ? <Frag>
								<input ref="hrs" {...attrs.hrs} placeholder="00"  />{divider}</Frag> : null 
									}{	!hide("min") ? <Frag>
								<input ref="min" {...attrs.min} placeholder="00"  /></Frag> : null 
									}</Frag> : null}
								<input ref="input" {...nputAttr}/>
									{ !!valid ?
								<Form.Validate {...valid} delim="/"/> 
									: null }
							</Form.Xput>
						);
					}
			};

			EV.Form.Checkbox 	= class Checkbox 	extends Mix('React', 'Static', 'Forms') {
				constructor(props) {
					super(props); this.name = 'CHECKBOX';
					this.Face = []; this._faces = [
						'norm',  'good',  'info',  'warn',  'nope',
						'norm-y','good-y','info-y','warn-y','nope-y',
						'norm-n','good-n','info-n','warn-n','nope-n',
					];
				}

				// EVENTS    /////////////////////////////////////////////////////////

					handleInc(valueSelector) {
						return !!!valueSelector ? null : ((e) => {
							var CHK   	= e.target, FLW, TWN,
								SEL   	= `#${valueSelector}`,
								HID   	= document.querySelector(SEL),
								follow 	= CHK.dataset.follows,
								value 	= parseInt(CHK.value), 
								total 	= parseInt(HID.value),
								checked = CHK.checked,
								name 	= CHK.name;
							FLW = this.getFollowers(HID,name,value,follow,checked);
							FLW.forEach(EL=>(EL.checked=checked,value=value|parseInt(EL.value)));
							HID.value = total^value;
						}).bind(this);
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					getStyles(styles) {
						let THS   = this,
							rslts = ["toggle"].concat(styles),
							filtr = (s)=>(!faces.has(s)&&1||(THS.Face.push(s),0)),
							faces = THS._faces;
						return rslts.filter(filtr);
					}

					getFollowers(hidden, name, value, follow, checked) {
						let CFL = [':invalid',':not(:checked)'],
							CNM = [':checked',':invalid'],
							SEL = `input${[
								`[value="${value}"]:not([name="${name}"])`,
								`[data-follows="${name}"]${CFL[+checked]}`,
								`[name="${follow}"]${CNM[+checked]}`,
							].filter(v=>!!v).join(',input')}`;
						return hidden.form.querySelectorAll(SEL);
					}

					getClick(props) {
						let THS 	= this, 
							incrm 	= props.increment,
							click 	= props.click,
							res 	= null;
						switch (true) {
							case !!incrm: res = THS.handleInc(incrm); break;;
							case !!click: res = click.bind(THS); break;;
						};	return res;
					}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS 	= this,
							props 	= THS.props, { 
								name,  id, yes, ycon, required, 
								form, tab,  no, ncon, checked, 
								follows, classes = [],
							} 		= props, 
							HOC     = !!props.HOC,
							styles	= THS.getStyles(props.styles),
							autoc  	= THS.getAutoComp(name,props),
							value   = THS.getDefault(props.value),
							click 	= THS.getClick(props),
							face 	= THS.Face||[],
							attrs 	= {
								'htmlFor':		id,
								'className': 	classN('tgl','gpu',...face),
								'data-yes':		yes,
								'data-ycon':	ycon,
								'data-no':		no,
								'data-ncon':	ncon,
							},
							box     = (
								<input ref={props.forRef} {...{ 
									'type': 			 "checkbox", 
									'id': 				  id, 
									'name': 			  name||id, 
									'form': 			  form, 
									'tabIndex': 		  tab,
									'autoComplete':		  autoc,
									'required':			!!required,
									'defaultChecked':	!!checked,
									'onClick':			  click,
									'data-follows':		  follows,
									'className':		classN({hoc:HOC}),
									'disabled':			!!props.disabled,
								}} {...value}/>
							);
						return (<Frag>
							{ HOC ? box : null }
							<Form.Xput {...props} noFor={true} styles={styles}>
								<label {...attrs} htmlFor={HOC?id:undefined}>{ 
									HOC ? <div> </div> : box 
								}</label>
							</Form.Xput>
						</Frag>);
					}
			};

			EV.Form.Button 		= class Button 		extends Mix('React', 'Dynamic') {
				constructor(props) {
					super(props); this.name = 'BUTTON';
					this.Kinds  = { button: 'button', submit: 'submit' };
					this.button = this.getButton(props);
				}

				getStyles(props) {
					let opts = ['block','large'], keys = Object.keys(props);
					return ["tkn"].concat(keys.filter(v=>opts.has(v)),props.styles||[]);
				}

				getButton(props) {
					let kind	= this.Kinds[props.kind.trim()], 
						styles	= this.getStyles(props),
						font	= props.font/* ||'1rem' */,
						action 	= props.action,
						label 	= props.label,
						icon 	= props.icon,
						icProps = props.iconProps||{},
						icAfter = !!icProps.after,
						icEdge  = !!icProps.edge,
						icSpace = (!!label?'\u00a0':null),
						ICON    = (!!icon?(
							<Frag key="icon">
								{icAfter ? icSpace : null}
								<i className={classN(FA(icon),{edge:icEdge})}></i>
								{icAfter ? null : icSpace}
							</Frag>
						):null),
						attrs 	= {
							id:  		props.id,
							type:		kind||'button',
							className:	classN(...styles,{after:icAfter}),
							style:		!!font?{ fontSize:font }:null,
							onClick:	action,
							disabled:	props.disabled,
						};
					return (
						<button key="bttn" {...attrs}><span key="text">
							{!!icAfter ? null : ICON}
							{label}
							{!!icAfter ? ICON : null}
						</span></button>
					);
				}

				render() {
					return this.button;
				}
			};
			EV.Form.Button.defaultProps = {
				kind: 	'button',
				styles:	 [],
				font:	 null/* '1rem' */,
				action:  null,
				label:	 null,
				icon:	 null,
			}

		// MULTI   /////////////////////////////////////////////////////////

			EV.Content.Multi 	= class Multi	 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'MULTI';
				}

				getText({ adjct, href, label, lvl = false } = props) {
					let cls = { 
							'className': lvl?'lvl':null,
							'data-more': adjct||null,
						},
						lnk = !!href,
						lbl = label||'...';
					return (lnk ?
						<a href={href||'#'} {...cls}>{lbl}</a> :
						<span {...cls}>{lbl}</span>
					);
				}

				render() {
					let Text     = this.getText,
						props 	 = this.props, 
						kind 	 = props.kind, 
						lvl		 = props.hasOwnProperty('level'),
						weight 	 = props.weight||'',
						size	 = `data-x${props.size||1}`,
						collapse = !!props.collapse,
						attrs	 = {
							'type': 		"button",
							'className':	classN(['multi','tkn',kind,weight],{collapse}),
							'value':		 props.value||null,
							[size]:			'', 
						};
					return (
						<button {...attrs}>
							<Frag>
								{<Text key="multi" {...props}/>}{lvl ? 
									<Text key="level" {...props.level} lvl={true}/>
								: null}
							</Frag>
						</button>
					);
				}
			};

			EV.Content.Multis 	= class Multis	 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'MULTIS';
				}

				render() {
					let props 	= this.props, 
						name	= props.name,
						align	= props.align||'spread',
						flex  	= classN(['flex','flexSpaceS','flexDirRow','flexWrap']),
						head 	= props.header,
						items	= props.items||[],
						attrs	= {
							kind: 	props.kind,
							size: 	props.size,
							weight: props.weight
						};
					return (
						<div key="container" className={align}>
							{!!head?<h5 key="head">{head.label}</h5>:null}
							<div key="multis" className={flex}>{items.map((v,i) => (
								<Content.Multi key={`multi-${name}-${i}`} {...attrs} {...v}/>
							))}</div>
						</div>
					);
				}
			};

		// LISTS   /////////////////////////////////////////////////////////

			EV.Content.List 	= class List	 	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'LIST';
				}

				render() {
					let props 	= this.props, 
						name	= props.name,
						align	= props.align||'spread',
						style	= props.style||'bare',
						head 	= props.header,
						items	= props.items||[],
						kind 	= props.kind;
					return (
						<div className={align}>
							{!!head?<h5>{head.label}</h5>:null}
							<ul className={style}>
								{items.map((v,i) => {
									let id = `li-${name}-${i}`;
									return (<li key={id} id={id} className={kind}>{v||'...'}</li>);
								})}
							</ul>
						</div>
					);
				}
			};

			EV.Content.Person	= class Person		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'PERSON';
				}

				render() {
					let props 	= this.props, 
						name	= props.name||'... ...',
						classes	= classN('bubble', 'small', props.style||'lite', 'gpu'),
						img 	= { backgroundImage: `url('${props.img||''}')` },
						href	= props.href||'';
					return (
						<a href={href} className="stub small">
							<div className={classes} style={img}></div>
							<dt>{name}</dt>
						</a>
					);
				}
			};

			EV.Content.Activity	= class Activity	extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'ACTIVITY';
				}

				render() {
					let props = this.props, title = props.title||'...', details	= props.details||'...';
					return (<dl><dt>{title}</dt><dd className="ellipsis">{
						IS(details)==='object'?Agnostic(details,'detail'):details
					}</dd></dl>);
				}
			};

		// TRUSTS  /////////////////////////////////////////////////////////

			EV.Trusts 			= class Trusts		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'TRUSTS';
					this.keyNames = ['shield','br','rating']
										.map(v=>`trust-${v}`);
				}

				render() {
					let keys 	= this.keyNames,
						props 	= this.props, 
						shields = props.shields||[], 
						items 	= shields.items,
						size 	= shields.size,
						rating	= props.rating,
						both 	= !!rating&&!!items.length;
					return (
						<Frag>
							{items.map((v,i)=>
								<Trusts.Shield key={`${keys[0]}-${i}`} kind={v} size={size}/>
							)
							.concat(both?[<br key={keys[1]}/>]:[])
							.concat(!!rating?[
								<Trusts.Rating key={keys[2]} {...rating}/>
								]:[]
							)}
						</Frag>
					);
				}
			};
			
			EV.Trusts.Shield	= class Shield		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'SHIELD';
				}

				render() {
					let props = this.props, kind = props.kind, size = props.size, 
						classes	= classN('shield', kind||'invalid', size||'large');
					return (<label className={classes}><i></i><span></span></label>);
				}
			};

			EV.Trusts.Badge		= class Badge		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'BADGE';
				}

				render() {
					let props = this.props, 
						icon = props.icon, kind = props.kind, size = props.size, 
						classes = classN('badge', kind||'norm', size||'sm');
					return (
						<div key={`badge-${1}`} className={classes}>
							<i className={FA(icon)}></i>
						</div>
					);
				}
			};

			EV.Trusts.Rating	= class Rating		extends Mix('React', 'Static') {
				constructor(props) {
					let len = {length:5}, inc = ((v,i)=>i+1);
					super(props); this.name = 'RATING';
					this.points = Array.from(len,inc).reverse();
					this.attrs  = [
						'data-rating-half',
						'data-rating',
						'data-strike'
					];
				}

				getCount(count) { 
					let cnt = count.toString(),
						len = cnt.length-1,
						zro = [cnt[0]].concat(Array.from({length:len},()=>0)),
						flr = parseInt(zro.join(''));
					return Math.floor(count/flr)*flr; 
				}
				getStrikes(strikes) { return Array.from({length:strikes||0},(v,i)=>(i+1)); }
				getRatings(score,strikes) {
					let P = this.attrs; return v => {
						let sc = score, ps = parseInt(Math.ceil(sc)), attr = {};
						if (ps==v) attr[P[Number(v==sc)]]='';
						if (strikes.has(v)) attr[P[2]]='';
						return (<label key={`star-${v}`} {...attr}></label>)
					}
				}

				render() {
					let props 	= this.props,
						points 	= this.points,
						score 	= props.score, 
						strikes = this.getStrikes(props.strikes), 
						count 	= this.getCount(props.count);
					return (
						<div className="spread">
							<label className="rating" data-cnt={count}>
								<div>{points.map(this.getRatings(score,strikes))}</div>
							</label>
						</div>
					);
				}
			};

		// FOOT    /////////////////////////////////////////////////////////
			EV.Foot 			= class Foot		extends Mix('React', 'Static') {
				constructor(props) {
					super(props); this.name = 'FOOT';
				}

				render() {
					let props = this.props, crdts = props.credits,
						bgImg = { backgroundImage: `url('public/images/Logo.footer.png')` };
					return (
						<footer className="gridItemFooter" role="contentinfo">
							<section className="gridFooter noSelect gpu" style={bgImg}>
								{/* <!-- CONTACT --> */}
								<section id="contact" className="gridItemContact gridContact">
									<a href="about">About</a>
									<a href="help">Help</a>
									<a href="safety">Safety</a>
									<a href="privacy">Privacy</a>
									<a href="terms">Terms</a>
								</section>
								{/* <!-- CREDITS --> */}
								<section id="credits" className='gridItemCredits'>
									<p>
										<span id='copyright'>{new Date().getFullYear()}</span>
										<span id='company'>
											<a key='company' href={`http://${crdts.website}`}>
												{crdts.company}
											</a>
										</span>
									</p>
								</section>
							</section>
						</footer>
					);
				}
			};

		// THREADS /////////////////////////////////////////////////////////

			/**
			 * The Chat-Thread Component.
			 * @extends {React.PureComponent}
			 */
			EV.Threads 			= class Threads		extends Mix('Reflux','General') {
				/**
				 * Instaniates a new `Thread` component.
				 * @param {ThreadProps} props Props used in creating `Thread` components.
				 */
				constructor(props) {
					super(props); let THS = this; THS.name = 'THREADS';
					// --------------------------------------------------- //
						/** 
						 * @type {ThreadProps}
						 */
						this.props;
						this.style   = FromJS({opts:['lite','small','dark']});
						this.id      = {
							all:'threads', add:'newchat',
							sgl:'thread',  one:'first_msg',
							msg:'message'
						};
						this.forRefs = {
							input: React.createRef(),
							rdkey: React.createRef(),
						};
					// --------------------------------------------------- //
						let WK = THS.keysWith.bind(THS),
							AD = THS.addChat.bind(THS);
					// --------------------------------------------------- //
						THS.mapState({
							[THS.id.all]: {
								default: [],
								/**
								 * @param {ChatProps[]} chats 
								 */
								state(chats) {
									return { chats: chats||[] }
								}
							},
							[THS.id.add]: {
								default: {},
								/**
								 * @param {ChatProps[]} chats
								 */
								state(chats) {
									/**
									 * @type {ChatProps}
									 */
									let chat = chats[0];
									chat.open = true;
									return { chats: AD(chat) };
								}
							},
							[THS.id.sgl]: {
								default: {},
								/**
								 * @param {ChatProps} chat 
								 */
								state({ users = {}, messages = [] } = chat) {
									return { chats: WK(users, C => {
										C.messages = messages;
									},	"object") };
								}
							},
							[THS.id.one]: {
								isAlert: true,
								/**
								 * @param {Object} items 
								 * @param {{key:string}} items.payload 
								 */
								state({ payload = {} } = items) {
									if (!!payload.key) {
										Actions.Data.send('/threads', {
											method: 'GET',
											headers: { token: COMPS.Token },
											params: { uids: payload.key },
											query: { id: 'newchat' },
										}, 	true);
									};	return {};
								}
							},
							[THS.id.msg]: {
								isAlert: true,
								/**
								 * @param {Object} items 
								 * @param {ChatMessage} items.payload 
								 */
								state({ id, payload = {} } = items) {
									let msg = FromJS(payload).toJS();
									// Mutate the State
									return { chats: WK(msg.uids, C => {
										delete msg.uids; msg.latest = 1;
										C.messages.last.latest = 0;
										console.info('NEW MSG:', Assign({},msg));
										C.messages.push(msg);
									},	"array") };
								}
							},
						}	);
				}

				// CYCLE     /////////////////////////////////////////////////////////

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { stamp, status, chats, loaded } = ( 
								props.stamp>state.stamp?props:state
							);  return { 
								stamp, status, chats, loaded
							};
						};	return null;
					}

					componentDidMount() {
						if (!!document) {
							let url  = '/threads', 
								id   = this.id.all,
								send = Actions.Data.send; 
							setTimeout(() => send(url, {
								method:	 'GET', 
								headers: { token: COMPS.Token },
								query:   { id },
							}	),	0);	
						}
					}

					componentDidUpdate(prevProps, prevState) {
						// console.debug('THREAD UPDATE:', {
							// prevProps, nextProps: this.props,
							// prevState, nextState: this.state,
						// })
					}

				// GETTERS   /////////////////////////////////////////////////////////

					/**
					 * Whether or not there's an open chat.
					 * @type {boolean}
					 */
					get isOpen() { 
						return !!this.current;
					}
					/**
					 * Retrieves the current open chat.
					 * @type {BubbleProps}
					 */
					get current() {
						return this.state.chats.filter((c)=>(c.open))[0];
					}
					/**
					 * @type {string[]}
					 */
					get users() {
						return this.state.chats.reduce(
							(p,c)=>(p.concat(Object.keys(c.users))
						),	[])
					}
					/**
					 * @type {HTMLInputElement}
					 */
					get rdkey() {
						return this.forRefs.rdkey.current;
					}
					/**
					 * @type {HTMLTextAreaElement}
					 */
					get input() {
						return this.forRefs.input.current;
					}

				// FUNCTION  /////////////////////////////////////////////////////////

					/**
					 * Retrieves a sorted list of memberIDs.
					 * @param {BubbleObjs|string[]} users The thread memebers or a list of memberIDs.
					 * @param {'object'|'array'} [which] A flag denoting the `user` param type.
					 * @param {boolean} [immutable] If `true`, return an immutable list.
					 * @returns {string[]|import('immutable').List<string>}
					 */
					keys(users, which = 'object', immutable = false) {
						let UUID = COMPS.UID, 
							FILT = (u) => (u!=UUID),
							IDs  = ({
								/**
								 * @param {string[]} usr 
								 */
								array (usr) { 
									return usr.filter(FILT).map(u=>u.toString()); 
								},
								/**
								 * @param {BubbleObjs} usr 
								 */
								object(usr) { 
									return Object.keys(usr).filter(FILT); 
								},
							})[which](users).sort();
						return immutable ? Imm.List(IDs) : IDs;
					}
					/**
					 * ...
					 * @param {*} one 
					 * @param {*} two 
					 */
					keysCheck(one, two) {
						return Imm.is(
							this.keys(one.k, one.w, true),
							this.keys(two.k, two.w, true)
						);
					}
					/**
					 * Executes the specified callback on a `ChatProps` upon finding the matching memberIDs.
					 * @param {BubbleObjs|string[]} users The thread memebers or a list of memberIDs.
					 * @param {(chat:ChatProps,uids:string[])=>ChatProps} callback A callback to execute upon match. It will recieve the `ChatProps`, as well as the memberIDs.
					 * @param {'object'|'array'} [which] A flag denoting the `user` param type.
					 * @returns {ChatProps[]} The current (and possibly mutated) `ChatProps` list.
					 */
					keysWith(users, callback, which = 'object') {
						let THS  = this;
						/** 
						 * @type {ChatProps[]}
						 */
						let Chts = FromJS(THS.state.chats).toJS(),
							 IDs = THS.keys(users, which, false),
							iIDs = Imm.List(IDs);
						return Chts.map(C => {
							/** 
							 * @type {import('immutable').List<string>}
							 */
							let kys = THS.keys(C.users, "object", true);
							if (Imm.is(kys,iIDs)) callback(C, IDs);	
							return C;
						});
					}

					/**
					 * ...
					 * @param {ChatProps} chat ...
					 * @returns {ChatProps[]}
					 */
					addChat(chat) {
						/**
						 * @type {ChatProps[]}
						 */
						let chats = this.state.chats;
						let users = {k:chat.users};
						/**
						 * @param {ChatProps} C 
						 * @returns {boolean}
						 */
						let filtr = (C)=>(this.keysCheck({k:C.users},users));
						let check = chats.filter(filtr);
						// ----
						chats.map(C=>C.open=false);
						if (!!!check.length) {
							chats = [chat, ...chats];
						} else { 
							let idx = chats.indexOf(check[0]);
							chats[idx] = chat;
						};	return chats;
					}

					/**
					 * Creates a click-handler for the `Bubbles` within this component.
					 * @param {number} idx The index of the `Bubble` within the chat list.
					 * @returns {ReactHndlKey}
					 */
					toggleFactory(idx) {
						let THS = this, opn = 'open', filt = (o=>o!=opn);
						return function onClick(_e) {
							/** 
							 * @type {ThreadProps}
							 */
							let props = Assign({},THS.state);
							let chats = props.chats,
								curnt = chats[idx],
								open  = curnt.open,
								input = THS.input.value;
							if (open) {
								curnt.input = input; // Save any text-input
								curnt.open = false; // Unset Open
							} else {
								// Clear All Opens
								chats = chats.map(c => {
									// Save any text-input
									c.open && (c.input = input);
									c.open=false; return c;
								});
								curnt.open =  true; // Set to Open
							}; 	chats[idx] = curnt;
							// Update state & render
							THS.setState({ chats });
							THS.forceUpdate();
						};
					}
					/**
					 * Creates an input-handler for the current chat-window.
					 * @param {number} idx The index of the `Bubble` within the chat list.
					 * @returns {ReactHndlKey}
					 */
					inputFactory(idx) {
						let THS = this, id = THS.id.sgl;
						return function onKeyPress(e) {
							/** 
							 * @type {ThreadProps} 
							 */
							let props = Assign({},THS.state),
								shift = e.shiftKey,
								ctrl  = e.ctrlKey,
								alt   = e.altKey;
							switch (e.key) {
								case 'Enter': 
									// Send new message
									if (!shift) {
										// Prevent key action
										e.preventDefault();
										// Variables
										let chats = props.chats,
											curnt = chats[idx],
											text  = THS.input.value,
											uids  = THS.rdkey.value,
											last;
										// Push new message
										if (!!text) {
											text = text.trim();
											Actions.Data.send(
												'/threads', {
													method: "PUT",
													headers: { token: COMPS.Token },
													params: { uids, kind: 'send' },
													body: { id, msg: text }
											});
											last = curnt.messages.last
											if (!!last) last.latest = 0;
											curnt.messages.push({ 
												time: new Date(), 
												who:  COMPS.UID, 
												text: text.trim(),
												latest: 1,
											}); chats[idx] = curnt;
											// Update state & render
											THS.setState({ chats });
											THS.forceUpdate();
										};	return;
									};
							};
						};
					}

					/**
					 * Adds a Date marker to the list as message timestamps change days.
					 * @param {ChatMessage[]} list The message list.
					 * @param {ChatMessage} next The next message.
					 * @param {ChatMessage} prev The previous message.
					 * @void
					 */
					getDate(list, next, prev) {
						let stamp = new Date(next.time), date = '';
						if (!!!prev) date = stamp; else {
							let prv = new Date(prev.time);
							if (stamp>prv&&stamp.getDay()!=prv.getDay()) {
								date = stamp;
						};	};
						if (!!date) list.push(Number(date));
					}
					/**
					 * Retrieves the `BubbleProps` from `ChatProps`.
					 * @param {ChatProps} props The Chat props.
					 * @returns {BubbleProps}
					 */
					getBubbleProps({ open = false, users = {}, messages = [] } = props) {
						let style = this.style,
							keys  = Object.keys(users),
							heads = keys.length,
							multi = heads > 1,
							count = messages.length;
						/**
						 * @type {ChatProps}
						 */
						let last;
						if (multi && !!count) {
							for (let i=messages.length-1; i>-1; i--) {
								if (messages[i].who!=COMPS.UID) {
									last = users[messages[i].who];
									break;;
							};	};
						};
						if (!!!last) {
							let { floor, random } = Math, len = keys.length;
							last = users[keys[floor(random()*len)]];
						};
						return style.mergeDeep(
							FromJS(last), FromJS({ 
								multi: multi?heads:false, 
								opts: [{ open }],
								alerts: messages.reduce((P,C)=>(
									P+(C.unseen||[]).has(COMPS.UID)
								),	0)
						})	).toJS();
					}
					/**
					 * Formats the current `ChatProps`.
					 * @param {ChatProps} props The Chat props.
					 * @returns {ChatProps}
					 */
					getChatProps(props) {
						props = FromJS(props).toJS();
						let THS = this, messages = props.messages;
						if (!!messages) {
							props.messages = messages.reduce(
								(p,m)=>(THS.getDate(p,m,p.last),p.push(m),p)
							,	[]);
						}; 	return props;
					}

					/**
					 * Grabs the number of unseen messages for the User.
					 * @param {ChatProps} chat 
					 */
					getUnseen(chat) {
						let stat  = ![undefined,null].has(chat.idx),
							empty = !!!chat.messages;
						if (!stat||empty) return 0;
						return chat.messages.filter(
							M=>(M.unseen||[]).has(COMPS.UID)
						).length;
					}
					/**
					 * Refreshes the "new" status of unseen messages.
					 * @param {ChatProps} chat The chat properties.
					 * @void
					 */
					setUnseen(chat) {
						let THS = this;
						if (!!THS.getUnseen(chat)) {
							let uids = [
									COMPS.UID,
									Object.keys(chat.users),
								].join(';');
							setTimeout(()=>Actions.Data.send('/threads', {
								method: "PUT",
								headers: { token: COMPS.Token },
								params: { uids, kind: 'seen' },
								body: { id: 'thread', single: true },
							}, true), 100);
						};
						/* let THS   = this,
							stat  = ![undefined,null].has(chat.idx),
							empty = !!!chat.messages; */
						/**
						 * @type {ChatProps[]}
						 */
						// let chats = THS.state.chats;
						// ------------------------------------------------- //
							/* if (!!stat&&!empty&&!!chat.messages.last.latest) {
								setTimeout(() => {
									THS.setState({
										chats: chats.map((C,I)=>(
											(I==chat.idx)&&(
												C.messages.last.latest=0,
												C.alerts
											),	C
										)),
									});
								}, 2000);
							}; */
					}
				
				// MAIN      /////////////////////////////////////////////////////////

					render() {
						var THS   = this,
							optns = THS.style,
							dopts = optns.toJS(),
							props = THS.state,
							max   = props.max||10,
							chats = FromJS(props.chats||[])
										.toJS()
										.map((c,i)=>(c.idx=i,c))
										.slice(0,max),
							chat  = (chats.filter((c,i)=>(c.open))[0]||{});
						// ---------------------------------------------------------- //
							THS.setUnseen(chat);
						// ---------------------------------------------------------- //
							return ( NMESPC.page.type!='jumbo' && COMPS.IsAuthd ?
								<section className="noSelect gridItemChat gridThreads" id="threads">
									<Threads.Chat {...THS.getChatProps(chat)} forRef={THS.forRefs} onKeyPress={THS.inputFactory(chat.idx)} />
									<div className="gridItemThreads" id="chatter">
										<Bubble name={{First:'More',Last:'Chats'}} {...dopts} {...{kind:'more'}} />
										{chats.reverse().map((b,i)=>(
											<Bubble key={`chat${i}`} kind="user" onClick={THS.toggleFactory(b.idx)} {...THS.getBubbleProps(b)} />
										))}
										<Bubble name={{First:'New',Last:'Chat'}} {...dopts} {...{kind: 'add'}} />
									</div>
								</section> : null
							);
					}
			};
			EV.Threads.defaultProps = {
				max:    10,
				chats:  [],
			};

			EV.Threads.Chat 	= /**
			 * Creates a Chat-window.
			 * @param {ChatProps} props The Chat-window props
			 */
			function({ open = false, users = {}, messages = [], forRef = {}, input = null, onKeyPress = null } = props) {
				let sh   = 'short', nm = 'numeric',
					dpts = 	((o)=>(o={
								weekday:sh,month:sh,day:nm
							},{
								norm:o,year:Assign({year:nm},o)
							}))();
				// ----------------------------------------------------------------------- //
					/**
					 * Formats the name(s) of the current chat user(s).
					 * @param {BubbleObjs} users The plain-object of the user's name.
					 * @param {string[]} keys A list of `user_ids` associated with the users in this chat.
					 * @returns {string}
					 */
					function getName(users, keys) { 
						let name = '', dflt = {First:'???',Last:''},
							len  = keys.length;
						if (len >= 2) {
								/**
								 * @type {import('immutable').Map<number,BubbleProps>}
								 */
								let N = Imm.Map(users);
								name = N.filter(u=>!!u)
										.map(u=>({ 
											First: u.name.First,
											Last:  u.name.Last.replace(/^(\w).+$/, '.$1'),
										}))
										.map(n=>joinV(n||dflt,' '))
										.toArray()
										.filter(u=>!!u)
										.join(', ');
						};
						if (!!!name) {
							name = joinV((users[keys[0]]||{}).name||dflt, ' ');
						};	
						return name; 
					}
					/**
					 * ...
					 * @param {Object} props 
					 * @param {ChatProps[]} props.messages 
					 */
					function Messages({ items } = props) {
						let count = items.length;
						return (
							<div key="msg" className="threadMsg">
								{!!count ? items.map((m,i) => (
									isNaN(m) ?
									<Message key={`msg${i}`} {...m} /> :
									<Day key={`msg${i}`} stamp={m} />
								),	[]) : <span key="msg0"> </span> }
							</div>
						);
					}
					/**
					 * Renders a Chat message.
					 * @param {ChatMessage} props The Chat props
					 */
					function Message({ who, text, time, url, latest = false } = props) {
						let me  = who==COMPS.UID, oth = multi && !me,
							wch = { true: 'you', false: 'them' };
						return (
							<div className={classN("threadBubble",wch[me],{'new':open&&latest})}>
								<span key="text" className="ctn">{text.replace(/\\/g,'')}</span>
									{ oth ? /* Display Name if multi-chat. */
								<a key="name" className="nme trunc" href={url}>
									{joinV(users[who].name,' ')}
								</a> 
									: null}
							</div>
						)
					}
					/**
					 * Renders a Date marker as message timestamps change days.
					 * @param {Object} props The props.
					 * @param {Date} props.stamp A timestamp.
					 */
					function Day({ stamp } = props) {
						let cur  =  new Date(),
							date =  new Date(stamp),
							wich =  {true:'year',false:'norm'},
							year =  date.getFullYear()!=cur.getFullYear(),
							text = 	date.toLocaleString(undefined,dpts[wich[year]]);
						return (<div className="threadDate"><span>{text}</span></div>);
					}
					function Box({ value, forRef, onKeyPress } = props) {
						return (<Frag>
							<input key="key" type="hidden" ref={forRef.rdkey} name="key" value={rdkey}/>
							<Form.Area key="box" {...{
								id: `chat-input`, rows: 3, autoFocus: true, 
								forRef: forRef.input, onKeyPress, value,
								placeholder:'Type your message here...',
								help: { text: [<p key="text">
									Press <span className="mono key">ENTER</span> to send your message.<br/>
									Press <span className="mono key">SHIFT</span><span className="mono">+</span><span className="mono key">ENTER</span> to add a <b>new-line</b>.<br/>
									To <b>open</b>/<b>hide</b> the Chat Window, <span className="mono bold">click</span> on the <b>user's image</b>.
								</p>]}, 
							}	}/>
						</Frag>);
					}
				// ----------------------------------------------------------------------- //
				let ukeys = Object.keys(users||{}),
					rdkey = [COMPS.UID,...ukeys].join(';'),
					multi = ukeys.length > 1;
				// ----------------------------------------------------------------------- //
					return (
						<div className="gridItemChatBox">
							<div className={classN("threadCont",{open:open})}>
								<h6 key="name" className="threadName trunc">{
									getName(open?users:[],ukeys)
								}</h6>
								<Messages items={messages.slice(0).reverse()}/>
								<div className="threadInput">
									<Box value={input} forRef={forRef} onKeyPress={onKeyPress} />
								</div>
							</div>
						</div>
					)
			}

		// EXPORTS /////////////////////////////////////////////////////////
			
			const { 
				App, Head, Search, Cover, Title, Plaque, 
				Content, Service, Services, PoS, Form, 
				Trusts, Foot, Threads 
			} = EV;

};
