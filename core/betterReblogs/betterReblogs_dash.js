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

   hasFacebook: {},
   hasTwitter: {},
   facebookChecked: {},
   twitterChecked: {},

   showingReblogMenu: function() {
      return $('#MissingE_quick_reblog:visible').length > 0;
   },

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
      before = $('#post_control_reply_' + tid);
      if (before.length === 0) {
         before = $('#show_notes_link_' + tid);
      }
      if (response.success) {
         rblnk = $('<a />',
                   {title: reblog_text,
                    "class": "reblog_button",
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
                    "class": "MissingE_betterReblogs_retryAsk",
                    click: function() { return false; }});
         if (before.length === 0) {
            rblnk.prependTo(item.find('div.post_controls')).after(' ');
         }
         else {
            rblnk.insertAfter(before).before(' ');
         }
      }
   },

   getServiceDefaults: function() {
      var options = $('#MissingE_quick_reblog_selector option');
      options.each(function() {
         MissingE.packages.betterReblogs.hasTwitter[this.value] = true;
         MissingE.packages.betterReblogs.hasFacebook[this.value] = true;
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
                  MissingE.packages.betterReblogs.twitterChecked[tumblr] =
                     /checked="checked"/.test(cb[0]) ||
                     /checked\s*[^=]/.test(cb[0]);
               }
               var oauth = data.match(/<[^>]*id="oauth_signed_in_screenname"[^>]*>([^<]+)<\/[^>]*>/);
               if (!oauth || oauth.length < 2) {
                  MissingE.packages.betterReblogs.hasTwitter[tumblr] = false;
                  MissingE.packages.betterReblogs.twitterChecked[tumblr] = false;
               }

               cb = data.match(/<input[^>]*id="fb_connect_button"[^>]*>/);
               if (cb && cb.length > 0) {
                  MissingE.packages.betterReblogs.facebookChecked[tumblr] =
                     /checked="checked"/.test(cb[0]) ||
                     /checked\s*[^=]/.test(cb[0]);
               }
               var fbName = data.match(/<option[^<]*id="fb_name_option"[^>]*>([^<]+)<\/[^>]*>/);
               if (!fbName || fbName.length < 2) {
                  MissingE.packages.betterReblogs.hasFacebook[tumblr] = false;
               }

               MissingE.packages.betterReblogs.servicesChecked = true;
               if (select.val() === tumblr) {
                  select.trigger('change');
               }
            }
         });
      });
   },

   getFacebookDefaults: function() {
      if (!MissingE.packages.betterReblogs.servicesChecked) {
         MissingE.packages.betterReblogs.getServiceDefaults();
      }
   },

   getTwitterDefaults: function() {
      if (!MissingE.packages.betterReblogs.servicesChecked) {
         MissingE.packages.betterReblogs.getServiceDefaults();
      }
   },

   changeQuickReblogAcct: function(sel, twitter, facebook) {
      var rm = $('#MissingE_quick_reblog_manual');
      var curhref = rm.attr('href');
      if (/channel_id=/.test(curhref)) {
         rm.attr('href',curhref.replace(/channel_id=[^&]*/,'channel_id=' +
                                        sel.val()));
      }
      else {
         rm.attr('href',curhref + '&channel_id=' + sel.val());
      }
      if (MissingE.packages.betterReblogs.twitterChecked[sel.val()] ||
          twitter === "on") {
         $('#MissingE_quick_reblog_twitter input').get(0).checked = true;
      }
      else {
         $('#MissingE_quick_reblog_twitter input').get(0).checked = false;
      }
      if (MissingE.packages.betterReblogs.facebookChecked[sel.val()] ||
          facebook === "on") {
         $('#MissingE_quick_reblog_facebook input').get(0).checked = true;
      }
      else {
         $('#MissingE_quick_reblog_facebook input').get(0).checked = false;
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
      a.addClass('MissingE_quick_reblogging');
      a.attr('title',MissingE.getLocale(lang).reblogging);
   },

   failReblog: function(id) {
      var lang = $('html').attr('lang');
      var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
      a.removeClass('MissingE_quick_reblogging');
      a.attr('title',a.attr('oldtxt'));
      a.removeAttr('oldtxt');
      alert(MissingE.getLocale(lang).reblogFailed);
   },

   finishReblog: function(id) {
      var lang = $('html').attr('lang');
      var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
      a.addClass('MissingE_quick_reblogging_success')
         .addClass('MissingE_quick_reblogging_success');
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

   doReblog: function(item,accountName,queueTags,reblogTags) {
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
      var tags = $('#MissingE_quick_reblog_tags textarea').val();
      tags = tags.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
               .replace(/\s*,\s*/g,',').replace(/,$/,'')
               .replace(/^\s*/,'').replace(/\s*$/,'');
      var mode = reblogMode[type];
      var taglist;
      if (queueTags && queueTags !== "" && type === "queue") {
         taglist = tags.split(',');
         for (i=0; i<queueTags.length; i++) {
            if ($.inArray(queueTags[i],taglist) === -1) {
               taglist.push(queueTags[i]);
            }
         }
         tags = taglist.join(",");
      }
      if (reblogTags && reblogTags !== "") {
         taglist = tags.split(',');
         for (i=0; i<reblogTags.length; i++) {
            if ($.inArray(reblogTags[i],taglist) === -1) {
               taglist.push(reblogTags[i]);
            }
         }
         tags = taglist.join(",");
      }
      isAsk = $('#post_' + postId).hasClass('note');
      perm = $('#permalink_' + postId).attr("href");
      user = $('#post_' + postId).attr("name");
      var twitter = $('#MissingE_quick_reblog_twitter input').is(':checked');
      var facebook = $('#MissingE_quick_reblog_facebook input').is(':checked');
      var caption = $('#MissingE_quick_reblog_caption textarea').val();
      caption = caption.replace(/^\s+/,'').replace(/\s+$/,'');
      if (caption.length > 0) {
         caption = '\n<p>' + caption.replace(/\n/g,'</p>\n<p>') + '</p>';
         caption = caption.replace(/<p><\/p>/g,'<p><br /></p>');
      }
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
            var bodyBox;
            for (i=0; i<inputs.length; i++) {
               var theInput = $(inputs[i]);
               if (theInput.length === 0) { continue; }
               name = theInput.attr("name");
               if (!name) { continue; }
               if (theInput.attr("type") !== "checkbox" ||
                   theInput.checked === true) {
                  params[name] = theInput.val();
               }
            }
            for (i=0; i<textareas.length; i++) {
               name = textareas[i].match(/name="([^"]*)"/);
               if (name && !(/id="custom_tweet"/.test(textareas[i]))) {
                  if (!bodyBox &&
                      (name[1] === "post[two]" ||
                       name[1] === "post[three]")) {
                     bodyBox = name[i];
                  }
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
            if (caption.length > 0 && bodyBox) {
               params[bodyBox] += caption;
            }
            if (!twitter) {
               delete params["send_to_twitter"];
            }
            else {
               params["send_to_twitter"] = "on";
            }
            if (!facebook) {
               delete params["send_to_fbog"];
            }
            else {
               params["send_to_fbog"] = "on";
            }
            delete params["preview_post"];
            $.ajax({
               type: 'POST',
               url: this.url,
               async: !extension.isChrome,
               postId: this.postId,
               data: params,
               dataType: 'html',
               error: function() {
                  MissingE.packages.betterReblogs.failReblog(this.postId);
               },
               success: function(txt) {
                  if (/<body[^>]*id="dashboard_edit_post"/.test(txt) ||
                      /<body[^>]*id="dashboard_edit_post"/.test(txt) &&
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
      var queueTags = "", reblogTags = "";

      $('#posts .post_controls .reblog_button').mouseover(function() {
         var item = $(this);
         var post = item.closest('.post');
         if (!post.hasClass('note') &&
               (!item.attr('data-fast-reblog-url') ||
               item.attr('data-fast-reblog-url') === '')) {
            var key = this.href.match(/\/reblog\/(\d+)\/(\w+)/);
            if (key && key.length > 2) {
               item.attr('data-fast-reblog-url',
                           "/fast_reblog/" + key[1] + "/" + key[2]);
            }
         }
      });

      if (settings.tagQueuedPosts === 1) {
         queueTags = settings.queueTags;
      }
      if (settings.tagReblogs === 1) {
         reblogTags = settings.reblogTags;
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
               tags = $('#MissingE_quick_reblog_tags textarea').val();
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
                  str = str.replace(/\?/,'').replace(/\+/g,' ');
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
         txt += node[0] +
                  '<div class="user_menu_list_item has_tag_input ' +
                     'MissingE_quick_reblog_twitter_box">' +
                  '<div id="MissingE_quick_reblog_twitter">' +
                  '<input type="checkbox" /> ' +
                  MissingE.escapeHTML(MissingE.getLocale(lang).twitterText) +
                  '</div></div>' + node[1];
         txt += node[0] +
                  '<div class="user_menu_list_item has_tag_input ' +
                     'MissingE_quick_reblog_facebook_box">' +
                  '<div id="MissingE_quick_reblog_facebook">' +
                  '<input type="checkbox" /> ' +
                  MissingE.escapeHTML(MissingE.getLocale(lang).facebookText) +
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
                  '<div id="MissingE_quick_reblog_caption">' +
                  '<textarea rows="2" /><br />' +
                  MissingE.escapeHTML(MissingE.getLocale(lang).captionText) +
                  '</div></div>' + node[1];
         txt += node[0] + '<div class="user_menu_list_item has_tag_input">' +
                  '<div id="MissingE_quick_reblog_tags">' +
                  '<textarea rows="2" /><br />' +
                  MissingE.escapeHTML(MissingE.getLocale(lang).tagsText) +
                  '</div></div>' + node[1];
         var qr = $(txt).appendTo('body');
         qr.find('#MissingE_quick_reblog_caption textarea')
            .attr('placeholder', MissingE.getLocale(lang).captionText);
         qr.find('#MissingE_quick_reblog_tags textarea')
            .attr('placeholder', MissingE.getLocale(lang).tagsText);
         var qrSel = qr.find('#MissingE_quick_reblog_selector select');
         if (settings.accountName === 0 ||
             qrSel.find('option[value="' + settings.accountName + '"]')
               .length === 0) {
            qrSel.val(qrSel.find('option:first').attr('value'));
         }
         else {
            qrSel.val(settings.accountName);
         }
         qrSel.click(function(e) {
            e.stopPropagation();
            return false;
         }).change(function() {
            MissingE.packages.betterReblogs
               .changeQuickReblogAcct($(this),
                                      settings.quickReblogForceTwitter,
                                      settings.quickReblogForceFacebook);
         }).mouseover(function(){
            qr.addClass('MissingE_quick_reblog_selecting');
         }).mouseout(function(){
            qr.removeClass('MissingE_quick_reblog_selecting');
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
                  clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
                  MissingE.packages.betterReblogs.resetTumblr =
                        setTimeout(function() {
                     if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
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
         qr.find('textarea').focus(function() {
            if (qr.hasClass('MissingE_quick_reblog_keys')) {
               $(this).closest('.user_menu_list_item')
                  .addClass('MissingE_qr_keyActive');
            }
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
            if (qr.hasClass('MissingE_quick_reblog_keys')) {
               $(this).closest('.user_menu_list_item')
                  .removeClass('MissingE_qr_keyActive');
            }
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
            var type = "unknown";
            if (this.parentNode.id === 'MissingE_quick_reblog_tags') {
               type = 'tags';
            }
            else if (this.parentNode.id === 'MissingE_quick_reblog_caption') {
               type = 'caption';
            }
            if (e.which === 9) {
               this.blur();
               e.preventDefault();
               if (type === 'tags') {
                  if (e.shiftKey) {
                     $('#MissingE_quick_reblog_caption textarea')
                        .get(0).focus();
                  }
               }
               else if (type === 'caption') {
                  if (!e.shiftKey) {
                     $('#MissingE_quick_reblog_tags textarea').get(0).focus();
                  }
               }
            }
            else if (e.which === 27) {
               return;
            }
            else if (e.which === 13 && type === 'tags') {
               e.preventDefault();
            }
            if (e.which >= 65 || e.which <= 90 ||
                e.which === 37 || e.which === 39) {
               e.stopPropagation();
            }
         }).keyup(function() {
            if (this.parentNode.id === 'MissingE_quick_reblog_caption') {
               this.style.height = '24px';
               var newHeight = this.scrollHeight;
               if (newHeight < 24) { newHeight = 24; }
               if (newHeight > 60) { newHeight = 72; }
               this.style.height = newHeight + 'px';
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
            delete MissingE.packages.betterReblogs.resetTumblr;
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
                  str = str.replace(/\?/,'').replace(/\+/g,' ');
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
               qr.find('#MissingE_quick_reblog_tags textarea')
                  .val(tagarr.join(', '));
               qr.find('#MissingE_quick_reblog_caption textarea')
                  .css('height','24px').val('');
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
            w = Math.round(pos.left-w-1);
            qr.removeData('off');
            qr.css('cssText', 'top:' + h + 'px !important;' +
                              'left:' + w + 'px !important;');
            if (e.relatedTarget) {
               qr.show();
            }
         }).live('mouseout',function(e) {
            if (!e.relatedTarget ||
                (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
                 !$.contains(qr.get(0), e.relatedTarget))) {
               qr.css('display','');
               if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
                  qr.data('off','off');
               }
               else {
                  clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
                  MissingE.packages.betterReblogs.resetTumblr =
                        setTimeout(function() {
                     if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
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
               .doReblog(this,account,queueTags,reblogTags);
            return false;
         });
         if (settings.quickKeyboardShortcut) {
            $(document).click(function(e) {
               if (!$.contains(qr.get(0), e.relatedTarget)) {
                  qr.removeClass('MissingE_quick_reblog_keys');
                  var inpBox = $('#MissingE_quick_reblog_tags textarea');
                  inpBox.get(0).blur();
                  if (qr.css('display') === 'none') {
                     clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
                     MissingE.packages.betterReblogs.resetTumblr =
                           setTimeout(function() {
                        if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
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
            $(window).keydown(function(e) {
               // 27 = Esc, 68 = D, 81 = Q, 82 = R, 84 = T
               if (e.metaKey || e.altKey || e.ctrlKey ||
                   (e.keyCode !== 68 && e.keyCode !== 81 && e.keyCode !== 82 &&
                    e.keyCode !== 84 && e.keyCode !== 27)) {
                  return;
               }
               if ($(e.target).is('input,textarea')) {
                  if (!qr.hasClass('MissingE_quick_reblog_keys') ||
                      e.keyCode !== 27) {
                     return;
                  }
               }
               else if (e.shiftKey && e.keyCode !== 82) {
                  return;
               }
               var currPos = $(window).scrollTop()+7;
               $('#posts li.post').each(function() {
                  var postPos = this.offsetTop;
                  if (postPos === currPos) {
                     var isManual = false;
                     var rebBtn = $(this).find('div.post_controls ' +
                                               'a[href^="/reblog/"]').get(0);
                     var overEvt = document.createEvent("MouseEvent");
                     overEvt.initMouseEvent("mouseover", true, true, window, 0,
                                            0, 0, 0, 0, false, false, false,
                                            false, 0, null);
                     rebBtn.dispatchEvent(overEvt);
                     if (!$(rebBtn).hasClass('MissingE_quick_reblogging ' +
                                         'MissingE_quick_reblogging_success')) {
                        var itm, inpBox;
                        if (e.keyCode === 68) {
                           itm = document.getElementById('MissingE_quick_reblog_draft');
                        }
                        else if (e.keyCode === 81) {
                           itm = document.getElementById('MissingE_quick_reblog_queue');
                        }
                        else if (e.keyCode === 82 && e.shiftKey) {
                           isManual = true;
                           itm = document.getElementById('MissingE_quick_reblog_manual');
                        }
                        else if (e.keyCode === 82) {
                           itm = rebBtn;
                        }
                        else if (e.keyCode === 84) {
                           qr.addClass('MissingE_quick_reblog_keys');
                           qr.find('.MissingE_qr_keyActive').removeClass('MissingE_qr_keyActive');
                           inpBox = $('#MissingE_quick_reblog_tags textarea');
                           inpBox.closest('.user_menu_list_item').addClass('MissingE_qr_keyActive');
                           inpBox.get(0).focus();
                           e.preventDefault();
                           return false;
                        }
                        else if (qr.hasClass('MissingE_quick_reblog_keys') &&
                                 e.keyCode === 27) {
                           qr.removeClass('MissingE_quick_reblog_keys');
                           inpBox = $('#MissingE_quick_reblog_tags textarea');
                           inpBox.get(0).blur();
                           if (qr.css('display') === 'none') {
                              clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
                              MissingE.packages.betterReblogs.resetTumblr =
                                    setTimeout(function() {
                                 if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
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
                        if (!itm) {
                           return;
                        }
                        else {
                           qr.removeClass('MissingE_quick_reblog_keys');
                        }
                        if (isManual) {
                           var downEvt = document.createEvent("MouseEvent");
                           downEvt.initMouseEvent("mousedown", true, true,
                                                  window, 0, 0, 0, 0, 0, false,
                                                  false, false, false, 0, null);
                           itm.dispatchEvent(downEvt);
                           var clickEvt = document.createEvent("MouseEvent");
                           clickEvt.initMouseEvent("click", true, true, window,
                                                   0, 0, 0, 0, 0, false, false,
                                                   false, false, 0, null);
                           itm.dispatchEvent(clickEvt);
                        }
                        else {
                           var selector = $('#MissingE_quick_reblog_selector select');
                           var account = settings.accountName;
                           if (selector.length > 0) {
                              account = selector.val();
                           }
                           MissingE.packages.betterReblogs
                              .doReblog(itm, account, queueTags, reblogTags);
                        }
                     }
                     var outEvt = document.createEvent("MouseEvent");
                     outEvt.initMouseEvent("mouseout", true, true, window, 0,
                                           0, 0, 0, 0, false, false, false,
                                           false, 0, null);
                     rebBtn.dispatchEvent(outEvt);
                     return false;
                  }
                  if (postPos >= currPos) {
                     return false;
                  }
               });
            });
         }
         else if (settings.keyboardShortcut) {
            $(window).keydown(function(e) {
               // 82 = R (allow shift key use to be consistent with quick reblog
               if ($(e.target).is('input,textarea') ||
                   e.metaKey || e.altKey || e.ctrlKey || e.keyCode !== 82) {
                  return;
               }
               var currPos = $(window).scrollTop()+7;
               $('#posts li.post').each(function() {
                  var postPos = this.offsetTop;
                  if (postPos === currPos) {
                     var rebBtn = $(this).find('div.post_controls ' +
                                               'a[href^="/reblog/"]').get(0);
                     var overEvt = document.createEvent("MouseEvent");
                     overEvt.initMouseEvent("mouseover", true, true, window, 0,
                                            0, 0, 0, 0, false, false, false,
                                            false, 0, null);
                     rebBtn.dispatchEvent(overEvt);
                     if (!$(rebBtn).hasClass('MissingE_quick_reblogging ' +
                                         'MissingE_quick_reblogging_success')) {
                        itm = document.getElementById('MissingE_quick_reblog_manual');
                        var downEvt = document.createEvent("MouseEvent");
                        downEvt.initMouseEvent("mousedown", true, true, window, 0,
                                               0, 0, 0, 0, false, false, false,
                                               false, 0, null);
                        itm.dispatchEvent(downEvt);
                        var clickEvt = document.createEvent("MouseEvent");
                        clickEvt.initMouseEvent("click", true, true, window, 0, 0,
                                                0, 0, 0, false, false, false,
                                                false, 0, null);
                        itm.dispatchEvent(clickEvt);
                     }
                     var outEvt = document.createEvent("MouseEvent");
                     outEvt.initMouseEvent("mouseout", true, true, window, 0,
                                           0, 0, 0, 0, false, false, false,
                                           false, 0, null);
                     rebBtn.dispatchEvent(outEvt);
                     return false;
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
         qr.find('#MissingE_quick_reblog_facebook input').mousedown(function() {
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
               .doReblog(this,account,queueTags,reblogTags);
         });

         var doChange = false;
         if (settings.quickReblogForceTwitter === "default") {
            MissingE.packages.betterReblogs.getTwitterDefaults();
         }
         else if (settings.quickReblogForceTwitter === "on") {
            doChange = true;
         }
         if (settings.quickReblogForceFacebook === "default") {
            MissingE.packages.betterReblogs.getFacebookDefaults();
         }
         else if (settings.quickReblogForceFacebook === "on") {
            doChange = true;
         }
         if (doChange) {
            $('#MissingE_quick_reblog_selector select').trigger('change');
         }
      }
      else {
         // Quick reblog not active
         if (settings.keyboardShortcut) {
            $(window).keydown(function(e) {
               // 82 = R (allow shift key use to be consistent with quick reblog
               if ($(e.target).is('input,textarea') ||
                   e.metaKey || e.altKey || e.ctrlKey || e.keyCode !== 82) {
                  return;
               }
               var currPos = $(window).scrollTop()+7;
               $('#posts li.post').each(function() {
                  var postPos = this.offsetTop;
                  if (postPos === currPos) {
                     var rebBtn = $(this).find('div.post_controls ' +
                                               'a[href^="/reblog/"]').get(0);
                     var downEvt = document.createEvent("MouseEvent");
                     downEvt.initMouseEvent("mousedown", true, true, window, 0,
                                            0, 0, 0, 0, false, false, false,
                                            false, 0, null);
                     rebBtn.dispatchEvent(downEvt);
                     var clickEvt = document.createEvent("MouseEvent");
                     clickEvt.initMouseEvent("click", true, true, window, 0, 0,
                                             0, 0, 0, false, false, false,
                                             false, 0, null);
                     rebBtn.dispatchEvent(clickEvt);
                     return false;
                  }
                  if (postPos >= currPos) {
                     return false;
                  }
               });
            });
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