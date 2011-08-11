/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 2 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

/*global self */

var versiondiv = document.getElementById('versioncheck');
if (versiondiv) {
   var ver = versiondiv.getAttribute('version');
   self.postMessage({greeting: "version", v: ver});
}

self.on('message', function (message) {
   if (message.uptodate) {
      document.getElementById('uptodate').style.display = 'inline-block';
   }
   else {
      document.getElementById('notuptodate').style.display = 'inline-block';
   }
});
