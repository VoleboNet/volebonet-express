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

var assert = require('chai').assert;
var path   = require('path');

/* ROOT of the package */
var rt = process.cwd();

var vbexpress = require(path.join(rt, ''));

describe('config', function(){

	it('config not null', function () {
		let app = vbexpress();

		assert.isDefined(app.config);
		assert.isNotNull(app.config);
	});

	describe('default values', function() {

		let app = null;
		beforeEach( () => {
			app = vbexpress();
		});

		it('debug.renderStack', () =>
			assert.equal(app.config.debug.renderStack, false)
		);

		it('cookie.secure', () =>
			assert.equal(app.config.cookie.secure, false)
		);

		it('cookie.domain', () => {
			assert.isArray(app.config.cookie.domain);
			assert.lengthOf(app.config.cookie.domain, 0);
		});
	});
});
