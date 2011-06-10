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

/*global safari, $, getStorage, setStorage, window */

var lock, lockicon;

function undoNSFW() {
   jQuery('#posts .nsfwed').css('opacity','1');
   jQuery('#posts div.nsfwembed span.nsfwed').css('visibility','visible');
   jQuery('#posts div.nsfwembed object.nsfwvid').css('visibility','visible');
   jQuery('img.nsfw_overlay').css('opacity','1');
   jQuery('#MissingE_safeDash li:first').removeClass('selected');
   jQuery('#posts li div.nsfwdiv').addClass('nsfwoff');
}

function doNSFW() {
   jQuery('#posts .nsfwed').css('opacity','0');
   jQuery('#posts div.nsfwembed span.nsfwed').css('visibility','hidden');
   jQuery('#posts div.nsfwembed object.nsfwvid').css('visibility','hidden');
   jQuery('img.nsfw_overlay').css('opacity','0');
   jQuery('#MissingE_safeDash li:first').addClass('selected');
   jQuery('#posts li div.nsfwdiv').removeClass('nsfwoff');
}

function doHide(item) {
   var safe;
   if (getStorage('MissingE_safeDash_state',0)===0) { safe = false; }
   else { safe = true; }
   var node = jQuery(item);
   if (item.tagName === 'LI') {
      if (node.hasClass('notification')) {
         jQuery('blockquote img:not(.nsfwdone)',node).each(function(){
            var klass = "";
            var me=jQuery(this);
            me.unbind('readystatechange.MissingE_sd');
            if (me.get(0).readyState === 'uninitialized') {
               me.bind('readystatechange.MissingE_sd', function() {
                  doHide(item);
               });
               return;
            }
            else if (!safe) {
               me.css('opacity','1');
               klass = 'nsfwoff';
            }
            else {
               me.css('opacity','0');
            }
            var h = me.height();
            var w = me.width();
            var extra = '';
            var s = '<div class="nsfwdiv ' + klass + '" style="min-height:' +
                     h + 'px;' + 'min-width:' + w + 'px;' + extra + '" />';

            me.addClass('nsfwed').addClass('nsfwdone').wrap(s);

         });
      }
      else if (node.hasClass('post') && node.attr('id') !== 'new_post') {
         jQuery('img:not(.nsfwdone),embed.video_player:not(.nsfwdone),' +
           'embed.photoset:not(.nsfwdone)',node).each(function(){
            var klass = "";
            var me = jQuery(this);
            if (me.parents('#new_post').size()>0 ||
                me.parents('.post_controls').size()>0 ||
                me.parents('.footer_links').size()>0) {
               me.addClass('nsfwdone');
               return;
            }
            if (/^audio_node_[0-9]*$/.test(me.prev().attr('id')) ||
                me.parents('.so_ie_doesnt_treat_this_as_inline').size()>0) {
               me.css('opacity','1').addClass('nsfwdone');
               return;
            }
            if (/photoset_preview_overlay.png/.test(me.attr('src'))) {
               me.parent().addClass('nsfwphotoset');
               me.addClass('nsfw_overlay').addClass('nsfwdone')
                     .css('opacity','1');
               if (safe) {
                  me.css('opacity','0');
               }
               return;
            }
            if (!me.hasClass('video_player') &&
                me.get(0).readyState === 'uninitialized') {
               me.bind('readystatechange.MissingE_sd', function() {
                  doHide(item);
               });
               return;
            }
            else if (me.hasClass('video_player') || me.hasClass('photoset')) {
               me.addClass('nsfwvid').addClass('nsfwdone').parent()
                  .addClass('nsfwed').parent().addClass('nsfwembed')
                  .css('background','url("' + lock + '") no-repeat scroll ' +
                       'center center #BFBFBF');

               if (!safe) {
                  me.parent().css('visibility','visible');
               }
               else {
                  me.parent().css('visibility','hidden');
               }
               return;
            }
            else if (!safe) {
               me.css('opacity','1');
               klass = 'nsfwoff';
            }
            else {
               me.css('opacity','0');
            }
            var h = me.height();
            var w = me.width();
            var album = me.hasClass('album_art') ||
                        me.hasClass('image_thumbnail');
            var s;
            if (album) {
               me.click(function() {
                  var adiv = jQuery(this).parent();
                  var mb = this.style.marginBottom;
                  if (!mb || mb === '') {
                     mb = '0px';
                  }
                  if (!adiv.hasClass('album_nsfwdiv_enlarged')) {
                     adiv.css('margin-bottom',mb);
                  }
                  else {
                     adiv.css('margin-bottom','');
                  }
                  adiv.toggleClass('album_nsfwdiv_enlarged');
               });
               if (h === undefined || h === null || h === 0) { h = 150; }
               if (w === undefined || w === null || w === 0) { w = 150; }
               s = '<div class="nsfwdiv album_nsfwdiv ' + klass +'" style="' +
                     'margin-right:' + me.css('margin-right') +
                     ';float:left;" />';
            }
            else {
               var extra = '';
               if (/^photoset_/.test(me.parent().next().attr('id'))) {
                  var pos = me.position();
                  extra = 'position:absolute;top:' + pos.top + 'px;left:' +
                     pos.left + 'px;';
                  if (pos.top === 0) {
                     if (pos.left === 0) { klass += ' nsfwphotoset4'; }
                     else { klass += ' nsfwphotoset1'; }
                  }
                  else {
                     if (pos.left === 0) { klass += ' nsfwphotoset3'; }
                     else { klass += ' nsfwphotoset2'; }
                  }
               }
               if (!(/http:\/\/assets\.tumblr\.com\/images\/inline_photo\.png/
                     .test(me.attr('src')))) {
                  if (!me.hasClass('inline_image')) {
                     extra += 'min-height:' + h + 'px;min-width:' + w + 'px;';
                  }
               }
               s = '<div class="nsfwdiv ' + klass + '" style="' + extra +
                     '" />';
            }
            if (me.parent().hasClass('video_thumbnail')) {
               me.next().addClass('nsfwed');
            }

            me.addClass('nsfwed').addClass('nsfwdone').wrap(s);

         });
      }
   }
   else if (item.tagName === 'EMBED' &&
            (node.hasClass('video_player') || node.hasClass('photoset')) &&
            !node.hasClass('nsfwdone')) {
      node.addClass('nsfwvid').addClass('nsfwdone').parent()
            .addClass('nsfwed').parent().addClass('nsfwembed')
            .css('background','url("' + lock + '") no-repeat scroll center ' +
                 'center #BFBFBF');

      if (!safe) {
         node.parent().css('visibility','visible');
      }
      else {
         node.parent().css('visibility','hidden');
      }
   }
   else if (item.tagName === 'OBJECT' &&
            node.parent().hasClass('video_embed') &&
            !node.hasClass('nsfwdone')) {
      node.addClass('nsfwvid').addClass('nsfwdone').parent()
            .css('background','url("' + lock + '") ' +
                 'no-repeat scroll center center #BFBFBF')
            .parent().addClass('nsfwembed');

      if (!safe) {
         node.css('visibility','visible');
      }
      else {
         node.css('visibility','hidden');
      }
   }
   else if ((item.tagName === 'OL' && node.hasClass('notes')) ||
            (item.tagName === 'LI' && node.parent().hasClass('notes'))) {
      jQuery('img:not(.nsfwdone)',node).each(function(){
         var klass = "";
         var me = jQuery(this);
         if (me.hasClass('avatar')) {
            me.addClass('nsfwdone');
            return;
         }
         if (me.get(0).readyState === 'uninitialized') {
            me.get(0).bind('readystatechange.MissingE_sd', function() {
               doHide(item);
            });
            return;
         }
         else if (!safe) {
            me.css('opacity','1');
            klass = 'nsfwoff';
         }
         else {
            me.css('opacity','0');
         }
         var h = me.height();
         var w = me.width();
         var extra = '';
         var s = '<div class="nsfwdiv ' + klass + '" style="min-height:' + h +
               'px;' + 'min-width:' + w + 'px;' + extra + '" />';

         me.addClass('nsfwed').addClass('nsfwdone').wrap(s);
      });
   }
}

self.on('message', function (message) {
   if (message.greeting !== "settings" ||
       message.component !== "safeDash") {
      return;
   }
   var extensionURL = message.extensionURL;
   jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
                         extensionURL + 'safeDash/safeDash.css" />');
   lock = extensionURL + 'safeDash/lock.png';
   lockicon = extensionURL + 'safeDash/lockicon.png';
   var opA;
   if (getStorage('MissingE_safeDash_state',0) === 0) {
      opA = 1;
   }
   else {
      opA = 0;
   }
   jQuery('head').prepend('<style type="text/css">' +
               '#posts .post img, .notification blockquote img, ' +
               '.video_thumbnail .nsfwdiv + div { opacity:' + opA + '; } ' +
               '.nsfwdiv { background:#BFBFBF url("' + lock + '") no-repeat ' +
               'scroll center center !important; } #right_column ' +
               '#MissingE_safeDash li a {' +
               'background-image:url("' + lockicon + '") !important; } ' +
               '.nsfwoff { background:#FFFFFF !important; }</style>');

   if (jQuery('#new_post').css('background-image') !== "none") {
      jQuery('#new_post_icons').attr('style','opacity:0 !important;');
   }

   var sdlnk = '<ul class="right_column_section" id="MissingE_safeDash">' +
               '<li class="' +
               (getStorage('MissingE_safeDash_state',0) === 1 ?
                'selected' : '') + '"><a href="#" onclick="return false;" ' +
               'id="nsfwctrl">SafeDash</a></li></ul>';

   var afterer = jQuery('#MissingE_marklist');
   if (afterer.length === 0) {
      afterer = jQuery('#right_column .radar');
   }
   if (afterer.length > 0) {
      afterer.before(sdlnk);
   }
   else {
      jQuery('#right_column').append(sdlnk);
   }

   jQuery('.video_thumbnail div:empty').live('mouseover', function() {
      jQuery(this).parent().find('.nsfwed').css('opacity','1');
   }).live('mouseout', function() {
      if (getStorage('MissingE_safeDash_state',0)===1) {
         jQuery(this).parent().find('.nsfwed').css('opacity','0');
      }
   });

   jQuery('#nsfwctrl').click(function() {
      var state = 1-getStorage('MissingE_safeDash_state',0);
      setStorage('MissingE_safeDash_state',state);
      if (state === 0) {
         undoNSFW();
      }
      else {
         doNSFW();
      }
   });

   document.addEventListener('DOMNodeInserted',function(e){
      doHide(e.target);
   }, false);

   window.addEventListener('storage',function(e) {
      if (e.key !== 'MissingE_safeDash_state') { return false; }
      var state = getStorage('MissingE_safeDash_state',0);
      if (state === 0) {
         undoNSFW();
      }
      else {
         doNSFW();
      }
   }, false);

   jQuery('#posts li.post, #posts li.notification, ol.notes').each(function(){
      doHide(this);
   });
});

self.postMessage({greeting: "settings", component: "safeDash"});
