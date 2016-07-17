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

const debug           = require('debug')('volebonet:express');
const express         = require('express');
const http            = require('http');

let deprecated_error_die = function(msg) {
	throw new Error(msg);
	//process.exit(1);
}

/*
====================================
EXPORT
====================================
*/

let vbexp = function(options) {

	// TODO: #3 implement `options` handling
	debug('SORRY, my friend, I will ignore passed config, I am too young ' +
		'to deal with it...');

	let app = require('./lib/server');

	app.start = function app_start()
	{
		// append error handlers:
		app.onStarting();

		// Get port from environment and store in Express.
		let port = app.config.server.port;
		let host = app.config.server.host;

		/**
		 * Event listener for HTTP server "listening" event.
		 */
		let onListening = function onListening() {
			var addr = server.address();
			var bind = typeof addr === 'string'
				? 'pipe ' + addr
				: 'port ' + addr.port;
			debug('Listening on ' + bind);
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
				deprecated_error_die(bind + ' requires elevated privileges');
				break;
			case 'EADDRINUSE':
				deprecated_error_die(bind + ' is already in use');
				break;
			default:
				throw error;
			}
		}

		// Create HTTP server.
		let server = http.createServer(app);

		server.on('error', onError);
		server.on('listening', onListening);

		// TODO : #4 add promise, or not to add...

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

exports = module.exports = vbexp;
