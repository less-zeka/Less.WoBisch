$(function () {
    var userLocationLatitude;
    var userLocationLongitude;
    var userName;
    var options;
    var userMarkers = [];

    id = navigator.geolocation.watchPosition(success, error, options);

    navigator.geolocation.getCurrentPosition(function (position) {
        userLocationLatitude = position.coords.latitude;
        userLocationLongitude = position.coords.longitude;
        showMap();
    });

    function success(position) {
        console.log("log: success");
        userLocationLatitude = position.coords.latitude;
        userLocationLongitude = position.coords.longitude;
        //createMarker(userName, userLocationLatitude, userLocationLongitude, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');

        chat.server.updatePosition(userName, userLocationLatitude, userLocationLongitude);
    }

    function error(err) {
        alert('ERROR(' + err.code + '): ' + err.message);
    };

    function showMap() {
        //window.google.maps.visualRefresh = true;
        var center = new window.google.maps.LatLng(userLocationLatitude, userLocationLongitude);

        // These are options that set initial zoom level, where the map is centered globally to start, and the type of map to show
        var mapOptions = {
            zoom: 18,
            center: center,
            mapTypeId: window.google.maps.MapTypeId.G_NORMAL_MAP
        };

        // This makes the div with id "map_canvas" a google map
        map = new window.google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        createMarker(userName, userLocationLatitude, userLocationLongitude, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    };

    function createMarker(name, lat, lon, icon) {
        if (userMarkers[name != undefined]) {
            userMarkers[name].setMap(null);
        }
        console.log("log: createMarker(...)");
        var marker = {};
        marker = new window.google.maps.Marker({
            position: new window.google.maps.LatLng(lat, lon),
            map: map,
            title: name,
            icon: icon
        });
        userMarkers[name] = marker;
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

    chat.client.updateConnectedUsers = function () {
        $("#userLegend").load('/Home/UserLegend');
    };

    chat.client.updatePosition = function (name, latitude, longitude) {
        console.log("log: updatePosition, name: "+name);
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
            chat.server.send($('#message').val());
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
