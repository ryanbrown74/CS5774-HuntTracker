// scripts.js
// Shared utility functions for the application

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    const pathname = window.location.pathname;
    
    if (pathname.includes('search-results.html')) {
        handleSearchResults();
    }
    
    if (pathname.includes('create.html')) {
        handleMethodChange();
        handleCancel();
    }

    if (pathname.includes('edit.html')) {
        handleMethodChange();
    }
    
    if (pathname.includes('dashboard-list.html') || pathname.includes('dashboard-list')) {
        handleCreateNew();
        handleSearchForm();
    }
});
//---------------------------------------------------------------------------------------------------------------------
// Function to handle search results display
function handleSearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const $huntList = $('#hunt-list');
    const $noResults = $('#no-results');
    
    if (searchQuery && searchQuery.toLowerCase() === 'deer') {
        $huntList.css('display', 'flex');
        $noResults.css('display', 'none');
    } else {
        $huntList.css('display', 'none');
        $noResults.css('display', 'block');
    }
}

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

//---------------------------------------------------------------------------------------------------------------------
// Function to handle cancel button click
function handleCancel() {
    $('#cancel-button').on('click', function() {
        window.location.href = 'dashboard-list.html';
    });
}

//---------------------------------------------------------------------------------------------------------------------
// Function to handle search form submission
function handleSearchForm() {
    $('#search-form').on('submit', function(e) {
        e.preventDefault();
        const searchQuery = $('#search-input').val();
        if (searchQuery) {
            window.location.href = 'search-results.html?search=' + encodeURIComponent(searchQuery);
        }
    });
}

