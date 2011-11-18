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

/*global $,getLocale,safari */

function setupMassDeleteAsk(item) {
   $('<span class="MissingEmassDeleteSpan">' +
     '<input type="checkbox" val="0" id="' + item.id + '_select" ' +
     'class="MissingEmassDeleteSelect" /></span>')
         .appendTo($(item).find('div.post_controls'));
}

function deleteMessages(key, lang) {
   var posts = [];
   var count = 0;
   var set = $('#posts li.MissingEmdSelected');
   if (set.length < 1) { return; }
   var exemplar = set.eq(0).data('blog');
   var remset = set.filter(function() {
      if (count >= 100) { return false; }
      if ($(this).data('blog') === exemplar) {
         count++;
         return true;
      }
      else { return false; }
   }).each(function(i) {
      if (i >= 100) { return false; }
      posts.push(this.id.match(/[0-9]+$/)[0]);
   });
   $.ajax({
      type: "POST",
      url: '/delete_posts',
      data: {"post_ids": posts.join(','),
             "form_key": key},
      error: function() {
         alert(getLocale(lang).massDelete.messagesError);
      },
      success: function() {
         remset.removeClass('MissingEmdSelected').remove();
         deleteMessages(key, lang);
      }
   });
}

function failAnswer(id) {
   $('#post_control_loader_' + id).hide();
   $('#ask_publish_button_also_' + id).removeAttr('disabled');
   $('#ask_queue_button_also_' + id).removeAttr('disabled');
   $('#ask_draft_button_also_' + id).removeAttr('disabled');
   $('#ask_private_button_' + id).removeAttr('disabled');
   $('#ask_cancel_button_' + id).removeAttr('disabled');
   $('#private_answer_button_' + id).removeAttr('disabled');
   $('#ask_answer_form_' + id + ' .MissingE_postMenu input')
      .attr('disabled','disabled');
}

function finishAnswer(id,type) {
   $('#post_control_loader_' + id).hide();
   if (type) {
      $('#post_' + id).fadeOut(function(){$(this).remove();});
   }
}

function doManualAnswering(id,type) {
   var mode = '3';
   if (type === 'draft') { mode = '1'; }
   else if (type === 'private') { mode = 'private'; }
   else if (type === 'publish') { mode = '0'; }
   else if (type === 'queue') { mode = '2'; }

   if (type) {
      $('#post_control_loader_' + id).show();
      $('#ask_publish_button_also_' + id).attr('disabled','disabled');
      $('#ask_queue_button_also_' + id).attr('disabled','disabled');
      $('#ask_draft_button_also_' + id).attr('disabled','disabled');
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
      tags = tags.replace(/,(\s*,)*/g,',').replace(/\s*,\s*/g,',')
               .replace(/,$/,'').replace(/^\s*/,'').replace(/\s*$/,'');
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
         failAnswer(this.postId);
      },
      success: function(data) {
         var i;
         var frm = data.indexOf('<form');
         if (frm === -1) {
            failAnswer(this.postId);
            return;
         }
         var html = data.substr(frm);
         while (!(/^<form [^>]*id="edit_post"/.test(html))) {
            html = html.substr(1);
            frm = html.indexOf('<form');
            if (frm === -1) {
               failAnswer(this.postId);
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
            var inp = $(inputs[i]);
            name = inp.attr('name');
            if (name) {
               params[name] = inp.val();
            }
         }
         for (i=0; i<textareas.length; i++) {
            var ta = $(textareas[i]);
            name = ta.attr('name');
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
               failAnswer(this.postId);
            },
            success: function() {
               finishAnswer(this.postId,this.buttonType);
            }
         });
      }
   });

   return false;
}

function moreAnswerOptions(item, tagAsker, defTags, betterAnswers) {
   var i;
   if (item.tagName !== 'LI' || !$(item).hasClass('post')) {
      return false;
   }
   var answer = $(item).find('form[action="#"]');
   if (answer.length === 0) {
      return false;
   }
   var lang = $('html').attr("lang");
   var id = $(item).attr('id').match(/[0-9]*$/)[0];

   if (betterAnswers === 1) {
      var allbtns = "";
      var suffix;
      for (i in getLocale(lang).postingFixes.submitText) {
         if (getLocale(lang).postingFixes.submitText.hasOwnProperty(i)) {
            if (i === 'publish') { continue; }
            if (i === 'queue' || i === 'draft') {
               suffix = 'also_';
            }
            else {
               suffix = '';
            }
            allbtns += '<button class="chrome" id="ask_' + i + '_button_' +
               suffix + id + '" onclick="return false;">' +
               '<div class="chrome_button">' +
               '<div class="chrome_button_left"></div>' +
               getLocale(lang).postingFixes.submitText[i] +
               '<div class="chrome_button_right"></div></div></button><br />';
         }
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
      $('<div class="MissingE_postMenu">' + allbtns + '</div>')
         .insertAfter(postbtn);
      btn.hide();
      $('#ask_publish_button_also_' + id).click(function() {
         doManualAnswering(id, 'publish');
      });
      $('#ask_queue_button_also_' + id).click(function() {
         doManualAnswering(id, 'queue');
      });
      $('#ask_draft_button_also_' + id).click(function() {
         doManualAnswering(id, 'draft');
      });
      $('#ask_private_button_' + id).click(function() {
         doManualAnswering(id, 'private');
      });

      var x;
      var startTags = $(item).find('div.post_info').text()
         .match(/[0-9A-Za-z\-\_]+/);
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
      adding += '<div>' + getLocale(lang).tagsText + ': <input ' +
                  'type="text" class="MissingE_askFixes_tags" value="' +
                  startTags + '"/></div>';
      adding += '<div>' + getLocale(lang).twitterText + ': <input ' +
                  'type="checkbox" class="MissingE_askFixes_twitter" />' +
                  '</div></div>';
      answer.find('div:first').css('padding-top','10px')
         .addClass('MissingE_askFixes_buttons').before(adding);
      $(item).find('input.MissingE_askFixes_tags').keydown(function(e) {
         if (e.which === 74 || e.which === 75) {
            e.stopPropagation();
         }
      });
   }
}

function MissingE_askFixes_doStartup(tagAsker, defaultTags, betterAnswers,
                                     askDash, massDelete) {
   var lang = $('html').attr('lang');
   if (askDash === 1) {
      var i;
      var askLabel = '<a class="MissingE_askPerson_avatar" href="#"></a>';
      for (i=0; i<getLocale(lang).askPerson.length; i++) {
         if (i>0) { askLabel += " "; }
         if (getLocale(lang).askPerson[i] === "U") {
            askLabel += '<span class="MissingE_askPerson"></span>';
         }
         else {
            askLabel += getLocale(lang).askPerson[i];
         }
      }
      askLabel += ':';
      $('body').append('<div id="MissingE_askbox" style="display:none;">' +
                       '<p>' + askLabel + '</p>' +
                       '<iframe frameborder="0" scrolling="no" width="100%" ' +
                       'height="150" /></div>');
      $('#posts div.user_menu_list a[href$="/ask"]').live('click', function() {
         var user = $(this).closest('div.user_menu_list').find('a[following]')
                        .attr('href').match(/[^\/]*$/);
         var avatar = $(this).closest('li.post')
                        .find('div.avatar_and_i a.post_avatar')
                        .css('background-image');
         avatar = avatar.replace(/64\./,'40.');
         var url = this.href.match(/(http[s]?:\/\/([^\/]*))/);
         if (url && url.length > 2) {
            var skipRender = false;
            var ifr = $('#facebox iframe');
            if (ifr.length > 0) {
               ifr = ifr.get(0);
               var referrer = 'http://www.tumblr.com/ask_form/' +
                                 encodeURI(url[2]);
               try {
                  referrer = ifr.contentDocument.referrer;
               }
               catch (e) {
               }
               if (ifr.src === 'http://www.tumblr.com/ask_form/' +
                                 encodeURI(url[2]) &&
                   referrer !== 'http://www.tumblr.com/ask_form/' +
                                 encodeURI(url[2])) {
                  skipRender = true;
                  $.facebox.show('MissingE_askbox_loaded');
               }
            }
            if (!skipRender) {
               $('#MissingE_askbox .MissingE_askPerson')
                  .html('<a href="' + url[1] + '">' + user + '</a>');
               $('#MissingE_askbox .MissingE_askPerson_avatar')
                  .attr('href',url[1]).css('background-image',avatar);
               $.facebox({div:'#MissingE_askbox'}, 'MissingE_askbox_loaded');
               $('#facebox .MissingE_askbox_loaded iframe')
                  .attr('src','http://www.tumblr.com/ask_form/' + url[2]);
               $('#facebox').draggable({
                  containment:'document',
                  start: function(e) {
                     if ($(e.target).find('div.MissingE_askbox_loaded')
                           .length === 0) {
                        return false;
                     }
                  }
               });
            }
            return false;
         }
      });
   }
   if (/http:\/\/www\.tumblr\.com\/(blog\/[^\/]*\/)?(submissions|messages|inbox)/
         .test(location.href)) {
      if (betterAnswers) {
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
         moreAnswerOptions(this, tagAsker, defaultTags, betterAnswers);
      });
      $(document).bind('MissingEajax', function(e) {
         if (e.originalEvent.data.type === "messages") {
            $.each(e.originalEvent.data.list, function(i, val) {
               moreAnswerOptions($('#'+val).get(0), tagAsker, defaultTags,
                                 betterAnswers);
            });
         }
      });
      if (massDelete === 1) {
         var afterguy = $('#right_column a.settings');
         var beforeguy;
         if (afterguy.length > 0) {
            beforeguy = afterguy.closest('ul').next();
         }
         else {
            beforeguy = $('#MissingE_sidebar');
            if (beforeguy.length === 0) {
               beforeguy = $('#search_form');
            }
         }
         $('head').append('<style type="text/css">' +
                          '#right_column #MissingEmassDeleter a { ' +
                          'background-image:url("' +
                          safari.extension.baseURI + "askFixes/massDelete.png" +
                          '") !important; }</style>');
         $('<ul class="controls_section" id="MissingEmassDeleter">' +
           '<li><a href="#" class="select_all">' +
           '<div class="hide_overflow">' +
           getLocale(lang).massDelete.selectAll + '</div></a></li>' +
           '<li><a href="#" class="deselect_all">' +
           '<div class="hide_overflow">' +
           getLocale(lang).massDelete.deselectAll + '</div></a></li>' +
           '<li><a href="#" class="delete_selected">' +
           '<div class="hide_overflow">' +
           getLocale(lang).massDelete.deleteSelected + '</div></a></li></ul>')
               .insertBefore(beforeguy);
         $('#posts li.post').each(function() {
            setupMassDeleteAsk(this);
         });
         $(document).bind('MissingEajax', function(e) {
            if (e.originalEvent.data.type === "messages") {
               $.each(e.originalEvent.data.list, function(i, val) {
                  setupMassDeleteAsk($('#'+val).get(0));
               });
            }
         });
         $('#MissingEmassDeleter a').click(function() {
            var btn = $(this);
            if (btn.hasClass('select_all')) {
               $('#posts input.MissingEmassDeleteSelect').each(function() {
                  this.checked = true;
                  $(this).trigger('change');
               });
            }
            else if (btn.hasClass('deselect_all')) {
               $('#posts input.MissingEmassDeleteSelect').each(function() {
                  this.checked = false;
                  $(this).closest('li.post').removeClass('MissingEmdSelected');
               });
            }
            else if (btn.hasClass('delete_selected')) {
               var key = $('#posts input[name="form_key"]:first').val();
               var count = $('#posts li.MissingEmdSelected').length;
               if (count > 0) {
                  var sureMsg = getLocale(lang).massDelete.messagesConfirm
                                    .replace('#',count);
                  if (getLocale(lang).massDelete.confirmReplace) {
                     var countOp = count;
                     switch(getLocale(lang).massDelete
                              .confirmReplace.operation[0]) {
                        case "+":
                           countOp += getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                        case "-":
                           countOp -= getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                        case "%":
                           countOp %= getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                     }
                     if (getLocale(lang).massDelete.confirmReplace[countOp]) {
                        var r;
                        var repls = getLocale(lang).massDelete
                                       .confirmReplace[countOp];
                        for (r in repls) {
                           if (repls.hasOwnProperty(r)) {
                              sureMsg = sureMsg.replace(r,repls[r]);
                           }
                        }
                     }
                  }
                  var sure = confirm(sureMsg);
                  if (sure) {
                     deleteMessages(key, lang);
                  }
               }
            }
            return false;
         });
         $('input.MissingEmassDeleteSelect').live('change', function() {
            var item = $(this).closest('li.post');
            if (this.checked) {
               item.addClass('MissingEmdSelected');
               if (!item.data('blog')) {
                  if (item.find('div.post_controls a').length <= 1) {
                     item.data('blog','private');
                  }
                  else {
                     var blog = item.find('a.permalink').attr('href');
                     blog = blog.replace(/^[^\/]*\/\//,'').replace(/\/.*/,'');
                     item.data('blog',blog);
                  }
               }
            }
            else {
               item.removeClass('MissingEmdSelected');
            }
         });
      }
   }
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

function MissingE_askFixes_domain_doStartup() {
   var top;
   try {
      top = window.top.location.href;
   }
   catch (e) {
   }
   if (top === undefined) {
      document.domain = "tumblr.com";
   }
}
