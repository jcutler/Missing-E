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

/*global escapeHTML,jQuery,locale,self */

function setupMassDeletePost(item) {
   jQuery('<span class="MissingEmassDeleteSpan">' +
          '<input type="checkbox" val="0" id="' + item.id + '_select" ' +
          'class="MissingEmassDeleteSelect" /></span>')
         .appendTo(jQuery(item).find('div.post_controls'));
}

function deletePosts(key, lang) {
   var posts = [];
   var count = 0;
   var set = jQuery('#posts li.MissingEmdSelected');
   if (set.length < 1) { return; }
   var remset = set.filter(function() {
      if (count >= 100) { return false; }
      count++;
      return true;
   }).each(function(i) {
      if (i >= 100) { return false; }
      posts.push(this.id.match(/[0-9]+$/)[0]);
   });
   jQuery.ajax({
      type: "POST",
      url: '/delete_posts',
      data: {"post_ids": posts.join(','),
             "form_key": key},
      error: function(xhr, textStatus) {
         alert(locale[lang].massDelete.postsError);
      },
      success: function(data, textStatus) {
         remset.removeClass('MissingEmdSelected').remove();
         deletePosts(key, lang);
      }
   });
}

function addPostLinks() {
   var i;
   var plwrap = '<li class="short_new_post post new_post" id="new_post"></li>';
   var pltxt = '<div class="short_post_labels">';
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   for (i in locale[lang].postTypeNames) {
      if (locale[lang].postTypeNames.hasOwnProperty(i)) {
         pltxt += '<div class="short_label">' +
                  '<a href="/new/' + i + '" class="new_post_label">' +
                  locale[lang].postTypeNames[i] + '</a></div>';
      }
   }
   pltxt += '<div class="clear"></div></div>';

   var npl = jQuery(plwrap).prependTo('#posts');
   npl.html(pltxt);
   var bg, bgc;
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
               locale[lang].dashFixesText.reply + ' [' +
               locale[lang].dashFixesText.experimental + ']">[' +
               locale[lang].dashFixesText.reply + ']</small></a>');

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
      var klass = "MissingE_post_control ";
      if (!(/http:\/\/www\.tumblr\.com\/(tumblelog\/[^\/]+\/)?(inbox|messages|submissions)/.test(location.href)) &&
          (/^delete_post_/.test(a.prev().attr('id')) ||
          /^post_delete_/.test(a.attr('id')) ||
          (new RegExp(locale[lang].dashFixesText.del, "i").test(a.text())))) {
         a.attr('title',locale[lang].dashFixesText.del)
            .addClass(klass + "MissingE_delete_control").text('');
      }
      else if ((new RegExp(locale[lang].dashFixesText.queue,
                           "i")).test(a.text())) {
         a.attr('title',locale[lang].dashFixesText.queue)
            .addClass(klass + "MissingE_queue_control").text('');
      }
      else if (/^\/edit/.test(a.attr('href'))) {
         a.attr('title',locale[lang].dashFixesText.edit)
            .addClass(klass + "MissingE_edit_control").text('');
      }
      else if (/^\/reblog/.test(a.attr('href'))) {
         a.attr('title',locale[lang].dashFixesText.reblog)
            .addClass(klass + "MissingE_reblog_control").text('');
      }
      else if (/^post_control_reply_/.test(a.attr('id'))) {
         var replyTitle = locale[lang].dashFixesText.reply;
         if (a.hasClass("MissingE_experimental_reply")) {
            klass += "MissingE_experimental_reply_control ";
            replyTitle += " [" + locale[lang].dashFixesText.experimental + "]";
         }
         a.attr('title',replyTitle)
            .addClass(klass + "MissingE_reply_control").text('');
      }
      else if (/^show_notes_/.test(a.attr('id')) &&
               a.children().length === 0) {
         a.attr('title',locale[lang].dashFixesText.notes)
            .addClass(klass + "MissingE_notes_control").text('');
      }
      else if (a.hasClass('reblog_count')) {
         a.attr('title',locale[lang].dashFixesText.notes)
            .addClass('MissingE_notes_control_container')
            .find('span').each(function() {
            // doesn't need to be sanitizied, pulled straight from existing DOM
            jQuery(this).html(jQuery(this).html()
               .replace(/[^0-9]*([0-9]+([,\.\s][0-9]+)*)[^0-9]*/,
                        '<span class="notes_txt">' + "$1" + '</span> ' +
                        '<span class="' + klass + ' MissingE_notes_control">' +
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

/*
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
*/
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
/*
}
*/

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
            var imgsrc = jQuery(this).attr('onclick')
                  .match(/this,'([^']*)'/)[1];
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
         jQuery(this).closest('.post').find('.exp_inline_image')
               .each(function() {
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

function styleSorters(sorters, order) {
   var buttons = sorters.find(".MissingE_sorterButton")
   if (!order || order === "") {
      buttons.css('opacity','').removeClass("MissingE_descSort");
      var firstBtn = sorters.find(".MissingE_sorterButton:first");
      if (firstBtn.hasClass('MissingE_userSort')) {
         firstBtn.detach().appendTo(sorters.find(".MissingE_sorterContainer"));
      }
   }
   else {
      buttons.css('opacity','1');
      sorters.find(".MissingE_typeSort").toggleClass("MissingE_descSort", /t/.test(order));
      sorters.find(".MissingE_userSort").toggleClass("MissingE_descSort", /u/.test(order));
   }
}

function unsortList(ol) {
   var notes = jQuery(ol);
   var arr = [];
   var list = notes.find('li.MissingE_sortedNote');
   list.each(function() {
      arr[jQuery(this).attr('index')] = this;
   });
   list.detach();
   notes.prepend(jQuery(arr));
}

function sortList(ol) {
   var ANSWER=0, REPLY=1, PHOTO=2, REBLOG_COMMENTARY=3, REBLOG=4, LIKE=5, OTHER=6;
   var didReverse = false;
   var notes = jQuery(ol);
   var sortorder = notes.data('sortorder');
   if (!sortorder || sortorder === "" ||
       !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
      return;
   }
   sortorder = sortorder.split('');
   var arr = [], entryOrder = {}, i;
   var sorted = [];
   var list = notes.find('li.MissingE_sortedNote');
   if (sortorder[0] === "T" || sortorder[0] === "t") {
      entryOrder = {"type":0,"user":1};
   }
   else {
      entryOrder = {"type":1,"user":0};
   }
   list.each(function(i) {
      var entry = [];
      if (jQuery(this).hasClass('answer')) {
         entry[entryOrder.type] = ANSWER;
      }
      else if (jQuery(this).hasClass('photo')) {
         entry[entryOrder.type] = PHOTO;
      }
      else if (jQuery(this).hasClass('reply')) {
         entry[entryOrder.type] = REPLY;
      }
      else if (jQuery(this).hasClass('reblog')) {
         if (jQuery(this).hasClass('with_commentary')) {
            entry[entryOrder.type] = REBLOG_COMMENTARY;
         }
         else {
            entry[entryOrder.type] = REBLOG;
         }
      }
      else if (jQuery(this).hasClass('like')) {
         entry[entryOrder.type] = LIKE;
      }
      else {
         entry[entryOrder.type] = OTHER;
      }
      var username = this.className.match(/tumblelog_([^\s]*)/);
      if (username && username.length > 1) {
         entry[entryOrder.user] = username[1];
      }
      else {
         entry[entryOrder.user] = "";
      }
      entry[2] = this;
      arr.push(entry);
   });
   arr.sort();
   if (/[ut]/.test(sortorder[0])) {
      arr.reverse();
      didReverse = true;
   }
   if ((/[ut]/.test(sortorder[1]) && !didReverse) ||
       (/[UT]/.test(sortorder[1]) && didReverse)) {
      var cType = arr.length > 0 ? arr[0][0] : 0;
      var mid = [];
      for (i=0; i<arr.length; i++) {
         if (arr[i][0] === cType) {
            mid.unshift(arr[i][2]);
         }
         else {
            cType = arr[i][0];
            sorted = sorted.concat(mid);
            mid = [arr[i][2]];
         }
      }
      sorted = sorted.concat(mid);
   }
   else {
      for (i=0; i<arr.length; i++) {
         sorted[i] = arr[i][2];
      }
   }
   list.detach();
   notes.prepend(jQuery(sorted));
}

self.on('message', function(message) {
   if (message.greeting !== "settings" ||
       message.component !== "dashboardFixes") {
      return false;
   }
   var extensionURL = message.extensionURL;
   var lang = jQuery('html').attr('lang');
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

   jQuery('#posts a.like_button').live('click', function(e) {
      e.preventDefault();
   });

   var css = document.createElement("style");
   css.setAttribute("type","text/css");
   var data = '';
   var head;
   if (message.reblogQuoteFit === 1) {
      data += "div.post_content blockquote " +
               "{ margin-left:0 !important; padding-left:10px !important; } ";
   }
   if (message.wrapTags === 1) {
      data += "#posts .post .footer_links.with_tags { " +
               "overflow:visible !important; } " + 
               "#posts .post .footer_links.with_tags span { " +
               "display:inline !important; overflow:visible !important; } " +
               "#posts .post .footer_links.with_tags .source_url { " +
               "display:inline-block !important; " +
               "overflow:hidden !important; } " +
               "span.tags { white-space:normal !important; } " +
               "span.with_blingy_tag a.blingy { " +
               "display:inline-block !important; height:auto !important; }";
   }
   css.innerHTML = data;
   head = document.getElementsByTagName("head")[0];
   if (data !== '') {
      head.appendChild(css);
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
      var linksStyle = document.createElement("link");
      linksStyle.setAttribute('rel','stylesheet');
      linksStyle.setAttribute('type','text/css');
      linksStyle.href = extensionURL + "dashboardFixes/postLinks.css";
      head.appendChild(linksStyle);
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

/*

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
*/
//         var type = e.data.match(/^[^:]*/)[0];
/*
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === 'notes') { return; }
         jQuery.each(list, function(i,val) {
            addQueueArrows(jQuery('#'+val).get(0));
         });
      }, false);
      jQuery('#posts li.queued').each(function() {
         addQueueArrows(this);
      });
*/
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

      jQuery("#posts li.post").each(function() {
         if (this.id === "new_post") { return true; }
         doIcons(this);
      });
   }
/*
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
*/
   if (message.massDelete === 1 &&
       /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(drafts|queue)/
         .test(location.href)) {
      var afterguy = jQuery('#right_column a.settings');
      var beforeguy;
      if (afterguy.length > 0) {
         beforeguy = afterguy.closest('ul').next();
      }
      else {
         beforeguy = jQuery('#right_column a.posts').closest('ul');
         if (beforeguy.length === 0) {
            beforeguy = jQuery('#search_form');
         }
      }
      jQuery('head').append('<link type="text/css" rel="stylesheet" href="' +
                        message.extensionURL + "dashboardFixes/massDelete.css" +
                        '" />').append('<style type="text/css">' +
                        '#right_column #MissingEmassDeleter a { ' +
                        'background-image:url("' +
                        message.extensionURL + "dashboardFixes/massDelete.png" +
                        '") !important; }</style>');
      jQuery('<ul class="controls_section" id="MissingEmassDeleter">' +
        '<li><a href="#" class="select_all">' +
        '<div class="hide_overflow">' +
        locale[lang].massDelete.selectAll + '</div></a></li>' +
        '<li><a href="#" class="deselect_all">' +
        '<div class="hide_overflow">' +
        locale[lang].massDelete.deselectAll + '</div></a></li>' +
        '<li><a href="#" class="delete_selected">' +
        '<div class="hide_overflow">' +
        locale[lang].massDelete.deleteSelected + '</div></a></li></ul>')
            .insertBefore(beforeguy);
      jQuery('#posts li.post').each(function() {
         setupMassDeletePost(this);
      });
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === "notes") { return false; }
         jQuery.each(list, function(i, val) {
            setupMassDeletePost(jQuery('#'+val).get(0));
         });
      }, false);
      jQuery('#MissingEmassDeleter a').click(function() {
         var btn = jQuery(this);
         if (btn.hasClass('select_all')) {
            jQuery('#posts input.MissingEmassDeleteSelect').each(function(){
               this.checked = true;
               jQuery(this).trigger('change');
            });
         }
         else if (btn.hasClass('deselect_all')) {
            jQuery('#posts input.MissingEmassDeleteSelect').each(function() {
               this.checked = false;
               jQuery(this).closest('li.post')
                  .removeClass('MissingEmdSelected');
            });
         }
         else if (btn.hasClass('delete_selected')) {
            var key = jQuery('#posts input[name="form_key"]:first').val();
            var count = jQuery('#posts li.MissingEmdSelected').length;
            if (count > 0) {
               var sureMsg = locale[lang].massDelete.postsConfirm
                                 .replace('#',count);
               if (locale[lang].massDelete.confirmReplace) {
                  var countOp = count;
                  switch(locale[lang].massDelete.confirmReplace.operation[0]) {
                     case "+":
                        countOp += locale[lang].massDelete.confirmReplace.operation[1];
                        break;
                     case "-":
                        countOp -= locale[lang].massDelete.confirmReplace.operation[1];
                        break;
                     case "%":
                        countOp %= locale[lang].massDelete.confirmReplace.operation[1];
                        break;
                  }
                  if (locale[lang].massDelete.confirmReplace[countOp]) {
                     var repls = locale[lang].massDelete.confirmReplace[countOp];
                     for (r in repls) {
                        if (repls.hasOwnProperty(r)) {
                           sureMsg = sureMsg.replace(r,repls[r]);
                        }
                     }
                  }
               }
               var sure = confirm(sureMsg);
               if (sure) {
                  deletePosts(key, lang);
               }
            }
         }
         return false;
      });
      jQuery('input.MissingEmassDeleteSelect').live('change', function() {
         var item = jQuery(this).closest('li.post');
         if (this.checked) {
            item.addClass('MissingEmdSelected');
         }
         else {
            item.removeClass('MissingEmdSelected');
         }
      });
   }

   if (message.sortableNotes) {
      jQuery('head').append('<link type="text/css" rel="stylesheet" href="' +
                     message.extensionURL + "dashboardFixes/notesSorter.css" +
                     '" />');
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type !== 'notes') { return; }
         var container = jQuery('#'+list[0]);
         var div = container.find('#'+list[0].replace(/post/,"notes_container"));
         div.prepend('<div class="MissingE_notesSorter">' +
                     locale[lang].sorting.sort + ': ' +
                     '<div class="MissingE_sorterContainer">' +
                     '<div class="MissingE_sorterButton MissingE_typeSort">' +
                        locale[lang].sorting.type + ' ' +
                        '<span class="MissingE_upArrow">&uArr;</span>' +
                        '<span class="MissingE_downArrow">&dArr;</span>' +
                     '</div>' +
                     '<div class="MissingE_sorterButton MissingE_userSort">' +
                        locale[lang].sorting.user + ' ' +
                        '<span class="MissingE_upArrow">&uArr;</span>' +
                        '<span class="MissingE_downArrow">&dArr;</span>' +
                     '</div>' +
                     '</div>' +
                     '<div class="MissingE_sorterButton MissingE_unsort">' +
                        locale[lang].sorting.reset +
                     '</div></div>');
         var node = container.find('ol.notes');
         var list = node.find('li').not('.more_notes_link_container');
         list.each(function(i) {
            jQuery(this).attr('index',i).addClass('MissingE_sortedNote');
         });
         node.data('length',list.length);
         jQuery(div).find(".MissingE_sorterContainer").sortable({
            items: "div",
            cursor: "move",
            axis: "x",
            opacity: 0.6,
            placeholder: 'MissingE_sorterPlaceholder',
            forcePlaceholderSize: true,
            update: function(e,ui) {
               var item = jQuery(this);
               var ol = item.closest("li.post").find('ol.notes');
               var sortorder = ol.data('sortorder');
               var newsortorder = sortorder;
               if (!sortorder || sortorder === "" ||
                   !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
                  sortorder = 'TU';
               }
               if (item.find('.MissingE_sorterButton:first')
                   .hasClass('MissingE_typeSort')) {
                  newsortorder = sortorder.match(/[tT]/)[0] +
                                 sortorder.match(/[uU]/)[0];
               }
               else {
                  newsortorder = sortorder.match(/[uU]/)[0] +
                                 sortorder.match(/[tT]/)[0];
               }
               if (newsortorder !== sortorder) {
                  ol.data('sortorder',newsortorder);
                  styleSorters(jQuery(this).closest('div.MissingE_notesSorter'),newsortorder);
                  sortList(ol);
               }
            }
         });
      });

      jQuery('#posts ol.notes').live('mouseover', function() {
         var startIndex = jQuery(this).data('length');
         var list = jQuery(this).find('li:not(.MissingE_sortedNote)').not('.more_notes_link_container');
         if (list.length > 0) {
            list.each(function(i) {
               jQuery(this).attr('index',startIndex + i).addClass('MissingE_sortedNote');
            });
            jQuery(this).data('length',startIndex + list.length);
            sortList(this);
         }
      });

      jQuery('#posts .MissingE_sorterButton').live('click', function() {
         var item = jQuery(this);
         var ol = item.closest("li.post").find('ol.notes');
         var sortorder = ol.data('sortorder');
         if (item.hasClass('MissingE_unsort')) {
            if (sortorder && sortorder !== "") {
               ol.data('sortorder','');
               styleSorters(jQuery(this).parent(),'');
               unsortList(ol);
            }
         }
         else {
            var newsortorder = sortorder;
            if (!sortorder || sortorder === "" ||
                !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
               newsortorder = 'TU';
            }
            else if (item.hasClass('MissingE_typeSort')) {
               var m = sortorder.match(/.*([tT]).*/);
               newsortorder = m[0].replace(/[tT]/,m[1] === "t" ? "T" : "t");
            }
            else if (item.hasClass('MissingE_userSort')) {
               var m = sortorder.match(/.*([uU]).*/);
               newsortorder = m[0].replace(/[uU]/,m[1] === "u" ? "U" : "u");
            }
            if (newsortorder !== sortorder) {
               ol.data('sortorder',newsortorder);
               styleSorters(jQuery(this).closest('div.MissingE_notesSorter'),newsortorder);
               sortList(ol);
            }
         }
      });
   }
});

self.postMessage({greeting: "settings", component: "dashboardFixes"});
