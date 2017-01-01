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

const vbexpress = require(packageRoot)

describe('module test', function(){

	let configDefaultSock = {}
	let configFileSock = {
		"server": {
			"path": "test.sock"
		}
	};

	[
		['default sock', configDefaultSock],
		['file sock', configFileSock],
	].forEach(config => {
		let configName = config[0]
		let configObj = config[1]

		describe(`run and restart with config "${configName}"`, () => {
			this.slow(800);
			const app = vbexpress(configObj);

			beforeEach(function(done) {
				app.start(done);
			});

			afterEach(function(done) {
				app.close(done);
			});

			[
				'run out of the box',
				'should run after restart',
			].forEach(function(description){

				it(description, function () {
					expect(true).is.true;
				})
			})
		})
	})

	describe('on start two apps at the same time', () => {

		let app1 = null;
		let app2 = null;

		beforeEach(() => {
			app1 = vbexpress();
			app2 = vbexpress();
		});

		afterEach(() => {
			app2.close();
			app1.close();
		});

		it('should call done with ERROR', done => {

			let errDone = function(err) {
				expect(err).is.not.null
				expect(err).has.property('message')
				expect(err.message).is.match(/Port \d+ is already in use/i)

				done();
			};

			app1.start(() => {
				app2.start(errDone);
			});

		});

		// it('should throw EADDRINUSE', done => {
		// 	assert.throw(() => {
		// 		app1.start();
		// 		app2.start();
		// 		done();
		// 	});
		// });
	});
});
