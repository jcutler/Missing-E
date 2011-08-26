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

/*global $,locale,safari */

var resetTumblr;
var checked = {};

function getTwitterDefaults() {
   var options = $('#MissingE_quick_reblog_selector option');
   options.each(function() {
      $.ajax({
         type: "GET",
         url: "http://www.tumblr.com/tumblelog/" + this.value + "/settings",
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
                  $.ajax(this);
                  return;
               }
            }
         },
         success: function(data, textStatus) {
            var tumblr = this.blog;
            var select = $('#MissingE_quick_reblog_selector select');
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
   var rm = $('#MissingE_quick_reblog_manual');
   var curhref = rm.attr('href');
   if (/channel_id=/.test(curhref)) {
      rm.attr('href',curhref.replace(/channel_id=[^&]*/,'channel_id=' +
                                     sel.val()));
   }
   else {
      rm.attr('href',curhref + '&channel_id=' + sel.val());
   }
   if (checked[sel.val()] || twitter === "on") {
      $('#MissingE_quick_reblog_twitter input').get(0).checked = true;
   }
   else {
      $('#MissingE_quick_reblog_twitter input').get(0).checked = false;
   }
}

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function setReblogTagsPlainText(tags) {
   localStorage.setItem('tbr_ReblogTags',tags);
}

function startReblog(id,replaceIcons) {
   var lang = $('html').attr('lang');
   var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.attr('oldtxt',a.attr('title'));
   $('#MissingE_quick_reblog').css('display','none');
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
   var lang = $('html').attr('lang');
   var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
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
   var lang = $('html').attr('lang');
   var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
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
   var post = $(item);
   if (item.tagName === 'LI' &&
       post.hasClass('post') &&
       post.hasClass('regular')) {
      post.find('div.post_controls a[href^="/reblog/"]').each(function() {
         if (/[a-zA-Z0-9]\?/.test(this.href)) {
            this.setAttribute('href',
               this.getAttribute('href').replace(/\?/,'/text?'));
         }
      });
   }
   else if (item.tagName === 'A' &&
            post.parent().is('div.post_controls') &&
            post.closest('li.post').hasClass('regular')) {
      if (/[a-zA-Z0-9]\?/.test(item.href)) {
         item.setAttribute('href',
            item.getAttribute('href').replace(/\?/,'/text?'));
      }
   }
}

function doReblog(item,replaceIcons,accountName,queueTags) {
   var i;
   var reblogMode = {
      "normal":  '0',
      "draft":   '1',
      "queue":   '2',
      "private": 'private'
   };
   var type,url,postId;
   if ($(item).parent().hasClass('post_controls')) {
      type = 'normal';
      url = $(item).attr('href');
      postId = $(item).closest('li.post').attr('id').match(/[0-9]*$/)[0];
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
   var twitter = $('#MissingE_quick_reblog_twitter input').is(':checked');
   startReblog(postId,replaceIcons);
   $.ajax({
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

function MissingE_betterReblogs_dash_doStartup(noPassTags, quickReblog,
                                               replaceIcons, accountName,
                                               fullText,
                                               quickReblogForceTwitter,
                                               tagQueuedPosts, queueTags) {
   var lang = $('html').attr('lang');
   if (tagQueuedPosts !== 1) {
      queueTags = "";
   }
   if (noPassTags === 0) {
      var selector = '#posts div.post_controls a[href^="/reblog/"]';
      if (quickReblog === 1) {
         selector = '#MissingE_quick_reblog_manual';
      }
      $(selector).live('mousedown', function(e) {
         var tags;
         if (e.which !== 1 && e.which !== 2) { return; }
         if (this.id === 'MissingE_quick_reblog_manual') {
            tags = $('#MissingE_quick_reblog_tags input').val();
            tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
                     .replace(/^\s*/,'');
            if (tags !== '') {
               setReblogTagsPlainText(tags);
            }
         }
         else {
            tags = $(this).closest('li.post').find('span.tags a');
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
               tagarr.push($(this).text().replace(/^#/,''));
            });
            setReblogTags(tagarr);
         }
      });
   }
   if (fullText === 1) {
      $('#posts li.post.regular').each(function() {
         reblogTextFull(this);
      });
      $(document).bind('MissingEajax', function(e) {
         $.each(e.originalEvent.data.list, function(i, val) {
            reblogTextFull($('#'+val).get(0));
         });
      });
      $('#posts div.post_controls a').live('MissingEaddReblog', function() {
         reblogTextFull(this);
      });
   }
   if (quickReblog === 1) {
      var idx;
      $('head').append('<style type="text/css">' +
         '.MissingE_quick_reblogging_icon {' +
            'background-image:url("' +
            safari.extension.baseURI + 'betterReblogs/reblog_animated.gif' +
            '") !important; }' +
         '.MissingE_quick_reblogging_success {' +
            'background-image:url("' +
            safari.extension.baseURI + 'betterReblogs/reblog_success.png' +
            '") !important; }</style>');
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
      txt +=  '<a href="#" onclick="return false;" ' +
               'class="MissingE_quick_reblog_field">' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_twitter">' +
               '<input type="checkbox" /> ' + locale[lang].twitterText +
               '</div></div></a>';
      var list = $('#user_channels li');
      if (list.length > 0) {
         txt +=  '<a href="#" onclick="return false;" ' +
                  'class="MissingE_quick_reblog_field">' +
                  '<div class="user_menu_list_item has_tag_input">' +
                  '<div id="MissingE_quick_reblog_selector">' +
                  '<select>';
         list.each(function(i) {
            var acct = this.id.match(/tab-(.*)/);
            if (!acct) { return; }
            acct = acct[1];
            var sel = false;
            if ((accountName === 0 &&
                 i === 0) ||
                accountName === acct) {
               sel = true;
            }
            txt += '<option value="' + acct + '"' +
                     (sel ? ' selected="selected"' : '') + '>' + acct +
                     '</option>';
         });
         txt +=  '</select><br />Tumblr</div></div></a>';
      }
      txt += '<a href="#" onclick="return false;" ' +
               'class="MissingE_quick_reblog_field">' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_tags">' +
               '<input type="text" /><br />' + locale[lang].tagsText +
               '</div></div></a>';
      var qr = $(txt).appendTo('body');
      qr.find('#MissingE_quick_reblog_selector select').click(function(e) {
         e.stopPropagation();
         return false;
      }).change(function() {
         changeQuickReblogAcct($(this), quickReblogForceTwitter);
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
               resetTumblr = setTimeout(function() {
                  var sel = $('#MissingE_quick_reblog_selector select');
                  if (sel.find('option[value="' + accountName +
                               '"]').length > 0) {
                     sel.val(accountName);
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
         $(document).bind('keydown.MissingEqr', function(e) {
            if (e.keyCode === 27) {
               taginput.blur();
               return true;
            }
         });
      }).blur(function() {
         $(document).unbind('keydown.MissingEqr');
         qr.removeClass('MissingE_quick_reblog_tags_inputting');
         if (qr.data('off')) {
            qr.removeData('off');
            var sel = $('#MissingE_quick_reblog_selector select');
            if (sel.find('option[value="' + accountName +
                         '"]').length > 0) {
               sel.val(accountName);
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
      $('#posts div.post_controls a[href^="/reblog/"]')
            .live('mouseover',function() {
         var reblog = $(this);
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
         var marg = parseInt($('body').css('margin-top'));
         if (isNaN(marg)) { marg = 0; }
         var tagarr = [];
         if (noPassTags === 0) {
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
               var currtag = $(this).text().replace(/^#/,'');
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
         if (accountName !== '0') {
            arg = '&channel_id=' + accountName;
            if (!(/\?/.test(reblog.attr('href')))) {
               arg = arg.replace(/&/,'?');
            }
         }
         var newurl = reblog.attr('href').replace(/channel_id=[^&]*/,'')
                           .replace(/\?&/,'?').replace(/&&/,'&')
                           .replace(/[\?&]$/,'') + arg;
         qr.find('#MissingE_quick_reblog_manual').attr('href', newurl);
         qr.removeData('off');
         qr.css({'top':(pos.top+h-marg)+'px !important',
               left:(pos.left-w)+'px !important',
               'display':'block'});
      }).live('mouseout',function(e) {
         if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
             !$.contains(qr.get(0), e.relatedTarget)) {
            qr.css('display','');
            if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
               qr.data('off','off');
            }
            else {
               resetTumblr = setTimeout(function() {
                  var sel = $('#MissingE_quick_reblog_selector select');
                  if (sel.find('option[value="' + accountName +
                               '"]').length > 0) {
                     sel.val(accountName);
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
         if (me.hasClass('MissingE_quick_reblogging_icon') ||
             me.hasClass('MissingE_quick_reblogging_success') ||
             me.hasClass('MissingE_quick_reblogging_text') ||
             me.hasClass('MissingE_quick_reblogging_text_successs')) {
            return false;
         }
         var selector = $('#MissingE_quick_reblog_selector select');
         var account = accountName;
         if (selector.length > 0) {
            account = selector.val();
         }
         e.preventDefault();
         doReblog(this,replaceIcons,account,queueTags);
         return false;
      });

      qr.find('#MissingE_quick_reblog_twitter input').mousedown(function() {
         this.checked = !this.checked;
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
         var account = accountName;
         if (selector.length > 0) {
            account = selector.val();
         }
         doReblog(this,replaceIcons,account,queueTags);
      });

      if (quickReblogForceTwitter === "default") {
         getTwitterDefaults();
      }
      else if (quickReblogForceTwitter === "on") {
         $('#MissingE_quick_reblog_selector select').trigger('change');
      }
   }
}

