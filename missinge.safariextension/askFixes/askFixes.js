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
   $('#post_control_loader_' + id).hide();
   $('#ask_publish_button_also_' + id).removeAttr('disabled');
   $('#ask_queue_button_' + id).removeAttr('disabled');
   $('#ask_draft_button_' + id).removeAttr('disabled');
   $('#ask_private_button_' + id).removeAttr('disabled');
   $('#ask_cancel_button_' + id).removeAttr('disabled');
   $('#private_answer_button_' + id).removeAttr('disabled');
   $('#ask_answer_form_' + id + ' .MissingE_postMenu input')
      .attr('disabled','disabled');
}

function finishAnswer(id,type) {
   $('#post_control_loader_' + id).hide();
   if (type) {
      $('#post_' + id).fadeOut(function(){$(this).remove()});
   }
}

function doManualAnswering(e,id,type) {
   var mode = '3';
   if (type === 'draft') { mode = '1'; }
   else if (type === 'private') { mode = 'private'; }
   else if (type === 'publish') { mode = '0'; }
   else if (type === 'queue') { mode = '2'; }

   if (type) {
      $('#post_control_loader_' + id).show();
      $('#ask_publish_button_also_' + id).attr('disabled','disabled');
      $('#ask_queue_button_' + id).attr('disabled','disabled');
      $('#ask_draft_button_' + id).attr('disabled','disabled');
      $('#ask_private_button_' + id).attr('disabled','disabled');
      $('#ask_cancel_button_' + id).attr('disabled','disabled');
      $('#private_answer_button_' + id).attr('disabled','disabled');
      $('#ask_answer_form_' + id + ' .MissingE_postMenu input')
         .attr('disabled','disabled');
   }
   var tags = $('#ask_answer_form_' + id +
                ' input.MissingE_askFixes_tags');
   if (tags.length > 0) {
      tags = tags.val();
      tags = tags.replace(/,(\s*,)*/g,',').replace(/\s*,\s*/g,',').replace(/,$/,'')
               .replace(/^\s*/,'').replace(/\s*$/,'');
   }
   else {
      tags = '';
   }
   var twitter = $('#ask_answer_form_' + id +
                   ' input.MissingE_askFixes_twitter').is(':checked');
   var answer = $($('#ask_answer_form_' + id).get(0).answer).val();

   $.ajax({
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
            var inp = $(inputs[i]);
            var name = inp.attr('name');
            if (name) {
               params[name] = inp.val();
            }
         }
         for (i=0; i<textareas.length; i++) {
            var ta = $(textareas[i]);
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
         $.ajax({
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
   if (item.tagName !== 'LI' || !$(item).hasClass('post')) {
      return false;
   }
   var answer = $(item).find('form[action="#"]');
   if (answer.length === 0) {
      return false;
   }
   var lang = $('html').attr("lang");
   var id = $(item).attr('id').match(/[0-9]*$/)[0];

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
      var btn = $('#ask_publish_button_' + id);
      var postbtn = $('<button class="chrome blue" ' +
                      'id="ask_publish_button_also_' + id + '" ' +
                      'name="publish" type="submit" onclick="return false;">' +
                      '<div class="chrome_button"><div ' +
                      'class="chrome_button_left"></div>' +
                      btn.text() + '<div class="chrome_button_right"></div>' +
                      '</div></button>');
      btn.after(postbtn);
      var newbtns = $('<div class="MissingE_postMenu">' + allbtns + '</div>')
                     .insertAfter(postbtn);
      btn.hide();
      $('#ask_publish_button_also_' + id).click(function(e) {
         doManualAnswering(e, id, 'publish');
      });
      $('#ask_queue_button_' + id).click(function(e) {
         doManualAnswering(e, id, 'queue');
      });
      $('#ask_draft_button_' + id).click(function(e) {
         doManualAnswering(e, id, 'draft');
      });
      $('#ask_private_button_' + id).click(function(e) {
         doManualAnswering(e, id, 'private');
      });
   }
   else if (tags === 1) {
      var pbtn = $('#ask_publish_button_' + id);
      var npbtn = $('<button class="chrome blue" id="ask_publish_button_also_' +
                    id + '" name="publish" type="submit" ' +
                    'onclick="return false;"><div class="chrome_button"><div ' +
                    'class="chrome_button_left"></div>' +
                    pbtn.text() + '<div class="chrome_button_right"></div>' +
                    '</div></button>');
      pbtn.hide();
      npbtn.click(function(e) {
         doManualAnswering(e, id, 'publish');
      });
   }

   if (buttons === 1 || tags === 1) {
      var x;
      var startTags = $(item).find('div.post_info').text().match(/[0-9A-Za-z\-\_]+/);
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

function MissingE_askFixes_doStartup(tagAsker, defaultTags, buttons, tags) {
   if (buttons === 1 || tags === 1) {
      $('head').append('<script type="text/javascript">' +
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
   $('#posts li.post').each(function() {
      moreAnswerOptions(this, tagAsker, defaultTags, buttons, tags);
   });
   document.addEventListener('DOMNodeInserted', function(e) {
      moreAnswerOptions(e.target, tagAsker, defaultTags, buttons, tags);
   }, false);
}

function MissingE_askFixes_scroll_doStartup() {
   if (/http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href)) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = safari.extension.baseURI + "askFixes/askboxScroll.css";
      document.getElementsByTagName('head')[0].appendChild(style);
   }
}
