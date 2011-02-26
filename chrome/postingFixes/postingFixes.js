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

chrome.extension.sendRequest({greeting: "settings", component: "postingFixes"}, function(response) {
   var postingFixes_settings = JSON.parse(response);
   if (postingFixes_settings.photoReplies == 1) {
      var apr = document.getElementById("allow_photo_replies");
      if (apr != null && apr != undefined) apr.checked = true;
   }
   
   if (postingFixes_settings.uploaderToggle == 1) {
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

   if (postingFixes_settings.addUploader == 1 &&
       !(/\/new\/text/.test(location)) &&
       !(/\/new\/chat/.test(location)) &&
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
         h2.before('<script type="text/javascript">\n' +
                          'document.domain = "tumblr.com";\n' +
                          'function catch_uploaded_photo(src) {\n' +
                          '   if (tinyMCE && (ed = tinyMCE.get("' + textarea + '"))) {\n' +
                          '      ed.execCommand("mceInsertContent", false, "<img src=\\"" + src + "\\" />");\n' +
                          '   }\n' +
                          '   else {\n' +
                          '      insertTag("' + textarea + '", "<img src=\\"" + src + "\\" />");\n' +
                          '   }\n' +
                          '}\n' +
                          '</script>');
      }
   }
});
