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

(function($) {

MissingE.utilities.konami = {

   code: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],

   state: 0,

   toggleLogo: function(noAnimate) {
      var logo = $('#logo');
      var oldSrc, newSrc;
      if (logo.attr('oldsrc')) {
         var newSrc = logo.attr('oldsrc');
         var oldSrc = logo.css('background-image');
      }
      else {
         var oldSrc = logo.css('background-image');
         var newSrc = "url(" + extension.getURL('identity/tumblr-with-e.png') + ")";
      }
      if (newSrc === "url(" + extension.getURL('identity/tumblr-with-e.png') + ")") {
         newState = 1;
         window.scrollTo(0,0);
      }
      else {
         newState = 0;
      }
      extension.sendRequest("backupVal", {key: "MissingE_konami_active",
                                          val: newState});
      logo.attr('oldsrc',oldSrc);
      var newImg = new Image();
      newImg.onload = function() {
         if (noAnimate) {
            logo.css('width',newImg.width + 'px');
            logo.css('background-image',newSrc);
         }
         else {
            logo.fadeOut(800, function() {
               logo.css('width',newImg.width + 'px');
               logo.css('background-image',newSrc);
               logo.fadeIn(800);
            });
         }
      };
      newImg.src = newSrc.replace(/^url\(/,'').replace(/\)$/,'');
   },

   run: function() {
      document.addEventListener('keydown', function(e) {
         var key = e.keyCode;
         if (key !== MissingE.utilities.konami
                        .code[MissingE.utilities.konami.state]) {
            MissingE.utilities.konami.state = 0;
         }
         if (key !== MissingE.utilities.konami
                        .code[MissingE.utilities.konami.state]) {
            return;
         }
         MissingE.utilities.konami.state++;
         if (MissingE.utilities.konami.state ===
               MissingE.utilities.konami.code.length) {
            MissingE.utilities.konami.toggleLogo();
            MissingE.utilities.konami.state = 0;
         }
      }, false);
   },

   init: function() {
      extension.sendRequest("settings", {component: "konami"},
                            function(response) {
         if (response.component === "konami" && response.active === 1) {
            MissingE.utilities.konami.toggleLogo(true);
         }
      });
      MissingE.utilities.konami.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.utilities.konami.init();
}

}(jQuery));
