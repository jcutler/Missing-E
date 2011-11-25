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

/*global extension, jQuery, MissingE,
  locale, getLocale */

(function($){

MissingE.packages.massEditor = {
   generateButton: function(type,text,islast) {
      return '<div id="MissingE_selecttype_' + type + '" class="header_button' +
         (islast ? ' last_header_button' : '') + '">' +
         '<button id="MissingE_' + type + '" type="button" ' +
         'class="chrome big_dark"><div class="chrome_button">' +
         '<div class="chrome_button_left"></div>' + text + '<div ' +
         'class="chrome_button_right"></div></div></button></div>';
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
      for (o in locale) {
         if (locale.hasOwnProperty(o) &&
             locale[o].dashFixesText.del === deltext) {
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

      $('#nav .header_button:last')
         .after('<div id="MissingE_selecttype_btn" class="header_button">' +
                 '<button id="MissingE_selecttype" type="button" ' +
                 'class="chrome big_dark"><div class="chrome_button">' +
                 '<div class="chrome_button_left"></div>' +
                 getLocale(lang).select + ' ' +
                 '<img src="http://assets.tumblr.com/images/archive_header_' +
                 'button_arrow.png" width="9" height="6" ' +
                 'style="vertical-align:2px; margin:0 0 0 3px;" />' +
                 '<div class="chrome_button_right"></div></div></button>' +
                 '</div>');

      var i;
      var sbt = $('#MissingE_selecttype_btn');
      var sbtlisttext = '<div id="MissingE_selecttype_list">';
      sbtlisttext += '<div id="MissingE_select_btn" class="header_button">' +
                 '<button id="MissingE_select" type="button" ' +
                 'class="chrome big_dark"><div class="chrome_button">' +
                 '<div class="chrome_button_left"></div>' +
                 getLocale(lang).first100 + '<div ' +
                 'class="chrome_button_right"></div></div></button></div>';
      for (i in getLocale(lang).postTypeNames) {
         if (getLocale(lang).postTypeNames.hasOwnProperty(i)) {
            sbtlisttext += MissingE.packages.massEditor
               .generateButton(i,getLocale(lang).postTypeNames[i]);
         }
      }
      sbtlisttext += MissingE.packages.massEditor
         .generateButton('note', getLocale(lang).askPost, true);
      sbtlisttext += '</div>';
      var sbtlist = $(sbtlisttext).insertAfter(sbt);

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

      $.globalEval('document.getElementById("MissingE_select_btn")' +
                   '.addEventListener("click",function(){ ' +
                   '$$("a.brick.highlighted").each(function(obj){' +
                   '$(obj).removeClassName("highlighted");});' +
                   '$$("a.brick:not(highlighted)").each(function(obj,i){' +
                   'if (i<100) {$(obj).addClassName("highlighted");}});' +
                   'get_selected_post_ids();},false);' +
                   'var MissingE_list=document.getElementById("' +
                   'MissingE_selecttype_list").childNodes; for(var i in ' +
                   'MissingE_list){if(MissingE_list.hasOwnProperty(i) && ' +
                   'MissingE_list[i].tagName=="DIV") { MissingE_list[i]' +
                   '.addEventListener("click",function(){ ' +
                   'var type = this.id.match(/[a-z]*$/);' +
                   'if (type && type.length > 0) { type = type[0]; }' +
                   'else { return; }' +
                   'if (type == "text") { type = "regular"; }' +
                   'else if (type == "chat") { type = "conversation"; }' +
                   'var max = 100-$$("a.brick.highlighted").size();' +
                   '$$("a.brick." + type).each(function(obj,i){' +
                   'if (i<max){$(obj).addClassName("highlighted");}}); ' +
                   'get_selected_post_ids();},false);}}');
   },

   init: function() {
      if (extension.isFirefox) {
         extension.sendRequest("settings", {component: "massEditor"},
                               function() {
            MissingE.packages.massEditor.run();
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
