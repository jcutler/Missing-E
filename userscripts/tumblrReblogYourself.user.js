// ==UserScript==
// @name           Tumblr Reblog Yourself
// @description    Add a tumblr control button to reblog your own posts
// @namespace      http://userscripts.org/users/113977
// @include        http://www.tumblr.com/dashboard/iframe*
// @version        0.3.2
// @date           2011-02-04
// @creator        Jeremy Cutler
// ==/UserScript==
  
(function() {
   var scriptUpdater = {
      name : "Tumblr Reblog Yourself",
      shortname : 'try',
      version : "0.3.2",
      usoID : 85103,
      lastCheck : function() { return (window.localStorage.getItem(this.shortname + '_lastCheck') ? window.localStorage.getItem(this.shortname + '_lastCheck') : 0); },
      now : (new Date()).valueOf(),
      xmlhttp : (typeof(GM_xmlhttpRequest)!='undefined' && GM_xmlhttpRequest) || function(){},
      init : function() {
      },
      parse : function(me, responseDetails) {
         var verm = responseDetails.responseText.match(/@version\s*([0-9\.]*)/);
         if (verm.length < 2) return false;
         me.lastCheck = me.now;
         window.localStorage.setItem(this.shortname + '_lastCheck',me.now);
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

   div = document.getElementsByTagName("div")[0];
   controls = div.getElementsByTagName("a");
   noReblog = true;
   
   if (!/%2Fpost%2F/.test(window.location) && !/\/post\//.test(window.location))
      noReblog = false;
   else {
      for (i=0; i<controls.length; i++) {
         if (/reblog/.test(controls[i].href)) {
            noReblog = false;
            break;
         }
      }
   }
   
   if (noReblog) {
      var url;
      var loc = window.location.href;
      loc = loc.substring(loc.indexOf("src=")+4).replace(/%3A/gi,":").replace(/%2F/gi,"/");
      url = "http://www.tumblr.com/reblog/";
      url += loc.match(/&pid=([0-9]*)/)[1] + "/";
      url += loc.match(/&rk=([a-zA-Z0-9]*)/)[1];
   
      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('target', '_top');
   
      var icon = document.createElement('img');
      icon.style.height='20px';
      icon.style.width='64px';
      icon.style.borderWidth='0';
      icon.style.display='block';
      icon.style.cssFloat='left';
      icon.style.cursor='pointer';
      icon.alt='Reblog';
      icon.src='http://assets.tumblr.com/images/iframe_reblog_alpha.png?6';
   
      link.appendChild(icon);
      div.insertBefore(link,controls[controls.length-1]);
   }
}());
