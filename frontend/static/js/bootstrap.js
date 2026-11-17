/* Katipunan AMS - Backend bootstrap and write-through autosave
   Extracted from frontend/templates/index.html. */

(function () {
  'use strict';
  var TOKEN_KEY = 'kat_token', USER_KEY = 'kat_user';
  var SENSITIVE = {
    mets_pin: 1, mets_password: 1, mets_username: 1, mets_lock_type: 1,
    mets_pending_sync: 1, mets_device_id: 1, mets_cred_overrides: 1, mets_accounts: 1,
    mets_admin_name: 1, mets_admin_user: 1, mets_admin_dept: 1,
    mets_theme: 1, mets_camera_id: 1, mets_sidebar_collapsed: 1,
    mets_last_backup_drive: 1, mets_sync_history: 1
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
  var state = null, user = null, reachable = false, stateVersion = '';
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
      stateVersion = (payload && (payload.version || payload.updated_at)) || '';
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
  window.__KAT_STATE_VERSION__ = reachable ? stateVersion : '';

  function isSyncedKey(key) {
    return typeof key === 'string' && key.indexOf('mets_') === 0 && !SENSITIVE[key];
  }

  // Durable list of keys changed locally but not yet accepted by the server.
  // Only the key names are stored; the values already live in localStorage.
  var DIRTY_KEY = 'kat_pending_state_keys';
  var dirty = {};
  try { dirty = JSON.parse(localStorage.getItem(DIRTY_KEY) || '{}') || {}; } catch (e) { dirty = {}; }
  if (typeof dirty !== 'object' || Array.isArray(dirty)) dirty = {};
  window.__KAT_HAS_DIRTY__ = function (key) { return !!dirty[key]; };

  if (reachable) {
    // The server is the source of truth, but never overwrite a locally
    // changed key that has not been uploaded yet.
    try {
      var drop = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (isSyncedKey(k) && !dirty[k]) drop.push(k);
      }
      for (var j = 0; j < drop.length; j++) localStorage.removeItem(drop[j]);
    } catch (e) {}

    try {
      Object.keys(state).forEach(function (key) {
        if (!isSyncedKey(key) || dirty[key]) return;
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
  // Rebuild the in-memory queue from the durable dirty keys so an offline
  // change made before the app was closed still uploads on the next launch.
  var pending = {};
  Object.keys(dirty).forEach(function (key) {
    if (!isSyncedKey(key)) return;
    try { pending[key] = localStorage.getItem(key); } catch (e) { pending[key] = null; }
  });
  var saveTimer = null, inFlight = false, retryDelay = 0;
  var nativeSet = Storage.prototype.setItem;
  var nativeRemove = Storage.prototype.removeItem;

  function saveDirty() {
    try { localStorage.setItem(DIRTY_KEY, JSON.stringify(dirty)); } catch (e) {}
  }

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
        throw new Error('SESSION_EXPIRED');
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json().catch(function () { return {}; });
    }).then(function (data) {
      if (data && (data.version || data.updated_at)) {
        window.__KAT_STATE_VERSION__ = data.version || data.updated_at;
      }
      // Only clear the durable dirty flags for keys that were not changed
      // again while this request was in flight.
      keys.forEach(function (key) {
        if (!(key in pending)) delete dirty[key];
      });
      saveDirty();
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
      if (this === window.localStorage && isSyncedKey(key) && !window.__KAT_REMOTE_HYDRATE__) {
        dirty[key] = true;
        saveDirty();
        pending[key] = String(value);
        fire('saving', 'Cloud: saving…');
        schedule();
      }
    } catch (e) {}
  };

  Storage.prototype.removeItem = function (key) {
    nativeRemove.call(this, key);
    try {
      if (this === window.localStorage && isSyncedKey(key) && !window.__KAT_REMOTE_HYDRATE__) {
        dirty[key] = true;
        saveDirty();
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
      if (xhr.status >= 200 && xhr.status < 300) {
        Object.keys(updates).forEach(function (key) {
          if (!(key in pending)) delete dirty[key];
        });
        saveDirty();
      }
    } catch (e) {}
  });

  // If the app was closed offline, retry the saved keys as soon as possible.
  if (Object.keys(pending).length) schedule(500);
  window.addEventListener('online', function () {
    if (Object.keys(pending).length) flush();
  });

  fire(reachable ? 'saved' : 'offline', reachable ? 'Cloud: connected' : 'Cloud: offline');
})();
