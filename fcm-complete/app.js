var express = require('express');

var app = new express();

require('./config/express')(app); // configure express framework and env file.
require('./config/routes')(app); // configure routes.
require('./config/fcm-xmpp'); // construct xmpp client.

module.exports = app;
