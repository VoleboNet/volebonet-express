
This is the history of changes of the `@volebo/express` package

> This file should be filled by maintainers, using pull requests
> Please, follow this [guide](http://keepachangelog.com/en/0.3.0/)

## unreleased // ???

* new config object `Config`. Access to configuration only with `app.config.get('path')`

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
