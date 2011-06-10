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
function reply_setValue(st) {
   localStorage.setItem('trr_ReplyText',st);
}

function tags_setValue(ar) {
   localStorage.setItem('trr_ReplyTags',ar.join(","));
}

function replyRepliesSettings(response) {
   var arr;
   if (response.name !== "settings" ||
       response.message.component !== "replyReplies") {
      return;
   }
   var i, n;
   var redir = "";
   var newTab = response.message.newTab;
   var showAvatars = response.message.showAvatars;
   var addTags = response.message.addTags;
   var size = response.message.smallAvatars === 1 ? 16 : 64;
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
   for (i=arr.length-1; i>=0; i--) {
      var st, en, nm, add;
      $(arr[i]).toggleClass("MissingE_rt",false);
      $(arr[i]).parent().removeClass('MissingE_rt_box');
      var oldcode = $(arr[i]).parent().html();
      var link = $(arr[i]).parent().find('img.avatar');
      var newcode = "";
      var img = "<a href=\"" + link.parent().attr("href") + "\">" +
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
         newcode = img + newcode;
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
      newcode = newcode.replace(/\s*$/,"");

      if ($(arr[i]).parent().hasClass('note')) {
         var lang = $('html').attr('lang');
         var a,b,z,img,user,qt,reblnk,x;
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
         if (showAvatars) {
            img = newcode.substring(0,a);
         }
         b = newcode.indexOf('</a>',a) + 4;
         if (showAvatars) {
            user = newcode.substring(a,b);
            user = user.replace(/^&nbsp;/,'').replace(/<span [^>]*>/,'');
         }
         else {
            user = newcode.match(/<a href[^>]*>[a-zA-Z0-9\-_]*<\/a>/)[0];
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

         if (showAvatars) {
            newcode = img;
         }
         else {
            newcode = '';
         }
         for (x=0; x<locale[lang]["notifications"][anstype].length; x++) {
            if (anstype === 'reblog' &&
                x === locale[lang]["notifications"].reblogIndex &&
                reblnk !== "") {
               newcode += ' <a href="' + reblnk + '">' +
                  locale[lang]["notifications"][anstype][x] + '</a>';
            }
            else if (locale[lang]["notifications"][anstype][x] === "U") {
               if (newcode !== '' && newcode !== img) {
                  newcode += ' ';
               }
               newcode += '<strong>' + user;
            }
            else if (locale[lang]["notifications"][anstype][x] === "U,") {
               if (newcode !== '' && newcode !== img) {
                  newcode += ' ';
               }
               newcode += '<strong>' + user + ',';
            }
            else if (locale[lang]["notifications"][anstype][x] === "P") {
               var y;
               var postType = locale[lang]["posts"][type];
               if (!(postType instanceof Array)) {
                  if (anstype === "reply") {
                     postType = postType["reply"];
                  }
                  else {
                     postType = postType["normal"];
                  }
               }
               for (y=0; y<postType.length; y++) {
                  newcode += ' ';
                  if (y === 0 && lang === 'it' &&
                      (anstype === "answer" || anstype === "reply")) {
                     if (locale[lang]["posts"][type][0] === 'il') {
                        newcode += 'al';
                     }
                     else {
                        newcode += 'alla';
                     }
                  }
                  else if (y === postType.length - 1) {
                     newcode += '<a href="' + postlnk + '">' +
                        postType[y] + '</a>';
                  }
                  else {
                     newcode += postType[y];
                  }
               }
            }
            else {
               newcode += ' ' + locale[lang]["notifications"][anstype][x];
            }
         }
         if (posttxt === '') {
            newcode += '</strong> ';
         }
         else if (anstype === "reblog"  && reblnk !== '') {
            newcode += ':</strong> <em><a href="' + reblnk + '">' + posttxt +
                        '</a></em> ';
         }
         else {
            newcode += ':</strong> <em><a href="' + postlnk + '">' +
                        posttxt + '</a></em> ';
         }
         if (qt !== '') { newcode += qt; }
         else if (anstxt !== '') {
            newcode += '<blockquote>' + anstxt + '</blockquote>';
         }
         newcode = newcode.replace(/<span[^>]*>/g,'').replace(/<\/span>/g,'');
      }
      else {
         newcode = newcode.replace(/src="http:\/\/media\.tumblr\.com\/avatar_([a-zA-Z0-9]+)_40\.([a-z]+)"/g, "src=\"http://media.tumblr.com/avatar_$1_" + size + ".$2\"");
         newcode = newcode.replace(/<div class="nipple[^>]*>/g,'')
                          .replace(/<\/div[^>]*>/g,'')
                          .replace(/<div class="hide_overflow">\s*/g,
                                   '<strong>')
                          .replace(/<em/g,'</strong><em');
      }
      newcode = newcode.replace(/style="\s*height:[^;]*;\s*/g,'style="')
                       .replace(/style="\s*width:[^;]*;\s*/g,'style="')
                       .replace(/style="\s*height:[^;]*;\s*/g,'style="')
                       .replace(/style="\s*cursor:[^;]*;\s*/g,'style="')
                       .replace(/onclick="[^"]*"/g,'')
                       .replace(/white-space:nowrap;/g,'')
                       .replace(/margin-right:5px;/g,'')
                       .replace(/style="\s*"\s*/g,'');
      thecode.push('<p>' + newcode + '</p>');
   }

   var code = thecode.join("") + "\n<p><br /></p>";
   if (/nsfwdone/.test(code) || /nsfwed/.test(code)) {
      code = code.replace(/opacity:\s*[01]\s*;/g,'')
                  .replace(/class="nsfwdone"/g,'')
                  .replace(/class="nsfwed"/g,'')
                  .replace(/class="nsfwed nsfwdone"/g,'')
                  .replace(/class="nsfwdone nsfwed"/g,'')
                  .replace(/style="\s*"\s*/g,'')
                  .replace(/<\/?div[^>]*>/g,'');
   }

   reply_setValue(code);
   tags_setValue(tags);

   if (newTab === 1) {
      safari.self.tab.dispatchMessage("open","http://www.tumblr.com/new/text");
   }
   else {
      var url = "http://www.tumblr.com/new/text";
      if (redir !== '') {
         url += "?" + redir;
      }
      location.href = url;
   }
}

function MissingE_replyReplies_doStartup() {
   safari.self.addEventListener("message", replyRepliesSettings, false);

   $('head').append('<style type="text/css">' +
                    '#posts .notification .notification_type_icon {' +
                    'background-image:url("' + safari.extension.baseURI +
                    'replyReplies/notification_icons.png' + '") !important; ' +
                    '} #posts ol.notes .notification_type_icon { ' +
                    ' background-image:url("' + safari.extension.baseURI +
                    'replyReplies/notes_icons.png") !important; }</style>');
   $('head').append('<link rel="stylesheet" type="text/css" href="' +
                    safari.extension.baseURI + 'replyReplies/replyReplies.css' +
                    '" />');

   document.addEventListener("DOMNodeInserted", function(e) {
      var node = $(e.target);
      var list;
      if (e.target.tagName === "OL" && node.hasClass("notes")) {
         list = node.find('li');
      }
      else if (e.target.tagName === "LI" && node.parent().hasClass("notes")) {
         list = node;
      }
      else {
         return false;
      }
      if (!node.closest('li.post').hasClass('is_mine')) {
         return false;
      }
      list.each(function() {
         var item = $(this);
         var klass = "";
         if (item.hasClass('like')) { klass = "like"; }
         else if (item.hasClass('reblog')) { klass = "reblog"; }
         else if (item.hasClass('answer')) { klass = "answer"; }
         else if (item.hasClass('reply')) { klass = "reply"; }
         else if (item.hasClass('photo')) { klass = "reply"; }

         if (klass === "" ||
             (klass === "reblog" && item.find('a.tumblelog').length === 0) ||
             (klass !== "reblog" && item.find('span.action a').length === 0)) {
            return true;
         }
         else {
            item.append('<div class="notification_type_icon ' +
                        klass + '_icon"></div>');
            item.css('background-image', 'none');
         }
      });
   }, false);

   $('div.notification_type_icon').live('mousedown', function(e) {
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
      safari.self.tab.dispatchMessage("settings", {component: "replyReplies"});
   });
}

