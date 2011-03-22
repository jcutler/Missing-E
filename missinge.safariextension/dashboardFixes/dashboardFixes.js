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

/*global safari, $ */
var dashFixesText = { en:
                  {
                  edit: "edit",
                  del: "delete",
                  reblog: "reblog",
                  reply: "reply",
                  notes: "notes",
                  queue: "queue"
                  },
               de:
                  {
                  edit: "bearbeiten",
                  del: "löschen",
                  reblog: "rebloggen",
                  reply: "antworten",
                  notes: "anmerkungen",
                  queue: "in die Warteschleife stellen"
                  },
               fr:
                  {
                  edit: "éditer",
                  del: "supprimer",
                  reblog: "rebloguer",
                  reply: "réagir",
                  notes: "notes",
                  queue: "file d'attente"
                  },
               it:
                  {
                  edit: "modifica",
                  del: "elimina",
                  reblog: "reblogga",
                  reply: "rispondi",
                  notes: "note",
                  queue: "file d'attente"
                  }
};

function doIcons(item) {
   if (item.tagName !== 'LI' || !($(item).hasClass('post'))) {
      return false;
   }

   var lang = $('html').attr('lang'); 
   $(item).find('div.post_controls a').each(function() {
      var a = $(this);
      var txt = a.text();
      var klass = "MissingE_post_control ";
      if (/delete_post_/.test(a.attr('onclick')) ||
          /^post_delete_/.test(a.attr('id'))) {
         a.attr('title',dashFixesText[lang]["del"])
            .addClass(klass + "MissingE_delete_control").text('');
      }
      else if (/queue_post_/.test(a.attr('onclick'))) {
         a.attr('title',dashFixesText[lang]["queue"])
            .addClass(klass + "MissingE_queue_control").text('');
      }
      else if (/^\/edit/.test(a.attr('href'))) {
         a.attr('title',dashFixesText[lang]["edit"])
            .addClass(klass + "MissingE_edit_control").text('');
      }
      else if (/^\/reblog/.test(a.attr('href'))) {
         a.attr('title',dashFixesText[lang]['reblog'])
            .addClass(klass + "MissingE_reblog_control").text('');
      }
      else if (/^post_control_reply_/.test(a.attr('id'))) {
         a.attr('title',dashFixesText[lang]['reply'])
            .addClass(klass + "MissingE_reply_control").text('');
      }
      else if (/^show_notes_/.test(a.attr('id')) &&
               a.children().length == 0) {
         a.attr('title',dashFixesText[lang]['notes'])
            .addClass(klass + "MissingE_notes_control").text('');
      }
      else if (a.hasClass('reblog_count')) {
         a.attr('title',dashFixesText[lang]['notes'])
            .addClass('MissingE_notes_control_container')
            .find('span').each(function() {
            $(this).html($(this).html().replace(/([0-9,\.]+) [^0-9]+/,
                                                '<span class="notes_txt">' +
                                                "$1" + '</span> ' +
                                                '<span class="' + klass +
                                                ' MissingE_notes_control">' +
                                                '&nbsp;</span>'));
         });
      }
   });
}

function MissingE_dashboardFixes_doStartup(reblogQuoteFit, wrapTags,
                                           replaceIcons) {
   if (window.top !== window) { return false; }
   var css = document.createElement("style");
   css.setAttribute("type","text/css");
   var data = '';
   var head;
   if (reblogQuoteFit === 1) {
      data += "div.post_content blockquote " +
               "{ margin-left:0 !important; padding-left:10px !important; } ";
   }
   if (wrapTags === 1) {
      data += "span.tags { display:inline !important; " +
               "white-space:normal !important; } " +
               "span.with_blingy_tag a.blingy { " +
               "display:inline-block !important; } " +
               "#posts .post .footer_links.with_tags " +
               "{ overflow:visible !important;}";
   }
   css.innerHTML = data;
   head = document.getElementsByTagName("head")[0];
   if (data !== '') {
      head.appendChild(css);
   }
   if (replaceIcons === 1) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = safari.extension.baseURI + "dashboardFixes/replaceIcons.css";
      head.appendChild(style);

      if (document.body.id !== "tinymce" &&
          document.body.id !== "dashboard_edit_post") {
         var icons = safari.extension.baseURI +
                     'dashboardFixes/icon_replacements.png';
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
   }

   $('head').append('<script type="text/javascript">' +
      'Ajax.Responders.register({' +
         'onCreate: function(request) {' +
            'request["timeoutId"] = window.setTimeout(function() {' +
               'if (request.transport.readyState >= 1 && ' +
                    'request.transport.readyState <= 3) {' +
                  'console.log("TIMEOUT (" + request["timeoutId"] + ")");' +
                  'request.transport.abort();' +
                  'if (request.options["onFailure"]) {' +
                     'request.options.onFailure(request.transport, ' +
                                                'request.json);' +
                  '}' +
               '}' +
            '}, 8000);' +
            'console.log("CREATING TIMEOUT for " + request.url + " (" + request["timeoutId"] + ")");' +
         '},' +
         'onComplete: function(response){' +
            'console.log("DONE " + response.url);' +
            'window.clearTimeout(request["timeoutId"]);' +
            'if ((/\\/dashboard\\/[0-9]+\\/[0-9]+\\?lite$/' +
                  '.test(response.url)) && ' +
                 'response.transport.status === 200 && ' +
                 '!(/<!-- START POSTS -->/' +
                    '.test(response.transport.responseText))) {' +
               'if (request.options["onFailure"]) {' +
                  'response.options.onFailure(request.transport, request.json);' +
               '}' +
            '}' +
         '}' +
      '});' +
      '</script>');
}
