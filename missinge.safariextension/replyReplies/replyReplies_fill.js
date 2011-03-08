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

function MissingE_replyReplies_fill_doStartup() {
   if (location == 'http://www.tumblr.com/new/text' &&
       document.body.id == 'dashboard_edit_post' &&
       reply_getValue().length > 0) {

      $(document).ready(function() {
            $('head').append('<script type="text/javascript">\n' +
                             'if (tinyMCE && (ed = tinyMCE.get("post_two"))) {\n' +
                             '   ed.execCommand("mceInsertContent", false, localStorage.getItem("trr_ReplyText"));\n' +
                             '}\n' +
                             'else {\n' +
                             '   insertTag("post_two", localStorage.getItem("trr_ReplyText"));\n' +
                             '}\n' +
                             'localStorage.removeItem("trr_ReplyText");\n' +
                             '</script>');
      });
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
}
