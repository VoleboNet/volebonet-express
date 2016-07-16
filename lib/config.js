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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
 * @module config
 */

"use strict";

const debug         = require('debug')('volebo:express:config');
const path          = require('path');

var envname         = process.env.NODE_ENV || 'production';
var config_path     = path.join(process.cwd(), 'etc', 'volebonet-express.json');
var config          = require(config_path);

// ALWAYS: print config, when it is read from ENV:
debug(`ENV: ${envname}`);

if (!config.security) { config.security = {}; }

exports = module.exports = config;
