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

MissingE.packages.timestamps = {

   receiveTimestamp: function(response) {
      var info = $('#post_' + response.pid).find('span.MissingE_timestamp');

      if (response.success) {
         info.text(response.data);
      }
      else {
         var lang = $('html').attr('lang');
         var i;
         var failArr = MissingE.getLocale(lang).timestamps.failText;
         var retryIdx = MissingE.getLocale(lang).timestamps.retryIndex;
         var failNode = $('<span />');
         for (i=0; i<failArr.length; i++) {
            if (i === retryIdx) {
               failNode.append($('<a />',{"class": "MissingE_timestamp_retry",
                                          href: "#",
                                          text: failArr[i]}));
            }
            else {
               failNode.append($('<span />',{text: failArr[i]}));
            }
            if (i+1 < failArr.length) {
               failNode.append(' ');
            }
         }
         info.empty().append(failNode);
      }
   },

   loadTimestamp: function(item) {
      var lang = $('html').attr('lang');
      if (item.tagName === "LI" && $(item).hasClass("post") &&
          !$(item).hasClass("fan_mail") &&
          $(item).attr("id") !== "new_post" &&
          $(item).find('.private_label').length === 0) {
         var tid = $(item).attr("id").match(/\d*$/)[0];
         var perm = $(item).find("a.permalink:first");
         var addr, type, stamp;
         if (MissingE.isTumblrURL(location.href, ["messages"])) {
            type = 'ask';
            addr = 'http://www.tumblr.com/edit/';
            stamp = '';
         }
         else if (perm.length > 0) {
            type = 'other';
            addr = '';
            stamp = perm.attr('title').replace(/^.* \- /,'');
         }
         if (!tid || (!addr && addr !== '') || (!stamp && stamp !== '')) {
            return;
         }
         var div = $(item).find("div.post_info");
         if (div.length === 0) {
            $(item).find(".post_controls:first")
                  .after('<div class="post_info">' +
                         '<span class="MissingE_timestamp" ' +
                         'style="font-weight:normal;line-height:normal;">' +
                         MissingE.escapeHTML(MissingE.getLocale(lang).loading) +
                         '</span></div>');
         }
         else {
            var spn = div.find('span.MissingE_timestamp');
            if (spn.length === 0) {
               div.append('<br><span class="MissingE_timestamp" ' +
                          'style="font-weight:normal;line-height:normal;">' +
                          MissingE.escapeHTML(MissingE.getLocale(lang).loading)+
                          '</span>');
            }
            else {
               spn.text(MissingE.getLocale(lang).loading);
            }
         }
         extension.sendRequest("timestamp",
                               {pid: tid, url: addr, lang: lang, stamp: stamp,
                                type: type},
                               this.receiveTimestamp);
      }
   },

   run: function() {
      $('#posts li.post div.post_info a.MissingE_timestamp_retry')
         .live('click',function() {
         var post = $(this).closest('li.post');
         if (post.length === 1) {
            MissingE.packages.timestamps
               .loadTimestamp($(this).parents('li.post').get(0));
         }
         return false;
      });
      $('#posts li.post').each(function(){
         MissingE.packages.timestamps.loadTimestamp(this);
      });
      extension.addAjaxListener(function(type,list) {
         if (type === 'notes') { return; }
         $.each(list, function(i,val) {
            MissingE.packages.timestamps.loadTimestamp($('#'+val).get(0));
         });
      });
   },

   init: function() {
      this.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.timestamps.init();
}

}(jQuery));
