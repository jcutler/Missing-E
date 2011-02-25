/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Licensed under the GPL Version 2 licence.
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
 * along with 'Missing e'.  If not, see <http://www.gnu.org/licenses/>.
 */

if (document.body.id == 'dashboard_edit_post') {
   chrome.extension.sendRequest({greeting: "settings", component: "postCrushes"}, function(response) {
      var postCrushes_settings = JSON.parse(response);
      var url = window.localStorage.getItem("tcp_crushURL");
      if (url != undefined && url != null && url != "") {
         window.localStorage.removeItem("tcp_crushURL");
         var notlarge = postCrushes_settings.crushSize;
         var showPercent = postCrushes_settings.showPercent;
         var addTags = postCrushes_settings.addTags;
         if (addTags == '1') {
            var tags = window.localStorage.getItem('tcp_crushTags');
            tagarr = tags.split(',');
            var txt = "";
            document.getElementById('post_tags').value = tags;
            for (i=0; i<tagarr.length; i++) {
               if (tagarr[i] != null && tagarr[i] != '') {
                  txt += '<div class="token"><span class="tag">' + tagarr[i] + '</span>' +
                     '<a title="Remove tag" onclick="tag_editor_remove_tag($(this).up()); return false;" href="#">x</a>' +
                     '</div>';
               }
            }
            if (txt != '') {
               document.getElementById('tokens').innerHTML = txt;
               var label = document.getElementById('post_tags_label');
               label.parentNode.removeChild(label);
            }
         }
         window.localStorage.removeItem('tcp_crushTags');
         if (notlarge != '1')
            url += '&large=1';
         if (showPercent == '1')
            url += '&showPercent=1';
         document.getElementById('photo_src').value = url;
         document.getElementById('photo_upload').style.display = "none";
         document.getElementById('photo_url').style.display = "block";
      }
   });   
}
