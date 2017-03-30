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

require('dotenv').config({ silent: true });

const debug           = require('debug')('volebo:express');
const fs              = require('fs');
const http            = require('http');
const express         = require('express');

const Config          = require('./src/config');
const createListener  = require('./src/server');

// TODO : #2 use LOGGER!!!
// BUG: #2
const log             = console;

const deprecated_error_die = function(done, msg) {
	const e = new Error(msg);
	done(e);
}

/*
====================================
EXPORT
====================================
*/

const vbexp = function(options) {

	const app = createListener(options);

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
		app._onStarting();

		// Get port from environment and store in Express.
		let host = app.config.server.host
		let port = app.config.server.port
		let localpath = app.config.server.path

		debug('host', host)
		debug('port', port)
		debug('localpath', localpath)

		const useLocalPath = !! localpath;

		if (useLocalPath) {
			debug('will listen on localpath');
			host = null;
			port = null;

			try {
				const stat = fs.statSync(localpath);
				if (stat.isSocket()) {
					debug('remove existing socket file', localpath);

					fs.unlinkSync(localpath);
				} else {
					deprecated_error_die(done, 'Can not start server, listening on NON-SOCKET file');
				}
			} catch (e) {
				if (e.code === 'ENOENT' && e.syscall==='stat') {
					// do nothing, localpath-file does not exist
				} else {
					throw e;
				}
			}
		} else {
			debug('will listen on host:port');
			localpath = null;
		}

		// Create HTTP server.
		const server = http.createServer(app);

		/**
		 * Event listener for HTTP server "listening" event.
		 */
		const onListening = function onListening() {
			const addr = server.address();
			const bind = typeof addr === 'string'
				? `pipe ${addr}`
				: `address ${addr.address} port ${addr.port}`;
			log.info('Listening on ' + bind);

			done();
		}

		const onError = function onError(error) {

			// TODO : #2 handle errors and write to the error log!!

			if (error.syscall !== 'listen') {
				throw error;
			}

			const bind = useLocalPath
				? 'Pipe ' + localpath
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
		if(useLocalPath) {
			server.listen(localpath)
		} else {
			server.listen(port, host)
		}

		app.close = function() {
			return server.close.apply(server, arguments);
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
