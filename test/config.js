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

		it('server', () => {
			assert.equal(app.config.server.host, '127.0.0.1');
			assert.equal(app.config.server.port, 3000);
			assert.property(app.config.server, 'path');
			assert.isNull(app.config.server.path);
		});

		it('debug.renderStack', () =>
			assert.equal(app.config.debug.renderStack, false)
		);

		it('session.secure', () =>
			assert.equal(app.config.session.secure, false)
		);


		it('session.domain', () => {
			assert.isArray(app.config.session.domain);
			assert.lengthOf(app.config.session.domain, 0);
		});

		it('auth.enabled', () => {
			assert.equal(app.config.auth.enabled, true);
		});

		it('model.enabled', () => {
			assert.equal(app.config.model.enabled, false);
		});
	});
});
