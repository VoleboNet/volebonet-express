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

const getnodeenv = require('../src/getnodeenv');

describe('getnodeenv', () => {

	describe('is a function', () => {
		expect(getnodeenv).to.be.a('function');
	});

	describe('knows production env', () => {
		[
			'prod',
			'production',
		].forEach( envname => {
			it(`should recognize ${envname}`, function () {
				process.env['NODE_ENV'] = envname;

				let [e, isP] = getnodeenv();

				expect(isP).to.be.true;
				expect(e).is.equal('production');
			})
		})
	});

	describe('knows development env', () => {
		[
			'dev',
			'development',
		].forEach( envname => {
			it(`should recognize ${envname}`, function () {
				process.env['NODE_ENV'] = envname;

				let [e, isP] = getnodeenv();

				expect(isP).to.be.false;
				expect(e).is.equal('development');
			})
		})
	});

	describe('fallback to development', () => {
		[
			null,
			undefined,
			123,
			true,
			false,
			0,
			-1,
			'asdf',
			'true',
			'what is this',
		].forEach( envname => {
			it(`should set 'development' for ${envname}`, function () {
				process.env['NODE_ENV'] = envname;

				let [e, isP] = getnodeenv();

				expect(isP).to.be.false;
				expect(e).is.equal('development');
			})
		})
	});

});
