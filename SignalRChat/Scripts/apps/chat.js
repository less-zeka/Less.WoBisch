$(function () {
    var userLocationLatitude;
    var userLocationLongitude;
    var userName;
    var options;
    var userMarkers = [];
    var userIcons = [];

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

        chat.server.updatePosition(userLocationLatitude, userLocationLongitude);
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

        if (userIcons[name] == undefined) {
            userIcons[name] = getIcon(Object.keys(userIcons).length);
        }
        createMarker(userName, userLocationLatitude, userLocationLongitude, userIcons[name]);
    };

    function createMarker(name, lat, lon, icon) {
        console.log("log: createMarker(...)");
        if (userMarkers[name] != undefined) {
            userMarkers[name].setMap(null);
            console.log("log: createMarker(...) --> found a userMarker! was i able to delete it?");
        }
        console.log("log: createMarker(...) --> DID NOT found a userMarker! was i able to delete it?");

        var marker = {};
        marker = new window.google.maps.Marker({
            position: new window.google.maps.LatLng(lat, lon),
            map: map,
            title: name,
            icon: icon
        });
        userMarkers[name] = marker;

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
        console.log("log: updatePosition, name: " + name);

        if (userIcons[name] == undefined) {
            console.log("log: updatePosition, userIcons[name] was undefined ");
            userIcons[name] = getIcon(Object.keys(userIcons).length);
        }
        else{
            console.log("log: updatePosition, userIcons[name] WASNOT!!! undefined ");
        }
        console.log("log: updatePosition, now we have " + Object.keys(userIcons).length + "items");
        createMarker(name, latitude, longitude, userIcons[name]);
    };

    function getIcon(counter) {
        console.log("getIcon(), counter: " + counter);
        if (counter == 0) {
            return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }
        else if (counter == 1) {
            return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
        }
        else if (counter == 2) {
            return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        }
        else if (counter == 3) {
            return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        } 
        else {
            return 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
        }

    }
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
