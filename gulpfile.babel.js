
'use strict';

// ----------------------------------------------------------------------------------------------
// Handle Configurations ------------------------------------------------------------------------

	// Requires ---------------------------------------------------------------------------------

		/**
		 * @type {('development'|'production')}
		 */
		process.env.NODE_ENV = 'development';

		function isDev() {
			return process.env.NODE_ENV == 'development';
		}
		function isPro() {
			return process.env.NODE_ENV == 'production';
		}

	// Requires ---------------------------------------------------------------------------------

		const os 		 = require('os');
		const fs 		 = require('fs');
		const path 		 = require('path');
		const exec 		 = require('child_process').exec;
		const gulp 		 = require('gulp');

		let Assign, nodemon, babel, cssmin, rename, less, source,
			browserify, watchify, map, redis;

	// Variables --------------------------------------------------------------------------------

		const 	JSNS 	 = (obj) => (JSON.stringify(obj, null, '    '));
		const 	LOG 	 = console.log;
		const 	SERIES 	 = gulp.series;
		const 	PARALLEL = gulp.parallel;
		const 	WATCH 	 = (name, source, tasks) => {
			return (done) => {
				gulp.watch(source, PARALLEL(...tasks))
					.on(  'change', (e) => { LOG(`${name} Change  |`, e); })
					.on(   'error', (e) => { LOG(`${name} Error   |`, e); })
					.on( 'nomatch', (e) => { LOG(`${name} NoMatch |`, e); });
				done();
			};
		};

		let 	crashes = null;

	// Configs ----------------------------------------------------------------------------------

		const 	cfgfld	= './config';
		const 	pubFld 	= './public';
		const 	brwFld 	= './main/browser';
		const   brwexs  = !!fs.existsSync(brwFld);
		const 	libFld 	= `${brwFld}/lib`;
		const 	opsys 	= { linux: 'nix', darwin: 'nix', win32: 'win' }[os.platform()];
		const 	frwk 	= {
					folders: [ `./node_modules/dffrnt.*` ],
					options: { cwd: `./` },
					location: `./framework`
				};
		const 	spce 	= {
					folder:   `${libFld}/spaces/lib`,
					options:  { cwd: `./` },
					location: `./spaces`
				};
		const 	conf 	= {
					files: [ `./node_modules/dffrnt.confs/lib/*.cfg.js` ],
					options: { cwd: `./` },
					location: cfgfld
				};
		const 	browReq	= [
					'harmony-reflect',
					'object-assign',
					'immutable',
					// 'immutablediff',
					// 'password-generator',
					'classnames',
					'socket.io-client',
					'reflux',
					'react',
					'react-dom',
					'react-stripe-elements',
				];
		const 	browExl	= [
					'./lib/iso',
					// '../../spaces',
				];
		const 	brow 	= {
					options:  	{
						cache: {},
						packageCache: {},
						fullPaths: false,
						debug: isDev(),
					},
					entries: [
						{
							source: 	'vendor.js',
							require:	browReq,
						},
						{
							source: 	'engine.js',
							entries: 	[ `${brwFld}/main.js` ],
							external:	browReq.concat(browExl),
							exclude: 	[
								// `${libFld}/src/renders/lib/iso.jsx`,
								// `${libFld}/spaces/lib/*.js`,
							],
						},
					],
					mini:  {
						uglify: {
							global: true,
							mangle: isPro(),
							compress: {
								sequences: true,
								dead_code: true,
								unused: true,
								conditionals: true,
								booleans: true,
								if_return: true,
								join_vars: true,
								warnings: isDev(),
								// passes: 5,
							}
					} 	},
					location: 	`${pubFld}/js`,
				};
		const 	jsx 	= {
					source: `${brwFld}/src/**/*.jsx`,
					location:  libFld,
					presets:  ['react','env']
				};
		const 	es6 	= {
					source: `${brwFld}/src/es6/*.js`,
					location:  jsx.location,
					presets:   jsx.presets
				};
		const 	style 	= {
					css: 	{ src: [
						`${pubFld}/css/*.css`,
						`!${pubFld}/css/*.min.css`
					]	},
					less: 	{ src: `${pubFld}/less/*.less` },
					min: 	{
						showLog: true, compatibility: 'ie8',
						keepSpecialComments: 0, roundingPrecision: -1
					},
					location: `${pubFld}/css`
				};
		const 	redfl 	= {
					cwd: '../REDIS',
					cmd: 'redis-server',
					cfg: 'redis.conf'
				};
		const 	rds 	= {
					nix: {
						proc: redfl.cmd,
						conf: redfl.cfg,
						kill: `ps -ef|grep ${redfl.cmd.replace(/^r/,'[r]')}|awk '{print $2}'|xargs kill -9`,
					},
					win: {
						proc: path.join('win',`${redfl.cmd}.exe`),
						conf: path.join(redfl.cfg),
						kill: `for /f "tokens=2" %i in ('tasklist ^| find "${redfl.cmd}.exe"') do (taskkill /PID %i /F)`,
					}
				}[opsys];

		function Ready() { try {
			Assign 		 = require('object-assign');
			nodemon 	 = require('gulp-nodemon');
			babel 		 = require('gulp-babel');
			cssmin 		 = require('gulp-cssmin');
			rename 		 = require("gulp-rename");
			less 		 = require('gulp-less');
			source 		 = require('vinyl-source-stream');
			browserify 	 = require('browserify');
			watchify 	 = require('watchify');
			map 		 = require('map-stream');
			redis 		 = require('redis');
		} catch (e) {
			console.log('\n[ ERROR ]:', e, '\n');
		};	}; Ready();

// ----------------------------------------------------------------------------------------------
// Handle Bundle Gulp ---------------------------------------------------------------------------

	// Configs ----------------------------------------------------------------------------------

		// Initialize Framework Directory; if necessary
			gulp.task( 'framework', (end) => {
				let loc = frwk.location, fld, len = 0, cnt = [];
				// ------------------------------------------------------------------------------
				function Count(path) { 
					return fs.readdirSync(path).filter(f=>!!!f.match(/^\./)).length;;
				}
				function Traverse(file, location, end, level = 1) {
					level++; 
					let len = 0, idx = 0, cnt = [],
						TAB = new Array(level).join('    '), 
						{ path: full, basename: dir } = file, 
						lnk = `${location}/${dir}`;
					len = Count(full);
					gulp.src(`${full}/*`, { nosort: true })
						.pipe(map((item, done) => {
							let fini=()=>(cnt.push(0),done(null,item),cnt.length==len&&end()),
								{ path: pth, basename: base } = item,
								  stat = fs.statSync(pth),
								  absl = `${lnk}/${base}`,
								  exst = fs.existsSync(absl); 
								  idx++;
							// ---
							if (stat.isDirectory()) {
								LOG(`${TAB}+ (${idx}/${len}) ${dir}/${base}/`);
								!exst && fs.mkdirSync(absl);
								Traverse(item, lnk, fini, level);
							} else if (!exst) {
								LOG(`${TAB}- (${idx}/${len}) ${dir}/${base}`);
								LOG(`fs.symlinkSync('${pth}', '${absl}');`)
								fs.symlinkSync(pth, absl);
								// gulp.src(pth).pipe(gulp.symlink(full));
								fini();
							} else fini();
						}));
				};
				// ------------------------------------------------------------------------------
				if (!fs.existsSync(loc)) fs.mkdirSync(loc), LOG(`Created Framework Directory.`);
				// ------------------------------------------------------------------------------
				gulp.src(frwk.folders, frwk.options)
					.pipe(map((file, done) => (
						cnt.push(0),setTimeout(
							()=>done(null,file),500)
					)))
					.pipe(map((file, done) => {
						let fini=()=>(cnt.shift(),done(null,file),cnt.length==0&&end()),
							nme  = file.basename, full = `${loc}/${nme}`, exst = fs.existsSync(full),
							lnkd = exst?fs.lstatSync(full).isSymbolicLink():false,
							floc = path.resolve(loc);
						// ----------------------------------------------------------------
						LOG(`Linking Module, [${nme}/], to ${loc} ...`);
						lnkd && fs.unlinkSync(full);
						exst || fs.mkdirSync(full);
						Traverse(file, floc, fini);
					}));
			});

		// Initialize Spaces Directory; if necessary
			gulp.task( 'spaces', (done) => {
				if (!!!brwexs) { done(); return; }
				let loc = spce.location, pth = spce.folder;
				if (!fs.existsSync(loc)) {
					gulp.src(pth).pipe(gulp.symlink(loc));
					LOG(`Created Spaces Directory.`);
				};	done();
			});

		// Initialize Configs; if necessary
			gulp.task( 'config', (done) => {
				let max = 0, fld = conf.location;
				if (!fs.existsSync(fld)) fs.mkdirSync(fld), LOG(`Created Config Directory.`);
				gulp.src(conf.files, conf.options)
					.pipe(map((file, done) => {
						let len = file.basename.length;
						max = (len>max?len:max); done(null, file);
					}))
					.pipe(map((file, done) => {
						let nme = file.basename;
						if (!fs.existsSync(`${fld}/${nme}`)) {
							LOG(`Copied default, [${nme.padStart(max)}], to ${fld} ...`);
							gulp.src(file.path).pipe(gulp.dest(fld));
						}; 	done(null, file);
					})); 	done();
			});

		gulp.task( 'init', SERIES('framework','config','spaces'));

		// Install NPM Packages
			gulp.task(  'npm', (done) => {
				exec('npm install', (err, stdo, stde) => {
					if (!!err) LOG(`NPM.ERR: ${JSNS(err)}`);
					else LOG(stdo||stde);
					Ready(); done();
				});
			});

		// Install Bower Components
			gulp.task( 'bower', (done) => {
				if (!!!brwexs) { done(); return; }
				exec('bower --allow-root install', (err, stdo, stde) => {
					if (!!err) LOG(`Bower.ERR: ${JSNS(err)}`);
					else LOG(stdo||stde);
					done();
				});
			});

		gulp.task('setup', SERIES('npm','bower','init'));

	// Convert ----------------------------------------------------------------------------------
	
			console.log({ isDev: isDev(), isPro: isPro() })

		//  ES6 to ES5 Conversion/Watch
			gulp.task('es6-make',	(done) => {
				gulp.src(es6.source)
					.pipe( babel({ presets: es6.presets, /* compact: true, */ comments: false }))
					.on( 'error', (e) => { LOG('>>> ERROR', e); this.emit('end'); })
					.pipe(gulp.dest(es6.location));
				done();
			});
			gulp.task('es6-watch',	WATCH( 'ES6', es6.source, ['es6-make']));
			gulp.task('es6', 		PARALLEL('es6-make','es6-watch'));

		//  JSX to  JS Conversion/Watch
			gulp.task('jsx-make',	(done) => {
				gulp.src(jsx.source)
					.pipe( babel({ presets: jsx.presets, /* compact: true, */ comments: false }))
					.on( 'error', (e) => { LOG('>>> ERROR', e); this.emit('end'); })
					.pipe(gulp.dest(jsx.location));
				done();
			});
			gulp.task('jsx-watch',	WATCH( 'JSX', jsx.source, ['jsx-make']));
			gulp.task('jsx', 		PARALLEL('jsx-make','jsx-watch'));

		// Browserify Concatenation
			gulp.task( 'brow', (done) => {
				let args = process.argv.slice(2), C = 0,
					verb = (args.slice(-1)[0]||'')=='--verbose';

				function getBundle(entry) {
					let BUND = new browserify(Assign({}, {
							entries: entry.entries,
						},	brow.options)),
						SMAP = `${entry.source}.map`,
						MINI = Assign({}, isDev() ? { 
							map: `${pubFld.slice(1)}/js/${SMAP}`, 
							output: `${pubFld}/js/${SMAP}`, 
						} : {},{
							compressPath: p => (path.relative(`${__dirname}/..`, p)) 
						}, 	brow.mini);

					function doBundle() {
						LOG(`BUNDLE: ${entry.source} to ${brow.location} ...`);
						BUND.bundle()
							.pipe(source(entry.source))
							// .pipe( babel({ presets: ['env'], compact: false }))
							.pipe(gulp.dest(brow.location));
						return BUND;
					};

					if (!!entry.require ) BUND.require( entry.require );
					if (!!entry.external) BUND.external(entry.external);
					if (!!entry.exclude ) BUND.exclude( entry.exclude );

					BUND.on('update', doBundle)
						.plugin('watchify', { delay: 100, ignoreWatch: ['**/node_modules/**'] })
						.plugin('minifyify', MINI)
						.on('log', msg => { LOG(`BUNDLE: ${msg}`); done() });

					if (verb) BUND.on('file', (f,i)=>{ C++; LOG(`FILE ${C}: ${f} | ${i}`); });

					doBundle();
				}

				brow.entries.map(getBundle);
			});

		gulp.task('bundle', SERIES('es6', 'jsx', 'brow'));

		// LESS to CSS Conversion/Watch
			gulp.task('css-make',	(done) => {
				gulp.src(style.less.src)
					.pipe(less())
					.pipe(gulp.dest(style.location));
				done();
			});
			gulp.task('css-minify',	(done) => {
				gulp.src(style.css.src)
					// .pipe(sourcemaps.init({ debug: true }))
					.pipe(cssmin(style.min))
					.pipe(rename({ suffix: '.min' }))
					// .pipe(sourcemaps.write({ debug: true }))
					.pipe(gulp.dest(style.location));
				done();
			});
			gulp.task('css-conv', 	SERIES('css-make','css-minify'));
			gulp.task('css-watch',	WATCH('LESS', style.css.src, ['css-conv']));
			gulp.task('css', 		SERIES('css-conv','css-watch'));


		gulp.task('convert', PARALLEL('bundle', 'css'));

	// System -----------------------------------------------------------------------------------

		// REDIS Server Init
			gulp.task('redis', (done) => {
				let RED = redis.createClient();
				RED.on('error', (err) => {
					switch (err.code) {
						// If it failed due to REDIS not running
						case 'ECONNREFUSED':
							exec([`cd ${redfl.cwd} &&`,rds.proc,rds.conf].join(' '), {
								cwd: path.normalize(redfl.cwd)
							}, (err, stdo, stde) => {
								if (!!err) LOG(`REDIS.ERR: ${JSNS(err)}`);
								else LOG(`REDIS.STD: ${JSNS({OUT:stdo,ERR:stde})}`);
							});
						// Not an issue, just need to know if it's UP
						case 'NOAUTH': done(); break;
						// Otherwise, log output; halt execution
						default: LOG(JSNS(err));
					}
				});
				RED.on('ready', () => { LOG('REDIS is running'); done(); });
			});

		// Daemonized Startup
			gulp.task('demon', (done) => {
				let nmon = nodemon({ execMap: {
								js: 'node --harmony',
								tasks: ['demon'],
							}})
							.on('crash', () => {
								try { LOG('Crashed ~ !!');
									if ((new Date() - crashes) > 5000) {
										nmon.emit('restart', 1);
									}
								} catch (e) { LOG(e); }
							})
							.on('restart', () => { LOG('Restarted ~ !!'); });
				crashes = new Date(); nmon; done();
			});

		gulp.task( 'system', SERIES('redis', 'demon'));

	// StartUp ----------------------------------------------------------------------------------

		switch (true) {
			case !!!brwexs:
				gulp.task('main', SERIES('init','system'));
				break;;
			default:
				gulp.task('main', SERIES('init','convert','system'));
				break;;
		}
		gulp.task('default', SERIES('main'));

// ----------------------------------------------------------------------------------------------
