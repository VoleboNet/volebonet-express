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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'

const nconf           = require('nconf')
const yaml            = require('js-yaml')

// const debug           = require('debug')('volebo:express:config')

const yamlFormat = {
	stringify(obj, options) {
		return yaml.safeDump(obj, options)
	},

	parse(str, options) {
		return yaml.safeLoad(str, options)
	},
}

function config(configPath, options) {
	const defs = {
		"server": {
			"host": "127.0.0.1",
			"port": 3000,
			"path": null
		},

		"debug": {
			"renderStack": false,
			"staticPath": "public",
		},

		"session": {
			"enabled": true,
			"name": 'sessionId',
			"secret" : -1,
			"secure" : false,
			"domain": []
		},

		"auth": {
			"enabled": true,
			"session": true,
		},

		"proxy": {
			"list": ["loopback"]
		},

		"db": {
			"enabled": false,
			"debug": false,
			"client": "mysql",

			"connection" : {
				"timezone" : "utc",
				"username" : "",
				"password" : "",
				"database" : "",
				"host"     : "localhost",
				"benchmark": true
			},
		},
	}

	nconf.use('overrides', { type: 'literal', store: options })
	nconf.use('argv')
	nconf.use('env', { type: 'env',
		whitelist: ['NODE_ENV']
	})

	if (configPath) {
		nconf.use('yaml-config-file', { type: 'file',
			file: configPath,
			format: yamlFormat
		})
	}
	nconf.use('defaults', { type: 'literal', store: defs })

	const cfg = nconf.get()
	return cfg
}

exports = module.exports = config
