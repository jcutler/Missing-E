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

/*global $, chrome */

function loadTimestamp(item) {
   var lang = $('html').attr('lang');
   var info;
   if (item.tagName === "LI" && $(item).hasClass("post") &&
       $(item).attr("id") !== "new_post") {
      var div = $(item).find("div.post_info");
      if (div.length === 0) {
         $(item).find(".post_controls:first")
               .after('<div class="post_info">' +
                      '<span class="MissingE_timestamp" ' +
                      'style="font-weight:normal;">' + locale["loading"][lang] +
                      '</span></div>');
      }
      else {
         var spn = div.find('span.MissingE_timestamp');
         if (spn.length === 0) {
            div.append('<br><span class="MissingE_timestamp" ' +
                       'style="font-weight:normal;">' + locale["loading"][lang] +
                       '</span>');
         }
         else {
            spn.text(locale["loading"][lang]);
         }
      }
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var perm = $(item).find("a.permalink:first");
      var addr;
      if (perm.length > 0) {
         addr = perm.attr("href").match(/http:\/\/[^\/]*/)[0];
      }
      else {
         if ($(item).find('span.private_label').length > 0) {
            addr = location.href
                  .match(/http:\/\/www\.tumblr\.com\/tumblelog\/([^\/]*)/)[1];
            addr = 'http://' + addr + '.tumblr.com';
         }
         else {
            $(item).find('span.MissingE_timestamp').remove();
         }
      }

      if (tid === undefined || tid === null || tid === "") { return; }
      chrome.extension.sendRequest({greeting: "timestamp", pid: tid, url: addr},
                                   function(response) {
         if (response.success) {
            info = $('#post_' + response.pid)
                           .find('span.MissingE_timestamp');
            info.html(response.data);
         }
         else {
            var extraHTML = '';
            if (response.debugMode) {
               extraHTML = ' (<a href="' + addr + '/api/read/json?id=' +
                           response.pid + '">' + response.pid + '</a>)';
            }
            info = $('#post_' + response.pid)
                           .find('span.MissingE_timestamp');
            info.html('Timestamp loading failed. ' +
                      '<a class="MissingE_timestamp_retry" href="#" ' +
                      'onclick="return false;">Retry</a>' + extraHTML);
         }
      });
   }
}

if (!(/drafts$/.test(location.href)) &&
    !(/queue$/.test(location.href)) &&
    !(/messages$/.test(location.href)) &&
    !(/submissions[^\/]*$/.test(location.href))) {

   $('head').append('<style type="text/css">' +
                    'span.MissingE_timestamp a {' +
                    'text-decoration:none !important } ' +
                    'span.MissingE_timestamp a:hover { ' +
                    'text-decoration:underline !important; }' +
                    '</style>');
   $('#posts li.post div.post_info a.MissingE_timestamp_retry')
      .live('click',function() {
      var post = $(this).closest('li.post');
      if (post.length === 1) {
         loadTimestamp($(this).parents('li.post').get(0));
      }
   });
   $('#posts li.post').each(function(){ loadTimestamp(this); });
   document.addEventListener('DOMNodeInserted',function(e) {
      loadTimestamp(e.target);
   }, false);
}
