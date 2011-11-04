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

(function() {
   var frame = document.getElementById("tumblr_controls");
   if (!frame ||
       !(/^http:\/\/[^\.]*\.tumblr\.com\/iframe.html/.test(frame.src)) ||
       /^http:\/\/www\.tumblr\.com\//.test(location.href)) {
      return;
   }
   var myasker = document.getElementsByClassName('asker');
   var isSure = true;
   var name = "";
   var i;
   for (i=0; i<myasker.length; i++) {
      if (myasker[i].tagName === "A") {
         if (!(/[^a-zA-Z0-9\-]/.test(myasker[i].innerHTML))) {
            name = myasker[i].innerHTML;
            break;
         }
      }
   }
   if (name === "") {
      isSure = false;
      myasker = document.body.innerHTML
                     .match(/<a href="[^"]*">([a-zA-Z0-9\-]+)<\/a>\s*asked\:/);
      if (myasker && myasker.length > 1) {
         name = myasker[1];
      }
   }
   safari.self.tab.dispatchMessage("sendAsker", {name: name, isSure: isSure});
})();
