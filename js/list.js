import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

// Store all hunt logs globally for filtering
let allHuntLogs = [];

$(document).ready(function() {
    loadHuntLogs();
    handleSearchInput();
    handleSearchSubmit();
});

function buildHuntLog(log) {
    const harvestStatus = log.successful ? 'Successful Harvest' : 'Unsuccessful Harvest';

    // Get the first image from the images array, or use logo.png if there are none
    let featuredImageSrc = 'images/logo.png';
    if (log.images && log.images.length > 0) {
        featuredImageSrc = pb.files.getURL(log, log.images[0]);
    }

    const $huntCard = $('<a>', {
        href: `details.html?id=${log.id}`,
        class: 'hunt',
        html: `
            <div class="major-details">
                <h2 class="hunt-title">${log.title || 'Untitled Hunt'}</h2>
                <p class="harvest-status">${harvestStatus}</p>
                <p class="hunt-date">${log.date || 'No date'}</p>
                <p class="hunt-location">${log.location || 'No location'}</p>
            </div>
            <div class="featured-image">
                <img src="${featuredImageSrc}" alt="Hunt">
            </div>
        `
    });

    return $huntCard;
}

//-----------------------------------------------------------------------------------

async function loadHuntLogs() {
    const $status = $('#status');
    try {
        const $huntList = $('#hunt-list');
        const $createNew = $('#create-new');

        // Check if a year filter is applied via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const selectedYear = urlParams.get('year');

        let filter = '';
        if (selectedYear && selectedYear !== 'all') {
            // Filter by year
            filter = `date >= "${selectedYear}-01-01" && date <= "${selectedYear}-12-31"`;
        }

        const huntLogs = await pb.collection('hunt_logs').getFullList({ 
            sort: 'date',
            requestKey: 'list-hunt-logs',
            filter: filter
        });

        // Store all hunt logs globally for filtering
        allHuntLogs = huntLogs;

        if(huntLogs.length === 0) {
            $status.text('No hunt logs yet.').fadeIn(300);
            setTimeout(() => $status.fadeOut(500), 1500);
            return;
        }

        $status.text(`Showing ${huntLogs.length} hunt logs.`).fadeIn(300);
        setTimeout(() => $status.fadeOut(500), 1500);

        // Prepend hunt cards to the beginning of the list (before #create-new)
        huntLogs.forEach(function(huntLog) {
            const $huntCard = buildHuntLog(huntLog);
            $huntList.prepend($huntCard);
        });
    } catch (error) {
        if (error.status === 0) {
            $status.text('Cannot reach the server. Is ./pocketbase serve running?');
        } else {
            $status.text(`Could not load spots (error ${error.status}: ${error.message}).`);
        }
    }
}

//-----------------------------------------------------------------------------------

function handleSearchInput() {
    $(document).on('input', '#search-input', function() {
        const searchText = $(this).val().toLowerCase();
        filterHuntLogs(searchText);
    });
}

function handleSearchSubmit() {
    $(document).on('submit', '#search-form', function(e) {
        e.preventDefault();
        const searchText = $('#search-input').val().toLowerCase();
        filterHuntLogs(searchText);
    });
}

function filterHuntLogs(searchText) {
    const $huntList = $('#hunt-list');
    const $createNew = $('#create-new');
    
    // Remove existing hunt cards (but keep create-new)
    $huntList.find('.hunt').remove();
    
    if (!searchText) {
        // If search is empty, show all hunts
        allHuntLogs.forEach(function(huntLog) {
            const $huntCard = buildHuntLog(huntLog);
            $huntList.prepend($huntCard);
        });
        return;
    }
    
    // Filter hunts based on search text
    const filteredHunts = allHuntLogs.filter(function(hunt) {
        const title = (hunt.title || '').toLowerCase();
        const location = (hunt.location || '').toLowerCase();
        const game = (hunt.game || '').toLowerCase();
        const date = (hunt.date || '').toLowerCase();
        
        return title.includes(searchText) || 
               location.includes(searchText) || 
               game.includes(searchText) ||
               date.includes(searchText);
    });
    
    // Display filtered hunts
    filteredHunts.forEach(function(huntLog) {
        const $huntCard = buildHuntLog(huntLog);
        $huntList.prepend($huntCard);
    });
}