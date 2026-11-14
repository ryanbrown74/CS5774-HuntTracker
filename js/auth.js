// auth.js
// Handles the two forms on login.html: "Log in" and "Sign up".

import pb from './pb.js';

// Access jQuery from global scope (loaded as regular script)
const $ = window.$;

// Turn a PocketBase error into a readable message.
// When a form is rejected (status 400), err.response.data lists the problem
// per field, e.g. { email: { message: "Value must be unique."}}.
function errorMessage(err) {
  const fieldErrors = err.response?.data || {};
  const details = Object.entries(fieldErrors).map(
    ([field, problem]) => `${field}: ${problem.message}`
  );
  return details.length > 0 ? details.join(' ') : err.message;
}

// Initialize functions on document ready
$(document).ready(function() {
  console.log("auth.js: DOM ready, attaching event handlers");

  // ---- Log in ----
  $('#login-box').on('submit', async function (event) {
    console.log("auth.js: login form submitted");
    // Stop the normal form submit (which would reload the page); JS sends the data instead.
    event.preventDefault();
    console.log("auth.js: preventDefault called");

    try {
      // POST /api/collections/users/auth-with-password
      // On success the SDK stores the token and user record in pb.authStore.
      console.log("auth.js: attempting authWithPassword");
      await pb.collection('users').authWithPassword(
        $('#login-email').val(),
        $('#login-password').val()
      );
      console.log("auth.js: auth successful, redirecting");
      window.location.href = 'dashboard-list.html';
    } catch (err) {
      console.error("auth.js: auth failed", err);
      $('#login-message').text('Login failed: ' + errorMessage(err));
    }
  });

  // ---- Sign up ----
  $('#register-box').on('submit', async function (event) {
    console.log("auth.js: register form submitted");
    event.preventDefault();
    console.log("auth.js: preventDefault called");

    const email = $('#register-email').val();
    const password = $('#register-password').val();
    console.log("auth.js: email:", email);

    try {
      // Signing up = creating a record in the users (auth) collection.
      // POST /api/collections/users/records
      console.log("auth.js: attempting create user");
      await pb.collection('users').create({
        name: $('#register-name').val(),
        email: email,
        password: password,
        passwordConfirm: $('#register-password-confirm').val(),
        role: 'member', // the users Create rule rejects any other value
      });
      console.log("auth.js: user created, attempting login");

      // create() does not log you in, so log in with the same email and password.
      await pb.collection('users').authWithPassword(email, password);
      console.log("auth.js: login successful, redirecting");
      window.location.href = 'dashboard-list.html';
    } catch (err) {
      console.error("auth.js: registration failed", err);
      console.error("auth.js: error response data:", err.response?.data);
      console.error("auth.js: error message:", err.message);
      $('#register-message').text('Sign up failed: ' + errorMessage(err));
    }
  });
});