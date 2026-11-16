// filter.js
// Populates the year-bar with buttons for available hunt years from PocketBase

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

$(document).ready(function() {
    populateYearBar();
});

async function populateYearBar() {
    const $yearList = $('#year-list');
    
    // Only proceed if year-bar exists on the page
    if ($yearList.length === 0) {
        return;
    }

    try {
        // Fetch all hunts from PocketBase filtered by current user's email
        const userEmail = pb.authStore.model?.email;
        const filter = userEmail ? `user_email="${userEmail}"` : '';
        const result = await pb.collection('hunt_logs').getList(1, 500, {
            filter: filter,
            sort: '-date',
            requestKey: 'filter-year-bar'
        });
        const hunts = result.items;

        // Extract unique years from hunt dates
        const years = new Set();
        hunts.forEach(hunt => {
            if (hunt.date) {
                const dateObj = new Date(hunt.date);
                const year = dateObj.getFullYear();
                if (!isNaN(year)) {
                    years.add(year);
                }
            }
        });

        // Convert to array and sort descending
        const sortedYears = Array.from(years).sort((a, b) => b - a);

        // Clear existing year list
        $yearList.empty();

        // Add year buttons
        sortedYears.forEach(year => {
            const $li = $('<li></li>');
            const $a = $('<a>', {
                href: `?year=${year}`,
                text: year
            });
            $li.append($a);
            $yearList.append($li);
        });

        // Add "All" option
        const $allLi = $('<li></li>');
        const $allA = $('<a>', {
            href: '?year=all',
            text: 'All'
        });
        $allLi.append($allA);
        $yearList.append($allLi);

        // Highlight selected year based on URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const selectedYear = urlParams.get('year');
        
        if (selectedYear) {
            $yearList.find('a').each(function() {
                const href = $(this).attr('href');
                if (href === `?year=${selectedYear}` || (selectedYear === 'all' && href === '?year=all')) {
                    $(this).addClass('selected');
                }
            });
        } else {
            // If no year selected, highlight "All" by default
            $yearList.find('a[href="?year=all"]').addClass('selected');
        }

    } catch (error) {
        console.error('Error populating year bar:', error);
        // If error, show a default "All" option
        $yearList.empty();
        const $li = $('<li></li>');
        const $a = $('<a>', {
            href: '?year=all',
            text: 'All',
            class: 'selected'
        });
        $li.append($a);
        $yearList.append($li);
    }
}
