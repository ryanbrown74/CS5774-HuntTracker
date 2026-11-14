// create.js
// Handles creating new hunt logs in PocketBase

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    handleSave();
    handleImageUpload();
});

let uploadedImages = [];

function handleSave() {
    $('#save-button').on('click', async function(e) {
        e.preventDefault();

        // Collect form data - only include non-empty values
        const huntData = {
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
            notes: $('#hunt-notes').val()
        };

        // Remove empty string values to avoid validation errors
        Object.keys(huntData).forEach(key => {
            if (huntData[key] === '') {
                delete huntData[key];
            }
        });

        console.log('Creating hunt with data:', huntData);

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
                console.log('data with images:', dataWithImages)
            } else {
                record = await pb.collection('hunt_logs').create(huntData);
            }
            console.log('Hunt created successfully:', record);

            // Redirect to details page with the new hunt's ID
            window.location.href = `details.html?id=${record.id}`;
        } catch (error) {
            console.error('Error creating hunt:', error);
            console.error('Error details:', error.data);
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
