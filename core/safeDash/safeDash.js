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

(function($){

MissingE.packages.safeDash = {

   undoNSFW: function() {
      $('body').removeClass('MissingE_safeDash');
      $('#MissingE_safeDash li:first').removeClass('safeDash_active');
   },

   doNSFW: function() {
      $('body').addClass('MissingE_safeDash');
      $('#MissingE_safeDash li:first').addClass('safeDash_active');
   },

   doHide: function(item) {
      if ($(item).attr('id') === "new_post") { return; }
      $(item).find('div.post_content p img').wrap('<span class="nsfw_span" />');
      $(item).find('div.post_content p strong:empty,' +
                   'div.post_content p em:empty,' +
                   'div.post_content p big:empty').remove();
      item = $(item).find('div.post_content');
      var p = $(item).find('*:first');
      if (p.is('p,ul,ol,blockquote') && p.is(':empty')) {
         p.nextUntil('*:not(:empty)').remove();
         p.remove();
      }
   },

   toggleSafeDash: function() {
      var state = 1-MissingE.getStorage('MissingE_safeDash_state',0);
      MissingE.setStorage('MissingE_safeDash_state',state);
      if (state === 0) {
         MissingE.packages.safeDash.undoNSFW();
      }
      else {
         MissingE.packages.safeDash.doNSFW();
      }
   },

   run: function() {
      var settings = this.settings;
      this.lock = extension.getURL("core/safeDash/lock.png");

      $('#posts li.post').each(function() {
         MissingE.packages.safeDash.doHide(this);
      });
      extension.addAjaxListener(function(type, list) {
         if (type === 'notes') { return; }
         $.each(list, function(i,val) {
            MissingE.packages.safeDash.doHide($('#'+val));
         });
      });

      var sdlnk = '<ul class="controls_section" id="MissingE_safeDash">' +
            '<li class="' +
            (MissingE.getStorage('MissingE_safeDash_state',0) === 1 ?
             'safeDash_active' : '') + '">' +
             '<a href="#" onclick="return false;" id="nsfwctrl">Safe Dash</a>' +
             '</li></ul>';

      var afterer = $('#tracked_tags');
      if (afterer.length === 0) {
         afterer = $('#MissingE_marklist');
      }
      if (afterer.length === 0) {
         afterer = $('#right_column .radar');
      }
      if (afterer.length === 0) {
         afterer = $('#right_column .promo');
      }
      if (afterer.length > 0) {
         afterer.before(sdlnk);
      }
      else {
         $('#right_column').append(sdlnk);
      }

      $('#nsfwctrl').click(MissingE.packages.safeDash.toggleSafeDash);
      if (settings.keyboardShortcut === 1) {
         $(window).keyup(function(e) {
            if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey &&
                !$(e.target).is('input,textarea') && e.which === 88) {
               MissingE.packages.safeDash.toggleSafeDash();
            }
         });
      }

      window.addEventListener('storage', function(e) {
         if (e.key !== 'MissingE_safeDash_state') { return false; }
         var state = MissingE.getStorage('MissingE_safeDash_state',0);
         if (state === 0) {
            MissingE.packages.safeDash.undoNSFW();
         }
         else {
            MissingE.packages.safeDash.doNSFW();
         }
      }, false);
   },

   init: function() {
      if (MissingE.getStorage('MissingE_safeDash_state', 0) === 1) {
         $('body').addClass('MissingE_safeDash');
      }
      extension.sendRequest("settings", {component: "safeDash"},
                            function(response) {
         if (response.component === "safeDash") {
            var i;
            MissingE.packages.safeDash.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.safeDash.settings[i] = response[i];
               }
            }
            MissingE.packages.safeDash.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.safeDash.init();
}

}(jQuery));
