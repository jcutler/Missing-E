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
   jQuery('#ask_queue_button_also_' + id).removeAttr('disabled');
   jQuery('#ask_cancel_button_' + id).removeAttr('disabled');
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
      jQuery('#ask_queue_button_also_' + id).attr('disabled','disabled');
      jQuery('#ask_cancel_button_' + id).attr('disabled','disabled');
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
   var answer = jQuery(item).find('form[action="/ask_publish"]');
   if (answer.length === 0) {
      return false;
   }
   var lang = jQuery('html').attr("lang");
   var id = jQuery(item).attr('id').match(/[0-9]*$/)[0];

   if (buttons === 1) {
      var allbtns = "";
      for (var i in locale[lang]["postingFixes"]["submitText"]) {
         if (i === 'publish') { continue; }
         var x = (i=='queue' ? 'also_' : '');
         allbtns += '<div><input id="ask_' + i + '_button_' + x + id + '" ' +
            'type="submit" class="positive" onclick="return false;" value="' +
            locale[lang]["postingFixes"]["submitText"][i] +
            '" /></div>';
      }
      var btn = jQuery('#ask_publish_button_' + id);
      var postbtn = jQuery('<input type="submit" name="publish" value="' + btn.val() + '" ' +
                      'id="ask_publish_button_also_' + id + '" class="positive" ' +
                      'onclick="return false;" style="margin-right:5px;" />');
      btn.after(postbtn);
      var newbtns = jQuery('<div class="MissingE_postMenu">' + allbtns + '</div>')
                     .insertAfter(postbtn);
      jQuery('#ask_queue_button_' + id).hide();
      btn.hide();
      jQuery('#ask_publish_button_also_' + id).click(function(e) {
         doManualAnswering(e, id, 'publish');
      });
      jQuery('#ask_queue_button_also_' + id).click(function(e) {
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
      var qbtn = jQuery('#ask_queue_button_' + id);
      var npbtn = jQuery('<input type="submit" name="publish" value="' +
                  pbtn.val() + '" id="ask_publish_button_also_' + id +
                  '" onclick="return false;" style="margin-right:5px;" />')
                     .insertBefore(pbtn);
      var nqbtn = jQuery('<input type="submit" name="queue" value="' + qbtn.val() +
                  '" id="ask_queue_button_also_' + id + '" onclick="' +
                  'return false;" style="margin-right:5px;" />')
                     .insertBefore(qbtn);
      pbtn.hide();
      qbtn.hide();
      npbtn.click(function(e) {
         doManualAnswering(e, id, 'publish');
      });
      nqbtn.click(function(e) {
         doManualAnswering(e, id, 'queue');
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
   var user = location.href
               .match(/http:\/\/www\.tumblr\.com\/tumblelog\/([^\/]*)/);
   if (user === null || user.length < 2) {
      var me = jQuery('#right_column span.dashboard_controls_posts');
      if (me.length > 0) {
         user = me.parent().attr('href').match(/[^\/]*$/)[0];
      }
      else {
         user = null;
      }
   }
   else {
      user = user[1];
   }

   if (message.buttons === 1 ||
       message.tags === 1) {
      jQuery('head').append('<script type="text/javascript">' +
                     'document.addEventListener(\'mouseup\', function(e) {' +
                     'if (e.which !== 1) { return; }' +
                     'if (!(/ask_[a-z]+_button/.test(e.target.id))) {' +
                        'return;' +
                     '}' +
                     'var id = e.target.id.match(/[0-9]*$/);' +
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
   document.addEventListener('DOMNodeInserted', function(e) {
      moreAnswerOptions(e.target, message.tagAsker,
                        message.defaultTags,
                        message.buttons,
                        message.tags);
   }, false);
});

self.postMessage({greeting: "settings", component: "askFixes"});
