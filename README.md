# gpt-ad-inspector
This is a vanilla-js script for viewing ad targeting and rendering details of DoubleClick ads on any website.

The standard/best way to use this script is via a bookmark(let) ---a bookmark with Javascript as the url.

Browsers don't allow adding local scripts to web pages so'll you'll need to host the script somewhere (on your website).

The bookmarklet javascript snippet loads the AdInspector.js script from the website (update YOUR.DOMAIN.COM) where you've hosted the script:

BOOKMARKLET URL:

javascript:(()=>{if(typeof googletag!=='undefined'){const d=document,s=document.createElement('script'); s.src='https://[YOUR.DOMAIN.COM]/AdInspector.js';d.body.appendChild(s);}else{alert('DoubleClick GPT (googletag) not found on this site!');}})();
