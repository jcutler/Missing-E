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

var magimg = chrome.extension.getURL('magnifier/magnifier.png');
var turnimg = chrome.extension.getURL('magnifier/turners.png');
var turnload = new Image();
turnload.src = turnimg;
$('head').append('<style type="text/css">a.s113977_magnify { background-image:url("' + magimg + '"); } #facebox .slideshow .turner_left, #facebox .slideshow .turner_right{ background-image:url("' + turnimg + '"); }</style>');

function magClick(e) {
   if (e.which == 1) {
      if ($(this).hasClass('s113977_magnify_err')) {
         insertMagnifier($(this).closest('li.post').get(0),'a');
         return false;
      }
      var src = $(this).attr('src');
      if (src == undefined || src == null || src == "") return false;
      $.facebox({ image: src });
   }
}

function insertMagnifier(item) {
   if (item.tagName == "LI" && $(item).hasClass("post") && $(item).hasClass("photo")) {
      $(item).find('a.s113977_magnify').remove();
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var addr = $(item).find("a.permalink:first").attr("href").match(/http:\/\/[^\/]*/)[0];
      var ctrl = $(item).find('div.post_controls');
      var mi = $('<a title="Magnifier loading..." class="s113977_magnify s113977_magnify_hide" id="magnify_' + tid + '" href="#" onclick="return false;"></a>')
         .click(magClick);
      var heart = ctrl.find('a.like_button');
      if (heart.length > 0)
         heart.before(mi);
      else
         ctrl.append(mi);
      chrome.extension.sendRequest({greeting: "magnifier", pid: tid, url: addr}, function(response) {
         if (response.success) {
            var urls = response.data.replace(/"/g,'\'');
            $('#magnify_' + response.pid).attr('src',response.data).removeClass('s113977_magnify_hide').attr('title','Magnify');
         }
         else {
            $('#magnify_' + response.pid).attr('src','').addClass('s113977_magnify_err').removeClass('s113977_magnify_hide').attr('title', "An error occurred. Click to reload 'Magnifier'.");
         }
      });
   }
}

if (/drafts$/.test(location) == false &&
    /queue$/.test(location) == false &&
    /messages$/.test(location) == false) {
   $('#facebox .turner_left,#facebox .turner_right').live('click', function(e) {
      var curr = $(this).siblings('div.image:visible:last');
      var next;
      if ($(this).hasClass('turner_right')) {
         next = curr.next('div.image');
         if (next.length == 0) {
            next = curr.parent().find('div.image:first');
         }
      }
      else {
         next = curr.prev('div.image');
         if (next.length == 0)
            next = curr.parent().find('div.image:last');
      }
      curr.parent().find('div.image:visible').not(curr).hide();
      curr.fadeOut('fast');
      next.fadeIn('slow');
   });
   $('#posts li.post[class~="photo"]').each(function(){insertMagnifier(this);});
   document.addEventListener('DOMNodeInserted',function(e) {
      insertMagnifier(e.target);
   }, false);
}
