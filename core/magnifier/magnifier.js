/*
 * 'Missing e' Extension
 *
 * Copyright 2012, Jeremy Cutler
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

/*global extension, jQuery, MissingE */

(function($){

MissingE.packages.magnifier = {

   magClick: function(e) {
      if (e.which === 1) {
         if ($(this).hasClass('MissingE_magnify_err')) {
            MissingE.packages.magnifier
               .insertMagnifier($(this).closest('li.post').get(0),'a');
            return false;
         }
         var src = $(this).attr('src');
         if (src === undefined || src === null || src === "") { return false; }
         $.facebox({ image: src });
      }
   },

   magAvatarClick: function(e) {
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
            src = $(this).parent().find('.avatar');
            if (src.is('img')) {
               src = src.attr('src');
            }
            else {
               src = src.css('background-image');
               src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
            }
         }
         else if (li.attr('id') === 'crushes') {
            src = $(this).parent().css('background-image');
            src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
         }
         if (src) {
            src = src.replace(/\d+\.([a-zA-Z]*)$/,"512.$1");
            $.facebox({ image: src });
         }
         return false;
      }
   },

   insertAvatarMagnifier: function(item) {
      var it = $(item);
      var mag;
      if (it.find('div.MissingE_magnify_avatar').length > 0 ||
          it.attr('id') === "invite_someone") {
         return;
      }
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
   },

   insertMagnifier: function(item) {
      if (item.tagName === "LI" && $(item).hasClass("post") &&
          $(item).hasClass("photo")) {
         var lang = $('html').attr('lang');
         var ctrl = $(item).find('div.post_controls');
         if (ctrl.find('.MissingE_magnify').length > 0) {
            return;
         }
         var bm = ctrl.find('a.MissingE_mark');
         var heart = ctrl.find('a.like_button');
         var publish;
         var tid = $(item).attr("id").match(/\d*$/)[0];
         var img;
         var set = $('#photoset_' + tid);
         var msg = null;
         var override = false;
         var url;

         if (MissingE.isTumblrURL(location.href, ["drafts", "queue"])) {
            publish = ctrl.find('a').filter(function() {
               return /publish_post_/.test($(this).attr('onclick'));
            }).first();
         }

         if (set.length > 0) {
            var imgs = set.find('img');
            msg = [];
            imgs.each(function(i) {
               msg.push($(this).closest('a.photoset_photo').attr('href'));
               var thecap = $(this).attr('alt');
               msg.push(thecap ? thecap : "");
               override = true;
            });
            msg = JSON.stringify(msg);
         }
         else {
            img = $(item).find('div.post_content img:first');
            var anch = img.parent('a');
            if (anch.length > 0 &&
                anch.attr('href').replace(/_\d+.[a-z]{2,4}$/i) ===
                 img.attr('src').replace(/_\d+.[a-z]{2,4}$/i)) {
               msg = anch.attr('href');
               override = true;
            }
            else {
               url = img.attr('src');
            }
         }
         if (override || url) {
            var mi = $('<a />',
                       {title: MissingE.getLocale(lang).loading,
                        "class": "post_control MissingE_magnify MissingE_magnify_hide",
                        id: "magnify_" + tid, href: "#",
                        click: function() { return false; }});
            mi.click(MissingE.packages.magnifier.magClick);
            if (publish && publish.length > 0) {
               publish.before(mi);
            }
            else if (bm.length > 0) {
               bm.before(mi);
            }
            else if (heart.length > 0) {
               heart.before(mi);
            }
            else {
               ctrl.append(mi);
            }
         }
         if (msg) {
            MissingE.packages.magnifier.receiveMagnifier({pid: tid, success: true, data: msg});
         }
         else {
            extension.sendRequest("magnifier",
                                  {pid: tid, src: url},
                                  MissingE.packages.magnifier.receiveMagnifier);
         }
      }
   },

   receiveMagnifier: function(response) {
      var lang = $('html').attr('lang');
      if (response.success) {
         $('#magnify_' + response.pid).attr('src', response.data)
            .removeClass('MissingE_magnify_hide')
            .attr('title', MissingE.getLocale(lang).magnify);
      }
      else {
         $('#magnify_' + response.pid).attr('src','')
            .addClass('MissingE_magnify_err')
            .removeClass('MissingE_magnify_hide')
            .attr('title', MissingE.getLocale(lang).error);
      }
   },

   run: function() {
      var settings = this.settings;
      var turnimg = extension.getURL('core/magnifier/turners.png');
      var turnload = new Image();
      turnload.src = turnimg;
      $('head').append('<style id="MissingE_magnifier_style" type="text/css">' +
                       'a.MissingE_magnify { ' +
                       'background-image:url("' +
                          extension.getURL('core/magnifier/magnify.png') +
                       '"); } ' +
                       '#facebox .slideshow .turner_left, ' +
                       '#facebox .slideshow .turner_right { ' +
                       'background-image:url("' + turnimg + '"); } ' +
                       '.MissingE_magnify_avatar { ' +
                       'background-image:url("' +
                          extension.getURL('core/magnifier/magoverlay.png') +
                       '"); }</style>');

      if (!MissingE.isTumblrURL(location.href, ["messages", "followers",
                                                "following"])) {
         $('#facebox .turner_left, #facebox .turner_right')
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
            MissingE.packages.magnifier.insertMagnifier(this);
         });
         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function(i,val) {
               MissingE.packages.magnifier.insertMagnifier($('#'+val).get(0));
            });
         });
      }

      if (settings.magnifyAvatars === 1) {
         $('#posts .MissingE_magnify_avatar, ' +
           '#left_column .MissingE_magnify_avatar, ' +
           '#following .MissingE_magnify_avatar, ' +
           '#crushes .MissingE_magnify_avatar')
               .live('click', MissingE.packages.magnifier.magAvatarClick);
         var posts = document.getElementById("posts");
         if (posts) {
            posts.addEventListener('click', function(e) {
               if (e.target.className === "MissingE_magnify_avatar") {
                  e.stopPropagation();
                  e.preventDefault();
                  MissingE.packages.magnifier.magAvatarClick.call(e.target, e);
                  return false;
               }
            }, true);
         }
         $('#posts li, #left_column .follower, ' +
           '#following .follower, #crushes a').each(function() {
            MissingE.packages.magnifier.insertAvatarMagnifier(this);
         });
         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function(i,val) {
               MissingE.packages.magnifier
                  .insertAvatarMagnifier($('#'+val).get(0));
            });
            $('#posts li.notification').filter(function() {
               return $('div.MissingE_magnify_avatar', this).length === 0;
            }).each(function(){
               MissingE.packages.magnifier.insertAvatarMagnifier(this);
            });
         });
      }
   },

   init: function() {
      extension.sendRequest("settings", {component: "magnifier"},
                            function(response) {
         if (response.component === "magnifier") {
            var i;
            MissingE.packages.magnifier.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.magnifier.settings[i] = response[i];
               }
            }
            MissingE.packages.magnifier.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.magnifier.init();
}

}(jQuery));
