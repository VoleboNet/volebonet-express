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

const vbexpress = require('./')

describe(filename2suitename(__filename), function(){

	const configDefaultSock = {}
	const configFileSock = {
		"server": {
			"path": "test.sock"
		}
	}

	const testCases = [
		['default sock', configDefaultSock],
		['file sock', configFileSock],
	]

	testCases.forEach(tc => {
		const [configName, configObj] = tc

		describe(`run and restart with config "${configName}"`, () => {
			this.slow(800)
			const app = vbexpress(null, configObj)

			beforeEach(function(done) {
				app.start(done)
			})

			afterEach(function(done) {
				app.close(done)
			})

			const testCasesStage = [
				'run out of the box',
				'should run after restart',
			]

			testCasesStage.forEach(function(description){

				it(description, function () {
					expect(true).is.true
				})
			})
		})
	})

	describe('on start two apps at the same time', () => {

		let app1 = null
		let app2 = null

		beforeEach(() => {
			app1 = vbexpress()
			app2 = vbexpress()
		})

		afterEach(() => {
			app2.close()
			app1.close()
		})

		it('should call done with ERROR', done => {

			const errDone = function(err) {
				expect(err).is.not.null
				expect(err).has.property('message')
				expect(err.message).is.match(/Port \d+ is already in use/i)

				done()
			}

			app1.start(() => {
				app2.start(errDone)
			})

		})

		// it('should throw EADDRINUSE', done => {
		// 	assert.throw(() => {
		// 		app1.start();
		// 		app2.start();
		// 		done();
		// 	});
		// });
	})
})
