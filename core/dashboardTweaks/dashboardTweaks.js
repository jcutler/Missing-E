/*
 * 'Missing e' Extension
 *
 * Copyright 2012, Jeremy Cutler
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

(function($){

MissingE.packages.dashboardTweaks = {

   setupMassDeletePost: function(item) {
      if ($('#' + item.id + '_select').length > 0) {
         return;
      }
      var controls = $(item).find('div.post_controls');
      controls.append(' ');
      $('<span />', {"class": "MissingEmassDeleteSpan"})
         .append($('<input />',
                   {type: "checkbox",
                    val: "0",
                    id: item.id + "_select",
                    "class": "MissingEmassDeleteSelect"}))
         .appendTo(controls);
   },

   deletePosts: function(key, lang) {
      var posts = [];
      var count = 0;
      var set = $('#posts li.MissingEmdSelected');
      if (set.length < 1) { return; }
      var remset = set.filter(function() {
         if (count >= 100) { return false; }
         count++;
         return true;
      }).each(function(i) {
         if (i >= 100) { return false; }
         posts.push(this.id.match(/\d+$/)[0]);
      });
      $.ajax({
         type: "POST",
         url: '/delete_posts',
         data: {"post_ids": posts.join(','),
                "form_key": key},
         error: function() {
            alert(MissingE.getLocale(lang).massDelete.postsError);
         },
         success: function() {
            remset.removeClass('MissingEmdSelected').remove();
            MissingE.packages.dashboardTweaks.deletePosts(key, lang);
         }
      });
   },

   addPostLinks: function() {
      var i;
      var plbody = $('<div class="short_post_labels" />');
      var lang = $('html').attr('lang');
      for (i in MissingE.getLocale(lang).postTypeNames) {
         if (MissingE.getLocale(lang).postTypeNames.hasOwnProperty(i)) {
            var plitem = $('<a />',
                           {"class": "new_post_label", href: "/new/" + i,
                            text: MissingE.getLocale(lang).postTypeNames[i]});
            plbody.append($('<div class="short_label" />').append(plitem));
         }
      }
      plbody.append($('<div class="clear" />'));

      var npl = $('<li />', {"class": "short_new_post post new_post",
                             id: "new_post"}).prependTo('#posts');
      npl.append(plbody);
      var bg = npl.css('background-image');
      var bgc = npl.css('background-color');
      npl.css('cssText','background-image:none !important;' +
                        'background-color:' +
                        ((!bg || bg === 'none') ? 'transparent' : bgc) +
                        ' !important;');
   },

   doReplies: function(item) {
      var node = $(item);
      if (item.tagName !== 'LI' ||
          !(node.hasClass('post')) ||
          !(node.hasClass('is_reblog')) ||
          node.hasClass('is_mine') ||
          node.find('.post_controls span.reply_button').length > 0 ||
          node.find('.MissingE_experimental_reply').length > 0) {
         return;
      }
      var lang = $('html').attr('lang');
      var replyTxt = MissingE.getLocale(lang).reply;
      var replyingTxt = MissingE.getLocale(lang).replying;
      var id = node.attr('id').match(/\d*$/)[0];
      var notes = $('#show_notes_link_' + id);
      if (notes.length === 0) {
         return false;
      }
      var key = notes.parent().html()
                     .match(/display_post_notes\(\d+,\s*'(\w+)'/);
      if (!key) {
         return false;
      }
      key = MissingE.escapeHTML(key[1]);
      id = MissingE.escapeHTML(id);
      var expRep = $('<span />',
                     {"class": "post_control MissingE_experimental_reply popover_button reply_button",
                      id: "post_control_reply_" + id,
                      title: MissingE.getLocale(lang).dashTweaksText.reply +
                         " [" + MissingE.getLocale(lang).dashTweaksText.experimental + "]"});
      expRep.attr("label", "[" + MissingE.getLocale(lang).dashTweaksText.reply + "]");
      expRep.append(' ');
      var popover = $('<div />', {"class": "popover popover_gradient popover_post_tools"});
      popover.css('display','none');
      var app = popover;
      var inner = $('<div />', {"class": "popover_inner"});
      app.append(inner);
      app = inner;
      inner = $('<form action="/reply" />')
               .append($('<textarea />', {"name": "reply_text",
                                          "maxlength": "250",
                                          title: "250 max"}))
               .append($('<input />', {"type": "hidden",
                                       "name": "post_id",
                                       val: id}))
               .append($('<input />', {"type": "hidden",
                                       "name": "key",
                                       val: key}));
      app.append(inner);
      app = inner;
      inner = $('<button />', {"class": "chrome blue",
                               text: replyTxt,
                               css: {'width': '100%'}});
      inner.attr('data-label',replyTxt);
      inner.attr('data-label-loading',replyingTxt);
      app.append(inner);
      expRep.append(popover);
      notes.after(expRep);
      var failer = $('<span />',
                     {"class": "post_control " +
                               "MissingE_post_control " +
                               "MissingE_experimental_reply_wait",
                      id: "reply_fail_" + id});
      failer.append($('<span />', {"class": "MissingE_successText"})
                     .append('&nbsp;&#x2714;'));
      failer.append($('<span />',
                        {"class": "MissingE_failText",
                         text: MissingE.getLocale(lang).dashTweaksText.reply})
                     .prepend('&nbsp;').append('&nbsp;'));
      failer.insertAfter(notes);
      notes.after(' ');
      failer.after(' ');
   },

   addExpandAllHandler: function(item) {
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
   },

   styleSorters: function(sorters, order) {
      var buttons = sorters.find(".MissingE_sorterButton");
      if (!order || order === "") {
         buttons.css('opacity','').removeClass("MissingE_descSort");
         var firstBtn = sorters.find(".MissingE_sorterButton:first");
         if (firstBtn.hasClass('MissingE_userSort')) {
            firstBtn.detach()
               .appendTo(sorters.find(".MissingE_sorterContainer"));
         }
      }
      else {
         buttons.css('opacity','1');
         sorters.find(".MissingE_typeSort")
            .toggleClass("MissingE_descSort", /t/.test(order));
         sorters.find(".MissingE_userSort")
            .toggleClass("MissingE_descSort", /u/.test(order));
      }
   },

   unsortList: function(ol) {
      var notes = $(ol);
      var arr = [];
      var list = notes.find('li.MissingE_sortedNote');
      list.each(function() {
         arr[$(this).attr('index')] = this;
      });
      list.detach();
      notes.prepend($(arr));
   },

   sortList: function(ol) {
      var ANSWER=0, REPLY=1, PHOTO=2, REBLOG_COMMENTARY=3,
          REBLOG=4, LIKE=5, OTHER=6;
      var didReverse = false;
      var notes = $(ol);
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
      list.each(function() {
         var entry = [];
         if ($(this).hasClass('answer')) {
            entry[entryOrder.type] = ANSWER;
         }
         else if ($(this).hasClass('photo')) {
            entry[entryOrder.type] = PHOTO;
         }
         else if ($(this).hasClass('reply')) {
            entry[entryOrder.type] = REPLY;
         }
         else if ($(this).hasClass('reblog')) {
            if ($(this).hasClass('with_commentary')) {
               entry[entryOrder.type] = REBLOG_COMMENTARY;
            }
            else {
               entry[entryOrder.type] = REBLOG;
            }
         }
         else if ($(this).hasClass('like')) {
            entry[entryOrder.type] = LIKE;
         }
         else {
            entry[entryOrder.type] = OTHER;
         }
         var username = this.className.match(/(tumblelog|blog)_([^\s]*)/);
         if (username && username.length > 2) {
            entry[entryOrder.user] = username[2];
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
      notes.prepend($(sorted));
   },

   videoThumbnailCycle: function() {
      var preWin = $('#MissingE_preview');
      if (!preWin.is('.MissingE_videoPreview:visible') ||
          preWin.find('img.MissingE_videoThumb').length <= 1) {
         return;
      }
      var currThumb = preWin.find('img.MissingE_visibleThumb');
      if (currThumb.next().length > 0) {
         currThumb.next('.MissingE_videoThumb:first')
            .addClass('MissingE_visibleThumb');
      }
      else {
         preWin.find('img.MissingE_videoThumb:first')
            .addClass('MissingE_visibleThumb');
      }
      currThumb.removeClass('MissingE_visibleThumb');
   },

   showPreviewCount: function(count) {
      if (count === "") { return; }
      var lang = $('html').attr('lang');
      $('#MissingE_preview .count')
         .text(count + " " + MissingE.getLocale(lang).dashTweaksText.notes)
         .fadeIn(600);
   },

   receiveNotes: function(response) {
      var preWin = $('#MissingE_preview');
      if (preWin.length === 0) {
         return;
      }
      if (response.success && preWin.attr('post') === response.pid) {
         MissingE.packages.dashboardTweaks.showPreviewCount(response.data);
      }
   },

   receivePreview: function(response) {
      var preWin = $('#MissingE_preview');
      if (preWin.length === 0) {
         return;
      }
      if (response.success) {
         var doImages = true;
         if (MissingE.packages.dashboardTweaks.videoThumbnailCycleId) {
            window.clearInterval(MissingE.packages.dashboardTweaks
                                    .videoThumbnailCycleId);
         }
         if (preWin.attr('post') === response.pid) {
            var count = $('<span class="count" />').prependTo(preWin);
            if (response.hasOwnProperty("noteCount") &&
                response.noteCount !== "") {
               MissingE.packages.dashboardTweaks
                  .showPreviewCount(response.noteCount);
            }
            else {
               extension.sendRequest("notes", {url: preWin.attr('user'),
                                               pid: response.pid},
                                     MissingE.packages.dashboardTweaks
                                       .receiveNotes);
            }
            var i, limit = 2;
            if (response.type === "text" ||
                response.type === "quote" ||
                response.type === "link" ||
                response.type === "conversation" ||
                response.type === "audio" ||
                response.type === "question") {
               doImages = false;
               preWin.removeClass('MissingE_preview_loading');
               $('<div class="previewIcon" />')
                  .addClass(response.type + 'Preview')
                  .appendTo(preWin);
            }
            else if (response.type === "video") {
               preWin.addClass("MissingE_videoPreview");
               MissingE.packages.dashboardTweaks.videoThumbnailCycleId =
                  window.setInterval(MissingE.packages.dashboardTweaks
                                       .videoThumbnailCycle, 600);
               limit = response.data.length;
               if (response.data.length > 0) {
                  var bgImg = document.createElement('img');
                  bgImg.setAttribute('post', response.pid);
                  bgImg.className = "MissingE_videoPlaceholder";
                  bgImg.style.visibility = "hidden";
                  preWin.append(bgImg);
                  bgImg.onload = function() {
                     if (preWin.attr('post') !== this.getAttribute('post')) {
                        return;
                     }
                  };
                  bgImg.src = response.data[0];
               }
            }
            for (i=0; doImages && i<limit && i<response.data.length; i++) {
               var prevImg = document.createElement('img');
               prevImg.setAttribute('post', response.pid);
               if (response.type === "video") {
                  var klass = "MissingE_videoThumb";
                  if (i==0) { klass += " MissingE_visibleThumb"; }
                  prevImg.className = klass;
               }
               prevImg.style.display = "none";
               preWin.append(prevImg);
               prevImg.onload = function() {
                  if (preWin.attr('post') !== this.getAttribute('post')) {
                     return;
                  }
                  $('#MissingE_preview')
                     .removeClass('MissingE_preview_loading');
                  this.style.display = "inline";
               };
               if (response.type === "photo") {
                  prevImg.src = response.data[i]
                                    .replace(/\d*\.([a-z]+)$/,"100.$1");
               }
               else {
                  prevImg.src = response.data[i];
               }
            }
         }
      }
      else {
         preWin.removeAttr('post').removeClass('MissingE_preview_loading')
            .addClass('MissingE_preview_fail');
      }
   },

   smallIconsZIndex: function(post) {
      var idx = 10000;
      var ctrl = post.find('.post_controls');
      var nextPost = post.next();
      while (nextPost && nextPost.length > 0 && !nextPost.hasClass('post')) {
         nextPost = nextPost.next();
      }
      if (nextPost && nextPost.length > 0 && nextPost.hasClass('post')) {
         var nextCtrl = nextPost.find('.post_controls').css('z-index','auto');
      }
      var overlay = $('#overlay_for_active_menu');
      if (overlay.length === 0) {
         overlay = $('#glass_overlay');
      }
      if (overlay.length > 0) {
         var z = parseInt(overlay.css('z-index'),10);
         if (isNaN(z)) { z = 0; }
         idx = z + 1;
      }
      ctrl.css('z-index',idx);
   },

   navigationSpacer: function() {
      var spacer = $('#MissingE_navSpacer');
      var lastPost = $('#posts li.post').last();
      if (lastPost.length === 0) { return; }
      if (spacer.length === 0) {
         spacer = $('<div />', {id: "MissingE_navSpacer"})
                     .insertAfter('#footer');
      }
      var diff = $('body').innerHeight() - (lastPost.offset().top + 7) -
                 spacer.innerHeight();
      var delta = window.innerHeight - diff;
      delta = delta > 0 ? delta : 0;
      spacer.css('padding-top', delta);
   },

   gotoLastPost: function() {
      var lastPost = $('#posts li.post').last();
      if (lastPost.length > 0) {
         window.scrollTo(0, lastPost.offset().top - 7);
      }
   },

   gotoPost: function(postId) {
      if (/^#post_\d+$/.test(postId)) {
         var post = $(postId);
         if (post.length > 0) {
            if (post.hasClass('MissingE_dummy')) {
               window.scrollTo(0, post.offset().top - 41);
            }
            else {
               window.scrollTo(0, post.offset().top - 7);
            }
         }
      }
   },

   run: function() {
      var settings = this.settings;
      var lang = $('html').attr('lang');

      if (settings.pagedNav === 1 &&
          $('#auto_pagination_loader').length === 0 &&
          /MissingEnav=backwards/.test(location.search)) {
         this.gotoLastPost();
      }

      extension.addAjaxListener(function(type,list) {
         if (type === 'notes') { return; }
         $.each(list, function (i,val) {
            var node = $('#'+val);
            if (node.get(0).tagName === 'LI' && node.hasClass('post')) {
               if ($('#posts li.post[id="' + node.attr('id') + '"]')
                     .length > 1) {
                  node.remove();
               }
            }
         });
      });
      $('#posts a.like_button').live('click', function(e) {
         e.preventDefault();
      });

      if (settings.noExpandAll === 1) {
         $('head').append('<style type="text/css">' +
                          '#posts .post img.inline_external_image_off {' +
                          'cursor:pointer; }' +
                          '#posts .post img.inline_external_image_off' +
                             '.enlarged {' +
                          'cursor:default; width:auto !important;' +
                          'height:auto !important; }');
         $('#posts .post img.inline_external_image, ' +
           '#posts .post img.toggle_inline_image').mousedown(function() {
            var me = $(this);
            var cont = me.closest('.post_content');
            cont.find('.inline_external_image')
               .removeClass('inline_external_image')
               .addClass('inline_external_image_off');
            cont.find('.toggle_inline_image')
               .removeClass('toggle_inline_image')
               .addClass('toggle_inline_image_off');
            if (me.hasClass('inline_external_image_off')) {
               me.removeClass('inline_external_image_off')
                  .addClass('inline_external_image');
            }
            if (me.hasClass('toggle_inline_image_off')) {
               me.removeClass('toggle_inline_image_off')
                  .addClass('toggle_inline_image');
            }
         });
      }

      $('#posts .post_controls .reply_button').live('mouseup',function() {
         var me = $(this);
         if (!me.next().hasClass('MissingE_reply_overlay')) {
            me.after($('<div />', {"class": "MissingE_reply_overlay"}));
         }
      });

      $('#posts .post_controls .reply_button form button').live('click',
            function() {
         var me = $(this).closest('.post_controls');
         me.find('div.MissingE_reply_overlay').remove();
      });

      if (settings.widescreen === 1 &&
          !MissingE.isTumblrURL(location.href, ["settings"])) {
         var w = $('#right_column').width() + 20;
         $('head').append('<style type="text/css">' +
                          '#pagination { margin-right:-' + w + 'px; } ' +
                          '#content .tag_page_header { padding-right:' +
                          (w+40) + 'px; }</style>');
         $('#content').css('padding-right', (w+20) + 'px');
         $('#left_column').css('min-height',
                               $('#right_column').height() + 'px');
      }
      if (settings.postLinks === 1 &&
          MissingE.isTumblrURL(location.href, ["dashboardOnly"]) &&
          $('#new_post').length === 0) {
         MissingE.packages.dashboardTweaks.addPostLinks();
      }

      if (settings.reblogReplies === 1 &&
          document.body.id !== "tinymce" &&
          document.body.id !== "dashboard_edit_post") {

         $('#posts .MissingE_experimental_reply form button').live('click', function() {
            var btn = $(this).closest('.MissingE_experimental_reply');
            btn.removeClass('MissingE_experimental_reply')
               .addClass('MissingE_experimental_reply_wait');
         });
         $('head').append('<script type="text/javascript">' +
         'jQuery(document).ajaxComplete(function(e,xhr, opts){' +
            'var fail, btn;' +
            'var pid=opts.data.replace(/^.*post_id=/,"")' +
                              '.replace(/\&.*$/,"");' +
            'if (opts.url === "/reply") {' +
               'if ((fail = document.getElementById(\'reply_fail_\' + pid))) {' +
                  'if ((btn = document.getElementById(\'post_control_reply_\' + pid))) {' +
                     'btn.style.display="none";' +
                  '}' +
                  'if (xhr.status == 200) {' +
                     'klass="MissingE_experimental_reply_success";' +
                  '}' +
                  'else {' +
                     'klass="MissingE_experimental_reply_fail";' +
                  '}' +
                  'fail.className=fail.className.replace(/MissingE_experimental_reply[^\s]*/,klass);' +
               '}' +
            '}' +
         '});' +
         '</script>');

         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function (i, val) {
               MissingE.packages.dashboardTweaks.doReplies($('#'+val).get(0));
            });
         });
         $('#posts li.post').each(function() {
            MissingE.packages.dashboardTweaks.doReplies(this);
         });
      }

      if (settings.smallIcons === 1) {
         $('#posts .post .post_controls .popover_button')
               .live('mouseover', function() {
            MissingE.packages.dashboardTweaks
               .smallIconsZIndex($(this).closest('.post'));
         });
      }

      if (settings.replaceIcons === 1 &&
          document.body.id !== "tinymce" &&
          document.body.id !== "dashboard_edit_post") {

         $('#posts .post .post_controls a').live('mouseover', function() {
            var item = $(this);
            if (item.attr('title')) { return; }
            if (!MissingE.isTumblrURL(location.href, ["messages"]) &&
                (/delete_post_/.test(item.attr('onclick')) ||
                 /^post_delete_/.test(item.attr('id')) ||
                 (new RegExp(MissingE.getLocale(lang).dashTweaksText.del, "i")
                  .test(item.text())))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText.del);
            }
            else if (/queue_post/.test(item.attr('onclick')) ||
                     (new RegExp(MissingE.getLocale(lang).dashTweaksText.queue,
                                 "i")).test(item.text())) {
               item.attr('title', MissingE.getLocale(lang)
                                    .dashTweaksText.queue);
            }
            else if (/^\/edit/.test(item.attr('href'))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText.edit);
            }
            else if (/publish_post/.test(item.attr('onclick')) ||
                     /approve_post/.test(item.attr('onclick'))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .publish);
            }
            else if (/^ask_answer_link_/.test(item.attr('id'))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .answer);
            }
            else if (/^post_control_reply_/.test(item.attr('id')) &&
                     !item.attr('title')) {
               item.attr('title',
                         MissingE.getLocale(lang).dashTweaksText.reply +
                         (item.hasClass("MissingE_experimental_reply") ?
                          " [" + MissingE.getLocale(lang).dashTweaksText
                                    .experimental + "]" : ""));
            }
         });
      }

      if (settings.pagedNav === 1 &&
          $('#auto_pagination_loader').length === 0) {
         this.navigationSpacer();
         $(window).resize(this.navigationSpacer);
         if (/MissingEnav=backwards/.test(location.search)) {
            this.gotoLastPost();
         }
         window.addEventListener('keydown', function(e) {
            if (e.metaKey || e.shiftKey || e.altKey || e.ctrlKey ||
                $(e.target).is('input,textarea')) {
               return;
            }
            if (e.keyCode === 74 || e.keyCode === 75) {
               MissingE.packages.dashboardTweaks.lastPosition =
                  $(window).scrollTop();
            }
         }, true);
         window.addEventListener('keyup', function(e) {
            if (e.metaKey || e.shiftKey || e.altKey || e.ctrlKey ||
                $(e.target).is('input,textarea')) {
               return;
            }
            if (e.keyCode === 74 || e.keyCode === 75) {
               if (MissingE.packages.dashboardTweaks.lastPosition ===
                     $(window).scrollTop()) {
                  var toBtn = e.keyCode === 74 ? $('#next_page_link') :
                                 $('#previous_page_link');
                  if (toBtn.length === 0) {
                     return;
                  }
                  var toLink = toBtn.get(0).href;
                  if (e.keyCode === 75) {
                     if (/\?/.test(toLink)) {
                        toLink = toLink.replace(/\?/,'?MissingEnav=backwards&');
                     }
                     else {
                        toLink += '?MissingEnav=backwards';
                     }
                  }
                  $.globalEval(
                     'if (!Tumblr.KeyCommands.suspended) {' +
                        'location.href="' + toLink + '";' +
                     '}');
               }
               else {
                  MissingE.packages.dashboardTweaks.lastPosition =
                     $(window).scrollTop();
               }
            }
         }, false);
      }

      if (/^#post_\d+$/.test(location.hash)) {
         this.gotoPost(location.hash);
      }

      if (settings.keyboardShortcut) {
         $(window).keydown(function(e) {
            var myPid;
            // 27 = Esc, 67 = C, 69 = E, 83 = S
            if ((e.keyCode !== 67 && e.keyCode !== 27 && e.keyCode !== 69 &&
                 e.keyCode !== 83) ||
                e.metaKey || e.shiftKey || e.altKey || e.ctrlKey) {
               return;
            }
            if (e.keyCode !== 27 && $(e.target).is('input,textarea')) {
               return;
            }
            if (e.keyCode === 27) {
               myPid = e.target.id.match(/^reply_field_(\d*)$/);
               if (!myPid || myPid.length < 2) { return; }
               myPid = myPid[1];
               e.target.blur();
               return false;
            }
            var currPos = $(window).scrollTop()+7;
            $('#posts li.post:not(#new_post)').each(function() {
               var postPos = this.offsetTop;
               if (postPos === currPos) {
                  myPid = this.id.match(/post_(\d*)/);
                  if (!myPid || myPid.length < 2) { return false; }
                  myPid = myPid[1];
                  var item;
                  if (e.keyCode === 67) {
                     if (settings.smallIcons === 1) {
                        MissingE.packages.dashboardTweaks
                           .smallIconsZIndex($(this));
                     }
                     item = $('#post_control_reply_' + myPid);
                  }
                  else if (e.keyCode === 69) {
                     item = $(this).find('.post_controls a[href^="/edit/"]');
                  }
                  else if (e.keyCode === 83) {
                     item = $(this).find('.MissingEmassDeleteSelect');
                  }
                  if (!item || item.length === 0) { return false; }
                  var clickEvt = document.createEvent("MouseEvent");
                  clickEvt.initMouseEvent("click", true, true, window, 0, 0, 0,
                                          0, 0, false, false, false, false, 0,
                                          null);
                  e.preventDefault();
                  item.get(0).dispatchEvent(clickEvt);
                  return false;
               }
               if (postPos >= currPos) {
                  return false;
               }
            });
         });
      }

      if ((settings.massDelete === 1 &&
           MissingE.isTumblrURL(location.href, ["drafts", "queue", "blog"])) ||
          (settings.randomQueue === 1 &&
           MissingE.isTumblrURL(location.href, ["queue"]))) {
         var doMassDelete = settings.massDelete === 1 &&
            MissingE.isTumblrURL(location.href, ["drafts", "queue", "blog"]);
         var doRandomQueue = settings.randomQueue === 1 &&
            MissingE.isTumblrURL(location.href, ["queue"]);
         var afterguy = $('#dashboard_controls_open_blog');
         var beforeguy;
         if (afterguy.length > 0) {
            beforeguy = afterguy.closest('ul').next();
            if (beforeguy.has('a[href^="/mega-editor"]').length > 0) {
               beforeguy = beforeguy.next();
            }
         }
         else {
            beforeguy = $('#right_column a.posts').closest('ul');
         }
         $('head').append('<style type="text/css">' +
                 '#right_column #MissingEdraftQueueTools a { ' +
                 'background-image:url("' +
                 extension.getURL("core/dashboardTweaks/draftQueueTools.png") +
                 '") !important; }</style>');
         var btns = $('<ul />', {"class": "controls_section",
                                 id: "MissingEdraftQueueTools"});

         if (doRandomQueue) {
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "randomize"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).shuffle}))));
         }
         if (doMassDelete) {
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "select_all"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).massDelete.selectAll}))));
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "deselect_all"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).massDelete.deselectAll}))));
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "delete_selected"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).massDelete.deleteSelected}))));
         }
         btns.insertBefore(beforeguy);

         if (doMassDelete) {
            $('#posts li.post').each(function() {
               MissingE.packages.dashboardTweaks.setupMassDeletePost(this);
            });
            extension.addAjaxListener(function(type,list) {
               if (type === 'notes') { return; }
               $.each(list, function(i, val) {
                  MissingE.packages.dashboardTweaks
                     .setupMassDeletePost($('#'+val).get(0));
               });
            });
         }
         $('.move_to_top').live('click', function() {
            if ($('#posts li:first').attr('id') === "new_post" &&
                $('#posts li.post').length > 1) {
               $('#posts').find('li[id^="photo_reply_container"]').detach()
                  .insertAfter('#posts li.post:not(#new_post):first');
            }
         });
         $('#MissingEdraftQueueTools a').click(function() {
            var btn = $(this);
            if (btn.hasClass('randomize')) {
               var arr = [];
               $('#posts li.queued').each(function() {
                  arr.push(this.id.match(/\d*$/)[0]);
               });
               arr.shuffle();
               $('head').append('<script type="text/javascript">' +
                  'Sortable.setSequence("posts",["' + arr.join('","') + '"]);' +
                  'update_publish_on_times();</script>');
               if ($('#posts li:first').attr('id') === "new_post" &&
                   $('#posts li.post').length > 1) {
                  $('#posts').find('li[id^="photo_reply_container"]').detach()
                     .insertAfter('#posts li.post:not(#new_post):first');
               }
            }
            else if (btn.hasClass('select_all')) {
               $('#posts input.MissingEmassDeleteSelect').each(function() {
                  this.checked = true;
                  $(this).trigger('change');
               });
            }
            else if (btn.hasClass('deselect_all')) {
               $('#posts input.MissingEmassDeleteSelect').each(function() {
                  this.checked = false;
                  $(this).closest('li.post').removeClass('MissingEmdSelected');
               });
            }
            else if (btn.hasClass('delete_selected')) {
               var key = $('#posts input[name="form_key"]:first').val();
               var count = $('#posts li.MissingEmdSelected').length;
               if (count > 0) {
                  var sureMsg = MissingE.getLocale(lang).massDelete.postsConfirm
                                    .replace('#',count);
                  if (MissingE.getLocale(lang).massDelete.confirmReplace) {
                     var countOp = count;
                     switch(MissingE.getLocale(lang).massDelete
                              .confirmReplace.operation[0]) {
                        case "+":
                           countOp += MissingE.getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                        case "-":
                           countOp -= MissingE.getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                        case "%":
                           countOp %= MissingE.getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                     }
                     if (MissingE.getLocale(lang).massDelete
                           .confirmReplace[countOp]) {
                        var r;
                        var repls = MissingE.getLocale(lang).massDelete
                                       .confirmReplace[countOp];
                        for (r in repls) {
                           if (repls.hasOwnProperty(r)) {
                              sureMsg = sureMsg.replace(r,repls[r]);
                           }
                        }
                     }
                  }
                  var sure = confirm(sureMsg);
                  if (sure) {
                     MissingE.packages.dashboardTweaks.deletePosts(key, lang);
                  }
               }
            }
            return false;
         });
         $('input.MissingEmassDeleteSelect').live('change', function() {
            var item = $(this).closest('li.post');
            if (this.checked) {
               item.addClass('MissingEmdSelected');
            }
            else {
               item.removeClass('MissingEmdSelected');
            }
         });
      }

      if (settings.sortableNotes === 1) {
         extension.addAjaxListener(function(type,thelist) {
            if (type !== 'notes') { return; }
            var container = $('#' + thelist[0]);
            var div = container.find('#' + thelist[0]
                                     .replace(/post/,"notes_container"));
            div.prepend('<div class="MissingE_notesSorter">' +
                     MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .sorting.sort) + ': ' +
                     '<div class="MissingE_sorterContainer">' +
                     '<div class="MissingE_sorterButton MissingE_typeSort">' +
                     MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .sorting.type) + ' ' +
                     '<span class="MissingE_upArrow">&uArr;</span>' +
                     '<span class="MissingE_downArrow">&dArr;</span>' +
                     '</div>' +
                     '<div class="MissingE_sorterButton MissingE_userSort">' +
                     MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .sorting.user) + ' ' +
                     '<span class="MissingE_upArrow">&uArr;</span>' +
                     '<span class="MissingE_downArrow">&dArr;</span>' +
                     '</div></div>' +
                     '<div class="MissingE_sorterButton MissingE_unsort">' +
                      MissingE.escapeHTML(MissingE.getLocale(lang)
                                             .sorting.reset) +
                     '</div></div>');
            var node = container.find('ol.notes');
            var list = node.find('li').not('.more_notes_link_container');
            list.each(function(i) {
               $(this).attr('index',i).addClass('MissingE_sortedNote');
            });
            node.data('length',list.length);
            $(div).find(".MissingE_sorterContainer").sortable({
               items: "div",
               cursor: "move",
               axis: "x",
               opacity: 0.6,
               placeholder: 'MissingE_sorterPlaceholder',
               forcePlaceholderSize: true,
               update: function() {
                  var item = $(this);
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
                     MissingE.packages.dashboardTweaks.styleSorters($(this)
                                         .closest('div.MissingE_notesSorter'),
                                         newsortorder);
                     MissingE.packages.dashboardTweaks.sortList(ol);
                  }
               }
            });
         });

         $('#posts ol.notes').live('mouseover', function() {
            var startIndex = $(this).data('length');
            var list = $(this).find('li:not(.MissingE_sortedNote)')
                           .not('.more_notes_link_container');
            if (list.length > 0) {
               list.each(function(i) {
                  $(this).attr('index',startIndex + i)
                     .addClass('MissingE_sortedNote');
               });
               $(this).data('length',startIndex + list.length);
               MissingE.packages.dashboardTweaks.sortList(this);
            }
         });

         $('#posts .MissingE_sorterButton').live('click', function() {
            var item = $(this);
            var ol = item.closest("li.post").find('ol.notes');
            var sortorder = ol.data('sortorder');
            if (item.hasClass('MissingE_unsort')) {
               if (sortorder && sortorder !== "") {
                  ol.data('sortorder','');
                  MissingE.packages.dashboardTweaks
                     .styleSorters($(this).parent(),'');
                  MissingE.packages.dashboardTweaks.unsortList(ol);
               }
            }
            else {
               var m;
               var newsortorder = sortorder;
               if (!sortorder || sortorder === "" ||
                   !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
                  newsortorder = 'TU';
               }
               else if (item.hasClass('MissingE_typeSort')) {
                  m = sortorder.match(/.*([tT]).*/);
                  newsortorder = m[0].replace(/[tT]/,m[1] === "t" ? "T" : "t");
               }
               else if (item.hasClass('MissingE_userSort')) {
                  m = sortorder.match(/.*([uU]).*/);
                  newsortorder = m[0].replace(/[uU]/,m[1] === "u" ? "U" : "u");
               }
               if (newsortorder !== sortorder) {
                  ol.data('sortorder',newsortorder);
                  MissingE.packages.dashboardTweaks
                     .styleSorters($(this).closest('div.MissingE_notesSorter'),
                                   newsortorder);
                  MissingE.packages.dashboardTweaks.sortList(ol);
               }
            }
         });
      }

      if (settings.notePreview === 1) {
         $('body').append($('<div />', { id: "MissingE_preview" }));
         $('#posts li.notification .hide_overflow > a')
               .live('mouseover', function() {
            var item = $(this);
            var text = item.text();
            var type, noteCount;
            var tid = this.href.match(/^(http[s]?:\/\/[^\/]*)\/post\/(\d+)/);
            if (!tid || tid.length < 3) { return; }
            var url = tid[1];
            tid = tid[2];
            var preWin = $('#MissingE_preview');
            var isNotification = false;
            for (i in MissingE.getLocale(lang).posts) {
               if (MissingE.getLocale(lang).posts.hasOwnProperty(i)) {
                  var len = MissingE.getLocale(lang).posts[i].length;
                  if (text === MissingE.getLocale(lang).posts[i][len-1]) {
                     type = i;
                     isNotification = true;
                     break;
                  }
               }
            }
            if (preWin.attr('post') !== tid && isNotification) {
               preWin.attr('post',tid);
               preWin.attr('user',url);
               preWin.empty()
                  .removeClass('MissingE_videoPreview MissingE_preview_fail')
                  .addClass('MissingE_preview_loading');
               var exPhotoset = $('#photoset_' + tid);
               var exPost = $('#post_' + tid);
               if (exPost.length > 0) {
                  var notes = $('#note_link_current_' + tid);
                  if (notes.length > 0) {
                     noteCount = notes.text().match(/\d+([,\. ]\d+)*/);
                     if (noteCount && noteCount.length >= 1) {
                        noteCount = noteCount[0];
                     }
                     else {
                        noteCount = "";
                     }
                  }
                  else {
                     noteCount = "";
                  }
               }
               else {
                  noteCount = "";
               }
               if (type === "photoset") { type = "photo"; }
               if (type !== "photo" && type !== "video") {
                  MissingE.packages.dashboardTweaks
                     .receivePreview({success: true, pid: tid, type: type,
                                      noteCount: noteCount});
               }
               else if (exPhotoset.length > 0) {
                  var exImgs = [];
                  exPhotoset.find('img').each(function() {
                     exImgs.push(this.src.replace(/http:\/\/\d+\./,'http://'));
                  });
                  MissingE.packages.dashboardTweaks
                     .receivePreview({success: true, pid: tid, data: exImgs,
                                      type: "photo", noteCount: noteCount});
               }
               else if (exPost.length > 0 &&
                        type === 'photo') {
                  var exImg = exPost.find('div.post_content img:first')
                                 .attr('src');
                  exImg = exImg.replace(/http:\/\/\d+\./,'http://');
                  MissingE.packages.dashboardTweaks
                     .receivePreview({success: true, pid: tid, data: [exImg],
                                      type: "photo", noteCount: noteCount});
               }
               else if (exPost.length > 0 &&
                        type === 'video') {
                  var screenshots;
                  var exSS = exPost.find('#video_thumbnail_' + tid);
                  var embedSS = exPost.find('#video_player_' + tid + ' embed');
                  if (exSS.length > 0 && exSS.attr('thumbnails')) {
                     screenshots = exSS.attr('thumbnails')
                                       .replace(/\s*\|\s*/g,'|').split('|');
                  }
                  else if (exSS.length > 0) {
                     screenshots = [exSS.attr('src')];
                  }
                  else if (embedSS.length > 0) {
                     var flashVars = embedSS.attr('flashvars');
                     if (flashVars) {
                        var posters = flashVars.match(/poster=(http[^'"\(\)&]*)/);
                        if (posters && posters.length > 0) {
                           screenshots = posters[1].replace(/%3A/gi,':')
                                                   .replace(/%2F/gi,'/')
                                                   .split(',');
                        }
                     }
                  }
                  if (!screenshots || screenshots.length === 0) {
                     screenshots =
                        [extension.getURL('core/dashboardTweaks/black.png')];
                  }
                  if (screenshots.length === 1 &&
                      /black_100\.png$/.test(screenshots[0])) {
                     extension.sendRequest("preview",
                            {pid: tid, url: url, type: type},
                            MissingE.packages.dashboardTweaks.receivePreview);
                  }
                  else {
                     MissingE.packages.dashboardTweaks
                        .receivePreview({success: true, pid: tid,
                                         data: screenshots, type: type,
                                         noteCount: noteCount});
                  }
               }
               else {
                  extension.sendRequest("preview",
                            {pid: tid, url: url, type: type},
                            MissingE.packages.dashboardTweaks.receivePreview);
               }
            }
            else if (preWin.attr('post') !== tid) {
               return;
            }
            var offset = item.offset();
            var x = offset.left + (item.width() >> 1) - 50;
            var y = offset.top + item.height();
            preWin.css({
               'display': 'block',
               'left': x + 'px',
               'top': y + 'px'
            });
         });
         $('#posts li.notification .hide_overflow > a')
               .live('mouseout', function() {
            $('#MissingE_preview').hide();
         });
      }
   },

   init: function() {
      extension.sendRequest("settings", {component: "dashboardTweaks"},
                            function(response) {
         if (response.component === "dashboardTweaks") {
            var i;
            MissingE.packages.dashboardTweaks.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.dashboardTweaks.settings[i] = response[i];
               }
            }
            MissingE.packages.dashboardTweaks.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.dashboardTweaks.init();
}

}(jQuery));
