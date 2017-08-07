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

const debug           = require('debug')('volebo:express:config')

const yamlFormat = {
	stringify(obj, options) {
		return yaml.safeDump(obj, options)
	},

	parse(str, options) {
		return yaml.safeLoad(str, options)
	},
}

class Config {
	constructor(storage) {
		this.__storage = storage
	}

	get(propertyPath) {
		let _n = 'volebo'

		if (propertyPath) {
			_n += ':' + propertyPath.replace(/(\w)\.(\w)/g, '$1:$2')
		}

		return this.__storage.get(_n)
	}

	get debug() {
		return !! this.get('debug')
	}
}

function loadConfig(configPath, overrideOptions) {
	const defs = {
		'volebo': {
			'server': {
				'host': '127.0.0.1',
				'port': 3000,
				'path': null
			},

			'debug': {
				'renderStack': false,
				'staticPath': 'public',
			},

			'session': {
				'enabled': true,
				'name': 'sessionId',
				'secret' : -1,
				'secure' : false,
				'domain': []
			},

			'auth': {
				'enabled': true,
				'session': true,
			},

			'proxy': {
				'list': ['loopback']
			},

			'model': {
				'enabled': false,
				'debug': false,
			},
		},
	}

	nconf.use('overrides', {
		type: 'literal',
		store: overrideOptions,
		// logicalSeparator: '.',
	})

	nconf.use('argv')

	nconf.use('env', {
		type: 'env',
		separator: '_',
		match: /^volebo/i,
		whitelist: ['NODE_ENV'],
		// logicalSeparator: '.',
	})

	if (configPath) {
		nconf.use('yaml-config-file', {
			type: 'file',
			file: configPath,
			format: yamlFormat,
			// logicalSeparator: '.',
		})

		debug('append config from file', configPath)
	}

	nconf.use('defaults', {
		type: 'literal',
		store: defs,
		// logicalSeparator: '.',
	})

	// const cfg = nconf.get()

	const cfg = new Config(nconf)
	return cfg
}

exports = module.exports = loadConfig
