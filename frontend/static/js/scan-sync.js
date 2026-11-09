/* Katipunan AMS - durable scan queue (IndexedDB) and scan-history sync.
   Scans are stored locally first, then posted to /api/scans. The backend uses
   the client scan_id as an idempotency key, so retries cannot create
   duplicates. No asset or employee details are stored in this queue. */
'use strict';

(function () {
  var DB_NAME = 'katipunan_ams_scans';
  var STORE = 'pending_scans';
  var DB_VERSION = 1;
  var FALLBACK_KEY = 'kat_pending_scans';
  var dbPromise = null;
  var flushing = false;
  var pendingCount = 0;
  var flushTimer = null;

  function token() {
    try {
      return localStorage.getItem('kat_token') || '';
    } catch (e) {
      return '';
    }
  }

  function online() {
    return typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  }

  function newId() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'SCAN-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available'));
        return;
      }
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'scan_id' });
        }
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = function () {
        reject(req.error || new Error('IndexedDB open failed'));
      };
    });
    return dbPromise;
  }

  function withStore(mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, mode);
        var store = tx.objectStore(STORE);
        var request = fn(store);
        tx.oncomplete = function () {
          resolve(request ? request.result : undefined);
        };
        tx.onerror = function () {
          reject(tx.error || new Error('IndexedDB transaction failed'));
        };
        tx.onabort = function () {
          reject(tx.error || new Error('IndexedDB transaction aborted'));
        };
      });
    });
  }

  function fallbackRead() {
    try {
      var list = JSON.parse(localStorage.getItem(FALLBACK_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function fallbackWrite(list) {
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function getAll() {
    return withStore('readonly', function (store) {
      return store.getAll();
    }).catch(function () {
      return fallbackRead();
    });
  }

  function putRecord(record) {
    return withStore('readwrite', function (store) {
      return store.put(record);
    }).catch(function () {
      var list = fallbackRead().filter(function (item) {
        return item.scan_id !== record.scan_id;
      });
      list.push(record);
      fallbackWrite(list);
    });
  }

  function deleteRecord(scanId) {
    return withStore('readwrite', function (store) {
      return store.delete(scanId);
    }).catch(function () {
      fallbackWrite(
        fallbackRead().filter(function (item) {
          return item.scan_id !== scanId;
        })
      );
    });
  }

  function setCount(count) {
    pendingCount = Math.max(0, Number(count) || 0);
    window.__KAT_SCAN_PENDING__ = pendingCount;
    updateIndicators();
  }

  function refreshCount() {
    return getAll()
      .then(function (rows) {
        setCount(rows.length);
        return pendingCount;
      })
      .catch(function () {
        return pendingCount;
      });
  }

  function updateIndicators() {
    var onlineNow = online();
    var text = onlineNow
      ? pendingCount
        ? 'Online · ' + pendingCount + ' scan' + (pendingCount === 1 ? '' : 's') + ' pending sync'
        : 'Online · scan history synced'
      : pendingCount
        ? 'Offline · ' + pendingCount + ' scan' + (pendingCount === 1 ? '' : 's') + ' queued'
        : 'Offline · scans will queue locally';
    document.querySelectorAll('[data-scan-status]').forEach(function (el) {
      el.textContent = text;
      el.classList.toggle('pending', pendingCount > 0);
      el.classList.toggle('offline', !onlineNow);
    });
    document.querySelectorAll('[data-scan-pending]').forEach(function (el) {
      el.textContent = String(pendingCount);
      el.style.display = pendingCount ? 'inline-flex' : 'none';
    });
    if (typeof window.updateSyncBar === 'function') {
      try {
        window.updateSyncBar();
      } catch (e) {}
    }
  }

  function normalize(record) {
    var demo = !!record.demo;
    var lat = record.latitude;
    var lng = record.longitude;
    if (demo) {
      lat = null;
      lng = null;
    }
    return {
      scan_id: record.scan_id || newId(),
      asset_id: String(record.asset_id || '').trim(),
      latitude: lat == null || lat === '' ? null : Number(lat),
      longitude: lng == null || lng === '' ? null : Number(lng),
      accuracy:
        record.accuracy == null || record.accuracy === '' ? null : Number(record.accuracy),
      scanned_at: record.scanned_at || new Date().toISOString(),
      activity: String(record.activity || 'QR scan').slice(0, 255),
      source: String(record.source || 'qr_scan').slice(0, 40),
      device: String(record.device || navigator.userAgent || '').slice(0, 180),
      created_at: record.created_at || new Date().toISOString(),
      demo: false
    };
  }

  function enqueue(record) {
    var item = normalize(record);
    if (!item.asset_id) return Promise.resolve(null);
    return putRecord(item)
      .then(function () {
        return refreshCount();
      })
      .then(function () {
        if (online() && token()) {
          // Fire-and-forget; the UI updates when the pending count changes.
          setTimeout(flush, 50);
        }
        return item;
      });
  }

  function updatePending(scanId, patch) {
    if (!scanId) return Promise.resolve(false);
    return getAll().then(function (rows) {
      var found = rows.find(function (row) {
        return row.scan_id === scanId;
      });
      if (!found) return false;
      var updated = Object.assign({}, found, patch || {});
      updated.scan_id = scanId;
      return putRecord(updated).then(function () {
        return refreshCount();
      }).then(function () {
        if (online() && token()) setTimeout(flush, 50);
        return true;
      });
    });
  }

  function flush() {
    if (flushing || !token() || !online()) {
      updateIndicators();
      return Promise.resolve(0);
    }
    flushing = true;
    var sent = 0;
    return getAll()
      .then(function (rows) {
        var chain = Promise.resolve();
        rows.forEach(function (record) {
          chain = chain.then(function () {
            return fetch('/api/scans', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token()
              },
              body: JSON.stringify(record)
            }).then(function (response) {
              if (response.status === 401 || response.status === 403) {
                throw new Error('Session expired');
              }
              if (response.status === 404) {
                // The asset may still be syncing from an offline change;
                // keep the scan queued and retry on the next pass.
                return;
              }
              if (!response.ok) {
                throw new Error('HTTP ' + response.status);
              }
              // 200 = duplicate, 201 = created. Finish the local queue item.
              return deleteRecord(record.scan_id).then(function () {
                sent += 1;
              });
            });
          });
        });
        return chain;
      })
      .catch(function () {
        return sent;
      })
      .then(function () {
        flushing = false;
        return refreshCount().then(function () {
          return sent;
        });
      });
  }

  function startTimer() {
    if (flushTimer) clearInterval(flushTimer);
    flushTimer = setInterval(function () {
      if (online() && token()) flush();
    }, 20000);
  }

  window.addEventListener('online', function () {
    updateIndicators();
    flush();
  });
  window.addEventListener('offline', updateIndicators);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      refreshCount();
      if (online()) flush();
    }
  });

  // Let "Sync Now" push queued scans as well as general state changes.
  var originalSyncNow = window.syncNow;
  if (typeof originalSyncNow === 'function') {
    window.syncNow = function () {
      var result = originalSyncNow.apply(this, arguments);
      try {
        flush();
      } catch (e) {}
      return result;
    };
  }

  window.KatScanQueue = {
    enqueue: enqueue,
    flush: flush,
    pendingCount: function () {
      return pendingCount;
    },
    refresh: refreshCount,
    updatePending: updatePending,
    newId: newId
  };

  setTimeout(function () {
    refreshCount().then(function () {
      if (online() && token()) flush();
    });
  }, 800);
  startTimer();
})();
