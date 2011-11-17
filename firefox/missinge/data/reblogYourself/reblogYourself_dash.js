/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 2 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

/*global escapeHTML,jQuery,locale,self */

function addReblog(item) {
   if (item.tagName === "LI" && jQuery(item).hasClass('post') &&
       !jQuery(item).hasClass('new_post') && !jQuery(item).hasClass('note')) {
      jQuery(item).find('div.post_controls a.MissingE_reblogYourself_retry')
               .remove();
      if (jQuery(item).find('div.post_controls a[href^="/reblog"]')
               .length > 0 ||
          jQuery(item).find('div.post_controls a.MissingE_reblog_control')
               .length > 0 ||
          (jQuery(item).find('div.post_controls a[href^="/edit"]')
               .length === 0 &&
           jQuery(item).find('div.post_controls a.MissingE_edit_control')
               .length === 0)) {
         return true;
      }
      var tid = jQuery(item).attr("id").match(/[0-9]*$/)[0];
      var perm = jQuery(item).find("a.permalink:first");
      if (perm.length === 0) {
         return;
      }

      self.postMessage({greeting: "reblogYourself", pid: tid,
                        url: perm.attr("href")});
   }
}

function receiveReblog(message) {
   if (message.greeting !== "reblogYourself") { return; }
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var edit, klass, txt;
   var reblog_text = getLocale(lang).reblog;
   if (message.success) {
      klass = (message.icons ? 'MissingE_post_control ' +
                         'MissingE_reblog_control' : '');
      txt = (message.icons ? '' : reblog_text);
      var redir = location.href;
      edit = jQuery('#post_'+message.pid)
               .find('div.post_controls a[href^="/edit"]');
      if (edit.length === 0) {
         edit = jQuery('#post_'+message.pid)
            .find('div.post_controls a.MissingE_edit_control');
      }
      if (/http:\/\/www\.tumblr\.com\/dashboard/.test(redir)) {
               redir = "http://www.tumblr.com/dashboard/1000/" +
                        (Number(message.pid)+1) + "?lite";
      }
      redir = redir.replace(/http:\/\/www.tumblr.com/,'')
                     .replace(/\//g,'%2F').replace(/\?/g,'%3F')
                     .replace(/&/g,'%26');
      var nr = jQuery('<a title="' + reblog_text + '" href="/reblog/' +
                 escapeHTML(message.pid) + '/' +
                 escapeHTML(message.data) + '?redirect_to=' + redir +
                 '" class="' + klass + '">' + txt + '</a>')
         .insertAfter(edit).before(' ');
      nr.trigger('MissingEaddReblog');
   }
   else {
      var reblog_err = getLocale(lang).error;
      edit = jQuery('#post_'+message.pid)
         .find('div.post_controls a[href^="/edit"]');
      if (edit.length === 0) {
         edit = jQuery('#post_'+message.pid)
            .find('div.post_controls a.MissingE_edit_control');
      }
      klass = (message.icons ? 'MissingE_post_control ' +
                          'MissingE_reblog_control ' +
                          'MissingE_reblog_control_retry' : '');
      txt = (message.icons ? '' : '<del>' + reblog_text + '</del>');
      edit.after(' <a title="' + reblog_err + '" href="#" ' +
                     'class="MissingE_reblogYourself_retry ' +
                     klass + '" onclick="return false;">' +
                     txt + '</a>');
   }
}

function MissingE_reblogYourself_dash_doStartup() {
   self.on("message", receiveReblog);
   if (!(/drafts$/.test(location.href)) &&
       !(/queue$/.test(location.href)) &&
       !(/messages$/.test(location.href))) {
      jQuery('#posts li.post div.post_controls a.MissingE_reblogYourself_retry')
         .live('click', function() {
         var post = jQuery(this).closest('li.post');
         if (post.length === 1) {
            addReblog(jQuery(this).parents('li.post').get(0));
         }
      });
      jQuery('#posts li.post').each(function(){addReblog(this);});
      document.addEventListener('MissingEajax',function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function(i,val) {
            addReblog(jQuery('#'+val).get(0));
         });
      }, false);
   }
}

MissingE_reblogYourself_dash_doStartup();
