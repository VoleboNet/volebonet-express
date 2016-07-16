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

require('dotenv').config({silent: true});

const debug           = require('debug')('volebo:express:app');
const express         = require('express');
const path            = require('path');
const logger          = require('morgan');
//const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const handlebars      = require('express-handlebars');
const session         = require('express-session');

debug('initializing');

var app = express();

/*
========================================================
CONFIG

Custom config, allows to put dirty crutches
without breaking core settings of the express
========================================================
*/
app.config = require('./config');

/*
========================================================
view engine setup
========================================================
*/
let hbs  = handlebars.create({
	layoutsDir: 'views/layouts/',
	partialsDir: 'views/partials/',
	defaultLayout: 'main',
	//helpers: require('./views/helpers'),
	extname: '.hbs'
});
app.hbs = hbs;

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// TODO : determine what to do with winston-logger
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
var routes = require('./routes/index');
app.use('/', routes);
app.use('/users', users);
*/


/*
====================================
ERROR HANDLERS
====================================
*/

// development error handler
// will print stacktrace
if (app.config && app.config.debug && app.config.debug.renderStack) {
	app.use(function global_error_dev(err, req, res, next) {
		res.status(err.status || 500);
		return res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function global_error(err, req, res, next) {
	res.status(err.status || 500);
	return res.render('error', {
		message: err.message,
		error: {}
	});
});

exports = module.exports = app;
