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

function MissingE_dashboardFixes_doStartup(reblogQuoteFit, wrapTags) {
   var css = document.createElement("style");
   css.setAttribute("type","text/css");
   var data = '';
   if (reblogQuoteFit == 1)
      data += "div.post_content blockquote { margin-left:0 !important; padding-left:10px !important; } ";
   if (wrapTags == 1)
      data += "span.tags { display:inline !important; white-space:normal !important; }";
   css.innerHTML = data;
   document.getElementsByTagName("head")[0].appendChild(css);
}
