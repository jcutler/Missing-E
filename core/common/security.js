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

(function(){
   var frames = document.getElementsByTagName("iframe");
   var body = document.getElementsByTagName("body")[0];
   var toRemove = [];
   var i;
   for (i=0; i<frames.length; i++) {
      if (/^http:\/\/220\.112\.47\.222/.test(frames[i].src)) {
         node = frames[i];
         for (node = frames[i]; node.parentNode !== body; node = node.parentNode);
         toRemove.push(node);
         if (node.nextSibling.id === "facebox_overlay") {
            toRemove.push(node.nextSibling);
         }
      }
   }
   if (toRemove.length > 0) {
      MissingE.log("Missing e is removing a fake login box from this page.");
   }
   for (i=0; i<toRemove.length; i++) {
      toRemove[i].parentNode.removeChild(toRemove[i]);
   }
}());
