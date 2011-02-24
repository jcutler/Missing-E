// ==UserScript==
// @name           Tumblr Dash Links To Tabs
// @namespace      http://userscripts.org/users/113977
// @description    Open all links from your tumblr dashboard in a new tab or window
// @include        http://www.tumblr.com/dashboard*
// @version        0.1.2
// @date           2011-02-01
// @creator        Jeremy Cutler
// ==/UserScript==

(function(){
   var scriptUpdater = {
      name : "Tumblr Dash Links To Tabs",
      shortname : "tdl",
      version : "0.1.2",
      usoID : 94575,
      lastCheck : function() { return (window.localStorage.getItem(this.shortname + '_lastCheck') ? window.localStorage.getItem(this.shortname + '_lastCheck') : 0); },
      now : (new Date()).valueOf(),
      xmlhttp : (typeof(GM_xmlhttpRequest)!='undefined' && GM_xmlhttpRequest) || function(){},
      init : function() {
      },
      parse : function(me, responseDetails) {
         var verm = responseDetails.responseText.match(/@version\s*([0-9\.]*)/);
         if (verm.length < 2) return false;
         me.lastCheck = me.now;
         window.localStorage.setItem(this.shortname + '_lastCheck', me.now);
         if (verm[1] != me.version) {
            var answer = confirm(me.name + " has been updated to version " + verm[1] + "\n\nDo you want to upgrade?\n\nThis page should be reloaded after installing the new version.");
            if (answer) {
               window.open("http://userscripts.org/scripts/show/" + me.usoID);
            }
         }
      },
      doCheck : function() {
         this.init();
         if (this.now - this.lastCheck() > 604800000) {
            this.xmlhttp({
               method: "GET",
               url: "http://userscripts.org/scripts/source/" + this.usoID + ".meta.js",
               onload: function(responseDetails) { scriptUpdater.parse(scriptUpdater, responseDetails); }
            });
         }
      }
   };

   var isFF = (navigator.userAgent && navigator.userAgent.indexOf("Firefox") != -1);

   if (isFF) scriptUpdater.doCheck();

   var lcol = document.getElementById('left_column')

   if (lcol) {
      lcol.addEventListener('click', function(e) {
         if (e.target == undefined || e.target == null) return false;
         var node = e.target;
         if (node.tagName!='A') {
            for (; node != null && node.tagName != 'AREA' && node.tagName != 'A' && node.id != this; node=node.parentNode);
         }
         if (node == null || node == this) return false;
         if (!/^#/.test(node.href))
            node.target='_blank'
         return true;
      }, false);
   }
}());