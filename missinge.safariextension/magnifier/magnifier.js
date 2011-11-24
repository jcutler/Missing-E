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

/*global $,getLocale,safari */

var magimg = safari.extension.baseURI + 'magnifier/magnifier.png';
var turnimg = safari.extension.baseURI + 'magnifier/turners.png';
var overlay = safari.extension.baseURI + 'magnifier/magoverlay.png';

function magClick(e) {
   if (e.which === 1) {
      if ($(this).hasClass('MissingE_magnify_err')) {
         insertMagnifier($(this).closest('li.post').get(0),'a');
         return false;
      }
      var src = $(this).attr('src');
      if (src === undefined || src === null || src === "") { return false; }
      $.facebox({ image: src });
   }
}

function magAvatarClick(e) {
   if (e.which === 1) {
      var src;
      var li = $(this).closest('li,div.follower,#crushes');
      if (li.hasClass('notification')) {
         src = $(this).siblings('img.avatar').attr('src');
      }
      else if (li.hasClass('post')) {
         src = $(this).siblings('.post_avatar').css('background-image');
         src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
      }
      else if (li.hasClass('follower')) {
         src = $(this).parent().find('img.avatar').attr('src');
      }
      else if (li.attr('id') === 'crushes') {
         src = $(this).parent().css('background-image');
         src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
      }
      if (src) {
         src = src.replace(/[0-9]+\.([a-zA-Z]*)$/,"512.$1");
         $.facebox({ image: src });
      }
      return false;
   }
}

function insertAvatarMagnifier(item) {
   var it = $(item);
   var mag;
   if (item.tagName === "LI" && it.hasClass("notification")) {
      mag = $('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(it.find('a.avatar_frame'));
   }
   else if (item.tagName === "LI" && it.hasClass("post") &&
            !it.hasClass('queued')) {
      mag = $('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(it.find('div.avatar_and_i'));
   }
   else if (item.tagName === "DIV" && it.hasClass("follower")) {
      mag = $('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(item);
   }
   else if (item.tagName === "A" && it.parent().attr('id') === 'crushes') {
      mag = $('<div class="MissingE_magnify_avatar"></div>')
         .appendTo(item);
   }
}

function insertMagnifier(item) {
   if (item.tagName === "LI" && $(item).hasClass("post") &&
       $(item).hasClass("photo")) {
      var lang = $('html').attr('lang');
      var ctrl = $(item).find('div.post_controls');
      var bm = ctrl.find('a.MissingE_mark');
      var heart = ctrl.find('a.like_button');
      var count = 1;
      var caps;
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
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
         var mi = $('<a title="' + getLocale(lang).loading + '" ' +
                    'class="MissingE_magnify MissingE_magnify_hide" ' +
                    'id="magnify_' + tid + '" href="#" ' +
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
      }
      safari.self.tab.dispatchMessage("magnifier",{pid: tid, code: str,
                                                   num: count, captions: caps});
   }
}

function receiveMagnifier(response) {
   if (response.name !== "magnifier") { return; }
   var lang = $('html').attr('lang');
   if (response.message.success) {
      $('#magnify_' + response.message.pid).attr('src',response.message.data)
         .removeClass('MissingE_magnify_hide')
         .attr('title', getLocale(lang).magnify);
   }
   else {
      $('#magnify_' + response.message.pid).attr('src','')
         .addClass('MissingE_magnify_err')
         .removeClass('MissingE_magnify_hide')
         .attr('title', getLocale(lang).error);
   }
}

function MissingE_magnifier_doStartup(magnifyAvatars) {
   var turnload = new Image();
   turnload.src = turnimg;
   $('head').append('<style id="MissingE_magnifier_style" type="text/css">' +
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
      safari.self.addEventListener("message", receiveMagnifier, false);
      $('#facebox .turner_left,#facebox .turner_right')
            .live('click', function() {
         var curr = $(this).siblings('div.image:visible:last');
         var next;
         if ($(this).hasClass('turner_right')) {
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
         curr.fadeOut('fast');
         next.fadeIn('slow');
      });
      $('#posts li.post[class~="photo"]').each(function(){
         insertMagnifier(this);
      });
      $(document).bind('MissingEajax',function(e) {
         if (e.originalEvent.data.type === 'notes') { return; }
         $.each(e.originalEvent.data.list, function(i,val) {
            insertMagnifier($('#'+val).get(0));
         });
      });
   }
   if (magnifyAvatars === 1) {
      $('#posts .MissingE_magnify_avatar, ' +
        '#left_column .MissingE_magnify_avatar, ' +
        '#following .MissingE_magnify_avatar, ' +
        '#crushes .MissingE_magnify_avatar').live('click',magAvatarClick);
      $('#posts li, #left_column .follower, #following .follower, #crushes a')
            .each(function() {
         insertAvatarMagnifier(this);
      });
      $(document).bind('MissingEajax',function(e) {
         if (e.originalEvent.data.type === 'notes') { return; }
         $.each(e.originalEvent.data.list, function(i,val) {
            insertAvatarMagnifier($('#'+val).get(0));
         });
         $('#posts li.notification').filter(function() {
            return $('div.MissingE_magnify_avatar', this).length === 0;
         }).each(function(){
            insertAvatarMagnifier(this);
         });
      });
   }
}
