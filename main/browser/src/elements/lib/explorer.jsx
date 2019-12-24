'use strict';

module.exports = function Comps(COMPS) {

	////////////////////////////////////////////////////////////////////////
	// CONSTANTS -----------------------------------------------------------

		const 	MX 			= COMPS.Mixins;
		const 	Mix 		= COMPS.Mix;
		const 	Agnostic 	= COMPS.Agnostic;
		const 	Actions 	= COMPS.Actions;
		const 	Reflux 		= COMPS.Reflux;
		const 	React 		= COMPS.React;
		const 	RDOM 		= COMPS.RDOM;

		const 	EX			= {};

		// Configs
		const	RLogin 		= '/auth/login';
		const	RLogout 	= '/auth/logout';

		function getBasic 	(user, pass) {
			COMPS.Basic = 'Basic '+btoa(user.value+':'+pass.value);
			return COMPS.Basic;
		}

	////////////////////////////////////////////////////////////////////////
	// MIXINS --------------------------------------------------------------

		COMPS.Mixins.Forms = {
			toSingle(fields) {
				let count = 0, form = this.props['data-point'];
				return fields.filter((v) => !v.hidden).map((v,k) => { count++;
					let ref = k.toLowerCase(), 
						prp = Assign({}, v, {
							key: k, name: k, ref: ref,
							form: form, index: count
						}); 
					return <Draft.Field {...prp} />;
				}).toArray();
			},
			toDouble(fields) {
				let id = 0, index = 0, count = 0, form = this.props.name,
					fld = fields.filter((v) => !v.hidden), len = fld.size,
					first = null, both = null, odd = (len % 2 != 0);
				return fld.map((v,k) => { id++; index++;
					let ref = k.toLowerCase(), prp = Assign({}, v, {
							key: k, name: k, ref: ref,
							form: form, index: index
						});
					if (id == 1 && odd) {
						index=0; return <Draft.Field {...prp} />
					} else if (index % 2 == 0) {
						both = (<div key={count} className='both'>
									{first}<Draft.Field {...prp} />
								</div>);
						first = null; return both;
					} else {
						first = (<Draft.Field {...prp} />);
						count++; both = null;
					}
				}).toArray();
			}
		};

	////////////////////////////////////////////////////////////////////////
	// COMPONENTS ----------------------------------------------------------

		const {
			JSONP, Tags, Bubble, NormalLink, SocketLink, 
			PhoneNum, PhoneExt, Address, 
		} = COMPS.Elements.Stock;

		// APP /////////////////////////////////////////////////////////////
			EX.App 				= class App 	 extends Mix('Reflux','General') {
				constructor(props) {
					super(props)
					this.name = 'APP';
					this.styled = false;
					this.store = COMPS.Stores.App;
				}
				setStyle(style) {
					try { if (!this.styled && !!style) {
						let elmStyle = document.getElementById('navigation');
						if (elmStyle.innerHTML == '/*!- STYLES -*/') {
							elmStyle.innerHTML = style;
							this.styled = true;
					}	} 	} catch (e) {}
				}
				render() {
					var props 	= this.state,
						header 	= props.header,
						navi 	= {page:props.page},
						stat 	= {status:props.status},
						content = props.content,
						loader 	= {progress:props.progress},
						footer 	= props.footer,
						classes = {
							'gridMain':		true,
							'loggedIn': 	header.identified,
							'loggedOut': 	!header.identified,
							'pause': 		props.paused,
							'ready': 		props.ready(),
						};
					COMPS.Token 	= header.user.Token; 
					COMPS.IsAuthd 	= header.identified;
					this.setStyle(props.style);
					return (
						<main id="content" className={Imm.Map(classes).filter((v)=>v).keySeq().toArray().join(' ')}>
							<Head {...header}	/>
							<Load {...loader}	/>
							<Navi {...navi}		/>
							<Stat {...stat}		/>

							{/* <Body {...content}	/> */}
							<Load.Lock />
							{(content.segments||[]).map((v,i) => Agnostic(v, i))}

							<Foot {...footer}	/>
							<Load.Wait ready={props.ready()} />
						</main>
					);
				}
			};

		// LOAD ////////////////////////////////////////////////////////////
			EX.Load 			= class Load 	 extends Mix('React', 'Dynamic') {
				constructor(props) {
					super(props)
					this.name = 'LOAD';
					// this.state = props;
				}

				componentDidUpdate() {
					if (this.state.progress == '100%') {
						setTimeout(function () { Actions.App.progress(0); }, 1000);
					}
				}
				render() {
					var props 	= this.state,
						classes = classN('gridItemJumbo'),
						style 	= { minWidth: (props.progress||0) };
					return (
						<div id="loader" className={classes}>
							<div id="bar"><div id="progress" style={style} /></div>
						</div>
					);
				}
			};

			EX.Load.Lock 		= class Lock 	 extends Mix('React', 'General') {
				constructor(props) {
					super(props)
					this.name = 'LOAD.LOCK';
				}

				render() {
					var classes  = classN('lock','noSelect','gridItemJumbo');
					return (
						<aside className={classes}>
							<div>Welcome!</div>
							<div>Login to get started!</div>
							<div>Your session expired. Gotta login again... :/</div>
							<div>The connection was Lost! :s</div>
						</aside>
					);
				}
			};

			EX.Load.Wait 		= class Wait 	 extends Mix('React', 'Dynamic') {
				constructor(props) {
					super(props)
					this.name = 'LOAD.WAIT';
				}

				render() {
					var props 	= this.state, ready = props.ready,
						classes = classN('wait', 'gridItemJumbo', { show: !!!ready });
					return (
						<div className={classes}>
							<div className="rect1" />
							<div className="rect2" />
							<div className="rect3" />
							<div className="rect4" />
							<div className="rect5" />
						</div>
					);
				}
			};

		// NAVI ////////////////////////////////////////////////////////////
			EX.Navi 			= class Navi 	 extends Mix('Reflux','Dynamic') {
				constructor(props) {
					super(props)
					this.name = 'NAVI';
					this.store = COMPS.Stores.Nav;
				}

				render() {
					var prp = this.state.page, page = prp.num, pth = prp.pth;
					return (<var id='nav' 	data-page={page}
											data-1={pth[0]||''}
											data-2={pth[1]||''}
											data-3={pth[2]||''} />);
				}
			};

			EX.Stat 			= class Stat 	 extends Mix('React', 'Dynamic') {
				constructor(props) {
					super(props)
					this.name = 'STAT';
				}

				render() {
					var status = this.state.status;
					return (<var id='stat' 	data-value={status} />);
				}
			};

		// HEAD ////////////////////////////////////////////////////////////
			EX.Head 			= class Head	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'HEAD';
				}

				render() {
					var props = this.props, user = props.user, profile = user.Profile;
					return (<header id='header' className="gridHeader">
						<div id="banner" className={CSS.Flex({Align:'C'},'noSelect gridItemBranding')}>
							<div id='logo'></div>
							<div id='title'><span>{TITLE}</span></div>
						</div>
						<div id='settings' className='noSelect gridItemSettings'>
							{props.identified ? (<Head.Logout {...profile} /> ): (<Head.Login />)}
						</div>
					</header>);
				}
			};

			EX.Head.Login		= class Login	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'HEAD.LOGIN';
				}

				handleLogin(e) {
					e.stopPropagation();
					var usr = this.refs.email_address, pss = this.refs.password,
						enc = getBasic(usr, pss),
						req = { headers: { authorization: enc } };
					Actions.Data.auth(RLogin, req, false);
					e.nativeEvent.srcElement.submit();
					usr.value=''; pss.value='';
				}
				render() {
					var src = "/public/html/login.htm";
					return ([
						<iframe key='autocomp' src={src} id="temp" name="temp" style={{display:'none'}} />,
						<form target='temp' id='auth'  key='auth' method='POST' onSubmit={this.handleLogin}
							className={CSS.Flex({Wrap:0,Space:'B'})} action={src} ref='login'>
							<label htmlFor='email_address' id='unameLbl' className='icon'>
								<i className='fa fa-user' aria-hidden='true' />
							</label>
							<span className='sunk fst'>
								<input ref='email_address' name='email_address' autoComplete='on' type='email' />
							</span>
							<label htmlFor='password' id='passwLbl' className='icon sunk lst'>
								<i className='fa fa-key' aria-hidden='true' />
							</label>
							<span className='sunk fst'>
								<input ref='password' name='password' autoComplete='on' type='password' />
							</span>
							<div className='auth sunk lst'>
								<i className='fa fa-sign-in' aria-hidden='true' />
								<input name='login' type='submit' value=' ' />
							</div>
						</form>
					]);
				}
			};

			EX.Head.Logout 		= class Logout	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'HEAD.LOGOUT';
				}

				handleLogout(e) {
					e.preventDefault(); e.stopPropagation();
					var req = { headers: { token: COMPS.Token } };
					Actions.Data.auth(RLogout, req, true);
					return false;
				}
				render() {
					var props = this.props;
					return (
						<form target='temp' id='auth' key='auth' method='POST' onSubmit={this.handleLogout}
							className={CSS.Flex({Wrap:0,Space:'B'})} action='#'>
							<label key='logoutLbl' id='logoutLbl' htmlFor='logout' className='icon sunk fst'>
								<span>Welcome,</span>
								<span id='user'>
									<a>{props.Name.First}</a>
									<i className='fa fa-user' aria-hidden='true' />
								</span>
							</label>
							<Head.Profile {...props} key='profile' />
							<button key='appsLbl' type='button' id='appdrawer' className='icon sunk'>
								<i className='fa fa-th' aria-hidden='true' />
							</button>
							<div className='auth sunk lst'>
								<i className='fa fa-sign-out' aria-hidden='true' />
								<input name='logout' type='submit' value=' ' />
							</div>
						</form>
					);
				}
			};

			EX.Head.Profile  	= class Profile	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'HEAD.PROFILE';
				}

				render() {
					var props 	= this.props,
						Name 	= props.Name,
						Photo 	= props.Photo,
						Contact = props.Contact,
						Email 	= { kind: 'email', value: Contact.Email, safe: true },
						Locate 	= Contact.Location,
						cssProf = CSS.Flex({Dir:'Col',Align:'S',Wrap:0}),
						cssUser = CSS.Flex({Align:'C',Space:'B',Wrap:0}),
						cssAbt 	= CSS.Flex({Align:'C',Space:'C'});
					return (
						<section id="profile" className={cssProf}>
							<header id="user" className={cssUser}>
								<div id="about" className={cssAbt}>
									<p id="name">
										<span id="first">{Name.First}</span> <span id="last">{Name.Last}</span>
									</p>
								</div>{/*  !!Photo ? 
								<Bubble {...{name:Name,img:Photo,opts:['dark','large']}} /> : 
								null  */}
							</header>
							<main id="info">
								<article id="demograph">
									<table id="contact" key="contact">
										<caption>Contact</caption>
										<tbody>
											<tr key="email">
												<td><p>Email</p></td>
												<td><p><NormalLink {...Email} /></p></td>
											</tr>
											<tr key="location">
												<td><p>Location</p></td>
												<td><Address {...Locate} /></td>
											</tr>
										</tbody>
									</table>
								</article>
							</main>
						</section>
					);
				}
			};

		// BODY ////////////////////////////////////////////////////////////
			EX.Body 			= class Body	 extends Mix('React',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'BODY';
				}

				render() {
					var props = this.props, cls = CSS.Flex({Wrap:0,Align:'S'});
					return (<main id='main'className={cls}>
						<Load.Lock />
						<Body.Segments {...props} />
						{/*<Body.View {...props} />*/}
					</main>);
				}
			};
			EX.Body.Segments	= class Segments extends Mix('React',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'BODY.SEGMENTS';
				}

				render() {
					var props 	= (this.props.segments||[]);
					// ---
					return (
						<section id='sections' className='sections noSelect'>
							{props.map((v,i) => Agnostic(v, i))}
						</section>
					);
				}
			};
			EX.Body.View 		= class View	 extends Mix('React') {
				constructor(props) {
					super(props)
					this.name = 'BODY.VIEW';
				}

				render() {
					var th = this, props = th.props, content = Imm.Map(props.pages);
					return (
						<section id='viewer' className='noSelect gpu'>
							{content.map((v,k,i) => {
								var name = v.name, pge = v.page, act = v.act, id;
								id = Stores.Data.setPath(act);
								return (
									<div key={name} data-page={pge} className="messages">
										<JSONP content={{}} id={id} key={act} />
									</div>
								);
							}).toArray()}
						</section>
					);
				}
			};

		// SIDEBAR /////////////////////////////////////////////////////////
			EX.SideBar 			= class SideBar	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'SIDEBAR';
				}

				render() {
					var props 	= this.props,
						name 	= (props.name||'').replace(/^([^#].*)$/,'#$1'),
						buttons = Imm.OrderedMap(props.items);
					return (
						<nav id={name} className='sidebar gpu gridItemSidebar'>
							{buttons.map(function (v,k) {
								return <SideBar.Bttn {...v} key={v.key} />
							}).toArray()}
						</nav>
					);
				}
			};
			EX.SideBar.Bttn 	= class Bttn	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'SIDEBAR.BTTN';
				}

				render() {
					var props = this.props, subsm = Imm.OrderedMap(props.subs);

						// console.log('BTTN:', props)

					return (
						<div 	id={props.id} ref='button'
								className={'button'+(subsm.size?' multi':'')}
								data-page={props.page}
								data-level={props.level}
								data-root={props.root}
								data-name={props.name}>
							<label 	data-form={props.form}
									onClick={props.onClck.bind(this)}
							>{props.name}</label>
							{subsm.map(function (v, k, i) {
								return <SideBar.Bttn {...v} />
							}).toArray()}
						</div>
					);
				}
			};

		// PAGES ///////////////////////////////////////////////////////////
			EX.Pages 			= class Pages	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'PAGES';
				}

				render() {
					var props 	= this.props,
						name 	= (props.name||'').replace(/^([^#].*)$/,'#$1'),
						pages 	= Imm.OrderedMap(props.items);
					return (
						<section id={name} className='pages gpu gridItemContent'>
							{pages.map((p,k) => {
								let prp = {
										key: k, id: k,
										'data-page': p.page,
										className: 'page gpu'
									};
								return (
									<article {...prp}>
										{p.items.map((v,i) => Agnostic(v,i))}
										{/*<Page key={k} {...v} />*/}
									</article>
								);
							}).toArray()}
						</section>
					);
				}
			};
			EX.Pages.Page 		= class Page	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'PAGE';
				}

				render() {
					var props 	= this.props,
						name 	= (props.name||'').replace(/^([^#].*)$/,'#$1'),
						pages 	= Imm.Map(props.items);
					return (
						<article id={name+'helo'} className='page gpu'>
							{pages.map((p,k) => p.map((v,i) => Agnostic(v,i))).toArray()}
						</article>
					);
				}
			};

		// DRAFT ///////////////////////////////////////////////////////////
			EX.Draft 			= class Draft	 extends Mix('React', 'Requests','Forms') {
				constructor(props) {
					super(props)
					this.name = 'DRAFT';
				}

				render() {
					var props 	= this.props,
						body 	= props.body,
						fills 	= body.fills,
						point 	= '/'+props.paths.join('/').toLowerCase(),
						params 	= Imm.OrderedMap(body.params).filter(function (v) { return v.to == 'param' }),
						querys 	= Imm.OrderedMap(body.params).filter(function (v) { return v.to == 'query' }),
						exmpls 	= { point: point, items: body.examples },
						frmCls 	= classN({ selected: props.selected }, 'draft'),
						exmCnt  = Object.keys(body.examples).length,
						hasFld  = Boolean(params.size||querys.size||exmCnt),
						formPrp = {
							className: 		frmCls,
							action: 		'',
							onSubmit: 		this.hndRequest,
							id: 			point,
							name: 			props.name,
							method: 		props.method.toLowerCase(),
							'data-point': 	point,
							'data-page': 	props.page,
						};
					COMPS.ExLinks[point] = this.setRequest;
					this.typeIsUpload(props.method);
					return (
						<form {...formPrp}>
							<div className="head">
								<h1>{props.paths.map(function (v, i) {
										var key = v+'.'+i;
										return <span key={key} className="route">{v}</span>;
									})}<sup>{hasFld?props.method:'ROUTE'}</sup>
								</h1>
							</div>
							<div className='body'>
								{hasFld?(<div>
									<div className='fields'>
										{this.toSingle(params)}
										{this.toDouble(querys)}
									</div>
									<Draft.Case {...exmpls} key="exams" />
								</div>):null}
							</div>
							<div className="foot" id="submit">
								{hasFld?(<div>
									<button id="send" name="send" type="submit">Send</button>
								</div>):null}
							</div>
						</form>
					);
				}
			};
			EX.Draft.Field 		= class Field	 extends Mix('Pure',  'Static','MonoSpacer') {
				constructor(props) {
					super(props)
					this.name = 'PAGES.FIELD';
					this.numTyps = ['date','datetime-local','number','radio','checkbox'];
					this.txtTyps = [
						'text','textarea','password','color','email','month','select',
						'range','search','tel','time','url','week','list','file'
					];
				}

				isRequired(props) {
					return INPUT.Priority(props.required)
				}
				getID(props) {
					return props.form+'-'+props.name;
				}
				getKind(type) {
					// ----------------------------------------------------
					var res = { type: 'text', attr: {}, opts: [] };
					if (!!type) {
						if (IS(type)=='object') {
							var typ = Object.keys(type)[0], 
								ctn = type[typ],
								iar = IS(ctn)=='array',
								wch = (iar?'opts':'attr');
							res.type = typ.toLowerCase();
							res[wch] = ctn;
						} else res.type = type.toLowerCase();
					};	return res;
				}
				getOddEven(props) {
					return props.index%2==0 ? 'even' : 'odd';
				}
				getMatches(props) {
					return Imm	.Map(props.matches||{})
								.map(function (v,k) { return { 
									key: k.trim(), val: v 
								};	}).toArray();
				}
				fmtType(typ) {
					switch (true) {
						case typeof(typ) == 'string': return typ;
						default: switch (true) {
							case typ.hasOwnProperty('List'):
								return 'List <'+typ.List+'[ '+typ.Separator+' ]>';
							case typ.hasOwnProperty('Number'):
								var min = typ.Number.min || 0,
									max = typ.Number.max || Infinity;
								return 'Number ('+min+' >=< '+max+')';
						}
					}; return 'Variant';
				}
				render() {
					let THS   = this, field = null,
						props = Assign({ matches: {} }, THS.props),
						name  = props.name,
						dflt  = props.default,
						type  = props.type,
						to    = props.to, isPrm = (to=='param'),
						kind  = THS.getKind(type),
						fid   = THS.getID(props),
						reqrd = THS.isRequired(props),
						match = THS.getMatches(props),
						place = (dflt||name),
						clss  = 'paramInput',
						flexC = classN(to,THS.getOddEven(props),'field'),
						attr  = Assign({
							'name': 		 name, 
							'id': 			 fid, 
							'type': 		 kind.type,
							'placeholder': 	 place,
							'data-default':  dflt,
							'data-priority': reqrd, 
							'data-to': 		 to,
							'className': 	 clss
						}, 	kind.attr );

					// console.log(props)

					switch (kind.type) {
						case 'list': 
							attr.className += ' taggee';
							field = (<Tags  key={name} ref='taggr' {...{
								tags:  [],
								text:  '',
								value: {
									name: 				attr.name,
									id: 				attr.id+'Npt',
									placeholder: 		attr.placeholder,
									'data-priority': 	attr['data-priority'],
									'data-default': 	attr['data-default'],
									'data-to': 			attr['data-to'],
									type: 				'hidden',
								},
								input: {
									name: 				attr.name,
									id: 				attr.id,
									placeholder: 		attr.placeholder,
									type: 				attr.type
								},
								range: {},
							}} />); break;;
						case 'checkbox': case 'radio': 
							field = kind.opts.map(function (o,i) { 
								let nme = name+i; return [
									<input 	key={nme} ref='field' {...attr} value={o.value} 
											{...(kind=='checkbox'?{name:nme}:{})} />,
									<label htmlFor={nme}>{o.label}</label>
							]	}); break;;
						case 'select': 
							field = [<br key='breaker'/>,
								<select key={name} ref='field' {...attr} defaultValue="">
									{[<option key={name+0} ref='field' value="">---</option>]
										.concat(kind.opts.map(function (o,i) { return (
											<option key={name+i+1} ref='field' value={o.value}>
												{o.label}
											</option>
										)	}))}
								</select>
							]; break;;
						case 'textarea':
							field = (<textarea key={name} ref='field' rows="1" {...attr} />);
							break;;
						default: 
							field = (<input key={name} ref='field' {...attr} />);
					}
					return (
						<div key={name} className={flexC} data-index={props.index}>
							<div className='lbl pair'>
								<label id={fid+'-L'} htmlFor={name}>{name}</label>
							</div>
							<div className='npt pair' data-priority={reqrd}>{field}</div>
							<div className='help'>
								<div className="hidden">
									<table>
										<tbody>
											<tr id="description">
												{isPrm?(<td className="doc"><div>Description</div></td>):null}
												<td className="doc">
													<blockquote className='block doc'>
														<p>{this.toMono(props.description)}</p>
													</blockquote>
												</td>
											</tr>
											<tr id="type">
												{isPrm?(<td className="doc"><div>Type</div></td>):null}
												<td className="doc">
													<blockquote className='block doc'>
														<p>{this.fmtType(type)}</p>
													</blockquote>
												</td>
											</tr>
											{!!!match.length ? null : (<tr className="matches">
												{isPrm?(<td className="doc"><div>Matches</div></td>):null}
												<td className="doc">
													<blockquote className='block doc'>
														<Table.List {...{data:match}} />
													</blockquote>
												</td>
											</tr>)}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					);
				}
			};
			EX.Draft.Case 		= class Case	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'PAGES.CASE';
				}

				render() {
					var THS 	= this, cnt = -1,
						props 	= this.props,
						point 	= props.point,
						href 	= "javascript:void(0);",
						frmCls 	= classN({
							'paramForm': true,
							'selected': !!props.selected
						}),
						data 	= { data: [{key:'Request',val:'Result'}].concat(
							Imm.Map(props.items).map((v,k) => {
							var sck = SOCKET({ link: k });
							var prp = COMPS.onSocket({
									value: sck, master: point,
									id:    cnt, path:   ['payload','result']
								}); prp.query.kind = 'ext';
							// console.log(prp)
							cnt++; return {
								key: (<SocketLink {...prp} />),
								val: v
							};
						}).toArray()) };
					return (
						<div className="examples">
							<header><h2>Examples</h2></header>
							<Table.List key='cases' {...data} />
						</div>
					);
				}
			};

		// SEARCH //////////////////////////////////////////////////////////
			EX.Search 			= class Search	 extends Mix('Pure',  'Static','Forms') {
				constructor(props) {
					super(props)
					this.name = 'SEARCH';
				}

				render() {
					var props 	= this.props,
						body 	= props.body,
						fills 	= body.fills,
						point 	= '/'+props.paths.join('/').toLowerCase(),
						params 	= Imm.Map(body.params).filter(function (v,k) { return v.to == 'param' }),
						querys 	= Imm.Map(body.params).filter(function (v,k) { return v.to == 'query' }),
						qryCnt 	= 0, prmCnt = 0,
						lister  = { id: Stores.Data.setPath(props.id), content: body.list },
						frmCls 	= classN({ selected: props.selected }, 'draft'),
						formPrp = {
							className: 		frmCls,
							action: 		'',
							onSubmit: 		this.hndRequest,
							id: 			props.id,
							name: 			props.name,
							method: 		props.method.toLowerCase(),
							'data-point': 	point,
							'data-page': 	props.page,
						};
					return (
						<form {...formPrp}>
							<div className="head">
								<h1>{props.paths.map(function (v, i) {
										var key = v+'.'+i;
										return <span key={key} className="route">{v}</span>;
									})}
								</h1>
							</div>
							<div className='body'>
								<div>
									<div className='fields'>
										{this.toSingle(params)}
										{this.toDouble(querys)}
									</div>
									<Search.List {...lister} key="list" />
								</div>
							</div>
							<div className="foot" id="submit">
								<div></div>
							</div>
						</form>
					);
				}
			};
			EX.Search.List 		= class List	 extends Mix('Reflux','Dynamic','Receivers') {
				constructor(props) {
					super(props)
					this.name = 'SEARCH.LIST';
				}

				componentDidUpdate() { Actions.App.progress(100); }
				render() {
					var props 	= this.state, contn = [], final = [], lists = {}, status, brands;
					try {
						props.content.map((v,k,i) => {
							var br = v.value.brand.value,
								nm = v.value.name.value,
								st = v.value.status.value,
								el = (<li key={k+'.'+i}>{nm}</li>);
							// -----
							!!!lists[st] 	 && (lists[st] 	   = {});
							!!!lists[st][br] && (lists[st][br] = []);
							lists[st][br].push({ key: k+'.'+i, name: nm });
							// -----
							return el;
						});
						contn = Imm.Map(lists).map((sv,sk,si) => {
							return (<li key={sk+'.'+si}>
								<h3>{sk}</h3>
								<ul>{Imm.Map(sv)
										.sortBy((bv,bk,bi) => bk)
										.map((bv,bk,bi) => {
									return (<li key={bk+'.'+bi}>
										<h4>{bk}</h4>
										<ul>{Imm.List(bv)
												.sortBy((cv,ci) => cv.name)
												.map((cv,ci) => (<li key={cv.key}>{cv.name}</li>))
												.toArray()
										}</ul>
									</li>);
								}).toArray()}</ul>
							</li>);
						}).toArray();
					} catch (e) { contn = []; }
					console.log('\tLISTS:', lists)
					console.log('\tFINAL:', final)
					return (
						<div id={props.id} className="searchList">
							<ul>{contn}</ul>
						</div>
					)
				}
			};

		// TABLE ///////////////////////////////////////////////////////////
			EX.Table 			= class Table	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'TABLE';
				}

				render() {
					var data = Imm.Map(this.props||{});
					return (
						<div className='tblLst' >{
							data.map(function (v,k) {
								var ky = k.replace(/(\s+)/g, '');
								return (<div key={ky}>
									<div>{k}</div>
									<div>{v}</div>
								</div>);
							}).toArray()
						}</div>
					);
				}
			};
			EX.Table.List 		= class List	 extends Mix('Pure',  'Static','MonoSpacer') {
				constructor(props) {
					super(props)
					this.name = 'TABLE.LIST';
				}

				render() {
					return (
						<div className='tblLst'>{
							(this.props.data||[]).map((v,i) => {
								return (
									<div key={i}>
										<div>{v.key}</div>
										<div>{this.toMono(v.val)}</div>
									</div>
								);
							})
						}</div>
					);
				}
			};


		// FOOT ////////////////////////////////////////////////////////////
			EX.Foot 			= class Foot	 extends Mix('Pure',  'Static') {
				constructor(props) {
					super(props)
					this.name = 'FOOT';
				}

				render() {
					var props 	= this.props,
						crdts	= props.credits,
						chats	= props.chats.reverse(),
						optns 	= Imm.fromJS({opts:['lite','small']});
					return (
						<footer id='footer' className="noSelect gridItemFooter gridFooter">
							<section id="credits" className='gridItemCopyright'>
								<p>
									<span id='copyright'>{new Date().getFullYear()}</span>
									<span id='author'>
										<a key='author' href={'mailto:'+crdts.contact} target='_blank'>
											{crdts.author}
										</a>
									</span>
									<span id='company'>
										<a key='company' href={'http://'+crdts.website} target='_blank'>
											{crdts.company}
										</a>
									</span>
								</p>
							</section>
							<section id="chatter" className='gridItemThreads'>
								<Bubble {...optns.mergeDeep(Imm.fromJS({kind:'more',opts:['dark']})).toJS()} />
								{chats.map((b,i)=><Bubble key={`chat${i}`} style={{gridColumn:i+2}} 
													{...optns.mergeDeep(Imm.fromJS(b)).toJS()}/>)}
								<Bubble {...optns.mergeDeep(Imm.fromJS({kind: 'add',opts:['dark']})).toJS()} />
							</section>
						</footer>
					);
				}
			};

		// EXPORTS /////////////////////////////////////////////////////////
			
			const {
				Load, Navi, Stat, Head, Body, SideBar, 
				Pages, Draft, Search, Table, Foot
			} = EX;

			COMPS.Elements.Explorer = EX;

};
