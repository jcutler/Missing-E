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

function addReblog(item) {
   if (item.tagName == "LI" && $(item).hasClass('post') && !$(item).hasClass('new_post') && !$(item).hasClass('note')) {
      if ($(item).find('div.post_controls a:contains("reblog")').length > 0 ||
          $(item).find('div.post_controls a:contains("edit")').length == 0)
         return true;
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var addr = $(item).find("a.permalink:first").attr("href").match(/http:\/\/[^\/]*/)[0];

      safari.self.tab.dispatchMessage("reblogYourself",{pid: tid, url: addr});
   }
}

function receiveReblog(response) {
   if (response.name != "reblogYourself") return;
   if (response.message.success) {
      var redir = window.location.href;
      redir = redir.replace(/http:\/\/www.tumblr.com/,'').replace(/\//g,'%2F').replace(/\?/g,'%3F').replace(/&/g,'%26');
      $('#post_'+response.message.pid).find('div.post_controls a:contains("edit")').after(' <a href="/reblog/' + response.message.pid + '/' + response.message.data + '?redirect_to=' + redir + '">reblog</a>');
   }
}

function MissingE_reblogYourself_dash_doStartup() {
   safari.self.addEventListener("message", receiveReblog, false);
   if (/drafts$/.test(location) == false &&
       /queue$/.test(location) == false &&
       /messages$/.test(location) == false) {
      $('#posts li.post').each(function(){addReblog(this);});
      document.addEventListener('DOMNodeInserted',function(e) {
         addReblog(e.target);
      }, false);
   }
}
