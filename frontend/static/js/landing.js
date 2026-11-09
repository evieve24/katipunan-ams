/* Katipunan AMS - Landing screen particles and entrance
   Extracted from frontend/templates/index.html. */

(function(){
  var container=document.getElementById('lpParticles');
  if(container){
    for(var i=0;i<20;i++){
      var p=document.createElement('div');
      p.className='lp-particle';
      var size=Math.random()*4+1.5;
      p.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(Math.random()*100)+'%;bottom:'+(Math.random()*20)+'%;animation-duration:'+(Math.random()*10+8)+'s;animation-delay:'+(Math.random()*8)+'s;opacity:'+(Math.random()*0.5+0.2)+';';
      container.appendChild(p);
    }
  }
}());

function enterSystem(){
  clearTimeout(window._lpAutoTimer);
  var ls=document.getElementById('landingScreen');
  ls.classList.add('fade-out');
  setTimeout(function(){
    ls.style.display='none';
    if(typeof initPostLanding==='function') initPostLanding();
    else {
      // Always show the auth-method choice screen first
      showLockTypeChooser();
    }
  },950);
}

// After a successful sign-in the page reloads; skip the landing screen once.
window.addEventListener('DOMContentLoaded', function(){
  if(sessionStorage.getItem('kat_force_login')==='1'){
    sessionStorage.removeItem('kat_force_login');
    var fl=document.getElementById('landingScreen');
    if(fl){fl.classList.add('fade-out');fl.style.display='none';}
    if(typeof initPostLanding==='function') initPostLanding();
    return;
  }
  if(sessionStorage.getItem('kat_skip_landing')==='1'){
    sessionStorage.removeItem('kat_skip_landing');
    var ls=document.getElementById('landingScreen');
    if(ls){ls.classList.add('fade-out');ls.style.display='none';}
    if(typeof initPostLanding==='function') initPostLanding();
  }
});

// Landing "Sign in" link: drop any remembered session and go to role/login.
function enterLogin(){
  try{localStorage.removeItem('kat_token');localStorage.removeItem('kat_user');}catch(e){}
  try{sessionStorage.setItem('kat_force_login','1');}catch(e){}
  location.reload();
}
