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
var langPosts = {
                  en: {
                       text:  ["your", "post"],
                       photo: ["your", "photo"],
                       quote: ["your", "quote"],
                       link:  ["your", "link"],
                       conversation:  ["your", "chat"],
                       audio: ["your", "audio post"],
                       video: ["your", "video"],
                       question: ["your", "question"]
                      },
                  de: {
                       text:  ["deinen", "Eintrag"],
                       photo: ["dein", "Foto"],
                       quote: ["dein", "Zitat"],
                       link:  ["dein", "Link"],
                       conversation:  ["dein", "Chat"],
                       audio: ["dein", "audio post"],
                       video: ["dein", "Video"],
                       question: ["deine", "Frage"],
                      },
                  fr: {
                       text:  ["votre", "billet"],
                       photo: ["votre", "photo"],
                       quote: ["votre", "citation"],
                       link:  ["votre", "lien"],
                       conversation:  ["votre", "discussion"],
                       audio: ["votre", "billet audio"],
                       video: ["votre", "vidéo"],
                       question: ["votre", "question"]
                      },
                  it: {
                       text:  ["il", "tuo", "post"],
                       photo: ["la", "tua", "photo"],
                       quote: ["il", "tuo", "quote"],
                       link:  ["il", "tuo", "link"],
                       conversation:  ["la", "tua", "chat"],
                       audio: ["il", "tuo", "audio post"],
                       video: ["il", "tuo", "video"],
                       question: ["la", "tua", "domanda"]
                      }
};

var langNotification = {
                  en: {
                       like:   ["U", "liked", "P"],
                       reblog: ["U", "reblogged", "P"],
                       reblogIndex: 1,
                       answer: ["U", "answered", "P"],
                       reply:  ["U", "replied to", "P"]
                      },
                  de: {
                       like:   ["U", "hat", "P", "als Favorit markiert"],
                       reblog: ["U", "hat", "P", "gerebloggt"],
                       reblogIndex: 3,
                       answer: ["U", "hat", "P", "beantwortet"],
                       reply:  ["U", "hat auf", "P", "geantwortet"]
                      },
                  fr: {
                       like:   ["U", "a ajouté", "P", "à ses coups de cur"],
                       reblog: ["U", "a", "reblogué", "P"],
                       reblogIndex: 2,
                       answer: ["U", "a répondu à", "P"],
                       reply:  ["U", "a réagi à", "P"]
                      },
                  it: {
                       like:   ["A", "U", "piace", "P"],
                       reblog: ["U", "ha", "rebloggato", "P"],
                       reblogIndex: 2,
                       answer: ["U", "ha riposto", "P"],
                       reply:  ["U", "ha riposto", "P"]
                      }
};

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

function replyRepliesSettings(response) {
   var arr;
   if (response.name !== "settings" ||
       response.message.component !== "replyReplies") {
      return;
   }
   var i, n;
   var showAvatars = response.message.showAvatars;
   var addTags = response.message.addTags;
   var size = response.message.smallAvatars === 1 ? 16 : 64;
   var thecode = [];
   var tags = [];
   arr = $('.s113977_rt');
   for (i=arr.length-1; i>=0; i--) {
      var st, en, nm, add, curr;
      $(arr[i]).toggleClass("s113977_rt",false);
      $(arr[i]).parent().removeClass('s113977_rt_box');
      var oldcode = $(arr[i]).parent().html();
      var link = $(arr[i]).parent().find('img.avatar');
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
         else if (main.hasClass('photo')) { type = "photo"; }
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
         newcode = newcode.replace(/<div class="clear"><\/div>/,'');
         qt = "";
         reblnk = "";
         a = newcode.indexOf('</a>') + 4;
         if (showAvatars) {
            img = newcode.substring(0,a) + '&nbsp;';
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
         a = newcode.indexOf('<blockquote>');
         if (a !== -1) {
            qt = newcode.substr(z);
         }
         img = img.replace(/^\s*/,'').replace(/\s*$/,'')
               .replace(/\s+/g,' ').replace(/&nbsp;$/,'');
         user = user.replace(/^\s*/,'').replace(/\s*$/,'')
               .replace(/\s+/g,' ');
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
         for (x=0; x<langNotification[lang][anstype].length; x++) {
            if (anstype === 'reblog' &&
                x === langNotification[lang].reblogIndex &&
                reblnk !== "") {
               newcode += ' <a href="' + reblnk + '">' +
                  langNotification[lang][anstype][x] + '</a>';
            }
            else if (langNotification[lang][anstype][x] === "U") {
               if (newcode !== '') { newcode += '&nbsp;'; }
               newcode += '<strong>' + user;
            }
            else if (langNotification[lang][anstype][x] === "P") {
               var y;
               for (y=0; y<langPosts[lang][type].length; y++) {
                  newcode += ' ';
                  if (y === 0 && lang === 'it' &&
                      (anstype === "answer" || anstype === "reply")) {
                     if (langPosts.it[type][0] === 'il') {
                        newcode += 'al';
                     }
                     else {
                        newcode += 'alla';
                     }
                  }
                  else if (y === langPosts[lang][type].length - 1) {
                     newcode += '<a href="' + postlnk + '">' +
                        langPosts[lang][type][y] + '</a>';
                  }
                  else {
                     newcode += langPosts[lang][type][y];
                  }
               }
            }
            else {
               newcode += ' ' + langNotification[lang][anstype][x];
            }
         }
         newcode += ':</strong> ';
         if (anstype === "reblog"  && reblnk !== '') {
            newcode += '<em><a href="' + reblnk + '">' + posttxt +
                        '</a></em> ';
         }
         else {
            newcode += '<em><a href="' + postlnk + '">' +
                        posttxt + '</a></em> ';
         }
         if (qt !== '') { newcode += qt; }
         else if (anstxt !== '') {
            newcode += '<blockquote>' + anstxt + '</blockquote>';
         }
         newcode.replace(/<span[^>]*>/g,'').replace(/<\/span>/g,'');
      }
      thecode.push('<p>' + newcode + '</p>');
   }

   var code = thecode.join("") + "\n<p><br /></p>";
   if (/nsfwdone/.test(code) || /nsfwed/.test(code)) {
      code = code.replace(/opacity:\s*[01]\s*;/,'')
                  .replace(/class="nsfwdone"/,'').replace(/class="nsfwed"/,'');
   }

   reply_setValue(code);
   tags_setValue(tags);
   safari.self.tab.dispatchMessage("open","http://www.tumblr.com/new/text");
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
   });

   $('div.notification_type_icon').live('mousedown', function(e) {
      if (e.shiftKey) { e.preventDefault(); }
   }).live('click', function(e) {
      if (e.which !== 1) { return; }
      if (e.shiftKey) {
         $(this).toggleClass("s113977_rt");
         if ($(this).hasClass("s113977_rt")) {
            $(this).parent().addClass('s113977_rt_box');
         }
         else {
            $(this).parent().removeClass('s113977_rt_box');
         }
         return;
      }
      $(this).toggleClass("s113977_rt",true);
      safari.self.tab.dispatchMessage("settings", {component: "replyReplies"});
   });
}

