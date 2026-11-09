/* Katipunan AMS - Backend bootstrap and write-through autosave
   Extracted from frontend/templates/index.html. */

(function () {
  'use strict';
  var TOKEN_KEY = 'kat_token', USER_KEY = 'kat_user';
  var SENSITIVE = {
    mets_pin: 1, mets_password: 1, mets_username: 1, mets_lock_type: 1,
    mets_pending_sync: 1, mets_device_id: 1, mets_cred_overrides: 1, mets_accounts: 1
  };
  var token = '';
  try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}

  function fire(status, text) {
    window.__KAT_STATUS__ = { status: status, text: text };
    try {
      window.dispatchEvent(new CustomEvent('kat-sync', { detail: { status: status, text: text } }));
    } catch (e) {}
  }

  window.__KAT_USER__ = null;
  window.__KAT_TOKEN__ = '';
  window.__KAT_ONLINE__ = false;

  if (!token) {
    // No session yet: let the v71 landing and in-app sign-in flow run.
    fire('offline', 'Cloud: offline — sign in');
    return;
  }

  // ── Pull the authoritative state from the server before the app boots ──
  var state = null, user = null, reachable = false;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/state', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send(null);
    if (xhr.status === 401 || xhr.status === 403) {
      try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
      fire('offline', 'Cloud: session expired — sign in');
      return;
    }
    if (xhr.status >= 200 && xhr.status < 300) {
      var payload = JSON.parse(xhr.responseText || '{}');
      state = (payload && payload.state) || {};
      user = (payload && payload.user) || null;
      reachable = true;
    }
  } catch (e) {
    reachable = false;
  }

  if (!reachable) {
    // Offline: fall back to the last signed-in account cached on this device.
    try { user = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { user = null; }
  }
 
  window.__KAT_USER__ = user;
  window.__KAT_TOKEN__ = token;
  window.__KAT_ONLINE__ = reachable;

  function isSyncedKey(key) {
    return typeof key === 'string' && key.indexOf('mets_') === 0 && !SENSITIVE[key];
  }

  if (reachable) {
    // The server is the source of truth: drop stale browser-only copies first.
    try {
      var drop = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (isSyncedKey(k)) drop.push(k);
      }
      for (var j = 0; j < drop.length; j++) localStorage.removeItem(drop[j]);
    } catch (e) {}

    try {
      Object.keys(state).forEach(function (key) {
        if (!isSyncedKey(key)) return;
        localStorage.setItem(key, state[key]);
      });
    } catch (e) { console.warn('State hydration failed', e); }

    if (user) {
      try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (e) {}
    }
    try {
      localStorage.setItem('mets_sync_url', location.origin + '/api/sync?token=' + encodeURIComponent(token));
    } catch (e) {}
  }

  // ── Write-through autosave: every localStorage write goes to the server ──
  var pending = {}, saveTimer = null, inFlight = false, retryDelay = 0;
  var nativeSet = Storage.prototype.setItem;
  var nativeRemove = Storage.prototype.removeItem;

  function schedule(delay) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; flush(); }, delay == null ? 700 : delay);
  }

  function flush() {
    if (inFlight) return;
    var keys = Object.keys(pending);
    if (!keys.length) return;
    var updates = {};
    for (var i = 0; i < keys.length; i++) {
      updates[keys[i]] = pending[keys[i]];
      delete pending[keys[i]];
    }
    inFlight = true;
    fire('saving', 'Cloud: saving…');
    fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ updates: updates })
    }).then(function (response) {
      if (response.status === 401 || response.status === 403) {
        try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
        fire('offline', 'Cloud: session expired — please sign in');
        return;
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);
      retryDelay = 0;
      fire('saved', 'Cloud: saved');
    }).catch(function (err) {
      Object.keys(updates).forEach(function (key) {
        if (!(key in pending)) pending[key] = updates[key];
      });
      retryDelay = Math.min(retryDelay ? retryDelay * 2 : 5000, 60000);
      fire('offline', 'Cloud: offline — will retry');
      schedule(retryDelay);
    }).then(function () {
      inFlight = false;
      if (!retryDelay && Object.keys(pending).length) schedule();
    });
  }

  Storage.prototype.setItem = function (key, value) {
    nativeSet.call(this, key, value);
    try {
      if (this === window.localStorage && isSyncedKey(key)) {
        pending[key] = String(value);
        fire('saving', 'Cloud: saving…');
        schedule();
      }
    } catch (e) {}
  };

  Storage.prototype.removeItem = function (key) {
    nativeRemove.call(this, key);
    try {
      if (this === window.localStorage && isSyncedKey(key)) {
        pending[key] = null;
        fire('saving', 'Cloud: saving…');
        schedule();
      }
    } catch (e) {}
  };

  // Last chance to persist queued changes when the page is closed.
  window.addEventListener('pagehide', function () {
    var keys = Object.keys(pending);
    if (!keys.length) return;
    var updates = {};
    for (var i = 0; i < keys.length; i++) updates[keys[i]] = pending[keys[i]];
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', '/api/state', false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.send(JSON.stringify({ updates: updates }));
    } catch (e) {}
  });

  fire(reachable ? 'saved' : 'offline', reachable ? 'Cloud: connected' : 'Cloud: offline');
})();
