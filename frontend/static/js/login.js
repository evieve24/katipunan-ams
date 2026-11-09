/* Katipunan AMS - Login page logic */
(function () {
  'use strict';
  var TOKEN_KEY = 'kat_token', USER_KEY = 'kat_user';
  var form = document.getElementById('loginForm');
  var username = document.getElementById('username');
  var password = document.getElementById('password');
  var errorBox = document.getElementById('error');
  var notice = document.getElementById('notice');
  var submitBtn = document.getElementById('submitBtn');
  var serverDot = document.getElementById('serverDot');
  var serverText = document.getElementById('serverText');

  function showNotice(message) {
    notice.textContent = message;
    notice.classList.add('show');
  }

  var params = new URLSearchParams(location.search);
  if (params.get('expired')) showNotice('Your session expired. Please sign in again.');
  if (params.get('logout')) showNotice('You have been signed out.');

  document.getElementById('pwToggle').addEventListener('click', function () {
    var visible = password.type === 'text';
    password.type = visible ? 'password' : 'text';
    this.textContent = visible ? 'Show' : 'Hide';
    password.focus();
  });

  document.querySelectorAll('.demo-account').forEach(function (row) {
    row.addEventListener('click', function () {
      username.value = row.dataset.u;
      password.value = row.dataset.p;
      errorBox.textContent = '';
      password.focus();
    });
  });

  function setServerState(ok, text) {
    serverDot.className = 'status-dot ' + (ok ? 'ok' : 'bad');
    serverText.textContent = text;
  }

  fetch('/api/health', { cache: 'no-store' })
    .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
    .then(function (data) { setServerState(!!data.ok, 'Backend online'); })
    .catch(function () { setServerState(false, 'Backend unreachable'); });

  // Already signed in? Validate the token and go straight to the system.
  var existing = '';
  try { existing = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}
  if (existing) {
    fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + existing }, cache: 'no-store' })
      .then(function (response) {
        if (response.ok) return response.json();
        throw new Error('expired');
      })
      .then(function (data) {
        if (data && data.user) {
          try { localStorage.setItem(USER_KEY, JSON.stringify(data.user)); } catch (e) {}
          location.replace('index.html');
        }
      })
      .catch(function () {
        try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
      });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.textContent = '';
    var un = username.value.trim();
    var pw = password.value;
    if (!un || !pw) {
      errorBox.textContent = 'Enter your username and password.';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: un, password: pw })
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok) throw new Error(data.error || ('Sign in failed (HTTP ' + response.status + ')'));
          return data;
        });
      })
      .then(function (data) {
        try {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          localStorage.removeItem('kat_pending_state');
        } catch (e) {}
        location.replace('index.html');
      })
      .catch(function (err) {
        var message = String(err && err.message || err);
        if (message === 'Failed to fetch') {
          message = 'Cannot reach the backend. Start the server with start.bat, then try again.';
        }
        errorBox.textContent = message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in to the system';
        password.value = '';
        password.focus();
      });
  });

  if (!existing) username.focus();
})();
