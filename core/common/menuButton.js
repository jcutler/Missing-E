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

MissingE.packages.menuButton = {
   run: function() {
      var bar = document.getElementById("user_tools");
      var logout = document.getElementById("logout_button");

      if (document.body.id === "dashboard_index") {
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
            ot = ot - rcol.offsetTop;
            if (ot > 0) {
               rcol.style.paddingTop = ot + 'px';
            }
         }
      }

      if (bar && logout) {
         var head = document.getElementsByTagName('head')[0];
         var st = document.createElement('style');
         st.setAttribute('type', 'text/css');
         st.textContent = '#header #missinge_button { visibility:hidden; }' +
                        '#header #missinge_button a { background-image:url("' +
                        extension.getURL('identity/missinge_dash.png') +
                        '") !important;}';
         head.appendChild(st);
         extension.insertStyleSheet("core/common/menuButton.css");
         var tab = document.createElement('div');
         tab.className = "tab iconic";
         tab.id = "missinge_button";
         var elnk = document.createElement('a');
         elnk.href = extension.getURL("core/options.html");
         elnk.setAttribute('target', '_blank');
         elnk.setAttribute('title', 'Missing e Settings');
         elnk.textContent = 'Missing e';
         if (extension.isFirefox) {
            elnk.addEventListener('mouseup', function(e) {
               if (e.which === 1 || e.which === 2) {
                  extension.sendRequest("open", {url: "OPTIONS"});
               }
            }, false);
         }
         var upnote = document.createElement('div');
         upnote.id = "missinge_updatenotice";
         upnote.className = "tab_notice";
         var noticeVal = document.createElement('span');
         noticeVal.className = "tab_notice_value";
         noticeVal.textContent = "Update";
         upnote.appendChild(noticeVal);
         var noticeNip = document.createElement('span');
         noticeNip.className = "tab_notice_nipple";
         upnote.appendChild(noticeNip);
         tab.appendChild(elnk);
         tab.appendChild(upnote);
         bar.insertBefore(tab, logout);
         if (extension.isOpera) {
            extension.sendRequest("update");
         }
      }
   },

   init: function() {
      if (extension.isFirefox || extension.isOpera) {
         extension.sendRequest("addMenu", null, function() {
            MissingE.packages.menuButton.run();
         });
      }
      else {
         MissingE.packages.menuButton.run();
      }
   }
};

MissingE.packages.menuButton.init();

}());
