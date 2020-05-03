/**
 * Ad Inspector for GPT Ads
 * https://github.com/dougwigg/gpt-ad-inspector 
 */
/* global window document alert googletag */   
((win, doc) => {
  'use strict';
  win.googletag = win.googletag || {cmd:[]};
  const CONTAINER_ID = 'AdInspctr';

  // The CSS
  const toolCSS = ['body.withNspct { padding-top:383px;}',
    '.nspctR { position:fixed; top:0; left:0; z-index:99000000; width:99%; display:flex;',
      'flex-wrap:wrap; margin:.5%; border-radius:3px; box-sizing:border-box; padding:20px 10px 10px;', 
      'background:rgba(80,190,150,.95); font-family:Arial, sans-serif; font-size:16px;}',
    '.nspctR .nspctClose { position:absolute; top:8px; right:8px; width:32px; height:32px;', 
      'border-radius:50%; background-color:#fff; z-index:1; box-shadow:0 3px 5px -1px rgba(0,0,0,.2),',
      '0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12); color:#00a680; text-align:center; }',
    '.nspctR .nspctClose:before { display:block; content: "+"; font: normal 29px Arial; transform: rotate(45deg);}',
    '.nspctR button, .nspctR .nspctClose { cursor:pointer;}',
    '.nspctR .nspctHdr, .nspctR .nspctFtr { flex: 0 0 100%; box-sizing:border-box; padding:10px; font-size:20px; font-weight:600;}',
    '.nspctR .nspctFtr { text-align:right; overflow:hidden; font-weight:normal; padding-right:5px;}',
    '.nspctR .nspctDebugSec { flex:1; margin:10px;}',
    '.nspctR .nspctDebugHdr { margin:0 0 5px; } #SLT_RNDRS { float:left; background:#efefef; border-radius:3px;',
      'padding:6px 10px; font-size:16px;}',
    '.nspctR .nspctDebugBox { min-width:280px; min-height:200px; max-height:200px; overflow-y:auto; padding:3px;',
      'background:#fff; border:1px solid #000;}',
    '.nspctR .nspctSlot { padding:2px; border-bottom:1px solid #888;}',
    '.nspctR .nspctSlot.selected { background:rgba(80, 190, 150, .30);} .nspctR .inpctLbl { padding: 5px 2px; font-weight:600;}',
    '.nspctR #SLOT_TARGETING .inpctLbl { background:rgba(80,190,150,.30); border-bottom:1px solid #888;}',
    '.nspctR .nspctBtn { font-weight:500; font-size:14px; border-radius:3px; padding:6px 10px; margin:5px 5px 5px 0;', 
      'color:#fff; background-color:#000; border:none;}',
    '.adInspTbl { width:100%; margin:2px 0; background-color:#efefef; border-style:none; border-radius:3px;}',
    '.adInspTbl td { text-align: center; padding: 0 5px;}',
    '@media only screen and (max-width: 480px) {',
      '.nspctR .nspctHdr { font-size:16px; }',
      '.nspctR { padding:5px;} .adInspTbl { font-size:14px; }',
      '.nspctR .nspctDebugBox { width:auto; min-height:100px; max-height:100px;}',
      '.nspctR .nspctFtr button { margin:4px; font-size:12px;}}'].join('');

  // HTML skeleton
  const toolHTML = ['<span class="nspctClose"></span><div class="nspctHdr">Ad Inspector (DoubleClick GPT)</div>',
    '<div class="nspctDebugSec"><div class="nspctDebugHdr">Page Targeting (All ads)</div><div class="nspctDebugBox pageTargeting"></div></div>',
    '<div class="nspctDebugSec"><div class="nspctDebugHdr">Active Ads (slots)</div><div class="nspctDebugBox nspctSlots"></div></div>',
    '<div class="nspctDebugSec"><div class="nspctDebugHdr">Slot Targeting</div><div class="nspctDebugBox slotTargeting" id="SLOT_TARGETING">',
    '</div></div><div class="nspctFtr"><div id="SLT_RNDRS">New renders:&nbsp;<span>0</span></div>'].join('');

  /**
   * Close the DoubleClick publisher console ---there's no public close method so we'll peek at the method code
   */
  function closeConsole(){
    const members = [];
    for (const m in googletag.console){
      members.push(m + '');
    }
    const closeFn = members.filter(member => /toggling/.test(googletag.console[member] + ''));
    if(closeFn.length) {
      googletag.console[closeFn[0]]();
    }
  }

  /**
   * Toggle the DoubleClick publisher console
   */ 
  function toggleConsole(){
    if (win.googletag.apiReady) {
      if (doc.getElementById('google_pubconsole_console')) {
        closeConsole();
      } else {
        googletag.openConsole();
      } 
    }
  }

  /**
   * Create an HTML element
   */
  function createElement(type, elemId, elemClass, innerHTML) {
    var el = doc.createElement(type);
    if (elemId) { el.id = elemId }
    if (elemClass) { el.className = elemClass }
    el.innerHTML = innerHTML || ''; 
    return el;
  }

  /**
   * Create a button element with click handler
   */
  function createButton(innerText, clickFn) {
    const btn = createElement('button', null, 'nspctBtn', innerText); 
    if (clickFn) {
      btn.onclick = clickFn;
    }
    return btn;
  }

  /**
   * Create the footer element
   */
  function addFooterButtons() {
    const ftr = doc.querySelector('.nspctFtr'); 
    // publisher console
    ftr.appendChild(createButton('Toggle Publisher Console', toggleConsole))
  }

  /**
   * Display the page-level targeting
   */
  function updatePageTargeting() {
    const elem = doc.querySelector('.pageTargeting'); 
    const pageTargeting = {};
    const targetingKeys = googletag.pubads().getTargetingKeys();
    targetingKeys.forEach((key) => {
      pageTargeting[key] = googletag.pubads().getTargeting(key); 
    });
    elem.innerHTML = prettyString(pageTargeting);
  }

  /**
   * Add line breaks, make Array display pretty, etc.
   */
  function prettyString(json) {
    // preserve the look of arrays in the display
    Object.keys(json).forEach((k) => {
      if(Array.isArray(json[k])) {
        json[k] = '[' + json[k].join('~') + ']';
      }
    });
    // line breaks for booleans and "," etc.
    return JSON.stringify(json).replace(/e,/g,'e<br/>').replace(/","/g,'<br/>').replace(/[{}"]/g,'').replace(/~/g,', ').replace(/:/g,'=');
  }

  /**
   *  Display the slot targeting for the selected slot
   */
  function displaySlotTargeting(elemId, targeting) {
    const slotTargetingElem = doc.getElementById('SLOT_TARGETING'); 
    slotTargetingElem.innerHTML = `<div class="inpctLbl">${elemId}</div>${targeting}`;
  }	

  /**
   *  Display the slot targeting for the selected slot using element Id 
   */
  function displaySlotTargetingById(elemId) {
    const slots = googletag.pubads().getSlots().filter(slot => slot.getSlotElementId() === elemId); 
    if (slots.length) {
      const slotTargeting = slots[0].getTargetingMap ? slots[0].getTargetingMap(): {}; 
      if(Object.keys(slotTargeting).length > 0) {
        displaySlotTargeting(elemId, prettyString(slotTargeting));
      }   
    }
  }

  /**
   * Display the listing of active slots
   */
  function retrievePageAds() {
    const elem = doc.querySelector('.nspctSlots');     
    elem.innerHTML = '';

    const adSlots = googletag.pubads().getSlots();        
    if (adSlots) {
      // autoselect first when done if nothing else is selected
      let firstListing;
      adSlots.forEach((slot) => {
        const ad = doc.getElementById(slot.getSlotElementId());
        if(ad) {
          if (!firstListing) {
            firstListing = ad.id;
          }
          const wrapDiv = createElement('div', `nspctDebug_${ad.id}`, 'nspctSlot');
          // add label
          const lbl = createElement('div', null, 'inpctLbl', ad.id); 
          wrapDiv.appendChild(lbl);
          const path = createElement('div', null, null, slot.getAdUnitPath());
          wrapDiv.appendChild(path);
          // refresh button
          const refresh = () => {
            googletag.pubads().refresh([slot], { changeCorrelator:true });
          };
          const btn = createButton('refresh', refresh);
          wrapDiv.appendChild(btn);
  
          const slotTargeting = slot.getTargetingMap ? slot.getTargetingMap(): {}; 
          if(Object.keys(slotTargeting).length > 0) {
            const getTargeting = () => {
              displaySlotTargeting(ad.id, prettyString(slotTargeting));
            };  
            wrapDiv.appendChild(createButton('slot targeting', getTargeting));
          }
   
          // display the ad details
          const respInfo = doc.createElement('div');
          respInfo.innerHTML = getResponseInfo(slot); 
          wrapDiv.appendChild(respInfo); 

          // highlight the ad item on click
          wrapDiv.onclick = (event) => {
            const adItems = [].slice.call(doc.querySelectorAll(`#${CONTAINER_ID} .nspctSlot`)); 
            adItems.forEach((adItem) => {
              adItem.classList.remove('selected');
            });
            event.target.closest('.nspctSlot').classList.add('selected');
          };
          elem.appendChild(wrapDiv);  
        }  // ?ad
      });  // nspctSlots.forEach
      // autoselect first item
      if (firstListing && !doc.querySelector('.nspctR .nspctSlot.selected')) {
        const firstItem = doc.querySelector(`.nspctR #nspctDebug_${firstListing}`);
        firstItem && firstItem.classList.add('selected');
        displaySlotTargetingById(firstListing);
      }
    }
  }

  /**
   * Get the ad-specific details for the rendered ad 
   */
  function getResponseInfo(slot) {
    const info = slot.getResponseInformation();
    if (info) {
      const { advertiserId = 'N/A', campaignId = 'N/A', creativeId = 'N/A'} = info;
      const tableStart = '<table class="adInspTbl"><tr><td>advertiserId</td><td>campaignId</td><td>creativeId</td></tr>';
      return `${tableStart}<tr><td>${advertiserId}</td><td>${campaignId}</td><td>${creativeId}</td></tr></table>`;
    }
    return 'Not rendered';
  }

  /**
   * Listen for ad rendering amnd update creative IDs
   */
  function handleSlotRender(event) {
    if (event) {
      retrievePageAds();
      // update render count
      const countEl = doc.querySelector('#SLT_RNDRS span');
      countEl.innerText = (parseInt(countEl.innerText,10)+1);
    }
  }

  /**
   * Create the UI
   */
  function buildContainer() {
    const container = createElement('div', CONTAINER_ID, 'nspctR', toolHTML);
    const styles = createElement('style', null, null, toolCSS);
    container.appendChild(styles);
    doc.body.appendChild(container);
    updatePageTargeting();
    retrievePageAds();
    addFooterButtons(); 

    const close = doc.querySelector('.nspctClose'); 
    close.onclick = function(){ 
      container && container.parentNode.removeChild(container);    
      doc.body.classList.remove('withNspct'); 
    };
  }

  /**
   * Load Ad Inspector 
   */  
  function init(){
    // Sanity check that the API is loaded
    if(!(win.googletag && googletag.apiReady)) {
      alert("The DoubleClick API is not loaded");
    }

    // Load the css + handlers only once
    if (!win.nspctLoaded) {
      googletag.pubads().addEventListener('slotRenderEnded', handleSlotRender);
      win.nspctLoaded = true;
    }
    // Build the UI
    buildContainer();
    doc.body.classList.add('withNspct');
  }
    
  try {
    googletag.cmd.push(init);
  } catch(e) {
    alert(`Unable to initialize Ad Inspector - ${e}`);
  }

})(window, document);