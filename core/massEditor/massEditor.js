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

/*global extension, jQuery, MissingE */

(function($){

MissingE.packages.massEditor = {
   generateButton: function(type,text,islast) {
      var div = $('<div />',
                  {id: "MissingE_selecttype_" + type,
                   "class": "header_button" +
                            (islast ? " last_header_button" : "")});
      var btn = $('<button />',
                  {id: "MissingE_" + type, type: "button",
                   "class": "chrome big_dark"});
      btn.append($('<div />', {"class": "chrome_button",
                               "text": text})
                  .prepend($('<div class="chrome_button_left" />'))
                  .append($('<div class="chrome_button_right" />')));
      div.append(btn);
      return div;
   },

   moveSelectList: function(s,list) {
      var pos = s.position();
      list.css({
         'left':pos.left + 'px',
         'top':(pos.top + s.height() + 4) + 'px',
         'width':s.width() + 'px'
      });
   },

   run: function() {
      var lang = 'en';
      var deltext = $('#delete_posts').text().toLowerCase();
      var o;
      for (o in MissingE.locale) {
         if (MissingE.locale.hasOwnProperty(o) &&
             MissingE.locale[o].dashTweaksText.del === deltext) {
            lang = o;
            break;
         }
      }

      $('head').append('<style type="text/css">' +
                '#MissingE_selecttype_btn.force_border .chrome_button, ' +
                '#MissingE_selecttype_btn.force_border .chrome_button_left, ' +
                '#MissingE_selecttype_btn.force_border .chrome_button_right, ' +
                '#MissingE_selecttype_list .chrome_button, ' +
                '#MissingE_selecttype_list .chrome_button_left, ' +
                '#MissingE_selecttype_list .chrome_button_right { ' +
                'background-image:url("' +
                extension.getURL('core/massEditor/border.png') +
                '") !important; }</style>');

      var selmenu = $('<div />', {id: "MissingE_selecttype_btn",
                                  "class": "header_button"});
      var selbtn = $('<button />', {id: "MissingE_selecttype", type: "button",
                                    "class": "chrome big_dark"});
      selbtn.append($('<div />', {"class": "chrome_button",
                                  text: MissingE.getLocale(lang).select})
                     .prepend($('<div class="chrome_button_left" />'))
                     .append($('<img src="http://assets.tumblr.com/images/' +
                               'archive_header_button_arrow.png" width="9" ' +
                               'height="6" style="vertical-align:2px;' +
                               'margin:0 0 0 3px;" />'))
                     .append($('<div class="chrome_button_right" />')));
      selmenu.append(selbtn);
      $('#nav .header_button:last').after(selmenu);

      var i;
      var sbt = $('#MissingE_selecttype_btn');
      sbtlist = $('<div id="MissingE_selecttype_list" />');
      sbtlistdiv = $('<div id="MissingE_select_btn" class="header_button" />');
      sbtlistbtn = $('<button />', {id: "MissingE_select", type: "button",
                                    "class": "chrome big_dark"});
      sbtlistbtn.append($('<div />', {"class": "chrome_button",
                                      text: MissingE.getLocale(lang).first100})
                           .prepend($('<div class="chrome_button_left" />'))
                           .append($('<div class="chrome_button_right" />')));
      sbtlistdiv.append(sbtlistbtn);
      sbtlist.append(sbtlistdiv);
      for (i in MissingE.getLocale(lang).postTypeNames) {
         if (MissingE.getLocale(lang).postTypeNames.hasOwnProperty(i)) {
            sbtlist.append(MissingE.packages.massEditor
               .generateButton(i,MissingE.getLocale(lang).postTypeNames[i]));
         }
      }
      sbtlist.append(MissingE.packages.massEditor
         .generateButton('note', MissingE.getLocale(lang).askPost));
      sbtlist.append(MissingE.packages.massEditor
         .generateButton('private', MissingE.getLocale(lang).private, true));
      sbtlist.insertAfter(sbt);

      extension.addAjaxListener(function() {
         MissingE.packages.massEditor.moveSelectList(sbt,sbtlist);
      });
      sbt.click(function() {
         return false;
      }).mouseup(function(e) {
         if (e.which !== 1) { return; }
         if (sbtlist.is(':visible')) {
            sbtlist.hide();
            sbt.removeClass('force_border');
         }
         else {
            MissingE.packages.massEditor.moveSelectList(sbt,sbtlist);
            sbt.addClass('force_border');
            sbtlist.show();
         }
         return false;
      });
      $(window).resize(function() {
         MissingE.packages.massEditor.moveSelectList(sbt,sbtlist);
      });
      $(':not(*[id="MissingE_selecttype_btn"],' +
              '*[id="MissingE_selecttype_btn"] *)').click(function() {
         if (sbtlist.is(':visible')) {
            sbtlist.hide();
            sbt.removeClass('force_border');
         }
      });

      $('#MissingE_selecttype_list > div').click(function() {
         if (this.id === "MissingE_select_btn") {
            $('a.brick.highlighted').removeClass('highlighted');
            $('a.brick:not(.highlighted):lt(100)').addClass('highlighted');
         }
         else if (this.id === "MissingE_selecttype_private") {
            var count = $('a.brick.highlighted').length;
            $('a.brick:not(.highlighted) ' +
              '.private_overlay:lt(' + (100-count) +')')
               .closest('a.brick').addClass('highlighted');
         }
         else {
            var count = $('a.brick.highlighted').length;
            var type = this.id.match(/MissingE_selecttype_(.*)/);
            if (!type || type.length < 2) {
               return false;
            }
            else {
               type = type[1];
            }
            if (type === "text") { type = "regular"; }
            else if (type === "chat") { type = "conversation"; }
            $('a.brick.' + type + ':not(.highlighted):lt(' + (100-count) + ')')
               .addClass('highlighted');
         }
         $.globalEval('get_selected_post_ids();');
         return false;
      });
   },

   init: function() {
      if (extension.isFirefox) {
         extension.sendRequest("settings", {component: "massEditor"},
                               function(response) {
            if (response.component === "massEditor") {
               MissingE.packages.massEditor.run();
            }
         });
      }
      else {
         MissingE.packages.massEditor.run();
      }
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.massEditor.init();
}

}(jQuery));
