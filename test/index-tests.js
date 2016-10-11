/*
ExpressJS for volebo.net

Copyright (C) 2016	Volebo.Net <volebo.net@gmail.com>
Copyright (C) 2016	Koryukov Maksim <maxkoryukov@gmail.com>

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

var assert     = require('chai').assert;
var assert2     = require('better-assert');
var path       = require('path');

/* ROOT of the package */
var rt = process.cwd();

describe('index-tests', function(){

	describe('on start two apps at the same time', () => {

		let vbexpress = require(path.join(rt, ''));
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
				assert.isNotNull(err);
				assert.property(err, 'message');
				assert.match(err.message, /Port \d+ is already in use/i );

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
