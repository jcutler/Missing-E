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
 * along with 'Missing e'.  If not, see <http://www.gnu.org/licenses/>.
 */

function reply_getValue() {
   var retval = window.localStorage.getItem("trr_ReplyText");
   if (retval == undefined || retval == null || retval == "")
      return "";
   else
      return retval;
}

function reply_setValue(st) {
   window.localStorage.setItem('trr_ReplyText',st);
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

function tags_setValue(ar) {
   window.localStorage.setItem('trr_ReplyTags',ar.join(","));
}

function tags_clearValue() {
   window.localStorage.removeItem('trr_ReplyTags');
}

$('div.notification_type_icon').live('click', function(e) {
   var arr;
   if (e.which != 1) return;
   if (e.shiftKey) {
      $(this).toggleClass("s113977_rt");
      if ($(this).hasClass("s113977_rt")) {
         $(this).parent().css("border","1px solid white");
      }
      else {
         $(this).parent().css("border","");
      }
      return;
   }
   $(this).toggleClass("s113977_rt",true);
   $(this).parent().css("border","1px solid white");
   chrome.extension.sendRequest({greeting: "settings", component: "replyReplies"}, function(response) {
      var replyReplies_settings = JSON.parse(response);
      var thecode = new Array();
      var tags = new Array();
      arr = $('.s113977_rt');
      var showAvatars = replyReplies_settings.showAvatars;
      var addTags = replyReplies_settings.addTags;
      for (i=arr.length-1; i>=0; i--) {
         var st, en, nm, add;
         $(arr.get(i)).toggleClass("s113977_rt",false);
         $(arr.get(i)).parent().css("border","");
         var oldcode = $(arr[i]).parent().html();
         var link = $(arr[i]).parent().find('img.avatar');
         var newcode = "";
         var img = "<a href=\"" + link.parent().attr("href") + "\">" +
                     "<img style=\"width:16px;height:16px;border-width:0\" src=\"" +
                     link.attr("src")
                     .replace(/\/\/[^\.]*\.media\.tumblr\.com/,"//media.tumblr.com") +
                     "\" /></a>";

         newcode = oldcode.substr(oldcode.indexOf("</a>")+4);
         newcode = newcode.substr(newcode.indexOf("</script>")+9)
                  .replace(/^\s*/,"")
                  .replace(/\s*$/,"")
                  .replace(/\n/g, " ");
         
         if (addTags == 1) {
            en = newcode.indexOf("</a>");
            nm = newcode.substr(0,en).match(/[a-zA-Z0-9\-\_]*$/g)[0];
            add = true;
            for (n = 0; n < tags.length; n++) {
               if (tags[n] == nm) {
                  add = false;
                  break;
               }
            }
            if (add)
               tags.push(nm);
         }

         if (showAvatars == 1) {
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
         code = code.replace(/opacity:\s*[01]\s*;/,'').replace(/class="nsfwdone"/,'').replace(/class="nsfwed"/,'');
      }

      reply_setValue(code);
      tags_setValue(tags);
   
      window.open("http://www.tumblr.com/new/text");
   });
});
