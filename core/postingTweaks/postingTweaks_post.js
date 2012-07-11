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

MissingE.packages.postingTweaksPost = {

   run: function() {
      var div = document.getElementsByTagName("div")[0];
      var controls;
      if (div) { controls = div.getElementsByTagName("a"); }
      var noEdit = true;

      var i;
      for (i=0; i<controls.length; i++) {
         if (/\/edit\//.test(controls[i].href)) {
            noEdit = false;
            break;
         }
      }

      if (noEdit) {
         var follow, like;
         var acct;
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
            suffix = dashimg.src.match(/alpha([^\.]*)([^\?]*)/);
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
         for (i=0; i<document.forms.length; i++) {
            if (/\/(un)?like\//
                  .test(document.forms[i].getAttribute('action'))) {
               like = document.forms[i];
            }
            else if (/\/(un)?follow/
                        .test(document.forms[i].getAttribute('action'))) {
               follow = document.forms[i];
            }
         }
         if (like && like.id && follow && follow.id &&
             (acct = follow.id.value)) {
            extension.sendRequest("tumblrPermission", {user: acct},
                                  function(response) {
               if (response.allow &&
                   !document.getElementById('MissingE_addedEdit')) {
                  var url = location.search.match(/[\?&]src=([^&]*)/);
                  if (url && url.length > 1) { url = url[1]; }
                  else { url = ''; }
                  var edit = document.createElement('a');
                  var href = "/edit/" + like.id.value;
                  if (url !== '') { href += "?redirect_to=" + url; }
                  edit.href = href;
                  edit.id = "MissingE_addedEdit";
                  edit.setAttribute('target','_top');
                  var editImg = document.createElement('img');
                  editImg.src = "http://assets.tumblr.com/images/" +
                                 "iframe_edit_alpha" + suffix;
                  editImg.setAttribute("alt", MissingE.getLocale(lang)
                                                .dashTweaksText.edit);
                  editImg.style.display = "block";
                  editImg.style.cssFloat = "left";
                  edit.appendChild(editImg);
                  like.parentNode.insertBefore(edit, like.nextSibling);
                  var formKey = document.getElementById('form_key');
                  if (formKey) {
                     var del = document.createElement('form');
                     del.id = "MissingE_addedDelete";
                     del.setAttribute('method','post');
                     del.setAttribute('action','/delete');
                     del.setAttribute('target','_top');
                     del.style.cssFloat = 'left';
                     del.style.paddingLeft = '3px';
                     del.onsubmit = function() {
                        return confirm(MissingE.getLocale(lang).deleteConfirm);
                     };
                     var idInput = document.createElement('input');
                     var redirectInput = document.createElement('input');
                     var keyInput = document.createElement('input');
                     var imgInput = document.createElement('input');
                     idInput.type = "hidden";
                     idInput.name = "id";
                     idInput.value = like.id.value;
                     redirectInput.type = "hidden";
                     redirectInput.name = "redirect_to";
                     redirectInput.value = decodeURIComponent(url.match(/http%3A%2F%2F[^%]*/i)[0]);
                     keyInput.type = "hidden";
                     keyInput.name = "form_key";
                     keyInput.value = formKey.value;
                     imgInput.type = "image";
                     imgInput.src = "http://assets.tumblr.com/images/" +
                                    "iframe_delete_alpha" + suffix;
                     imgInput.setAttribute('alt', MissingE.getLocale(lang)
                                                      .dashTweaksText.delete);
                     imgInput.style.height = "20px";
                     imgInput.style.borderWidth = "0";
                     imgInput.style.cursor = "pointer";
                     del.appendChild(idInput);
                     del.appendChild(redirectInput);
                     del.appendChild(keyInput);
                     del.appendChild(imgInput);
                     like.parentNode.insertBefore(del, edit.nextSibling);
                  }
               }
            });
         }
      }
   },

   init: function() {
      if (MissingE.isTumblrURL(location.href, ["iframe"])) {
         if (extension.isFirefox) {
            extension.sendRequest("settings",
                                  {component: "postingTweaks",
                                   subcomponent: "post"},
                                  function(response) {
               if (response.component !== "postingTweaks") {
                  return;
               }
               MissingE.packages.postingTweaksPost.run(location.href);
            });
         }
         else {
            MissingE.packages.postingTweaksPost.run(location.href);
         }
      }
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.postingTweaksPost.init();
}

}());
