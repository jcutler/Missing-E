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
   var rebloggingText = {
      en: "reblogging...",
      de: "rebloggend...",
      fr: "rebloguant...",
      it: "rebloggando...",
      ja: "今リブログ..."
   };
   var lang = jQuery('html').attr('lang');
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.attr('oldtxt',a.attr('title'));
   jQuery('#MissingE_quick_reblog').css('display','none');
   if (replaceIcons === 1) {
      a.addClass('MissingE_quick_reblogging_icon');
   }
   else {
      a.addClass('MissingE_quick_reblogging_text').text(rebloggingText[lang]);
   }
   a.attr('title',rebloggingText[lang]);
}

function failReblog(id,replaceIcons) {
   var reblogFailed = {
      en: "Reblog failed!",
      de: "Reblog gescheitert!",
      fr: "Reblog a échoué!",
      it: "Reblog fallito!",
      ja: "リブログに失敗しました!"
   };
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
   alert(reblogFailed[lang]);
}

function finishReblog(id,replaceIcons) {
   var rebloggedText = {
      en: "reblogged",
      de: "gerebloggt",
      fr: "reblogué",
      it: "rebloggato",
      ja: "リブログ行われた"
   };
   var lang = jQuery('html').attr('lang');
   var a = jQuery('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   if (replaceIcons === 1) {
      a.removeClass('MissingE_quick_reblogging_icon')
       .addClass('MissingE_quick_reblogging_success');
   }
   else {
      a.addClass('MissingE_quick_reblogging_text_success')
         .text(rebloggedText[lang]);
   }
   a.attr('title',rebloggedText[lang]);
   a.removeAttr('oldtxt');
}

function doReblog(item,replaceIcons) {
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
   tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
            .replace(/^\s*/,'');
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
            var val = inputs[i].match(/[^\.]value="([^"]*)"/);
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
         params["channel_id"] = '0';
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

function MissingE_betterReblogs_dash_doStartup(extensionURL, passTags,
                                               quickReblog, replaceIcons) {
   var lang = jQuery('html').attr('lang');
   if (passTags === 1) {
      jQuery('#posts div.post_controls a[href^="/reblog/"]').live('mousedown',
                                                                function(e) {
         if (e.which !== 1 && e.which !== 2) { return; }
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
            tagarr.push(jQuery(this).html().replace(/^#/,''));
         });
         setReblogTags(tagarr);
      });
   }

   if (quickReblog === 1) {
      var r,s;
      var idx;
      var tagsText = {
                     en: "Tags",
                     de: "Tags",
                     fr: "Tags",
                     it: "Tag",
                     ja: "タグ"
      };
      var twitterText = {
                     en: "Send to Twitter",
                     de: "Auf Twitter posten",
                     fr: "Publier sur Twitter",
                     it: "Invia a Twitter",
                     ja: "投稿をTwitterにも送信"
      };
      var reblogOptions = [{text: {
                                    en: "Save draft",
                                    de: "Entwurf speichern",
                                    fr: "Enregistrer le brouillon",
                                    it: "Salva bozza",
                                    ja: "下書き保存"
                                  },
                           item: 'draft'},
                           {text: {
                                    en: "Queue",
                                    de: "Warteschleife stellen",
                                    fr: "File d'attente",
                                    it: "Metti in coda",
                                    ja: "キュー"
                                  },
                           item: 'queue'},
                           {text: {
                                    en: "Private",
                                    de: "Privat",
                                    fr: "Privé",
                                    it: "Privato",
                                    ja: "プライベート"
                                  },
                           item: 'private'},
                           {text: {
                                    en: "Reblog manually",
                                    de: "Rebloggen manuell",
                                    fr: "Rebloguer manuellement",
                                    it: "Reblogga manualmente",
                                    ja: "手動でリブログ"
                                  },
                           item: 'manual'}];
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
      for (idx=0; idx<reblogOptions.length; idx++) {
         var doonclick = 'onclick="return false;"';
         if (reblogOptions[idx].item === 'manual') {
            doonclick = '';
         }
         txt += '<a class="MissingE_quick_reblog_button" ' +
                 'id="MissingE_quick_reblog_' + reblogOptions[idx].item +
                 '" href="#" ' + doonclick + '>' +
                 '<div class="user_menu_list_item">' +
                 reblogOptions[idx].text[lang] + '</div></a>';
      }
      txt += '<span>' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_twitter">' +
               '<input type="checkbox" /> ' + twitterText[lang] +
               '</div></div></span>' +
               '<span>' +
               '<div class="user_menu_list_item has_tag_input">' +
               '<div id="MissingE_quick_reblog_tags">' +
               '<input type="text" /><br />' + tagsText[lang] +
               '</div></div></span>';
      var qr = jQuery(txt).appendTo('body');
      qr.find('#MissingE_quick_reblog_tags input').focus(function() {
         qr.addClass('MissingE_quick_reblog_tags_inputting');
      }).blur(function() {
         qr.removeClass('MissingE_quick_reblog_tags_inputting');
      });

      jQuery('#posts div.post_controls a[href^="/reblog/"]')
            .live('mouseover',function(e) {
         var reblog = jQuery(this);
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
               var currtag = jQuery(this).html().replace(/^#/,'');
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
         qr.find('#MissingE_quick_reblog_manual').attr('href',reblog.attr('href'));
         h = Math.round(pos.top+h);
         w = Math.round(pos.left-w);
         qr.css({'top':     h+'px',
                 'left':    w+'px',
                 'display': 'block'});
      }).live('mouseout',function() {
         qr.css('display','');
      }).live('click',function(e) {
         var me = jQuery(this);
         if (me.hasClass('MissingE_quick_reblogging_icon') ||
             me.hasClass('MissingE_quick_reblogging_success') ||
             me.hasClass('MissingE_quick_reblogging_text') ||
             me.hasClass('MissingE_quick_reblogging_text_successs')) {
            return false;
         }
         doReblog(this,replaceIcons);
         return false;
      });

      qr.find('#MissingE_quick_reblog_twitter input').mousedown(function() {
         this.checked = !this.checked;
         return false;
      }).click(function() {
         return false;
      });
      qr.find('a').click(function(e){
         if (e.target.tagName === 'INPUT') { return false; }
         doReblog(this,reblog_settings.replaceIcons);
      });
   }
}

