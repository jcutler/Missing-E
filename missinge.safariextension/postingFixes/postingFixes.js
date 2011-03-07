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
 * along with 'Missing e'.  If not, see <http://www.gnu.org/licenses/>.
 */

function MissingE_postingFixes_doStartup(photoReplies, uploaderToggle, addUploader) {
   if (photoReplies == 1) {
      var apr = document.getElementById("allow_photo_replies");
      if (apr != null && apr != undefined) apr.checked = true;
   }
   
   if (uploaderToggle == 1) {
      var url = document.getElementById("photo_url");
      var lnk = document.getElementById("use_url_link");
      
      if (url != null && url != undefined && lnk != null && lnk != undefined) {
         var uil = lnk.cloneNode();
         uil.id = "use_img_link";
         uil.innerHTML = '<a href="#" onclick="Element.hide(\'photo_url\'); $(\'photo_src\').value = \'\'; Element.show(\'photo_upload\'); return false;">Upload images instead</a>';
         uil.style.marginTop = "7px";
         url.appendChild(uil);
      }
   }
   
   if (addUploader == 1 &&
       !(/\/new\/text/.test(location.href)) &&
       !(/\/new\/chat/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/messages/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/.test(location.href)) &&
       !(/http:\/\/www\.tumblr\.com\/share/.test(location.href)) &&
       $('#regular_form_inline_image_iframe').length == 0) {
      var headings = $('h2');
      var h2 = headings.last();
      if (/Clicking/i.test(h2.html())) {
         h2 = headings.eq(-2);
      }
      var textarea = h2.nextAll('textarea:first').attr('id');
      h2.before('<div style="height:' + h2.css("margin-top") + ';"></div>')
         .css({"float":"left","margin-top":"0"})
         .after('<div style="float:right;padding-top:3px;"><iframe src="/upload/image?from_assets" id="regular_form_inline_image_iframe" width="130" height="16" border="0" scrolling="no" allowtransparency="true" frameborder="0" style="background-color:transparent; overflow:hidden;"></iframe></div><div class="clear"></div>');
      if (textarea && textarea != "") {
         $('head').append('<script type="text/javascript">\n' +
                          'document.domain = "tumblr.com";\n' +
                          'function catch_uploaded_photo(src) {\n' +
                          '   if (tinyMCE && (ed = tinyMCE.get("' + textarea + '"))) {\n' +
                          '      ed.execCommand("mceInsertContent", false, "<img src=\\"" + src + "\\" />");\n' +
                          '   }\n' +
                          '   else {\n'+
                          '      insertTag("' + textarea + '", "<img src=\\"" + src + "\\" />");\n' +
                          '   }\n' +
                          '}\n' +
                          '</script>');
      }
   }
      else if (addUploader == 1 &&
               /http:\/\/www\.tumblr\.com\/share/.test(location.href)) {
      $('textarea').each(function() {
         if ((this.name != "post[two]" &&
             this.name != "post[three]") ||
             /chat_/.test(this.id))
            return true;

         var ta = $(this);
         var textarea = ta.attr('id');
         var h2 = ta.prev('h2');
         var uploader = '<div style="float:right;' + (/regular_/.test(this.id) ? 'margin-bottom:5px;' : 'padding-top:3px;') + '"><iframe id="regular_form_inline_image_iframe_' + textarea + '" src="/upload/image?from_assets" width="130" height="16" border="0" scrolling="no" allowtransparency="true" frameborder="0" style="background-color:transparent; overflow:hidden;"></iframe></div><div class="clear"></div>'
         if (h2.length > 0) {
            h2.before('<div style="height:' + h2.css("margin-top") + ';"></div>')
               .css({"float":"left","margin-top":"0"})
               .after(uploader);
         }
         else {
            ta.before(uploader);
         }
      });
      $('head').append('<script type="text/javascript">\n' +
                       'document.domain = "tumblr.com";\n' +
                       'function catch_uploaded_photo(src) {\n' +
                       '   var e = catch_uploaded_photo.caller.arguments[0].currentTarget.frameElement.id.match(/[a-zA-Z]*\_post\_[a-zA-Z]*$/)[0];\n' +
                       '   if (tinyMCE && (ed = tinyMCE.get(e))) {\n' +
                       '      ed.execCommand("mceInsertContent", false, "<img src=\\"" + src + "\\" />");\n' +
                       '   }\n' +
                       '   else {\n'+
                       '      insertTag("' + textarea + '", "<img src=\\"" + src + "\\" />");\n' +
                       '   }\n' +
                       '}\n' +
                       '</script>');
   }
   else if (addUploader == 1 &&
       (/http:\/\/www\.tumblr\.com\/messages/.test(location.href) ||
        /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/.test(location.href))) {
      $('#posts li.post a:contains("answer")').live('click', function() {
         var post = $(this).closest("li.post");
         if (post.length > 0) {
            addAskUploader(post.get(0));
         }
      });
      $('head').append('<script type="text/javascript">\n' +
                       'document.domain = "tumblr.com";\n' +
                       'function catch_uploaded_photo(src) {\n' +
                       '   var eId = catch_uploaded_photo.caller.arguments[0].currentTarget.frameElement.id.match(/[0-9]*$/)[0];\n' +
                       '   var e = "ask_answer_field_" + eId;\n' + 
                       '   if (tinyMCE && (ed = tinyMCE.get(e))) {\n' +
                       '      ed.execCommand("mceInsertContent", false, "<img src=\\"" + src + "\\" />");\n' +
                       '   }\n' +
                       '   else {\n' +
                       '      insertTag(e, "<img src=\\"" + src + "\\" />");\n' +
                       '   }\n' +
                       '}\n' +
                       '</script>');
   }
}

function addAskUploader(obj) {
   if (obj.tagName == 'LI' && $(obj).hasClass('post')) {
      var aid = obj.id.match(/[0-9]+$/)[0];
      var it = document.getElementById('ask_answer_form_container_' + aid);
      $(it).css('padding-top','0').prepend('<div style="min-height:15px;"><div style="float:right;padding:3px 0;"><iframe src="/upload/image?from_assets" id="regular_form_inline_image_iframe_' + aid + '" width="130" height="16" border="0" scrolling="no" allowtransparency="true" frameborder="0" style="background-color:transparent; overflow:hidden;"></iframe></div><div class="clear"></div></div>');
   }
   else
      return true;
}
