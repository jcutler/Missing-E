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

(function($){

MissingE.packages.reblogYourself = {

   addReblog: function(item) {
      if (item.tagName === "LI" && $(item).hasClass('post') &&
          !$(item).hasClass('new_post') && !$(item).hasClass('note')) {
         $(item).find('div.post_controls a.MissingE_reblogYourself_retry')
                  .remove();
         if ($(item).find('div.post_controls a[href^="/reblog"]')
                  .length > 0 ||
             $(item).find('div.post_controls a.MissingE_reblog_control')
                     .length > 0 ||
             ($(item).find('div.post_controls a[href^="/edit"]')
                  .length === 0 &&
              $(item).find('div.post_controls a.MissingE_edit_control')
                     .length === 0)) {
            return true;
         }
         var tid = $(item).attr("id").match(/\d*$/)[0];
         var perm = $(item).find("a.permalink:first");
         if (perm.length === 0) {
            return;
         }

         extension.sendRequest("reblogYourself",
                               {pid: tid, url: perm.attr("href")},
                               MissingE.packages.reblogYourself.receiveReblog);
      }
   },

   receiveReblog: function(response) {
      var edit, txt;
      var lang = $('html').attr("lang");
      var reblog_text = MissingE.getLocale(lang).reblog;
      if ($('#post_' + response.pid + ' div.post_controls a[href^="/reblog/"]')
            .length > 0) {
         return;
      }
      if (response.success) {
         var redir = location.href;
         edit = $('#post_' + response.pid)
            .find('div.post_controls a[href^="/edit"]');
         if (MissingE.isTumblrURL(redir, ["dashboard"])) {
            redir = "http://www.tumblr.com/dashboard/1000/" +
                     (Number(response.pid)+1);
         }
         redir = redir.replace(/http:\/\/www.tumblr.com/,'')
                     .replace(/\//g,'%2F').replace(/\?/g,'%3F')
                     .replace(/&/g,'%26');

         var nr = $('<a />',
                    {title: reblog_text, "class": "reblog_button",
                     href: "/reblog/" + response.pid + "/" + response.data +
                           "?redirect_to=" + redir})
                     .insertAfter(edit).before(' ');
         nr.trigger('MissingEaddReblog');
      }
      else {
         var reblog_err = MissingE.getLocale(lang).error;
         edit = $('#post_' + response.pid)
            .find('div.post_controls a[href^="/edit"]');
         var nre = $('<a />',
                     {title: reblog_err, href: "#",
                      "class": "MissingE_reblogYourself_retry",
                      click: function() { return false; }});
         nre.insertAfter(edit).before(' ');
      }
   },

   run: function() {
      if (!MissingE.isTumblrURL(location.href,
                                ["drafts","queue","messages"])) {
         $('#posts li.post div.post_controls a.MissingE_reblogYourself_retry')
            .live('click', function() {
            var post = $(this).closest('li.post');
            if (post.length === 1) {
               MissingE.packages.reblogYourself
                  .addReblog($(this).parents('li.post').get(0));
            }
         });
         $('#posts li.post').each(function(){
            MissingE.packages.reblogYourself.addReblog(this);
         });
         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function(i,val) {
               MissingE.packages.reblogYourself.addReblog($('#'+val).get(0));
            });
         });
      }
   },

   init: function() {
      MissingE.packages.reblogYourself.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.reblogYourself.init();
}

}(jQuery));
