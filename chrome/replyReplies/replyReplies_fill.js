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

function reply_getValue() {
   var retval = window.localStorage.getItem("trr_ReplyText");
   if (retval == undefined || retval == null || retval == "")
      return "";
   else
      return retval;
}

function reply_clearValue() {
   window.localStorage.removeItem('trr_ReplyText','');
}

function tags_getValue() {
   var retval = window.localStorage.getItem("trr_ReplyTags");
   if (retval == undefined || retval == null || retval == "")
      return new Array();
   else
      return retval.split(",");
}

function tags_clearValue() {
   window.localStorage.removeItem('trr_ReplyTags');
}

function fillPost(e,done) {
   done = (done==undefined || done==null ? false : done);

   if (e.relatedNode.tagName == 'TD') {
      var doc;
      if (doc = e.relatedNode.childNodes[0].contentWindow)
         doc = doc.document;
      else doc = e.relatedNode.childNodes[0].contentDocument;
      if (!done && doc.readyState != 'complete') {
         window.setTimeout(function(){fillPost(e,false);},100);
         document.removeEventListener('DOMNodeInserted',fillPost,false);
         return;
      }
      else if (!done) {
         window.setTimeout(function(){fillPost(e,true);},100);
         document.removeEventListener('DOMNodeInserted',fillPost,false);
         return;
      }
      else {
         var newpost = reply_getValue();
         reply_clearValue();
         doc.body.innerHTML = newpost;
         document.removeEventListener('DOMNodeInserted',fillPost,false);
      }
   }
}

if (location == 'http://www.tumblr.com/new/text' &&
    document.body.id == 'dashboard_edit_post' &&
    reply_getValue().length > 0) {
   if (document.getElementById('post_two_ifr')) {
      document.addEventListener('DOMNodeInserted',fillPost, false);
   }
   else {
      var newpost = reply_getValue();
      reply_clearValue();
      var ta = document.getElementById('post_two');
      if (ta) {
         ta.innerHTML = newpost;
      }
   }
   var tags = tags_getValue();
   if (tags.length > 0) {
      var txt = "";
      document.getElementById('post_tags').value = tags.join(",");
      for (i=0; i<tags.length; i++) {
         if (tags[i] != null && tags[i] != '') {
            txt += '<div class="token"><span class="tag">' + tags[i] + '</span>' +
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
   tags_clearValue();
}
