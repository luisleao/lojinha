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



// var email = require('./email');
// email.init(config.sendgrid);
// email.send_payment(config.products["coletor-gertec-tc504"]);



// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));




// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.get('/', routes.index);
app.get('/:id/create', routes.create);
app.get('/:id/execute', routes.execute);
app.get('/:id/status', routes.status);
app.get('/:id/cancel', routes.cancel);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
