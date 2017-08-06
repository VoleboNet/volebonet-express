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

		const config = configLoad(null)

		const testCases = [
			['server.host', '127.0.0.1'],
			['server.port', 3000],
			['server.path', null],
			['debug.renderStack', false],
			['session.secure', false],
			['session.secret', -1],
			['auth.enabled', true],
			['db.enabled', false],
			['db.debug', false],
			['db.client', 'pg'],
			['db.connection.timezone', 'utc'],

			['session.domain', [] ],
			['proxy.list', ['loopback']]
		]

		testCases.forEach( pair => {
			const prop = pair[0]
			const exp = pair[1]

			it(`-> ${prop} should have known value`, ()=> {
				const act = config.get(prop)
				expect(act).is.deep.equal(exp, 'property in config has incorect value')
			})

			it.skip(`-> ${prop} is accessible with UPPER case`, () => {
				const upper = _.toUpper(prop)
				const act = config.get(upper)
				expect(act).is.deep.equal(exp, 'property in config has incorect value')
			})
		})
	})

	describe('config with custom values', function() {
		it('override config 1', () => {
			const config = configLoad(null, {
				'debug': {
					'renderStack': true,
				},
				'db': {
					'connection': {
						'username': 'anon'
					}
				}
			})

			expect(config.get('debug.renderStack')).equals(true)
			expect(config.get('db.connection.username')).equals('anon')
			expect(config.get('db.connection.timezone')).equals('utc')
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
				const act = config.get('db.enabled')
				expect(act).is.equal(false)
			})
		})

	})
})
