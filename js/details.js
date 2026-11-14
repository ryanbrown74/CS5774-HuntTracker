// details.js
// Loads and displays a specific hunt's details from PocketBase

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    loadHuntDetails();
});

async function loadHuntDetails() {
    const $status = $('#status');
    try {
        // Get the hunt ID from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const huntId = urlParams.get('id');

        if (!huntId) {
            console.error('No hunt ID provided in URL');
            $status.text('No hunt ID provided in URL').fadeIn(300);
            setTimeout(() => $status.fadeOut(500), 2000);
            return;
        }

        console.log('Loading hunt details for ID:', huntId);

        // Fetch the specific hunt from PocketBase
        const hunt = await pb.collection('hunt_logs').getOne(huntId);

        console.log('Hunt loaded:', hunt);

        $status.text('Details loaded').fadeIn(300);
        setTimeout(() => $status.fadeOut(500), 2000);

        // Populate the details page with hunt data
        populateHuntDetails(hunt);
    } catch (error) {
        console.error('Error loading hunt details:', error);
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
}
