# CHANGELOG

```yaml
db    db  .8888.  dP     888888b 8888ba   .8888.     d8b   db  888888b d8888P
88    88 d8'  `8b 88     88      88  `8b d8'  `8b    88V8  88  88        88
Y8    8P 88    88 88     88aaa   88aa8P' 88    88    88 V8 88 a88aaa     88
`8b  d8' 88    88 88     88      88  `8b 88    88    88  V888  88        88
 `8bd8'  Y8.  .8P 88     88      88  .88 Y8.  .8P dP 88   V88  88        88
   YP     `888P'  88888P 888888P 888888'  `888P'  88 VP    8P  888888P   dP
```

This is the history of changes of the `@volebo/express` package

> This file should be filled by maintainers, using pull requests
> Please, follow this [guide](http://keepachangelog.com/en/0.3.0/)

## 0.7.3 // 2017-08-15

* data: optional model loading

## 0.7.2 // 2017-08-15

* log: write to graylog (UDP, not-configurable yet); add new property: `app.log`
* HBS: rename helper __ => t, and make it alive (still a dirty implementation)
* auth: load `passport` user to `res.locals.user`
* security: set default cookie domain in config

## 0.7.1 // 2017-08-07

* new config object `Config`. Access to configuration only with `app.config.get('path')`
* config files must have `volebo` as root node
* easy to load config from the environment, using variables like `volebo_model_enabled`
* add `log` dir to git, because FYTIW (new bug: gh see #22)
* set default value for `session.domains`: `['volebo.net']`
* accurate model create/dispose
* use [`express-flash`](https://www.npmjs.com/package/express-flash) (gh see #24)

* well-tune `istanbul` (coverage tool)

## 0.6.1 // 2017-08-06

This record includes changes from previos releases

* remove getnodeenv (app should not care about env)
* use bunyan logger as common logger
* CONFIG: renaming: `model.db` => `db.connection`
* new field for app: `app.passport`
* I18N: `app.lang.loadTranslation` - for loading translations to App memory
* HBS: move views to new folder
* HBS: reorganize helpers (init through function)
* ERROR handling: fixed bug with unaccessible layout for error-rendering
* migrate to `bunyan` (instead of `morgan`) for logging (see #2)

* see #2

## 0.3.1

* autopublish from travis

## 0.3.0

* new eslint-rules
* simplified get-node-env scripts (removed `lodash` dep)
* change copyright years
* stub for helpers (see #17)

## 0.2.9 // 2016-12-10

* use helmet
* better main contructor
* better NODE_ENV handling
* set `trust proxy`
* reorganize tests

* fix #12
* fix #9
* fix #16

## 0.2.8 // 2016-12-03

* set timezone to **UTC** for `knex` in the `config`
* more docs

* fix #15

## 0.2.7 // 2016-11-04

* Config: pretty JSON for dev-env
* disable `x-powered-by`
* `config.db` moved to `config.model.db`
* autoload model (`volebo-data`)
* listening on local path (not host:port), handle existing socket correctly
