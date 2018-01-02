$(function() {
    'use strict'

    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    var myColor = false;
    var myName = false;

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        content.html($('<p>', {text: 'Sorry, but your browser doesn\'t support WebSocket'}));
        input.hide();
        $('span').hide();
        return;
    }

    var connection = new WebSocket('ws:/127.0.0.1:1337');
    connection.onopen = startConnection;

    function startConnection() {
        input.removeAttr('disabled');
        status.text('Choose name:');
    }

    connection.onerror = function(error) {
        content.html($('<p>', {text: 'Sorry, but there\'s some problems with your connection or the server is down.'}));
    };

    connection.onmessage = function(message) {
        var messageData = message.data;
        try {
            var json = JSON.parse(messageData);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ' + messageData);
            return;
        }

        if (json.type === 'color') {
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').forcus();
            return;
        }

        if (json.type === 'history') {
            for (var i = 0; i < json.data.length; i++) {
                var jsonData = json.data[i];
                addMessage(jsonData.author, jsonData.text, jsonData.color, new Date(jsonData.time));
            }
            return;
        }

        if (json.type === 'message') {
            input.removeAttr('disabled');
            addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
            return;
        }

        console.log('Hm..., I\'ve never seen JSON like this: ', json);
    };

    input.keydown(function(e) {
        // Enter
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            connection.send(msg);
            $(this).val('');
            input.attr('disabled', 'disabled');

            if (myName === false) {
                myName = msg;
            }
        }
    });

    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to communicate with the WebSocket server.');
            return;
        }
        startConnection();
    }, 3000);

    function addMessage(author, message, color, dateTime) {
        content.prepend(
            '<p>' + '<span style="color:' + color + '">' + author + '</span> @ ' + getTime(dateTime) + ': ' + message + '</p>');
    }

    function getTime(dateTime) {
        var hour = dateTime.getHours();
        var min = dateTime.getMinutes();
        return hour + ':' + min;
    }
});
