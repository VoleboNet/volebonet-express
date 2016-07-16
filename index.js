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

require('dotenv').config({silent: true});

const debug = require('debug')('volebo:express');
const http  = require('http');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

let deprecated_error_die = function(msg) {
	throw new Error(msg);
	//process.exit(1);
}

/*
====================================
EXPORT
====================================
*/

let vbexp = function() {

	let app = require('./lib/app');
	let server = undefined;
	app.start = function app_start()
	{
		// Get port from environment and store in Express.
		var port = normalizePort(process.env.PORT || '3000');
		app.set('port', port);

		// NOT FOUND HANDLER
		// TODO : move to app.js:
		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
		});


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
		server = http.createServer(app);

		server.on('error', onError);
		server.on('listening', onListening);

		// Listen on provided port, on all network interfaces.
		let x = server.listen(port);
		app.close = function() {
			return x.close.apply(x, arguments);
		};

	}

	return app;
}

exports = module.exports = vbexp;
