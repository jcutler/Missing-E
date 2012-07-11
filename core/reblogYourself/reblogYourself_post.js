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

(function(){

if (typeof MissingE === "undefined") { return; }

MissingE.packages.reblogYourselfPost = {

   run: function() {
      var div = document.getElementsByTagName("div")[0];
      var controls;
      if (div) { controls = div.getElementsByTagName("a"); }
      var noReblog = true;

      if (!MissingE.isTumblrURL(location.href, ["iframe"])) {
         noReblog = false;
      }
      else {
         var i;
         for (i=0; i<controls.length; i++) {
            if (/\/reblog\//.test(controls[i].href)) {
               noReblog = false;
               break;
            }
         }
      }

      if (noReblog) {
         var url, redir, i;
         var loc = location.href;
         var last = controls[controls.length-1];
         var gdp = document.getElementById('MissingE_gotoDashPost_link');
         if (gdp) {
            last = gdp;
         }
         loc = loc.substring(loc.indexOf("src=")+4);
         redir = loc.substring(0,loc.indexOf("&"));
         loc = loc.replace(/%3A/gi,":")
                  .replace(/%2F/gi,"/");
         url = "/reblog/";
         if (/&pid=(\d*)/.test(loc)) {
            url += loc.match(/&pid=(\d*)/)[1] + "/";
            url += loc.match(/&rk=(\w*)/)[1];
            url += '?redirect_to=' + redir;

            var link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('target', '_top');

            var dashimg = null;
            for (i=controls.length-1; i>=0; i--) {
               if (controls[i].href === 'http://www.tumblr.com/dashboard') {
                  dashimg = controls[i].getElementsByTagName('img')[0];
                  break;
               }
            }
            var suffix = '';
            var lang = 'en';
            if (dashimg) {
               suffix = dashimg.src.match(/alpha([^\.]*)(.*)/);
               if (suffix !== null && suffix.length > 2) {
                  lang = suffix[1].match(/[a-z]+/);
                  if (lang === null || lang.length === 0) {
                     lang = 'en';
                  }
                  else {
                     lang = lang[0];
                  }
                  suffix = suffix[1] + suffix[2];
               }
            }
            else {
               suffix = '.png';
            }

            var icon = document.createElement('img');
            icon.style.height='20px';
            icon.style.width='64px';
            icon.style.borderWidth='0';
            icon.style.display='block';
            icon.style.cssFloat='left';
            icon.style.cursor='pointer';
            icon.alt=MissingE.getLocale(lang).reblog;
            icon.src = 'http://assets.tumblr.com/images/iframe_reblog_alpha' +
               suffix;
            link.appendChild(icon);
            div.insertBefore(link,last);
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("MissingEaddReblog", true, true);
            link.dispatchEvent(evt);
         }
      }
   },

   init: function() {
      if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href)) {
         if (extension.isFirefox) {
            extension.sendRequest("settings",
                                  {component: "reblogYourself",
                                   subcomponent: "post"},
                                  function(response) {
               if (response.component !== "reblogYourself") {
                  return;
               }
               MissingE.packages.reblogYourselfPost.run();
            });
         }
         else {
            MissingE.packages.reblogYourselfPost.run();
         }
      }
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.reblogYourselfPost.init();
}

}());
