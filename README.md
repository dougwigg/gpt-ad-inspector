# gpt-ad-inspector
This is a vanilla-js script for viewing ad targeting and rendering details of DoubleClick ads on any website.

The standard/best way to use this script is via a bookmark(let) ---a bookmark with Javascript as the url.

Browsers don't allow adding local scripts to web pages so you'll need to host the script somewhere (e.g. on your website).

The bookmarklet javascript snippet below loads the AdInspector.js script from your website (update YOUR.DOMAIN.COM):

BOOKMARKLET URL:

javascript:(()=>{if(typeof googletag!=='undefined'){const d=document,s=document.createElement('script'); s.src='https://[YOUR.DOMAIN.COM]/AdInspector.js';d.body.appendChild(s);}else{alert('DoubleClick GPT (googletag) not found on this site!');}})();

![screenshot](https://user-images.githubusercontent.com/22104323/80921938-a47be980-8d47-11ea-88ae-0791c2e32816.png)
