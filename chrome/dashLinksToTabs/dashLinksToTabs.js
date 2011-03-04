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

var lcol = document.getElementById('left_column');

if (lcol) {
   chrome.extension.sendRequest({greeting: "settings", component: "dashLinksToTabs"}, function(response) {
      var dashLinksToTabs_settings = JSON.parse(response);
      lcol.addEventListener('click', function(e) {
         if (e.target == undefined || e.target == null) return false;
         var node = e.target;
         if (dashLinksToTabs_settings.newPostTabs != 1 &&
             $(node).parents('#new_post').length > 0)
            return false;
         if ($(node).closest('#dashboard_controls').length > 0) return false;
         if (node.tagName!='A') {
            for (; node != null && node.tagName != 'AREA' && node.tagName != 'A' && node.id != this; node=node.parentNode);
         }
         if (node == null || node == this) return false;
         if (!/^#/.test(node.href))
            node.target='_blank'
         return true;
      }, false);
   });
}
