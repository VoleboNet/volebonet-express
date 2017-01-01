/*
ExpressJS for volebo.net

Copyright (C) 2016-2017 Volebo <dev@volebo.net>
Copyright (C) 2016-2017 Koryukov Maksim <maxkoryukov@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

const path            = require('path');

const debug           = require('debug')('volebo:express:server');
const express         = require('express');
// #2
//const logger          = require('express-bunyan-logger');
const logger          = require('morgan');

const bodyParser      = require('body-parser');
const handlebars      = require('express-handlebars');

const session         = require('express-session');
const langGen         = require('express-mw-lang');
const _               = require('lodash');

const moment          = require('moment');
const passport        = require('passport');

const helmet          = require('helmet')

// Loading polyfill for intl
// required, as soon we want to use several locales (not only EN)
if (global.Intl) {
	const IntlPolyfill = require('intl');
	Intl.NumberFormat   = IntlPolyfill.NumberFormat;
	Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
} else {
	global.Intl = require('intl');
}

// TODO : #17 replace with custom set of handlers!
// BUG: #17
const handlebarsIntl  = require('handlebars-intl');

const [nodeEnv, isProduction] = require('./getnodeenv')();
debug('NODE_ENV', nodeEnv);

const Config          = require('./config');

debug('initializing');


let main = function main(serverConfig) {
	let app = express();

	// securing with HTTP-headers
	app.use(helmet());
	app.set('env', nodeEnv);

	/*
	========================================================
	CONFIG

	Custom config, allows to put dirty crutches
	without breaking core settings of the express
	========================================================
	*/
	app.config = new Config(serverConfig);

	// TODO : fix #2 determine what to do with winston-logger
	// app.use(logger('dev'));
	app.use(logger('common'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	app.set('trust proxy', app.config.proxy.list);

	/*
	========================================================
	STATIC
	========================================================
	*/

	if (_.get(app.config, 'debug.staticPath') && !isProduction) {
		//let staticPath = path.join(__dirname, app.config.debug.staticPath);
		let staticPath = app.config.debug.staticPath;

		debug('Use static path', staticPath);
		app.use(express.static(staticPath));
	}


	/*
	========================================================
	JSON
	========================================================
	*/
	if (app.config.debug && !isProduction) {
		app.set('json spaces', 4);
	}

	/*
	========================================================
	HTTP->HTTPS redirect (working behind NGINX)
	========================================================
	*/
	app.use((req, _unused_res, next) => {
		req.forwardedSecure = _.lowerCase(req.headers["x-forwarded-proto"]) === "https";
		next();
	});

	/*
	========================================================
	SESSIONS
	========================================================
	*/

	if (app.config.session && app.config.session.enabled) {
		let session_config = {
			name: app.config.session.name || 'sessionId',
			secret: app.config.session.secret,
			resave: false,
			saveUninitialized: false,

			// DOC: https://www.npmjs.com/package/express-session#cookie
			cookie: {
				//expires
				maxAge: 1000*60*30, // ms, 30 minutes now
				httpOnly: true,

				secure : app.config.session.secure,
			},
			/*genid: function(req) { return genuuid() // use UUIDs for session IDs  },*/
		};

		if (app.config.session.domain.length > 0) {
			session_config.cookie.domain = app.config.session.domain.join(',');
		}

		app.use(session(session_config));
	}

	/*
	========================================================
	PASSPORT
	========================================================
	*/

	if (app.config.auth.enabled) {
		app.use(passport.initialize());
		if (app.config.auth.session){
			app.use(passport.session());
		}

		passport.serializeUser(function(user, done) {
			debug('serializing', user);
			done(null, user);
		});

		passport.deserializeUser(function(obj, done) {
			debug('deserializing', obj);
			done(null, obj);
		});
	}

	/*
	========================================================
	Handler for lang detection and other stuff..
	========================================================
	*/

	let langmw = langGen({
		defaultLanguage: 'en',
		availableLanguages: ['en', 'ru', 'zh'],
		onLangCodeReady: function(lang_code, _unused_req, res) {

			moment.locale(lang_code);

			// REF #6: We could use `defaultOptions`, attached to the
			// `res` object. This approach could make the code
			// more readable.
			// See also: _renderTemplate hook
			// https://github.com/ericf/express-handlebars#_rendertemplatetemplate-context-options

			if (!res._renderOriginal) {
				res._renderOriginal = res.render;
			}
			res.render = function overloadedRender(){

				let nargs = Array.prototype.slice.call(arguments);
				let opt = nargs[1];

				if (_.isNil(opt)) {
					opt = {};
				}

				if (res.helpers) {
					debug('Going to append per-request HBS helpers');

					// check, whether some helpers are already attached:
					if(opt.helpers) {
						_.assign(opt.helpers, res.helpers);
					} else {
						_.set(opt, 'helpers', res.helpers);
					}
				}

				// set locale for HBS-intl formatter (format dates, numbers and messages)
				_.set(opt, 'data.intl.locales', lang_code);

				nargs[1] = opt;
				return res._renderOriginal.apply(this, nargs);
			}
		}
	});
	app.lang = langmw;
	langmw.esu(app);

	/*
	========================================================
	VIEW ENGINE SETUP
	========================================================
	*/
	let hbs  = handlebars.create({
		layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
		partialsDir: path.join(__dirname, '..', 'views', 'partials'),		// TODO : #13 use NAMESPACES
		defaultLayout: 'default',
		helpers: require('./helpers').helpers,	// TODO : #17 remove this: require('./views/helpers'),
		extname: '.hbs'
	});
	app.hbs = hbs;

	handlebarsIntl.registerWith(hbs.handlebars);

	app.engine('hbs', hbs.engine);
	app.set('view engine', 'hbs');

	/*
	========================================================
	AUTOLOAD MODEL
	========================================================
	*/
	if (app.config.model.enabled) {
		// require here.
		// add VOLEBO-DATA dependency only when it is required
		const Model = require('volebo-data');
		app.model = new Model(app.config.model);
	}

	app._onStarting = function() {
		/*
		====================================
		NOT FOUND HANDLER
		catch 404 and forward to error handler
		====================================
		*/
		app.use(function(_unused_req, _unused_res, next) {
			// TODO : pass required info to the error, such as URL, params...
			let err = new Error('Not Found');
			err.status = 404;

			next(err);
		});

		/*
		====================================
		ERROR HANDLERS
		TODO: fix #2 - robust error handler
		====================================
		*/

		let error_view_path = path.join(__dirname, '..', 'views', 'error.hbs');

		if (app.config.debug && app.config.debug.renderStack && !isProduction) {

			// development error handler
			// will print stacktrace
			app.use(function global_error_dev(err, _unused_req, res, next) {
				res.status(err.status || 500);
				return res.render(error_view_path, {
					message: err.message,
					error: err,
					status: err.status
				});
			});
		} else {

			// production error handler
			// no stacktraces leaked to user
			app.use(function global_error(err, _unused_req, res, next) {
				res.status(err.status || 500);
				return res.render(error_view_path, {
					message: err.message,
					error: {},
					status: err.status
				});
			});
		}
	}

	return app;
}

exports = module.exports = main;
