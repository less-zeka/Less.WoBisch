$(function () {
    var userLocationLatitude;
    var userLocationLongitude;
    var userName;
    var options;

    id = navigator.geolocation.watchPosition(success, error, options);

    navigator.geolocation.getCurrentPosition(function (position) {
        userLocationLatitude = position.coords.latitude;
        userLocationLongitude = position.coords.longitude;
        showMap();
    });

    function success(position) {
        userLocationLatitude = position.coords.latitude;
        userLocationLongitude = position.coords.longitude;
        createMarker(userName, userLocationLatitude, userLocationLongitude, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    }

    function error(err) {
        alert('ERROR(' + err.code + '): ' + err.message);
    };

    function showMap() {
        window.google.maps.visualRefresh = true;
        var center = new window.google.maps.LatLng(userLocationLatitude, userLocationLongitude);

        // These are options that set initial zoom level, where the map is centered globally to start, and the type of map to show
        var mapOptions = {
            zoom: 13,
            center: center,
            mapTypeId: window.google.maps.MapTypeId.G_NORMAL_MAP
        };

        // This makes the div with id "map_canvas" a google map
        map = new window.google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        createMarker(userName, userLocationLatitude, userLocationLongitude, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    };

    function createMarker(name, lat, lon, icon) {
        var marker = {};
        marker = new window.google.maps.Marker({
            position: new window.google.maps.LatLng(lat, lon),
            map: map,
            title: name,
            icon: icon
        });
        //marker.setIcon(icon);
        return marker;
    }

    // Declare a proxy to reference the hub.
    var chat = $.connection.chatHub;
    // Create a function that the hub can call to broadcast messages.
    chat.client.broadcastMessage = function (name, message) {
        // Html encode message.
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();
        // Add the message to the page.
        $('#discussion').append('<li><strong>' + encodedName
            + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');
    };

    chat.client.updatePosition = function (name, latitude, longitude) {
        //alert(1);
        createMarker(name, latitude, longitude, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    };
    //

    // Set initial focus to message input box.
    $('#message').focus();
    // Start the connection.
    $.connection.hub.start().done(function () {
        chat.server.updatePosition(userName, userLocationLatitude, userLocationLongitude);
        $('#sendmessage').click(function () {
            // Call the Send method on the hub.
            //TODO send to desired user!
            chat.server.send($('#message').val(), "user2");
            // Clear text box and reset focus for next comment.
            $('#message').val('').focus();
        });
        $('#message').keypress(function (e) {
            var key = e.which;
            if (key == 13)  // the enter key code
            {
                $('#sendmessage').click();
                return false;
            }
        });
    });
});




///// <reference path="../knockout-3.2.0.debug.js" />
///// <reference path="../jquery-1.8.3.intellisense.js" />
///// <reference path="../jquery.signalR-1.0.0-rc1.js" />

//(function () {

//    function Message(from, msg, isPrivate) {
//        this.from = ko.observable(from);
//        this.message = ko.observable(msg);
//        this.isPrivate = ko.observable(isPrivate);
//    }

//    function User(name) {

//        var self = this;

//        self.name = ko.observable(name);
//        self.isPrivateChatUser = ko.observable(false);
//        self.setAsPrivateChat = function (user) {
//            viewModel.privateChatUser(user.name());
//            viewModel.isInPrivateChat(true);
//            $.each(viewModel.users(), function (i, user) {
//                user.isPrivateChatUser(false);
//            });
//            self.isPrivateChatUser(true);
//        };
//    }

//    var viewModel = {
//        messages: ko.observableArray([]),
//        users: ko.observableArray([]),
//        isInPrivateChat: ko.observable(false),
//        privateChatUser: ko.observable(),
//        exitFromPrivateChat: function () {

//            viewModel.isInPrivateChat(false);
//            viewModel.privateChatUser(null);
//            $.each(viewModel.users(), function (i, user) {
//                user.isPrivateChatUser(false);
//            });
//        }
//    };

//    $(function () {

//        var chatHub = $.connection.chatHub,
//            loginHub = $.connection.login,
//            $sendBtn = $('#btnSend'),
//            $msgTxt = $('#txtMsg');

//        // turn the logging on for demo purposes
//        $.connection.hub.logging = true;

//        chatHub.client.received = function (message) {
//            viewModel.messages.push(new Message(message.sender, message.message, message.isPrivate));
//        };

//        chatHub.client.userConnected = function (username) {
//            viewModel.users.push(new User(username));
//        };

//        chatHub.client.userDisconnected = function (username) {
//            viewModel.users.pop(new User(username));
//            if (viewModel.isInPrivateChat() && viewModel.privateChatUser() === username) {
//                viewModel.isInPrivateChat(false);
//                viewModel.privateChatUser(null);
//            }
//        };

//        startConnection();
//        ko.applyBindings(viewModel);

//        function startConnection() {

//            $.connection.hub.start().done(function () {

//                toggleInputs(false);
//                bindClickEvents();

//                $msgTxt.focus();

//                chatHub.server.getConnectedUsers().done(function (users) {
//                    $.each(users, function (i, username) {
//                        viewModel.users.push(new User(username));
//                    });
//                });

//            }).fail(function (err) {

//                console.log(err);
//            });
//        }

//        function bindClickEvents() {

//            $msgTxt.keypress(function (e) {
//                var code = (e.keyCode ? e.keyCode : e.which);
//                if (code === 13) {
//                    sendMessage();
//                }
//            });

//            $sendBtn.click(function (e) {

//                sendMessage();
//                e.preventDefault();
//            });
//        }

//        function sendMessage() {
//            alert("jo");
//            var msgValue = $msgTxt.val();
//            if (msgValue !== null && msgValue.length > 0) {

//                if (viewModel.isInPrivateChat()) {

//                    chatHub.server.send(msgValue, viewModel.privateChatUser()).fail(function (err) {
//                        console.log('Send method failed: ' + err);
//                    });
//                }
//                else {
//                    chatHub.server.send(msgValue).fail(function (err) {
//                        console.log('Send method failed: ' + err);
//                    });
//                }
//            }

//            $msgTxt.val(null);
//            $msgTxt.focus();
//        }

//        function toggleInputs(status) {

//            $sendBtn.prop('disabled', status);
//            $msgTxt.prop('disabled', status);
//        }
//    });
//}());