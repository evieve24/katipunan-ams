/* Katipunan AMS - Service worker registration
   Extracted from frontend/templates/index.html. */
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(e=>console.warn('SW failed',e)));}