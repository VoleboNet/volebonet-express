# CHANGELOG

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
