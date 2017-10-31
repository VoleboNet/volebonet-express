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

Copyright (C) 2016-2017 Volebo <dev@volebo.net>
Copyright (C) 2016-2017 Maksim Koryukov <maxkoryukov@gmail.com>

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

const _               = require('lodash')
const debug           = require('debug')('volebo:express:views:helpers')
const hbsHelpers3     = require('handlebars-helpers')


// TODO : #17 replace with custom set of handlers!
// BUG: #17
const handlebarsIntl  = require('handlebars-intl')


module.exports = function registerHbsHelpers(app) {

	const customHelpers = {

		// t(domain, key, ...args) {
		// 	const options = args.pop()
		// 	const hash = options.hash
		// 	debug('called helper {{t}}:', key, args, hash)

		t(key, options) {

			//const options = args.pop()
			const hash = options.hash

			const rootData = _.get(options, 'data.root', -1)

			if (-1 === rootData) {
				throw new Error(`Wrong arity of HBS-helper {{t}} near key [${key}]`)
			}

			//debug('called helper {{t}}:', key, args, hash)
			debug(`called helper {{t}}, key [${key}] hash`, hash)

			const langCode = rootData.lang.code

			// content of app.l10n is described in the ../../loaders/translations.js
			const langObj = app.l10n[langCode]

			if (!langObj) {
				app.log.error({
					'category': 'l10n',
					'langCode': langCode,
					'key': key,
				}, 'Required lang is not loaded')

				return key
			}

			const tr = _.get(langObj, key)
			if (_.isNil(tr)) {
				app.log.error({
					'langCode': langCode,
					'key': key,
				}, 'Translation key is not defined')

				return key
			}

			// tr is a function (we are going to complile all translations
			// with a messageFormat.js

			return tr(hash)
		},

		linkTo(path) {
			return path
		}
	}

	// we use http://assemble.io/helpers/
	//
	// load several helpers
	// see all categories:
	// https://www.npmjs.com/package/handlebars-helpers#categories

	// * array
	// * code
	// * collection
	// * comparison
	// * date
	// * fs
	// * html
	// * i18n
	// * inflection
	// * logging
	// * markdown
	// * match
	// * math
	// * misc
	// * number
	// * object
	// * path
	// * regex
	// * string
	// * url

	const _categories = [
		'comparison',
		'string',
	]

	const helpers = hbsHelpers3(_categories, {'hbs': app.hbs.handlebars})
	_.merge(customHelpers, helpers)


	handlebarsIntl.registerWith(app.hbs.handlebars)


	return customHelpers
}
