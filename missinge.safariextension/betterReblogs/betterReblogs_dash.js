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

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
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
         .text(locale[lang]["reblogging"]);
   }
   a.attr('title',locale[lang]["reblogging"]);
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
   alert(locale[lang]["reblogFailed"]);
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
         .text(locale[lang]["rebloggedText"]);
   }
   a.attr('title',locale[lang]["rebloggedText"]);
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

function doReblog(item,replaceIcons,accountName) {
   var reblogMode = {
      normal:  '0',
      draft:   '1',
      queue:   '2',
      private: 'private'
   };
   var type,url,postId;
   if ($(item).parent().hasClass('post_controls')) {
      type = 'normal'
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
   tags = tags.replace(/,(\s*,)*/g,',').replace(/\s*,\s*/g,',').replace(/,$/,'')
            .replace(/^\s*/,'').replace(/\s*$/,'');
   var mode = reblogMode[type];
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
               params[name[1]] = $(inputs[i]).val();
            }
         }
         for (i=0; i<textareas.length; i++) {
            var name = textareas[i].match(/name="([^"]*)"/);
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

function MissingE_betterReblogs_dash_doStartup(passTags, quickReblog,
                                               replaceIcons, accountName,
                                               fullText) {
   var lang = $('html').attr('lang');
   if (passTags === 1) {
      var selector = '#posts div.post_controls a[href^="/reblog/"]';
      if (quickReblog === 1) {
         selector = '#MissingE_quick_reblog_manual';
      }
      $(selector).live('mousedown', function(e) {
         if (e.which !== 1 && e.which !== 2) { return; }
         if (this.id === 'MissingE_quick_reblog_manual') {
            var tags = $('#MissingE_quick_reblog_tags input').val();
            tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
                     .replace(/^\s*/,'');
            if (tags !== '') {
               setReblogTagsPlainText(tags);
            }
         }
         else {
            var tags = $(this).closest('li.post').find('span.tags a');
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
      document.addEventListener('DOMNodeInserted', function(e) {
         reblogTextFull(e.target);
      }, false);
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
      txt +=  '<a href="#" onclick="return false;">' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_twitter">' +
               '<input type="checkbox" /> ' + locale[lang]["twitterText"] +
               '</div></div></a>' +
               '<a href="#" onclick="return false;">' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_tags">' +
               '<input type="text" /><br />' + locale[lang]["tagsText"] +
               '</div></div></a>';
      var qr = $(txt).appendTo('body');

      qr.mouseout(function(){
         $(this).css('display','');
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
      });
      $('#posts div.post_controls a[href^="/reblog/"]')
            .live('mouseover',function() {
         var reblog = $(this);
         reblog.addClass('Missinge_quick_reblog_main');
         if (reblog.hasClass('MissingE_quick_reblogging_icon') ||
             reblog.hasClass('MissingE_quick_reblogging_success') ||
             reblog.hasClass('MissingE_quick_reblogging_text') ||
             reblog.hasClass('MissingE_quick_reblogging_text_successs')) {
            return;
         }
         var pos = reblog.offset();
         var h = reblog.outerHeight() - 2;
         var w = (qr.outerWidth()>>1) - (reblog.innerWidth()>>1);
         var marg = parseInt($('body').css('margin-top'));
         if (isNaN(marg)) { marg = 0; }
         var tagarr = [];
         if (passTags === 1) {
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
               var currtag = $(this).text().replace(/^#/,'');
               if (!(/^\s*$/.test(currtag))) {
                  tagarr.push(currtag);
               }
            });
         }
         var postId = reblog.closest('li.post').attr('id').match(/[0-9]*$/)[0];
         if (qr.find('div.user_menu_list').attr('id') !== 'list_for_'+postId) {
            qr.find('#MissingE_quick_reblog_tags input').val(tagarr.join(', '));
            qr.find('#MissingE_quick_reblog_twitter input').attr('checked', false);
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
         qr.css({'top':(pos.top+h-marg)+'px !important',
               left:(pos.left-w)+'px !important',
               'display':'block'});
      }).live('mouseout',function() {
         qr.css('display','');
      }).live('click',function(e) {
         var me = $(this);
         if (me.hasClass('MissingE_quick_reblogging_icon') ||
             me.hasClass('MissingE_quick_reblogging_success') ||
             me.hasClass('MissingE_quick_reblogging_text') ||
             me.hasClass('MissingE_quick_reblogging_text_successs')) {
            return false;
         }
         doReblog(this,replaceIcons,accountName);
         return false;
      });

      qr.find('#MissingE_quick_reblog_twitter input').mousedown(function() {
         this.checked = !this.checked;
         return false;
      });
      qr.find('a').click(function(e){
         if (e.target.tagName === 'INPUT') { return false; }
         doReblog(this,replaceIcons,accountName);
      });
   }
}

