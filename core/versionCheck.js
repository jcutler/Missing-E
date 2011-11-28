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

(function(){

MissingE.utilities.versionCheck = {
   
   run: function() {
      if (this.uptodate) {
         document.getElementById('uptodate').style.display = 'inline-block';
      }
      else {
         document.getElementById('notuptodate').style.display = 'inline-block';
      }
   },

   init: function() {
      var versiondiv = document.getElementById('versioncheck');
      if (versiondiv) {
         var ver = versiondiv.getAttribute('version');
         extension.sendRequest("version", {v: ver}, function(response) {
            MissingE.utilities.versionCheck.uptodate = response.uptodate;
            MissingE.utilities.versionCheck.run();
         });
      }
   }
};

MissingE.utilities.versionCheck.init();

}());
