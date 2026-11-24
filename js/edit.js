// edit.js
// Handles loading, updating, and deleting hunt logs in PocketBase

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

let currentHuntId = null;
let uploadedImages = [];
let existingImages = [];
let allImages = [];
let imagesToDelete = [];

$(document).ready(function() {
    loadHuntForEdit();
    handleSave();
    handleCancel();
    handleDelete();
    handleImageUpload();
});

async function loadHuntForEdit() {
    try {
        // Get the hunt ID from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const huntId = urlParams.get('id');

        if (!huntId) {
            alert('No hunt ID provided');
            window.location.href = 'dashboard-list.html';
            return;
        }

        currentHuntId = huntId;

        // Fetch the specific hunt from PocketBase
        const hunt = await pb.collection('hunt_logs').getOne(huntId);
        window.hunt = hunt;

        // Populate the form with hunt data
        populateForm(hunt);
    } catch (error) {
        alert('Failed to load hunt. Please try again.');
        window.location.href = 'dashboard-list.html';
    }
}

function populateForm(hunt) {
    $('#hunt-title').val(hunt.title || '');
    $('#hunt-success').prop('checked', hunt.successful || false);
    
    // Format date for HTML date input (YYYY-MM-DD)
    if (hunt.date) {
        const dateObj = new Date(hunt.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        $('#hunt-date').val(`${year}-${month}-${day}`);
    } else {
        $('#hunt-date').val('');
    }
    
    $('#hunt-time').val(hunt.time || '');
    $('#hunt-location').val(hunt.location || '');
    $('#hunt-weather').val(hunt.weather || '');
    $('#hunt-wind').prop('checked', hunt.wind || false);
    $('#hunt-temp').val(hunt.temperature || '');
    $('input[name="temp-scale"][value="' + (hunt.temp_units || 'F') + '"]').prop('checked', true);
    $('#hunt-game').val(hunt.game || '');
    $('#hunt-method').val(hunt.method || '');
    $('#hunt-caliber').val(hunt.caliber || '');
    $('#hunt-ammo').val(hunt.ammo || '');
    $('#hunt-bullet-weight').val(hunt.bullet_weight || '');
    $('#hunt-bow-type').val(hunt.bowType || '');
    $('#hunt-arrow-length').val(hunt.arrowLength || '');
    $('#hunt-arrow-head').val(hunt.arrowHead || '');
    $('#hunt-distance').val(hunt.distance || '');
    $('#hunt-distance-units').val(hunt.distance_units || '');
    $('#hunt-setup').val(hunt.setup || '');
    $('#hunt-companions').val(hunt.companions || '');
    $('#hunt-gear-used').val(hunt.gear_used || '');
    $('#hunt-gear-needed').val(hunt.gear_needed || '');
    $('#hunt-notes').val(hunt.notes || '');

    // Populate map fields
    if (hunt.geoPoint && hunt.geoPoint.lat && hunt.geoPoint.lon) {
        $('#hunt-lat').val(hunt.geoPoint.lat);
        $('#hunt-long').val(hunt.geoPoint.lon);
        // Trigger input event to update map
        $('#hunt-lat, #hunt-long').trigger('input');
    }
    if (hunt.radius) {
        $('#hunt-radius').val(hunt.radius);
    }

    // Store existing images
    existingImages = hunt.images || [];

    // Display existing images
    displayImages(existingImages, hunt);

    // Trigger method change to show/hide appropriate fields
    $('#hunt-method').trigger('change');
}

function handleSave() {
    $('#save-button').on('click', async function(e) {
        e.preventDefault();

        if (!currentHuntId) {
            alert('No hunt ID found');
            return;
        }

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

        // Collect form data
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
            // Update the hunt log in PocketBase with images if any
            let record;
            const updateData = { ...huntData };

            // Remove selected images
            if (imagesToDelete.length > 0) {
                updateData['images-'] = imagesToDelete;
            }

            // Add new images
            if (uploadedImages.length > 0) {
                updateData['images+'] = uploadedImages;
            }

            if (imagesToDelete.length > 0 || uploadedImages.length > 0) {
                record = await pb.collection('hunt_logs').update(currentHuntId, updateData);
            } else {
                record = await pb.collection('hunt_logs').update(currentHuntId, huntData);
            }

            // Redirect to dashboard
            window.location.href = `details.html?id=${record.id}`;
        } catch (error) {
            alert('Failed to update hunt. Please try again.');
        }
    });
}

function handleCancel() {
    $('#cancel-button').on('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard-list.html';
    });
}

function handleDelete() {
    $('#delete-button').on('click', async function(e) {
        e.preventDefault();

        if (!currentHuntId) {
            alert('No hunt ID found');
            return;
        }

        if (confirm('Are you sure you want to delete this hunt?')) {
            try {
                await pb.collection('hunt_logs').delete(currentHuntId);

                // Redirect to dashboard
                window.location.href = 'dashboard-list.html';
            } catch (error) {
                alert('Failed to delete hunt. Please try again.');
            }
        }
    });
}

function displayImages(images, hunt) {
    const $huntImages = $('#hunt-images');
    $huntImages.empty();

    if (images && images.length > 0) {
        // First image as featured
        const featuredSrc = pb.files.getURL(hunt, images[0]);
        const $featuredContainer = $('<div class="image-container"></div>');
        $('<img>', {
            src: featuredSrc,
            alt: 'Featured Hunt Image',
            class: 'featured-image',
            'data-image-name': images[0]
        }).appendTo($featuredContainer);
        $('<div class="image-delete-overlay"></div>').appendTo($featuredContainer);
        $featuredContainer.appendTo($huntImages);

        // Add click handler for featured image
        $featuredContainer.on('click', function() {
            toggleImageDelete(this, images[0]);
        });

        const $thumbnailRow = $('<div class="thumbnail-row"></div>').appendTo($huntImages);

        // Rest as thumbnails
        for (let i = 1; i < images.length; i++) {
            const thumbnailSrc = pb.files.getURL(hunt, images[i]);
            const $thumbContainer = $('<div class="image-container"></div>');
            $('<img>', {
                src: thumbnailSrc,
                alt: `Hunt Image ${i + 1}`,
                class: 'thumbnail',
                'data-image-name': images[i]
            }).appendTo($thumbContainer);
            $('<div class="image-delete-overlay"></div>').appendTo($thumbContainer);
            $thumbContainer.appendTo($thumbnailRow);

            // Add click handler for thumbnail
            $thumbContainer.on('click', function() {
                toggleImageDelete(this, images[i]);
            });
        }
    }
}

function toggleImageDelete(container, imageName) {
    const $container = $(container);
    const $overlay = $container.find('.image-delete-overlay');

    if ($container.hasClass('selected-for-delete')) {
        // Remove from deletion state
        $container.removeClass('selected-for-delete');
        $overlay.hide();
        const index = imagesToDelete.indexOf(imageName);
        if (index > -1) {
            imagesToDelete.splice(index, 1);
        }
    } else {
        // Add to deletion state
        $container.addClass('selected-for-delete');
        $overlay.show();
        imagesToDelete.push(imageName);
    }
}

function handleImageUpload() {
    $('#add-images-button').on('click', function() {
        $('#image-upload').click();
    });

    $('#image-upload').on('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Append new files to uploadedImages
        uploadedImages = uploadedImages.concat(files);

        // Combine existing images with new ones for display
        allImages = [...existingImages];
        files.forEach(file => {
            allImages.push({ file: file, isNew: true });
        });

        // Display all images
        const $huntImages = $('#hunt-images');
        $huntImages.empty();

        if (allImages.length > 0) {
            // First image as featured
            let featuredSrc;
            let featuredName;
            if (allImages[0].isNew) {
                featuredSrc = URL.createObjectURL(allImages[0].file);
                featuredName = allImages[0].file.name;
            } else {
                featuredSrc = pb.files.getURL(window.hunt, allImages[0]);
                featuredName = allImages[0];
            }
            const $featuredContainer = $('<div class="image-container"></div>');
            $('<img>', {
                src: featuredSrc,
                alt: 'Featured Hunt Image',
                class: 'featured-image',
                'data-image-name': featuredName
            }).appendTo($featuredContainer);
            $('<div class="image-delete-overlay"></div>').appendTo($featuredContainer);
            $featuredContainer.appendTo($huntImages);

            // Add click handler for featured image
            $featuredContainer.on('click', function() {
                if (!allImages[0].isNew) {
                    toggleImageDelete(this, featuredName);
                }
            });

            const $thumbnailRow = $('<div class="thumbnail-row"></div>').appendTo($huntImages);

            // Rest as thumbnails
            for (let i = 1; i < allImages.length; i++) {
                let thumbnailSrc;
                let thumbName;
                if (allImages[i].isNew) {
                    thumbnailSrc = URL.createObjectURL(allImages[i].file);
                    thumbName = allImages[i].file.name;
                } else {
                    thumbnailSrc = pb.files.getURL(window.hunt, allImages[i]);
                    thumbName = allImages[i];
                }
                const $thumbContainer = $('<div class="image-container"></div>');
                $('<img>', {
                    src: thumbnailSrc,
                    alt: `Hunt Image ${i + 1}`,
                    class: 'thumbnail',
                    'data-image-name': thumbName
                }).appendTo($thumbContainer);
                $('<div class="image-delete-overlay"></div>').appendTo($thumbContainer);
                $thumbContainer.appendTo($thumbnailRow);

                // Add click handler for thumbnail
                $thumbContainer.on('click', function() {
                    if (!allImages[i].isNew) {
                        toggleImageDelete(this, thumbName);
                    }
                });
            }
        }
    });
}
