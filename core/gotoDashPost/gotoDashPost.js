/*
 * 'Missing e' Extension
 *
 * Copyright 2012, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: license/GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Missing e' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Missing e'. If not, see <http://www.gnu.org/licenses/>.
 */

/*global extension, MissingE */

(function(){

if (typeof MissingE === "undefined") { return false; }

MissingE.packages.gotoDashPost = {
   run: function() {
      var i,j;
      var noGoto = true;
      var div = document.getElementsByTagName("div")[0];
      var controls = div.getElementsByTagName("a");

      noGoto = document.getElementById("MissingE_gotoDashPost_link") == null;

      if (noGoto) {
         extension.insertStyle("#MissingE_gotoDashPost_link { " +
            "padding-left:18px; } #MissingE_gotoDashPost_link::before { " +
            "background: url('" +
            extension.getURL('core/gotoDashPost/gotoIcon.png') +
            "') 4px 3px no-repeat; }");
         var last = controls[controls.length-1];
         var following = false;
         var you = true;
         for (i=0; i<document.forms.length; i++) {
            if (/unfollow$/.test(document.forms[i].action)) {
               following = true;
               last = document.forms[i];
            }
            if (/follow$/.test(document.forms[i].action)) {
               you = false;
               last = document.forms[i];
            }
         }
         if (following || you) {
            var pid = location.href;
            var st = pid.indexOf("pid")+4;
            var en = pid.indexOf("&",st);
            pid = pid.substring(st, en);
            pid = Number(pid)+1;

            var dashlnk = document.createElement('a');
            dashlnk.setAttribute('href',
                                 'http://www.tumblr.com/dashboard/49/' +
                                    pid);
            dashlnk.setAttribute('target', '_top');
            dashlnk.id = "MissingE_gotoDashPost_link";
            dashlnk.className = "btn icon";
            dashlnk.textContent = "Dash";
            div.insertBefore(dashlnk,last);
         }
      }
   },

   init: function() {
      if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href) &&
          /(%2[fF]|\/)post(%2[fF]|\/)/.test(location.href)) {
         if (extension.isFirefox) {
            extension.sendRequest("settings", {component: "gotoDashPost"},
                                  function(response) {
               if (response.component !== "gotoDashPost") {
                  return;
               }
               MissingE.packages.gotoDashPost.run();
            });
         }
         else {
            MissingE.packages.gotoDashPost.run();
         }
      }
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.gotoDashPost.init();
}

}());
