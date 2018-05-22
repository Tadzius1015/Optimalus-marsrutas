// JavaScript source code
function toggleChildren(id) {
    var x = document.getElementById('Map');
    x.style.display = "none";
    x = document.getElementById('Main');
    x.style.display = "none";
    x = document.getElementById('AboutUs');
    x.style.display = "none";
    x = document.getElementById('Instruction');
    x.style.display = "none";
    var elem = document.getElementById(id);
    if (elem.id == "Main") {
        if (elem.style.display == "none") {
            elem.style.display = "block";
        }
    }
    if (elem.id == "Map") {
        if (elem.style.display == "none") {
            elem.style.display = "block";
        }
    }
    if (elem.id == "AboutUs") {
        if (elem.style.display == "none") {
            elem.style.display = "block";
        }
    }
    if (elem.id == "Instruction") {
        if (elem.style.display == "none") {
            elem.style.display = "block";
        }
    }
}
function initMap() {
    var uluru = { lat: 54.902434, lng: 23.940171 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: uluru
    });
}