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

describe('server run and re-run', function(){

	this.slow(800);
	var vbexpress = require(path.join(rt, ''));
	var app = vbexpress();

	[
		'run out of the box',
		'should run after restart',
	].forEach(function(description){
		it(description, function (done) {
			// TODO: #4 should use promise here
			app.start();
			assert.isTrue(true);
			app.close(done);
		});
	});
});
