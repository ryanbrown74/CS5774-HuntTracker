// Initialize functions on document ready
$(document).ready(function() {
    const pathname = window.location.pathname;
    
    if (pathname.includes('about.html') ||
        pathname.includes('contact.html')) {
        handleHomeClick();
    }
    
    if (pathname.includes('search-results.html')) {
        handleSearchResults();
    }
    
    if (pathname.includes('create.html')) {
        handleMethodChange();
        handleLogout();
        handleCancel();
    }

    if (pathname.includes('edit.html')) {
        handleMethodChange();
        handleLogout();
    }
    
    if (pathname.includes('dashboard-list.html') || pathname.includes('dashboard-list')) {
        handleLogout();
        handleCreateNew();
        handleSearchForm();
    }
});
//---------------------------------------------------------------------------------------------------------------------
// Function to handle referrer tracking and conditional redirection on Home link clicks from certain pages
function handleHomeClick() {
    // Handle Home link click using jQuery
    $('a[href="dashboard-list.html"]').on('click', function(e) {
        console.log('Home link clicked');
        console.log('window.pb available:', !!window.pb);

        // Check if user is logged in using PocketBase authStore
        let isLoggedIn = false;
        if (window.pb) {
            isLoggedIn = window.pb.authStore.isValid;
            console.log('authStore.token:', window.pb.authStore.token);
            console.log('authStore.model:', window.pb.authStore.model);
        }
        console.log('isLoggedIn:', isLoggedIn);

        if (!isLoggedIn) {
            console.log('Not logged in, redirecting to index.html');
            e.preventDefault();
            window.location.href = 'index.html';
        } else {
            console.log('Logged in, going to dashboard-list.html');
        }
    });
}

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
// Function to load hunts from localStorage and display in dashboard-list.html
function loadHunts() {
    const $huntList = $('#hunt-list');
    if ($huntList.length === 0) {
        return;
    }

    const hunts = JSON.parse(localStorage.getItem('hunts')) || [];
    
    // Get the create-new button
    const $createNew = $('#create-new');
    
    // Clear existing hunt cards before adding new ones to prevent duplicates
    $huntList.find('.hunt').remove();

    // Append new hunts to the hunt list
    hunts.forEach((hunt, index) => {
        const harvestStatus = hunt.success ? 'Successful Harvest' : 'Unsuccessful Harvest';
        
        const $huntCard = $('<a>', {
            href: 'details.html',
            class: 'hunt',
            html: `
                <div class="major-details">
                    <h2 class="hunt-title">${hunt.title || 'Untitled Hunt'}</h2>
                    <p class="harvest-status">${harvestStatus}</p>
                    <p class="hunt-date">${hunt.date || 'No date'}</p>
                    <p class="hunt-location">${hunt.location || 'No location'}</p>
                </div>
                <div class="featured-image">
                    <img src="images/hunt1.png" alt="Hunt ${index + 1}">
                </div>
            `
        });
        
        $huntList.append($huntCard);
    });

    // Re-append the create-new button if it exists and was removed by .remove()
    if ($createNew.length > 0) {
        $huntList.append($createNew);
    }
}

//---------------------------------------------------------------------------------------------------------------------
// Function to handle logout button click
function handleLogout() {
    $('#logout-button').on('click', function() {
        if (window.pb) {
            window.pb.authStore.clear();
        }
        window.location.href = 'index.html';
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

