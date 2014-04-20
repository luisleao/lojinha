'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// configuration
try {
  var configJSON = fs.readFileSync(__dirname + "/config.json");
  var config = JSON.parse(configJSON.toString());
} catch (e) {
  console.error("File config.json not found or is invalid: " + e.message);
  process.exit(1);
}
routes.init(config);

// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');




var connect = require('connect');


var app = connect()
	.use(require('compression')())
	.use(require('cookie-session')({
		keys: ['secret1', 'secret2']
	}))
	.use(require('body-parser')())
	.use(require('static-favicon')())
	.use(require('morgan')('dev'))
	.use(require('method-override')())

	//.use(app.router)
	.use(express.static(path.join(__dirname, 'public')))
	.use(function(req, res){
		res.end('Hello from Connect!\n');
	});






// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.get('/', routes.index);
app.get('/create', routes.create);
app.get('/execute', routes.execute);
app.get('/cancel', routes.cancel);

express.createServer( Cookies.express( keys ) )

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});