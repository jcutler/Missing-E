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

function failAnswer(id,type) {
   jQuery('#post_control_loader_' + id).hide();
   jQuery('#ask_publish_button_also_' + id).removeAttr('disabled');
   jQuery('#ask_queue_button_' + id).removeAttr('disabled');
   jQuery('#ask_draft_button_' + id).removeAttr('disabled');
   jQuery('#ask_private_button_' + id).removeAttr('disabled');
   jQuery('#ask_cancel_button_' + id).removeAttr('disabled');
   jQuery('#private_answer_button_' + id).removeAttr('disabled');
   jQuery('#ask_answer_form_' + id + ' .MissingE_postMenu input')
      .attr('disabled','disabled');
}

function finishAnswer(id,type) {
   jQuery('#post_control_loader_' + id).hide();
   if (type) {
      jQuery('#post_' + id).fadeOut(function(){jQuery(this).remove()});
   }
}

function doManualAnswering(e,id,type) {
   var mode = '3';
   if (type === 'draft') { mode = '1'; }
   else if (type === 'private') { mode = 'private'; }
   else if (type === 'publish') { mode = '0'; }
   else if (type === 'queue') { mode = '2'; }

   if (type) {
      jQuery('#post_control_loader_' + id).show();
      jQuery('#ask_publish_button_also_' + id).attr('disabled','disabled');
      jQuery('#ask_queue_button_' + id).attr('disabled','disabled');
      jQuery('#ask_draft_button_' + id).attr('disabled','disabled');
      jQuery('#ask_private_button_' + id).attr('disabled','disabled');
      jQuery('#ask_cancel_button_' + id).attr('disabled','disabled');
      jQuery('#private_answer_button_' + id).attr('disabled','disabled');
      jQuery('#ask_answer_form_' + id + ' .MissingE_postMenu input')
         .attr('disabled','disabled');
   }
   var tags = jQuery('#ask_answer_form_' + id +
                ' input.MissingE_askFixes_tags');
   if (tags.length > 0) {
      tags = tags.val();
      tags = tags.replace(/,(\s*,)*/g,',').replace(/\s*,\s*/g,',').replace(/,$/,'')
               .replace(/^\s*/,'').replace(/\s*$/,'');
   }
   else {
      tags = '';
   }
   var twitter = jQuery('#ask_answer_form_' + id +
                   ' input.MissingE_askFixes_twitter').is(':checked');
   var answer = jQuery(jQuery('#ask_answer_form_' + id).get(0).answer).val();

   jQuery.ajax({
      type: "GET",
      url: "http://www.tumblr.com/edit/" + id,
      dataType: "html",
      postId: id,
      tags: tags,
      mode: mode,
      buttonType: type,
      answer: answer,
      twitter: twitter,
      error: function() {
         failAnswer(this.postId,this.buttonType);
      },
      success: function(data, textStatus) {
         var i;
         var frm = data.indexOf('<form');
         if (frm === -1) {
            failAnswer(this.postId,this.buttonType);
            return;
         }
         html = data.substr(frm);
         while (!(/^<form [^>]*id="edit_post"/.test(html))) {
            html = html.substr(1);
            frm = html.indexOf('<form');
            if (frm === -1) {
               failAnswer(this.postId,this.buttonType);
               return;
            }
            html = html.substr(frm);
         }
         html = html.substr(0,html.indexOf('</form>'));
         var inputs = html.match(/<input[^>]*>/g);
         var textareas = html.match(/<textarea[^>]*>[^<]*<\/textarea>/g);
         var params = {};
         for (i=0; i<inputs.length; i++) {
            var inp = jQuery(inputs[i]);
            var name = inp.attr('name');
            if (name) {
               params[name] = inp.val();
            }
         }
         for (i=0; i<textareas.length; i++) {
            var ta = jQuery(textareas[i]);
            var name = ta.attr('name');
            if (name) {
               params[name] = ta.text();
            }
         }
         params["post[tags]"] = this.tags;
         params["post[state]"] = this.mode;
         params["post[date]"] = "now";
         delete params["preview_post"];
         if (!this.twitter) {
            delete params["send_to_twitter"];
         }
         else {
            params["send_to_twitter"] = "on";
         }
         if (this.buttonType !== '3') {
            params["post[two]"] = this.answer;
         }
         jQuery.ajax({
            type: 'POST',
            url: this.url,
            postId: this.postId,
            buttonType: this.buttonType,
            data: params,
            error: function() {
               failAnswer(this.postId,this.buttonType);
            },
            success: function(data) {
               finishAnswer(this.postId,this.buttonType);
            }
         });
      }
   });

   return false;
}

function moreAnswerOptions(item, tagAsker, defTags, buttons, tags) {
   if (item.tagName !== 'LI' || !jQuery(item).hasClass('post')) {
      return false;
   }
   var answer = jQuery(item).find('form[action="#"]');
   if (answer.length === 0) {
      return false;
   }
   var lang = jQuery('html').attr('lang');
   if (!lang) { lang = 'en'; }
   var id = escapeHTML(jQuery(item).attr('id').match(/[0-9]*$/)[0]);
   if (buttons === 1) {
      var allbtns = "";
      for (var i in locale[lang]["postingFixes"]["submitText"]) {
         if (i === 'publish') { continue; }
         allbtns += '<button class="chrome" id="ask_' + i + '_button_' + id +
            '" onclick="return false;"><div class="chrome_button">' +
            '<div class="chrome_button_left"></div>' +
            locale[lang]["postingFixes"]["submitText"][i] +
            '<div class="chrome_button_right"></div></div></button><br />';
      }
      allbtns = allbtns.replace(/<br \/>$/,'');
      var btn = jQuery('#ask_publish_button_' + id);
      var postbtn = jQuery('<button class="chrome blue" ' +
                      'id="ask_publish_button_also_' + id + '" ' +
                      'name="publish" type="submit" onclick="return false;">' +
                      '<div class="chrome_button"><div ' +
                      'class="chrome_button_left"></div>' +
                      btn.text() + '<div class="chrome_button_right"></div>' +
                      '</div></button>');
      btn.after(postbtn);
      var newbtns = jQuery('<div class="MissingE_postMenu">' + allbtns + '</div>')
                     .insertAfter(postbtn);
      btn.hide();
      jQuery('#ask_publish_button_also_' + id).click(function(e) {
         doManualAnswering(e, id, 'publish');
      });
      jQuery('#ask_queue_button_' + id).click(function(e) {
         doManualAnswering(e, id, 'queue');
      });
      jQuery('#ask_draft_button_' + id).click(function(e) {
         doManualAnswering(e, id, 'draft');
      });
      jQuery('#ask_private_button_' + id).click(function(e) {
         doManualAnswering(e, id, 'private');
      });
   }
   else if (tags === 1) {
      var pbtn = jQuery('#ask_publish_button_' + id);
      var npbtn = jQuery('<button class="chrome blue" ' +
                    'id="ask_publish_button_also_' +
                    id + '" name="publish" type="submit" ' +
                    'onclick="return false;"><div class="chrome_button"><div ' +
                    'class="chrome_button_left"></div>' +
                    pbtn.text() + '<div class="chrome_button_right"></div>' +
                    '</div></button>');
      pbtn.after(npbtn);
      pbtn.hide();
      npbtn.click(function(e) {
         doManualAnswering(e, id, 'publish');
      });
   }

   if (buttons === 1 || tags === 1) {
      var x;
      var startTags = jQuery(item).find('div.post_info').text().match(/[0-9A-Za-z\-\_]+/);
      if (tagAsker === 1) {
         startTags = [startTags[0]];
      }
      else {
         startTags = [];
      }
      if (defTags !== '') {
         for (x=0; x<defTags.length; x++) {
            startTags.push(defTags[x]);
         }
      }
      if (startTags.length > 0) {
         startTags = startTags.join(', ');
      }
      else {
         startTags = '';
      }
      var adding = '<div class="MissingE_askFixes_group">';
      if (tags === 1) {
         adding += '<div>' + locale[lang]["tagsText"] + ': <input ' +
                     'type="text" class="MissingE_askFixes_tags" value="' +
                     startTags + '"/></div>';
      }
      adding += '<div>' + locale[lang]["twitterText"] + ': <input ' +
                  'type="checkbox" class="MissingE_askFixes_twitter" />' +
                  '</div></div>';
      answer.find('div:first').css('padding-top','10px')
         .addClass('MissingE_askFixes_buttons').before(adding);
   }
}

self.on('message', function (message) {
   if (message.greeting !== "settings" ||
       message.component !== "askFixes") {
      return;
   }
   else if (/http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href)) {
      if (message.scroll) {
         var style = document.createElement("link");
         style.setAttribute('rel','stylesheet');
         style.setAttribute('type','text/css');
         style.href = message.extensionURL + "askFixes/askboxScroll.css";
         document.getElementsByTagName('head')[0].appendChild(style);
      }
      return true;
   }

   jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
                    message.extensionURL + 'askFixes/askFixes.css" />');

   if (message.askDash === 1) {
      var i;
      var lang = jQuery('html').attr('lang');
      if (!lang) { lang = 'en'; }
      var askLabel = '<a class="MissingE_askPerson_avatar" href="#"></a>';
      for (i=0; i<locale[lang]["askPerson"].length; i++) {
         if (i>0) { askLabel += " "; }
         if (locale[lang]["askPerson"][i] === "U") {
            askLabel += '<span class="MissingE_askPerson"></span>';
         }
         else {
            askLabel += locale[lang]["askPerson"][i];
         }
      }
      askLabel += ':';
      jQuery('body').append('<div id="MissingE_askbox" style="display:none;">' +
                       '<p>' + askLabel + '</p>' +
                       '<iframe frameborder="0" scrolling="no" width="100%" ' +
                       'height="149" /></div>');
      jQuery('#posts div.user_menu_list a[href$="/ask"]')
            .live('click', function() {
         var user = escapeHTML(jQuery(this).closest('div.user_menu_list')
                        .find('a[following]').attr('href').match(/[^\/]*$/)
                        .join(''));
         var avatar = jQuery(this).closest('li.post')
                        .find('div.avatar_and_i a.post_avatar')
                        .css('background-image');
         avatar = avatar.replace(/64\./,'40.');
         var url = this.href.match(/(http[s]?:\/\/([^\/]*))/);
         if (url && url.length > 2) {
            jQuery('#MissingE_askbox .MissingE_askPerson')
               .html('<a href="' + url[1] + '">' + user + '</a>');
            jQuery('#MissingE_askbox .MissingE_askPerson_avatar')
               .attr('href',url[1]).css('background-image',avatar);
            jQuery.facebox({div:'#MissingE_askbox'}, 'MissingE_askbox_loaded');
            jQuery('#facebox .MissingE_askbox_loaded iframe')
               .attr('src','http://www.tumblr.com/ask_form/' + url[2]);
            return false;
         }
      });
   }
   if (/http:\/\/www\.tumblr\.com\/(tumblelog\/[^\/]*\/)?(submissions|messages|inbox)/
         .test(location.href)) {
      if (message.buttons === 1 ||
          message.tags === 1) {
         jQuery('head').append('<script type="text/javascript">' +
                        'document.addEventListener(\'mouseup\', function(e) {' +
                        'if (e.which !== 1) { return; }' +
                        'var trg = e.target;' +
                        'while (trg) {' +
                           'if (/ask_[a-z]+_button/.test(trg.id)) {' +
                              'break;' +
                           '}' +
                           'trg = trg.parentNode;' +
                        '}' +
                        'if (!trg || !(/ask_[a-z]+_button/.test(trg.id))) {' +
                           'return;' +
                        '}' +
                        'var id = trg.id.match(/[0-9]*$/);' +
                        'if (tinyMCE && tinyMCE.get(\'ask_answer_field_\' + id)) {' +
                           'document.getElementById(\'ask_answer_field_\' + id).value = ' +
                           'tinyMCE.get(\'ask_answer_field_\' + id).getContent();' +
                        '}},false);</script>');
      }
      jQuery('#posts li.post').each(function() {
         moreAnswerOptions(this, message.tagAsker,
                           message.defaultTags,
                           message.buttons,
                           message.tags);
      });
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_[0-9]+)/g);
         if (type === "messages") {
            jQuery.each(list, function(i,val) {
               moreAnswerOptions(jQuery('#'+val).get(0), message.tagAsker,
                                 message.defaultTags,
                                 message.buttons,
                                 message.tags);
            });
         }
      }, false);
   }
});

self.postMessage({greeting: "settings", component: "askFixes"});
