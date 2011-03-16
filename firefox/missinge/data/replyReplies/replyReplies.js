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

/*global safari, $, localStorage, window */

function reply_getValue() {
   var retval = localStorage.getItem("trr_ReplyText");
   if (retval === undefined || retval === null || retval === "") {
      return "";
   }
   else {
      return retval;
   }
}

function reply_setValue(st) {
   localStorage.setItem('trr_ReplyText',st);
}

function reply_clearValue() {
   localStorage.removeItem('trr_ReplyText','');
}

function tags_getValue() {
   var retval = localStorage.getItem("trr_ReplyTags");
   if (retval === undefined || retval === null || retval === "") {
      return [];
   }
   else {
      return retval.split(",");
   }
}

function tags_setValue(ar) {
   localStorage.setItem('trr_ReplyTags',ar.join(","));
}

function tags_clearValue() {
   localStorage.removeItem('trr_ReplyTags');
}

function replyRepliesSettings(message) {
   var arr;
   if (message.greeting !== "settings" ||
       message.component !== "replyReplies") {
      return;
   }
   var i, n;
   var showAvatars = message.showAvatars;
   var addTags = message.addTags;
   var size = message.smallAvatars === 1 ? 16 : 64;
   var thecode = [];
   var tags = [];
   arr = jQuery('.s113977_rt');
   for (i=arr.length-1; i>=0; i--) {
      var st, en, nm, add;
      jQuery(arr.get(i)).toggleClass("s113977_rt",false);
      jQuery(arr.get(i)).parent().css("border","");
      var oldcode = jQuery(arr[i]).parent().html();
      var link = jQuery(arr[i]).parent().find('img.avatar');
      var newcode = "";
      var img = "<a href=\"" + link.parent().attr("href") + "\">" +
                  "<img style=\"width:" + size + "px;height:" + size +
                  "px;border-width:0\" src=\"" +
                  link.attr("src")
                     .replace(/\/\/[^\.]*\.media\.tumblr\.com/,
                              "//media.tumblr.com")
                     .replace(/16(\.[a-zA-Z]*)$/,
                              size + "$1") +
                  "\" /></a>";

      newcode = oldcode.substr(oldcode.indexOf("</a>")+4);
      newcode = newcode.substr(newcode.indexOf("</script>")+9)
               .replace(/^\s*/,"")
               .replace(/\s*$/,"")
               .replace(/\n/g, " ");

      if (addTags === 1) {
         en = newcode.indexOf("</a>");
         nm = newcode.substr(0,en).match(/[a-zA-Z0-9\-\_]*$/g)[0];
         add = true;
         for (n = 0; n < tags.length; n++) {
            if (tags[n] === nm) {
               add = false;
               break;
            }
         }
         if (add) {
            tags.push(nm);
         }
      }

      if (showAvatars === 1) {
         newcode = img + "&nbsp;" + newcode;
      }

      st = newcode.indexOf("<div class=\"notification_type_icon");
      if (st >= 0) {
         en = newcode.indexOf("</div>",st)+6;
         newcode = newcode.substring(0,st) + newcode.substr(en);
      }
      st = newcode.indexOf("<a class=\"block\"");
      if (st >= 0) {
         en = newcode.indexOf("</a>",st)+4;
         newcode = newcode.substring(0,st) + newcode.substr(en);
      }
      st = newcode.indexOf("<a href=\"#\" onclick=\"block");
      if (st >= 0) {
         en = newcode.indexOf("</a>",st)+4;
         newcode = newcode.substring(0,st) + newcode.substr(en);
      }
      thecode.push("<p>" + newcode.replace(/\s*$/,"") + "</p>");
   }

   var code = thecode.join("") + "\n<p><br /></p>";
   if (/nsfwdone/.test(code) || /nsfwed/.test(code)) {
      code = code.replace(/opacity:\s*[01]\s*;/,'')
                  .replace(/class="nsfwdone"/,'').replace(/class="nsfwed"/,'');
   }
   reply_setValue(code);
   tags_setValue(tags);
   postMessage({greeting: "open", url: "http://www.tumblr.com/new/text"});
}

function MissingE_replyReplies_doStartup(extensionURL) {
   on("message", replyRepliesSettings);
   jQuery('head').append('<style type="text/css">' +
                    '#posts .notification .notification_type_icon {' +
                    'background-image:url("' + extensionURL +
                    'replyReplies/notification_icons.png' + '") !important; ' +
                    '}</style>');
   jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
                    extensionURL + 'replyReplies/replyReplies.css' +
                    '" />');
   jQuery('div.notification_type_icon').live('mousedown', function(e) {
      if (e.shiftKey) { e.preventDefault(); }
   }).live('click', function(e) {
      if (e.which !== 1) { return; }
      if (e.shiftKey) {
         jQuery(this).toggleClass("s113977_rt");
         if (jQuery(this).hasClass("s113977_rt")) {
            jQuery(this).parent().css("border","1px solid white");
         }
         else {
            jQuery(this).parent().css("border","");
         }
         return;
      }
      jQuery(this).toggleClass("s113977_rt",true);
      jQuery(this).parent().css("border","1px solid white");
      postMessage({greeting: "settings", component: "replyReplies"});
   });
}

