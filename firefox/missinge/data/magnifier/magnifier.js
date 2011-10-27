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

/*global escapeHTML,jQuery,locale,self */

function magClick(e) {
   if (e.which === 1) {
      if (jQuery(this).hasClass('MissingE_magnify_err')) {
         insertMagnifier(jQuery(this).closest('li.post').get(0),'a');
         return false;
      }
      var src = jQuery(this).attr('src');
      if (src === undefined || src === null || src === "") { return false; }
      jQuery.facebox({ image: src });
   }
}

function magAvatarClick(e) {
   if (e.which === 1) {
      var src;
      var li = jQuery(this).closest('li,div.follower,#crushes');
      if (li.hasClass('notification')) {
         src = jQuery(this).siblings('img.avatar').attr('src');
      }
      else if (li.hasClass('post')) {
         src = jQuery(this).siblings('.post_avatar').css('background-image');
         src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
      }
      else if (li.hasClass('follower')) {
         src = jQuery(this).parent().find('img.avatar').attr('src');
      }
      else if (li.attr('id') === 'crushes') {
         src = jQuery(this).parent().css('background-image');
         src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
      }
      if (src) {
         src = src.replace(/[0-9]+\.([a-zA-Z]*)$/,"512.$1");
         jQuery.facebox({ image: src });
      }
      return false;
   }
}

function insertAvatarMagnifier(item) {
   var it = jQuery(item);
   var mag;
   if (item.tagName === "LI" && it.hasClass("notification")) {
      mag = jQuery('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(it.find('a.avatar_frame'));
   }
   else if (item.tagName === "LI" && it.hasClass("post") &&
            !it.hasClass('queued')) {
      mag = jQuery('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(it.find('div.avatar_and_i'));
   }
   else if (item.tagName === "DIV" && it.hasClass("follower")) {
      mag = jQuery('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(item);
   }
   else if (item.tagName === "A" && it.parent().attr('id') === 'crushes') {
      mag = jQuery('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(item);
   }
}

function insertMagnifier(item) {
   if (item.tagName === "LI" && jQuery(item).hasClass("post") &&
       jQuery(item).hasClass("photo")) {
      var lang = jQuery('html').attr('lang');
      if (!lang) { lang = 'en'; }
      var ctrl = jQuery(item).find('div.post_controls');
      var bm = ctrl.find('a.MissingE_mark');
      var heart = ctrl.find('a.like_button');
      var count = 1;
      var caps;
      var tid = jQuery(item).attr("id").match(/[0-9]*$/)[0];
      var str, img;
      var set = $('#photoset_' + tid);

      if (set.length > 0) {
         var imgs = set.find('img');
         count = imgs.length;
         caps = [];
         imgs.each(function(i) {
            var thecap = $(this).attr('alt');
            if (!thecap) { thecap = ""; }
            caps.push(thecap);
         });
         img = imgs.first();
      }
      else {
         img = $(item).find('div.post_content img:first');
      }
      if (img.length > 0) {
         str = img.attr("src").match(/\/(tumblr_[^_]*)/);
         if (!str || str.length < 1) {
            str = img.attr("src").match(/media\.tumblr\.com\/([^_]*)/);
         }
         if (str && str.length > 1) {
            str = str[1].substr(0,str[1].length-2);
         }
         else {
            str = null;
         }
      }
      if (str) {
         var mi = jQuery('<a title="' + locale[lang].loading + '" ' +
                    'class="MissingE_magnify MissingE_magnify_hide" ' +
                    'id="magnify_' + escapeHTML(tid) + '" href="#" ' +
                    'onclick="return false;"></a>');
         mi.click(magClick);
         if (bm.length > 0) {
            bm.before(mi);
         }
         else if (heart.length > 0) {
            heart.before(mi);
         }
         else {
            ctrl.append(mi);
         }
         self.postMessage({greeting: "magnifier", pid: tid, code: str,
                           num: count, captions: caps});
      }
   }
}

function receiveMagnifier(message) {
   if (message.greeting !== "magnifier") { return; }
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   if (message.success) {
      jQuery('#magnify_' + message.pid).attr('src',message.data)
         .removeClass('MissingE_magnify_hide')
         .attr('title', locale[lang].magnify);
   }
   else {
      jQuery('#magnify_' + message.pid).attr('src','')
         .addClass('MissingE_magnify_err')
         .removeClass('MissingE_magnify_hide')
         .attr('title', locale[lang].error);
   }
}

self.on('message', function (message) {
   if (message.greeting !== 'settings' ||
       message.component !== 'magnifier') {
      return;
   }
   var extensionURL = message.extensionURL;
   var magimg = extensionURL + 'magnifier/magnifier.png';
   var turnimg = extensionURL + 'magnifier/turners.png';
   var overlay = extensionURL + 'magnifier/magoverlay.png';

   jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
                    extensionURL + 'magnifier/magnifier.css" />');
   var turnload = new Image();
   turnload.src = turnimg;
   jQuery('head').append('<style id="MissingE_magnifier_style" ' +
                    'type="text/css">' +
                    'a.MissingE_magnify { ' +
                    'background-image:url("' + magimg + '"); } ' +
                    '#facebox .slideshow .turner_left, ' +
                    '#facebox .slideshow .turner_right { ' +
                    'background-image:url("' + turnimg + '"); } ' +
                    '.MissingE_magnify_avatar { ' +
                    'background-image:url("' + overlay + '"); }</style>');

   if (!(/drafts[\/]?$/.test(location.href)) &&
       !(/queue[\/]?$/.test(location.href)) &&
       !(/messages[\/]?$/.test(location.href)) &&
       !(/submissions[^\/]*[\/]?$/.test(location.href)) &&
       !(/inbox[\/]?$/.test(location.href)) &&
       !(/inbox\/after\/[^\/]*[\/]?$/.test(location.href)) &&
       !(/blog\/[^\/]*\/followers/.test(location.href)) &&
       !(/\/following/.test(location.href))) {
      self.on("message", receiveMagnifier);
      jQuery('#facebox .turner_left,#facebox .turner_right')
            .live('click', function() {
         var curr = jQuery(this).siblings('div.image:visible:last');
         var next;
         if (jQuery(this).hasClass('turner_right')) {
            next = curr.next('div.image');
            if (next.length === 0) {
               next = curr.parent().find('div.image:first');
            }
         }
         else {
            next = curr.prev('div.image');
            if (next.length === 0) {
               next = curr.parent().find('div.image:last');
            }
         }
         curr.parent().find('div.image:visible').not(curr).hide();
         curr.hide();
         next.show();
      });
      jQuery('#posts li.post[class~="photo"]').each(function(){
         insertMagnifier(this);
      });
      document.addEventListener('MissingEajax',function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function(i,val) {
            insertMagnifier(jQuery('#'+val).get(0));
         });
      }, false);
   }

   if (message.magnifyAvatars === 1) {
      jQuery('#posts .MissingE_magnify_avatar, ' +
        '#left_column .MissingE_magnify_avatar, ' +
        '#following .MissingE_magnify_avatar, ' +
        '#crushes .MissingE_magnify_avatar').live('click',magAvatarClick);
      jQuery('#posts li,#left_column .follower,#following .follower,#crushes a')
            .each(function() {
         insertAvatarMagnifier(this);
      });
      document.addEventListener('MissingEajax',function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function(i,val) {
            insertAvatarMagnifier(jQuery('#'+val).get(0));
         });
         jQuery('#posts li.notification').filter(function() {
            return jQuery('div.MissingE_magnify_avatar', this).length === 0;
         }).each(function(){
            insertAvatarMagnifier(this);
         });
      }, false);
   }
});

self.postMessage({greeting: "settings", component: "magnifier"});
