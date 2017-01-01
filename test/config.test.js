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

		let config = new vbexpress.Config();

		[
			['server.host', '127.0.0.1'],
			['server.port', 3000],
			['server.path', null],
			['debug.renderStack', false],
			['session.secure', false],
			['auth.enabled', true],
			['model.enabled', false],
			['model.db.timezone', 'utc'],

			['session.domain', [] ],
			['proxy.list', ['loopback']]
		]
		.forEach( pair => {
			let prop = pair[0];
			let exp = pair[1];

			it(`-> ${prop} should have known value`, ()=> {
				assert.deepProperty(config, prop, 'config does not contain expected property');

				let act = _.get(config, prop);
				assert.deepEqual(act, exp, 'property in config has incorect value');
			});
		});
	});

	describe('config with custom values', function() {
		it('override config 1', () => {
			let config = new vbexpress.Config({
				"debug": {
					"renderStack": true,
				},
				"model": {
					"db": {
						"username": "anon"
					}
				}
			})

			assert.deepPropertyVal(config, 'debug.renderStack', true);
			assert.deepPropertyVal(config, 'model.db.username', 'anon');
			assert.deepPropertyVal(config, 'model.db.timezone', 'utc');
		});
	})

	describe('static methods', function() {
		describe('readJson', () => {
			it('reads json', () => {
				let json = vbexpress.Config.readJson(path.join(__dirname, 'samples', 'config-readJson-01.json'));

				assert.deepEqual(json, {'key': '12_12'});
			});
		})


		describe('readYaml', () => {
			it('reads yaml', () => {
				let yaml = vbexpress.Config.readYaml(path.join(__dirname, 'samples', 'config-readYaml-01.yaml'));

				assert.deepEqual(yaml,
					{ "json": ["rigid"], "object": { "key": "value", "array": [ { "null_value": null }, { "boolean": true }, { "integer": 1 }]}}
				);
			});
		})

	})
});
