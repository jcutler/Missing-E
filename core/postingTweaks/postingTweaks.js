/*
 * 'Missing e' Extension
 *
 * Copyright 2012, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: license/GPL-LICENSE.txt
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

(function($){

MissingE.packages.postingTweaks = {

   resizeTinyMCE: function(post) {
      if (MissingE.isTumblrURL(location.href, ["bookmarklet"])) {
         var container = $('#container');
         var high = container.height();
         container.css({'height':'auto',
                        'min-height':high+'px'});
      }
      $('head').append('<style type="text/css">' +
         '.ui-icon-gripsmall-diagonal-se { background-image:url("' +
         extension.getURL("core/postingTweaks/handle.png") + '") !important;' +
         '}</style>');
      var fr = $("#" + post + "_ifr");
      var h = fr.outerHeight();
      fr.css('height','100%');
      fr.parent().css('height',h+'px');
      $(function() {
         fr.parent().resizable({
            handles:'se',
            minHeight:h,
            create:function() {
               $(this).prepend('<div class="resize_overlay"></div>');
            },
            resize: function() {
               $('#bookmarklet_index #post_controls')
                  .css('top', ($('#container').height() + 37) + 'px');
            },
            start:function() {
               $(this).find('.resize_overlay').show();
            },
            stop:function() {
               $(this).find('.resize_overlay').hide();
            }
         });
      });
   },

   addAskUploader: function(obj) {
      if (obj.tagName === 'LI' && $(obj).hasClass('post')) {
         if ($(obj).find('div.post_controls a[id^="ask_answer_link"]')
               .length === 0) {
            return;
         }
         var aid = obj.id.match(/\d+$/)[0];
         var it = document.getElementById('ask_answer_form_container_' + aid);
         var div = $('<div style="min-height:15px;" />');
         div.append($('<div style="float:right;padding:3px 0;" />')
                     .append($('<iframe />',
                               {src: "/upload/image?from_assets",
                                id: "regular_form_inline_image_iframe_" + aid,
                                width: "130", height: "16", border: "0",
                                scrolling: "no", allowtransparency: "true",
                                frameborder: "0"})
                                 .css({"background-color": "transparent",
                                       "overflow": "hidden"})));
         div.append('<div class="clear" />');
         $(it).css('padding-top','0').prepend(div);
      }
      else {
         return true;
      }
   },

   changeButtonText: function(val, submitText) {
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
      $('#post_controls input[type="submit"]:first').val(text);
   },

   showHideButtons: function(newbtns, val) {
      var tofind;
      newbtns.find('.current').removeClass('current');
      if (val === '0') { tofind = 'publish'; }
      else if (val === 'private') { tofind = 'private'; }
      else if (val === '2') { tofind = 'queue'; }
      else if (val === '1') { tofind = 'draft'; }
      else if (val === 'on.2') { tofind = 'delay'; }

      newbtns.find('#MissingE_' + tofind + 'Post').parent().addClass('current');
   },

   run: function() {
      var settings = this.settings;
      var lang = $('html').attr('lang');
      var i,tag;
      if (MissingE.isTumblrURL(location.href, ["post", "reblog"]) &&
          !MissingE.isTumblrURL(location.href, ["bookmarklet"])) {
         var txt="";
         var ctags;
         var newtags = [];
         var posttags = document.getElementById('post_tags');
         if (posttags) {
            ctags = posttags.value;
         }
         if (ctags !== undefined && ctags !== null && ctags !== '') {
            ctags = ctags.split(',');
         }
         for (i=0; i<ctags.length; i++) {
            if (ctags[i] !== "") {
               newtags.push(MissingE.createTag(lang, ctags[i]));
            }
         }
         if (newtags.length > 0) {
            var tokenList = $('#tokens');
            tokenList.empty();
            for (i=0; i<newtags.length; i++) {
               tokenList.append(newtags[i]);
            }
         }
      }

      if (MissingE.isTumblrURL(location.href, ["textPost"])) {
         $('#edit_post').submit(function() {
            if (!/\S/.test($('#post_one').val()) &&
                !/\S/.test($('#post_two').val()) &&
                /\S/.test($('#post_tags').val())) {
               var insertText = '<small><em><small><em><small>&#x202F;' +
                                '</small></em></small></em></small>';

               $.globalEval('var addText = "' + insertText + '";' +
                  'if (tinyMCE && (ed = tinyMCE.get("post_two"))) {' +
                     'if (!/\S/.test(ed.getContent())) {' +
                        'ed.execCommand("mceInsertContent", false, addText);' +
                        'insertTag("post_two", addText);' +
                     '}' +
                  '}' +
                  'else {' +
                     'insertTag("post_two", addText);' +
                  '}');
            }
         });
      }
      if (settings.smartRedirect === 1 &&
          MissingE.isTumblrURL(location.href, ["drafts", "queue"])) {
         $('#new_post a').each(function() {
            this.href = this.href.replace(/redirect_to=[^&]*/,'')
                                 .replace(/\?&/,'?').replace(/(\?|&)$/,'');
         });
      }
      if (settings.smartRedirect === 1 &&
          MissingE.isTumblrURL(location.href, ["post"]) &&
          !/redirect_to=/.test(location.search)) {
         $('#edit_post').submit(function() {
            var toBlog = false;
            var toWhere = "dash";
            if (/www\.tumblr\.com\/blog\/[^\/]+\/new/.test(location.href)) {
               toBlog = true;
            }
            var state = $('#post_state').val();
            if (state === "0") {
               toWhere = "dash";
            }
            else if (state === "2" || state === "on.2") {
               toWhere = "queue";
            }
            else if (state === "1") {
               toWhere = "drafts";
            }
            else if (state === "private") {
               toWhere = "blog";
            }

            var chan = $('#channel_id');
            var blog = "0";
            if (chan.length > 0) {
               blog = chan.val();
            }
            if (blog === "0" && (toBlog || toWhere !== "dash")) {
               var list = $('#user_channels li');
               if (list.length > 0) {
                  list.each(function() {
                     var acct = this.id.match(/tab-(.*)/);
                     if (!acct) { return; }
                     acct = acct[1];
                     if ($('#channel_id option[value="' + acct + '"]').
                           length === 0) {
                        blog = acct;
                        return false;
                     }
                  });
               }
            }
            if (blog === "0") { return; }

            var redirect = "/dashboard";
            if ((toWhere === "dash" && toBlog) || toWhere === "blog") {
               redirect = "/blog/" + blog;
            }
            else if (toWhere === "queue") {
               redirect = "/blog/" + blog + "/queue";
            }
            else if (toWhere === "drafts") {
               redirect = "/blog/" + blog + "/drafts";
            }

            var redirecter = $('input[name="redirect_to"]');
            if (redirecter.length === 0) {
               redirecter = $('<input />', {type: "hidden", name: "redirect_to"}).appendTo('#edit_post');
            }
            redirecter.val(redirect);
         });
      }

      $('#set_tags').append('<div style="text-align:right;">' +
           '<a class="clear_tags" style="color:#666;font-size:10px;" ' +
           'href="#" onclick="var tok=document.getElementById(\'tokens\');' +
           'while(tok.firstChild){tok.removeChild(tok.firstChild);}' +
           'document.getElementById(\'post_tags\').value = ' +
           '\'\';return false;">' +
           MissingE.escapeHTML(MissingE.getLocale(lang).postingTweaks
                                 .clearTagsText) + '</a></div>');

      var dupProtocolFields = '#photo_src,#post_source_url';
      if (MissingE.isTumblrURL(location.href, ["photoPost"])) {
	     dupProtocolFields += ',#post_three';
      }
      $(dupProtocolFields).keyup(function(){
         if (/^http:\/\/https?:\/\//.test(this.value)) {
            this.value = this.value.replace(/^http:\/\//,'');
         }
      });

      if (settings.showAnswers === 1 &&
          !MissingE.isTumblrURL(location.href, ["reblog"])) {
         $('head').append('<style type="text/css">' +
                          '#enable_answers_container { ' +
                          'display:block !important; ' +
                          'opacity:1 !important; }</style>');
      }

      if (settings.tagQueuedPosts === 1) {
         var queueTags = settings.queueTags === '' ? [] :
                           settings.queueTags;
         $('#posts div.post_controls a').live('click',function(){
            if (!$(this).hasClass('MissingE_queue_control') &&
                !(new RegExp(MissingE.getLocale(lang).dashTweaksText.queue,"i"))
                  .test($(this).text())) {
               return;
            }
            var id = $(this).closest('li.post').attr('id').match(/\d+$/)[0];
            var key = $('#form_key').val();
            $.ajax({
               type: "POST",
               async: !extension.isChrome,
               url: "http://www.tumblr.com/add_tags_to_posts",
               data: {"post_ids": id,
                      "tags": queueTags.join(","),
                      "form_key": key},
            });
         });
         $('#posts div.MissingE_postMenu button').live('mouseup', function() {
            var tagstr, taglist;
            if (/ask_queue_button_also_\d+$/.test(this.id)) {
               var id = this.id.match(/\d+$/)[0];
               var tags = $('#ask_answer_form_' + id +
                            ' input.MissingE_askTweaks_tags');
               if (tags.length === 0) {
                  tags = $('<input type="hidden" ' +
                           'class="MissingE_askTweaks_tags" value="" />')
                              .appendTo('#ask_answer_form_' + id);
               }
               if (tags.length === 0) { return; }
               tagstr = tags.val();

               taglist = tagstr.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
                        .replace(/\s*,\s*/g,',').replace(/,$/,'')
                        .replace(/^\s*/,'').replace(/\s*$/,'')
                        .split(",");
               var addTags = [];
               for (i=0; i<queueTags.length; i++) {
                  if ($.inArray(queueTags[i],taglist) === -1) {
                     addTags.push(queueTags[i]);
                  }
               }
               if (addTags.length > 0) {
                  if (!(/^\s*$/.test(tagstr))) {
                     addTags.unshift("");
                  }
                  tags.val(tagstr+addTags.join(", "));
               }
            }
         });
         $('#edit_post').submit(function() {
            if (/2/.test($(this["post[state]"]).val())) {
               var tags = $(this["post[tags]"]).val().split(",");
               var addTags = [];
               for (i=0; i<queueTags.length; i++) {
                  if ($.inArray(queueTags[i],tags) === -1) {
                     addTags.push(queueTags[i]);
                  }
               }
               var tagsInput = $(this).find('#post_tags');
               if (addTags.length > 0 && tagsInput.length > 0) {
                  if (tagsInput.val() !== '') {
                     addTags.unshift("");
                  }
                  tagsInput.val(tagsInput.val()+addTags.join(","));
               }
            }
         });
      }
      if (settings.blogSelect === 1 &&
          $('select#channel_id').length > 0) {
         var pcl = $('#post_controls_loading');
         pcl.parent().append(pcl.remove());
         var extrachan = $('<select id="extra_channel"></select>')
                           .insertAfter('#preview_button');
         extrachan.append($('#channel_id').html());
         extrachan.val($('#channel_id').val());
         extrachan.bind('change',function() {
            $('#channel_id').val($(this).val());
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            document.getElementById('channel_id').dispatchEvent(evt);
         });
         $('#channel_id').bind('change',function() {
            extrachan.val($(this).val());
         });
      }
      if (settings.quickButtons === 1 &&
          $('#post_state').length > 0 &&
          $('#post_state').children('*[value="0"],*[value="1"],' +
                                    '*[value="2"],*[value="private"]')
            .length >= 4) {
         if ($('#post_controls').css('position') !== 'absolute') {
            $('#post_controls').addClass('MissingE_post_controls');
         }

         var btn;
         var bottom;
         var isShare;
         if ($('body').attr('id') === 'bookmarklet_index') {
            isShare = true;
            btn = $('#post_controls input[type="submit"]');
            bottom = $('#post_controls').outerHeight()/2 +
               $('#post_controls').find('input[type="submit"]').outerHeight()/2;
            bottom = Math.round(bottom);
            if ($('#post_state').val() === '0') {
               $('#post_controls input[type="submit"]')
                  .val(MissingE.getLocale(lang).postingTweaks
                           .submitText.publish);
            }
         }
         else {
            isShare = false;
            btn = $('#save_button');
         }

         var allbtns = "";

         var doOnClick = 'return true;';
         if (isShare) {
            $('#post_controls input[type="submit"]:first')
               .attr('id','the_submit_btn');
         }
         for (i in MissingE.getLocale(lang).postingTweaks.submitText) {
            if (MissingE.getLocale(lang).postingTweaks.submitText
                  .hasOwnProperty(i)) {
               allbtns += '<div><button id="MissingE_' + i + 'Post" ' +
                           'type="submit" class="positive" ' +
                           'onclick="' + doOnClick + '"><span>' +
                           MissingE.escapeHTML(MissingE.getLocale(lang)
                                                .postingTweaks.submitText[i]) +
                           '</span></button></div>';
            }
         }
         var newbtns = $('<div id="MissingE_postMenu">' + allbtns + '</div>')
                        .insertAfter(btn);

         if (isShare) {
            newbtns.css('bottom', bottom + 'px')
                   .css('top', 'auto')
                   .css('margin-left', btn.css('margin-left'));
         }
         $('#post_state').bind('change', function() {
            MissingE.packages.postingTweaks
               .showHideButtons(newbtns, this.value);
            if (isShare) {
               MissingE.packages.postingTweaks
                  .changeButtonText($('#post_state').val(),
                                    MissingE.getLocale(lang).postingTweaks
                                       .submitText);
            }
         });
         newbtns.find('button').mouseup(function() {
            if (!isShare) {
               $('head').append('<script type="text/javascript">' +
                                'is_preview=false;</script>');
            }
            if (this.id === 'MissingE_publishPost') {
               $('#post_state').val('0');
            }
            else if (this.id === 'MissingE_draftPost') {
               $('#post_state').val('1');
            }
            else if (this.id === 'MissingE_queuePost') {
               $('#post_state').val('2');
            }
            else if (this.id === 'MissingE_privatePost') {
               $('#post_state').val('private');
            }
            if (isShare) {
               $.globalEval("sync_input_values('_form_post_state', " +
                            "$('post_state').value);");
            }
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent('change',false,true);
            document.getElementById('post_state').dispatchEvent(evt);
         });
         MissingE.packages.postingTweaks
            .showHideButtons(newbtns, $('#post_state').val());
         if (isShare) {
            MissingE.packages.postingTweaks
               .changeButtonText($('#post_state').val(),
                                 MissingE.getLocale(lang).postingTweaks
                                    .submitText);
            newbtns.find('button').click(function() {
               $.globalEval('document.getElementById("the_submit_btn").click()');
            });
         }
      }

      if (settings.photoReplies === 1) {
         var apr = document.getElementById("allow_photo_replies");
         if (apr !== null && apr !== undefined) { apr.checked = true; }
      }

      if (settings.facebookOff === 1) {
         var fbcb = document.getElementById("send_to_fbog");
         if (fbcb) { fbcb.checked = false; }
         var fclabel = document.getElementById("set_facebook");
         if (fclabel) { $(fclabel).removeClass("active"); }
         $('#channel_id').bind('change', function() {
            var fbcb = document.getElementById("send_to_fbog");
            if (fbcb) { fbcb.checked = false; }
            var fclabel = document.getElementById("set_facebook");
            if (fclabel) { $(fclabel).removeClass("active"); }
         });
      }

      if (settings.addUploader === 1 &&
          !MissingE.isTumblrURL(location.href, ["drafts", "messages",
                                                "bookmarklet"]) &&
          !(MissingE.isTumblrURL(location.href, ["post"]) &&
            /\/new\/(text|chat)/.test(location.href)) &&
          $('#regular_form_inline_image_iframe').length === 0) {
         var headings = $('h2');
         var h2 = headings.last();
         if (h2.parent().attr('id') === "photo_link") {
            h2 = headings.eq(-2);
         }

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
         tag = '<img src=\\"X\\" />';
         if (h2.parent().find('div.editor_note:contains("markdown")')
                           .length !== 0) {
            tag = '![](X)';
         }
         var isRTE = true;
         $('form script').each(function() {
            if (/render_editor\(/.test($(this).html())) {
               if (/render_editor\([^\)]*'rich'/.test($(this).html())) {
                  isRTE = true;
                  return false;
               }
               else {
                  isRTE = false;
                  return false;
               }
            }
         });
         var iframeurl, startframe;
         iframeurl = isRTE ? "core/postingTweaks/upload_rte.html" :
                             "core/postingTweaks/upload.html";
         if (extension.isFirefox) {
            startframe = "/upload";
         }
         else {
            startframe = extension.getURL(iframeurl);
         }
         h2.before('<div style="height:0;margin-top:' + h2.css("margin-top") +
                   ';clear:both;"></div>')
            .css({"float":"left","margin-top":"0"})
            .after('<div style="float:right;padding-top:3px;"><iframe ' +
                   'src="' + startframe + '" ' +
                   'id="regular_form_inline_image_iframe" width="130" ' +
                   'height="16" border="0" scrolling="no" ' +
                   'allowtransparency="true" frameborder="0" ' +
                   'style="background-color:transparent; overflow:hidden;">' +
                   '</iframe></div><div class="clear"></div>');
         if (extension.isFirefox) {
            var upfrm = $('#regular_form_inline_image_iframe').get(0);
            upfrm.onload = function() {
               upfrm.onload = function() { return; };
               var doc = upfrm.contentWindow.document;
               doc.open();
               extension.sendRequest("uploader", {url: iframeurl},
                                     function(response) {
                  if (response.success) {
                     doc.write(response.data);
                  }
                  doc.close();
               });
            };
         }
         if (textarea && textarea !== "") {
            $('head').append('<script type="text/javascript">' +
              'function catch_uploaded_photo(src) {' +
                  'if (tinyMCE && (ed = tinyMCE.get("' + textarea + '"))) {' +
                     'ed.execCommand("mceInsertContent", false, ' +
                                     '"<img src=\\"" + src + "\\" />");' +
                  '}' +
                  'else {' +
                     'insertTag("' + textarea + '", "' + tag +
                                '".replace(/X/,src));' +
                  '}' +
               '}</script>');
         }
      }
      else if (settings.addUploader === 1 &&
               MissingE.isTumblrURL(location.href, ["bookmarklet"])) {
         tag = '<img src=\\"X\\" />';
         $('textarea').each(function() {
            if ((this.name !== "post[two]" &&
                this.name !== "post[three]") ||
                /chat_/.test(this.id)) {
               return true;
            }

            var ta = $(this);
            var textarea = ta.attr('id');
            var h2 = ta.prevAll('h2:first');
            var uploader = $('<iframe />',
                             {id: "regular_form_inline_image_iframe_" + textarea,
                              src: "/upload/image?from_assets",
                              width: "130", height: "16", border: "0",
                              scrolling: "no", allowtransparency: "true",
                              frameborder: "0"})
                              .css({"background-color": "transparent",
                                    "overflow": "hidden"});
            var wrap = '<div style="float:right;' +
                       (/regular_/.test(this.id) ? 'margin-bottom:5px;' :
                        'padding-top:3px;') + '" />';
            var adjwrap = '<div style="position:absolute;right:0;top:-20px;" />';
            var imgwrap = '<div style="text-align:right;margin-top:-19px;' +
                          'margin-bottom:3px;" />';

            var frm = ta.closest('form');
            var adjust = frm.attr('id') === "photo_form" ||
               (frm.attr('id') === "video_form" &&
                frm.find('input[name="post[one]"]').attr('type') === "hidden");

            var insert;
            if (h2.length > 0) {
               h2.before('<div style="height:' + h2.css("margin-top") + ';" />')
                 .css({"float":"left","margin-top":"0"});
               insert = $(wrap).append(uploader);
               h2.after(insert);
               insert.after('<div style="clear:both;" />');
            }
            else if (adjust) {
               ta.parent().css('position','relative');
               ta.parent().prepend($(adjwrap).append(uploader));
            }
            else {
               if (frm.attr('id') === 'photo_form' &&
                   ta.parent().prevAll('img').length > 0) {
                  //Single image share bookmarklet looks different
                  ta.parent().prepend($(imgwrap).append(uploader));
               }
               else {
                  insert = $(wrap).append(uploader);
                  ta.parent().prepend(insert);
                  insert.after('<div style="clear:both;" />');
               }
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
                                     '"<img src=\\"" + src + "\\" />");' +
                  '}' +
                  'else {' +
                     'insertTag(e, "' + tag + '".replace(/X/,src));' +
                  '}' +
              '}</script>');
      }
      else if (settings.addUploader === 1 &&
               MissingE.isTumblrURL(location.href, ["messages"])) {
         $('#posts li.post a[id^="ask_answer_link_"]').live('click',
                                                            function() {
            var post = $(this).closest("li.post");
            if (post.length > 0 &&
                post.find('iframe[src*="upload/image"]').length === 0) {
               MissingE.packages.postingTweaks.addAskUploader(post.get(0));
            }
         });

         $('head').append('<script type="text/javascript">' +
              'document.domain = "tumblr.com";' +
              'function catch_uploaded_photo(src) {' +
                  'var eId = catch_uploaded_photo.caller.arguments[0]' +
                              '.currentTarget.frameElement.id' +
                              '.match(/[0-9]*$/)[0];' +
                  'var e = "ask_answer_field_" + eId;' +
                  'if (tinyMCE && (ed = tinyMCE.get(e))) {' +
                     'ed.execCommand("mceInsertContent", false, ' +
                                     '"<img src=\\"" + src + "\\" />");' +
                  '}' +
                  'else {' +
                     'var tag = "<img src=\\"X\\" />";' +
                     'var ta = document.getElementById(e);' +
                     'if (/markdown/.test(ta.previousSibling.innerHTML)) {' +
                        'tag = "![](X)";' +
                     '}' +
                     'insertTag(e, tag.replace(/X/,src));' +
                  '}' +
              '}</script>');
      }

      if ($('#post_two_ifr,#post_three_ifr').length === 0) {
         $('head').append('<script type="text/javascript">' +
            'if (tinyMCE) {' +
            'tinyMCE.onAddEditor.add(function(mgr,ed){' +
               'ed.onPostRender.add(function(ed) {' +
                  'var evt = document.createEvent("MessageEvent");' +
                  'evt.initMessageEvent("MissingE_tinyMCE", true, true, ' +
                                        'ed.id, "http://www.tumblr.com", 0, ' +
                                        'window);' +
                  'document.dispatchEvent(evt);' +
               '});' +
            '});}</script>');
         document.addEventListener('MissingE_tinyMCE', function(e) {
            MissingE.packages.postingTweaks.resizeTinyMCE(e.data);
         }, false);
      }
      else {
         var id = $('#post_two_ifr,#post_three_ifr').get(0).id
                     .replace(/_ifr/,'');
         MissingE.packages.postingTweaks.resizeTinyMCE(id);
      }
   },

   init: function() {
      extension.sendRequest("settings", {component: "postingTweaks"},
                            function(response) {
         if (response.component === "postingTweaks") {
            var i;
            MissingE.packages.postingTweaks.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.postingTweaks.settings[i] = response[i];
               }
            }
            MissingE.packages.postingTweaks.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.postingTweaks.init();
}

}(jQuery));
