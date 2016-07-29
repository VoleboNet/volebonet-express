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

require('dotenv').config({ silent: true });

const debug           = require('debug')('volebonet:express:server');
const express         = require('express');
const path            = require('path');
const logger          = require('morgan');
//const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const handlebars      = require('express-handlebars');
const session         = require('express-session');
const langGen         = require('express-mw-lang');
const _               = require('lodash');
const moment          = require('moment');

debug('initializing');

var app = express();

/*
========================================================
CONFIG

Custom config, allows to put dirty crutches
without breaking core settings of the express
========================================================
*/
app.config = require('./config')();

/*
========================================================
VIEW ENGINE SETUP
========================================================
*/
let hbs  = handlebars.create({
	layoutsDir: 'views/layouts/',
	partialsDir: 'views/partials/',
	defaultLayout: 'default',
	helpers: {},	// TODO : remove this: require('./views/helpers'),
	extname: '.hbs'
});
app.hbs = hbs;

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// TODO : determine what to do with winston-logger
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

if (app.config && app.config.debug && app.config.debug.staticPath) {
	let spath = path.join(__dirname, app.config.debug.staticPath);
	app.use(express.static(spath));
}

/*
========================================================
SESSIONS
========================================================
*/

var session_config = {
	secret: app.config.cookie.secret,
	resave: false,
	saveUninitialized: false,

	// DOC: https://www.npmjs.com/package/express-session#cookie
	cookie: {
		//expires
		maxAge: 1000*60*30, // ms, 30 minutes now
		httpOnly: true,


		secure : app.config.cookie.secure,
	},
	/*genid: function(req) { return genuuid() // use UUIDs for session IDs  },*/
};

if (app.config.cookie.domain.length > 0) {
	session_config.cookie.domain = app.config.cookie.domain.length.join(',');
}

app.use(session(session_config));


/*
========================================================
HTTP->HTTPS redirect (working behind NGINX)
========================================================
*/
app.use((req, res, next) => {
	req.forwardedSecure = req.headers["x-forwarded-proto"] === "https";
	next();
});


/*
========================================================
Handler for lang detection and other stuff..
========================================================
*/
let langmw = langGen({
	defaultLanguage: 'en',
	availableLanguages: ['en', 'ru'],
	onLangCodeReady: function(lang_code, req, res) {

		// TODO: #6 - rewrite this callback...

		//i18n.setLocale(lang_code);

		//i18n.setLocale(req, lang_code);
		//i18n.setLocale(res, lang_code);

		let oldrender = res.render;
		res.render = function render(vn, opt){
			if (opt){
				if (_.isObject(opt)){
					_.set(opt, 'helpers.__', res.locals.__);
				} else {
					debug('WARNING', 'unable to setup translation helper: __ for an request:', req.originalUrl);
					//logger.warn('unable to setup translation helper: __ for an request:', req.originalUrl);
				}
			} else {
				opt = { helpers: { __ : res.locals.__ } };
			}

			arguments[1] = opt;
			return oldrender.apply(this, arguments);
		}

		moment.locale(lang_code);
	}
});
app.lang = langmw;

/*
var routes = require('./routes/index');
app.use('/', routes);
app.use('/users', users);
*/

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
	====================================
	*/

	let error_view_path = path.join(__dirname, '..', 'views', 'error.hbs');

	if (app.config && app.config.debug && app.config.debug.renderStack) {

		// development error handler
		// will print stacktrace
		app.use(function global_error_dev(err, req, res, next) {
			res.status(err.status || 500);
			return res.render(error_view_path, {
				message: err.message,
				error: err
			});
		});
	} else {

		// production error handler
		// no stacktraces leaked to user
		app.use(function global_error(err, req, res, next) {
			res.status(err.status || 500);
			return res.render(error_view_path, {
				message: err.message,
				error: {}
			});
		});
	}
}

exports = module.exports = app;
