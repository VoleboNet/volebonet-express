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

"use strict";

const fs              = require('fs');

//const debug           = require('debug')('volebo:express:config');
const _               = require('lodash');
const yaml            = require('js-yaml');

let config = function config(options) {
	if (_.isNil(options)) {
		options = {};
	}

	let def = {
		"server": {
			"host": "127.0.0.1",
			"port": 3000,
			"path": null
		},

		"debug": {
			"renderStack": false,
			"staticPath": "public",
		},

		"session": {
			"enabled": true,
			"name": "sessionId",
			"secret" : "DO NOT FORGET TO CHANGE!",
			"secure" : false,
			"domain": []
		},

		"auth": {
			"enabled": true,
			"session": true,
		},

		"proxy": {
			"list": ["loopback"]
		},

		"model": {
			"enabled": false,

			"db" : {
				"timezone" : "utc",
				"username" : "",
				"password" : "",
				"database" : "",
				"host"     : "localhost",
				"benchmark": true
			},
		},
	};

	_.defaultsDeep(options, def);

	return options;
}

/**
 * Read object from JSON-file synchronously
 *
 * @param {path} filename - path to the file
 * @return {object}
 */
config.readJson = function(filename) {
	return JSON.parse(fs.readFileSync(filename, 'utf8'));
};

/**
 * Read object from YAML-file synchronously
 *
 * @param {path} filename - path to the file
 * @return {object}
 */
config.readYaml = function(filename) {
	return yaml.load(fs.readFileSync(filename, 'utf8'));
};

exports = module.exports = config;
