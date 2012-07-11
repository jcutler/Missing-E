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

MissingE.packages.postCrushesFill = {

   run: function() {
      var settings = this.settings;
      var tagarr, i;
      var url = this._img;
      if (url !== undefined && url !== null && url !== "") {
         var lang = document.getElementsByTagName("html")[0]
                        .getAttribute("lang");
         var lcol = document.getElementById('left_column');
         if (lcol) {
            var header = lcol.getElementsByTagName('h1');
            if (header.length > 0) {
               header[0].textContent = MissingE.getLocale(lang).postCrushes;
            }
         }
         var notlarge = settings.crushSize;
         var showPercent = settings.showPercent;
         var addTags = settings.addTags;
         if (addTags === 1) {
            var tagarr = this._tags;
            var tagnodes = [];
            var txt = "";
            document.getElementById('post_tags').value = tagarr.join(",");
            for (i=0; i<tagarr.length; i++) {
               if (tagarr[i] !== null && tagarr[i] !== '') {
                  tagnodes.push(MissingE.createTag(lang, tagarr[i]));
               }
            }
            if (tagnodes.length > 0) {
               var tokenList = document.getElementById('tokens');
               for (i=0; i<tagnodes.length; i++) {
                  tokenList.appendChild(tagnodes[i]);
               }
               var label = document.getElementById('post_tags_label');
               label.parentNode.removeChild(label);
            }
         }
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
   },

   init: function() {
      if (document.body.id === 'dashboard_edit_post') {
         extension.sendRequest("settings", {component: "postCrushes"},
                               function(response) {
            if (response.component === "postCrushes") {
               var i;
               MissingE.packages.postCrushesFill.settings = {};
               for (i in response) {
                  if (response.hasOwnProperty(i) &&
                      i !== "component") {
                     MissingE.packages.postCrushesFill
                        .settings[i] = response[i];
                  }
               }
               extension.sendRequest("getCrushes", function(response) {
                  if (response.hasOwnProperty("img")) {
                     MissingE.packages.postCrushesFill._img = response.img;
                     MissingE.packages.postCrushesFill._tags = response.tags;
                     MissingE.packages.postCrushesFill.run();
                  }
               });
            }
         });
      }
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.postCrushesFill.init();
}

}());
