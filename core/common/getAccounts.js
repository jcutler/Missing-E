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

(function($){

MissingE.packages.getAccounts = {

   run: function() {
      var list = $('#tab_switching .tab_blog');
      if (list.length > 0) {
         var accounts = [];
         list.each(function(i) {
            var acct = this.id ? this.id.match(/tab_blog_(.*)/) : null;
            if (!acct) { return; }
            var name = $(this).find('.blog_name_span').text();
            name = name.replace(/%/g,"%%").replace(/,/g,"%2C");
            accounts.push(acct[1] + ":" + name);
         });
         extension.backupVal("MissingE_tumblrs",accounts.join(","));
         return;
      }
      list = $('#popover_blogs div');
      if (list.length > 0) {
         var accounts = [];
         list.each(function(i) {
            var acct = this.id.match(/menuitem-(.*)/);
            if (!acct) { return; }
            var name = $(this).find('a span').text();
            name = name.replace(/%/g,"%%").replace(/,/g,"%2C");
            accounts.push(acct[1] + ":" + name);
         });
         extension.backupVal("MissingE_tumblrs",accounts.join(","));
      }
      else if (MissingE.isTumblrURL(location.href, ["messages"])) {
         var list = $('#right_column a.messages');
         if (list.length > 0) {
            var accounts = [];
            list.each(function(i) {
               var acct = this.href.match(/\/blog\/(.*)\/messages/);
               if (!acct) { return; }
               var name = $(this).children('div:first').text();
               accounts.push(acct[1] + ":" + name);
            });
            extension.backupVal("MissingE_tumblrs",accounts.join(","));
         }
      }
   },

   init: function() {
      MissingE.packages.getAccounts.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.getAccounts.init();
}

}(jQuery));