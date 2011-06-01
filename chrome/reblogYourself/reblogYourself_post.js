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
   var ctrl = document.getElementById('tumblr_controls');
   if (ctrl) {
      var w = ctrl.getAttribute('width');
      if (!w || (!(/%/.test(w)) && w < 380)) {
         ctrl.setAttribute('width',380);
      }
   }
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
   var last = controls[controls.length-1];
   var gdp = document.getElementById('MissingE_gotoDashPost_link');
   if (gdp) {
      last = gdp;
   }
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
			
			var lang = document.getElementsByTagName('html')[0].lang; // This will unfailingly get "en" - the iframe's HTML is labeled as "en" and doesn't change.

      var icon = document.createElement('img');
      icon.style.height='20px';
      icon.style.width='64px';
      icon.style.borderWidth='0';
      icon.style.display='block';
      icon.style.cssFloat='left';
      icon.style.cursor='pointer';
			icon.alt=locale["reblog"][lang];
			if(lang != "jp" && lang != "en"){
	      icon.src='http://assets.tumblr.com/images/iframe_reblog_alpha'+lang+'_'+lang.toUpperCase()+'.png?6';
			}else{
				if(lang == "ja"){
					icon.src='http://assets.tumblr.com/images/iframe_reblog_alpha_ja_JP.png?6';
				}else{
					icon.src='http://assets.tumblr.com/images/iframe_reblog_alpha.png?6'; // English doesn't have suffix (en_EN) or (en_US/UK)
				}
			}

      link.appendChild(icon);
      div.insertBefore(link,last);
   }
}
