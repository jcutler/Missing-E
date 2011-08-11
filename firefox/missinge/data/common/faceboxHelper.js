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

self.postMessage({greeting: "settings", component: "facebox"});
self.on('message', function(message) {
   if (message.greeting === 'settings' &&
       message.component === 'facebox') {
      jQuery.facebox.settings.closeImage = message.extensionURL +
         'facebox/closelabel.png';
      jQuery.facebox.settings.loadingImage = message.extensionURL +
         'facebox/loading.gif';
      jQuery('#facebox .close_image')
         .attr('src', jQuery.facebox.settings.closeImage);
      if (jQuery('#facebox_style').length === 0) {
         jQuery('head').append('<link id="facebox_style" rel="stylesheet" ' +
                            'type="text/css" href="' + message.extensionURL +
                            'facebox/facebox.css" />');
      }
   }
});
