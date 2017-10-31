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

const bunyan          = require('bunyan')
const bunyanWww       = require('express-bunyan-logger')


// const bstcp = require('bunyan-logstash-tcp')
// const logstashStream = bstcp.createStream({
// 	host: '127.0.0.1',
// 	port: 9998
// })


// // TODO: enable GrayLog logger (https://www.npmjs.com/package/gelf-stream)
// const gelfStream = require('gelf-stream')
// const stashLogHostname = '127.0.0.1' //'volebo-logging'
// const stashStream = gelfStream.forBunyan(stashLogHostname)


// TODO: gh #2 load log config from config
const commonLogConfig = {
	name: 'volebo.express.server',
	streams:[
		{ stream: process.stdout },

		// TODO: be carefull, need to close this stream explicitly!
		//{ type: 'raw', stream: stashStream },
	],
}


function getLogger(name) {
	// consider Object.assign() (if setters are required)

	const _config = Object.assign({}, commonLogConfig, {name: name})
	const log = bunyan.createLogger(_config)

	return log
}


function getWwwLogger(name) {

	const _config = Object.assign({}, commonLogConfig, {name: name})
	const log = bunyanWww(_config)
	return log
}


function getWwwErrorLogger(name) {

	const _config = Object.assign({}, commonLogConfig, {name: name})
	const log = bunyanWww.errorLogger(_config)
	return log
}

exports.getLogger = getLogger
exports.getWwwLogger = getWwwLogger
exports.getWwwErrorLogger = getWwwErrorLogger

