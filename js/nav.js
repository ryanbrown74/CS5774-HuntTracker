// nav.js - Constructs the navigation bar dynamically

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    const $nav = $('#nav');
    if ($nav.length === 0) return;

    // Check if user is logged in
    const isLoggedIn = pb.authStore.isValid;

    // Pages that include search-form
    const pagesWithSearch = [
        'dashboard-list.html',
        'dashboard-map.html'
    ];

    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard-list.html';
    const shouldIncludeSearch = pagesWithSearch.includes(currentPage);
    const shouldIncludeUserBox = isLoggedIn;

    // Determine which page is active for highlighting
    let homeClass = '';
    let aboutClass = '';
    let contactClass = '';
    
    if (currentPage === 'about.html') {
        aboutClass = 'selected';
    } else if (currentPage === 'contact.html') {
        contactClass = 'selected';
    } else if (currentPage === 'dashboard-list.html' || currentPage === 'dashboard-map.html') {
        homeClass = 'selected';
    }

    // Build nav HTML
    let navHTML = `
      <ul id="primary-nav">
        <li><a href="dashboard-list.html" class="${homeClass}">Home</a></li>
        <li><a href="about.html" class="${aboutClass}">About</a></li>
        <li><a href="contact.html" class="${contactClass}">Contact</a></li>
      </ul>
    `;

    // Add search-form on specified pages
    if (shouldIncludeSearch) {
        navHTML += `
      <form id="search-form">
        <input type="text" id="search-input" name="search" placeholder="Search">
        <button type="submit" id="search-button">Search</button>
      </form>
        `;
    }

    // Add user-box on specified pages when logged in
    if (shouldIncludeUserBox) {
        navHTML += `
      <div id="user-box">
        <button><img src="images/user.png" alt="User Icon">Ryan</button>
        <button id="logout-button"><img src="images/logout.png" alt="Logout button"></button>
      </div>
        `;
    }

    $nav.html(navHTML);

    // Attach logout button event handler
    $('#logout-button').on('click', function() {
        pb.authStore.clear();
        window.location.href = 'index.html';
    });

    // Handle Home link click - redirect to index.html if not logged in
    $('a[href="dashboard-list.html"]').on('click', function(e) {
        if (!pb.authStore.isValid) {
            e.preventDefault();
            window.location.href = 'index.html';
        }
    });
});
