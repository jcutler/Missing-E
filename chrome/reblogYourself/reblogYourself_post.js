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

var div = document.getElementsByTagName("div")[0];
var controls = div.getElementsByTagName("a");
var noReblog = true;

if (!(/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href))) {
   noReblog = false;
}
else {
   var i;
   for (i=0; i<controls.length; i++) {
      if (/reblog/.test(controls[i].href)) {
         noReblog = false;
         break;
      }
   }
}

if (noReblog) {
   var url, redir;
   var loc = location.href;
   loc = loc.substring(loc.indexOf("src=")+4);
   redir = loc.substring(0,loc.indexOf("&"));
   loc = loc.replace(/%3A/gi,":")
            .replace(/%2F/gi,"/");
   url = "http://www.tumblr.com/reblog/";
   if (/&pid=([0-9]*)/.test(loc)) {
      url += loc.match(/&pid=([0-9]*)/)[1] + "/";
      url += loc.match(/&rk=([a-zA-Z0-9]*)/)[1];
      url += '?redirect_to=' + redir;

      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('target', '_top');

      var icon = document.createElement('img');
      icon.style.height='20px';
      icon.style.width='64px';
      icon.style.borderWidth='0';
      icon.style.display='block';
      icon.style.cssFloat='left';
      icon.style.cursor='pointer';
      icon.alt='Reblog';
      icon.src='http://assets.tumblr.com/images/iframe_reblog_alpha.png?6';

      link.appendChild(icon);
      div.insertBefore(link,controls[controls.length-1]);
   }
}
