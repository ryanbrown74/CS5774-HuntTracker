// Initialize functions on document ready
$(document).ready(function() {
    if (window.location.pathname.includes('about.html') ||
        window.location.pathname.includes('contact.html')) {
        handleReferrer();
    }
    
    if (window.location.pathname.includes('search-results.html')) {
        handleSearchResults();
    }
    
    if (window.location.pathname.includes('create.html')) {
        handleCreateHunt();
        handleMethodChange();
    }

    if (window.location.pathname.includes('edit.html')) {
        handleMethodChange();
    }
    
    if (window.location.pathname.includes('dashboard-list.html')) {
        loadHunts();
    }
});
//---------------------------------------------------------------------------------------------------------------------
// Function to handle referrer tracking and conditional redirection on Home link clicks
function handleReferrer() {
    const referrer = document.referrer;
    console.log('Referrer:', referrer);
    if (referrer) {
        // Extract the filename from the URL
        const urlParts = referrer.split('/');
        let filename = urlParts[urlParts.length - 1] || 'home';

        // Remove any query parameters
        filename = filename.split('?')[0];
        console.log('Extracted filename:', filename);

        // Save the referrer to sessionStorage
        sessionStorage.setItem('referrerPage', filename);
        console.log('Saved to sessionStorage:', filename);
    }
    
    // Handle Home link click
    const homeLinks = document.querySelectorAll('a[href="dashboard-list.html"]');
    console.log('Found home links:', homeLinks.length);
    homeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const referrerPage = sessionStorage.getItem('referrerPage');
            console.log('Clicking Home, referrerPage from storage:', referrerPage);
            if (referrerPage === 'landing.html') {
                console.log('Redirecting to landing.html');
                e.preventDefault();
                window.location.href = 'landing.html';
            }
        });
    });
}

//---------------------------------------------------------------------------------------------------------------------
// Function to handle search results display
function handleSearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const huntList = document.getElementById('hunt-list');
    const noResults = document.getElementById('no-results');
    
    if (searchQuery && searchQuery.toLowerCase() === 'deer') {
        huntList.style.display = 'flex';
        noResults.style.display = 'none';
    } else {
        huntList.style.display = 'none';
        noResults.style.display = 'block';
    }
}

//---------------------------------------------------------------------------------------------------------------------
// Function to handle creating a new hunt from create.html using event delegation
function handleCreateHunt() {
    const formContainer = document.getElementById('new-hunt-details');
    if (!formContainer) {
        return;
    }

    formContainer.addEventListener('click', function(e) {
        if (e.target.id === 'save-button') {
            e.preventDefault();
            saveHunt();
        }
    });
}

//---------------------------------------------------------------------------------------------------------------------
// Function to handle Method dropdown change event to show/hide fields
function handleMethodChange() {
    const methodSelect = document.getElementById('hunt-method');
    if (!methodSelect) {
        return;
    }

    methodSelect.addEventListener('change', function() {
        const selectedMethod = this.value;
        
        // Use DOM traversal to find the firearm-fields and bow-fields divs
        // that are siblings of the method select's parent
        const methodRow = this.closest('.form-row');
        const firearmFields = methodRow.nextElementSibling;
        const bowFields = firearmFields.nextElementSibling;
        
        if (selectedMethod === 'Firearm') {
            firearmFields.style.display = 'block';
            bowFields.style.display = 'none';
        } else if (selectedMethod === 'Bow') {
            firearmFields.style.display = 'none';
            bowFields.style.display = 'block';
        } else {
            firearmFields.style.display = 'none';
            bowFields.style.display = 'none';
        }
    });
}

// Function to save hunt data to localStorage
function saveHunt() {
    const hunt = {
        title: document.getElementById('hunt-title').value,
        success: document.getElementById('hunt-success').checked,
        date: document.getElementById('hunt-date').value,
        time: document.getElementById('hunt-time').value,
        location: document.getElementById('hunt-location').value,
        weather: document.getElementById('hunt-weather').value,
        wind: document.getElementById('hunt-wind').checked,
        temp: document.getElementById('hunt-temp').value,
        tempScale: document.querySelector('input[name="temp-scale"]:checked')?.value || 'F',
        game: document.getElementById('hunt-game').value,
        method: document.getElementById('hunt-method').value,
        caliber: document.getElementById('hunt-caliber')?.value || '',
        ammo: document.getElementById('hunt-ammo')?.value || '',
        bulletWeight: document.getElementById('hunt-bullet-weight')?.value || '',
        bowType: document.getElementById('hunt-bow-type')?.value || '',
        arrowLength: document.getElementById('hunt-arrow-length')?.value || '',
        arrowHead: document.getElementById('hunt-arrow-head')?.value || '',
        distance: document.getElementById('hunt-distance').value,
        distanceUnits: document.getElementById('hunt-distance-units').value,
        setup: document.getElementById('hunt-setup').value,
        companions: document.getElementById('hunt-companions').value,
        gearUsed: document.getElementById('hunt-gear-used').value,
        gearNeeded: document.getElementById('hunt-gear-needed').value,
        notes: document.getElementById('hunt-notes').value
    };

    // Get existing hunts from localStorage
    let hunts = JSON.parse(localStorage.getItem('hunts')) || [];
    hunts.push(hunt);
    localStorage.setItem('hunts', JSON.stringify(hunts));

    // Redirect to dashboard
    window.location.href = 'dashboard-list.html';
}

// Function to load hunts from localStorage and display in dashboard-list.html
function loadHunts() {
    const huntList = document.getElementById('hunt-list');
    if (!huntList) {
        return;
    }

    const hunts = JSON.parse(localStorage.getItem('hunts')) || [];
    
    // Get the create-new button
    const createNew = document.getElementById('create-new');
    
    // Append new hunts before the create-new button
    hunts.forEach((hunt, index) => {
        const huntCard = document.createElement('a');
        huntCard.href = 'details.html';
        huntCard.className = 'hunt';
        
        const harvestStatus = hunt.success ? 'Successful Harvest' : 'Unsuccessful Harvest';
        
        huntCard.innerHTML = `
            <div class="major-details">
                <h2 class="hunt-title">${hunt.title || 'Untitled Hunt'}</h2>
                <p class="harvest-status">${harvestStatus}</p>
                <p class="hunt-date">${hunt.date || 'No date'}</p>
                <p class="hunt-location">${hunt.location || 'No location'}</p>
            </div>
            <div class="featured-image">
                <img src="images/new-hunt${hunts.length - 1}.png" alt="Hunt ${index + 1}">
                <img src="images/missing.png" alt="Hunt ${index + 1}">
            </div>
        `;
        
        if (createNew) {
            huntList.insertBefore(huntCard, createNew);
        } else {
            huntList.appendChild(huntCard);
        }
    });
}

