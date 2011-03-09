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

/*global chrome, $ */

function addReblog(item) {
   if (item.tagName === "LI" && $(item).hasClass('post') &&
       !$(item).hasClass('new_post') && !$(item).hasClass('note')) {
      $(item).find('div.post_controls a.MissingE_reblogYourself_retry')
               .remove();
      if ($(item).find('div.post_controls a:contains("reblog")').length > 0 ||
          $(item).find('div.post_controls a:contains("edit")').length === 0) {
         return true;
      }
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var perm = $(item).find("a.permalink:first");
      if (perm.length === 0) {
         return;
      }
      var addr = perm.attr("href").match(/http:\/\/[^\/]*/)[0];

      chrome.extension.sendRequest({greeting: "reblogYourself", pid: tid,
                                    url: addr}, function(response) {
         if (response.success) {
            var redir = location.href;
            redir = redir.replace(/http:\/\/www.tumblr.com/,'')
                        .replace(/\//g,'%2F').replace(/\?/g,'%3F')
                        .replace(/&/g,'%26');
            $(item).find('div.post_controls a:contains("edit")')
               .after(' <a href="/reblog/' + tid + '/' + response.data +
                      '?redirect_to=' + redir + '">reblog</a>');
         }
         else {
            $(item).find('div.post_controls a:contains("edit")')
                     .after(' <a href="#" ' +
                            'class="MissingE_reblogYourself_retry" ' +
                            'onclick="return false;"><del>reblog</del></a>');
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
   document.addEventListener('DOMNodeInserted',function(e) {
      addReblog(e.target);
   }, false);
}
