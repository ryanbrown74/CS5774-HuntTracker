import pb from './pb.js';

$(document).ready(function() {
    console.log('list.js: DOM ready, loading hunt logs');
    loadHuntLogs();
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
    console.log('list.js: loadHuntLogs called');
    const $status = $('#status');
    try {
        const $huntList = $('#hunt-list');
        const $createNew = $('#create-new');

        console.log('list.js: fetching hunt logs from PocketBase');

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

        console.log('list.js: fetched', huntLogs.length, 'hunt logs');
        console.log('list.js: $huntList length:', $huntList.length);
        console.log('list.js: $createNew length:', $createNew.length);

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
        console.log('list.js: hunt logs appended to DOM');
        console.log('list.js: #create-new still in DOM:', $('#create-new').length);
    } catch (error) {
        console.error('list.js: Error loading hunt logs:', error);
        if (error.status === 0) {
            $status.text('Cannot reach the server. Is ./pocketbase serve running?');
        } else {
            $status.text(`Could not load spots (error ${error.status}: ${error.message}).`);
        }
    }
}