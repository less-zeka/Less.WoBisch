$(function() {
    var userLocationLatitude;
    var userLocationLongitude;
    var userName;
    var userMarkers = [];
    var userIcons = [];
    // Declare a proxy to reference the hub.
    var chatAndFindHub = $.connection.chatAndFindHub;

    // occurs on watchPosition success --> update server!
    function success(position) {
        console.log("positionchanged!");
        userLocationLatitude = position.coords.latitude;
        userLocationLongitude = position.coords.longitude;
        chatAndFindHub.server.updatePosition(userLocationLatitude, userLocationLongitude);
    }

    // occurs on watchPosition Error
    function error(err) {
        alert('ERROR(' + err.code + '): ' + err.message);
    };

    //TODO i'd like the map to show all the markers, set the zoom level according to that!
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
    };

    function createMarker(name, lat, lon, icon) {
        if (userMarkers[name] != undefined) {
            userMarkers[name].setMap(null);
        }

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


    // Create a function that the hub can call to broadcast messages.
    chatAndFindHub.client.broadcastMessage = function(name, message) {
        // Html encode message.
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();
        // Add the message to the page.
        $('#discussion').append('<li><strong>' + encodedName
            + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');
    };

    chatAndFindHub.client.updateConnectedUsers = function() {
        $("#userLegend").load('/Home/UserLegend');
    };

    chatAndFindHub.client.updatePosition = function(name, latitude, longitude) {

        if (userIcons[name] == undefined) {
            userIcons[name] = getIcon(Object.keys(userIcons).length);
        }

        createMarker(name, latitude, longitude, userIcons[name]);
    };

    // TODO don't like this solution
    function getIcon(counter) {
        if (counter == 0) {
            return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        } else if (counter == 1) {
            return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
        } else if (counter == 2) {
            return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        } else if (counter == 3) {
            return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        } else if (counter == 4) {
            return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
        } else if (counter == 5) {
            return 'http://maps.google.com/mapfiles/ms/micons/ltblue-dot.png';
        } else if (counter == 6) {
            return 'http://maps.google.com/mapfiles/ms/micons/orange-dot.png';
        } else {
            return 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
        }

    }

    // Set initial focus to message input box.
    $('#message').focus();

    // Start the connection.
    $.connection.hub.start().done(function() {
        // register to position changes
        id = navigator.geolocation.watchPosition(success, error);

        navigator.geolocation.getCurrentPosition(function(position) {
            userLocationLatitude = position.coords.latitude;
            userLocationLongitude = position.coords.longitude;
            showMap();
        });
        chatAndFindHub.server.updatePosition(userName, userLocationLatitude, userLocationLongitude);
        $('#sendmessage').click(function() {
            // Call the Send method on the hub.
            chatAndFindHub.server.send($('#message').val());
            // Clear text box and reset focus for next comment.
            $('#message').val('').focus();
        });
        $('#message').keypress(function(e) {
            var key = e.which;
            if (key == 13) // the enter key code
            {
                $('#sendmessage').click();
                return false;
            }
            return null;
        });
    });
});