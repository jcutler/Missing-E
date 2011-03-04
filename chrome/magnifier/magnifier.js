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

/*

function loadTimestamp(item) {
   if (item.tagName == "LI" && $(item).hasClass("post") && $(item).attr("id") != "new_post") {
      var div = $(item).find("div.post_info");
      if (div.length == 0)
         $(item).find(".post_controls:first").after('<div class="post_info"><span class="MissingE_timestamp" style="font-weight:normal;">Loading timestamp...</span></div>');
      else {
         var spn = div.find('span.MissingE_timestamp');
         if (spn.length == 0)
            div.append('<br><span class="MissingE_timestamp" style="font-weight:normal;">Loading timestamp...</span>');
         else
            spn.text("Loading timestamp...");
      }
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      */
      //var addr = $(item).find("a.permalink:first").attr("href").match(/http:\/\/[^\/]*/)[0];
/*
      if (tid == undefined || tid == null || tid == "") return;
      chrome.extension.sendRequest({greeting: "timestamp", pid: tid, url: addr}, function(response) {
         if (response.success) {
            var info = $('#post_' + response.pid).find('span.MissingE_timestamp');
            info.html(response.data);
         }
         else {
            var info = $('#post_' + response.pid).find('span.MissingE_timestamp');
            info.html('Timestamp loading failed. <a class="MissingE_timestamp_retry" href="#">Retry</a>');
         }
      });
   }
}
*/

var magimg = chrome.extension.getURL('magnifier/magnifier.png');
$('head').append('<style type="text/css">a.s113977_magnify { background-image:url("' + magimg + '"); }');

function magClick(e) {
   if (e.which == 1) {
      var src = $(this).closest('li.post').find('div.post_content img.image').attr("src");
      $.facebox({ image: src });
   }
}

function insertMagnifier(item) {
   if (item.tagName == "LI" && $(item).hasClass("post") && $(item).hasClass("photo")) {
      var post = $(item).attr("id").match(/[0-9]*$/)[0];
      if (post == undefined || post == null || post == "") return false;
      var ctrl = $(item).find('div.post_controls');
      $('<a class="s113977_magnify" id="magnify_' + post + '" title="Magnify" href="#" onclick="return false;"></a>')
         .appendTo(ctrl).click(magClick);
   }
}

if (/drafts$/.test(location) == false &&
    /queue$/.test(location) == false &&
    /messages$/.test(location) == false) {
   /*
   $('#posts li.post div.post_info a.MissingE_timestamp_retry').live('click',function() {
      var post = $(this).closest('li.post');
      if (post.length == 1) {
         loadTimestamp($(this).parents('li.post').get(0));
      }
   });
   */
   $('#posts li.post[class~="photo"]').each(function(){insertMagnifier(this);});
   document.addEventListener('DOMNodeInserted',function(e) {
      insertMagnifier(this);
   }, false);
}
