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
   if (obj.tagName === 'LI' && jQuery(obj).hasClass('post')) {
      var aid = obj.id.match(/[0-9]+$/)[0];
      var it = document.getElementById('ask_answer_form_container_' + aid);
      jQuery(it).css('padding-top','0')
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

function changeButtonText(val, submitText) {
   var text;
   if (val === '2') {
      text = submitText.queue;
   }
   else if (val === '1') {
      text = submitText.draft;
   }
   else if (val === 'private') {
      text = submitText.private;
   }
   else {
      text = submitText.publish;
   }
   jQuery('#post_controls input[type="submit"]:first').val(text);
}

function showHideButtons(newbtns, val) {
   var tofind;
   newbtns.find('.current').removeClass('current');
   if (val === '0') { tofind = 'publish'; }
   else if (val === 'private') { tofind = 'private'; }
   else if (val === '2') { tofind = 'queue'; }
   else if (val === '1') { tofind = 'draft'; }
   else if (val === 'on.2') { tofind = 'delay'; }

   newbtns.find('#MissingE_' + tofind + 'Post').parent().addClass('current');
}

self.on('message', function(message) {
   if (message.greeting !== "settings" ||
       message.component !== "postingFixes") {
      return;
   }
   var extensionURL = message.extensionURL;
   var lang = jQuery('html').attr('lang');

   jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
                         extensionURL + 'postingFixes/postingFixes.css" />');

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

   var set_tags = jQuery('#set_tags');
   jQuery('<div style="text-align:right;">' +
     '<a class="clear_tags" style="color:#666;font-size:10px;" href="#" ' +
     'onclick="document.getElementById(\'tokens\').innerHTML=\'\';' +
     'document.getElementById(\'post_tags\').value = \'\';' +
     'return false;">' + locale[lang]["postingFixes"]["clearTagsText"] +
     '</a></div>')
         .appendTo(set_tags);

   jQuery('#photo_src').keyup(function(){
      if (/^http:\/\/https?:\/\//.test(this.value)) {
         this.value = this.value.replace(/^http:\/\//,'');
      }
   });

   if (message.blogSelect === 1 &&
       jQuery('select#channel_id').length > 0) {
      var extrachan = jQuery('<select id="extra_channel"></select>')
                        .insertAfter('#preview_button');
      extrachan.wrap('<div id="extra_channel_outer" />');
      extrachan.append(jQuery('#channel_id').html());
      extrachan.val(jQuery('#channel_id').val());
      extrachan.bind('change',function() {
         jQuery('#channel_id').val(jQuery(this).val());
         var evt = document.createEvent("HTMLEvents");
         evt.initEvent("change", false, true);
         document.getElementById('channel_id').dispatchEvent(evt);
      });
      jQuery('#channel_id').bind('change',function() {
         extrachan.val(jQuery(this).val());
      });
   }
   if (message.quickButtons === 1 &&
       jQuery('#post_state').length > 0 &&
       jQuery('#post_state')
         .children('*[value="0"],*[value="1"],*[value="2"],*[value="private"]')
         .length >= 4) {
      if (jQuery('#post_controls').css('position') !== 'absolute') {
         jQuery('#post_controls').addClass('MissingE_post_controls');
      }

      var btn;
      var bottom;
      var isShare;

      if (jQuery('body').attr('id') === 'bookmarklet_index') {
         isShare = true;
         btn = jQuery('#post_controls input[type="submit"]');
         var bottom = jQuery('#post_controls').outerHeight()/2 +
            jQuery('#post_controls')
               .find('input[type="submit"]').outerHeight()/2;
         bottom = Math.round(bottom);
         if (jQuery('#post_state').val() === '0') {
            jQuery('#post_controls input[type="submit"]')
               .val(locale[lang]["postingFixes"]["submitText"].publish);
         }
      }
      else {
         isShare = false;
         btn = jQuery('#save_button');
      }

      var allbtns = "";

      var doOnClick = 'return true;';
      if (isShare) {
         jQuery('#post_controls input[type="submit"]:first')
            .attr('id','the_submit_btn');
         doOnClick = 'document.getElementById(\'the_submit_btn\').click();' +
                     doOnClick;
      }
      for (var i in locale[lang]["postingFixes"]["submitText"]) {
         var klass = "";
         var div = "";
         allbtns += '<div><button id="MissingE_' + i + 'Post" ' +
                     'type="submit" class="positive" ' +
                     'onclick="' + doOnClick + '"><span>' +
                     locale[lang]["postingFixes"]["submitText"][i] +
                     '</span></button></div>';
      }
      var newbtns = jQuery('<div id="MissingE_postMenu">' + allbtns + '</div>')
                     .insertAfter(btn);
      if (isShare) {
         jQuery('#MissingE_postMenu').css('bottom',bottom + 'px');
      }
      jQuery('#post_state').bind('change', function() {
         showHideButtons(newbtns, this.value);
      });
      newbtns.find('button').mouseup(function() {
         if (!isShare) {
            jQuery('head').append('<script type="text/javascript">' +
                             'is_preview=false;</script>');
         }
         if (this.id === 'MissingE_publishPost') {
            jQuery('#post_state').val('0').get(0).onchange();
         }
         else if (this.id === 'MissingE_draftPost') {
            jQuery('#post_state').val('1').get(0).onchange();
         }
         else if (this.id === 'MissingE_queuePost') {
            jQuery('#post_state').val('2').get(0).onchange();
         }
         else if (this.id === 'MissingE_privatePost') {
            jQuery('#post_state').val('private').get(0).onchange();
         }
      });
      showHideButtons(newbtns, jQuery('#post_state').val());
      if (isShare) {
         changeButtonText(jQuery('#post_state').val(), locale[lang]["postingFixes"]["submitText"]);
      }
   }

   if (message.photoReplies === 1) {
      var apr = document.getElementById("allow_photo_replies");
      if (apr !== null && apr !== undefined) { apr.checked = true; }
   }

   if (message.uploaderToggle === 1) {
      var url = document.getElementById("photo_url");
      var lnk = document.getElementById("use_url_link");

      if (url !== null && url !== undefined &&
          lnk !== null && lnk !== undefined) {
         var uil = lnk.cloneNode(true);
         uil.id = "use_img_link";
         uil.innerHTML = '<a href="#" onclick="Element.hide(\'photo_url\'); ' +
                           '$(\'photo_src\').value = \'\'; ' +
                           'Element.show(\'photo_upload\'); return false;">' +
                           locale[lang]["uploadImagesText"] + '</a>';
         uil.style.marginTop = "7px";
         url.appendChild(uil);
      }
   }

   if (message.addUploader === 1 &&
       !(/\/new\/text/.test(location.href)) &&
       !(/\/new\/chat/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/messages/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/
            .test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/share/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/submissions/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/
            .test(location.href)) &&
       jQuery('#regular_form_inline_image_iframe').length === 0) {
      var headings = jQuery('h2');
      var h2 = headings.last();
      if (h2.parent().attr('id') === "photo_link") {
         h2 = headings.eq(-2);
      }

      //This will probably break at some point
      if (h2.length === 0) {
         var par = jQuery('a.post_question_asker');
         if (par.length > 0) {
            par = par.parent().next();
            h2 = jQuery('<h2>&nbsp;</h2>');
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
         jQuery('head').append('<script type="text/javascript">' +
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
   else if (message.addUploader === 1 &&
            /http:\/\/www\.tumblr\.com\/share/.test(location.href)) {
      var tag = '<img src=\\"X\\" />';
      jQuery('textarea').each(function() {
         if ((this.name !== "post[two]" &&
             this.name !== "post[three]") ||
             /chat_/.test(this.id)) {
            return true;
         }

         var ta = jQuery(this);
         var textarea = ta.attr('id');
         var h2 = ta.prevAll('h2:first');
         var uploader = '<iframe id="regular_form_inline_image_iframe_' +
                        textarea + '" src="/upload/image?from_assets" ' +
                        'width="130" height="16" border="0" scrolling="no" ' +
                        'allowtransparency="true" frameborder="0" ' +
                        'style="background-color:transparent; ' +
                        'overflow:hidden;"></iframe>';
         var wrap = ['<div style="float:right;' +
                     (/regular_/.test(this.id) ? 'margin-bottom:5px;' :
                      'padding-top:3px;') + '">',
                     '</div><div style="clear:both;"></div>'];
         var imgwrap = ['<div style="text-align:right;margin-top:-19px;' +
                        'margin-bottom:3px;">','</div>'];

         if (h2.length > 0) {
            h2.before('<div style="height:' + h2.css("margin-top") +
                      ';"></div>').css({"float":"left","margin-top":"0"})
               .after(wrap[0] + uploader + wrap[1]);
         }
         else {
            if (ta.closest('form').attr('id') === 'photo_form' &&
                ta.parent().prevAll('img').length > 0) {
               //Single image share bookmarklet looks different
               uploader = imgwrap[0] + uploader + imgwrap[1];
            }
            else {
               uploader = wrap[0] + uploader + wrap[1];
            }
            ta.parent().prepend(uploader);
         }
         if (ta.parent().find('div.editor_note:contains("markdown")')
                        .length !== 0) {
            tag = '![](X)';
         }
      });
      jQuery('head').append('<script type="text/javascript">' +
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
   else if (message.addUploader === 1 &&
       (/http:\/\/www\.tumblr\.com\/messages/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/
            .test(location.href) ||
        /http:\/\/www\.tumblr\.com\/submissions/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/
            .test(location.href))) {
      jQuery('#posts li.post a[id^="ask_answer_link_"]')
            .live('click', function() {
         var post = jQuery(this).closest("li.post");
         if (post.length > 0) {
            addAskUploader(post.get(0));
         }
      });
      jQuery('head').append('<script type="text/javascript">' +
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
});

self.postMessage({greeting: "settings", component: "postingFixes"});
