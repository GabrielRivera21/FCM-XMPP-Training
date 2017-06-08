/**
 * FCM XMPP Settings
 */
const nconf = require('nconf');
const ENV = nconf.get('ENVIRONMENT');
const SENDER_ID = nconf.get('FCM_SENDER_ID');
const SERVER_KEY = nconf.get('FCM_SERVER_KEY');

// XMPP Library
var XMPP = require('node-xmpp-client');
const uuid = require('uuid/v4');


// TODO: Dev Training: Create Client

console.log("Client Built");

// TODO: Dev Training: Create Message Queue

// TODO: Dev Training: Add Helper methods

function printJSONStanzaData(data) {
  console.log('[START Stanza]: ');
  for(var key in data) {
    console.log(`${key}:`, data[key]);
  }
  console.log('[END Stanza]');
}


// TODO: Dev Training: ADD Client listeners.
