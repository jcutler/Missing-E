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

/*global $ */

function dashLinksToTabs_click(e, newPostTabs, reblogLinks, editLinks) {
   var node = e.target;
   if (node === undefined || node === null) { return false; }
   if (newPostTabs !== 1 &&
       jQuery(node).parents('#new_post').length > 0) {
      return false;
   }
   if (/\/tumblelog\/[^\/]*\/followers/.test(location.pathname) &&
       jQuery(node).parent().hasClass('pagination')) {
      return false;
   }
   if (jQuery(node).closest('#dashboard_controls').length > 0) { return false; }
   if (jQuery(node).parent().hasClass('post_controls')) {
      if (/^\/reblog\/[0-9]+\//.test(jQuery(node).attr('href')) &&
          reblogLinks !== 1) {
         return false;
      }
      if (/^\/edit\/[0-9]+/.test(jQuery(node).attr('href')) &&
          editLinks !== 1) {
         return false;
      }
   }
   if (node.tagName!=='A') {
      while (node !== null && node.tagName !== 'AREA' &&
             node.tagName !== 'A' &&
             node !== this) {
         node = node.parentNode;
      }
   }
   if (jQuery(node).hasClass('MissingE_quick_reblog_main')) { return false; }
   if (jQuery(node).attr('id') === 'MissingE_quick_reblog_manual' &&
       reblogLinks !== 1) {
      return false;
   }
   if (node === null || node === this) { return false; }
   if (/^#/.test(jQuery(node).attr('href'))) { return false; }
   var urlhash = jQuery(node).attr('href').match(/^([^#]*)#/);
   var prehash = jQuery(node).attr('href');
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

self.on('message', function(message) {
   if (message.greeting !== "settings" ||
       message.component !== "dashLinksToTabs") {
      return;
   }
   var lcol = document.getElementById('left_column');
   var rcol = document.getElementById('right_column');

   if (lcol) {
      lcol.addEventListener('click', function(e) {
         dashLinksToTabs_click(e, message.newPostTabs, message.reblogLinks,
                               message.editLinks);
      }, false);
   }
   if (rcol && message.sidebar === 1) {
      rcol.addEventListener('click', function(e) {
         dashLinksToTabs_click(e, message.newPostTabs, message.reblogLinks,
                               message.editLinks);
      }, false);
   }
   if (message.sidebar === 1) {
      jQuery('#inbox_button a').bind('click', function(e) {
         jQuery(this).attr('target','_blank');
         return true;
      });
   }
   jQuery('#MissingE_quick_reblog a').live('click', function(e) {
      dashLinksToTabs_click(e, message.newPostTabs, message.reblogLinks,
                            message.editLinks);
   });
});

self.postMessage({greeting: "settings", component: "dashLinksToTabs"});

