/*
ExpressJS for volebo.net

Copyright (C) 2016	Volebo.Net <volebo.net@gmail.com>
Copyright (C) 2016	Koryukov Maksim <maxkoryukov@gmail.com>

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

const debug           = require('debug')('volebo:express');
const express         = require('express');
const http            = require('http');

const Config          = require('./lib/config');
const createServer    = require('./lib/server');

let deprecated_error_die = function(done, msg) {
	var e = new Error(msg);

	done(e);
}

/*
====================================
EXPORT
====================================
*/

let vbexp = function(options) {

	let app = /* TODO: use new */ createServer(options);

	app.start = function app_start(done)
	{
		if (!done) {
			done = function(err) {
				if (err) {
					throw err;
				}
			}
		}
		// append error handlers:
		app.onStarting();

		// Get port from environment and store in Express.
		let port = app.config.server.port;
		let host = app.config.server.host;

		// Create HTTP server.
		let server = http.createServer(app);

		/**
		 * Event listener for HTTP server "listening" event.
		 */
		let onListening = function onListening() {
			var addr = server.address();
			var bind = typeof addr === 'string'
				? 'pipe ' + addr
				: 'port ' + addr.port;
			debug('Listening on ' + bind);

			done();
		}

		let onError = function onError(error) {

			// TODO : #2 handle errors and write to the error log!!

			if (error.syscall !== 'listen') {
				throw error;
			}

			var bind = typeof port === 'string'
				? 'Pipe ' + port
				: 'Port ' + port;

			// handle specific listen errors with friendly messages
			switch (error.code) {
			case 'EACCES':
				deprecated_error_die(done, bind + ' requires elevated privileges');
				break;
			case 'EADDRINUSE':
				deprecated_error_die(done, bind + ' is already in use');
				break;
			default:
				return done(error);
			}
		}

		server.on('error', onError);
		server.on('listening', onListening);

		// Listen on provided port, on all network interfaces.
		let instance = server.listen(port, host /* , TODO: CALLBACK */);
		app.close = function() {
			return instance.close.apply(instance, arguments);
		};

		return;
	}

	return app;
}

vbexp.Router = function vbexp_Router() {
	return express.Router.apply(express, arguments);
}

vbexp.Config = Config;

exports = module.exports = vbexp;
