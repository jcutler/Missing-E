/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
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

(function(){

MissingE.packages.reblogYourselfFill = {

   run: function() {
      var lang = $('html').attr("lang");
      var myBlog = MissingE.getLocale(lang).myBlog;
      var isMine = false;
      var blogMenu = $('#channel_id');
      blogMenu.bind('change',function() {
         var selection = $(this).find('option').filter(':selected');
         if (selection.data("MissingE_created")) {
            $('#autopost_options,#set_twitter').show();
         }
      });
      var list = $('#user_channels').children('li');
      if (list.length === blogMenu.find('option').length + 1 &&
          blogMenu.find('option[value="0"]').length === 0) {
         isMine = true;
      }
      if (list.length > 0) {
         var pos = blogMenu.find('option[value="0"]');
         if (pos.length === 0) { pos = null; }
         list.each(function() {
            var newOpt;
            var acct = this.id.match(/tab-(.*)/);
            if (!acct) { return; }
            acct = acct[1];
            var acctTxt = $(this).find('a[href="/blog/' + acct + '"]').text();
            var newPos = $('#channel_id option[value="' + acct + '"]');
            if (newPos.length > 0) {
               pos = newPos;
               return;
            }
            var newOpt = $('<option />', (isMine ? {val: "0", text: myBlog} :
                                          {val: acct, text: acctTxt}));
            if (pos && !isMine) {
               pos.after(newOpt);
               pos = newOpt;
            }
            else {
               $('#channel_id').prepend(newOpt);
               newOpt.data("MissingE_created",true);
               pos = newOpt;
            }
         });
         if ($('#extra_channel').length > 0) {
            $('#channel_id option').clone().appendTo($('#extra_channel').empty());
         }
         var toChan = location.search.match(/channel_id=([^&]*)/);
         if (toChan) {
            toChan = toChan[1];
         }
         if (!toChan ||
             $('#channel_id option[value="' + toChan + '"]').length === 0) {
            toChan = $('#channel_id option:first').attr('value');
         }
         if ($('#channel_id option[value="' + toChan + '"]').length > 0) {
            $('#extra_channel').val(toChan);
            $('#channel_id').val(toChan);
         }
      }
   },

   init: function() {
      MissingE.packages.reblogYourselfFill.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.reblogYourselfFill.init();
}

}());
