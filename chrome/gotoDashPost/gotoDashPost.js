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

/*global chrome */

var noGoto = true;
var div = document.getElementsByTagName("div")[0];
var controls;
if (div) { controls = div.getElementsByTagName("a"); }

if (!(/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href)) ||
    !(/(%2[fF]|\/)post(%2[fF]|\/)/.test(location.href))) {
   noGoto = false;
}
else {
   var i,j;
   for (i=0; noGoto && i<controls.length; i++) {
      var imgs = controls[i].getElementsByTagName('img');
      for (j=0; j<imgs.length; j++) {
         if (imgs[j].src === chrome.extension.getURL('gotoDashPost/goto.png')) {
            noGoto = false;
            break;
         }
      }
   }
}

if (noGoto) {
   var last = controls[controls.length-1];
   var i;
   var following = false;
   var you = true;
   for (i=0; i<document.forms.length; i++) {
      if (/unfollow$/.test(document.forms[i].action)) {
         following = true;
         last = document.forms[i];
      }
      if (/follow$/.test(document.forms[i].action)) {
         you = false;
         last = document.forms[i];
      }
   }
   if (following || you) {
      var pid = location.href;
      var st = pid.indexOf("pid")+4;
      var en = pid.indexOf("&",st);
      pid = pid.substring(st, en);
      pid = Number(pid)+1;

      var dashlnk = document.createElement('a');
      dashlnk.setAttribute('href', 'http://www.tumblr.com/dashboard/1000/' +
                                    pid + "?lite");
      dashlnk.setAttribute('target', '_top');
      dashlnk.id = "MissingE_gotoDashPost_link";
      var icn = document.createElement('img');
      icn.style.width = '50px';
      icn.style.height='20px';
      icn.style.borderWidth='0';
      icn.style.display='block';
      icn.style.cssFloat='left';
      icn.style.cursor='pointer';
      icn.alt='To Dash';
      icn.setAttribute('src', chrome.extension.getURL('gotoDashPost/goto.png'));
      dashlnk.appendChild(icn);
      div.insertBefore(dashlnk,last);
   }
}
