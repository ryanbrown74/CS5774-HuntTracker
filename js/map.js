// map.js - Initializes the Leaflet interactive map

import pb from './pb.js';

const $ = window.$;
let map;
let isCreateMode = false;
let selectedMarker = null;
let selectedCircle = null;
let huntMarkers = [];
let selectedHuntMarker = null;

$(document).ready(function() {
    initMap();
    handleCreateButton();
    loadHuntMarkers();
});

function initMap() {
    // Initialize the map centered on a default location (e.g., center of NY state)
    map = L.map('map').setView([42.8, -75.5], 8);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Handle map clicks when in create mode
    map.on('click', function(e) {
        if (isCreateMode) {
            handleMapClick(e.latlng);
        }
    });
}

function handleCreateButton() {
    const $button = $('#create-new-map-button');
    const $mapContainer = $('#map-container');

    $button.on('click', function() {
        isCreateMode = !isCreateMode;
        
        if (isCreateMode) {
            $button.text('Cancel');
            $mapContainer.addClass('create-mode');
        } else {
            $button.text('Create new');
            $mapContainer.removeClass('create-mode');
        }
        clearSelection();
    });
}

function handleMapClick(latlng) {
    // Clear any existing selection
    clearSelection();

    // Create custom marker with crosshair icon
    const crosshairIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="bi--crosshair" style="font-size: 24px; color: black;"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    selectedMarker = L.marker(latlng, {
        icon: crosshairIcon,
        draggable: true
    }).addTo(map);

    // Create circle with 100 yard radius (91.44 meters)
    selectedCircle = L.circle(latlng, {
        radius: 91.44, // 100 yards in meters
        color: 'black',
        fillColor: 'rgba(0, 0, 0, 0.1)',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(map);

    // Update circle when marker is dragged
    selectedMarker.on('drag', function(e) {
        const newLatLng = e.target.getLatLng();
        selectedCircle.setLatLng(newLatLng);
    });

    // Zoom to appropriate level (approximately 1000x1000 yards)
    map.setView(latlng, 16);

    // Show radius popup
    showRadiusPopup();
}

function showRadiusPopup() {
    const $popup = $('#radius-popup');
    const $slider = $('#radius-slider');
    const $value = $('#radius-value');
    const $createButton = $('#create-hunt-button');

    // Reset slider to default
    $slider.val(100);
    $value.text('100 yards');

    // Show popup
    $popup.show();

    // Handle slider changes
    $slider.off('input').on('input', function() {
        const yards = parseInt($(this).val());
        const meters = yards * 0.9144; // Convert yards to meters
        
        $value.text(`${yards} yards`);
        
        if (selectedCircle) {
            selectedCircle.setRadius(meters);
            
            // Check if circle fits within current map view
            const circleBounds = selectedCircle.getBounds();
            const mapBounds = map.getBounds();
            
            // If circle extends beyond map bounds, zoom out to fit
            if (!mapBounds.contains(circleBounds)) {
                map.fitBounds(circleBounds, { padding: [50, 50] });
            }
        }
    });

    // Handle create button click
    $createButton.off('click').on('click', function() {
        const yards = parseInt($slider.val());
        const latlng = selectedMarker.getLatLng();
        
        // Redirect to create page with coordinates as query parameters
        const params = new URLSearchParams({
            lat: latlng.lat,
            lng: latlng.lng,
            radius: yards
        });
        window.location.href = `create.html?${params.toString()}`;
    });
}

function clearSelection() {
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
        selectedMarker = null;
    }
    if (selectedCircle) {
        map.removeLayer(selectedCircle);
        selectedCircle = null;
    }
    if (selectedHuntMarker) {
        selectedHuntMarker.setIcon(new L.Icon.Default());
        selectedHuntMarker = null;
    }
    $('#radius-popup').hide();
    $('.selected-map-hunt').html('<h2 class="placeholder-selected-hunt">Select a hunt on the map</h2>');
}

async function loadHuntMarkers() {
    try {
        const hunts = await pb.collection('hunt_logs').getFullList({
            requestKey: 'map-hunt-markers'
        });

        // Get selected year from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const selectedYear = urlParams.get('year');

        const bounds = [];

        hunts.forEach(function(hunt) {
            // Filter by year if a specific year is selected
            if (selectedYear && selectedYear !== 'all') {
                if (hunt.date) {
                    const huntYear = new Date(hunt.date).getFullYear();
                    if (huntYear.toString() !== selectedYear) {
                        return; // Skip this hunt
                    }
                } else {
                    return; // Skip hunts without dates when filtering by year
                }
            }

            if (hunt.geoPoint && hunt.geoPoint.lat && hunt.geoPoint.lon) {
                const latlng = [parseFloat(hunt.geoPoint.lat), parseFloat(hunt.geoPoint.lon)];
                
                // Skip hunts with 0,0 coordinates
                if (latlng[0] === 0 && latlng[1] === 0) {
                    return;
                }
                
                const marker = L.marker(latlng).addTo(map);
                
                marker.on('click', function() {
                    selectHuntMarker(marker, hunt);
                });
                
                huntMarkers.push({ marker: marker, hunt: hunt });
                bounds.push(latlng);
            }
        });

        // Fit map to show all markers
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    } catch (error) {
        console.error('Error loading hunt markers:', error);
    }
}

function selectHuntMarker(marker, hunt) {
    // Clear any existing selection
    clearSelection();

    // Create circle with radius from hunt data
    const radiusYards = hunt.radius || 100;
    const radiusMeters = radiusYards * 0.9144;

    selectedCircle = L.circle(marker.getLatLng(), {
        radius: radiusMeters,
        color: 'black',
        fillColor: 'rgba(0, 0, 0, 0.1)',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(map);

    // Highlight the selected marker with crosshair icon
    const crosshairIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="bi--crosshair" style="font-size: 24px; color: black;"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    marker.setIcon(crosshairIcon);
    selectedHuntMarker = marker;

    // Display hunt details in the selected-map-hunt block
    displayHuntDetails(hunt);

    // Zoom to the marker
    map.setView(marker.getLatLng(), 16);
}

function displayHuntDetails(hunt) {
    const harvestStatus = hunt.successful ? 'Successful Harvest' : 'Unsuccessful Harvest';
    
    const huntHTML = `
        <a href="details.html?id=${hunt.id}" class="selected-map-hunt">
            <div class="major-details">
                <h2 class="hunt-title">${hunt.title || 'Untitled Hunt'}</h2>
                <p class="harvest-status">${harvestStatus}</p>
                <p class="hunt-date">${hunt.date || 'No date'}</p>
                <p class="hunt-location">${hunt.location || 'No location'}</p>
            </div>
        </a>
    `;
    
    $('.selected-map-hunt').replaceWith(huntHTML);
}
