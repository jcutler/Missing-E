// ==UserScript==
// @include http://*
// ==/UserScript==

window.addEventListener("DOMContentLoaded", function() {
   var i;
   var channel = new MessageChannel();

   channel.port1.onmessage = function(evt) {
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
   };

   opera.extension.postMessage({greeting: "initialize",
                                url: window.location.href},
                               [channel.port2]);
}, false);
