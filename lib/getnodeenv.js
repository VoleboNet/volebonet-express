/*
ExpressJS for volebo.net

Copyright (C) 2016  Volebo.Net <volebo.net@gmail.com>
Copyright (C) 2016  Koryukov Maksim <maxkoryukov@gmail.com>

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

const _               = require('lodash');


const _d = 'development';
const _p = 'production';

const _knownEnv = {
	'production'  : _p,
	'prod'        : _p,

	'development' : _d,
	'dev'         : _d,
}

// Load environment:
exports = module.exports = function getEnv() {
	let env = _.get(process.env, 'NODE_ENV', _d);
	env = _.lowerCase(env);
	if (env in _knownEnv) {
		env = _knownEnv[env];
	} else {
		env = _d;
	}

	let isProduction = env === _p;
	return [env, isProduction];
}