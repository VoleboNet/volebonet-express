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

const request  = require('supertest')
const vbexpress = require('./')

describe(filename2suitename(__filename), function(){

	describe('check NOT FOUND', () => {

		const app = vbexpress()

		before( done=> {
			app.start(done)
		})
		after(done => app.close(done))

		it('not found', done => {
			request(app)
				.get('/xxxxxxxxxxxxxx-not-exists')
				.expect(/Not found/i)
				.expect(404, done)
		})
	})

	describe('check "forwardedSecure"', () => {

		const app = vbexpress()

		before( done=> {
			app.get('/forwardedSecure', (req, res, next) => {
				res.send(req.forwardedSecure).status(200)
			})

			app.start(done)
		})
		after(done => app.close(done))

		it('forwardedSecure is true for "x-forwarded-proto"', done => {
			request(app)
				.get('/forwardedSecure')
				.set('X-FORWARDED-PROTO', 'HTTPS')
				.expect(200, 'true', done)
		})

		it('forwardedSecure is false for "x-forwarded-proto" http', done => {
			request(app)
				.get('/forwardedSecure')
				.set('X-FORWARDED-PROTO', 'HTTP')
				.expect(200, 'false', done)
		})

		it('forwardedSecure is false for unset "x-forwarded-proto"', done => {
			request(app)
				.get('/forwardedSecure')
				.expect(200, 'false', done)
		})

	})

	describe('check "onLangCodeReady"', () => {

		let app = null

		beforeEach(() => {
			app = vbexpress(null, {
				debug: {
					renderStack: true,
				}
			})
		})
		afterEach(done => {
			app.close(done)
		})

		it('should render template with undefined render.options', done => {

			app.get('/renderNullOptions', (_unused_req, res, next) => {
				const optionsAndContext = null
				return res.render('error', optionsAndContext)
			})

			app.start( () => {
				request(app)
					.get('/renderNullOptions')
					.expect(200, done)
			})
		})


		it('should render template after multiple call to `setLocale`', done => {

			app.get('/multiSetCulture', (req, res, next) => {

				req.lang.setLocale('en')
				req.lang.setLocale('ru')
				req.lang.setLocale('en')

				return res.render('error')
			})

			app.start( () => {
				request(app)
					.get('/multiSetCulture')
					.expect(200, done)
			})
		})
	})
})
