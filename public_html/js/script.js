
var SERVER_HOST = "http://localhost:8888/AlertInundation-Server/index.php";
var USER_ID;
var map;
$(document).ready(function() {
    map = GMaps({
        div: "#googlemap",
        lat: 6.366130,
        lng: 2.432906
    });
    map.setContextMenu({
        control: 'map',
        options: [{
                title: "Ajouter une zone inondée",
                name: 'add_a_marker',
                action: function(e) {
                    showAddMarketDialog(e.latLng.lat(), e.latLng.lng());
                }
            }]
    })
    $.get(SERVER_HOST, {
        'get-places': 'true'
    }, function(data, status) {
        addMarkers(JSON.parse(data));
    })
    $.get(SERVER_HOST, {
        'get-comments': 'true'
    }, function(data, status) {
        addComments(JSON.parse(data));
    })
    $(document).on('click', '.confirm', function(){
        console.log(this);
        sendConfirmPlace($(this).attr('data-id'));
    });
});

function getUserId() {
    return localStorage.getItem("user-id");
}
function setUserId(id) {
    localStorage.setItem('user-id', id);
}
function sendUser(email, pseudo, image) {
    $.post(SERVER_HOST, {
        'add-user': 'true',
        'email': email,
        'pseudo': pseudo,
        'image': image
    }, function(data, status) {
        USER_ID = data;
    });
}

function showAddMarketDialog(lat, lng) {
    $('#lat').val(lat)
    $('#lng').val(lng)
    $('#add-place-modal').foundation('reveal', 'open')
}
function addPlace() {
    $('#add-place-modal').foundation('reveal', 'close')
    var lat = $('#lat').val(), lng = $('#lng').val(), nom = $('#nom').val(), contenu = $('#contenu').val()
    $.post(SERVER_HOST, {
        'new-place': 'true',
        'lat': lat,
        'lng': lng,
        'nom': nom,
        'id-user': USER_ID,
        'comment': contenu,
    }, function(data, status) {
        var image = {
            url: 'img/green.png',
            // This marker is 20 pixels wide by 32 pixels tall.
            size: new google.maps.Size(36, 50),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(18, 50)
        };
        map.addMarker({
            lat: lat,
            lng: lng,
            title: nom,
            icon: image,
            infoWindow: {
                content: getInfoBulleCode(nom, 1)
            }
        });
    });
}
function getInfoBulleCode(nom, nbr, id) {
    var text = "<h4>" + nom + "</h4>";
    text+="<a href='#' class='confirm' data-id='"+id+"'>Confirmer</a>";
    if (nbr < 5) {
        text += "<p>Zone à risque faible</p>";
    }
    else if (nbr >= 5 && nbr < 10) {
        text += "<p>Zone à risque moyen</p>";
    } else {
        text += "<p>Zone à risque très élevé</p>";
    }
    
    return text;
}
function addMarkers(markersJson) {
    console.log(markersJson)
    for (var i = 0; i < markersJson.length; i++) {
        var imageUrl = 'img/';
        if (markersJson[i].nbr < 5) {
            imageUrl += "green.png";
        }
        else if (markersJson[i].nbr >= 5 && markersJson[i].nbr < 10) {
            imageUrl += "orange.png";
        } else {
            imageUrl += "red.png";
        }
        var image = {
            url: imageUrl,
            // This marker is 20 pixels wide by 32 pixels tall.
            size: new google.maps.Size(36, 50),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(18, 50)
        };
        
        map.addMarker({
            lat: markersJson[i].lat,
            lng: markersJson[i].lng,
            title: markersJson[i].nom,
            icon: image,
            infoWindow: {
                content: getInfoBulleCode(markersJson[i].nom, markersJson[i].nbr, markersJson[i].id)
            }
        });
    }
}
var delay = 4000;
var count = 6;// How much items to animate
function addComments(commentsJson) {
    count = commentsJson.length;
    for (var i = 0; i < commentsJson.length; i++) {
        var text = "<div class='com' id='feed"+i+"' style='display:none'>" +
                "<img src='" + commentsJson[i].image + "' alt='" + commentsJson[i].pseudo + "'/>" +
                "<span class='name'>" + commentsJson[i].pseudo + "</span>" +
                "<p>" + commentsJson[i].contenu + "</p>" +
                "</div>";
        $('#comments-content').append($(text));
        
    }
    setTimeout('shift()', delay);
    
}
// Animated feed
 // you can change it
var showing = 5; //How much items to show at a time
var anIndex = 0;
function move(anIndex) {
    return function() {
        $('#feed' + anIndex).remove().css('display', 'none').prependTo('#comments-content');
    };
}
function shift() {
    var toShow = (anIndex + showing) % count;
    $('#feed' + toShow).slideDown(1000, move(anIndex));
    $('#feed' + anIndex).slideUp(1000, move(anIndex));
    console.log(toShow, anIndex, count, showing);
    anIndex = (anIndex + 1) % count;
    setTimeout('shift()', delay);
}
function sendConfirmPlace(id){
    $.get(SERVER_HOST, {
        'confirm-place': 'true',
        'id': id
    }, function(data, status) {
        alert('Confirmé');
    });
}