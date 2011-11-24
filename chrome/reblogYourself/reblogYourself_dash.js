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

/*global $,chrome,getLocale */

function addReblog(item) {
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

      chrome.extension.sendRequest({greeting: "reblogYourself", pid: tid,
                                    url: perm.attr("href")},
                                   function(response) {
         var edit, txt, klass;
         var lang = $('html').attr("lang");
         var reblog_text = getLocale(lang).reblog;
         if (response.success) {
            klass = (response.icons ? 'MissingE_post_control ' +
                         'MissingE_reblog_control' : '');
            txt = (response.icons ? '' : reblog_text);
            var redir = location.href;
            edit = $(item)
               .find('div.post_controls a[href^="/edit"]');
            if (edit.length === 0) {
               edit = $(item).find('div.post_controls a.MissingE_edit_control');
            }
            if (/http:\/\/www\.tumblr\.com\/dashboard/.test(redir)) {
               redir = "http://www.tumblr.com/dashboard/1000/" +
                        (Number(response.pid)+1) + "?lite";
            }
            redir = redir.replace(/http:\/\/www.tumblr.com/,'')
                        .replace(/\//g,'%2F').replace(/\?/g,'%3F')
                        .replace(/&/g,'%26');

            var nr = $('<a title="' + reblog_text + '" href="/reblog/' + tid +
              '/' + response.data + '?redirect_to=' + redir +
              '" class="' + klass + '">' + txt + '</a>')
               .insertAfter(edit).before(' ');
            nr.trigger('MissingEaddReblog');
         }
         else {
            var reblog_err = getLocale(lang).error;
            edit = $(item)
               .find('div.post_controls a[href^="/edit"]');
            if (edit.length === 0) {
               edit = $(item).find('div.post_controls a.MissingE_edit_control');
            }
            klass = (response.icons ? 'MissingE_post_control ' +
                         'MissingE_reblog_control ' +
                        'MissingE_reblog_control_retry' : '');
            txt = (response.icons ? '' : '<del>' + reblog_text + '</del>');
            edit.after(' <a title="' + reblog_err + '" href="#" ' +
                            'class="MissingE_reblogYourself_retry ' +
                            klass + '" onclick="return false;">' +
                            txt + '</a>');
         }
      });
   }
}

if (!(/drafts$/.test(location.href)) &&
    !(/queue$/.test(location.href))  &&
    !(/messages$/.test(location.href))) {
   $('#posts li.post div.post_controls a.MissingE_reblogYourself_retry')
      .live('click', function() {
      var post = $(this).closest('li.post');
      if (post.length === 1) {
         addReblog($(this).parents('li.post').get(0));
      }
   });
   $('#posts li.post').each(function(){addReblog(this);});
   $(document).bind('MissingEajax',function(e) {
      if (e.originalEvent.data.type === 'notes') { return; }
      $.each(e.originalEvent.data.list, function(i,val) {
         addReblog($('#'+val).get(0));
      });
   });
}
