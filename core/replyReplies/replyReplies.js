/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
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

(function($){

MissingE.packages.replyReplies = {

   reply_setValue: function(st) {
      localStorage.setItem('trr_ReplyText',st);
   },

   tags_setValue: function(ar) {
      localStorage.setItem('trr_ReplyTags',ar.join(","));
   },

   addNoteReply: function(item, overrideStyle) {
      if (item.hasClass('MissingE_reply')) {
         return true;
      }
      var klass = "";
      if (item.hasClass('like')) { klass = "like"; }
      else if (item.hasClass('reblog')) { klass = "reblog"; }
      else if (item.hasClass('answer')) { klass = "answer"; }
      else if (item.hasClass('reply')) { klass = "reply"; }
      else if (item.hasClass('photo')) { klass = "reply"; }

      item.addClass('MissingE_reply');
      if (klass === "" ||
          (klass === "reblog" && item.find('a.tumblelog').length === 0) ||
          (klass !== "reblog" && item.find('span.action a').length === 0)) {
         return true;
      }
      else {
         klass = (overrideStyle ? "MissingE_notification_type" :
                  "notification_type_icon") + " " + klass;
         item.append('<div class="' + klass + '_icon"></div>');
         item.css('background-image', 'none');
      }
   },

   doReply: function(response) {
      if (response.component !== "replyReplies") { return; }
      var arr, i, n, img;
      var redir = "";
      var settings = response;
      var size = settings.smallAvatars === 1 ? 16 : 64;
      var thecode = [];
      var tags = [];
      arr = $('.MissingE_rt');
      if ($(arr[0]).parent().hasClass('note')) {
         $(arr[0]).closest('li.post')
            .find('div.post_controls a').each(function() {
               if (/redirect_to/.test(this.href)) {
                  redir = this.href.match(/redirect_to=[^&]*$/)[0];
                  return false;
               }
            });
      }
      else {
         var post = $(arr[0]).parent().prevAll('li.post:first');
         if (post.hasClass("new_post")) {
            redir = "redirect_to=" + location.pathname.replace(/\//g,'%2F');
         }
         else {
            post.find('div.post_controls a').each(function() {
               if (/redirect_to/.test(this.href)) {
                  redir = this.href.match(/redirect_to=[^&]*$/)[0];
                  return false;
               }
            });
         }
      }
      var lang = $('html').attr('lang');
      for (i=arr.length-1; i>=0; i--) {
         var st, en, nm, add;
         $(arr[i]).toggleClass("MissingE_rt",false);
         $(arr[i]).parent().removeClass('MissingE_rt_box');
         var oldcode = $(arr[i]).parent().html();
         var link = $(arr[i]).parent().find('img.avatar');
         var newcode = "";
         img = "<a href=\"" + link.parent().attr("href") + "\">" +
                     "<img style=\"width:" + size + "px;height:" + size +
                     "px;border-width:0;margin-right:3px;\" src=\"" +
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

         if (settings.addTags === 1) {
            en = newcode.indexOf("</a>");
            nm = newcode.substr(0,en).match(/[\w\-]*$/g)[0];
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

         if (settings.showAvatars === 1) {
            newcode = img + newcode;
         }

         st = newcode.search(/<div class="[^"]*(notification_type_icon|MissingE_notification_type)/);
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
         newcode = newcode.replace(/\s*$/,'');

         if ($(arr[i]).parent().hasClass('note')) {
            var a,b,z,user,qt,reblnk,x;
            var main = $(arr[i]).closest('li.post');
            var ans = $(arr[i]).parent();
            var type, chk, anstype;
            var posttxt = "";
            var anstxt = "";
            var postlnk = main.find('a.permalink').attr('href');
            if (main.find('div.post_question').length > 0) {
               posttxt = main.find('div.post_question').text();
            }
            else if (main.find('div.post_title').length > 0) {
               posttxt = main.find('div.post_title').text();
            }
            else if (main.find('div.caption').length > 0) {
               posttxt = main.find('div.caption').text();
            }
            else {
               var copy = main.find('div.post_content').clone();
               copy.find('script').remove();
               posttxt = copy.text();
            }
            posttxt = posttxt.replace(/\s+/g,' ')
                        .replace(/^\s/,'').replace(/\s$/,'');

            if (posttxt.length > 50) {
               if (/\s/.test(posttxt.charAt(50))) {
                  posttxt = posttxt.substr(0,50);
               }
               else {
                  posttxt = posttxt.substr(0,50);
                  if (/\s/.test(posttxt)) {
                     var ls = posttxt.lastIndexOf(' ');
                     posttxt = posttxt.substr(0,ls);
                  }
               }
               posttxt += '...';
            }

            if (ans.find('span.answer_content').length > 0) {
               anstxt = ans.find('span.answer_content').text()
                           .replace(/\s+/,' ');
            }

            if (main.hasClass('regular') || main.hasClass('note')) {
               type = "text";
            }
            else if (main.hasClass('quote')) { type = "quote"; }
            else if (main.hasClass('photo')) {
               if (main.find('embed.photoset').length > 0) {
                  type = "photoset";
               }
               else {
                  type = "photo";
               }
            }
            else if (main.hasClass('link')) { type = "link"; }
            else if (main.hasClass('conversation')) { type = "conversation"; }
            else if (main.hasClass('audio')) { type = "audio"; }
            else if (main.hasClass('video')) { type = "video"; }

            if (ans.hasClass('reblog')) { anstype = "reblog"; }
            else if (ans.hasClass('reply')) { anstype = "reply"; }
            else if (ans.hasClass('answer')) {
               anstype = "answer";
               type = "question";
            }
            else if (ans.hasClass('like')) { anstype = "like"; }
            else if (ans.hasClass('photo')) { anstype = "reply"; }
            newcode = newcode.replace(/<div class="clear"><\/div>/,'');
            qt = "";
            reblnk = "";
            a = newcode.indexOf('</a>') + 4;
            if (settings.showAvatars) {
               img = newcode.substring(0,a);
            }
            b = newcode.indexOf('</a>',a) + 4;
            if (settings.showAvatars) {
               user = newcode.substring(a,b);
               user = user.replace(/^&nbsp;/,'').replace(/<span [^>]*>/,'');
            }
            else {
               user = newcode.match(/<a href[^>]*>[\w\-]*<\/a>/)[0];
            }
            z = newcode.indexOf('</span>',a) + 7;
            a = newcode.indexOf('<blockquote');
            if (a !== -1) {
               qt = newcode.substr(z);
            }
            img = img.replace(/^\s*/,'').replace(/\s*$/,'')
                  .replace(/\s+/g,' ').replace(/&nbsp;$/,'');
            user = user.replace(/^\s*/,'').replace(/\s*$/,'')
                  .replace(/\s+/g,' ').replace(/\stitle="[^"]*"/,'');
            qt = qt.replace(/^\s*/,'').replace(/\s*$/,'')
                  .replace(/\s+/g,' ');
            chk = qt.match(/<a href="([^"]*)/);
            if (chk && chk.length > 1) {
               reblnk = chk[1];
               qt = qt.replace(/<a href=[^>]*>/,'').replace(/<\/a>/,'');
            }

            if (settings.showAvatars) {
               newcode = img;
            }
            else {
               newcode = '';
            }
            for (x=0; x<MissingE.getLocale(lang)
                           .notifications[anstype].length; x++) {
               if (anstype === 'reblog' &&
                   x === MissingE.getLocale(lang).notifications.reblogIndex &&
                   reblnk !== "") {
                  var rebtxt = MissingE.getLocale(lang)
                                 .notifications[anstype][x];
                  if (MissingE.getLocale(lang).notificationChanges &&
                      MissingE.getLocale(lang).notificationChanges[anstype] &&
                      MissingE.getLocale(lang).notificationChanges[anstype]
                        .hasOwnProperty(rebtxt)) {
                     rebtxt = MissingE.getLocale(lang)
                                 .notificationChanges[anstype][rebtxt];
                  }
                  newcode += ' <strong><a href="' + reblnk + '">' +
                     rebtxt + '</a></strong>';
               }
               else if (MissingE.getLocale(lang)
                           .notifications[anstype][x] === "U") {
                  if (newcode !== '' && newcode !== img) {
                     newcode += ' ';
                  }
                  newcode += '<strong>' + user + '</strong>';
               }
               else if (MissingE.getLocale(lang)
                           .notifications[anstype][x] === "U,") {
                  if (newcode !== '' && newcode !== img) {
                     newcode += ' ';
                  }
                  newcode += '<strong>' + user + '</strong>,';
               }
               else if (MissingE.getLocale(lang)
                           .notifications[anstype][x] === "P") {
                  var y;
                  var postType = MissingE.getLocale(lang).posts[type];
                  for (y=0; y<postType.length; y++) {
                     var posttypetxt = postType[y];
                     newcode += ' ';
                     if (MissingE.getLocale(lang).notificationChanges &&
                         MissingE.getLocale(lang)
                           .notificationChanges[anstype] &&
                         MissingE.getLocale(lang).notificationChanges[anstype]
                           .hasOwnProperty(posttypetxt)) {
                        posttypetxt = MissingE.getLocale(lang)
                                    .notificationChanges[anstype][posttypetxt];
                     }
                     if (y === postType.length - 1) {
                        newcode += '<strong><a href="' + postlnk + '">' +
                           posttypetxt + '</a></strong>';
                     }
                     else {
                        newcode += posttypetxt;
                     }
                  }
               }
               else {
                  var othertxt = MissingE.getLocale(lang)
                                    .notifications[anstype][x];
                  if (MissingE.getLocale(lang).notificationChanges &&
                      MissingE.getLocale(lang).notificationChanges[anstype] &&
                      MissingE.getLocale(lang).notificationChanges[anstype]
                        .hasOwnProperty(othertxt)) {
                     othertxt = MissingE.getLocale(lang)
                                 .notificationChanges[anstype][othertxt];
                  }
                  newcode += ' ' + othertxt;
               }
            }
            if (MissingE.getLocale(lang).postNotificationChanges &&
                MissingE.getLocale(lang).postNotificationChanges[anstype]) {
               var findtxt;
               for (findtxt in MissingE.getLocale(lang)
                                 .postNotificationChanges[anstype]) {
                  if (MissingE.getLocale(lang).postNotificationChanges[anstype]
                        .hasOwnProperty(findtxt)) {
                     newcode = newcode.replace(findtxt,
                        MissingE.getLocale(lang)
                           .postNotificationChanges[anstype][findtxt]);
                  }
               }
            }
            if (posttxt !== '' && anstype === "reblog"  && reblnk !== '') {
               newcode += ': <em><strong><a href="' + reblnk + '">' + posttxt +
                           '</a></strong></em> ';
            }
            else if (posttxt !== '') {
               newcode += ': <em><strong><a href="' + postlnk + '">' +
                           posttxt + '</a></strong></em> ';
            }
            if (qt !== '') { newcode += qt; }
            else if (anstxt !== '') {
               newcode += '<blockquote>' + anstxt + '</blockquote>';
            }
            newcode = newcode.replace(/<span[^>]*>/g,'')
               .replace(/<\/span>/g,'');
         }
         else {
            newcode = newcode.replace(/src="http:\/\/media\.tumblr\.com\/avatar_([a-zA-Z0-9]+)_40\.([a-z]+)"/g, "src=\"http://media.tumblr.com/avatar_$1_" + size + ".$2\"");
            newcode = newcode.replace(/<div class="nipple[^>]*>/g,'')
                             .replace(/<\/div[^>]*>/g,'')
                             .replace(/<div class="hide_overflow">\s*/g,'')
                             .replace(/<a /g,'<strong><a ')
                             .replace(/<\/a>/g,'</a></strong>')
                             .replace(/ id="xpreview[0-9]+"/,'');
         }
         newcode = newcode.replace(/style="\s*height:[^;]*;\s*/g,'style="')
                          .replace(/style="\s*width:[^;]*;\s*/g,'style="')
                          .replace(/style="\s*height:[^;]*;\s*/g,'style="')
                          .replace(/style="\s*cursor:[^;]*;\s*/g,'style="')
                          .replace(/onclick="[^"]*"/g,'')
                          .replace(/white-space:nowrap;/g,'')
                          .replace(/margin-right:5px;/g,'')
                          .replace(/style="\s*"\s*/g,'')
                          .replace(/^\s*/,'').replace(/\s*$/,'');
         thecode.push('<p>' + newcode + '</p>');
      }

      var code = thecode.join("\n") + "\n\n<p><br /></p>";
      if (/nsfwdone/.test(code) || /nsfwed/.test(code)) {
         code = code.replace(/opacity:\s*[01]\s*;/g,'')
                     .replace(/class="nsfwdone"/g,'')
                     .replace(/class="nsfwed"/g,'')
                     .replace(/class="nsfwed nsfwdone"/g,'')
                     .replace(/class="nsfwdone nsfwed"/g,'')
                     .replace(/style="\s*"\s*/g,'')
                     .replace(/<\/?div[^>]*>/g,'');
      }

      code = code.replace(/ {2,}/g,' ');
      MissingE.packages.replyReplies.reply_setValue(code);
      if (settings.defaultTags !== '') {
         tags = settings.defaultTags.concat(tags);
      }
      MissingE.packages.replyReplies.tags_setValue(tags);

      var urlPref = location.href
         .match(/http:\/\/www\.tumblr\.com\/blog\/([^\/]*)/);
      if (urlPref && urlPref.length >= 2) {
         urlPref = '/blog/' + urlPref[1];
      }
      else {
         urlPref = '';
      }
      if (settings.newTab === 1) {
         var urlDest = "http://www.tumblr.com" + urlPref + "/new/text";
         if (extension.isSafari || extension.isFirefox) {
            extension.sendRequest("open", {url: urlDest});
         }
         else {
            window.open(urlDest);
         }
      }
      else {
         var url = "http://www.tumblr.com" + urlPref + "/new/text";
         if (redir !== '') {
            url += "?" + redir;
         }
         location.href = url;
      }
   },

   run: function() {
      var settings = this.settings;

      if (extension.isSafari) {
         $('head').append('<style type="text/css">' +
                 '#posts .notification .notification_type_icon {' +
                 'background-image:url("' +
                 extension.getURL("core/replyReplies/notification_icons.png") +
                 '") !important; } #posts ol.notes .notification_type_icon { ' +
                 'background-image:url("' +
                 extension.getURL("core/replyReplies/notes_icons.png") + '") ' +
                 '!important; }</style>');
         $('head').append('<link rel="stylesheet" type="text/css" href="' +
                 extension.getURL("core/replyReplies/replyReplies.css") +
                 '" />');
      }

      var overrideStyle = false;
      if (extension.isFirefox) {
         if ($('#posts').length > 0) {
            var tester = $('<li class="notification">' +
                           '<div class="notification_type_icon"></div></li>')
                              .appendTo('#posts');
            var testerIcon = tester.find('.notification_type_icon');
            if (testerIcon.css('display') === "none" ||
                testerIcon.css('visibility') === "hidden" ||
                testerIcon.css('opacity') === "0") {
               overrideStyle = true;
            }
            tester.remove();
         }
      }

      extension.addAjaxListener(function(type,thelist) {
         if (type !== 'notes') { return; }
         var node = $('#' + thelist[0]);
         if (!node.hasClass('is_mine')) {
            return false;
         }
         var list = node.find('ol.notes li');
         list.each(function() {
            MissingE.packages.replyReplies.addNoteReply($(this),
                                                        overrideStyle);
         });
         if (overrideStyle) {
            $('#posts div.notification_type_icon').each(function() {
               $(this).removeClass('notification_type_icon')
                      .addClass('MissingE_notification_type');
            });
         }
      });

      $('#posts li.is_mine ol.notes').live('mouseover', function() {
         $(this).find('li:not(.MissingE_reply)').each(function() {
            MissingE.packages.replyReplies.addNoteReply($(this), overrideStyle);
         });
      });

      $('div.notification_type_icon, div.MissingE_notification_type')
            .live('mousedown', function(e) {
         if (e.shiftKey) { e.preventDefault(); }
      }).live('click', function(e) {
         if (e.which !== 1) { return; }
         if (e.shiftKey) {
            $(this).toggleClass("MissingE_rt");
            if ($(this).hasClass("MissingE_rt")) {
               $(this).parent().addClass('MissingE_rt_box');
            }
            else {
               $(this).parent().removeClass('MissingE_rt_box');
            }
            return;
         }
         $(this).toggleClass("MissingE_rt",true);
         extension.sendRequest("settings", {component: "replyReplies"},
                                MissingE.packages.replyReplies.doReply);
      });

      if (overrideStyle) {
         $('#posts div.notification_type_icon').each(function() {
            $(this).removeClass('notification_type_icon')
                   .addClass('MissingE_notification_type');
         });
      }
   },

   init: function() {
      MissingE.packages.replyReplies.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.replyReplies.init();
}

}(jQuery));
