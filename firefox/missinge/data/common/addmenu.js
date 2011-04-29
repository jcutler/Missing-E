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

/*global safari */

// Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
   var windowHeight;
   if (self.innerHeight) {
      // all except Explorer
      windowHeight = self.innerHeight;
   }
   else if (document.documentElement &&
            document.documentElement.clientHeight) {
      // Explorer 6 Strict Mode
      windowHeight = document.documentElement.clientHeight;
   }
   else if (document.body) { // other Explorers
      windowHeight = document.body.clientHeight;
   }
   return windowHeight;
}

// Adapted from getPageSize() by quirksmode.com
function getPageWidth() {
   var windowWidth;
   if (self.innerWidth) {
      // all except Explorer
      windowWidth = self.innerWidth;
   }
   else if (document.documentElement &&
            document.documentElement.clientWidth) {
      // Explorer 6 Strict Mode
      windowWidth = document.documentElement.clientWidth;
   }
   else if (document.body) { // other Explorers
      windowWidth = document.body.clientWidth;
   }
   return windowWidth;
}

postMessage({greeting:"addMenu"});

on("message", function (message) {
   if (message.greeting !== "addMenu") { return false; }

   if (/http:\/\/www\.tumblr\.com\/dashboard\/[0-9]/.test(location.href)) {
      var lcol = document.getElementById('left_column');
      var rcol = document.getElementById('right_column');
      if (lcol && !rcol) {
         rcol = document.createElement('div');
         rcol.id = 'right_column';
         lcol.parentNode.insertBefore(rcol, lcol);
         var ot = 0;
         var fp = document.getElementsByClassName('post');
         if (fp.length > 1 && fp[0].id === 'new_post') {
            ot = fp[1].offsetTop;
         }
         else if (fp.length > 0 && fp[0].id !== 'new_post') {
            ot = fp[0].offsetTop;
         }
         ot = ot - rcol.offsetTop + 4;
         if (ot > 0) {
            rcol.style.paddingTop = ot + 'px';
         }
      }
   }

   accmenu = jQuery("#account_menu");

   if (accmenu.length > 0) {
      setlnk = jQuery('<a href="' + message.extensionURL +
                      'options.html" onclick="return false;" ' +
                      'target="_blank">Missing ' +
                      '<img src="' + message.extensionURL +
                      'missinge16.png" style="' +
                      'vertical-align:bottom;" /></a>');
      setlnk.mouseup(function(e) {
         if (e.which === 1 || e.which === 2) {
            postMessage({greeting: "open", url: "OPTIONS",
                         width: getPageWidth(), height: getPageHeight()});
         }
      }).insertBefore(accmenu.find('a:last'));
   }
});
