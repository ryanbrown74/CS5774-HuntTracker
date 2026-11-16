// map.js - Initializes the Leaflet interactive map

$(document).ready(function() {
    initMap();
});

function initMap() {
    // Initialize the map centered on a default location (e.g., center of NY state)
    const map = L.map('map').setView([42.8, -75.5], 8);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}
