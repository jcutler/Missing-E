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

MissingE.packages.betterReblogs = {

   checked: {},

   addAskReblog: function(item) {
      if (item.tagName === "LI" && $(item).hasClass('post') &&
          $(item).hasClass('note')) {
         $(item).find('div.post_controls a.MissingE_betterReblogs_retryAsk')
                  .remove();
         if ($(item).find('div.post_controls a[href^="/reblog"]').length > 0 ||
             $(item).find('div.post_controls a.MissingE_reblog_control')
               .length > 0) {
            return true;
         }
         var tid = $(item).attr("id").match(/\d*$/)[0];
         var perm = $(item).find("a.permalink:first");
         if (perm.length === 0) {
            return;
         }

         extension.sendRequest("betterReblogs",
                               {pid: tid, url: perm.attr("href")},
                               this.receiveAskReblog);
      }
   },

   receiveAskReblog: function(response) {
      var item = $('#post_' + response.pid);
      if (item.find('div.post_controls a[href^="/reblog"]').length > 0) {
         return;
      }
      var perm = item.find("a.permalink:first");
      var tid = response.pid;
      var klass, before, rblnk, txt,i;

      var lang = $('html').attr('lang');
      var question = "";
      var asker = $(item).find(".post_question_asker").text();
      for (i=0; i<MissingE.getLocale(lang).asked.length; i++) {
         if (i>0) {
            question += " ";
         }
         if (MissingE.getLocale(lang).asked[i] === "U") {
            question += asker;
         }
         else {
            question += MissingE.escapeHTML(MissingE.getLocale(lang).asked[i]);
         }
      }
      question += ": " + $(item).find("div.post_question").text()
                           .replace(/\s+/g,' ').replace(/^\s/,'')
                           .replace(/\s$/,'');
      question = encodeURIComponent(question);

      var reblog_text = MissingE.getLocale(lang).reblog;
      before = item.find('div.post_controls a[href^="/edit"]');
      if (before.length === 0) {
         before = item.find('div.post_controls a.MissingE_edit_control');
      }
      if (before.length === 0) {
         before = $('#post_control_reply_' + tid);
      }
      if (before.length === 0) {
         before = $('#show_notes_link_' + tid);
      }
      if (response.success) {
         txt = MissingE.getLocale(lang).reblog;
         rblnk = $('<a />',
                   {title: reblog_text, text: txt,
                    href: "/reblog/" + tid + "/" + response.data +
                          "/text?post%5Bone%5D=" +
                          MissingE.escapeHTML(question) + "&MissingEaskName=" +
                          response.name + "&MissingEaskPost=" +
                          encodeURIComponent(perm.attr("href"))});
         if (before.length === 0) {
            rblnk.prependTo(item.find('div.post_controls')).after(' ');
         }
         else {
            rblnk.insertAfter(before).before(' ');
         }
         item.attr('name', response.name);
         rblnk.trigger('MissingEaddReblog');
      }
      else {
         var reblog_err = MissingE.getLocale(lang).error;
         rblnk = $('<a />',
                   {title: reblog_err,
                    href: "#",
                    click: function() { return false; }});
         rblnk.append($('<del />', {text: reblog_text}));
         if (before.length === 0) {
            rblnk.prependTo(item.find('div.post_controls')).after(' ');
         }
         else {
            rblnk.insertAfter(before).before(' ');
         }
      }
   },

   getTwitterDefaults: function() {
      var options = $('#MissingE_quick_reblog_selector option');
      options.each(function() {
         $.ajax({
            type: "GET",
            url: "http://www.tumblr.com/blog/" + this.value + "/settings",
            dataType: "html",
            tryCount: 0,
            retryLimit: 4,
            blog: this.value,
            error: function(xhr) {
               if (xhr.status < 500) {
                  return;
               }
               else {
                  this.tryCount++;
                  if (this.tryCount <= this.retryLimit) {
                     $.ajax(this);
                     return;
                  }
               }
            },
            success: function(data) {
               var tumblr = this.blog;
               var select = $('#MissingE_quick_reblog_selector select');
               var cb = data.match(/<input[^>]*name="channel\[twitter_send_posts\]"[^>]*>/);
               if (cb && cb.length > 0) {
                  MissingE.packages.betterReblogs
                     .checked[tumblr] = /checked="checked"/.test(cb[0]);
               }
               if (select.val() === tumblr) {
                  select.trigger('change');
               }
            }
         });
      });
   },

   changeQuickReblogAcct: function(sel, twitter) {
      var rm = $('#MissingE_quick_reblog_manual');
      var curhref = rm.attr('href');
      if (/channel_id=/.test(curhref)) {
         rm.attr('href',curhref.replace(/channel_id=[^&]*/,'channel_id=' +
                                        sel.val()));
      }
      else {
         rm.attr('href',curhref + '&channel_id=' + sel.val());
      }
      if (MissingE.packages.betterReblogs.checked[sel.val()] ||
          twitter === "on") {
         $('#MissingE_quick_reblog_twitter input').get(0).checked = true;
      }
      else {
         $('#MissingE_quick_reblog_twitter input').get(0).checked = false;
      }
   },

   setReblogTags: function(tags) {
      localStorage.setItem('tbr_ReblogTags',tags.join(','));
   },

   setReblogTagsPlainText: function(tags) {
      localStorage.setItem('tbr_ReblogTags',tags);
   },

   setTagOverride: function() {
      localStorage.setItem('tbr_OverrideTags','1');
   },

   clearTagOverride: function() {
      localStorage.removeItem('tbr_OverrideTags');
   },

   startReblog: function(id) {
      var lang = $('html').attr('lang');
      var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
      a.attr('oldtxt',a.attr('title'));
      $('#MissingE_quick_reblog').css('display','none');
      a.addClass('MissingE_quick_reblogging')
         .text(MissingE.getLocale(lang).reblogging);
      a.attr('title',MissingE.getLocale(lang).reblogging);
   },

   failReblog: function(id) {
      var lang = $('html').attr('lang');
      var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
      a.removeClass('MissingE_quick_reblogging').text(a.attr('oldtxt'));
      a.attr('title',a.attr('oldtxt'));
      a.removeAttr('oldtxt');
      alert(MissingE.getLocale(lang).reblogFailed);
   },

   finishReblog: function(id) {
      var lang = $('html').attr('lang');
      var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
      a.addClass('MissingE_quick_reblogging_success')
         .addClass('MissingE_quick_reblogging_success')
         .text(MissingE.getLocale(lang).rebloggedText);
      a.attr('title',MissingE.getLocale(lang).rebloggedText);
      a.removeAttr('oldtxt');
   },

   reblogTextFull: function(item) {
      var post = $(item);
      if (item.tagName === 'LI' &&
          post.hasClass('post') &&
          post.hasClass('regular')) {
         post.find('div.post_controls a[href^="/reblog/"]').each(function() {
            if (/\w\?/.test(this.href)) {
               this.setAttribute('href',
                  this.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
            }
         });
      }
      else if (item.tagName === 'A' &&
               post.parent().is('div.post_controls') &&
               post.closest('li.post').hasClass('regular')) {
         if (/[\w]\?/.test(item.href)) {
            item.setAttribute('href',
               item.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
         }
      }
   },

   doReblog: function(item,accountName,queueTags) {
      var reblogMode = {
         "normal":  '0',
         "draft":   '1',
         "queue":   '2',
         "private": 'private'
      };
      var i,isAsk,type,url,postId,perm,user;
      if ($(item).parent().hasClass('post_controls')) {
         type = 'normal';
         url = $(item).attr('href');
         postId = $(item).closest('li.post').attr('id').match(/\d*$/)[0];
      }
      else {
         type = item.id.replace(/MissingE_quick_reblog_/,'');
         if (!type || type === 'manual') { return; }
         url = $(item).siblings('a[href!="#"]').attr('href');
         postId = $(item).parent().attr('id').replace(/list_for_/,'');
      }
      url = location.protocol + '//' + location.host + url;
      url = url.replace(/\?redirect_to=.*$/,'');
      var tags = $('#MissingE_quick_reblog_tags input').val();
      tags = tags.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
               .replace(/\s*,\s*/g,',').replace(/,$/,'')
               .replace(/^\s*/,'').replace(/\s*$/,'');
      var mode = reblogMode[type];
      if (queueTags && queueTags !== "" && type === "queue") {
         var taglist = tags.split(',');
         for (i=0; i<queueTags.length; i++) {
            if ($.inArray(queueTags[i],taglist) === -1) {
               taglist.push(queueTags[i]);
            }
         }
         tags = taglist.join(",");
      }
      isAsk = $('#post_' + postId).hasClass('note');
      perm = $('#permalink_' + postId).attr("href");
      user = $('#post_' + postId).attr("name");
      var twitter = $('#MissingE_quick_reblog_twitter input').is(':checked');
      MissingE.packages.betterReblogs.startReblog(postId);
      $.ajax({
         type: "GET",
         url: url,
         dataType: "html",
         postId: postId,
         tags: tags,
         mode: mode,
         error: function() {
            MissingE.packages.betterReblogs.failReblog(this.postId);
         },
         success: function(data) {
            var i;
            var frm = data.indexOf('<form');
            if (frm === -1) {
               MissingE.packages.betterReblogs.failReblog(this.postId);
               return;
            }
            var html = data.substr(frm);
            while (!(/^<form [^>]*id="edit_post"/.test(html))) {
               html = html.substr(1);
               frm = html.indexOf('<form');
               if (frm === -1) {
                  MissingE.packages.betterReblogs.failReblog(this.postId);
                  return;
               }
               html = html.substr(frm);
            }
            html = html.substr(0,html.indexOf('</form>'));
            var inputs = html.match(/<input[^>]*>/g);
            var textareas = html.match(/<textarea[^>]*>[^<]*<\/textarea>/g);
            var params = {};
            var name;
            for (i=0; i<inputs.length; i++) {
               name = inputs[i].match(/name="([^"]*)"/);
               if (name) {
                  params[name[1]] = $(inputs[i]).val();
               }
            }
            for (i=0; i<textareas.length; i++) {
               name = textareas[i].match(/name="([^"]*)"/);
               if (name && !(/id="custom_tweet"/.test(textareas[i]))) {
                  params[name[1]] = $(textareas[i]).text();
               }
            }
            params["post[tags]"] = this.tags;
            params["post[state]"] = this.mode;
            params["channel_id"] = accountName;
            if (isAsk) {
               if (!perm || perm === "" || !user || user === "") {
                  MissingE.packages.betterReblogs.failReblog(this.postId);
                  return;
               }
               params["post[two]"] = '<p><a href="' + perm + '" ' +
                 'class="tumblr_blog">' + user + '</a>:</p><blockquote>' +
                 params["post[two]"] + '</blockquote>';
            }
            if (!twitter) {
               delete params["send_to_twitter"];
            }
            else {
               params["send_to_twitter"] = "on";
            }
            delete params["preview_post"];
            $.ajax({
               type: 'POST',
               url: this.url,
               postId: this.postId,
               data: params,
               error: function() {
                  MissingE.packages.betterReblogs.failReblog(this.postId);
               },
               success: function(txt) {
                  if (/<body[^>]*id="dashboard_edit_post"/.test(txt) &&
                      /<ul[^>]*id="errors"[^>]*>/.test(txt)) {
                     MissingE.packages.betterReblogs.failReblog(this.postId);
                  }
                  else {
                     MissingE.packages.betterReblogs.finishReblog(this.postId);
                  }
               }
            });
         }
      });
   },

   run: function() {
      var lang = $('html').attr('lang');
      var settings = this.settings;
      var queueTags = "";
      if (settings.tagQueuedPosts === 1) {
         queueTags = settings.queueTags;
      }
      if (settings.passTags === 1) {
         var selector = '#posts div.post_controls a[href^="/reblog/"]';
         if (settings.quickReblog === 1) {
            selector = '#MissingE_quick_reblog_manual';
         }
         $(selector).live('mousedown', function() {
            var tags;
            var isManual = this.id === 'MissingE_quick_reblog_manual';
            if (isManual && settings.autoFillTags === 1) {
               tags = $('#MissingE_quick_reblog_tags input').val();
               tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
                        .replace(/^\s*/,'');
               MissingE.packages.betterReblogs.setReblogTagsPlainText(tags);
               MissingE.packages.betterReblogs.setTagOverride();
            }
            else {
               if (isManual) {
                  var postId = $(this).parent().attr('id')
                                 .replace(/list_for_/,'');
                  tags = $('#post_' + postId).find('span.tags a');
               }
               else {
                  tags = $(this).closest('li.post').find('span.tags a');
               }
               var tagarr = [];
               if (MissingE.isTumblrURL(location.href, ["tagged"])) {
                  var i;
                  var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
                  str = str.replace(/\?/,'').replace(/\+/,' ');
                  var entities = str.match(/%[\dA-F]{2}/gi);
                  if (entities !== undefined && entities !== null) {
                     for (i=0; i<entities.length; i++) {
                        var repl = String.fromCharCode(parseInt(entities[i]
                                                         .replace(/%/,''),16));
                        str = str.replace(entities[i],repl);
                     }
                  }
                  tagarr.push(str);
               }
               tags.each(function() {
                  if (/http:\/\/[^\/]*\/ask/.test(this.href)) {
                     return true;
                  }
                  tagarr.push($(this).text().replace(/^#/,''));
               });
               MissingE.packages.betterReblogs.setReblogTags(tagarr);
               if (isManual) {
                  MissingE.packages.betterReblogs.setTagOverride();
               }
               else {
                  MissingE.packages.betterReblogs.clearTagOverride();
               }
            }
         });
      }
      if (settings.fullText === 1) {
         $('#posts li.post.regular').each(function() {
            MissingE.packages.betterReblogs.reblogTextFull(this);
         });
         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function(i, val) {
               MissingE.packages.betterReblogs
                  .reblogTextFull($('#'+val).get(0));
            });
         });
         $('#posts div.post_controls a').live('MissingEaddReblog', function(){
            MissingE.packages.betterReblogs.reblogTextFull(this);
         });
      }
      if (settings.reblogAsks === 1) {
         $('#posts li.post div.post_controls ' +
           'a.MissingE_betterReblogs_retryAsk').live('click', function() {
            var post = $(this).closest('li.post');
            if (post.length === 1) {
               MissingE.packages.betterReblogs
                  .addAskReblog($(this).parents('li.post').get(0));
            }
         });
         $('#posts li.post').each(function(){
            MissingE.packages.betterReblogs.addAskReblog(this);
         });
         extension.addAjaxListener(function(type,list) {
            if (type !== 'posts') { return; }
            $.each(list, function(i,val) {
               MissingE.packages.betterReblogs.addAskReblog($('#'+val).get(0));
            });
         });
      }
      if (settings.quickReblog === 1) {
         var idx;

         var txt = '<div class="user_menu" id="MissingE_quick_reblog">' +
                    '<div class="user_menu_nipple"></div>' +
                    '<div class="user_menu_list">';
         for (idx=0; idx<MissingE.getLocale(lang).reblogOptions.length; idx++) {
            var doonclick = 'onclick="return false;"';
            if (MissingE.getLocale(lang).reblogOptions[idx].item === 'manual') {
               doonclick = '';
            }
            txt += '<a class="MissingE_quick_reblog_button" ' +
                    'id="MissingE_quick_reblog_' +
                    MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .reblogOptions[idx].item) +
                    '" href="#" ' + doonclick + '>' +
                    '<div class="user_menu_list_item">' +
                    MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .reblogOptions[idx].text) +
                    '</div></a>';
         }
         var node = extension.isFirefox ?
               ['<span class="MissingE_quick_reblog_field">',
                '</span>'] :
               ['<a href="#" onclick="return false;" ' +
                      'class="MissingE_quick_reblog_field">',
                '</a>'];
         txt +=  node[0] +
                  '<div class="user_menu_list_item has_tag_input">' +
                  '<div id="MissingE_quick_reblog_twitter">' +
                  '<input type="checkbox" /> ' +
                  MissingE.escapeHTML(MissingE.getLocale(lang).twitterText) +
                  '</div></div>' + node[1];
         var list = $('#user_channels li');
         if (list.length > 0) {
            txt +=  node[0] +
                     '<div class="user_menu_list_item has_tag_input">' +
                     '<div id="MissingE_quick_reblog_selector">' +
                     '<select>';
            list.each(function(i) {
               var acct = this.id.match(/tab-(.*)/);
               if (!acct) { return; }
               acct = acct[1];
               var sel = false;
               if ((settings.accountName === 0 &&
                    i === 0) ||
                   settings.accountName === acct) {
                  sel = true;
               }
               txt += '<option value="' + MissingE.escapeHTML(acct) + '"' +
                        (sel ? ' selected="selected"' : '') + '>' +
                        MissingE.escapeHTML(acct) + '</option>';
            });
            txt +=  '</select><br />Tumblr</div></div>' + node[1];
         }
         txt += node[0] + '<div class="user_menu_list_item has_tag_input">' +
                  '<div id="MissingE_quick_reblog_tags">' +
                  '<input type="text" /><br />' +
                  MissingE.escapeHTML(MissingE.getLocale(lang).tagsText) +
                  '</div></div>' + node[1];
         var qr = $(txt).appendTo('body');
         qr.find('#MissingE_quick_reblog_selector select').click(function(e) {
            e.stopPropagation();
            return false;
         }).change(function() {
            MissingE.packages.betterReblogs
               .changeQuickReblogAcct($(this),
                                      settings.quickReblogForceTwitter);
         });
         qr.mouseover(function(e){
            if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
                !$.contains(qr.get(0), e.relatedTarget) &&
                !$(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
               qr.removeData('off');
            }
         }).mouseout(function(e){
            if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
                !$.contains(qr.get(0), e.relatedTarget) &&
                !$(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
               $(this).css('display','');
               if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
                  qr.data('off','off');
               }
               else {
                  MissingE.packages.betterReblogs.resetTumblr =
                        setTimeout(function() {
                     var sel = $('#MissingE_quick_reblog_selector select');
                     if (sel.find('option[value="' + settings.accountName +
                                  '"]').length > 0) {
                        sel.val(settings.accountName);
                     }
                     else {
                        sel.val(sel.find('option:first').val());
                     }
                     sel.trigger('change');
                  }, 1000);
               }
            }
         });
         qr.find('#MissingE_quick_reblog_tags input').focus(function() {
            qr.addClass('MissingE_quick_reblog_tags_inputting');
            var taginput = this;
            if (extension.isSafari || extension.isFirefox) {
               $(document).bind('keydown.MissingEqr', function(e) {
                  if (e.keyCode === 27) {
                     taginput.blur();
                     return true;
                  }
               });
            }
         }).blur(function() {
            if (extension.isSafari || extension.isFirefox) {
               $(document).unbind('keydown.MissingEqr');
            }
            qr.removeClass('MissingE_quick_reblog_tags_inputting');
            if (qr.data('off')) {
               qr.removeData('off');
               var sel = $('#MissingE_quick_reblog_selector select');
               if (sel.find('option[value="' + settings.accountName +
                            '"]').length > 0) {
                  sel.val(settings.accountName);
               }
               else {
                  sel.val(sel.find('option:first').val());
               }
               sel.trigger('change');
            }
         }).keydown(function(e) {
            if (e.which >= 65 || e.which <= 90 ||
                e.which === 37 || e.which === 39) {
               e.stopPropagation();
            }
         });
         $('#posts div.post_controls a[href^="/reblog/"]')
               .live('mouseover',function(e) {
            var reblog = $(this);
            reblog.addClass('MissingE_quick_reblog_main');
            if (reblog.hasClass('MissingE_quick_reblogging') ||
                reblog.hasClass('MissingE_quick_reblogging_success')) {
               return;
            }
            clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
            var pos = reblog.offset();
            var h = reblog.outerHeight() - 2;
            var w = (qr.outerWidth()>>1) - (reblog.innerWidth()>>1);
            var marg = parseInt($('body').css('margin-top'), 10);
            if (isNaN(marg)) { marg = 0; }
            var tagarr = [];
            if (settings.passTags === 1 &&
                settings.autoFillTags === 1) {
               var tags = reblog.closest('li.post').find('span.tags a');
               if (MissingE.isTumblrURL(location.href, ["tagged"])) {
                  var i;
                  var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
                  str = str.replace(/\?/,'').replace(/\+/,' ');
                  var entities = str.match(/%[\dA-F]{2}/gi);
                  if (entities !== undefined && entities !== null) {
                     for (i=0; i<entities.length; i++) {
                        var repl = String.fromCharCode(parseInt(entities[i]
                                                         .replace(/%/,''),16));
                        str = str.replace(entities[i],repl);
                     }
                  }
                  tagarr.push(str);
               }
               tags.each(function() {
                  if (/http:\/\/[^\/]*\/ask/.test(this.href)) {
                     return true;
                  }
                  var currtag = $(this).text().replace(/^#/,'');
                  if (!(/^\s*$/.test(currtag))) {
                     tagarr.push(currtag);
                  }
               });
            }
            var postId = reblog.closest('li.post').attr('id').match(/\d*$/)[0];
            if (qr.find('div.user_menu_list').attr('id') !==
                  'list_for_' + postId) {
               qr.find('#MissingE_quick_reblog_tags input')
                  .val(tagarr.join(', '));
               qr.find('div.user_menu_list').attr('id','list_for_' + postId);
            }
            var arg = '';
            if (settings.accountName !== '0') {
               arg = '&channel_id=' + settings.accountName;
               if (!(/\?/.test(reblog.attr('href')))) {
                  arg = arg.replace(/&/,'?');
               }
            }
            var newurl = reblog.attr('href').replace(/channel_id=[^&]*/,'')
                              .replace(/\?&/,'?').replace(/&&/,'&')
                              .replace(/[\?&]$/,'') + arg;
            qr.find('#MissingE_quick_reblog_manual').attr('href', newurl);
            h = Math.round(pos.top+h-marg);
            w = Math.round(pos.left-w);
            qr.removeData('off');
            qr.css('cssText', 'top:' + h + 'px !important;' +
                              'left:' + w + 'px !important;');
            if (e.relatedTarget) {
               qr.show();
            }
         }).live('mouseout',function(e) {
            if (!e.reldatedTarget ||
                (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
                 !$.contains(qr.get(0), e.relatedTarget))) {
               qr.css('display','');
               if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
                  qr.data('off','off');
               }
               else {
                  MissingE.packages.betterReblogs.resetTumblr =
                        setTimeout(function() {
                     var sel = $('#MissingE_quick_reblog_selector select');
                     if (sel.find('option[value="' + settings.accountName +
                                  '"]').length > 0) {
                        sel.val(settings.accountName);
                     }
                     else {
                        sel.val(sel.find('option:first').val());
                     }
                     sel.trigger('change');
                  }, 1000);
               }
            }
         }).live('click',function(e) {
            var me = $(this);
            if (me.hasClass('MissingE_quick_reblogging') ||
                me.hasClass('MissingE_quick_reblogging_success')) {
               return false;
            }
            var selector = $('#MissingE_quick_reblog_selector select');
            var account = settings.accountName;
            if (selector.length > 0) {
               account = selector.val();
            }
            e.preventDefault();
            MissingE.packages.betterReblogs
               .doReblog(this,account,queueTags);
            return false;
         });
         if (settings.keyboardShortcut) {
            $(window).keydown(function(e) {
               if ((e.keyCode !== 68 && e.keyCode !== 81 && e.keyCode !== 82) ||
                   e.metaKey || e.shiftKey || e.altKey || e.ctrlKey ||
                   $(e.target).is('input,textarea')) {
                  return;
               }
               var currPos = $(window).scrollTop()+7;
               $('#posts li.post').each(function() {
                  var postPos = this.offsetTop;
                  if (postPos === currPos) {
                     var overEvt = document.createEvent("MouseEvent");
                     overEvt.initMouseEvent("mouseover", true, true, window, 0,
                                            0, 0, 0, 0, false, false, false,
                                            false, 0, null);
                     var rebBtn = $(this).find('div.post_controls a[href^="/reblog/"]').get(0);
                     rebBtn.dispatchEvent(overEvt);
                     if (!$(rebBtn).hasClass('MissingE_quick_reblogging ' +
                                         'MissingE_quick_reblogging_success')) {
                        var itm;
                        if (e.keyCode === 68) {
                           itm = document.getElementById('MissingE_quick_reblog_draft');
                        }
                        else if (e.keyCode === 81) {
                           itm = document.getElementById('MissingE_quick_reblog_queue');
                        }
                        else if (e.keyCode === 82) {
                           itm = rebBtn;
                        }
                        var selector = $('#MissingE_quick_reblog_selector select');
                        var account = settings.accountName;
                        if (selector.length > 0) {
                           account = selector.val();
                        }
                        MissingE.packages.betterReblogs
                           .doReblog(itm, account, queueTags);
                     }
                     var outEvt = document.createEvent("MouseEvent");
                     outEvt.initMouseEvent("mouseout", true, true, window, 0,
                                           0, 0, 0, 0, false, false, false,
                                           false, 0, null);
                     rebBtn.dispatchEvent(outEvt);
                  }
                  if (postPos >= currPos) {
                     return false;
                  }
               });
            });
         }

         qr.find('#MissingE_quick_reblog_twitter input').mousedown(function() {
            this.checked = !this.checked;
            return false;
         }).click(function() {
            return false;
         });
         qr.find('span.MissingE_quick_reblog_field div').click(function() {
            return false;
         });
         qr.find('a').click(function(e){
            if (e.target.tagName === 'INPUT' ||
                e.target.tagName === 'SELECT') { return false; }
            var trg = $(e.target);
            if (trg.hasClass('MissingE_quick_reblog_field') ||
                trg.closest('a').hasClass('MissingE_quick_reblog_field')) {
               return false;
            }
            var selector = $('#MissingE_quick_reblog_selector select');
            var account = settings.accountName;
            if (selector.length > 0) {
               account = selector.val();
            }
            MissingE.packages.betterReblogs
               .doReblog(this,account,queueTags);
         });

         if (settings.quickReblogForceTwitter === "default") {
            MissingE.packages.betterReblogs.getTwitterDefaults();
         }
         else if (settings.quickReblogForceTwitter === "on") {
            $('#MissingE_quick_reblog_selector select').trigger('change');
         }
      }
   },

   init: function() {
      extension.sendRequest("settings", {component: "betterReblogs"},
                            function(response) {
         if (response.component === "betterReblogs") {
            var i;
            MissingE.packages.betterReblogs.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.betterReblogs.settings[i] = response[i];
               }
            }
            MissingE.packages.betterReblogs.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.betterReblogs.init();
}

}(jQuery));
