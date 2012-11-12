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

MissingE.utilities.uploader = {
   
   setupSubmitImage: function() {
      document.getElementById("image").addEventListener('change', function(){
         document.getElementById('upload_image_form').submit();
         document.getElementById('controls').style.display = 'none';
         document.getElementById('loader').style.display = 'inline';
      }, false);
   },

   run: function() {
      image1 = new Image();
      image1.src = 'http://assets.tumblr.com/images/bookmarklet_loader.gif';

      var field = document.getElementById("image");
      if (field) {
         setupSubmitImage();
      }
      else {
         window.addEventListener('load',MissingE.utilities.uploader.setupSubmitImage);
      }

      extension.sendRequest("uploader", function(response) {
         if (response.success) {
            document.getElementById('form_key').value = response.data;
            document.getElementById('upload_image_form').style
               .display = 'block';
         }
      });
   },

   init: function() {
      this.run();
   }
};

MissingE.utilities.uploader.init();

}());
