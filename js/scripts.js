// scripts.js
// Shared utility functions for the application

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    const pathname = window.location.pathname;
    
    if (pathname.includes('create.html')) {
        handleMethodChange();
    }

    if (pathname.includes('edit.html')) {
        handleMethodChange();
    }
    
    if (pathname.includes('dashboard-list.html') || pathname.includes('dashboard-list')) {
        handleCreateNew();
    }
});
//---------------------------------------------------------------------------------------------------------------------
//Function to handle Method dropdown change event to show/hide fields
function handleMethodChange() {
    $('#hunt-method').on('change', function() {
        const method = $(this).val();
        if (method === 'Firearm') {
            $('#firearm-fields').show();
            $('#bow-fields').hide();
        } else if (method === 'Bow') {
            $('#firearm-fields').hide();
            $('#bow-fields').show();
        } else {
            $('#firearm-fields').hide();
            $('#bow-fields').hide();
        }
    });
}

//---------------------------------------------------------------------------------------------------------------------
// Function to handle create new button click
function handleCreateNew() {
    $('#create-new-button').on('click', function() {
        window.location.href = 'create.html';
    });
}

