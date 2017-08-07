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

'use strict'

const expect = require('chai').expect
const _      = require('lodash')
const path   = require('path')

const configLoad = require('./config-load')

describe('config-load', function(){

	describe('default values', function() {

		const config = configLoad()

		const testCases = [
			['server.host', '127.0.0.1'],
			['server.port', 3000],
			['server.path', null],
			['debug.renderStack', false],
			['flash.enabled', false],
			['session.secure', false],
			['session.secret', -1],
			['auth.enabled', true],
			['model.enabled', false],
			['model.debug', false],

			['session.domains', ['volebo.net'] ],
			['proxy.list', ['loopback']]
		]

		testCases.forEach( pair => {
			const prop = pair[0]
			const exp = pair[1]

			it(`-> [${prop}] should have known value`, ()=> {
				const act = config.get(prop)
				expect(act).is.deep.equal(exp, 'property in config has incorect value')
			})

			it.skip(`-> [${prop}] is accessible with UPPER case`, () => {
				const upper = _.toUpper(prop)
				const act = config.get(upper)
				expect(act).is.deep.equal(exp, 'property in config has incorect value')
			})
		})
	})

	describe('config with custom values', function() {
		it('override config 1', () => {
			const config = configLoad(null, { 'volebo': {
				'debug': {
					'renderStack': true,
				},
				'model': {
					'connection': {
						'username': 'anon'
					}
				}
			}})

			expect(config.get('debug.renderStack')).equals(true)
			expect(config.get('model.connection.username')).equals('anon')
			expect(config.get('model.enabled')).equals(false)
		})
	})

	describe('config with file', function() {

		describe('yaml', () => {

			const configPath = path.join(__dirname, '../test/samples/config-readYaml-01.yml')
			let config = null

			beforeEach(() => {
				config = configLoad(configPath)
			})

			it('overrides defaults', () => {
				const act = config.get('session.secret')
				expect(act).is.equal('asdf')
			})

			it('add new properties', () => {
				const act = config.get('unknownProperty.andNewValue')
				expect(act).is.equal(1111)
			})

			it('don\' modify defaults not present in file', () => {
				const act = config.get('model.enabled')
				expect(act).is.equal(false)
			})
		})

	})

	describe('config from environment', function() {

		let config = null

		beforeEach(() => {
			process.env['volebo_session_name'] = 'sample-session-test'
			process.env['volebo_model_enabled'] = true
			process.env['volebo_model_db_main_connectionString'] = 'pg://user:pwd@localhost:5432/dbname?debug=true'

			config = configLoad()
		})

		it.skip('-> [model.enabled] overrides bool value', () => {
			const act = config.get('model.enabled')
			expect(act).is.equal(true)
		})

		it('-> [session.name] overrides string value', () => {
			const act = config.get('session.name')
			expect(act).is.equal('sample-session-test')
		})

		it('-> [model.db.main.connectionString] was added as new property', () => {
			const act = config.get('model.db.main.connectionString')
			expect(act).is.equal('pg://user:pwd@localhost:5432/dbname?debug=true')
		})
	})
})
