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

// Restore globalEval functionality

(function(){
   jQuery.globalEval = function(b){
      if (b && /\S/.test(b)) {
         var h = document.head || document.getElementsByTagName("head")[0] ||
                  document.documentElement;
         var s = document.createElement("script");
         s.appendChild(document.createTextNode(b));
         h.insertBefore(s,h.firstChild);
         h.removeChild(s);
      }
   };
   jQuery.support.cors = true;
}());