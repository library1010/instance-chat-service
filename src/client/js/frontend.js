$(function() {
    'use strict'

    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    var myColor = false;
    var myName = false;

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        errorPage("Sorry, but your browser doesn't support WebSocket");
        input.hide();
        $('span').hide();
        return;
    }

    var connection = new WebSocket('ws://127.0.0.1:1336');

    connection.onopen = () => {
        enableInput();
        changeStatus('Choose name:');
    };

    connection.onerror = () => errorPage("Sorry, but there's some problems with your connection or the server is down.");

    connection.onmessage = function(message) {
        var messageData = message.data;
        try {
            var json = JSON.parse(messageData);
        } catch (e) {
            console.log("This doesn't look like a valid JSON: " + messageData);
            return;
        }

        var type = json.type;
        var data = json.data;
        changeColor(type, data, myName);
        reviseChatHistory(type, data);
        appendChatMessage(type, data);
        console.log("Hm..., I've never seen JSON like this: ", json);
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
            disableInput();

            if (myName === false) {
                myName = msg;
            }
        }
    });

    setInterval(function() {
        if (connection.readyState !== 1) {
            changeStatus('Error');
            disableInput();
            input.val('Unable to communicate with the WebSocket server.');
            return;
        }
        enableInput();
    }, 3000);

    /**
    * Functions
    */
    function appendChatMessage(type, messageData) {
        if (type !== 'message') {
            return;
        }
        enableInput();
        addMessage(messageData.author, messageData.text, messageData.color, new Date(messageData.time));
    }

    function reviseChatHistory(type, histories) {
        if (type !== 'history') {
            return;
        }
        histories.forEach((e) => addMessage(e.author, e.text, e.color, new Date(e.time)));
    }

    function changeColor(type, color, name) {
        if (type !== 'color') {
            return;
        }
        changeStatus(name + ': ');
        changeStatusColor(color);
        enableInput();
        input.focus();
    }

    function enableInput() {
        input.removeAttr('disabled');
    }

    function changeStatus(newStatus) {
        status.text(newStatus);
    }

    function changeStatusColor(color) {
        status.css('color', color);
    }

    function errorPage(message) {
        content.html($('<p>', {text: message}));
    }

    function disableInput() {
        input.attr('disabled', 'disabled');
    }

    function addMessage(author, message, color, dateTime) {
        content.prepend('<p>' + '<span style="color:' + color + '">' + author + '</span> @ ' + getTime(dateTime) + ': ' + message + '</p>');
    }

    function getTime(dateTime) {
        var hour = dateTime.getHours();
        var min = dateTime.getMinutes();
        return hour + ':' + min;
    }
});
