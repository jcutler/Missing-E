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

(function($) {

MissingE.utilities.konami = {

   code: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13],

   state: 0,

   run: function() {
      document.addEventListener('keydown', function(e) {
         var key = e.keyCode;
         if (!e.shiftKey ||
             key !== MissingE.utilities.konami
                        .code[MissingE.utilities.konami.state]) {
            MissingE.utilities.konami.state = 0;
         }
         if (!e.shiftKey ||
             key !== MissingE.utilities.konami
                        .code[MissingE.utilities.konami.state]) {
            return;
         }
         MissingE.utilities.konami.state++;
         if (MissingE.utilities.konami.state ===
               MissingE.utilities.konami.code.length) {
            var logo = $('#logo');
            if (logo.attr('oldsrc')) {
               var src = logo.attr('oldsrc');
               logo.attr('oldsrc',logo.attr('src'));
               logo.attr('src',src);
            }
            else {
               logo.attr('oldsrc',logo.attr('src'));
               logo.attr('src',extension.getURL('identity/tumblr-with-e.png'));
            }
            if (logo.attr('src') ===
                  extension.getURL('identity/tumblr-with-e.png')) {
               window.scrollTo(0,0);
            }
         }
      }, false);
   },

   init: function() {
      MissingE.utilities.konami.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.utilities.konami.init();
}

}(jQuery));
