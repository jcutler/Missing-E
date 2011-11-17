/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 2 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

/*global escapeHTML,self */

function postCrushesFillSettings(message) {
   var tagarr, i;
   if (message.greeting !== "settings" ||
       message.component !== "postCrushes_fill") {
      return;
   }
   var url = localStorage.getItem("tcp_crushURL");
   if (url !== undefined && url !== null && url !== "") {
      localStorage.removeItem("tcp_crushURL");
      var notlarge = message.crushSize;
      var showPercent = message.showPercent;
      var addTags = message.addTags;
      if (addTags === 1) {
         var tags = localStorage.getItem('tcp_crushTags');
         tagarr = tags.split(',');
         var txt = "";
         document.getElementById('post_tags').value = tags;
         for (i=0; i<tagarr.length; i++) {
            if (tagarr[i] !== null && tagarr[i] !== '') {
               txt += '<div class="token"><span class="tag">' +
                      escapeHTML(tagarr[i]) +
                      '</span><a title="Remove tag" ' +
                      'onclick="tag_editor_remove_tag($(this).up()); ' +
                      'return false;" href="#">x</a></div>';
            }
         }
         if (txt !== '') {
            document.getElementById('tokens').innerHTML = txt;
            var label = document.getElementById('post_tags_label');
            label.parentNode.removeChild(label);
         }
      }
      localStorage.removeItem('tcp_crushTags');
      if (notlarge !== 1) {
         url += '&large=1';
      }
      if (showPercent === 1) {
         url += '&showPercent=1';
      }
      document.getElementById('photo_src').value = url;
      document.getElementById('photo_upload').style.display = "none";
      document.getElementById('photo_url').style.display = "block";
   }
}

function MissingE_postCrushes_fill_doStartup(message) {
   if (message.greeting !== "settings" ||
       message.component !== "postCrushes" ||
       message.subcomponent !== "fill") {
      return;
   }
   else {
      self.removeListener('message', MissingE_postCrushes_fill_doStartup);
   }
   var url = window.localStorage.getItem("tcp_crushURL");
   if (document.body.id === 'dashboard_edit_post' &&
       url !== undefined && url !== null && url !== "") {
      self.on('message', postCrushesFillSettings, false);
      self.postMessage({greeting:"settings", component: "postCrushes_fill"});
   }
}

self.on('message',MissingE_postCrushes_fill_doStartup);
self.postMessage({greeting: "settings", component: "postCrushes",
                  subcomponent: "fill"});
