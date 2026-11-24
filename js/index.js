// Initialize functions on document ready
$(document).ready(function() {
    if (window.location.pathname.includes('index.html')) {
        handleLogin();
    }
});

//---------------------------------------------------------------------------------------------------------------------
// Function to handle login button click
function handleLogin() {
    $('#login-button').on('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard-list.html';
    });
}
