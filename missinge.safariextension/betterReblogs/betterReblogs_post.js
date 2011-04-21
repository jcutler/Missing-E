/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: GPL-LICENSE.txt
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

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function addTags(link) {
   var i;
   if (link === undefined || link === null) {
      var div = document.getElementsByTagName("div")[0];
      var controls = div.getElementsByTagName("a");
      for (i=0; i<controls.length; i++) {
         if (/reblog/.test(controls[i].href)) {
            link = controls[i];
            break;
         }
      }
      if (link === undefined || link === null) {
         return false;
      }
   }

   var host, pid;
   var loc = location.href;
   loc = loc.substring(loc.indexOf("src=")+4);
   loc = loc.replace(/%3A/gi,":")
            .replace(/%2F/gi,"/");
   host = loc.match(/http:\/\/[^\/]*/)[0];
   pid = loc.match(/&pid=([0-9]*)/)[1];
   safari.self.tab.dispatchMessage("tags", {pid: pid, url: host});

   link.addEventListener('mousedown',function(e){
      if (e.which === 1 || e.which === 2) {
         var tags = this.getAttribute('tags');
         if (tags !== undefined && tags !== null) {
            setReblogTags(this.getAttribute('tags').split(','));
         }
      }
   }, false);

   return true;
}

function receiveTags(response) {
   if (response.name !== "tags") { return; }
   var i,link;
   var div = document.getElementsByTagName("div")[0];
   var controls = div.getElementsByTagName("a");
   for (i=0; i<controls.length; i++) {
      if (/reblog/.test(controls[i].href)) {
         link = controls[i];
         break;
      }
   }
   if (link !== undefined && link !== null) {
      if (response.message.success) {
         link.getElementsByTagName('img')[0].src =
               safari.extension.baseURI + 'betterReblogs/reblog_tags.png';
         link.setAttribute('tags',response.message.data.join(','));
      }
      else {
         link.getElementsByTagName('img')[0].src =
               safari.extension.baseURI + 'betterReblogs/reblog_tags_fail.png';
      }
   }
}

function MissingE_betterReblogs_post_doStartup(frameURL) {
   if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href) &&
       location.href === frameURL) {
      safari.self.addEventListener("message", receiveTags, false);
      if (!addTags()) {
         document.addEventListener('DOMNodeInserted',function(e){
            var item = e.target;
            if (item.tagName === 'A' && /reblog/.test(item.href)) {
               addTags();
            }
         }, false);
      }
   }
}

