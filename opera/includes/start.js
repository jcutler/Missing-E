// ==UserScript==
// @include http://*
// ==/UserScript==

window.addEventListener("DOMContentLoaded", function() {
   var i;

   document.addEventListener("sendOperaMessage", function(e) {
      opera.extension.postMessage(e.data);
   }, false);

   opera.extension.addEventListener("message", function(evt) {
      if (evt.data.greeting === "initialize") {
         var head = document.getElementsByTagName("head")[0];
         var headChild = head.firstChild;
         var files = evt.data.files;
         for (i=0; i<files.css.length; i++) {
            var x = document.createElement("style");
            x.textContent = files.css[i];
            head.insertBefore(x, headChild);
         }
         for (i=0; i<files.js.length; i++) {
            var y = document.createElement("script");
            y.textContent = files.js[i];
            head.appendChild(y);
         }
      }
      else {
         var msgEvt = document.createEvent("MessageEvent");
         msgEvt.initMessageEvent("receiveOperaMessage", true, true, evt.data,
                                 window.location.origin, 0, window, null);
         document.dispatchEvent(msgEvt);
      }
   }, false);

   opera.extension.postMessage({greeting: "initialize",
                                url: window.location.href});
}, false);
