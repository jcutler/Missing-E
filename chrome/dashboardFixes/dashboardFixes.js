/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: GPL-LICENSE.txt
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

/*global chrome, $ */

function doIcons(item) {
   if (item.tagName !== 'LI' || !($(item).hasClass('post'))) {
      return false;
   }
   
   $(item).find('div.post_controls a').each(function() {
      var a = $(this);
      var txt = a.text();
      var klass = "MissingE_post_control ";
      if (/^\s*delete\s*$/.test(txt)) {
         a.attr('title','delete')
            .addClass(klass + "MissingE_delete_control").text('');
      }
      else if (/^\s*edit\s*$/.test(txt)) {
         a.attr('title','edit')
            .addClass(klass + "MissingE_edit_control").text('');
      }
      else if (/^\s*reblog\s*$/.test(txt)) {
         a.attr('title','reblog')
            .addClass(klass + "MissingE_reblog_control").text('');
      }
      else if (/^\s*reply\s*$/.test(txt)) {
         a.attr('title','reply')
            .addClass(klass + "MissingE_reply_control").text('');
      }
      else if (a.hasClass('reblog_count')) {
         a.attr('title','notes').addClass('MissingE_notes_control_container')
            .find('span').each(function() {
            $(this).html($(this).html().replace(/([0-9]+) notes?/,
                                                '<span class="notes_txt">' +
                                                "$1" + '</span> ' +
                                                '<span class="' + klass +
                                                ' MissingE_notes_control">' +
                                                '&nbsp;</span>'));
         });
      }
   });
}

chrome.extension.sendRequest({greeting:"settings", component:"dashboardFixes"},
                             function(response) {
   var dashboardFixes_settings = JSON.parse(response);
   if (dashboardFixes_settings.replaceIcons === 1 &&
       document.body.id !== "tinymce" &&
       document.body.id !== "dashboard_edit_post") {

      var icons = chrome.extension
                     .getURL('dashboardFixes/icon_replacements.png');
      $('head').append('<style type="text/css">' +
                       '#posts .post .post_controls .MissingE_post_control {' +
                       'background-image:url("' + icons + '"); }' +
                       '</style>');
                        

      document.addEventListener('DOMNodeInserted', function(e) {
         doIcons(e.target);
      }, false);

      $("#posts li.post").each(function(i) {
         doIcons(this);
      });
   }
});

