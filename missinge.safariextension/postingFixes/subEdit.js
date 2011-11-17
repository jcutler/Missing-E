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

/*global getLocale,safari */

var like, suffix='', lang='en';

function MissingE_postingFixes_subEdit_doStartup() {
   var i;
   var div = document.getElementsByTagName("div")[0];
   var controls;
   if (div) { controls = div.getElementsByTagName("a"); }
   var noEdit = true;
   
   if (!(/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href))) {
      noEdit = false;
   }
   else {
      for (i=0; i<controls.length; i++) {
         if (/\/edit\//.test(controls[i].href)) {
            noEdit = false;
            break;
         }
      }
   }
   if (noEdit) {
      var follow;
      var acct;
      var dashimg = null;
      for (i=controls.length-1; i>=0; i--) {
         if (controls[i].href === 'http://www.tumblr.com/dashboard') {
            dashimg = controls[i].getElementsByTagName('img')[0];
            break;
         }
      }
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
         if (/\/(un)?like\//.test(document.forms[i].getAttribute('action'))) {
            like = document.forms[i];
         }
         else if (/\/(un)?follow/.test(document.forms[i]
                                       .getAttribute('action'))) {
            follow = document.forms[i];
         }
      }
      if (like && like.id && follow && follow.id && (acct = follow.id.value)) {
         safari.self.tab.dispatchMessage("tumblrPermission", {user: acct});
      }
   }
}

function receivePermission(response) {
   if (response.name !== "tumblrPermission") { return; }
   if (response.message.allow) {
      var url = location.search.match(/[\?&]src=([^&]*)/);
      if (url && url.length > 1) { url = url[1]; }
      else { url = ''; }
      var edit = document.createElement('a');
      var href = "/edit/" + like.id.value;
      if (url !== '') { href += "?redirect_to=" + url; }
      edit.href = href;
      edit.setAttribute('target','_top');
      edit.innerHTML = '<img src="http://assets.tumblr.com/images/' +
         'iframe_edit_alpha' + suffix + '" alt="' +
         getLocale(lang).dashFixesText.edit +
         '" style="display:block;float:left;" />';
      like.parentNode.insertBefore(edit, like.nextSibling);
   }
}

safari.self.addEventListener("message", receivePermission, false);
