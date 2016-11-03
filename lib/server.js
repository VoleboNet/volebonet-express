/*
ExpressJS for volebo.net

Copyright (C) 2016  Volebo.Net <volebo.net@gmail.com>
Copyright (C) 2016  Koryukov Maksim <maxkoryukov@gmail.com>

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
const logger          = require('morgan');
//const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const handlebars      = require('express-handlebars');

const session         = require('express-session');
const langGen         = require('express-mw-lang');
const _               = require('lodash');

const moment          = require('moment');
const passport        = require('passport');

// Loading polyfill for intl
// required, as soon we want to use several locales (not only EN)
if (global.Intl) {
	var IntlPolyfill = require('intl');
	Intl.NumberFormat   = IntlPolyfill.NumberFormat;
	Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
} else {
	global.Intl = require('intl');
}
const handlebarsIntl  = require('handlebars-intl');


const Config          = require('./config');

debug('initializing');

let main = function main(serverConfig) {
	var app = express();

	/*
	========================================================
	CONFIG

	Custom config, allows to put dirty crutches
	without breaking core settings of the express
	========================================================
	*/
	app.config = new Config(serverConfig);

	// TODO : fix #2 determine what to do with winston-logger
	app.use(logger('dev'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	// TODO: is this required?
	//app.use(cookieParser());

	/*
	========================================================
	STATIC
	========================================================
	*/

	if (app.config.debug && app.config.debug.staticPath) {
		//let spath = path.join(__dirname, app.config.debug.staticPath);
		let spath = app.config.debug.staticPath;

		debug('Use static path', spath);
		app.use(express.static(spath));
	}

	/*
	========================================================
	HTTP->HTTPS redirect (working behind NGINX)
	========================================================
	*/
	app.use((req, res, next) => {
		req.forwardedSecure = _.lowerCase(req.headers["x-forwarded-proto"]) === "https";
		next();
	});

	/*
	========================================================
	SESSIONS
	========================================================
	*/

	// TODO : #12 review session settings
	if (app.config.session && app.config.session.enabled) {
		var session_config = {
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
			session_config.cookie.domain = app.config.session.domain.length.join(',');
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
		onLangCodeReady: function(lang_code, req, res) {

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
		layoutsDir: path.join(__dirname, '..', 'views/layouts/'),
		partialsDir: path.join(__dirname, '..', 'views/partials/'),		// TODO : #13 use NAMESPACES
		defaultLayout: 'default',
		helpers: {},	// TODO : volebo/meta.dev#3 remove this: require('./views/helpers'),
		extname: '.hbs'
	});
	app.hbs = hbs;

	handlebarsIntl.registerWith(hbs.handlebars);

	app.engine('hbs', hbs.engine);
	app.set('view engine', 'hbs');

	app.onStarting = function() {
		/*
		====================================
		NOT FOUND HANDLER
		catch 404 and forward to error handler
		====================================
		*/
		app.use(function(req, res, next) {
			// TODO : pass required info to the error, such as URL, params...
			var err = new Error('Not Found');
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

		if (app.config.debug && app.config.debug.renderStack) {

			// development error handler
			// will print stacktrace
			app.use(function global_error_dev(err, req, res, next) {
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
			app.use(function global_error(err, req, res, next) {
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
