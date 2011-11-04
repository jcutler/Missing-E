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

/*global jQuery,locale,self */

var resetTumblr;
var checked = {};

function addAskReblog(item) {
   var i;
   if (item.tagName === "LI" && jQuery(item).hasClass('post') &&
       jQuery(item).hasClass('note')) {
      jQuery(item).find('div.post_controls a.MissingE_betterReblogs_retryAsk')
               .remove();
      if (jQuery(item).find('div.post_controls a[href^="/reblog"]')
            .length > 0 ||
          jQuery(item).find('div.post_controls a.MissingE_reblog_control')
            .length > 0) {
         return true;
      }
      var tid = jQuery(item).attr("id").match(/[0-9]*$/)[0];
      var perm = jQuery(item).find("a.permalink:first");
      if (perm.length === 0) {
         return;
      }
      self.postMessage({greeting: "betterReblogs", pid: tid,
                        url: perm.attr("href")});
   }
}

function receiveAskReblog(message) {
   if (message.greeting !== "betterReblogs") { return; }
   var item = jQuery('#post_' + message.pid);
   var perm = item.find("a.permalink:first");
   var tid = message.pid;
   var klass, before, rblnk, txt;

   var lang = jQuery('html').attr('lang');
   var question = "";
   var asker = jQuery(item).find(".post_question_asker").text();
   for (i=0; i<locale[lang].asked.length; i++) {
      if (i>0) {
         question += " ";
      }
      if (locale[lang].asked[i] === "U") {
         question += asker;
      }
      else {
         question += locale[lang].asked[i];
      }
   }
   question += ": " + jQuery(item).find("div.post_question").text()
                        .replace(/\s+/g,' ').replace(/^\s/,'')
                        .replace(/\s$/,'');
   question = encodeURIComponent(question);

   var reblog_text = locale[lang].reblog;
   before = item.find('div.post_controls a[href^="/edit"]');
   if (before.length === 0) {
      before = item.find('div.post_controls a.MissingE_edit_control');
   }
   if (before.length === 0) {
      before = jQuery('#post_control_reply_' + tid);
   }
   if (before.length === 0) {
      before = jQuery('#show_notes_link_' + tid);
   }
   if (message.success) {
      klass = (message.icons ? 'MissingE_post_control ' +
               'MissingE_reblog_control' : '');
      txt = (message.icons ? '' : locale[lang].reblog);
      rblnk = jQuery('<a title="' + reblog_text + '" href="/reblog/' + tid +
                    '/' + message.data + '/text?post%5Bone%5D=' +
                    escapeHTML(question) + '&MissingEname=' +
                    message.name + '&MissingEpost=' +
                    encodeURIComponent(perm.attr("href")) + '" class="' +
                    klass + '">' + txt + '</a>');
      if (before.length === 0) {
         rblnk.prependTo(item.find('div.post_controls')).after(' ');
      }
      else {
         rblnk.insertAfter(before).before(' ');
      }
      item.attr('name', message.name);
      rblnk.trigger('MissingEaddReblog');
   }
   else {
      var reblog_err = locale[lang].error;
      klass = (message.icons ? 'MissingE_post_control ' +
                  'MissingE_reblog_control ' +
                  'MissingE_reblog_control_retry' : '');
      txt = (message.icons ? '' : '<del>' + reblog_text + '</del>');
      rblnk = jQuery('<a title="' + reblog_err + '" href="#" ' +
                'class="MissingE_betterReblogs_retryAsk ' + klass +
                '" onclick="return false;">' + txt + '</a>');
      if (before.length === 0) {
         rblnk.prependTo(item.find('div.post_controls')).after(' ');
      }
      else {
         rblnk.insertAfter(before).before(' ');
      }
   }
}

function getTwitterDefaults() {
   var options = jQuery('#MissingE_quick_reblog_selector option');
   options.each(function() {
      jQuery.ajax({
         type: "GET",
         url: "http://www.tumblr.com/blog/" + this.value + "/settings",
         dataType: "html",
         tryCount: 0,
         retryLimit: 4,
         blog: this.value,
         error: function(xhr, textStatus) {
            if (xhr.status < 500) {
               return;
            }
            else {
               this.tryCount++;
               if (this.tryCount <= this.retryLimit) {
                  jQuery.ajax(this);
                  return;
               }
            }
         },
         success: function(data, textStatus) {
            var tumblr = this.blog;
            var select = jQuery('#MissingE_quick_reblog_selector select');
            var cb = data.match(/<input[^>]*name="channel\[twitter_send_posts\]"[^>]*>/);
            if (cb && cb.length > 0) {
               checked[tumblr] = /checked="checked"/.test(cb[0]);
            }
            if (select.val() === tumblr) {
               select.trigger('change');
            }
         }
      });
   });
}

function changeQuickReblogAcct(sel, twitter) {
   var rm = jQuery('#MissingE_quick_reblog_manual');
   var curhref = rm.attr('href');
   if (/channel_id=/.test(curhref)) {
      rm.attr('href',curhref.replace(/channel_id=[^&]*/,'channel_id=' +
                                     sel.val()));
   }
   else {
      rm.attr('href',curhref + '&channel_id=' + sel.val());
   }
   if (checked[sel.val()] || twitter === "on") {
      jQuery('#MissingE_quick_reblog_twitter input').get(0).checked = true;
   }
   else {
      jQuery('#MissingE_quick_reblog_twitter input').get(0).checked = false;
   }
}

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function setReblogTagsPlainText(tags) {
   localStorage.setItem('tbr_ReblogTags',tags);
}

function setTagOverride() {
   localStorage.setItem('tbr_OverrideTags','1');
}

function clearTagOverride() {
   localStorage.removeItem('tbr_OverrideTags');
}

function startReblog(id,replaceIcons) {
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.attr('oldtxt',a.attr('title'));
   jQuery('#MissingE_quick_reblog').css('display','none');
   if (replaceIcons === 1) {
      a.addClass('MissingE_quick_reblogging_icon');
   }
   else {
      a.addClass('MissingE_quick_reblogging_text')
         .text(locale[lang].reblogging);
   }
   a.attr('title',locale[lang].reblogging);
}

function failReblog(id,replaceIcons) {
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   if (replaceIcons === 1) {
      a.removeClass('MissingE_quick_reblogging_icon');
   }
   else {
      a.removeClass('MissingE_quick_reblogging_text').text(a.attr('oldtxt'));
   }
   a.attr('title',a.attr('oldtxt'));
   a.removeAttr('oldtxt');
   alert(locale[lang].reblogFailed);
}

function finishReblog(id,replaceIcons) {
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   if (replaceIcons === 1) {
      a.removeClass('MissingE_quick_reblogging_icon')
       .addClass('MissingE_quick_reblogging_success');
   }
   else {
      a.addClass('MissingE_quick_reblogging_text_success')
         .text(locale[lang].rebloggedText);
   }
   a.attr('title',locale[lang].rebloggedText);
   a.removeAttr('oldtxt');
}

function reblogTextFull(item) {
   var post = jQuery(item);
   if (item.tagName === 'LI' &&
       post.hasClass('post') &&
       post.hasClass('regular')) {
      post.find('div.post_controls a[href^="/reblog/"]').each(function() {
         if (/[a-zA-Z0-9]\?/.test(this.href)) {
            this.setAttribute('href',
               this.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
         }
      });
   }
   else if (item.tagName === 'A' &&
            post.parent().is('div.post_controls') &&
            post.closest('li.post').hasClass('regular')) {
      if (/[a-zA-Z0-9]\?/.test(item.href)) {
         item.setAttribute('href',
            item.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
      }
   }
}

function doReblog(item,replaceIcons,accountName,queueTags) {
   var reblogMode = {
      "normal":  '0',
      "draft":   '1',
      "queue":   '2',
      "private": 'private'
   };
   var i,isAsk,type,url,postId,perm,user;
   if (jQuery(item).parent().hasClass('post_controls')) {
      type = 'normal';
      url = jQuery(item).attr('href');
      postId = jQuery(item).closest('li.post').attr('id').match(/[0-9]*$/)[0];
   }
   else {
      type = item.id.replace(/MissingE_quick_reblog_/,'');
      if (!type || type === 'manual') { return; }
      url = jQuery(item).siblings('a[href!="#"]').attr('href');
      postId = jQuery(item).parent().attr('id').replace(/list_for_/,'');
   }
   url = location.protocol + '//' + location.host + url;
   url = url.replace(/\?redirect_to=.*$/,'');
   var tags = jQuery('#MissingE_quick_reblog_tags input').val();
   tags = tags.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
            .replace(/\s*,\s*/g,',').replace(/,$/,'')
            .replace(/^\s*/,'').replace(/\s*$/,'');
   var mode = reblogMode[type];
   if (queueTags && queueTags !== "" && type === "queue") {
      var taglist = tags.split(',');
      for (i=0; i<queueTags.length; i++) {
         if (jQuery.inArray(queueTags[i],taglist) === -1) {
            taglist.push(queueTags[i]);
         }
      }
      tags = taglist.join(",");
   }
   isAsk = jQuery('#post_' + postId).hasClass('note');
   perm = jQuery('#permalink_' + postId).attr("href");
   user = jQuery('#post_' + postId).attr("name");
   var twitter = jQuery('#MissingE_quick_reblog_twitter input').is(':checked');
   startReblog(postId,replaceIcons);
   jQuery.ajax({
      type: "GET",
      url: url,
      dataType: "html",
      postId: postId,
      tags: tags,
      mode: mode,
      replaceIcons: replaceIcons,
      error: function() {
         failReblog(this.postId,this.replaceIcons);
      },
      success: function(data, textStatus) {
         var i;
         var frm = data.indexOf('<form');
         if (frm === -1) {
            failReblog(this.postId,this.replaceIcons);
            return;
         }
         var html = data.substr(frm);
         while (!(/^<form [^>]*id="edit_post"/.test(html))) {
            html = html.substr(1);
            frm = html.indexOf('<form');
            if (frm === -1) {
               failReblog(this.postId,this.replaceIcons);
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
               params[name[1]] = jQuery(inputs[i]).val();
            }
         }
         for (i=0; i<textareas.length; i++) {
            name = textareas[i].match(/name="([^"]*)"/);
            if (name && !(/id="custom_tweet"/.test(textareas[i]))) {
               params[name[1]] = jQuery(textareas[i]).text();
            }
         }
         params["post[tags]"] = this.tags;
         params["post[state]"] = this.mode;
         params["channel_id"] = accountName;
         if (isAsk) {
            if (!perm || perm === "" || !user || user === "") {
               failReblog(this.postId,this.replaceIcons);
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
         jQuery.ajax({
            type: 'POST',
            url: this.url,
            postId: this.postId,
            data: params,
            replaceIcons: this.replaceIcons,
            error: function() {
               failReblog(this.postId,this.replaceIcons);
            },
            success: function(data) {
               finishReblog(this.postId,this.replaceIcons);
            }
         });
      }
   });
}

self.on('message', function (message) {
   if (message.greeting !== "settings" ||
       message.component !== "betterReblogs" ||
       message.subcomponent !== "dash") {
      return;
   }
   var extensionURL = message.extensionURL;
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var queueTags = "";
   if (message.tagQueuedPosts === 1) {
      queueTags = message.queueTags;
   }

   if (message.passTags === 1) {
      var selector = '#posts div.post_controls a[href^="/reblog/"]';
      if (message.quickReblog === 1) {
         selector = '#MissingE_quick_reblog_manual';
      }
      jQuery(selector).live('mousedown', function(e) {
         var tags;
         if (this.id === 'MissingE_quick_reblog_manual') {
            tags = jQuery('#MissingE_quick_reblog_tags input').val();
            tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
                     .replace(/^\s*/,'');
            setReblogTagsPlainText(tags);
            setTagOverride();
         }
         else {
            tags = jQuery(this).closest('li.post').find('span.tags a');
            var tagarr = [];
            if (/http:\/\/www\.tumblr\.com\/tagged\//.test(location.href)) {
               var i;
               var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
               str = str.replace(/\?/,'').replace(/\+/,' ');
               var entities = str.match(/%[0-9a-fA-F]{2}/g);
               if (entities !== undefined && entities !== null) {
                  for (i=0; i<entities.length; i++) {
                     var repl = String.fromCharCode(
                                          parseInt(entities[i]
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
               tagarr.push(jQuery(this).text().replace(/^#/,''));
            });
            setReblogTags(tagarr);
            clearTagOverride();
         }
      });
   }
   if (message.fullText === 1) {
      jQuery('#posts li.post.regular').each(function() {
         reblogTextFull(this);
      });
      document.addEventListener('MissingEajax', function(e) {
         var list = e.data.match(/(post_[0-9]+)/g);
         jQuery.each(list, function(i,val) {
            reblogTextFull(jQuery('#'+val).get(0));
         });
      }, false);
      jQuery('#posts div.post_controls a').live('MissingEaddReblog',function() {
         reblogTextFull(this);
      });
   }
   if (message.reblogAsks === 1) {
      self.on("message", receiveAskReblog);
      jQuery('#posts li.post div.post_controls a.MissingE_betterReblogs_retryAsk')
         .live('click', function() {
         var post = jQuery(this).closest('li.post');
         if (post.length === 1) {
            addAskReblog(jQuery(this).parents('li.post').get(0));
         }
      });
      jQuery('#posts li.post').each(function(){addAskReblog(this);});
      document.addEventListener('MissingEajax',function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type !== 'posts') { return; }
         jQuery.each(list, function(i,val) {
            addAskReblog($('#'+val).get(0));
         });
      }, false);
   }
   if (message.quickReblog === 1) {
      var r,s;
      var idx;
      jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
         extensionURL + 'betterReblogs/quickReblog.css" />')
         .append('<style type="text/css">' +
            '.MissingE_quick_reblogging_icon {' +
               'background-image:url("' +
               extensionURL + 'betterReblogs/reblog_animated.gif' +
               '") !important; }' +
            '.MissingE_quick_reblogging_success {' +
               'background-image:url("' +
               extensionURL + 'betterReblogs/reblog_success.png' +
               '") !important; }</style>');
      var spanStyle = "";
      for (s=0; s<document.styleSheets.length; s++) {
         try {
            for (r=0; r<document.styleSheets[s].cssRules.length; r++) {
               if (/\.user_menu \.user_menu_list a/
                     .test(document.styleSheets[s].cssRules[r].selectorText)) {
                  spanStyle += document.styleSheets[s].cssRules[r].cssText
                                 .replace(/\.user_menu \.user_menu_list a/g,
                                          '#MissingE_quick_reblog .user_menu_list span');
               }
            }
         } catch(e){}
      }
      jQuery('head').append('<style type="text/css">' + spanStyle +
                            '</style>');
      var txt = '<div class="user_menu" id="MissingE_quick_reblog">' +
                 '<div class="user_menu_nipple"></div>' +
                 '<div class="user_menu_list">';
      for (idx=0; idx<locale[lang].reblogOptions.length; idx++) {
         var doonclick = 'onclick="return false;"';
         if (locale[lang].reblogOptions[idx].item === 'manual') {
            doonclick = '';
         }
         txt += '<a class="MissingE_quick_reblog_button" ' +
                 'id="MissingE_quick_reblog_' +
                 locale[lang].reblogOptions[idx].item +
                 '" href="#" ' + doonclick + '>' +
                 '<div class="user_menu_list_item">' +
                 locale[lang].reblogOptions[idx].text + '</div></a>';
      }
      txt += '<span class="MissingE_quick_reblog_field">' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_twitter">' +
               '<input type="checkbox" /> ' + locale[lang].twitterText +
               '</div></div></span>';
      var list = jQuery('#user_channels li');
      if (list.length > 0) {
         txt +=  '<span class="MissingE_quick_reblog_field">' +
                  '<div class="user_menu_list_item has_tag_input">' +
                  '<div id="MissingE_quick_reblog_selector">' +
                  '<select>';
         list.each(function(i) {
            var acct = this.id.match(/tab-(.*)/);
            if (!acct) { return; }
            acct = acct[1];
            var sel = false;
            if ((message.accountName === 0 &&
                 i === 0) ||
                message.accountName === acct) {
               sel = true;
            }
            txt += '<option value="' + acct + '"' +
                     (sel ? ' selected="selected"' : '') + '>' + acct +
                     '</option>';
         });
         txt +=  '</select><br />Tumblr</div></div></span>';
      }
      txt += '<span class="MissingE_quick_reblog_field">' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_tags">' +
               '<input type="text" /><br />' + locale[lang].tagsText +
               '</div></div></span>';
      var qr = jQuery(txt).appendTo('body');
      qr.find('#MissingE_quick_reblog_selector select').click(function(e) {
         e.stopPropagation();
         return false;
      }).change(function() {
         changeQuickReblogAcct(jQuery(this), message.quickReblogForceTwitter);
      });
      qr.mouseover(function(e){
         if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
             !jQuery.contains(qr.get(0), e.relatedTarget) &&
             !jQuery(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
            qr.removeData('off');
         }
      }).mouseout(function(e){
         if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
             !jQuery.contains(qr.get(0), e.relatedTarget) &&
             !jQuery(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
            jQuery(this).css('display','');
            if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
               qr.data('off','off');
            }
            else {
               resetTumblr = setTimeout(function() {
                  var sel = jQuery('#MissingE_quick_reblog_selector select');
                  if (sel.find('option[value="' + message.accountName +
                               '"]').length > 0) {
                     sel.val(message.accountName);
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
         var taginput = this;
         qr.addClass('MissingE_quick_reblog_tags_inputting');
         jQuery(document).bind('keydown.MissingEqr', function(e) {
            if (e.keyCode === 27) {
               taginput.blur();
               return true;
            }
         });
      }).blur(function() {
         jQuery(document).unbind('keydown.MissingEqr');
         qr.removeClass('MissingE_quick_reblog_tags_inputting');
         if (qr.data('off')) {
            qr.removeData('off');
            var sel = jQuery('#MissingE_quick_reblog_selector select');
            if (sel.find('option[value="' + message.accountName +
                         '"]').length > 0) {
               sel.val(message.accountName);
            }
            else {
               sel.val(sel.find('option:first').val());
            }
            sel.trigger('change');
         }
      }).keydown(function(e) {
         if (e.which === 74 || e.which === 75) {
            e.stopPropagation();
         }
      });
      jQuery('#posts div.post_controls a[href^="/reblog/"]')
            .live('mouseover',function(e) {
         var reblog = jQuery(this);
         reblog.addClass('MissingE_quick_reblog_main');
         if (reblog.hasClass('MissingE_quick_reblogging_icon') ||
             reblog.hasClass('MissingE_quick_reblogging_success') ||
             reblog.hasClass('MissingE_quick_reblogging_text') ||
             reblog.hasClass('MissingE_quick_reblogging_text_successs')) {
            return;
         }
         clearTimeout(resetTumblr);
         var pos = reblog.offset();
         var h = reblog.outerHeight() - 2;
         var w = (qr.outerWidth()>>1) - (reblog.innerWidth()>>1);
         var tagarr = [];
         var marg = parseInt(jQuery('body').css('margin-top'));
         if (isNaN(marg)) { marg = 0; }
         if (message.passTags === 1) {
            var tags = reblog.closest('li.post').find('span.tags a');
            if (/http:\/\/www\.tumblr\.com\/tagged\//.test(location.href)) {
               var i;
               var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
               str = str.replace(/\?/,'').replace(/\+/,' ');
               var entities = str.match(/%[0-9a-fA-F]{2}/g);
               if (entities !== undefined && entities !== null) {
                  for (i=0; i<entities.length; i++) {
                     var repl = String.fromCharCode(
                                          parseInt(entities[i]
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
               var currtag = jQuery(this).text().replace(/^#/,'');
               if (!(/^\s*$/.test(currtag))) {
                  tagarr.push(currtag);
               }
            });
         }
         var postId = reblog.closest('li.post').attr('id').match(/[0-9]*$/)[0];
         if (qr.find('div.user_menu_list').attr('id') !== 'list_for_'+postId) {
            qr.find('#MissingE_quick_reblog_tags input').val(tagarr.join(', '));
            qr.find('div.user_menu_list').attr('id','list_for_' + postId);
         }
         var arg = '';
         if (message.accountName !== '0') {
            arg = '&channel_id=' + message.accountName;
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
                           'left:' + w + 'px !important;' +
                           'display:block;');
      }).live('mouseout',function(e) {
         if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
             !jQuery.contains(qr.get(0), e.relatedTarget)) {
            qr.css('display','');
            if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
               qr.data('off','off');
            }
            else {
               resetTumblr = setTimeout(function() {
                  var sel = jQuery('#MissingE_quick_reblog_selector select');
                  if (sel.find('option[value="' + message.accountName +
                               '"]').length > 0) {
                     sel.val(message.accountName);
                  }
                  else {
                     sel.val(sel.find('option:first').val());
                  }
                  sel.trigger('change');
               }, 1000);
            }
         }
      }).live('click',function(e) {
         var me = jQuery(this);
         if (me.hasClass('MissingE_quick_reblogging_icon') ||
             me.hasClass('MissingE_quick_reblogging_success') ||
             me.hasClass('MissingE_quick_reblogging_text') ||
             me.hasClass('MissingE_quick_reblogging_text_successs')) {
            return false;
         }
         var selector = jQuery('#MissingE_quick_reblog_selector select');
         var account = message.accountName;
         if (selector.length > 0) {
            account = selector.val();
         }
         e.preventDefault();
         doReblog(this,message.replaceIcons,account,queueTags);
         return false;
      });

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
         var selector = jQuery('#MissingE_quick_reblog_selector select');
         var account = message.accountName;
         if (selector.length > 0) {
            account = selector.val();
         }
         doReblog(this,message.replaceIcons,account,queueTags);
      });

      if (message.quickReblogForceTwitter === "default") {
         getTwitterDefaults();
      }
      else if (message.quickReblogForceTwitter === "on") {
         jQuery('#MissingE_quick_reblog_selector select').trigger('change');
      }
   }
});

self.postMessage({greeting: "settings", component: "betterReblogs",
                  subcomponent: "dash"});
