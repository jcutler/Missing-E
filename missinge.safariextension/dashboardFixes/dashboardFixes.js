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

function addPostLinks() {
   var plwrap = '<li class="short_new_post post new_post" id="new_post"></li>';
   var pltxt = '<div class="short_post_labels">';
   var lang = $('html').attr('lang');
   for (i in locale[lang]["postTypeNames"]) {
      pltxt += '<div class="short_label">' +
               '<a href="/new/' + i + '" class="new_post_label">' +
               locale[lang]["postTypeNames"][i] + '</a></div>';
   }
   pltxt += '<div class="clear"></div></div>';

   var npl = $(plwrap).prependTo('#posts');
   npl.html(pltxt);
   var bg = npl.css('background-image');
   if (!bg || bg === 'none') {
      npl.css('background-color','transparent');
   }
   else {
      npl.css('background-image','none');
   }
}

function doReplies(item) {
   var node = $(item);
   if (item.tagName !== 'LI' ||
       !(node.hasClass('post')) ||
       !(node.hasClass('is_reblog')) ||
       node.hasClass('is_mine')) {
      return;
   }
   var lang = $('html').attr('lang');
   var id = node.attr('id').match(/[0-9]*$/)[0];
   var notes = $('#show_notes_link_' + id);
   if (notes.length === 0) {
      return false;
   }
   var key = notes.attr('onclick')
                  .toString()
                  .match(/display_post_notes\([0-9]+, '([0-9A-Za-z]+)'/);
   if (!key) {
      return false;
   }
   key = key[1];

   notes.after('<a class="MissingE_experimental_reply" href="#" onclick="' +
               'display_reply_pane([' + id + ', \'' + key + '\']);' +
               'return false;" id="post_control_reply_' + id + '" title="' +
               locale[lang]["dashFixesText"]['reply'] + ' [' +
               locale[lang]["dashFixesText"]['experimental'] + ']">[' +
               locale[lang]["dashFixesText"]['reply'] + ']</small></a>');

   notes.after('<span class="MissingE_post_control ' +
               'MissingE_experimental_reply_wait" id="reply_fail_' + id +
               '"></span>');
}

function doIcons(item) {
   if (item.tagName !== 'LI' || !($(item).hasClass('post'))) {
      return false;
   }

   var lang = $('html').attr('lang');
   $(item).find('div.post_controls').addClass('MissingE_post_control_group');
   $(item).find('div.post_controls a').each(function() {
      var a = $(this);
      var txt = a.text();
      var klass = "MissingE_post_control ";
      if (!(/http:\/\/www\.tumblr\.com\/(tumblelog\/[^\/]+\/)?messages/.test(location.href)) &&
          !(/http:\/\/www\.tumblr\.com\/inbox/.test(location.href)) &&
          (/delete_post_/.test(a.attr('onclick')) ||
          /^post_delete_/.test(a.attr('id')))) {
         a.attr('title',locale[lang]["dashFixesText"]["del"])
            .addClass(klass + "MissingE_delete_control").text('');
      }
      else if (/queue_post_/.test(a.attr('onclick'))) {
         a.attr('title',locale[lang]["dashFixesText"]["queue"])
            .addClass(klass + "MissingE_queue_control").text('');
      }
      else if (/^\/edit/.test(a.attr('href'))) {
         a.attr('title',locale[lang]["dashFixesText"]["edit"])
            .addClass(klass + "MissingE_edit_control").text('');
      }
      else if (/^\/reblog/.test(a.attr('href'))) {
         a.attr('title',locale[lang]["dashFixesText"]['reblog'])
            .addClass(klass + "MissingE_reblog_control").text('');
      }
      else if (/^post_control_reply_/.test(a.attr('id'))) {
         var replyTitle = locale[lang]["dashFixesText"]['reply'];
         if (a.hasClass("MissingE_experimental_reply")) {
            klass += "MissingE_experimental_reply_control ";
            replyTitle += " [" + locale[lang]["dashFixesText"]['experimental'] + "]";
         }
         a.attr('title',replyTitle)
            .addClass(klass + "MissingE_reply_control").text('');
      }
      else if (/^show_notes_/.test(a.attr('id')) &&
               a.children().length == 0) {
         a.attr('title',locale[lang]["dashFixesText"]['notes'])
            .addClass(klass + "MissingE_notes_control").text('');
      }
      else if (a.hasClass('reblog_count')) {
         a.attr('title',locale[lang]["dashFixesText"]['notes'])
            .addClass('MissingE_notes_control_container')
            .find('span').each(function() {
            $(this).html($(this).html().replace(/[^0-9]*([0-9,\.]+)[^0-9]*/,
                                                '<span class="notes_txt">' +
                                                "$1" + '</span> ' +
                                                '<span class="' + klass +
                                                ' MissingE_notes_control">' +
                                                '&nbsp;</span>'));
         });
      }
   });
}

function realignReplyNipple(nip) {
   if ($(nip).attr('in_final_position') !== 'true') {
      setTimeout(function() {
         realignReplyNipple(nip);
      }, 500);
      return false;
   }
   var right = $(nip).offsetParent().innerWidth() -
               $(nip).position().left - $(nip).width();
   $(nip).css({left:'auto', right:right+'px'});
}

function addQueueArrows(item) {
   if (item.tagName !== 'LI' ||
       !$(item).hasClass('post') ||
       !$(item).hasClass('queued')) {
      return false;
   }
   var ctrl = $(item).find('div.post_controls');
   if (ctrl.length !== 1) {
      return false;
   }
   if (ctrl.children('a.MissingE_queuearrow_control').length > 0) {
      return false;
   }
   var up = $('<a href="#" onclick="return false;" ' +
     'class="MissingE_queuearrow_control ' +
     'MissingE_queueup_control"></a>')
         .insertAfter(ctrl.children('img:last')).click(function() {
      var qpost = $(this).closest('li.queued');
      if (qpost.length === 1) {
         qpost.detach();
         qpost.insertBefore('#posts li.queued:first');
      }
   });
/**** Only implement up arrow for now
   $('<a href="#" onclick="return false;" ' +
                'class="MissingE_queuearrow_control ' +
                'MissingE_queuedown_control"></a>')
         .insertBefore(up).click(function() {
      var qpost = $(this).closest('li.queued');
      if (qpost.length === 1) {
         qpost.detach();
         qpost.insertAfter('#posts li.queued:last');
      }
   });
****/
}

function addExpandAllHandler(item) {
   var post = $(item);
   if (item.tagName !== 'LI' || !post.hasClass('post')) {
      return false;
   }
   post.find('.inline_image,.inline_external_image').click(function() {
      var me = this;
      if (!$(this).hasClass('exp_inline_image')) {
         $(this).closest('.post').find('.inline_image')
            .addClass('exp_inline_image').removeClass('inline_image');
         $(this).closest('.post').find('.inline_external_image')
               .each(function() {
            if (this === me) { return; }
            var x = this;
            var imgsrc = $(this).attr('onclick').match(/this,'([^']*)'/)[1];
            if (!$(this).hasClass('enlarged')) {
               $(this).attr('original_src',this.src);
               $(this).addClass('enlarged');
               if (this.hasAttribute('loader')) {
                  this.src = $(this).attr('loader');
               }
               var img = new Image();
               img.onload = function() {
                  x.src = imgsrc;
               };
               img.src = imgsrc;
            }
            $(this).addClass('exp_inline_image');
         });
         $(this).addClass('exp_inline_image');
         if (!$(this).hasClass('inline_external_image')) {
            $(this).removeClass('inline_image');
         }
      }
      else {
         $(this).closest('.post').find('.exp_inline_image').each(function() {
            $(this).removeClass('exp_inline_image');
            if (!$(this).hasClass('inline_external_image')) {
               $(this).addClass('inline_image');
            }
            else {
               if (this === me) { return; }
               if ($(this).hasClass('enlarged')) {
                  this.src = $(this).attr('original_src');
                  $(this).removeClass('enlarged');
               }
            }
         });
      }
   });
}

function MissingE_dashboardFixes_doStartup(experimental, reblogQuoteFit,
                                           wrapTags, replaceIcons,
                                           timeoutAJAX, timeoutLength,
                                           postLinks, reblogReplies,
                                           widescreen, queueArrows,
                                           expandAll, followingLink) {
   if (window.top !== window) { return false; }

   document.addEventListener('DOMNodeInserted', function(e) {
      var node = $(e.target);
      if (e.target.tagName === 'LI' && node.hasClass('post')) {
         if ($('#posts li.post[id="' + node.attr('id') + '"]').length > 1) {
            node.remove();
         }
      }
   }, false);

   $('a.like_button').live('click', function(e) {
      e.preventDefault();
   });

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
   if (expandAll === 1) {
      $('#posts .post').each(function(){ addExpandAllHandler(this); });
      document.addEventListener('DOMNodeInserted', function(e) {
         addExpandAllHandler(e.target);
      }, false);
   }
   if (widescreen === 1 &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/settings/
            .test(location.href))) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = safari.extension.baseURI + "dashboardFixes/widescreen.css";
      head.appendChild(style);
      var w = $('#right_column').width() + 20;
      $('head').append('<style type="text/css">' +
                       '#pagination { margin-right:-' + w + 'px; } ' +
                       '#content .tag_page_header { padding-right:' +
                         (w+40) + 'px; }</style>');
      $('#content').css('padding-right', (w+20) + 'px');
      $('#left_column').css('min-height', $('#right_column').height() + 'px');
      document.addEventListener('DOMNodeInserted', function(e) {
         if ($(e.target).closest('#right_column').length > 0) {
            $('#left_column').css('min-height', $('#right_column').height() +
                                  'px');
         }
         $(e.target).children('div.reply_pane:first')
               .each(function() {
            realignReplyNipple($(this).find('div.nipple'));
         });
      }, false);
   }
   if (postLinks === 1 &&
       /http:\/\/www\.tumblr\.com\/dashboard\//.test(location.href) &&
       $('#new_post').length === 0) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = safari.extension.baseURI + "dashboardFixes/postLinks.css";
      head.appendChild(style);
      addPostLinks();
   }

   var replaceStyle = document.createElement("link");
   replaceStyle.setAttribute('rel','stylesheet');
   replaceStyle.setAttribute('type','text/css');
   replaceStyle.href = safari.extension.baseURI + "dashboardFixes/replaceIcons.css";
   head.appendChild(replaceStyle);
   var icons = safari.extension.baseURI +
               'dashboardFixes/icon_replacements.png';
   $('head').append('<style type="text/css">' +
                 '#posts .post .post_controls .MissingE_post_control {' +
                 'background-image:url("' + icons + '"); }' +
                 '</style>');

   if (experimental === 1 &&
       reblogReplies === 1 &&
       document.body.id !== "tinymce" &&
       document.body.id !== "dashboard_edit_post") {

      $('head').append('<script type="text/javascript">' +
      'Ajax.Responders.register({' +
         'onCreate: function(request) {' +
            'var fail;' +
            'if (request.url === "/reply") {' +
               'if ((fail = document.getElementById(\'reply_fail_\' + request.parameters.post_id))) {' +
                  'fail.className="MissingE_post_control MissingE_experimental_reply_wait";' +
               '}' +
            '}' +
         '},' +
         'onComplete: function(response) {' +
            'var fail;' +
            'if (response.url === "/reply") {' +
               'if ((fail = document.getElementById(\'reply_fail_\' + response.parameters.post_id))) {' +
                  'if (response.transport.status == 200) {' +
                     'fail.className="MissingE_post_control MissingE_experimental_reply_success";' +
                  '}' +
                  'else {' +
                     'fail.className="MissingE_post_control MissingE_experimental_reply_fail";' +
                  '}' +
               '}' +
            '}' +
         '}' +
      '});' +
      '</script>');

      document.addEventListener('DOMNodeInserted', function(e) {
         doReplies(e.target);
      }, false);
      $('#posts li.post').each(function() {
         doReplies(this);
      });
   }

   if (queueArrows === 1 &&
       (/http:\/\/www\.tumblr\.com\/queue/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/queue/
            .test(location.href))) {
      var queueStyle = document.createElement("link");
      queueStyle.setAttribute('rel','stylesheet');
      queueStyle.setAttribute('type','text/css');
      queueStyle.href = safari.extension.baseURI +
                           "dashboardFixes/queueArrows.css";
      head.appendChild(queueStyle);
      var queuearrs = safari.extension.baseURI +
                        'dashboardFixes/queue_arrows.png';
      $('head').append('<style type="text/css">' +
                       '#posts .post .MissingE_queuearrow_control {' +
                       'background-image:url("' + queuearrs + '");' +
                       '"); }</style>');
      $('body').append('<script type="text/javascript">' +
                       'var MissingE_queueMoves = {};' +
                       'document.addEventListener("DOMNodeInserted",' +
                                                  'function(e) {' +
                          'if (e.target.tagName === "LI" && ' +
                               '/queued/.test(e.target.className) && ' +
                               'MissingE_queueMoves[e.target.id]) {' +
                             'delete MissingE_queueMoves[e.target.id];' +
                             'update_publish_on_times();' +
                          '}}, false);' +
                       'document.addEventListener("DOMNodeRemoved",' +
                                                  'function(e) {' +
                          'if (e.target.tagName === "LI" && ' +
                               '/queued/.test(e.target.className)) {' +
                             'var isdragging=false;' +
                             'for (i=0; i<Sortable.sortables.posts.draggables' +
                                    '.length; i++) {' +
                                'if (Sortable.sortables.posts.draggables[i]' +
                                       '.dragging) {' +
                                   'isdragging=true;' +
                                   'break;' +
                                '}' +
                             '}' +
                             'if (!isdragging) {' +
                                'MissingE_queueMoves[e.target.id] = true;' +
                             '}' +
                          '}}, false);</script>');
      document.addEventListener('DOMNodeInserted', function(e) {
         addQueueArrows(e.target);
      }, false);
      $('#posts li.queued').each(function() {
         addQueueArrows(this);
      });
   }

   if (replaceIcons === 1 &&
       document.body.id !== "tinymce" &&
       document.body.id !== "dashboard_edit_post") {
      document.addEventListener('DOMNodeInserted', function(e) {
         doIcons(e.target);
      }, false);

      $("#posts li.post").each(function(i) {
         doIcons(this);
      });
   }

   if (followingLink === 1) {
      $('#right_column a.following').attr('href','/following');
   }

   if (timeoutAJAX === 1) {
      var timeout = timeoutLength * 1000;
      $('head').append('<script type="text/javascript">' +
         'Ajax.Responders.register({' +
            'onCreate: function(request) {' +
               'if (/\\/dashboard\\/[0-9]+\\/[0-9]+\\?lite$/' +
                    '.test(request.url)) {' +
                 'request["timeoutId"] = window.setTimeout(function() {' +
                     'if ((request.transport.readyState >= 1 && ' +
                          'request.transport.readyState <= 3) || ' +
                          '!(/<!-- START POSTS -->/' +
                              '.test(request.transport.responseText))) {' +
                        'request.transport.abort();' +
                        'if (request.options["onFailure"]) {' +
                           'request.options.onFailure(request.transport, ' +
                                                      'request.json);' +
                        '}' +
                     '}' +
                  '}, ' + timeout + ');' +
               '}' +
            '},' +
            'onComplete: function(response){' +
               'if (response["timeoutId"]) {' +
                  'window.clearTimeout(response["timeoutId"]);' +
               '}' +
               'if (response.options["onFailure"] && ' +
                    '(/\\/dashboard\\/[0-9]+\\/[0-9]+\\?lite$/' +
                           '.test(response.url))) {' +
                  'if (request.transport.status === 200 && ' +
                       '!(/<!-- START POSTS -->/' +
                           '.test(response.transport.responseText))) {' +
                     'response.options.onFailure(response.transport, ' +
                                                 'response.json);' +
                  '}' +
               '}' +
            '}' +
         '});' +
         '</script>');
   }
}
