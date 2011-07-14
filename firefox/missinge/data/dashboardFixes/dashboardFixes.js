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
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   for (i in locale[lang]["postTypeNames"]) {
      pltxt += '<div class="short_label">' +
               '<a href="/new/' + i + '" class="new_post_label">' +
               locale[lang]["postTypeNames"][i] + '</a></div>';
   }
   pltxt += '<div class="clear"></div></div>';

   var npl = jQuery(plwrap).prependTo('#posts');
   npl.html(pltxt);
   var bg;
   bg = npl.css('background-image');
   bgc = npl.css('background-color');
   npl.css('cssText', 'background:' +
           ((!bg || bg === 'none') ? 'transparent' : bgc) + ' none !important');
}

function doReplies(item) {
   var node = jQuery(item);
   if (item.tagName !== 'LI' ||
       !(node.hasClass('post')) ||
       !(node.hasClass('is_reblog')) ||
       node.hasClass('is_mine')) {
      return;
   }
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var id = node.attr('id').match(/[0-9]*$/)[0];
   var notes = jQuery('#show_notes_link_' + id);
   if (notes.length === 0) {
      return false;
   }
   var key = notes.parent().html()
               .match(/display_post_notes\([0-9]+, '([0-9A-Za-z]+)'/);

   if (!key) {
      return false;
   }
   key = escapeHTML(key[1]);
   id = escapeHTML(id);
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
   if (item.tagName !== 'LI' || !(jQuery(item).hasClass('post'))) {
      return false;
   }

   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   jQuery(item).find('div.post_controls')
      .addClass('MissingE_post_control_group');
   jQuery(item).find('div.post_controls a').each(function() {
      var a = jQuery(this);
      var txt = a.text();
      var klass = "MissingE_post_control ";
      if (!(/http:\/\/www\.tumblr\.com\/(tumblelog\/[^\/]+\/)?(inbox|messages|submissions)/.test(location.href)) &&
          (/^delete_post_/.test(a.prev().attr('id')) ||
          /^post_delete_/.test(a.attr('id')) ||
          (new RegExp(locale[lang]["dashFixesText"]["del"], "i").test(a.text())))) {
         a.attr('title',locale[lang]["dashFixesText"]["del"])
            .addClass(klass + "MissingE_delete_control").text('');
      }
      else if ((new RegExp(locale[lang]["dashFixesText"]["queue"],
                           "i")).test(a.text())) {
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
            jQuery(this).html(jQuery(this).html()
                              .replace(/[^0-9]*([0-9,\.]+)[^0-9]*/,
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
   if (jQuery(nip).attr('in_final_position') !== 'true') {
      setTimeout(function() {
         realignReplyNipple(nip);
      }, 500);
      return false;
   }
   var right = jQuery(nip).offsetParent().innerWidth() -
               jQuery(nip).position().left - jQuery(nip).width();
   jQuery(nip).css({left:'auto', right:right+'px'});
}

function addQueueArrows(item) {
   if (item.tagName !== 'LI' ||
       !jQuery(item).hasClass('post') ||
       !jQuery(item).hasClass('queued')) {
      return false;
   }
   var ctrl = jQuery(item).find('div.post_controls');
   if (ctrl.length !== 1) {
      return false;
   }
   if (ctrl.children('a.MissingE_queuearrow_control').length > 0) {
      return false;
   }
   var up = jQuery('<a href="#" onclick="return false;" ' +
     'class="MissingE_queuearrow_control ' +
     'MissingE_queueup_control"></a>')
         .insertAfter(ctrl.children('img:last')).click(function() {
      var qpost = jQuery(this).closest('li.queued');
      if (qpost.length === 1) {
         qpost.detach();
         qpost.insertBefore('#posts li.queued:first');
         var evt = document.createEvent("HTMLEvents");
         evt.initEvent("MissingEqueueMove", true, true);
         qpost.get(0).dispatchEvent(evt);
      }
   });
/**** Only implement up arrow for now
   jQuery('<a href="#" onclick="return false;" ' +
                'class="MissingE_queuearrow_control ' +
                'MissingE_queuedown_control"></a>')
         .insertBefore(up).click(function() {
      var qpost = jQuery(this).closest('li.queued');
      if (qpost.length === 1) {
         qpost.detach();
         qpost.insertAfter('#posts li.queued:last');
      }
   });
****/
}

function addExpandAllHandler(item) {
   var post = jQuery(item);
   if (item.tagName !== 'LI' || !post.hasClass('post')) {
      return false;
   }
   post.find('.inline_image,.inline_external_image').click(function() {
      var me = this;
      if (!jQuery(this).hasClass('exp_inline_image')) {
         jQuery(this).closest('.post').find('.inline_image')
            .addClass('exp_inline_image').removeClass('inline_image');
         jQuery(this).closest('.post').find('.inline_external_image')
               .each(function() {
            if (this === me) { return; }
            var x = this;
            var imgsrc = jQuery(this).attr('onclick').match(/this,'([^']*)'/)[1];
            if (!jQuery(this).hasClass('enlarged')) {
               jQuery(this).attr('original_src',this.src);
               jQuery(this).addClass('enlarged');
               if (this.hasAttribute('loader')) {
                  this.src = jQuery(this).attr('loader');
               }
               var img = new Image();
               img.onload = function() {
                  x.src = imgsrc;
               };
               img.src = imgsrc;
            }
            jQuery(this).addClass('exp_inline_image');
         });
         jQuery(this).addClass('exp_inline_image');
         if (!jQuery(this).hasClass('inline_external_image')) {
            jQuery(this).removeClass('inline_image');
         }
      }
      else {
         jQuery(this).closest('.post').find('.exp_inline_image').each(function() {
            jQuery(this).removeClass('exp_inline_image');
            if (!jQuery(this).hasClass('inline_external_image')) {
               jQuery(this).addClass('inline_image');
            }
            else {
               if (this === me) { return; }
               if (jQuery(this).hasClass('enlarged')) {
                  this.src = jQuery(this).attr('original_src');
                  jQuery(this).removeClass('enlarged');
               }
            }
         });
      }
   });
}

self.on('message', function(message) {
   if (message.greeting !== "settings" ||
       message.component !== "dashboardFixes") {
      return false;
   }
   var extensionURL = message.extensionURL;
   document.addEventListener('MissingEajax', function(e) {
      var type = e.data.match(/^[^:]*/)[0];
      var list = e.data.match(/(post_[0-9]+)/g);
      if (type === 'notes') { return; }
      jQuery.each(list, function (i,val) {
         var node = jQuery('#'+val);
         if (node.get(0).tagName === 'LI' && node.hasClass('post')) {
            if (jQuery('#posts li.post[id="' + node.attr('id') + '"]').length >
                  1) {
               node.remove();
            }
         }
      });
   }, false);

/*
   jQuery('a.like_button').live('click', function(e) {
      e.preventDefault();
   });
*/

   var css = document.createElement("style");
   css.setAttribute("type","text/css");
   var data = '';
   var head;
   if (message.reblogQuoteFit === 1) {
      data += "div.post_content blockquote " +
               "{ margin-left:0 !important; padding-left:10px !important; } ";
   }
   if (message.wrapTags === 1) {
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
   if (message.maxBig === 1) {
      var maxSize = message.maxBigSize;
      var i, bigcount = 1;
      var testpost = jQuery('<li style="display:none;" class="regular">' +
                       '<div class="post_content"><p><big></big></p></div>' +
                       '</li>').insertAfter('#posts li.post:first');
      var normal = parseInt(testpost.find('p').css('font-size'));
      var big = testpost.find('big');
      if (normal > maxSize) { maxSize = normal; }
      while (parseInt(big.css('font-size')) < maxSize) {
         big = jQuery('<big></big>').appendTo(big);
         bigcount++;
      }
      testpost.remove();
      var selector = '#posts div.post_content big ';
      for (; bigcount > 1; bigcount--) {
         selector += '> big ';
      }
      jQuery('head').append('<style type="text/css">' +
                       selector + '{ font-size:' + maxSize + 'px; }</style>');
   }
   if (message.expandAll === 1) {
      jQuery('#posts .post').each(function(){ addExpandAllHandler(this); });
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function(i,val) {
            addExpandAllHandler(jQuery('#'+val).get(0));
         });
      }, false);
   }
   if (message.widescreen === 1 &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/settings/
            .test(location.href))) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = extensionURL + "dashboardFixes/widescreen.css";
      head.appendChild(style);
      var w = jQuery('#right_column').width() + 20;
      jQuery('head').append('<style type="text/css">' +
                       '#pagination { margin-right:-' + w + 'px; } ' +
                       '#content .tag_page_header { padding-right:' +
                         (w+40) + 'px; }</style>');
      jQuery('#content').css('padding-right', (w+20) + 'px');
      jQuery('#left_column').css('min-height',
                                 jQuery('#right_column').height() + 'px');
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         /*
         if (jQuery(e.target).closest('#right_column').length > 0) {
            jQuery('#left_column').css('min-height',
                                       jQuery('#right_column').height() + 'px');
         }
         */
         jQuery.each(list, function(i,val) {
            jQuery('#'+val).children('div.reply_pane:first')
               .each(function() {
            realignReplyNipple(jQuery(this).find('div.nipple'));
            });
         });
      }, false);
   }
   if (message.postLinks === 1 &&
       /http:\/\/www\.tumblr\.com\/dashboard\//.test(location.href) &&
       jQuery('#new_post').length === 0) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = extensionURL + "dashboardFixes/postLinks.css";
      head.appendChild(style);
      addPostLinks();
   }

   var replaceStyle = document.createElement("link");
   replaceStyle.setAttribute('rel','stylesheet');
   replaceStyle.setAttribute('type','text/css');
   replaceStyle.href = extensionURL + "dashboardFixes/replaceIcons.css";
   head.appendChild(replaceStyle);
   var icons = extensionURL +
               'dashboardFixes/icon_replacements.png';
   jQuery('head').append('<style type="text/css">' +
                 '#posts .post .post_controls .MissingE_post_control {' +
                 'background-image:url("' + icons + '"); }' +
                 '</style>');

   if (message.experimental === 1 &&
       message.reblogReplies === 1 &&
       document.body.id !== "tinymce" &&
       document.body.id !== "dashboard_edit_post") {

      jQuery('head').append('<script type="text/javascript">' +
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

      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function (i, val) {
            doReplies(jQuery('#'+val).get(0));
         });
      }, false);
      jQuery('#posts li.post').each(function() {
         doReplies(this);
      });
   }

   if (message.queueArrows === 1 &&
       (/http:\/\/www\.tumblr\.com\/queue/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/queue/
            .test(location.href))) {
      var queueStyle = document.createElement("link");
      queueStyle.setAttribute('rel','stylesheet');
      queueStyle.setAttribute('type','text/css');
      queueStyle.href = extensionURL + "dashboardFixes/queueArrows.css";
      head.appendChild(queueStyle);
      var queuearrs = extensionURL + 'dashboardFixes/queue_arrows.png';
      jQuery('head').append('<style type="text/css">' +
                       '#posts .post .MissingE_queuearrow_control {' +
                       'background-image:url("' + queuearrs + '");' +
                       '"); }</style>');
      jQuery('body').append('<script type="text/javascript">' +
                       'document.addEventListener("MissingEqueueMove",' +
                                                  'function(e) {' +
                          'update_publish_on_times();' +
                       '}, false);</script>');
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function(i,val) {
            addQueueArrows(jQuery('#'+val).get(0));
         });
      }, false);
      jQuery('#posts li.queued').each(function() {
         addQueueArrows(this);
      });
   }

   if (message.replaceIcons === 1 &&
       document.body.id !== "tinymce" &&
       document.body.id !== "dashboard_edit_post") {
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function (i,val) {
            doIcons(jQuery('#'+val).get(0));
         });
      }, false);

      jQuery("#posts li.post").each(function(i) {
         if (this.id === "new_post") { return true; }
         doIcons(this);
      });
   }
   if (message.timeoutAJAX === 1) {
      var timeout = message.timeoutLength * 1000;
      jQuery('head').append('<script type="text/javascript">' +
         'Ajax.Responders.register({' +
            'onCreate: function(request) {' +
               'if (/\\/dashboard\\/[0-9]+\\/[0-9]+\\?lite$/' +
                    '.test(request.url) || ' +
                    '/\\/tumblelog\\/[^\\/]*\\/[0-9]+\\?lite$/' +
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
});

self.postMessage({greeting: "settings", component: "dashboardFixes"});
