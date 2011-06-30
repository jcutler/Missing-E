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

function changeQuickReblogAcct(sel) {
   var rm = jQuery('#MissingE_quick_reblog_manual');
   var curhref = rm.attr('href');
   if (/channel_id=/.test(curhref)) {
      rm.attr('href',curhref.replace(/channel_id=[^&]*/,'channel_id=' +
                                     sel.val()));
   }
   else {
      rm.attr('href',curhref + '&channel_id=' + sel.val());
   }
}

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function setReblogTagsPlainText(tags) {
   localStorage.setItem('tbr_ReblogTags',tags);
}

function startReblog(id,replaceIcons) {
   var lang = jQuery('html').attr('lang');
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.attr('oldtxt',a.attr('title'));
   jQuery('#MissingE_quick_reblog').css('display','none');
   if (replaceIcons === 1) {
      a.addClass('MissingE_quick_reblogging_icon');
   }
   else {
      a.addClass('MissingE_quick_reblogging_text')
         .text(locale[lang]["reblogging"]);
   }
   a.attr('title',locale[lang]["reblogging"]);
}

function failReblog(id,replaceIcons) {
   var lang = jQuery('html').attr('lang');
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   if (replaceIcons === 1) {
      a.removeClass('MissingE_quick_reblogging_icon');
   }
   else {
      a.removeClass('MissingE_quick_reblogging_text').text(a.attr('oldtxt'));
   }
   a.attr('title',a.attr('oldtxt'));
   a.removeAttr('oldtxt');
   alert(locale[lang]["reblogFailed"]);
}

function finishReblog(id,replaceIcons) {
   var lang = jQuery('html').attr('lang');
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   if (replaceIcons === 1) {
      a.removeClass('MissingE_quick_reblogging_icon')
       .addClass('MissingE_quick_reblogging_success');
   }
   else {
      a.addClass('MissingE_quick_reblogging_text_success')
         .text(locale[lang]["rebloggedText"]);
   }
   a.attr('title',locale[lang]["rebloggedText"]);
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

function doReblog(item,replaceIcons,accountName) {
   var reblogMode = {
      normal:  '0',
      draft:   '1',
      queue:   '2',
      private: 'private'
   };
   var type,url,postId;
   if (jQuery(item).parent().hasClass('post_controls')) {
      type = 'normal'
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
   tags = tags.replace(/,(\s*,)*/g,',').replace(/\s*,\s*/g,',').replace(/,$/,'')
            .replace(/^\s*/,'').replace(/\s*$/,'');
   var mode = reblogMode[type];
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
         html = data.substr(frm);
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
         for (i=0; i<inputs.length; i++) {
            var name = inputs[i].match(/name="([^"]*)"/);
            if (name) {
               params[name[1]] = jQuery(inputs[i]).val();
            }
         }
         for (i=0; i<textareas.length; i++) {
            var name = textareas[i].match(/name="([^"]*)"/);
            if (name && !(/id="custom_tweet"/.test(textareas[i]))) {
               params[name[1]] = jQuery(textareas[i]).text();
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
   if (message.passTags === 1) {
      var selector = '#posts div.post_controls a[href^="/reblog/"]';
      if (message.quickReblog === 1) {
         selector = '#MissingE_quick_reblog_manual';
      }
      jQuery(selector).live('mousedown', function(e) {
         if (e.which !== 1 && e.which !== 2) { return; }
         if (this.id === 'MissingE_quick_reblog_manual') {
            var tags = jQuery('#MissingE_quick_reblog_tags input').val();
            tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
                     .replace(/^\s*/,'');
            if (tags !== '') {
               setReblogTagsPlainText(tags);
            }
         }
         else {
            var tags = jQuery(this).closest('li.post').find('span.tags a');
            var tagarr = [];
            if (/http:\/\/www\.tumblr\.com\/tagged\//.test(location.href)) {
               var i;
               var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
               str = str.replace(/\?/,'').replace(/\+/,' ');
               var entities = str.match(/%[0-9a-fA-F]{2}/g);
               if (entities !== undefined && entities !== null) {
                  for (i=0; i<entities.length; i++) {
                     var repl = String.fromCharCode(parseInt(entities[i].replace(/%/,''),16));
                     str = str.replace(entities[i],repl);
                  }
               }
               tagarr.push(str);
            }
            tags.each(function() {
               tagarr.push(jQuery(this).text().replace(/^#/,''));
            });
            setReblogTags(tagarr);
         }
      });
   }
   if (message.fullText === 1) {
      jQuery('#posts li.post.regular').each(function() {
         reblogTextFull(this);
      });
      document.addEventListener('DOMNodeInserted', function(e) {
         reblogTextFull(e.target);
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
         try{
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
      for (idx=0; idx<locale[lang]["reblogOptions"].length; idx++) {
         var doonclick = 'onclick="return false;"';
         if (locale[lang]["reblogOptions"][idx].item === 'manual') {
            doonclick = '';
         }
         txt += '<a class="MissingE_quick_reblog_button" ' +
                 'id="MissingE_quick_reblog_' +
                 locale[lang]["reblogOptions"][idx].item +
                 '" href="#" ' + doonclick + '>' +
                 '<div class="user_menu_list_item">' +
                 locale[lang]["reblogOptions"][idx].text + '</div></a>';
      }
      txt += '<span>' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_twitter">' +
               '<input type="checkbox" /> ' + locale[lang]["twitterText"] +
               '</div></div></span>';
      var list = jQuery('#user_channels li');
      if (list.length > 0) {
         txt +=  '<span>' +
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
      txt += '<span>' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_tags">' +
               '<input type="text" /><br />' + locale[lang]["tagsText"] +
               '</div></div></span>';
      var qr = jQuery(txt).appendTo('body');
      qr.find('#MissingE_quick_reblog_selector select').click(function(e) {
         e.stopPropagation();
         return false;
      }).change(function() {
         changeQuickReblogAcct(jQuery(this));
      });
      qr.mouseout(function(e){
         if (!jQuery.contains(qr.get(0), e.relatedTarget) &&
             !jQuery(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
            jQuery(this).css('display','');
            var sel = jQuery('#MissingE_quick_reblog_selector select');
            if (sel.find('option[value="' + message.accountName +
                         '"]').length > 0) {
               sel.val(message.accountName);
            }
            else {
               sel.val(sel.find('option:first').val());
            }
            changeQuickReblogAcct(sel);
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
                     var repl = String.fromCharCode(parseInt(entities[i].replace(/%/,''),16));
                     str = str.replace(entities[i],repl);
                  }
               }
               tagarr.push(str);
            }
            tags.each(function() {
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
         qr.css('cssText', 'top:' + h + 'px !important;' +
                           'left:' + w + 'px !important;' +
                           'display:block;');
      }).live('mouseout',function(e) {
         if (!jQuery.contains(qr.get(0), e.relatedTarget)) {
            qr.css('display','');
            var sel = jQuery('#MissingE_quick_reblog_selector select');
            if (sel.find('option[value="' + reblog_settings.accountName +
                         '"]').length > 0) {
               sel.val(reblog_settings.accountName);
            }
            else {
               sel.val(sel.find('option:first').val());
            }
            changeQuickReblogAcct(sel);
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
         doReblog(this,message.replaceIcons,account);
         return false;
      });

      qr.find('#MissingE_quick_reblog_twitter input').mousedown(function() {
         this.checked = !this.checked;
         return false;
      }).click(function() {
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
         doReblog(this,message.replaceIcons,account);
      });
   }
});

self.postMessage({greeting: "settings", component: "betterReblogs",
                  subcomponent: "dash"});
