# volebonet-express

[![bitHound Overall Score](https://www.bithound.io/github/VoleboNet/volebonet-express/badges/score.svg)](https://www.bithound.io/github/VoleboNet/volebonet-express)
[![bitHound Dependencies](https://www.bithound.io/github/VoleboNet/volebonet-express/badges/dependencies.svg)](https://www.bithound.io/github/VoleboNet/volebonet-express/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/VoleboNet/volebonet-express/badges/devDependencies.svg)](https://www.bithound.io/github/VoleboNet/volebonet-express/master/dependencies/npm)

Express JS server for Volebo.Net

## Usage

First, use this project as a dependency for your project. Right now there is a lot of tiny fixes in the source code, so the best way - use `npm link`, not `npm install`.

Then, just follow this sample:

```javascript
"use strict";

// require the module:
const vbexpress       = require('@volebonet/volebonet-express');

// create an instance with appropriate options:
var app = vbexpress( { "options" : "your options here"} );

// Add routes:
var routes = require('./routes/index');
app.use('/', routes);

// start handling
app.start();
```

## Additional properties

#### `app.config`

Custom configuration of the server. It contains our own crutches and fixes.

#### `app.hbs`

Handlebars engine

#### `app.lang`

Express router, created by the [express-mw-lang] module.

### Request and Response

`req` and `res` are extended with additional fields. Here is a description of such fields.

The **expressjs** often works behind NGINX (reverse proxy), in this case frontend server performs a lot of work (encryption, compressing..). The backend should know several things about FE server.

#### `res.locals.lang`

The extensions for res.locals, generated by the [express-mw-lang] module.

#### `req.lang`

See [`res.locals.lang`](#res-locals-lang)

#### `req.forwardedSecure`

Describes, whether the frontend server currently handles HTTPS query (after proxifying it becomes HTTP).

## Credits

All thanks and praises goes to:

* [ExpressJS](http://expressjs.com) and many contributors of the [ExpressJS org](https://github.com/expressjs)
* [Express Handlebars](https://github.com/ericf/express-handlebars)

## License

Please, follow the link: [LICENSE](LICENSE)

[express-mw-lang]: ../../../express-mw-lang
