// Initialize functions on document ready
$(document).ready(function() {
    if (window.location.pathname.includes('index.html')) {
        handleLogin();
    }
});

//---------------------------------------------------------------------------------------------------------------------
// Function to handle login button click
function handleLogin() {
    console.log("handleLogin called");
    $('#login-button').on('click', function(e) {
        console.log("login button clicked");
        e.preventDefault();
        window.location.href = 'dashboard-list.html';
    });
}
