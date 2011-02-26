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

var lock = chrome.extension.getURL('safeDash/lock.png');
var lockicon = chrome.extension.getURL('safeDash/lockicon.png');

var st = document.createElement('style');
st.setAttribute('type','text/css');
st.id = 'MissingE_safeDash_style';
var opA;
if (getStorage('MissingE_safeDash_state',0) == 0) {
   opA = 1;
}
else {
   opA = 0;
}
st.innerHTML = '#posts .post img, .notification blockquote img, .video_thumbnail .nsfwdiv + div { opacity:' + opA + '; } #posts .post img:hover, .notification blockquote img:hover, #posts #new_post img, #posts .post .post_question_nipple+div img, #posts .post .footer_links .source_url img, .notes .note a img, .video_thumbnail .nsfwdiv + div:hover, .video_thumbnail .nsfwdiv:hover, .nsfwphotoset:hover .nsfwdiv img { opacity:1 !important; } .nsfwdiv { background:#BFBFBF url("' + lock + '") no-repeat scroll center center !important; display:inline-block !important; max-width:100%; } .nsfwdiv:hover, .nsfwoff { background:#FFFFFF !important} #posts .post .video_thumbnail .nsfwdiv { position:static !important; } #right_column .dashboard_nav_item ul.dashboard_subpages li a .icon.dashboard_controls_nsfw { background-image:url("' + lockicon + '") !important; background-position:0px 0px; } .nsfwembed:hover .nsfwed { visibility:visible !important; } .nsfwembed { clear:both; } .nsfwdiv img.album_art { margin-right:0px !important; } .album_nsfwdiv { margin-right:20px; float:left; } .album_nsfwdiv_enlarged { margin-bottom:20px; margin-right:0 !important; float:none !important;}';

document.getElementsByTagName('head')[0].appendChild(st);

var onoff;
var extra;
if (getStorage('MissingE_safeDash_state',0) == 0) {
   onoff = "Off";
   extra = '';
}
else {

   onoff = "On";
   extra = 'style="background-position:-15px 0px;"';
}

$('.dashboard_nav_item .dashboard_subpages a[href^="/customize"]')
      .parent().after('<li><a id="nsfwctrl" href="#" onclick="return false;">' +
              '<span id="nsfwctrlicon" ' + extra +
              ' class="icon dashboard_controls_nsfw">' +
              '</span>SafeDash <span id="nsfwctrltxt">' + onoff +
              '</span></a></li>');

$('.video_thumbnail div:empty').live('mouseover', function() {
   $(this).parent().find('.nsfwed').css('opacity','1');
}).live('mouseout', function() {
   if (getStorage('MissingE_safeDash_state',0)==1)
      $(this).parent().find('.nsfwed').css('opacity','0');
}); 

$('#nsfwctrl').click(function() {
   var state = 1-getStorage('MissingE_safeDash_state',0);
   setStorage('MissingE_safeDash_state',state);
   if (state == 0) {
      undoNSFW();
   }
   else {
      doNSFW();
   }
});

function undoNSFW() {
   $('#posts .nsfwed').css('opacity','1');
   $('#posts div.nsfwembed span.nsfwed').css('visibility','visible');
   $('img.nsfw_overlay').css('opacity','1');
   $('#nsfwctrltxt').html('Off');
   $('#nsfwctrlicon').css('background-position','0px 0px');
   $('#posts li div.nsfwdiv').addClass('nsfwoff');
}

function doNSFW() {
   $('#posts .nsfwed').css('opacity','0');
   $('#posts div.nsfwembed span.nsfwed').css('visibility','hidden');
   $('img.nsfw_overlay').css('opacity','0');
   $('#nsfwctrltxt').html('On');
   $('#nsfwctrlicon').css('background-position','-15px 0px');
   $('#posts li div.nsfwdiv').removeClass('nsfwoff');
}

function doHide(item) {
   var safe;
   if (getStorage('MissingE_safeDash_state',0)==0) safe = false;
   else safe = true;
   var node = $(item);
   if (item.tagName == 'LI') {
      if (node.hasClass('notification')) {
         $('blockquote img:not(.nsfwdone)',node).each(function(){
            var klass = "";
            var me=$(this);
            me.unbind('readystatechange.s113977_sd');
            if (!me.get(0).readyState == 'uninitialized') {
               me.bind('readystatechange.s113977_sd', function() {
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
      else if (node.hasClass('post')) {
         $('img:not(.nsfwdone),embed.video_player:not(.nsfwdone),embed.photoset:not(.nsfwdone)',node).each(function(){
            var klass = "";
            var me = $(this);
            if (me.parents('#new_post').size()>0 ||
                me.parents('.post_controls').size()>0 ||
                me.parents('.footer_links').size()>0) {
               me.addClass('nsfwdone');
               return;
            }
            if (/^audio_node_[0-9]*$/.test(me.prev().attr('id'))) {
               me.css('opacity','1').addClass('nsfwdone');
               return;
            }
            if (/photoset_preview_overlay.png/.test(me.attr('src'))) {
               me.parent().addClass('nsfwphotoset');
               me.addClass('nsfw_overlay').addClass('nsfwdone').css('opacity','1');
               if (safe)
                  me.css('opacity','0');
               return;
            }
            if (!me.hasClass('video_player') &&
                me.get(0).readyState == 'uninitialized') {
               me.bind('readystatechange.s113977_sd', function() {
                  doHide(item);
               });
               return;
            }
            else if (me.hasClass('video_player') || me.hasClass('photoset')) {
               me.addClass('nsfwvid').addClass('nsfwdone').parent().addClass('nsfwed').parent()
                  .addClass('nsfwembed').css('background','url("' + lock + '") no-repeat scroll center center #BFBFBF');

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
            var album = me.hasClass('album_art');
            var s;
            if (album) {
               me.click(function() {
                  $(this).parent().toggleClass('album_nsfwdiv_enlarged');
               });
               if (h == undefined || h == null || h == 0) h = 150;
               if (w == undefined || w == null || w == 0) w = 150;
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
               }
               s = '<div class="nsfwdiv ' + klass + '" style="min-height:' + h +
                     'px;' + 'min-width:' + w + 'px;' + extra + '" />';
            }
            if (me.parent().hasClass('video_thumbnail'))
               me.next().addClass('nsfwed');

            me.addClass('nsfwed').addClass('nsfwdone').wrap(s);
 
         });
      }
   }
   else if (item.tagName == 'EMBED' && (node.hasClass('video_player') || node.hasClass('photoset')) && !node.hasClass('nsfwdone')) {
      node.addClass('nsfwvid').addClass('nsfwdone').parent().addClass('nsfwed').parent()
                  .addClass('nsfwembed').css('background','url("' + lock + '") no-repeat scroll center center #BFBFBF');

      if (!safe) {
         node.parent().css('visibility','visible');
      }
      else {
         node.parent().css('visibility','hidden');
      }
   }
   else if (item.tagName == 'OL' && node.hasClass('notes')) {
      $('img:not(.nsfwdone)',node).each(function(){
         var klass = "";
         var me = $(this);
         if (me.hasClass('avatar')) {
            me.addClass('nsfwdone');
            return;
         }
         if (!me.get(0).readyState == 'uninitialized') {
            me.get(0).bind('readystatechange.s113977_sd', function() {
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

document.addEventListener('DOMNodeInserted',function(e){
   doHide(e.target);
}, false);

window.addEventListener('storage',function(e) {
   if (e.key != 'MissingE_safeDash_state') return false;
   var state = getStorage('MissingE_safeDash_state',0);
   if (state == 0) {
      undoNSFW();
   }
   else {
      doNSFW();
   }
}, false);

$('#posts li.post, #posts li.notification, ol.notes').each(function(){doHide(this)});
