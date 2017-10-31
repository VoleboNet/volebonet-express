/*
################################################################################
#                                                                              #
# db    db  .8888.  dP     888888b 8888ba   .8888.     d8b   db 888888b d8888P #
# 88    88 d8'  `8b 88     88      88  `8b d8'  `8b    88V8  88 88        88   #
# Y8    8P 88    88 88    a88aaa   88aa8P' 88    88    88 V8 88 88aaa     88   #
# `8b  d8' 88    88 88     88      88  `8b 88    88    88  V888 88        88   #
#  `8bd8'  Y8.  .8P 88     88      88  .88 Y8.  .8P dP 88   V88 88        88   #
#    YP     `888P'  88888P 888888P 888888'  `888P'  88 VP    8P 888888P   dP   #
#                                                                              #
################################################################################

ExpressJS for volebo.net

Copyright (C) 2016-2017 Volebo <dev@volebo.net>
Copyright (C) 2016-2017 Maksim Koryukov <maxkoryukov@gmail.com>

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

'use strict'

const debug           = require('debug')('volebo:express')
const fs              = require('fs')
const http            = require('http')
const express         = require('express')

const logger          = require('./logger')
const createListener  = require('./server')

const deprecated_error_die = function(done, msg) {
	const e = new Error(msg)
	done(e)
}

const log = logger.getLogger('volebo.express')

/*
====================================
EXPORT
====================================
*/

const vbexp = function(configPath, overrideOptions) {

	const app = createListener(configPath, overrideOptions)

	app.start = function app_start(done)
	{
		if (!done) {
			done = function(err) {
				if (err) {
					throw err
				}
			}
		}
		// append error handlers:
		app._onStarting()

		// Get port from environment and store in Express.
		let host = app.config.get('server.host')
		let port = app.config.get('server.port')
		let localpath = app.config.get('server.path')

		debug('host', host)
		debug('port', port)
		debug('localpath', localpath)

		const useLocalPath = !! localpath

		if (useLocalPath) {
			debug('will listen on localpath')
			host = null
			port = null

			try {
				const stat = fs.statSync(localpath)
				if (stat.isSocket()) {
					debug('remove existing socket file', localpath)

					fs.unlinkSync(localpath)
				} else {
					deprecated_error_die(done, 'Can not start server, listening on NON-SOCKET file')
				}
			} catch (e) {
				if (e.code === 'ENOENT' && e.syscall==='stat') {
					// do nothing, localpath-file does not exist
				} else {
					throw e
				}
			}
		} else {
			debug('will listen on host:port')
			localpath = null
		}

		// Create HTTP server.
		const server = http.createServer(app)

		/**
		 * Event listener for HTTP server "listening" event.
		 */
		const onListening = function onListening() {
			const addr = server.address()
			const bind = typeof addr === 'string'
				? `pipe ${addr}`
				: `port http://${addr.address}:${addr.port}`
			log.info('Listening on ' + bind)

			done()
		}

		const onError = function onError(error) {

			log.error(error)

			if (error.syscall !== 'listen') {
				throw error
			}

			const bind = useLocalPath
				? 'Pipe ' + localpath
				: 'Port ' + port

			// handle specific listen errors with friendly messages
			switch (error.code) {
			case 'EACCES':
				return deprecated_error_die(done, bind + ' requires elevated privileges')
			case 'EADDRINUSE':
				return deprecated_error_die(done, bind + ' is already in use')
			default:
				return done(error)
			}
		}

		const onClose = function onClose() {
			debug('on closing')

			if (app && app.model) {
				debug('close model')
				app.model.close()
			}

			debug('Server closed')
			log.info('Server closed')
		}

		server.on('error', onError)
		server.on('listening', onListening)
		server.on('close', onClose)

		// Listen on provided port, on all network interfaces.
		if(useLocalPath) {
			server.listen(localpath)
		} else {
			server.listen(port, host)
		}

		app.close = function() {
			return server.close.apply(server, arguments)
		}

		return
	}

	return app
}

vbexp.Router = function vbexp_Router() {
	return express.Router.apply(express, arguments)
}

exports = module.exports = vbexp
