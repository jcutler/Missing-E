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

/*global jQuery */

function zindexFixFutureEmbed(item) {
   var val = jQuery(item).val().replace(/wmode="[^"]*"/,'wmode="opaque"');
   jQuery(item).val(val);
}

function zindexFixEmbed(em) {
   var node = jQuery(em).clone();
   node.attr('wmode','opaque').addClass('zindexfixed');
   jQuery(em).replaceWith(node);
}

jQuery('#posts li.post embed').each(function() {
   zindexFixEmbed(this);
});


jQuery('#posts li.post div.video + input:hidden').each(function() {
   zindexFixFutureEmbed(this);
});
document.addEventListener('MissingEajax', function(e) {
   var type = e.data.match(/^[^:]*/)[0];
   var list = e.data.match(/(post_[0-9]+)/g);
   if (type === 'notes') { return; }
   jQuery.each(list, function(i,val) {
      jQuery('#'+val).find('embed').each(function() {
         zindexFixEmbed(this);
      });
      jQuery('#'+val).find('div.video + input:hidden').each(function() {
         zindexFixFutureEmbed(this);
      });
   });
}, false);

