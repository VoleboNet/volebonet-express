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

Copyright (C) 2016-2018 Volebo <dev@volebo.net>
Copyright (C) 2016-2018 Maksim Koryukov <maxkoryukov@gmail.com>

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

const nconf           = require('nconf')
const yaml            = require('js-yaml')
const fs              = require('fs')
const path            = require('path')

const debug           = require('debug')('volebo:express:loaders:configuration')

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
	const _defsPath = path.resolve(path.join(__dirname, 'configuration.default.yml'))
	const defs = yaml.load(fs.readFileSync(_defsPath, 'utf8'))

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
