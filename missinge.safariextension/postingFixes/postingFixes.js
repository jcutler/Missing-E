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

/*global $ */

function addAskUploader(obj) {
   if (obj.tagName === 'LI' && $(obj).hasClass('post')) {
      var aid = obj.id.match(/[0-9]+$/)[0];
      var it = document.getElementById('ask_answer_form_container_' + aid);
      $(it).css('padding-top','0')
         .prepend('<div style="min-height:15px;">' +
                  '<div style="float:right;padding:3px 0;">' +
                  '<iframe src="/upload/image?from_assets" ' +
                  'id="regular_form_inline_image_iframe_' + aid +
                  '" width="130" height="16" border="0" scrolling="no" ' +
                  'allowtransparency="true" frameborder="0" ' +
                  'style="background-color:transparent; overflow:hidden;">' +
                  '</iframe></div><div class="clear"></div></div>');
   }
   else {
      return true;
   }
}

function changeButtonText(val, lang, submitText) {
   var text;
   if (val === '2') {
      text = submitText[lang].queue;
   }
   else if (val === '1') {
      text = submitText[lang].draft;
   }
   else {
      text = submitText[lang].publish;
   }
   $('#post_controls input[type="submit"]').val(text);
}

function showHideButtons(newbtns, val) {
   var tofind;
   newbtns.find('.current').removeClass('current');
   if (val === '0' || val === 'private') {
       tofind = 'publish';
   }
   else if (val === '2') { tofind = 'queue'; }
   else if (val === '1') { tofind = 'draft'; }
   else if (val === 'on.2') { tofind = 'delay'; }

   newbtns.find('#MissingE_' + tofind + 'Post').parent().addClass('current');
}

function MissingE_postingFixes_doStartup(photoReplies, uploaderToggle,
                                         addUploader, quickButtons) {

   var submitText = {
                     en: {
                           publish: "Publish post",
                           queue:   "Queue post",
                           draft:   "Save draft"
                         },
                     de: {
                           publish: "Eintrag publizieren",
                           queue:   "Eintrag in die Warteschleife stellen",
                           draft:   "Entwurf speichern"
                         },
                     fr: {
                           publish: "Publier le billet",
                           queue:   "Ajouter à la file d'attente",
                           draft:   "Enregistrer le brouillon"
                         },
                     it: {
                           publish: "Pubblica post",
                           queue:   "Metti post in coda",
                           draft:   "Salva bozza"
                         },
                     ja: {
                           publish: "投稿公開",
                           queue:   "キューに追加",
                           draft:   "下書き保存"
                         }
   };

   if (/http:\/\/www\.tumblr\.com\/edit\//.test(location.href)) {
      var i, txt="";
      var ctags;
      var posttags = document.getElementById('post_tags');
      if (posttags) {
         ctags = posttags.value;
      }
      if (ctags !== undefined && ctags !== null && ctags !== '') {
         ctags = ctags.split(',');
      }
      for (i=0; i<ctags.length; i++) {
         txt += '<div class="token"><span class="tag">' + ctags[i] +
                  '</span><a title="Remove tag" ' +
                  'onclick="tag_editor_remove_tag($(this).up()); ' +
                  'return false;" href="#">x</a></div>';
      }
      document.getElementById('tokens').innerHTML = txt;
   }

   var set_tags = $('#set_tags');
   $('<div style="text-align:right;"><a class="clear_tags" ' +
     'style="color:#666;font-size:10px;" href="#" ' +
     'onclick="document.getElementById(\'tokens\').innerHTML=\'\';' +
     'document.getElementById(\'post_tags\').value = \'\';' +
     'return false;">Clear Tags</a></div>').appendTo(set_tags);

   $('#photo_src').keyup(function(){
      if (/^http:\/\/https?:\/\//.test(this.value)) {
         this.value = this.value.replace(/^http:\/\//,'');
      }
   });

   if (quickButtons === 1 &&
       $('#post_state').length > 0 &&
       $('#post_state')
         .children('*[value="0"],*[value="1"],*[value="2"]').length >= 3) {
      if ($('#post_controls').css('position') !== 'absolute') {
         $('#post_controls').addClass('MissingE_post_controls');
      }

      var lang = $('html').attr('lang');
      var btn;
      var bottom;
      var isShare;

      if ($('body').attr('id') === 'bookmarklet_index') {
         isShare = true;
         btn = $('#post_controls input[type="submit"]');
         var bottom = $('#post_controls').outerHeight()/2 +
            $('#post_controls').find('input[type="submit"]').outerHeight()/2;
         bottom = Math.round(bottom);
         if ($('#post_state').val() === '0') {
            $('#post_controls input[type="submit"]')
               .val(submitText[lang].publish);
         }
      }
      else {
         isShare = false;
         btn = $('#save_button');
      }

      var allbtns = "";
      for (var i in submitText[lang]) {
         var klass = "";
         var div = "";
         allbtns += '<div><button id="MissingE_' + i + 'Post" ' +
                     'type="submit" class="positive" ' +
                     'onclick="return true;"><span>' +
                     submitText[lang][i] + '</span></button></div>';
      }
      var newbtns = $('<div id="MissingE_postMenu">' + allbtns + '</div>')
                     .insertAfter(btn);
      if (isShare) {
         $('#MissingE_postMenu').css('bottom',bottom + 'px');
      }
      $('#post_state').bind('change', function() {
         showHideButtons(newbtns, this.value);
      });
      newbtns.find('button').click(function() {
         if (!isShare) {
            $('head').append('<script type="text/javascript">' +
                             'is_preview=false;</script>');
         }
         if (this.id === 'MissingE_publishPost') {
            $('#post_state').val('0').trigger('change');
         }
         else if (this.id === 'MissingE_draftPost') {
            $('#post_state').val('1').trigger('change');
         }
         else if (this.id === 'MissingE_queuePost') {
            $('#post_state').val('2').trigger('change');
         }
         if (isShare) {
            $('#post_controls input[type="submit"]').trigger('click');
         }
      });
      $(document).ready(function() {
         showHideButtons(newbtns, $('#post_state').val());
         if (isShare) {
            changeButtonText($('#post_state').val(), lang, submitText);
         }
      });
   }

   if (photoReplies === 1) {
      var apr = document.getElementById("allow_photo_replies");
      if (apr !== null && apr !== undefined) { apr.checked = true; }
   }

   if (uploaderToggle === 1) {
      var url = document.getElementById("photo_url");
      var lnk = document.getElementById("use_url_link");

      if (url !== null && url !== undefined &&
          lnk !== null && lnk !== undefined) {
         var uil = lnk.cloneNode();
         uil.id = "use_img_link";
         uil.innerHTML = '<a href="#" onclick="Element.hide(\'photo_url\'); ' +
                           '$(\'photo_src\').value = \'\'; ' +
                           'Element.show(\'photo_upload\'); return false;">' +
                           'Upload images instead</a>';
         uil.style.marginTop = "7px";
         url.appendChild(uil);
      }
   }

   if (addUploader === 1 &&
       !(/\/new\/text/.test(location.href)) &&
       !(/\/new\/chat/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/messages/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/
            .test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/share/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/submissions/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/
            .test(location.href)) &&
       $('#regular_form_inline_image_iframe').length === 0) {
      var headings = $('h2');
      var h2 = headings.last();
      if (h2.parent().attr('id') === "photo_link") {
         h2 = headings.eq(-2);
      }

      //This will probably break at some point
      if (h2.length === 0) {
         var par = $('a.post_question_asker');
         if (par.length > 0) {
            par = par.parent().next();
            h2 = $('<h2>&nbsp;</h2>');
            par.after(h2);
            par.remove();
         }
      }

      var textarea = h2.nextAll('textarea:first').attr('id');
      var tag = '<img src=\\"X\\" />';
      if (h2.parent().find('div.editor_note:contains("markdown")')
                        .length !== 0) {
         tag = '![](X)';
      }
      h2.before('<div style="height:' + h2.css("margin-top") + ';"></div>')
         .css({"float":"left","margin-top":"0"})
         .after('<div style="float:right;padding-top:3px;">' +
                '<iframe src="/upload/image?from_assets" ' +
                'id="regular_form_inline_image_iframe" width="130" ' +
                'height="16" border="0" scrolling="no" ' +
                'allowtransparency="true" frameborder="0" ' +
                'style="background-color:transparent; overflow:hidden;">' +
                '</iframe></div><div class="clear"></div>');
      if (textarea && textarea !== "") {
         $('head').append('<script type="text/javascript">' +
                          'document.domain = "tumblr.com";' +
                          'function catch_uploaded_photo(src) {' +
                              'if (tinyMCE && (ed = tinyMCE.get("' +
                                       textarea + '"))) {' +
                                 'ed.execCommand("mceInsertContent", false, ' +
                                                 '"<img src=\\"" + src + "\\"' +
                                                 ' />");' +
                              '}' +
                              'else {' +
                                 'insertTag("' + textarea + '", ' +
                                            '"' + tag + '".replace(/X/,src));' +
                              '}' +
                          '}' +
                          '</script>');
      }
   }
   else if (addUploader === 1 &&
            /http:\/\/www\.tumblr\.com\/share/.test(location.href)) {
      var tag = '<img src=\\"X\\" />';
      $('textarea').each(function() {
         if ((this.name !== "post[two]" &&
             this.name !== "post[three]") ||
             /chat_/.test(this.id)) {
            return true;
         }

         var ta = $(this);
         var textarea = ta.attr('id');
         var h2 = ta.prevAll('h2:first');
         var uploader = '<div style="float:right;' +
                        (/regular_/.test(this.id) ? 'margin-bottom:5px;' :
                         'padding-top:3px;') + '">' +
                        '<iframe id="regular_form_inline_image_iframe_' +
                        textarea + '" src="/upload/image?from_assets" ' +
                        'width="130" height="16" border="0" scrolling="no" ' +
                        'allowtransparency="true" frameborder="0" ' +
                        'style="background-color:transparent; ' +
                        'overflow:hidden;"></iframe></div>' +
                        '<div style="clear:both;"></div>';
         if (h2.length > 0) {
            h2.before('<div style="height:' + h2.css("margin-top") +
                      ';"></div>').css({"float":"left","margin-top":"0"})
               .after(uploader);
         }
         else if (ta.parent().find('div.editor_controls').length > 0) {
            ta.parent().prepend(uploader);
         }
         else {
            ta.before(uploader);
         }
         if (ta.parent().find('div.editor_note:contains("markdown")')
                        .length !== 0) {
            tag = '![](X)';
         }
      });
      $('head').append('<script type="text/javascript">' +
                       'document.domain = "tumblr.com";' +
                       'function catch_uploaded_photo(src) {' +
                           'var e = catch_uploaded_photo.caller.arguments[0]' +
                                 '.currentTarget.frameElement.id' +
                                 '.match(/[a-zA-Z]*_post_[a-zA-Z]*$/)[0];' +
                           'if (tinyMCE && (ed = tinyMCE.get(e))) {' +
                              'ed.execCommand("mceInsertContent", false, ' +
                                              '"<img src=\\"" + src + "\\" ' +
                                              '/>");' +
                           '}' +
                           'else {'+
                              'insertTag(e, ' +
                                         '"' + tag + '".replace(/X/,src));' +
                           '}' +
                       '}' +
                       '</script>');
   }
   else if (addUploader === 1 &&
       (/http:\/\/www\.tumblr\.com\/messages/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/
            .test(location.href) ||
        /http:\/\/www\.tumblr\.com\/submissions/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/
            .test(location.href))) {
      $('#posts li.post a[id^="ask_answer_link_"]').live('click', function() {
         var post = $(this).closest("li.post");
         if (post.length > 0) {
            addAskUploader(post.get(0));
         }
      });
      $('head').append('<script type="text/javascript">' +
                       'document.domain = "tumblr.com";' +
                       'function catch_uploaded_photo(src) {' +
                           'var eId = catch_uploaded_photo.caller' +
                                       '.arguments[0].currentTarget' +
                                       '.frameElement.id' +
                                       '.match(/[0-9]*$/)[0];' +
                           'var e = "ask_answer_field_" + eId;' +
                           'if (tinyMCE && (ed = tinyMCE.get(e))) {' +
                              'ed.execCommand("mceInsertContent", false, ' +
                                              '"<img src=\\"" + src + "\\" ' +
                                              '/>");' +
                           '}' +
                           'else {' +
                              'var tag = "<img src=\\"X\\" />";' +
                              'var ta = document.getElementById(e);' +
                              'if (/markdown/' +
                                    '.test(ta.previousSibling.innerHTML)) {' +
                                 'tag = "![](X)";' +
                              '}' +
                              'insertTag(e, tag.replace(/X/,src));' +
                           '}' +
                       '}' +
                       '</script>');
   }
}

