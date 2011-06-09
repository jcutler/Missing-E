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

self.postMessage({greeting:"addMenu"});

self.on("message", function (message) {
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

   var bar = document.getElementById("user_tools");
   var logout = document.getElementById("logout_button");

   if (bar && logout) {
      var st = document.createElement('style');
      st.setAttribute('type','text/css');
      st.innerHTML = '#header #missinge_button a {' +
                     'background-image:url("' +
                     message.extensionURL + 'missinge_dash.png' +
                     '") !important; background-position:center center; ' +
                     'opacity:0.5; } ' +
                     '#header #missinge_button a:hover {' +
                     'opacity:1; }';
      document.getElementsByTagName('head')[0].appendChild(st);
      var tab = document.createElement('div');
      tab.className = "tab iconic";
      tab.id = "missinge_button";
      var elnk = document.createElement('a');
      elnk.href = message.extensionURL + 'options.html';
      elnk.setAttribute('target','_blank');
      elnk.setAttribute('title','Missing e Settings');
      elnk.innerHTML = 'Missing e';
      elnk.onclick = function(){return false;};
      elnk.addEventListener('mouseup', function(e) {
         if (e.which === 1 || e.which === 2) {
            self.postMessage({greeting: "open", url: "OPTIONS"});
         }
      }, false);
      tab.appendChild(elnk);
      bar.insertBefore(tab, logout);
   }
});
