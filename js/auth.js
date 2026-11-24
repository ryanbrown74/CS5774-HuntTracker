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
  // ---- Log in ----
  $('#login-box').on('submit', async function (event) {
    // Stop the normal form submit (which would reload the page); JS sends the data instead.
    event.preventDefault();

    try {
      // POST /api/collections/users/auth-with-password
      // On success the SDK stores the token and user record in pb.authStore.
      await pb.collection('users').authWithPassword(
        $('#login-email').val(),
        $('#login-password').val()
      );
      window.location.href = 'dashboard-list.html';
    } catch (err) {
      $('#login-message').text('Login failed: ' + errorMessage(err));
    }
  });

  // ---- Sign up ----
  $('#register-box').on('submit', async function (event) {
    event.preventDefault();

    const email = $('#register-email').val();
    const password = $('#register-password').val();

    try {
      // Signing up = creating a record in the users (auth) collection.
      // POST /api/collections/users/records
      await pb.collection('users').create({
        name: $('#register-name').val(),
        email: email,
        password: password,
        passwordConfirm: $('#register-password-confirm').val(),
        role: 'member', // the users Create rule rejects any other value
      });

      // create() does not log you in, so log in with the same email and password.
      await pb.collection('users').authWithPassword(email, password);
      window.location.href = 'dashboard-list.html';
    } catch (err) {
      $('#register-message').text('Sign up failed: ' + errorMessage(err));
    }
  });
});