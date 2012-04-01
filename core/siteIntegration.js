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

MissingE.utilities.siteIntegration = {

   run: function() {
   },

   init: function() {
      window.addEventListener('message', function(e) {
         if (e.data && e.data.MissingE && e.data.src === "site") {
            if (e.data.request === "updated") {
               var versiondiv = document.getElementById('versioncheck');
               if (versiondiv) {
                  var ver = versiondiv.getAttribute('version');
                  extension.sendRequest("updatedCheck", {v: ver}, function(response) {
                     extension.siteMessage({"MissingE":true, "src":"extension",
                                            "response":"updated",
                                            "uptodate":response.uptodate}, e);
                  });
               }
            }
            else if (e.data.request === "options") {
               extension.sendRequest("getOptions", function(response) {
                  extension.siteMessage({"MissingE":true, "src":"extension",
                                         "response":"options",
                                         "options":response.options}, e);
               });
            }
            else if (e.data.request === "extensionInfo") {
               extension.sendRequest("getExtensionInfo", function(response) {
                  extension.siteMessage({"MissingE":true, "src":"extension",
                                         "response":"extensionInfo",
                                         "info":response.info}, e);
               });
            }
         }
      },false);
   }
};

MissingE.utilities.siteIntegration.init();

}());
