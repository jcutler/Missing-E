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

/*global safari, $ */

var magimg = safari.extension.baseURI + 'magnifier/magnifier.png';
var turnimg = safari.extension.baseURI + 'magnifier/turners.png';

function magClick(e) {
   if (e.which === 1) {
      if ($(this).hasClass('s113977_magnify_err')) {
         insertMagnifier($(this).closest('li.post').get(0),'a');
         return false;
      }
      var src = $(this).attr('src');
      if (src === undefined || src === null || src === "") { return false; }
      $.facebox({ image: src });
   }
}

function insertMagnifier(item) {
   if (item.tagName === "LI" && $(item).hasClass("post") &&
       $(item).hasClass("photo")) {
      var ctrl = $(item).find('div.post_controls');
      var bm = ctrl.find('a.s113977_mark');
      var heart = ctrl.find('a.like_button');
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var addr;
      var perm = $(item).find("a.permalink:first");
      ctrl.find('a.s113977_magnify').remove();
      if (perm.length > 0) {
         addr = perm.attr("href").match(/http:\/\/[^\/]*/)[0];
      }
      else {
         if ($(item).find('span.private_label').length > 0) {
            addr = location.href
               .match(/http:\/\/www\.tumblr\.com\/tumblelog\/([^\/]*)/)[1];
            addr = 'http://' + addr + '.tumblr.com';
         }
      }
      var mi = $('<a title="Magnifier loading..." ' +
                 'class="s113977_magnify s113977_magnify_hide" id="magnify_' +
                 tid + '" href="#" onclick="return false;"></a>');
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
      safari.self.tab.dispatchMessage("magnifier", {pid: tid, url: addr});
   }
}

function receiveMagnifier(response) {
   if (response.name !== "magnifier") { return; }
   if (response.message.success) {
      $('#magnify_' + response.message.pid).attr('src',response.message.data)
         .removeClass('s113977_magnify_hide').attr('title','Magnify');
   }
   else {
      $('#magnify_' + response.message.pid).attr('src','')
         .addClass('s113977_magnify_err')
         .removeClass('s113977_magnify_hide')
         .attr('title', "An error occurred. Click to reload 'Magnifier'.");
   }
}

function MissingE_magnifier_doStartup() {
   var turnload = new Image();
   turnload.src = turnimg;
   $('head').append('<style id="MissingE_magnifier_style" type="text/css">' +
                    'a.s113977_magnify { ' +
                    'background-image:url("' + magimg + '"); } ' +
                    '#facebox .slideshow .turner_left, ' +
                    '#facebox .slideshow .turner_right { ' +
                    'background-image:url("' + turnimg + '"); }</style>');

   if (!(/drafts$/.test(location.href)) &&
       !(/queue$/.test(location.href)) &&
      !(/messages$/.test(location.href)) &&
      !(/submissions[^\/]*$/.test(location.href))) {
      safari.self.addEventListener("message", receiveMagnifier, false);
      $('#facebox .turner_left,#facebox .turner_right')
         .live('click', function(e) {
         
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
      document.addEventListener('DOMNodeInserted',function(e) {
         insertMagnifier(e.target);
      }, false);
   }
}
