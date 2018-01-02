"use strict";

process.title = 'node-chat';

var webSocketServerPort = 1337;

// Import
var WebSocketServer = require('websocket').server;
var http = require('http');

/**
* Global variables
*/
// Latest 100 messages
var history = [];
var clients = [];

function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
colors.sort(function(a, b) {
    return Math.random() > 0.5;
});

/**
* HTTP servers
*/
var server = http.createServer(function(request, response) {
    // Nothing to do
}).listen(1337, function() {
    consoleMessage('Server is listening on port ' + webSocketServerPort)
});

/**
* WebSocker server
*/
var wsServer = new WebSocketServer({
    httpServer: server
}).on('request', function(request) {
    consoleMessage('Connection from origin' + request.origin);
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    consoleMessage('Connection accepted.');
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify(createJsonData('history', history)));
    }

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            if (userName === false) {
                userName = htmlEntities(message.utf8Data);
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify(createJsonData('color', userColor)));
                consoleMessage('User is known as ' + userName + ' with ' + userColor + ' color.');
                return;
            }

            consoleMessage('Received message from ' + userName + ': ' + message.utf8Data);
            var historyEntry = {
                time: (new Date()).getTime(),
                text: htmlEntities(message.utf8Data),
                author: userName,
                color: userColor
            };
            history.push(historyEntry);
            history = history.slice(-100);

            var json = JSON.stringify(createJsonData('message', historyEntry));
            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
        }
    });

    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            consoleMessage('Peer ' + connection.remoteAddress + ' disconnected.');
            clients.splice(index, 1);
            colors.push(userColor);
        }
    });
});

function consoleMessage(message) {
    console.log((new Date()) + ' ' + message);
}

function createJsonData(typeVar, dataVar) {
    return {
        type: typeVar,
        data: dataVar
    };
}
