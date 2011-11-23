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

/*global $,chrome */

function dashLinksToTabs_click(e, dashLinksToTabs_settings) {
   var node = e.target;
   if (node === undefined || node === null) { return false; }

   if (dashLinksToTabs_settings.newPostTabs !== 1 &&
       $(node).parents('#new_post').length > 0) {
      return false;
   }
   if (/\/blog\/[^\/]*\/followers/.test(location.pathname) &&
       $(node).parent().hasClass('pagination')) {
      return false;
   }
   if ($(node).closest('#dashboard_controls').length > 0) { return false; }
   if ($(node).parent().hasClass('post_controls')) {
      if (/^\/reblog\/\d+\//.test($(node).attr('href')) &&
          dashLinksToTabs_settings.reblogLinks !== 1) {
         return false;
      }
      if (/^\/edit\/\d+/.test($(node).attr('href')) &&
          dashLinksToTabs_settings.editLinks !== 1) {
         return false;
      }
   }
   if (node.tagName!=='A') {
      while (node !== null && node.tagName !== 'AREA' &&
             node.tagName !== 'A' &&
             node !== this) {
         node=node.parentNode;
      }
   }
   if ($(node).hasClass('MissingE_quick_reblog_main')) { return false; }
   if ($(node).attr('id') === 'MissingE_quick_reblog_manual' &&
       dashLinksToTabs_settings.reblogLinks !== 1) {
      return false;
   }
   if (node === null || node === this) { return false; }
   if (!$(node).attr('href')) { return false; }
   if (/^#/.test($(node).attr('href'))) { return false; }
   var urlhash = $(node).attr('href').match(/^([^#]*)#/);
   var prehash = $(node).attr('href');
   if (urlhash !== undefined && urlhash !== null && urlhash.length > 1) {
      prehash = urlhash[1];
   }
   var lochash = location.href.match(/^([^#]*)#/);
   var prelochash = location.href;
   if (lochash !== undefined && lochash !== null && lochash.length > 1) {
      prelochash = lochash[1];
   }
   if (prehash === prelochash) { return false; }
   node.target='_blank';
   return true;
}

var lcol = document.getElementById('left_column');
var rcol = document.getElementById('right_column');

chrome.extension.sendRequest({greeting: "settings",
                              component: "dashLinksToTabs"},
                              function(response) {

   var dashLinksToTabs_settings = JSON.parse(response);
   if (lcol) {
      /* Chrome version uses mouseup to fix an issue in queued posts
         where the edit button (when icon-replaced) doesn't always
         execute the default behaviour (because of dragging) */
      lcol.addEventListener('mouseup', function(e) {
         dashLinksToTabs_click(e, dashLinksToTabs_settings);
      }, false);
   }
   if (rcol && dashLinksToTabs_settings.sidebar === 1) {
      rcol.addEventListener('click', function(e) {
         dashLinksToTabs_click(e, dashLinksToTabs_settings);
      }, false);
   }
   if (dashLinksToTabs_settings.sidebar === 1) {
      $('#inbox_button a').bind('click', function() {
         $(this).attr('target','_blank');
         return true;
      });
   }
   $('#MissingE_quick_reblog a').live('click', function(e) {
         dashLinksToTabs_click(e, dashLinksToTabs_settings);
   });
});
