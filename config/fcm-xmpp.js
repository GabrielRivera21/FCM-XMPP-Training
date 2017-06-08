/**
 * FCM XMPP Settings
 */
const nconf = require('nconf');
const ENV = nconf.get('ENVIRONMENT');
const SENDER_ID = nconf.get('FCM_SENDER_ID');
const SERVER_KEY = nconf.get('FCM_SERVER_KEY');

// XMPP Library
var XMPP = require('node-xmpp-client');
const uuidV4 = require('uuid/v4');


// create the client and provide credentials
// reference: http://node-xmpp.org/doc/client.html
var client = new XMPP.Client({
  jid: `${SENDER_ID}@gcm.googleapis.com`, //username for CCS
  password: SERVER_KEY,
  host: 'fcm-xmpp.googleapis.com',
  port: ENV === "development" ? 5236 : 5235, // 5235 for production and 5236 for testing.
  reconnect: true, // we want to reconnect whenever CCS disconnects us.
  legacySSL: true, // GCS requires legacySSL,
  preferredSaslMechanism: 'PLAIN' // as per docs on FCM
});

console.log("Client Built");

// hold new messages in queue whenever
// CCS sends us a connection draining message
var msg_queue = [];
var isConnectionDraining = false; // flag for CONNECTION_DRAINING message

/**
 * Helper method to build Stanza with the payload
 * @param payload:
 */
var buildStanza = function(payload) {
    var uid = uuidV4(); // generate unique ID
    payload.message_id = `m-${uid}`;
    var stanza = new XMPP.Stanza('message', {id: payload.message_id })
      .c('gcm', {'xmlns': 'google:mobile:data'})
        .t(JSON.stringify(payload));
    return stanza;
}

var buildAckStanza = function(payload) {
  var stanza = new XMPP.Stanza('message', {id: payload.message_id})
        .c('gcm', {'xmlns': 'google:mobile:data'})
        .t(JSON.stringify({
          to: payload.from,
          message_id: payload.message_id,
          message_type: "ack"
        }));
  return stanza;
};


var sendAckMessage = function(xmpp_client, payload) {
  var ackStanza = buildAckStanza(payload);
  xmpp_client.send(ackStanza);
  return true;
}

var sendMessage = function(payload, xmpp_client) {
  if(!xmpp_client) {
    xmpp_client = this; // verify if it was sent from the main export
  }
  if(!(xmpp_client instanceof XMPP.Client)) {
    return false;
  }
  if(isConnectionDraining) {
    msg_queue.push(payload);
    return false;
  }
  var stanza = buildStanza(payload);
  xmpp_client.send(stanza);
  return true;
};

function printJSONStanzaData(data) {
  console.log('[START Stanza]: ');
  for(var key in data) {
    console.log(`${key}:`, data[key]);
  }
  console.log('[END Stanza]');
}


client.on('online', function() {
  console.log('online')

});

client.on('offline', function () {
  console.log('Client is offline')
});

client.on('disconnect', function (e) {
  console.log('Client is disconnected', client.connection.reconnect, e)
});

client.on('close', function () {
    console.log('closed');
});

client.on('error', function (e) {
  console.error(e)
});

client.on('stanza', function(stanza) {
  console.log("Incoming Stanza: ", stanza);
  // TODO: Handle incoming messages from CCS.
  console.log('Incoming stanza: ', stanza.toString() + "\n");

  if (stanza.is('message') && stanza.attrs.type !== 'error') {
    var data = JSON.parse(stanza.getChildText('gcm'));

    if (!data || !data.message_id) {
        return;
    }

    printJSONStanzaData(data);

    switch (data.message_type) {
        case 'control':
            if (data.control_type === 'CONNECTION_DRAINING') {
              isConnectionDraining = true;
            }
            break;
        case 'nack':
            // TODO: Take action depending on response code for nack
            break;
        case 'ack':
            // just print it out for dev purposes
            // we can mark the notification as successfully sent on our side.
            if (data.message_id) {
              // TODO: ignore it or do something, this means CCS received
              // successfully the message.
            }
            break;
        case 'receipt':
        default: {
            // An Upstream from client or receipt: Send ack, as per spec
            if (data.from) {
                sendAckMessage(client, data);
            }
            break;
        }
    }
  }
});

module.exports = client;
module.exports.sendMessage = sendMessage;
