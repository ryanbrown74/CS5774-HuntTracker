// create.js
// Handles creating new hunt logs in PocketBase

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    handleSave();
    handleCancel();
    handleImageUpload();
});

let uploadedImages = [];

function handleCancel() {
    $('#cancel-button').on('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard-list.html';
    });
}

function handleSave() {
    $('#save-button').on('click', async function(e) {
        e.preventDefault();

        // Validate coordinates
        const lat = parseFloat($('#hunt-lat').val());
        const lng = parseFloat($('#hunt-long').val());
        
        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid latitude and longitude coordinates before saving.');
            return;
        }
        
        if (lat < -90 || lat > 90) {
            alert('Latitude must be between -90 and 90 degrees.');
            return;
        }
        
        if (lng < -180 || lng > 180) {
            alert('Longitude must be between -180 and 180 degrees.');
            return;
        }
        
        // Validate radius
        const radius = parseInt($('#hunt-radius').val());
        if (isNaN(radius) || radius < 10 || radius > 2000) {
            alert('Radius must be between 10 and 2000 yards.');
            return;
        }

        // Collect form data - only include non-empty values
        const huntData = {
            user_email: pb.authStore.model?.email,
            title: $('#hunt-title').val(),
            successful: $('#hunt-success').is(':checked'),
            date: $('#hunt-date').val(),
            time: $('#hunt-time').val(),
            location: $('#hunt-location').val(),
            weather: $('#hunt-weather').val(),
            wind: $('#hunt-wind').is(':checked'),
            temperature: $('#hunt-temp').val(),
            temp_units: $('input[name="temp-scale"]:checked').val(),
            game: $('#hunt-game').val(),
            method: $('#hunt-method').val(),
            caliber: $('#hunt-caliber').val(),
            ammo: $('#hunt-ammo').val(),
            bullet_weight: $('#hunt-bullet-weight').val(),
            bowType: $('#hunt-bow-type').val(),
            arrowLength: $('#hunt-arrow-length').val(),
            arrowHead: $('#hunt-arrow-head').val(),
            distance: $('#hunt-distance').val(),
            distance_units: $('#hunt-distance-units').val(),
            setup: $('#hunt-setup').val(),
            companions: $('#hunt-companions').val(),
            gear_used: $('#hunt-gear-used').val(),
            gear_needed: $('#hunt-gear-needed').val(),
            notes: $('#hunt-notes').val(),
            geoPoint: {
                lat: lat,
                lon: lng
            },
            radius: radius
        };

        // Remove empty string values to avoid validation errors
        Object.keys(huntData).forEach(key => {
            if (huntData[key] === '') {
                delete huntData[key];
            }
        });

        try {
            // Create new hunt log in PocketBase with images if any
            let record;
            if (uploadedImages.length > 0) {
                // Add images directly to the data object
                const dataWithImages = {
                    ...huntData,
                    images: uploadedImages
                };
                record = await pb.collection('hunt_logs').create(dataWithImages);
            } else {
                record = await pb.collection('hunt_logs').create(huntData);
            }

            // Redirect to details page with the new hunt's ID
            window.location.href = `details.html?id=${record.id}`;
        } catch (error) {
            alert(`Failed to create hunt: ${error.message}`);
        }
    });
}

function handleImageUpload() {
    $('#add-images-button').on('click', function() {
        $('#image-upload').click();
    });

    $('#image-upload').on('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Store files for upload
        uploadedImages = files;

        // Display images
        const $featuredImage = $('.featured-image-placeholder');
        const $thumbnailRow = $('.thumbnail-row');

        // Clear existing placeholders
        $featuredImage.empty();
        $thumbnailRow.empty();

        // First image as featured
        const featuredSrc = URL.createObjectURL(files[0]);
        $('<img>', {
            src: featuredSrc,
            alt: 'Featured Hunt Image',
            class: 'featured-image'
        }).appendTo($featuredImage);

        // Rest as thumbnails
        for (let i = 1; i < files.length; i++) {
            const thumbnailSrc = URL.createObjectURL(files[i]);
            $('<img>', {
                src: thumbnailSrc,
                alt: `Hunt Image ${i + 1}`,
                class: 'thumbnail'
            }).appendTo($thumbnailRow);
        }
    });
}
