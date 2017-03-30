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

const assert = require('chai').assert;
const _      = require('lodash');
const path   = require('path');

const vbexpress = require(packageRoot);

describe('config', function(){

	describe('default values', function() {

		const config = new vbexpress.Config();

		[
			['server.host', '127.0.0.1'],
			['server.port', 3000],
			['server.path', null],
			['debug.renderStack', false],
			['session.secure', false],
			['auth.enabled', true],
			['db.enabled', false],
			['db.debug', false],
			['db.client', 'mysql'],
			['db.connection.timezone', 'utc'],

			['session.domain', [] ],
			['proxy.list', ['loopback']]
		]
		.forEach( pair => {
			const prop = pair[0];
			const exp = pair[1];

			it(`-> ${prop} should have known value`, ()=> {
				assert.deepProperty(config, prop, 'config does not contain expected property');

				const act = _.get(config, prop);
				assert.deepEqual(act, exp, 'property in config has incorect value');
			});
		});
	});

	describe('config with custom values', function() {
		it('override config 1', () => {
			const config = new vbexpress.Config({
				"debug": {
					"renderStack": true,
				},
				"db": {
					"connection": {
						"username": "anon"
					}
				}
			})

			assert.deepPropertyVal(config, 'debug.renderStack', true);
			assert.deepPropertyVal(config, 'db.connection.username', 'anon');
			assert.deepPropertyVal(config, 'db.connection.timezone', 'utc');
		});
	})

	describe('static methods', function() {
		describe('readJson', () => {
			it('reads json', () => {
				const json = vbexpress.Config.readJson(path.join(__dirname, 'samples', 'config-readJson-01.json'));

				assert.deepEqual(json, {'key': '12_12'});
			});
		})


		describe('readYaml', () => {
			it('reads yaml', () => {
				const yaml = vbexpress.Config.readYaml(path.join(__dirname, 'samples', 'config-readYaml-01.yaml'));

				assert.deepEqual(yaml,
					{ "json": ["rigid"], "object": { "key": "value", "array": [ { "null_value": null }, { "boolean": true }, { "integer": 1 }]}}
				);
			});
		})

	})
});
