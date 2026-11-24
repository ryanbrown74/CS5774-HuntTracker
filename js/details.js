// details.js
// Loads and displays a specific hunt's details from PocketBase

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

let allHunts = [];
let currentHuntIndex = -1;
let detailsMap = null;

$(document).ready(function() {
    loadHuntDetails();
    handlePreviousNextButtons();
});

async function loadHuntDetails() {
    const $status = $('#status');
    try {
        // Get the hunt ID from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const huntId = urlParams.get('id');

        if (!huntId) {
            $status.text('No hunt ID provided in URL').fadeIn(300);
            setTimeout(() => $status.fadeOut(500), 2000);
            return;
        }

        // Fetch all hunts from PocketBase (filtered by current user's email)
        const userEmail = pb.authStore.model?.email;
        const filter = userEmail ? `user_email="${userEmail}"` : '';
        allHunts = await pb.collection('hunt_logs').getList(1, 100, {
            filter: filter,
            sort: '-date'
        });
        allHunts = allHunts.items;

        // Find the current hunt's index
        currentHuntIndex = allHunts.findIndex(hunt => hunt.id === huntId);

        if (currentHuntIndex === -1) {
            $status.text('Hunt not found').fadeIn(300);
            setTimeout(() => $status.fadeOut(500), 2000);
            return;
        }

        // Fetch the specific hunt from PocketBase
        const hunt = await pb.collection('hunt_logs').getOne(huntId);

        $status.text('Details loaded').fadeIn(300);
        setTimeout(() => $status.fadeOut(500), 2000);

        // Populate the details page with hunt data
        populateHuntDetails(hunt);
    } catch (error) {
        if (error.status === 0) {
            $status.text('Cannot reach the server. Is ./pocketbase serve running?');
        } else {
            $status.text(`Could not load spots (error ${error.status}: ${error.message}).`);
        }
    }
}

function populateHuntDetails(hunt) {
    // Title and basic info
    $('#hunt-title-details h2').text(hunt.title || 'Untitled Hunt');
    $('.harvest-status').text(hunt.successful ? 'Successful Harvest' : 'Unsuccessful Harvest');
    
    // Date and time
    const dateTime = `${hunt.date || 'No date'}${hunt.time ? ' - ' + hunt.time : ''}`;
    $('.hunt-date').text(dateTime);

    // Weather
    const weatherText = `${hunt.weather || 'No weather info'}${hunt.wind ? ' - Windy' : ' - No wind'}`;
    const tempText = hunt.temperature ? `${hunt.temperature}°${hunt.temp_units || 'F'}` : '';
    $('.weather').text(`${weatherText} ${tempText}`);

    // Location
    $('.hunt-location').text(hunt.location || 'No location');

    // Edit button - include the hunt ID
    $('#edit-button').attr('href', `edit.html?id=${hunt.id}`);

    // Images
    if (hunt.images && hunt.images.length > 0) {
        // Featured image (first image)
        const featuredImageSrc = pb.files.getURL(hunt, hunt.images[0]);
        $('.featured-image').attr('src', featuredImageSrc).attr('alt', 'Hunt Image');

        // Thumbnail images (remaining images)
        const $thumbnailRow = $('.thumbnail-row');
        $thumbnailRow.empty(); // Clear placeholder images

        for (let i = 1; i < hunt.images.length; i++) {
            const thumbnailSrc = pb.files.getURL(hunt, hunt.images[i]);
            $('<img>', {
                src: thumbnailSrc,
                alt: `Hunt Image ${i + 1}`,
                class: 'thumbnail'
            }).appendTo($thumbnailRow);
        }
    } else {
        // Use logo.png as fallback if no images
        $('.featured-image').attr('src', 'images/logo.png').attr('alt', 'Hunt Logo');
        $('.thumbnail-row').empty();
    }

    // Details column
    $('#game-species').val(hunt.game || '');
    $('#method').val(hunt.method || '');
    $('#caliber').val(hunt.caliber || '');
    $('#ammo').val(hunt.ammo || '');
    $('#distance').val(hunt.distance ? `${hunt.distance} ${hunt.distance_units || 'yards'}` : '');
    $('#setup').val(hunt.setup || '');
    $('#companions').val(hunt.companions || '');
    $('#gear-used').val(hunt.gear_used || '');
    $('#gear-needed').val(hunt.gear_needed || '');

    // Notes
    $('#notes').val(hunt.notes || '');

    // Initialize map with hunt coordinates
    initDetailsMap(hunt);
}

function initDetailsMap(hunt) {
    // Only initialize if geoPoint exists
    if (!hunt.geoPoint || !hunt.geoPoint.lat || !hunt.geoPoint.lon) {
        $('#details-map').hide();
        return;
    }

    const lat = parseFloat(hunt.geoPoint.lat);
    const lng = parseFloat(hunt.geoPoint.lon);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        $('#details-map').hide();
        return;
    }

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        $('#details-map').hide();
        return;
    }

    // Initialize map centered on hunt coordinates
    detailsMap = L.map('details-map', {
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false
    }).setView([lat, lng], 14);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(detailsMap);

    // Add marker at hunt coordinates
    L.marker([lat, lng]).addTo(detailsMap);

    // Add circle if radius exists
    if (hunt.radius) {
        const radiusMeters = hunt.radius * 0.9144;
        L.circle([lat, lng], {
            radius: radiusMeters,
            color: 'black',
            fillColor: 'rgba(0, 0, 0, 0.1)',
            fillOpacity: 0.3,
            weight: 2
        }).addTo(detailsMap);
    }
}

function handlePreviousNextButtons() {
    $('#previous-button').on('click', function() {
        if (allHunts.length === 0) return;
        
        // Go to previous hunt (cycling to end if at beginning)
        currentHuntIndex = currentHuntIndex <= 0 ? allHunts.length - 1 : currentHuntIndex - 1;
        const nextHunt = allHunts[currentHuntIndex];
        window.location.href = `details.html?id=${nextHunt.id}`;
    });

    $('#next-button').on('click', function() {
        if (allHunts.length === 0) return;
        
        // Go to next hunt (cycling to beginning if at end)
        currentHuntIndex = currentHuntIndex >= allHunts.length - 1 ? 0 : currentHuntIndex + 1;
        const nextHunt = allHunts[currentHuntIndex];
        window.location.href = `details.html?id=${nextHunt.id}`;
    });
}
