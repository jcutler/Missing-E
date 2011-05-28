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

function loadTimestamp(item) {
   var loadingText = {
      en: "Loading...",
      de: "wird geladen...",
      fr: "Pas prêt...",
      it: "Non pronto...",
      ja: "準備が整っていない",
      tr: "Hazır değil"
   };
   var lang = jQuery('html').attr('lang');
   if (item.tagName === "LI" && jQuery(item).hasClass("post")
       && jQuery(item).attr("id") !== "new_post") {
      var div = jQuery(item).find("div.post_info");
      if (div.length === 0) {
         jQuery(item).find(".post_controls:first")
                  .after('<div class="post_info">' +
                         '<span class="MissingE_timestamp" ' +
                         'style="font-weight:normal;">' + loadingText[lang] +
                         '</span></div>');
      }
      else {
         var spn = div.find('span.MissingE_timestamp');
         if (spn.length === 0) {
            div.append('<br><span class="MissingE_timestamp" ' +
                       'style="font-weight:normal;">' + loadingText[lang] +
                       '</span>');
         }
         else {
            spn.text(loadingText[lang]);
         }
      }
      var tid = jQuery(item).attr("id").match(/[0-9]*$/)[0];
      var perm = jQuery(item).find("a.permalink:first");
      var addr;
      if (perm.length > 0) {
         addr = perm.attr("href").match(/http:\/\/[^\/]*/)[0];
      }
      else {
         if (jQuery(item).find('span.private_label').length > 0) {
            addr = location.href
                  .match(/http:\/\/www\.tumblr\.com\/tumblelog\/([^\/]*)/)[1];
            addr = 'http://' + addr + '.tumblr.com';
         }
         else {
            jQuery(item).find('span.MissingE_timestamp').remove();
         }
      }
      if (tid === undefined || tid === null || tid === "") { return; }
      self.postMessage({greeting: "timestamp", pid: tid, url: addr});
   }
}

function receiveTimestamp(message) {
   var info;
   if (message.greeting !== "timestamp") { return; }
   if (message.success) {
      info = jQuery('#post_' + message.pid)
                     .find('span.MissingE_timestamp');
      info.text(message.data);
   }
   else {
      info = jQuery('#post_' + message.pid)
                     .find('span.MissingE_timestamp');
      info.html('Timestamp loading failed. ' +
                '<a class="MissingE_timestamp_retry" href="#" ' +
                'onclick="return false;">Retry</a>');
   }
}

function MissingE_timestamps_doStartup() {
   self.on("message", receiveTimestamp);
   if (!(/drafts$/.test(location.href)) &&
       !(/queue$/.test(location.href)) &&
       !(/messages$/.test(location.href)) &&
       !(/submissions[^\/]*$/.test(location.href))) {

      jQuery('head').append('<style type="text/css">' +
                       'span.MissingE_timestamp a {' +
                       'text-decoration:none !important } ' +
                       'span.MissingE_timestamp a:hover { ' +
                       'text-decoration:underline !important; }' +
                       '</style>');
      jQuery('#posts li.post div.post_info a.MissingE_timestamp_retry')
            .live('click',function() {
         var post = jQuery(this).closest('li.post');
         if (post.length === 1) {
            loadTimestamp(jQuery(this).parents('li.post').get(0));
         }
      });
      jQuery('#posts li.post').each(function(){ loadTimestamp(this); });
      document.addEventListener('DOMNodeInserted',function(e) {
         loadTimestamp(e.target);
      }, false);
   }
}

MissingE_timestamps_doStartup();
