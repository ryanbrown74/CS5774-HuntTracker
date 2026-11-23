// create-map.js - Initializes the Leaflet map for the create hunt page

const $ = window.$;
let map;
let marker = null;
let circle = null;

$(document).ready(function() {
    initMap();
    handleCoordinateChange();
    handleRadiusChange();
    loadUrlParameters();
});

function loadUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const radius = urlParams.get('radius');

    if (lat && lng) {
        $('#hunt-lat').val(parseFloat(lat).toFixed(6));
        $('#hunt-long').val(parseFloat(lng).toFixed(6));
        // Trigger input event to update map
        $('#hunt-lat, #hunt-long').trigger('input');
    }

    if (radius) {
        $('#hunt-radius').val(parseInt(radius));
        // Trigger input event to update circle
        $('#hunt-radius').trigger('input');
    }
}

function initMap() {
    // Initialize the map centered on a default location
    map = L.map('create-map').setView([42.8, -75.5], 8);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function handleCoordinateChange() {
    $('#hunt-lat, #hunt-long').on('input', function() {
        const lat = parseFloat($('#hunt-lat').val());
        const lng = parseFloat($('#hunt-long').val());
        
        // Only update if both coordinates are valid numbers
        if (!isNaN(lat) && !isNaN(lng)) {
            updateMapMarker(lat, lng);
        }
    });
}

function updateMapMarker(lat, lng) {
    const latlng = [lat, lng];
    
    // Remove existing marker and circle
    if (marker) {
        map.removeLayer(marker);
    }
    if (circle) {
        map.removeLayer(circle);
    }
    
    // Create new marker
    marker = L.marker(latlng).addTo(map);
    
    // Create circle with current radius
    const radiusYards = parseInt($('#hunt-radius').val()) || 100;
    const radiusMeters = radiusYards * 0.9144;
    
    circle = L.circle(latlng, {
        radius: radiusMeters,
        color: 'black',
        fillColor: 'rgba(0, 0, 0, 0.1)',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(map);
    
    // Zoom to the marker
    map.setView(latlng, 16);
}

function handleRadiusChange() {
    $('#hunt-radius').on('input', function() {
        const radiusYards = parseInt($(this).val()) || 100;
        
        if (circle && marker) {
            const radiusMeters = radiusYards * 0.9144;
            circle.setRadius(radiusMeters);
        }
    });
}
