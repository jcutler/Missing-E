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

var runScripts = ["../extension.js",
                  "../lib/jquery-1.7.2.min.js",
                  "../lib/evalFix.js",
                  "localizations.js",
                  "utils.js",
                  "../lib/facebox/facebox.js",
                  "../lib/jquery-spin/jquery-spin.js",
                  "../lib/checkbox/jquery.checkbox.min.js",
                  "options.js"];

function loadScripts() {
   if (typeof chrome !== "undefined" ||
       typeof safari !== "undefined" ||
       typeof opera  !== "undefined") {

      if (runScripts.length === 0) {
         return;
      }

      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.onload = loadScripts;
      script.setAttribute("type", "text/javascript");
      script.src = runScripts.shift();
      head.appendChild(script);
   }
}

window.addEventListener("load", loadScripts);