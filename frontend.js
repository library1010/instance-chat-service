$(function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    var connection = new WebSocket('ws:/127.0.0.1:1337');
    connection.onopen = function() {
        // Connection is opened and ready to use
    };

    connection.onerror = function(error) {

    };

    connection.onmessage = function(message) {
        var messageData = message.data;
        try {
            var json = JSON.parse(messageData);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ' + messageData);
            return;
        }
    };
});
