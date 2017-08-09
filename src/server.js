/*
db    db  .8888.  dP     888888b 8888ba   .8888.     d8b   db  888888b d8888P
88    88 d8'  `8b 88     88      88  `8b d8'  `8b    88V8  88  88        88
Y8    8P 88    88 88     88aaa   88aa8P' 88    88    88 V8 88 a88aaa     88
`8b  d8' 88    88 88     88      88  `8b 88    88    88  V888  88        88
 `8bd8'  Y8.  .8P 88     88      88  .88 Y8.  .8P dP 88   V88  88        88
   YP     `888P'  88888P 888888P 888888'  `888P'  88 VP    8P  888888P   dP

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

// Loading polyfill for intl
// required, as soon we want to use several locales (not only EN)
if (global.Intl) {
	const IntlPolyfill = require('intl')
	Intl.NumberFormat   = IntlPolyfill.NumberFormat
	Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
} else {
	global.Intl = require('intl')
}

const path            = require('path')

const debug           = require('debug')('volebo:express:server')
const express         = require('express')
const helmet          = require('helmet')
const wwwLogger       = require('express-bunyan-logger');

const bodyParser      = require('body-parser')
const handlebars      = require('express-handlebars')

const session         = require('express-session')
const flash           = require('express-flash')

const langGen         = require('express-mw-lang')
const _               = require('lodash')
const moment          = require('moment')
const bunyan          = require('bunyan')

const VoleboModel     = require('@volebo/data')

// TODO : #17 replace with custom set of handlers!
// BUG: #17
const handlebarsIntl  = require('handlebars-intl')


const configLoad      = require('./config-load')

// TODO: autocreate log dir
const log = bunyan.createLogger({
	name: 'volebo.express.server',
	streams:[{
		path: 'log/express.log',
	}],
})

debug('initializing')


const main = function main(configPath, overrideOptions) {
	const app = express()

	// securing with HTTP-headers
	app.use(helmet())

	/*
	========================================================
	CONFIG

	Custom config, allows to put dirty crutches
	without breaking core settings of the express
	========================================================
	*/
	app.config = configLoad(configPath, overrideOptions)

	/*
	========================================================
	AUTOLOAD MODEL
	========================================================
	*/
	if (app.config.get('model.enabled')) {
		app.model = new VoleboModel(app.config.get('model'))
	}

	/*
	========================================================
	COMMON MIDDLEWARES
	========================================================
	*/
	// TODO: gh #2 load log config from config
	const logConfig = {
		name: 'volebo.express.server.www',
		streams:[{
			path: 'log/express.log',
		}],
	}
	app.use(wwwLogger(logConfig))

	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: false }))

	app.set('trust proxy', app.config.get('proxy.list'))

	/*
	========================================================
	STATIC
	========================================================
	*/

	if (app.config.get('debug.staticPath')) {
		//let staticPath = path.join(__dirname, app.config.debug.staticPath);
		const staticPath = app.config.get('debug.staticPath')

		debug('Use static path', staticPath)
		app.use(express.static(staticPath))
	}


	/*
	========================================================
	JSON
	========================================================
	*/
	if (app.config.debug) {
		app.set('json spaces', 4)
	}

	/*
	========================================================
	HTTP->HTTPS redirect (working behind NGINX)
	========================================================
	*/
	app.use((req, _unused_res, next) => {
		req.forwardedSecure = _.lowerCase(req.headers["x-forwarded-proto"]) === "https"
		next()
	})

	/*
	========================================================
	SESSIONS
	========================================================
	*/

	if (app.config.get('session.enabled')) {

		if (-1 === app.config.get('session.secret')) {
			log.error('Seems like you forgot to set session.secret in your config')
		}

		const session_config = {
			name: app.config.get('session.name', 'sessionId'),
			secret: app.config.get('session.secret'),
			resave: false,
			saveUninitialized: false,

			// DOC: https://www.npmjs.com/package/express-session#cookie
			cookie: {
				//expires
				maxAge: 1000*60*30, // ms, 30 minutes now
				httpOnly: true,

				secure : app.config.get('session.secure'),
			},
			/*genid: function(req) { return genuuid() // use UUIDs for session IDs  },*/
		}

		const session_domains = app.config.get('session.domains')
		if (_.isArray(session_domains) && session_domains.length > 0) {
			session_config.cookie.domain = session_domains.join(',')
		}

		app.use(session(session_config))
	}

	if (app.config.get('flash.enabled')) {
		app.use(flash())
	}

	/*
	========================================================
	PASSPORT
	========================================================
	*/

	app.passport = null

	if (app.config.get('auth.enabled')) {

		app.passport = require('passport')
		app.use(app.passport.initialize())

		if (app.config.get('auth.session')){
			app.use(app.passport.session())
		}

		app.passport.serializeUser(function(user, done) {
			debug('serializing', user)
			done(null, user)
		})

		app.passport.deserializeUser(function(obj, done) {
			debug('deserializing', obj)
			done(null, obj)
		})
	}

	/*
	========================================================
	Handler for lang detection and other stuff..
	========================================================
	*/

	const langmw = langGen({
		defaultLanguage: 'en',
		availableLanguages: ['en', 'ru', 'zh'],
		onLangCodeReady: function(lang_code, _unused_req, res) {

			moment.locale(lang_code)

			// REF #6: We could use `defaultOptions`, attached to the
			// `res` object. This approach could make the code
			// more readable.
			// See also: _renderTemplate hook
			// https://github.com/ericf/express-handlebars#_rendertemplatetemplate-context-options

			if (!res._renderOriginal) {
				res._renderOriginal = res.render
			}
			res.render = function overloadedRender(){

				const nargs = Array.prototype.slice.call(arguments)
				const opt = _.get(nargs, '[1]', {})

				if (res.helpers) {
					debug('Going to append per-request HBS helpers')

					// check, whether some helpers are already attached:
					if(opt.helpers) {
						_.assign(opt.helpers, res.helpers)
					} else {
						_.set(opt, 'helpers', res.helpers)
					}
				}

				// set locale for HBS-intl formatter (format dates, numbers and messages)
				_.set(opt, 'data.intl.locales', lang_code)

				nargs[1] = opt
				return res._renderOriginal.apply(this, nargs)
			}
		}
	})
	app.lang = langmw

	app.lang.loadTranslation = function(json) {
		_.set(app, 'localization.en', json)
	}

	langmw.esu(app)

	/*
	========================================================
	VIEW ENGINE SETUP
	========================================================
	*/
	const hbs  = handlebars.create({
		layoutsDir: path.join(__dirname, 'views', 'layouts'),
		partialsDir: path.join(__dirname, 'views', 'partials'),		// TODO : #13 use NAMESPACES
		defaultLayout: 'default',
		helpers: require('./views/helpers')(app),
		extname: '.hbs'
	})
	app.set('views', path.join(__dirname, 'views'))
	app.hbs = hbs

	handlebarsIntl.registerWith(hbs.handlebars)

	app.engine('hbs', hbs.engine)
	app.set('view engine', 'hbs')

	app._onStarting = function() {
		/*
		====================================
		NOT FOUND HANDLER
		catch 404 and forward to error handler
		====================================
		*/
		app.use(function(_unused_req, _unused_res, next) {
			// TODO : pass required info to the error, such as URL, params...
			const err = new Error('Not Found')
			err.status = 404

			next(err)
		})

		/*
		====================================
		ERROR HANDLERS
		TODO: fix #2 - robust error handler
		====================================
		*/

		const errorViewPath = path.join(__dirname, 'views', 'error.hbs')
		const errorLayoutlPath = path.join(__dirname, 'views', 'layouts', 'default.hbs')

		if (app.config.get('debug.renderStack')) {

			// development error handler
			// will print stacktrace
			app.use(function global_error_dev(err, _unused_req, res, next) {
				res.status(err.status || 500)
				return res.render(errorViewPath, {
					message: err.message,
					error: err,
					status: err.status,
					layout: errorLayoutlPath
				})
			})
		} else {

			// production error handler
			// no stacktraces leaked to user
			app.use(function global_error(err, _unused_req, res, next) {
				res.status(err.status || 500)
				return res.render(errorViewPath, {
					message: err.message,
					error: {},
					status: err.status,
					layout: errorLayoutlPath
				})
			})
		}
	}

	return app
}

exports = module.exports = main
