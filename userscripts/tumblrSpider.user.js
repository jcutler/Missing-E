// ==UserScript==
// @name           Tumblr - Aah! A Spider!
// @namespace      http://userscripts.org/users/113977
// @description    This script adds nothing of any real value to your Tumblr dashboard. Don't bother installing it. Seriously.
// @include        http://www.tumblr.com/tumblelog/*
// @include        http://www.tumblr.com/dashboard*
// @include        http://www.tumblr.com/inbox*
// @version        0.0.5
// @date           2011-06-29
// @creator        Jeremy Cutler
// ==/UserScript==

var spider = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAATCAYAAABLN4eXAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sGDg4tH3wOvs8AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAspJREFUKM91k89PE3kYxp/vtzMTyzomtRYaiNgaWfeyUTdfEpM9rLp68uRlswdDws1/wD+Ag4Zkw4FQEsIFLjQTgQOQPVAmPZDxQPgmw6/aITGIB4GRYTS2W3HGmXcP1qZLsu/tyfN88h7e5wXODBGliCjbpnvPZnjT4ER0mYgSAB4CcNsy54nox2aupwUB+BmABkAcHR196O/v7/pOTExMaABuNeXNFhTH8Y3h4eFzcRz/MjQ01L22tnaNiJ4T0a+WZaHRaFwDgHq9fr0FnZ6eXrUsK4yiqNdxnH3O+e/NzfcPDg5czvkFAGCMpVuQoigdQRCccM6VRCJRDcMwCQBhGCbz+XxNURRORFzTNK0d4lNTUx1SSpqcnAwNw4gBwDCMeGRkJCmlJABdiUSCAQADgMPDw7+y2SwjIjDGPtVqNV3XdVar1UjX9VMASQDwPI8ymcxTDgADAwNwHKds23Y9juOkrusMAHRdZ1EUkZSy5jhOeXBw8NudiOhRsVikXC53b3l5+YcgCJT2QwZBkDRNU8/lcvcKhQIR0X0O4PbS0tKIpmnx4uLiK1VVWTukqipbWFjYUVU1np+fHwXwgLuu+2V2dvbJyckJy2Qyr33fp3bI8zzq7Ox8c3x8zMrl8mPf9z9z0zTPjY+P/23bNorF4tv19fX/9ExKiZmZmTe2bVOhUCiXSqUObpqmn06n86VS6XMURb2GYfwTx/H3smJubq4ehuGVlZWVRiqVypum+ZHv7OxUPM+7uLq6uuu67qVqtbo7OjqKRqOBsbExVCoVx3XdtGVZu77vX9zc3Kwkuru76wDyPT091Y2NDWVvb299e3v79vT0NNva2iIAL3zfT/X19b3b39+/VKlUXgIAhBB/BEHQJYS429S/CSGeCSHuNPWdpv9nqxFCiJ8AvAegSSmPzj6dEKITwFcAWSnlq7PG/44QovVj/wIlsW0z7Ls3TwAAAABJRU5ErkJggg==';

var st = document.createElement('style');
st.setAttribute('type','text/css');
st.innerHTML = '#right_column #aah_spider { background:url("' + spider + '") no-repeat 13px 9px; }';
document.getElementsByTagName('head')[0].appendChild(st);

function doSpider() {
   if (document.getElementById('ahh_spider')) { return false; }
   var rcol = document.getElementById('right_column');
   if (!rcol) { return; }
   var ancs = rcol.getElementsByTagName('a');
   var i, queue;
   for (i=0; i<ancs.length; i++) {
      if (/\/tumblelog\/[^\/]+\/queue/.test(ancs[i].href) ||
          /\/queue/.test(ancs[i].href))
      {
         queue = ancs[i];
         break;
      }
   }
   if (queue) {
      var sp = document.createElement('li');
      sp.id = 'aah_spider_item';
      sp.innerHTML = '<a id="aah_spider" href="#" onclick="alert(\'Kill it! Kill it! Break its legs!\');return false;"><div class="hide_overflow">Aah! A Spider!</div></a>';
      queue.parentNode.parentNode.insertBefore(sp, queue.parentNode.nextSibling);
   }
}

doSpider();

document.addEventListener('DOMNodeInserted', function(e) {
   if (e.target &&
       e.target.id === 'MissingE_sidebar') {
      doSpider();
   }
}, false);
