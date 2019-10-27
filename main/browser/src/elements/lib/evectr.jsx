'use strict';

module.exports = function Comps(COMPS) {

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

		const 	stripeOpts  = () => {
			return { style: {
				base: {
					fontSize: '16px',
					color: '#424770',
					letterSpacing: '0.025em',
					'::placeholder': {
						color: '#aab7c4',
					},
				},
				invalid: {
					color: '#c23d4b',
			},	},	};
		};
		const 	EV 			= {};

		// Configs
		const	RLogin 		= '/auth/login';
		const	RLogout 	= '/auth/logout';

		function getBasic 	(user, pass) {
			COMPS.Basic = 'Basic '+btoa(user.value+':'+pass.value);
			return COMPS.Basic;
		}

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
				return !!value?{defaultValue:value}:{};
			},
			getValue(value) {
				return !!value?{value:value}:{};
			}
		};

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		// IMPORTS /////////////////////////////////////////////////////////

			const {
				Tags, Bubble, NormalLink, SocketLink, 
				PhoneNum, PhoneExt, Address, 
			} = COMPS.Elements.Stock;

		// APP     /////////////////////////////////////////////////////////
			EV.App 				= class App 		extends Mix('Reflux',MX.General) {
				constructor(props) {
					super(props); this.name  = 'APP'; 
					this.state = { stripe: null };
					this.mode  = NMESPC.page.type||'';
					this.store = COMPS.Stores.App(props.LID); 
				}

				componentDidMount() {
					// Create Stripe instance in componentDidMount
					// (componentDidMount only fires in browser/DOM environment)
					let pubKey = 'pk_test_O3cwbaxfELRW69hj3mpwJpOB';
					this.setState({ stripe: window.Stripe(pubKey) });
				}

				getHeader(mode, title, searches = []) {
					let elems = [];
					switch (mode) { case 'cover': case 'stock': 
						elems = elems.concat([
							<Search key="sch" tokens={searches||[]}/>
						]);
					};
					switch (mode) {
						case 'cover': 
							elems = elems.concat([
								<Frag key="plq">
									<Cover img={title.cover} />
									<Plaque {...title.user} />
								</Frag>]); break;;
						case 'stock': 
							elems = elems.concat(
								<Frag key="ttl">
									<Title {...{
										kind: 		'page', 
										size: 		'large', 
										mode: 		'shadow-only', 
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

				getThreads(mode, props) {
					if (mode=='jumbo') return null;
					else return (<Threads {...props} />);
				}

				render() {
					var props 	= this.state,
						mode 	= this.mode,
						header 	= props.header,
						search  = header.searches,
						title 	= header.title,
						user 	= header.user,
						scopes  = user.Scopes,
						content = props.content,
						footer 	= props.footer,
						classes = classN({
							'gridMain':		true,
							'loggedIn': 	header.identified,
							'loggedOut': 	!header.identified,
							'pause': 		props.paused,
							'ready': 		props.ready(),
						},	mode);
					COMPS.Token 	= user.Token; 
					COMPS.IsAuthd 	= header.identified;
					COMPS.UID 		= scopes.user_id; 
					return (
						<StripeProvider stripe={props.stripe}>
							<main id="content" className={classes}>
								{this.getHeader(mode,title,search)}
								<Foot {...footer} />
								<Content {...content} />
								<Head home={footer.credits.website} 
									user={user.Profile.Name} 
									alerts={header.alerts}
									messages={header.messages} 
									admin={header.admin}
									title={title} />
								{this.getThreads(mode,footer)}
							</main>
						</StripeProvider>
					);
				}
			};

			EV.App.Signup 		= class Signup 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); let _refs = {
						'form'    : React.createRef(),
						'username': React.createRef(),
						'password': React.createRef(),
						'confirm' : React.createRef(),
						'agree'   : React.createRef(),
					};
					this.name  		  = 'SIGNUP';
					this.handleSignup = this.handleSignup.bind(this);
					this._refs 		  = _refs;
					this.REFS 		  = {
						get     form() { return _refs.form.current; 	},
						get username() { return _refs.username.current; },
						get password() { return _refs.password.current; },
						get  confirm() { return _refs.confirm.current; 	},
						get    agree() { return _refs.agree.current; 	},
					};
				}

				handleSignup(e) {
					e.stopPropagation(); e.preventDefault();
					var REF = this.REFS, usr = REF.username, pss = REF.password,
						enc = `'Basic ${btoa(`${usr.value}:${pss.value}`)}`,
						req = { headers: { authorization: enc } };
					Actions.Data.auth(RLogin, req, false);
					REF.form.submit(); usr.value=''; pss.value='';
				}

				getAutoCompFix(name, source) {
					return (<iframe key={name} {...{
						src: source, id: name, name: name, 
						style: {display:'none'}
					}}/>);
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
						autoc 	= 'auto-signin',
						source 	= '/public/html/auto.htm',
						terms 	= props.terms||[],
						attrs 	= {
							'id':			 name,
							'name':			'signup',
							'action':		 source,
							'data-action': 	'/signup',
							'method':		'post',
							'encType':		'multipart/form-data',
							'target':		 autoc,
							'className':	 classN(styles),
							'onSubmit': 	 THS.handleSignup,
						};
					return ([
						this.getAutoCompFix(autoc, source),
						<form key='signupfrm' ref={REFS.form} {...attrs}>
							<Form.Xput 	   {...{id:			'signup-email',
												kind:		'email',
												icon:		'envelope',
												styles:		 align,
												placeholder:'you@email-domain.com',
												complete:	'username email',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.username} />
							<Form.Xput     {...{id:			'signup-password',
												kind:		'password',
												icon:		'key',
												styles:		 align,
												placeholder:'Password',
												complete:	'new-passowrd',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.password} />
							<Form.Xput     {...{id:			'signup-confirm',
												kind:		'password',
												icon:		'unlock-alt',
												styles:		 align,
												placeholder:'Confirm Password',
												complete:	'new-passowrd',
												required:	 true,
												priority:	'*',
											}} forRef={REFS.confirm} />
							<Form.Checkbox {...{id: 		'signup-agree',
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
							<div className={align}>
								<Form.Button kind="submit" label="Sign Up!"
										styles={['good']} large block
										action={THS.handleSignup}/>
							</div>
						</form>
					]);
				}

			}

			EV.App.Login 		= class Login 		extends Mix('Pure',  MX.Static) {
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
						get     form() { return _refs.form.current; },
						get username() { return _refs.username.current; },
						get password() { return _refs.password.current; },
						get remember() { return _refs.remember.current; },
					};
				}

				handleLogin(e) {
					e.stopPropagation(); //e.preventDefault();
					var REF = this.REFS, usr = REF.username, pss = REF.password,
						enc = `'Basic ${btoa(`${usr.value}:${pss.value}`)}`,
						req = { 
							method: 'POST',
							headers: { authorization: enc },
							body: { id: this.id }
						};
					Actions.Data.auth(RLogin, req, false);
					REF.form.submit(); usr.value=''; pss.value='';
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
							<div className={align}>
								<Form.Button kind="submit" label="Login!"
										styles={['info']} large block
										action={THS.handleSignup}/>
							</div>
						</form>
					]);
				}

			}

			EV.App.Logout 		= class Logout	 	extends Mix('Pure',  MX.Static) {
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

			EV.App.Portal 		= class Portal	 	extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'PORTAL';
					// --------------------------------------------------
						this.Root = document.getElementById('modal-root');
						this.Elem = document.createElement('div');
				}

				componentDidMount	() { this.Root.appendChild(this.Elem); }

				componentWillUnmount() { this.Root.removeChild(this.Elem); }

				render() {
					let THS 	= this,
						elem 	= THS.Elem, 
						props 	= THS.state,
						kids 	= props.children;
					return RDOM.createPortal(kids, elem);
				}
			};

		// HEAD    /////////////////////////////////////////////////////////
			EV.Head 			= class Head 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'HEAD';
					this.mode  = NMESPC.page.type||'';
				}

				render() {
					let props = this.props, 
						mode  = this.mode,
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
									{ COMPS.IsAuthd ? <div className="gridDrop">
										<label role="menuitem">
											<a id="gotoSearch" className={FA('search')} href="#app-root"></a>
										</label>
									</div> : null }
									<Head.Drop {...msgs} />
									<Head.Drop {...alert} />
									<Head.Drop {...admin} />
									<input type="radio" className="ctrl" name="navDrops" id="navNone" tabIndex="1" defaultChecked/>
								</nav> : null}
						</header>
					);
				}
			};
			EV.Head.defaultProps = {
				title: 		'',
				home: 		'',
				messages:	[],
				alerts:		[],
				admin:		[],
			};

			EV.Head.Drop 		= class Drop		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'DROP';
				}

				render() {
					let props = this.props, 
						group = props.group, 
						id 	  = props.id, 
						lid   = `${id}-lbl`, 
						mid   = `${id}-mnu`, 
						tab   = props.tab, 
						icon  = props.icon,
						label = props.label,
						igroup= props.igroup,
						items = props.items,
						all   = (!!props.all?{
									id:   `${igroup}-${items.length}`,
									href: props.all,
								}:null),
						DItem = Head.Drop[props.kind];
					return (
						<div className="gridDrop">
							<input type="radio" className="reveal" name={group} id={id} aria-hidden="true" role="presentation"/>
							<label id={lid} className="reveal" htmlFor={id} tabIndex={tab} role="menuitem" aria-haspopup="true" aria-controls={mid}>
								<i className={FA(icon)} role="none"></i>
								{!!label?(<span className="hidden-xs hidden-sm" role="none">{label}</span>):null}
							</label>
							<div id={mid} className="drop reveal" role="presentation">
								<div className="menu" aria-labelledby={lid} role="menu">
									{items.map((v,i) => {
										let id = `${igroup}-${i}`;
										return (<DItem key={id} id={id} group={igroup} tab={tab} {...v}/>);
									}).concat(!!all?[
										<Head.Drop.ALL key={all.id} id={all.id} group={igroup} tab={tab} />
									]:[])}
								</div>
							</div>
						</div>
					);
				}
			};
			EV.Head.Drop.defaultProps = {
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	null, 
				label:	'',
				igroup:	'',
				items:	[],
				all:	'',
			};

			EV.Head.Drop.MItem 	= class MItem		extends Mix('Pure',  MX.Static) {
				constructor(props) { super(props); this.name = 'MItem'; }

				getMenuItem(MenuItem, BtnElem, hasOpt = true) {
					let { group, id, tab, href } = this.props,
						BProps  = BtnElem.props||{},
						BTag    = Tag(BtnElem.tag);
					
							// console.log(`${this.name}.getMenuItem()`, {
								// props: 		this.props,
								// MenuItem: 	MenuItem,
								// BtnElem: 	BtnElem,
								// hasOpt: 	hasOpt,
							// })
					
					return (<Frag>
						{ !!hasOpt ? <input type="radio" className="ctrl" name={group} id={id} aria-hidden="true" role="presentation"/> 
						: null }<BTag {...BProps} href={href} tabIndex={tab} role="menuitem">{MenuItem}</BTag>
					</Frag>);
				}
			};
			
			EV.Head.Drop.MSG 	= class MSG			extends EV.Head.Drop.MItem {
				constructor(props) { super(props); this.name = 'MSG'; }

				render() {
					let props 	= this.props, 
						label 	= props.label,
						time 	= props.time,
						detail 	= props.detail;
					return this.getMenuItem((
						<div className="message prev">
							<header>
								<strong>{label}</strong>
								<span className="pull-right muted">
									<em>{time}</em>
								</span>
							</header>
							<div>{detail}</div>
						</div>
					), { tag: 'a' });
				}
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

			EV.Head.Drop.ALRT 	= class ALRT		extends EV.Head.Drop.MItem {
				constructor(props) { super(props); this.name = 'ALRT'; }

				render() {
					let props 	= this.props, 
						label 	= props.label,
						time 	= props.time,
						icon 	= props.icon;
					return this.getMenuItem((
						<div className="notification">
							<i className={FA(icon)}></i>{` ${label.trim()}`}
							<span className="pull-right muted small">{time}</span>
						</div>
					), { tag: 'a' });
				}
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

			EV.Head.Drop.BTN 	= class BTN			extends EV.Head.Drop.MItem {
				constructor(props) { 
					super(props); this.name = 'BTN'; 
					this.Kinds = { a: 'a',  button: 'button', submit: 'submit' };
					this.Elems = { a: 'a',  button: 'button', submit: 'button' };
					this.Types = { a: null, button: 'button', submit: 'submit' };
				}

				render() {
					let props 	= this.props, 
						kind	= this.Kinds[props.kind||'a'],
						id 		= props.id,
						label 	= props.label,
						icon 	= props.icon, 
						Wrap 	= props.wrap,
						hasWrap = !!Wrap,
						iattrs  = { 
							tag: 	this.Elems[kind], 
							props: 	{ type: this.Types[kind] }	
						},
						attrs  = (hasWrap ? Wrap : iattrs), 
						item 	= (
							<label htmlFor={id}>
								<i className={FA(icon)}></i>{` ${label.trim()}`}
							</label>
						);
					return this.getMenuItem((
						hasWrap ? this.getMenuItem(item, iattrs, false) : item
					), 	attrs);
				}
			};
			EV.Head.Drop.BTN.defaultProps = {
				group:	null, 
				id:		null, 
				tab:	'0', 
				icon:	null, 
				label:	'',
				href:	'#',
			};

			EV.Head.Drop.ALL 	= class ALL			extends EV.Head.Drop.MItem {
				constructor(props) { super(props); this.name = 'ALL'; }

				render() {
					let props 	= this.props,
						label 	= props.label,
						icon 	= props.icon;
					return this.getMenuItem((
						<div className="msg all"><strong>{label}</strong> <i className={FA(icon)}></i></div>
					), { tag: 'a' });
				}
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
			EV.Search 			= class Search 		extends Mix('React', MX.Dynamic) {
				constructor(props) {
					super(props); this.name = 'SEARCH';
				}

				render() {
					let THS 	=   this,
						props	=   THS.props,
						id		=  "search",
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
								<span>GO</span>{ !isSrch ? <Frag> <a>Defined Search</a></Frag> : null }
							</button>
						</form> : <div className={classN(...classes)} role="presentation"></div>
					);
				}
			}

		// COVER   /////////////////////////////////////////////////////////
			EV.Cover 			= class Cover 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'COVER';
				}

				render() {
					let props 	= this.props,
						img 	= props.img||'',
						style 	= (!!img ? { 
							backgroundImage: `url('${img}')` 
						} : null);
					return (
						<header className="gridItemCover" role="complementary">
							<div className="gpu" style={style} role="img"></div>
						</header>
					);
				}
			}
			EV.Cover.defaultProps = {
				image: ''
			}

		// TITLE   /////////////////////////////////////////////////////////

			EV.Title 			= class Title 		extends Mix('Pure',  MX.Static) {
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
						v.kind = v.kind.split('').reverse().join(''),v)
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
			
			EV.Plaque 			= class Plaque 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'PLAQUE';
				}

				render() {
					let props 	= this.props,
						mode	= props.mode||'show',
						pic		= props.photo,
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
							{/* <!-- PROFILE PHOTO --> */}
								<header className="gridItemPic d" role="complementary">
									<Bubble kind="user" name={fname} img={pic} opts={['small','er','lite']} />
								</header>
								<header className="gridItemPic" role="complementary">
									<Bubble kind="user" name={fname} img={pic} opts={['huge','cutout']} id="profile_picture"/>
								</header>
							{/* <!-- PROFILE INFO  --> */}
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
							{/* <!-- PROFILE JOIN  --> */}
								{mode=='show' ? (
								<header className="gridItemJoin" role="complementary">
									<div className="cutout">
										<button className="tkn good large block" type="submit">
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
			EV.Content 			= class Content 	extends Mix('Pure',  MX.Static) {
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
					}; }
				}

				render() {
					let { SideBar, Copy, Other  } = Content;
					let props = this.props, 
						sgmnt = this.getSegments(props.segments),
								{ copy, other } = sgmnt,
						sideb = this.getSideBar(sgmnt),
						jumbo = NMESPC.page.type=='jumbo';
					return (
						<section className="gridItemContent gridContent" role="main">
							{!jumbo?<SideBar {...sideb} />:null}
									<Copy    {...copy } />
							{!jumbo?<Other   {...other} />:null}
						</section>
					);
				}
			};

			EV.Content.SideBar 	= class SideBar 	extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'SIDEBAR';
				}

				render() {
					let props = this.props, name = props.name, bttns = props.items;
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

			EV.Content.Copy 	= class Copy 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'COPY';
				}

				render() {
					let props 	= this.props, 
						name 	= props.name, 
						panels 	= props.items,
						form 	= props.form||{},
						Elem 	= !!props.form?Form:'section';
					return (
						<Elem id={name} className="gridItemCopy PLR" {...form}>
							{panels.map((v,i) => Agnostic(v, i))}
						</Elem>
					);
				}
			};

			EV.Content.Other 	= class Other	 	extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'OTHER';
				}

				render() {
					let props = this.props, name = props.name, panels = props.items;
					return (
						<aside id={name} className="gridItemOther" aria-hidden="true">
							{panels.map((v,i) => Agnostic(v, i))}
						</aside>
					);
				}
			};

			EV.Content.Panel 	= class Panel 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'PANEL';
				}

				render() {
					let props = this.props,   name  = props.name, 
						head  = props.header, body  = props.body,
						accrd = !!props.accordian?'accordian':null,
						kind  = classN("panel",props.kind||''), 
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

			EV.Content.Slab 	= class Slab 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'SLAB';
					this.kind = {true:'radio',false:'checkbox'};
					this.clss = {true:'swap',false:''};
					this.icon = {'data-open':'','data-close':''};
				}

				render() {
					let { title, id, group, children, swap } = this.props,
						hclass = "heading reveal tkn info block close";
					return (
						<div key={id} className={classN("panel","slab","block",this.clss[!!swap])}>
							<input type={this.kind[!!swap]} id={id} name={group||id} className="reveal open"/>
								{ !!swap ?
							<input type="radio" id={`${id}-cls`} name={group||id} className="reveal close"/>
								: null }
							<label className={hclass} htmlFor={id}>
								<h6>{title}</h6>
							</label>
								{ !!swap ? (
							<label htmlFor={`${id}-cls`} className={hclass}><h6 {...this.icon}></h6></label>
								) : null }
							<div className="body gridSlice gap reveal" aria-hidden="true">
								{children}
							</div>
						</div>
					);
				}
			};

			EV.Content.Trader 	= class Trader 		extends Mix('Pure',  MX.Static) {
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
						styles 	=  this.styles.concat(props.style||['norm']),
						lattr 	=  { 'htmlFor': id, 'className': classN(styles) },
						kids  	=  KIDS.toArray(props.children),
						label 	=  props.label||{};
					return (<Frag>
						<input type="checkbox" id={id} name={id} className="reveal trade"/>
						{kids[0]}
						<div className="label spread">
							<label {...lattr}><span {...label}></span></label>
						</div>
						{kids[1]}
					</Frag>);
				}
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

				let main   	= `tab-${props.id}`,
					start 	=  props.start||'one',
					size 	=  props.size||'spread',
					tabs 	=  props.tabs||[];

				return (
					<div className={classN('tabs','flex','flexDirColR',start,size)}>
						<div className="tabBody">
							{tabs.map((t,i,l,k,id)=>(
								k = `${main}-${i}`, id = `${main}-${t.name}`,
								<div key={k}>
									<input type="radio" id={id} name={main} className="reveal open" defaultChecked={i==0}/>
									<div className="reveal gridSlice">{Agnolist(t.body||[])}</div>
								</div>))}
						</div>
						<nav className="gridTabs buttons" role="tabgroup">
							{tabs.map((t,i)=>(
								<label key={`tab-btn-${i}`} htmlFor={`${main}-${t.name}`}>{getLabel(t)}{getIcon(t)}</label>
							))}
						</nav>
					</div>
				);
			};

			EV.Content.Table 	= function Table(props) {
				let { id, cols, items, form, editable } = props,
					hFrm = IS(form)=='object',
					Elem = hFrm ? Form : 'div', 
					cnum = (cols||[]).length,
					edit = !!editable?'edit':null,
					attr = Assign({
						className: classN(["table","spread","reveal"],edit),
						style: { gridTemplateColumns: cols.join(' ') },
					}, hFrm ? form : {});
				// -----------------------------------------------------------
				function getStyles(id, cols) {
					let temp = '.table#%s>.column:nth-child(%sn+%s){border-%s-width:1px;}',
						args = [[id,cols,cols,'right'],[id,cols,1,'left']];
					return args.map(a=>a.reduce((c,n)=>c.replace('%s',n),temp)).join('\n');
				};
				// -----------------------------------------------------------
				return (<Frag key={id}>
					<style key="sty" dangerouslySetInnerHTML={{__html:getStyles(id,cnum)}}></style>
					<Elem key="tbl" id={id} {...attr}>
						{(items||[]).map((c,n,a,f,h)=>(
							f = ((n+1)%cnum==1), h = (n<cnum),
							<div key={`${id}-c${n}`} className={classN("column",f?"nowrap":null,h?"head":null)} style={c.style}>
								<div className={classN(f?"trunc":null)}>{!!!c.link ? 
									(IS(c.text)!='object'?<span>{c.text}</span>:c.text) :
									(<a key={c.key||null} {...c.link}>{c.text}</a>)
								}</div>
							</div>
						))}
					</Elem>
				</Frag>);
			}

			EV.Content.Block 	= function Block(props) {
				let { name, header: head, items = [], form, align } = props,
					  slice = !!(align||'').match(/\bgridSlice\b/),
					  Elem  = !!form?Form:'div';
				return (
					<Elem id={name} className={classN('block',align)} {...form}>
						{!!head?<h4 key={name} className={slice?"spread":null}>
							{head.label}<i className={FA(head.icon)}></i>
						</h4>:null}
						{Agnolist(items)}
					</Elem>
				);
			};

		// SERVICE /////////////////////////////////////////////////////////

			EV.Services 		= class Services 	extends Mix('Reflux',MX.Static) {
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
						return (
							<Frag>{srvcs.map((s) => (
								<Service key={`svc-slab-${s.id}`} {...s} editable={edit}/>
							))}</Frag>
						);
					}
			};

			EV.Service 			= class Service 	extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'SERVICE';
					this.tags = {true:'edit',false:'show'};
				}

				showService({ IDs, desc, rate, charge }) {
					let svid  =  IDs.svid,
						dllar = (<span className="muted">$</span>),
						slash = (<span className="muted">/</span>),
						chrg  = {
							Free:	 c => ('Free!'),
							Flat:	 c => (<Frag key="chrg">{dllar}{c}</Frag>),
							Hourly:	 c => (<Frag key="chrg">{dllar}{c}{slash}hour</Frag>),
							Daily:	 c => (<Frag key="chrg">{dllar}{c}{slash}daily</Frag>),
							Monthly: c => (<Frag key="chrg">{dllar}{c}{slash}monthly</Frag>),
							Quote:	 c => ('Quote'),
						}[rate](charge);
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
						<button className="tkn block good some"><span><i className="fas fa-credit-card"></i> Inquire</span></button>
						<label className="tkn block norm more reveal" htmlFor={IDs.info}><span><i className="fas fa-binoculars"></i> Get more Info</span></label>
						<input type="checkbox" id={IDs.info} name={IDs.info} className="reveal open"/>
						<div className="reveal spread">
							<p><small>Check out any relavent <b>Documents</b>, <b>Credentials</b>, <b>Images</b> &amp; <b>Links</b> regarding this Service below!</small></p>
							<br/>
							<Service.Files svid={svid} />
						</div>
					</Frag>);
				}

				editService({ IDs, name, desc, rate, charge }) {
					let id    = `${IDs.svc}-edit`,
						svid  =  IDs.svid,
						btns  = { font:'.8em' },
						form  = {
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
						},
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
							<Form {...form}>
								<div className="spread">
									<p><small>Edit your <b>Service Name</b>, <b>Description</b> & <b>Charge</b>/<b>Rate</b>. <i>Keep in mind; changing this info may hinder your current clientele's ability to find you.</i> Be sure to alert them of said changes.</small></p>
									<p><small>You can also <b>Delete</b> your Service as well. <b>This CANNOT be undone!</b></small></p>
								</div>
								<div className="more">
									<Form.Xput {...{
										id:			`${IDs.svc}-name`,
										name:		"SvcName",
										icon:		'sign',
										kind:		'text',
										placeholder:'Service Name',
										priority:	'*',
										value:		 name,
										validate: 	{
											pattern: /[\w &|\/:;'"#@!?+,.-]+/,
											invalid: 'Please specify a valid Service Name.',
										},
									}	} />
								</div>
								<div className="eight some">
									<Form.Select {...{
										kind:		 'slc-txt',
										id: 		 `${IDs.svc}-rate`,
										name:		 'SvcRate',
										icon:		 'dollar-sign',
										reverse:	  true,
										title:		 'Rate',
										priority:	 '*',
										options:	[],
										data:		{ url:'/list/rates',id:'select-rate' },
										value:		  rate,
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
											restrict: 	['Free','Quote'],
										},
									}	} />
								</div>
								<div className="spread">
									<Form.Area {...{
										id: 		`${IDs.svc}-descr`,
										name:		'SvcDescr',
										icon:		'newspaper',
										rows:		 5,
										priority:	'*',
										placeholder:'Use this to provide as many details as possible regarding your Service. This can contain any Rules or Restrictions, Hours of Pperation, etc.',
										value:		 desc,
									}	}/>
								</div>
							</Form>
							<div className="spread reveal btm">
								<p>
									<small>Check out any relavent <b>Documents</b>, <b>Credentials</b>, <b>Images</b> &amp; <b>Links</b> regarding this Service below!</small>
								</p>
								<br/>
								<Service.Files svid={svid} editable/>
							</div>
						</Content.Trader>
					);
				}

				render() {
					let tag   = this.tags,
						props = this.props,
						svid  = props.id,
						IDs   = {
							svid:	 svid,
							svc: 	`showSvc-${svid}`,
							info: 	`showSvcInfo-${svid}`,
						},
						edit  = !!props.editable,
						Serv  = this[`${tag[edit]}Service`],  
						kind  = props.kind, 
						name  = props.name, 
						title = (<Frag>{name}<span className="mirror">{kind}</span></Frag>),
						desc  = props.description,
						chrg  = props.charge,
						rate  = props.rate;
					return (
						<Content.Slab id={IDs.svc} group="svcs" title={title} swap>
							<Serv IDs={IDs} name={name} desc={desc} rate={rate} charge={chrg}/>
						</Content.Slab>
					);
				}
			};

			EV.Service.Files 	= class Files 		extends Mix('Reflux',MX.Static) {
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

			EV.Service.Bucket 	= class Bucket 		extends Mix('Reflux',MX.Static) {
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
							let id = THS.fid, {stamp,items=[]} = (store[id]||{});
							if (!!stamp&&stamp!==THS.state.stamp) {
								let files = Imm.List(THS.state.files),
									rslts = (((items[0]||{}).services||{})[which]||[]),
									findr = (n)=>([files.findKey((o)=>o.id==n.id),n]),
									mergr = (f)=>(files=funcs[!!f[0]](f)),
									funcs = { 
										true:  (f)=>(files.set(f[0],f[1])),
										false: (f)=>(files.push(f[1])),
									};
								rslts.map(findr).map(mergr);
								return { 
									stamp: stamp, loaded: true, status: 'done', 
									files: files.toJS(),	
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

			EV.Service.Uploader = class Uploader 	extends Mix('Reflux',MX.Static) {
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
								<div key="add" className="gridSlice PTB">
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

		
		// CONTACT METHODS /////////////////////////////////////////////////
			EV.StandardForm = class StandardForm extends Mix('Reflux',MX.Static) {
				constructor(props) {
					super(props); this.name = 'STANDARDFORM';
					// ------------------------------------------------------------
					let THS = this, data = props.data, id;
					console.log(this.state.contactTemplate);
					// ------------------------------------------------------------
					this.handleChange = this.handleChange.bind(this);
					this.handleSubmit = this.handleSubmit.bind(this);
					this.handleCancel = this.handleCancel.bind(this);
					// ------------------------------------------------------------
					
					if (!!data&&data.id) { id = data.id;
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let data = store[id]||{}, stamp = data.stamp;
							if (!!stamp&&stamp!==THS.state.stamp) return {
								stamp: stamp, loaded: true, options: data.items, 
							}; 	else return null;
						});
						THS.state = {
							email: '',
							password: '',
							contactTemplate: true,
						};
					}
				}

				handleChange (event) {
					// check it out: we get the event.target.name (which will be either "email" or "password")
					// and use it to target the key on our `state` object with the same name, using bracket syntax
					this.setState({ [event.target.name]: event.target.value });
				}

				handleSubmit(event) {
					//const categories = this.state.ContactCategory.map;
					alert('Email: ' + this.state.email);
					event.preventDefault();
				}

				handleCancel(event) {
					//const categories = this.state.ContactCategory.map;
					this.setState({contactTemplate: null});
					event.preventDefault();
				}

				render () {
					return (
						<form>
							<label>Email</label>
							<input type="text" name="email" onChange={this.handleChange} />

							<label>Password</label>
							<input type="password" name="password" onChange={this.handleChange} />
							<button onClick={this.handleCancel}>Cancel</button> <button onClick={this.handleSubmit}>Submit</button>
						</form>
					);
				}
			}


			EV.Contactmethods 	= class Contactmethods 	extends Mix('Reflux',MX.Static) {
				constructor(props) {
					super(props); this.name = 'SELECT';
					// ------------------------------------------------------------
					let THS = this, data = props.data, id;
					// ------------------------------------------------------------
					this.handleChange = this.handleChange.bind(this);
					this.handleCancel = this.handleCancel.bind(this);
					this.handleSubmit = this.handleSubmit.bind(this);
					this.handleInputChanges = this.handleInputChanges.bind(this);
					// ------------------------------------------------------------
					
					if (!!data&&data.id) { id = data.id;
						THS.mapStoreToState(COMPS.Stores.Data, store => {
							let data = store[id]||{}, stamp = data.stamp;
							if (!!stamp&&stamp!==THS.state.stamp) return {
								stamp: stamp, loaded: true, options: data.items, 
							}; 	else return null;	
						});
					}
					
					this.setState({
						isSubmitButtonDisabled: false,
						isSubmitted: false,
					})
				}

				// CYCLE     /////////////////////////////////////////////////////////

				componentDidMount() {
					let prop = this.state, 
						send = Actions.Data.send,
						data = prop.data,
						load = !!prop.loaded;
					if (!!data&&!!document&&!load) {
						let url = data.url, id = data.id;
						if (!!!DATA_TMR[id]) DATA_TMR[id] = setTimeout(() => {
							send(url, {
								method:	'GET', headers: { token: COMPS.Token },
								params:	{}, query: { id: id, limit: 100 },
							});
							setTimeout(()=>(DATA_TMR[id]=null), 100);
						}, 	50);
					}
				}

				// GETTERS   /////////////////////////////////////////////////////////

				get restrictions () { return this.props.restrict||[]; }
				get selector	 () { return this.refs.slc; }
				get selected 	 () { return this.selector.selectedOptions[0]; }
				get value		 () { return this.selected.value; }

				// EVENTS    /////////////////////////////////////////////////////////

				handleChange(event) {
					// Set template type
					this.setState({contactTemplate: event.target.value});
					
					// Set the option text
					var index = event.nativeEvent.target.selectedIndex;
					this.setState({reasonText: event.nativeEvent.target[index].text});
					
					if(event.target.value==="Standard") {
						this.setState({uploadRequired: ''});
					} if(event.target.value==="OptionalUploads") {
						this.setState({uploadRequired: 'Optional - '});
					} if(event.target.value==="MandatoryUploads") {
						this.setState({uploadRequired: 'Required - '});
					}
					console.log("Display "+event.target.value+" Form");
					//alert(event.target.value);
				}

				handleInputChanges(event) {
					this.setState({ [event.target.name]: event.target.value });
				}

				handleCancel(event) {
					//const categories = this.state.ContactCategory.map;
					this.setState({contactTemplate: null, subject: '', message: '', contactError: '', contactSuccess: '', isSubmitButtonDisabled: false});
					event.preventDefault();
				}

				handleSubmit(event) {
					// Standard Form
					if(this.state.contactTemplate === 'Standard') {
						if(this.state.subject === undefined || this.state.subject.length <= 2) {
							return this.setState({contactError: "please enter a valid subject"});
						}
						if(this.state.message === undefined || this.state.message.length <= 4) {
							return this.setState({contactError: "please enter a valid message"});
						}
						
						// Generate Case Number
						let date = new Date();
						let sec = date.getSeconds() + 1;
					}
					
					// Optional Uploads
					if(this.state.contactTemplate === 'OptionalUploads') {
						if(this.state.subject === undefined || this.state.subject.length <= 2) {
							return this.setState({contactError: "please enter a valid subject"});
						}
						if(this.state.message === undefined || this.state.message.length <= 4) {
							return this.setState({contactError: "please enter a valid message"});
						}
						
						// Generate Case Number
						let date = new Date();
						let sec = date.getSeconds() + 1;
					}
					
					// Mandatory Uploads
					if(this.state.contactTemplate === 'MandatoryUploads') {
						if(this.state.subject === undefined || this.state.subject.length <= 2) {
							return this.setState({contactError: "please enter a valid subject"});
						}
						if(this.state.message === undefined || this.state.message.length <= 4) {
							return this.setState({contactError: "please enter a valid message"});
						}

						if(this.state.contactFiles === undefined || this.state.contactFiles.length <= 4) {
							return this.setState({contactError: "Please submit at least one document, image or link"});
						}
						
						// Generate Case Number
						let date = new Date();
						let sec = date.getSeconds() + 1;
	
						
					}
					
					// Generate Case Number
					let date = new Date();
					let sec = date.getSeconds() + 1;
					let caseNo = 'SS'.concat('0000').concat((Math.random() * 100000000).toFixed() * sec);

					var submitData = {
						subject: this.state.subject,
						message: this.state.message,
						resonText: this.state.reasonText,
						caseNo: caseNo
					}
					
					console.log(submitData);
					
					let result = fetch('/submitcontact', {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							firstParam: 'yourValue',
							secondParam: 'yourOtherValue',
						})
					});

					console.log(result);

					var successMessage = "Thank you, your message has been delivered. We will notify you when the status of your request has been changed. For tracking purposes your case number is: " + caseNo;
					this.setState({
						isSubmitButtonDisabled: true,
						isSubmitted: true,
						contactSuccess: successMessage,
					});
					event.preventDefault();
				}
				// FUNCTIONS /////////////////////////////////////////////////////////

					//

				// MAIN      /////////////////////////////////////////////////////////

				render() {
					let props 	= this.state,
					opts  	= props.options||[],
					title 	= props.title,
					attrs 	= {
						id: 			props.id, 
						name: 			props.name, 
						title: 			title, 
						tabIndex: 		props.tab,
						className:		props.className,
						defaultValue:	props.value||'none',
						onChange:		this.handleChange,
					};
					
					// Contact Reasons from Mongo (reason)
					const listItems = opts.map((reason) =>
						<option value={reason._doc.form_type}>{reason._doc.reason_title}</option>
					);

					// STANDARD FORM
					if(this.state.contactTemplate === 'Standard') {
						let reasonText = this.state.reasonText;
						let contactError = this.state.contactError;
						let contactSuccess = this.state.contactSuccess;
						return (
							<div className='pading'>
								<h3>{reasonText}</h3>
								<div className='field'>
									<div className='control has-icons-left has-icons-right'>
										<label className='label left_align'>Subject</label>
										<div className='control'>
											<input className='input contact-input' type='text' name='subject' placeholder='Subject (Mandatory)' onChange={this.handleInputChanges} />
										</div>
									</div>
								</div>

								<div className='field'>
									<label className='label left_align'>Write your message</label>
									<div className='control'>
										<textarea className='textarea contact-input' name='message' placeholder='Enter Message (Mandatory)' onChange={this.handleInputChanges} />
									</div>
								</div>
								<div style={{paddingTop: '25px'}}>
									<button className='contact-submit' onClick={this.handleSubmit} disabled={this.state.isSubmitButtonDisabled}>Send Message</button>
									<button className='cancel-button' onClick={this.handleCancel}>Cancel</button>
									<p className='error-message-text'>{contactError}</p>
									<p className='success-message-text'>{contactSuccess}</p>
								</div>
							</div>
							//<EV.StandardForm contactTemplate={this.state.contactTemplate} />
						);
					}

					// WITH UPLOADS
					if(this.state.contactTemplate === 'MandatoryUploads' || this.state.contactTemplate === 'OptionalUploads') {
						let reasonText = this.state.reasonText;
						let contactError = this.state.contactError;
						let uploadRequired = this.state.uploadRequired;
						return (
							<div className='pading'>
								<h3>{reasonText}</h3>
								<div className='field'>
									<div className='control has-icons-left has-icons-right'>
									<label className='label left_align'>Subject</label>
									<div className='control'>
										<input className='input contact-input' type='text' name='subject' placeholder='Subject (Mandatory)' onChange={this.handleInputChanges} />
										<span class='icon is-medium is-left icn'>
										<i class='fas fa-id-card icn1' />
										</span>
									</div>
									</div>
								</div>
								<div className='field'>
									<label className='label left_align'>Your Message</label>
									<div className='control'>
										<textarea className='textarea contact-input' name='message' placeholder='Enter Message (Mandatory)' onChange={this.handleInputChanges} />
									</div>
								</div>

								<hr style={{marginTop: '25px',marginBottom: '25px'}} />

								<h3>{uploadRequired}Provide at least one document, image or link</h3>

								<div className='field'>
									<div class='control has-icons-left has-icons-right'>
										<label className='label left_align'>Upload Documents or Images</label>
										<div className='control'>
											<input className='input contact-input' type='file' name='contactFiles' placeholder='Upload Documents or Images' onChange={this.handleInputChanges} />
											<span class='icon is-medium is-left icn'>
											<i class='fas fa-id-card icn1' />
											</span>
										</div>
									</div>
								</div>
								<div style={{paddingTop: '25px'}}>
									<button ref="submitContact" className='contact-submit' onClick={this.handleSubmit}>Send Message</button>
									<button className='cancel-button' onClick={this.handleCancel}>Cancel</button>
									<p className='error-message-text'>{contactError}</p>
								</div>
							</div>
							//<EV.StandardForm contactTemplate={this.state.contactTemplate} />
						);
					}

					// REASON SELECT
					return (
						//<form onSubmit={this.handleSubmit}>
						<form>
							<label>
								<select id="select-contact-reason" className="contact-reason-select" onChange={this.handleChange}><option value="" SELECTED>Select a Reason</option>{listItems}</select>
							</label>
						</form>
					);

					/*const SelectReason = (props) => {
						return (
						<form>
							<label>
							<select id="select-contact-reason" class="fill grow" onChange={this.handleChange}><option value="" SELECTED>Select a Reason</option>{listItems}</select>
							</label>
						</form>
						)
					}

					return (
						<SelectReason/>
					);*/

					/*const ContactFormStandard = (props) => {
						const { submitStandard } = props
						return (
							<div className='pading'>
								<div className='field'>
									<div class='control has-icons-left has-icons-right'>
									<label className='label left_align'>Subject</label>
									<div className='control'>
										<input className='input contact-input' type='text' name='subject' placeholder='Subject (Optional)' />
										<span class='icon is-medium is-left icn'>
										<i class='fas fa-id-card icn1' />
										</span>
									</div>
									</div>
								</div>

								<div className='field'>
									<label className='label left_align'>Messages</label>
									<div className='control'>
									<textarea className='textarea' name='message' placeholder='Enter Message (Mandatory)' />
									<p className='error-message-text'></p>
									</div>
								</div>
								<button class='button is-success'>Send</button>
							</div>
						)
					}

					const ContactFormMandatoryUploads = (props) => {
						const { submitMandatoryUploads } = props
						return (
							<div className='pading'>
								<div className='field'>
									<div class='control has-icons-left has-icons-right'>
										<label className='label left_align'>Subject</label>
										<div className='control'>
											<input className='input contact-input' type='text' name='subject' placeholder='Subject (Optional)' />
											<span class='icon is-medium is-left icn'>
											<i class='fas fa-id-card icn1' />
											</span>
										</div>
									</div>
								</div>

								<div className='field'>
									<div class='control has-icons-left has-icons-right'>
										<label className='label left_align'>Upload Screenshots, Conversasions, etc.</label>
										<div className='control'>
											<input className='input contact-input' type='text' name='File' placeholder='Select Files' />
										</div>
									</div>
								</div>

								<div className='field'>
									<label className='label left_align'>Messages</label>
									<div className='control'>
										<textarea className='textarea' name='message' placeholder='Enter Message (Mandatory)' />
										<p className='error-message-text'></p>
									</div>
								</div>
								<button class='button is-success'>Send</button>
							</div>
						)
					}

					const SelectReason = (props) => {
						return (
						<form>
							<label>
							<select id="select-contact-reason" class="fill grow" onChange={this.handleChange}><option value="" SELECTED>Select a Reason</option>{listItems}</select>
							</label>
						</form>
						)
					}

					return (<div>
						<SelectReason/>
						{this.state.contactTemplate === 'Standard' && <ContactFormStandard/>}
						{this.state.contactTemplate === 'MandatoryUploads' && <ContactFormMandatoryUploads/>}
						{this.state.contactTemplate === 'Standard' && <ContactFormStandard/>}
					  </div>
					)/*
					/*

					if(this.state.contactTemplate === 'Standard') {
						return (
							
							<div className='pading'>
								<div className='field'>
									<div class='control has-icons-left has-icons-right'>
									<label className='label left_align'>Subject</label>
									<div className='control'>
										<input className='input contact-input' type='text' name='subject' placeholder='Subject (Optional)' />
										<span class='icon is-medium is-left icn'>
										<i class='fas fa-id-card icn1' />
										</span>
									</div>
									</div>
								</div>

								<div className='field'>
									<label className='label left_align'>Messages</label>
									<div className='control'>
									<textarea className='textarea' name='message' placeholder='Enter Message (Mandatory)' />
									<p className='error-message-text'></p>
									</div>
								</div>
								<button class='button is-success'>Send</button>
							</div>
						);
					}

					else return (
						<form onSubmit={this.handleSubmit}>
							<label>
							<select id="select-contact-reason" class="fill grow" onChange={this.handleChange}><option value="" SELECTED>Select a Reason</option>{listItems}</select>
							</label>
						</form>
					);*/
				}
			};

		// STRIPE  /////////////////////////////////////////////////////////

			EV.PoS = {};

			// EV.PoS.Card  = INJECT(class Card		extends Mix('React', MX.Dynamic) {
			// 	constructor(props) {
			// 		super(props); let THS = this; THS.name = 'UPLOADER';
			// 		// ---------------------------------------------------
			// 	}

			// 	handleChange = ({error}) => {
			// 		if (error) this.setState({errorMessage: error.message});
			// 	};

			// 	handleSubmit = (evt) => {
			// 		evt.preventDefault();
			// 		if (this.props.stripe) {
			// 			this.props.stripe.createToken().then(this.props.handleResult);
			// 		} else {
			// 			console.log("Stripe.js hasn't loaded yet.");
			// 		}
			// 	};
				
			// 	render() {
			// 		return (
			// 		<form onSubmit={this.handleSubmit.bind(this)}>
			// 			<div className="split-form">
			// 			<label>
			// 				Card number
			// 				<CardNumberElement {...createOptions()} onChange={this.handleChange} />
			// 			</label>
			// 			<label>
			// 				Expiration date
			// 				<CardExpiryElement {...createOptions()} onChange={this.handleChange} />
			// 			</label>
			// 			</div>
			// 			<div className="split-form">
			// 			<label>
			// 				CVC
			// 				<CardCVCElement {...createOptions()} onChange={this.handleChange} />
			// 			</label>
			// 			<label>
			// 				Postal code
			// 				<input name="name" type="text" placeholder="94115" className="StripeElement" required/>
			// 			</label>
			// 			</div>
			// 			<div className="error" role="alert">
			// 			{this.state.errorMessage}
			// 			</div>
			// 			<button>Pay</button>
			// 		</form>
			// 		);
			// 	}
			// });
			// EV.PoS.Card.defaultProps = {
			// 	errorMessage: '',
			// }

		// FORMS   /////////////////////////////////////////////////////////

			EV.Form 			= class Form 		extends Mix('Reflux',MX.Static) {
				constructor(props) {
					super(props); let THS = this, rid; THS.name = 'FORM';
					// ---------------------------------------------------
						THS.handleSubmit = THS.handleSubmit.bind(THS);
						THS.handleReset  = THS.handleReset.bind(THS);
					// ---------------------------------------------------
						THS.SnapShot    = null; rid = props.rid;
						THS.Statuses    = { true:'fail', false:'done' };
						THS.ShouldClear = !!props.clear;
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
						super.componentDidMount();
						this.mkeSnapShot();
					}

					componentDidUpdate() {
						super.componentDidUpdate();
						this.mkeSnapShot();
					}

					static getDerivedStateFromProps(props, state) {
						if (props.stamp !== state.stamp) {
							let { stamp, status, children } = ( 
									props.stamp>state.stamp?props:state
								), 	result = {
									stamp:		stamp, 
									status:		status, 
									children:	children,
								};
							return result;
						};	return null;
					}

				// GETTERS   /////////////////////////////////////////////////////////

					get eid 	() { return this.state.rid||this.state.id; }
					get action 	() { return this.state['data-action']; }
					get differ  () { return !!this.state['data-differ']; }
					get method 	() { return this.state.method; }
					get timeout () { return this.state.timeout; }
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
					get request () {
						let THS = this, bdy = 'body', qry = 'query', mth = THS.method,
							wch = {'GET':qry,'POST':bdy,'PUT':bdy,'DELETE':bdy}[mth],
							inputs = THS.getForm(), eid = THS.eid, req = {}, prm = {},
							fillVals = (name,value,dataset) => {
								name = name.toLowerCase().replace(/@\d+$/,'');
								if (!!dataset.param) prm[name]=value;
								else req[name]=value;
							}, { params, query } = THS.props;
						// ------------------------------------------------------------
							for (let {name,value,dataset} of inputs) 
								fillVals(name,value,dataset);
						// ------------------------------------------------------------
							return { 
								method:	 	mth,
								headers:    { token: COMPS.Token },
								params:	 	Assign(params, prm),
								[wch]: 		Assign(query, req, {
												id: eid, single: true
											}),
							};
					}

				// EVENTS    /////////////////////////////////////////////////////////

					handleSubmit(e) {
						if (!!this.props['data-action']) {
							e.stopPropagation(); e.preventDefault(); 
							let THS 	= this,
								send 	= Actions.Data.send,
								current = Map(THS.getSnapShot()),
								snapsht = Map(THS.SnapShot);
							if (ImmIs(current,snapsht)===false) {
								let url = THS.action, req = THS.request;
								console.info('REQUEST:', url, req);
								setTimeout(()=>send(url,req),0);
								THS.setState({status:'load'});
							}
						} else {
							e.submit();
						}
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
							css   = `:not([form])${subid}`,
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
						let mappr = (v,k)=>(IS(v)=="boolean"),
							filtr = (v,k)=>(k=='style'||!['object','array'].has(IS(v))),
							attrs = Map(props).filter(filtr).toJS();
						// if (Map(props).has('clear')) {
							// console.log('FORM PROPS:',props);
						// }
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
							value:	 	 stat,
							checked:	!!{
								done: 0, time: 0,
								fail: 0, load: 1
							}[stat],
						}
					}
					getButtons(buttons) {
						let THS = this, bKinds = ['button','submit'];
						return buttons.map((b,i) => {
							let {kind,label,style,start,size,font,icon} = b,
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
								<div key={key} {...attr}><Form.Button {...{
									kind:	 kind,
									styles: [style||'info'],
									block:	 true,
									label:	 label||'Submit',
									action:  rset?THS.handleReset:null,
									font:	 font||'1rem',
									icon:	 icon,
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
								case 'radio': case 'checkbox': 
									snap[name] = EL.checked; break;;
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
								case 'radio': case 'checkbox': 
									EL.checked = snap[name]; break;;
								default: 
									EL.value = snap[name];
							}
						});
					}

					setTimer() {
						let THS = this; 
						!!!THS.timer && THS.is.load && (
							THS.timer = setTimeout(()=>{
								THS.timer = null;
								THS.setState({status:'time'})
							},	THS.timeout*1000));
					}
					clrTimer() {
						let THS = this; !!THS.timer && (
							clearTimeout(THS.timer),
							THS.timer = null);
					}

				// DOERS     /////////////////////////////////////////////////////////
					
					//

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let THS 	= this, 
							props 	= THS.state, 
							id 		= props.id,
							chattr  = THS.getCheckAttr(props),
							attrs 	= THS.getAttrs(props),
							buttons = props.buttons||[];
						THS.clrTimer(); THS.setTimer();
						return (<Frag key={id}>
							<input key="status" ref="status" {...chattr}/>
							<form key="form" ref="form" {...attrs}>
								{THS.getButtons(buttons)}
								{props.children}
							</form>
						</Frag>);
					}
			};
			EV.Form.defaultProps = {
				get params() { return { uids: COMPS.UID }; },
				query:	 {},
				timeout: 30,
			}

			EV.Form.Validate 	= function Validate(props) {
				return (
					<div className="validate">
						<label className="trunc">
							{ props.invalid }
							{ !!props.allowed ? (
								<Frag>&nbsp;<div className="bracket">
									{props.allowed.map((a,k) => 
										<span key={k} className="mono" data-delim={props.delim}>{a}</span>
									)}
								</div></Frag>
							) : null }
						</label>
					</div>
				);
			}

			EV.Form.Input 		= class Input 		extends Mix('Pure',  MX.Static, MX.Forms) {
				constructor(props) {
					super(props); this.name = 'INPUT';
				}

				getAttrs(props = {}, calculated = {}) {
					let omits = [true,false], 
						regex = /^(on([A-Z][a-z]+)+|data-\w+)$/,
						filtr = (p,n)=>(!omits.has(p)&&!!n.match(regex));
					return Assign(
						{}, calculated,
						Map(props).filter(filtr).toJS(),
						this.getDefault(props.value)
					);
				}

				render() {
					let THS    = this,
						props  = THS.props, 
						kind   = props.kind, 
						token  = kind=='tokens',
						num    = kind=='number',
						search = !!props.search,
						id     = props.id, 
						name   = props.name||id, 
						valid  = props.validate||{},
						autoc  = THS.getAutoComp(name,props),
						attrs  = THS.getAttrs(props, { 
							type: 			!!!kind||search||token?'text':kind,
							id: 			id, 
							name: 			name, 
							form: 			props.form, 
							placeholder:	props.placeholder, 
							tabIndex: 		props.tab,
							className:		classN(...(props.classes||[]).
												concat(['fill','grow'])),
							autoComplete:	autoc,
							autoFocus:		props.autoFocus,
							required:		props.required||props.priority=='*',
							disabled:		props.disabled,
							pattern:		(valid.pattern||{}).source,
							min:			!!num ? props.min  : null,
							max:			!!num ? props.max  : null,
							step:			!!num ? props.step : null,
						});
					return (<Frag>
						<input ref={props.forRef} {...attrs}/>
							{ !!valid.invalid ?
						<Form.Validate {...valid}/> 
							: null }
					</Frag>);
				}
			};

			EV.Form.Xput 		= function Xput(props) {
				let id    = props.id, 
					icon  = props.icon?`fa-${props.icon}`:'',
					attr  = {
						'htmlFor':	 !!!props.noFor?id:null,
						'data-nfo':   !!props.help?'':null,
						'data-rel': 	props.priority,
						'className':	classN(...[
											'input','MB'
										].concat(
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
				if(props.visible === undefined)
					return (
						<label {...attr}>
							<Labl key="lbl" {...props}/>
							<Nput key="npt" {...props}/>
							<Help key="hlp" {...props}/>
						</label>
					);
				if(props.visible === true) return (
					<label {...attr}>
						<Labl key="lbl" {...props}/>
						<Nput key="npt" {...props}/>
						<Help key="hlp" {...props}/>
					</label>
				);
				else return null;
			};

			EV.Form.StandardXput 		= function StandardXput(props) {
				let id    = props.id, 
					icon  = props.icon?`fa-${props.icon}`:'',
					attr  = {
						'htmlFor':	 !!!props.noFor?id:null,
						'data-nfo':   !!props.help?'':null,
						'data-rel': 	props.priority,
						'className':	classN(...[
											'input','MB'
										].concat(
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
				if(props.visible === undefined)
					return (
						<label {...attr}>
							<Labl key="lbl" {...props}/>
							<Nput key="npt" {...props}/>
							<Help key="hlp" {...props}/>
						</label>
					);
				if(props.visible === true) return (
					<label {...attr}>
						<Labl key="lbl" {...props}/>
						<Nput key="npt" {...props}/>
						<Help key="hlp" {...props}/>
					</label>
				);
				else return null;
			};

			EV.Form.StandardArea 		= class StandardArea 		extends Mix('Pure',  MX.Static, MX.Forms) {
				constructor(props) {
					super(props); this.name = 'STANDARDAREA';
				}

				render() {
					let props 	= this.props, 
						id      = props.id, 
						name    = props.name||id, 
						place 	= props.placeholder,
						value   = this.getDefault(props.value);
					return (
						<Form.Xput {...props}>
							<textarea key={id} {...{  
								id: 			id, 
								name: 			name, 
								rows: 			props.rows||'2',
								placeholder:	IS(place)=='function'?place.bind(props)():place, 
								tabIndex: 		props.tab,
								className:		'fill grow',
							}} {...value}/>
						</Form.Xput>
					);
				}
			};

			EV.Form.DataList 	= class DataList 	extends Mix('React', MX.Static) {
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
											value = props.value;
										return {
											kind:		  token?'tokens':'text',
											id:			 `${group}-input`,
											form:		  group,
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
							hiden: 	((props, value) => {
										let {id,name,required,priority} = props;
										value = value||props.value;
										return {
											type: 		'hidden',
											name:		 name||id,
											id:			 id,
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
							hattr 	= THS.attrs.hiden(props);
						return (
							<div id={group} className="tags fill grow">
								<Frag key={group}>
									<Form.Input    {...props} {...iattr}/>
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
							hattr 	= THS.attrs.hiden(props, value),
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
													{ more ?
												<span className="more">{adjct}</span>
													: null }
											</label> 
										</Frag>
									) : null ) )}{(
										tattr = THS.attrs.token(group,{
													value: '', checked: !!!length
												},length),
										<input ref={length} {...tattr.rad}/> )}
									<Form.Input    {...props} {...iattr} autoFocus={mounted&&!!!length}/>
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

			EV.Form.Complete 	= class Complete	extends Mix('Reflux',MX.Static) {
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
									rslt  = (<span className={clss}>{adjct}</span>);
								console.log('TOKEN:', more, !!rslt, s)
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
												onBlur={THS.handleClose}
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

			EV.Form.Area 		= class Area 		extends Mix('Pure',  MX.Static, MX.Forms) {
				constructor(props) {
					super(props); this.name = 'AREA';
				}

				render() {
					let props 	= this.props, 
						id      = props.id, 
						name    = props.name||id, 
						place 	= props.placeholder,
						value   = this.getDefault(props.value);
					return (
						<Form.Xput {...props}>
							<textarea key={id} {...{  
								id: 			id, 
								name: 			name, 
								rows: 			props.rows||'2',
								placeholder:	IS(place)=='function'?place.bind(props)():place, 
								tabIndex: 		props.tab,
								className:		'fill grow',
							}} {...value}/>
						</Form.Xput>
					);
				}
			};

			EV.Form.Select 		= class Select 		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'SELECT';
				}

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let props 	= this.state, 
							kind  	= props.kind, 
							id      = props.id, 
							name    = props.name||id, 
							input 	= props.input,
							rev 	= !!props.reverse,
							styles 	= [kind].concat(rev?['rev']:[]),
							attrs 	= {  
								id: 		id, 
								name: 		name, 
								title: 		props.title, 
								tabIndex: 	props.tab,
								className:	classN('fill',!!input?'':'grow'),
								value:		props.value,
								options:	props.options,
								data:		props.data,
								restrict:	!!input?input.restrict:null,
							};
						return (
							<Form.Xput {...props} id={!!input?input.id:id} styles={styles} name={!!input?input.name:name}>
								<Form.Selector {...attrs} />
								<span></span>
								{ !!input ? ( input.kind=='tokens' ?
									<Form.Tokens {...input} styles={['slc','grow']}/> :
									<Form.Input  {...input} styles={['slc','grow']}/>
								): null }
							</Form.Xput>
						);
					}
			};
			EV.Form.Selector 	= class Selector 	extends Mix('Reflux',MX.Static) {
				constructor(props) {
					super(props); this.name = 'SELECT';
					// ------------------------------------------------------------
						let THS = this, data = props.data, id;
					// ------------------------------------------------------------
						THS.handleChange = THS.handleChange.bind(THS);
					// ------------------------------------------------------------
						if (!!data&&data.id) { id = data.id;
							THS.mapStoreToState(COMPS.Stores.Data, store => {
								let data = store[id]||{}, stamp = data.stamp;
								if (!!stamp&&stamp!==THS.state.stamp) return { 
									stamp: stamp, loaded: true, options: data.items, 
								}; 	else return null;	
							}	);
						}
				}

				// CYCLE     /////////////////////////////////////////////////////////

					componentDidMount() {
						let prop = this.state, 
							send = Actions.Data.send,
							data = prop.data,
							load = !!prop.loaded;
						if (!!data&&!!document&&!load) {
							let url = data.url, id = data.id; 
							if (!!!DATA_TMR[id]) DATA_TMR[id] = setTimeout(() => {
								send(url, {
									method:	'GET', headers: { token: COMPS.Token },
									params:	{}, query: { id: id, limit: 100 },
								}	); 
								setTimeout(()=>(DATA_TMR[id]=null), 100);
							}, 	50);	}
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
						console.log('RESTRICT:', {
							strict: strct,
							value:	value,
							will: 	will,
						});
						if (!will) {
							delete this.selector.dataset[key];
						} else {
							this.selector.dataset[key] = "";
						}
					}

				// FUNCTIONS /////////////////////////////////////////////////////////

					//

				// MAIN      /////////////////////////////////////////////////////////

					render() {
						let props 	= this.state, 
							opts  	= props.options||[],
							title 	= props.title,
							attrs 	= {  
								id: 			props.id, 
								name: 			props.name, 
								title: 			title, 
								tabIndex: 		props.tab,
								className:		props.className,
								defaultValue:	props.value||'none',
								onChange:		this.handleChange,
							};
						return (
							<select ref="slc" {...attrs}>{[{
									disabled:true,value:'none',label:title
								}].concat(opts).map((o,i) => 
									(<option key={`opt-${i}`} {...o}>{o.label}</option>)
							)}</select>
						);
					}
			};

			EV.Form.DateTime 	= class DateTime 	extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'DATETIME'; this._date = null;
					this.limit = {min:1900,max:new Date().getFullYear()};
					this.timer = null;
				}

				// GETTERS ///////////////////////////////////////////////////////////

					get Date ( ) { return this._date; }
					set Date (d) { this._date = d; 	 }

					get Which( ) { return Map({mth:1,day:0,yrs:0,hrs:0,min:0}); }
					get Acts ( ) { return {mth:'Month',day:'Date',yrs:'FullYear',hrs:'Hours',min:'Minutes',}; }
					get Limit( ) { return {
						mth: hndl('mth'),
						day: hndl('day'),
						yrs: hndl('yrs'),
						hrs: hndl('hrs'),
						min: hndl('min'),
					}; 	}

					get Get  ( ) {
						let THS   = this,
							date  = THS.Date,
							which = THS.Which,
							acts  = THS.Acts,
							hndl  = (wch)=>(()=>{
								let act = acts[wch], ofs = which.get(wch);
								try {
									return (date[`get${act}`]()+ofs)
										.toString()
										.padStart(2,'0');
								} catch (e) {
									return '';
								}
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

					getLimit(limit) { return Assign({},this.limit,limit||{}); }

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
						let THS 	= this,
							{id,value,limit,tab,required,priority} = props, 
							parts 	= THS.getParts(value),
							specs 	= {
								mth: Assign({ min: "01", max: "12" }),
								day: Assign({ min: "01", max: "31" }),
								yrs: Assign({ size: 4 },THS.getLimit(limit)),
								hrs: Assign({ min: "00", max: "23" }),
								min: Assign({ min: "00", max: "59", step: 10 }),
							},
							attrs 	= { 
								type: 		'number', 
								name: 		`${id}-group`, 
								form: 		`${id}-form`, 
								align: 		'center', 
								tabIndex: 	 tab,
								className:	'fill',
								size:		 2,
								required:	 !!required||priority=='*',
							};
						return THS.Which.map((i,w)=>Assign(
							{}, attrs, {
								id: 			`${id}-${w}`, 
								onChange: 		 THS.setParts(w),
								defaultValue:	 parts[w],
						},  specs[w])).toObject();
					}

					getParts(value = '') {
						try { let spl = value.match(/\d+/g).map(p=>parseInt(p));
							spl.splice(1,1,spl[1]-1);this.Date=new Date(...spl);
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
						let props 	= this.props, 
							id  	= props.id, 
							name  	= props.name||id, 
							value 	= props.value||"", 
							attrs 	= this.getAttrs(props),
							valid 	= props.validate,
							time  	= !!props.time,
							divider = (<i className="fill"></i>);
						return (
							<Form.Xput priority=" " {...props} styles={['date',time?'time':'']}>
								<input ref="mth" {...attrs.mth} placeholder="MM"  />{divider}
								<input ref="day" {...attrs.day} placeholder="DD"  />{divider}
								<input ref="yrs" {...attrs.yrs} placeholder="YYYY"/>{time ? <Frag>
								<input ref="hrs" {...attrs.hrs} placeholder="00"  />{divider}
								<input ref="min" {...attrs.min} placeholder="00"  /></Frag> : null}
								<input ref="input" type="hidden" id={id} name={name} pattern={(valid||{}).pattern} defaultValue={value}/>
									{ !!valid ?
								<Form.Validate {...valid} delim="/"/> 
									: null }
							</Form.Xput>
						);
					}
			};

			EV.Form.Checkbox 	= class Checkbox 	extends Mix('Pure',  MX.Static, MX.Forms) {
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
								form, tab,  no, ncon, checked, follows
							} 		= props, 
							styles	= THS.getStyles(props.styles),
							autoc  	= THS.getAutoComp(name,props),
							value   = THS.getDefault(props.value),
							click 	= THS.getClick(props),
							face 	= THS.Face||[],
							attrs 	= {
								'htmlFor':		name,
								'className': 	classN('tgl','gpu',...face),
								'data-yes':		yes,
								'data-ycon':	ycon,
								'data-no':		no,
								'data-ncon':	ncon,
							};
						return (
							<Form.Xput {...props} noFor={true} styles={styles}>
								<label {...attrs}><input ref={props.forRef} {...{ 
									'type': 			 "checkbox", 
									'id': 				  id, 
									'name': 			  name, 
									'form': 			  form, 
									'tabIndex': 		  tab,
									'autoComplete':		  autoc,
									'required':			!!required,
									'defaultChecked':	!!checked,
									'onClick':			  click,
									'data-follows':		  follows,
								}} {...value}/></label>
							</Form.Xput>
						);
					}
			};

			EV.Form.Button 		= class Button 		extends Mix('Pure',  MX.Static) {
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
						font	= props.font||'1rem',
						action 	= props.action,
						label 	= props.label,
						icon 	= props.icon,
						attrs 	= {
							type:		kind||'button',
							className:	classN(...styles),
							style:		{ fontSize:font },
							onClick:	action,
						};
					return (
						<button key="bttn" {...attrs}><span key="text">
							{!!icon?(<Frag key="icon"><i className={FA(icon)}></i>{!label?' ':null}</Frag>):null}
							{label}
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
				font:	'1rem',
				action:  null,
				label:	 null,
				icon:	 null,
			}

		// MULTI   /////////////////////////////////////////////////////////

			EV.Content.Multi 	= class Multi	 	extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'MULTI';
				}

				getText(props, lvl = false) {
					let cls = { 
							'className': lvl?'lvl':null,
							'data-more': props.adjct||null,
						},
						lnk = props.hasOwnProperty('href'),
						lbl = props.label||'...';
					return (lnk ?
						<a href={props.href||'#'} {...cls}>{lbl}</a> :
						<span {...cls}>{lbl}</span>
					);
				}

				render() {
					let props 	= this.props, 
						kind 	= props.kind, 
						lvl		= props.hasOwnProperty('level'),
						weight 	= props.weight||'',
						size	= `data-x${props.size||1}`,
						attrs	= {
							'type': 		"button",
							'className':	`multi tkn ${kind} ${weight}`.trim(),
							'value':		 props.value||null,
							[size]:			'', 
						};
					return (
						<button {...attrs}>
							<Frag>
								{this.getText(props)}{lvl ? 
								 this.getText(props.level,true):
								 null}
							</Frag>
						</button>
					);
				}
			};

			EV.Content.Multis 	= class Multis	 	extends Mix('Pure',  MX.Static) {
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
						<div className={align}>
							{!!head?<h5>{head.label}</h5>:null}
							<div className={flex}>{items.map((v,i) => (
								<Content.Multi key={`multi-${name}-${i}`} {...attrs} {...v}/>
							))}</div>
						</div>
					);
				}
			};

		// LISTS   /////////////////////////////////////////////////////////

			EV.Content.List 	= class List	 	extends Mix('Pure',  MX.Static) {
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

			EV.Content.Person	= class Person		extends Mix('Pure',  MX.Static) {
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

			EV.Content.Activity	= class Activity	extends Mix('Pure',  MX.Static) {
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

			EV.Trusts 			= class Trusts		extends Mix('Pure',  MX.Static) {
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
			
			EV.Trusts.Shield	= class Shield		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'SHIELD';
				}

				render() {
					let props = this.props, kind = props.kind, size = props.size, 
						classes	= classN('shield', kind||'invalid', size||'large');
					return (<label className={classes}><i></i><span></span></label>);
				}
			};

			EV.Trusts.Badge		= class Badge		extends Mix('Pure',  MX.Static) {
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

			EV.Trusts.Rating	= class Rating		extends Mix('Pure',  MX.Static) {
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
			EV.Foot 			= class Foot		extends Mix('Pure',  MX.Static) {
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
			EV.Threads 			= class Threads		extends Mix('Pure',  MX.Static) {
				constructor(props) {
					super(props); this.name = 'THREADS';
				}

				render() {
					var props 	= this.props,
						chats	= props.chats.reverse(),
						optns 	= FromJS({opts:['lite','small']});
					return ( COMPS.IsAuthd ?
						<section className="noSelect gridItemChat gridThreads" id="footer">
							<div className="gridItemThreads" id="chatter">
								<Bubble {...optns.mergeDeep(FromJS({kind:'more',opts:['dark']})).toJS()} />
								{chats.map((b,i)=><Bubble key={`chat${i}`} style={{gridColumn:i+2}} 
													{...optns.mergeDeep(FromJS(b)).toJS()}/>)}
								<Bubble {...optns.mergeDeep(FromJS({kind: 'add',opts:['dark']})).toJS()} />
							</div>
						</section> : null
					);
				}
			};

		// EXPORTS /////////////////////////////////////////////////////////
			
			const { 
				App, Head, Search, Cover, Title, Plaque, 
				Content, Service, Services, PoS, Form, 
				Trusts, Foot, Threads 
			} = EV;

			COMPS.Elements.Evectr = EV;

};
