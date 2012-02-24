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

MissingE.utilities.warningInfo = {

   run: function() {
      var lang = $('html').attr('lang');
      
      var box = $('#detection_alert:contains("Missing-E")');
      if (box.length === 0) {
         return false;
      }
      
      extension.insertStyle('#detection_alert #MissingE_warningInfo {' +
         'position:absolute;' +
         'font-size:14px;' +
         'line-height:14px;' +
         'bottom:103px;' +
         'margin-bottom:10px;' +
      '}' +
      '#detection_alert #MissingE_warningInfo small {' +
         'font-style:italic;' +
         'color:#888;' +
      '}' +
      '#detection_alert #acknowledgement_subpane {' +
         'bottom:150px !important;' +
         'margin-bottom:0 !important;' +
      '}');
      
      var warningText = MissingE.getLocale(lang).warningLink;
      var infoBox = $('<div />', {id: "MissingE_warningInfo"});
      var infoLink = $('<a href="http://missing-e.com/faq/warning" ' +
                        'target="_blank" />');
      infoLink.text(warningText.link);
      infoBox.append(infoLink).append('<br />')
             .append($('<small />', {text: warningText.subtext}));
      box.find('#acknowledgement_subpane').after(infoBox);
   },

   init: function() {
      MissingE.utilities.warningInfo.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.utilities.warningInfo.init();
}

}(jQuery));
