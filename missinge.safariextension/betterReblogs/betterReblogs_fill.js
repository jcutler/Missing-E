/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 2 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

/*global $,locale,safari */

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function setReblogTagsPlainText(tags) {
   localStorage.setItem('tbr_ReblogTags',tags);
}

function clearReblogTags() {
   localStorage.removeItem("tbr_ReblogTags");
}

function isTagOverride() {
   if (localStorage.getItem("tbr_OverrideTags","1") === "1") {
      return true;
   }
   else {
      return false;
   }
}

function clearTagOverride() {
   localStorage.removeItem("tbr_OverrideTags");
}

function getReblogTags() {
   var retval = localStorage.getItem("tbr_ReblogTags");
   if (retval === undefined || retval === null || retval === "") {
      return [];
   }
   else {
      return retval.split(",");
   }
}

function MissingE_betterReblogs_fill_doStartup(passTags, autoFillTags,
                                               fullText) {
   if (document.body.id !== 'dashboard_edit_post') {
      if (/[\?&]channel_id=/.test(location.href) &&
          /Request denied/i.test($('#container').text())) {
         var blog = location.href.match(/[\?&]channel_id=([^&]*)/)[1];
         $('<p>You attempted to reblog using Tumblr username:<br /><strong>' +
           blog + '</strong></p><p>This may not be a valid username!<br />' +
           'Please check your <em>Missing e</em> settings.</p>')
            .insertBefore('#container div.sorry p:last');
      }
      return false;
   }
   if (fullText === 1 &&
       $('#edit_post').hasClass('link_post')) {
      var src = encodeURIComponent($('#post_two').val());
      if (document.referrer.indexOf("src="+src) >= 0 ||
          (document.referrer === "" &&
           location.href.indexOf("redirect_to="+src) >= 0)) {
         location.href = $('#the_as_links a[href*="/text"]').attr("href");
         return;
      }
   }
   var addHeight = 0;
   var lang = $('html').attr('lang');
   if (isTagOverride()) {
      document.getElementById('post_tags').value = "";
      document.getElementById('tokens').innerHTML = "";
      clearTagOverride();
   }
   var tags = getReblogTags();
   if (tags.length == 0) {
      setReblogTagsPlainText(document.getElementById('edit_post').post_tags
                             .value);
   }
   tags = getReblogTags();

   if (document.body.id === 'dashboard_edit_post') {
      $('#the_as_links a[href!="#"]').click(function() {
         var pt = document.getElementById('edit_post').post_tags.value;
         if (pt !== '') {
            setReblogTagsPlainText(pt);
         }
         else if (tags !== '') {
            setReblogTags(tags);
         }
      });
   }

   if (document.body.id === 'dashboard_edit_post' &&
       getReblogTags().length > 0) {
      var i;
      if (tags.length > 0) {
         var func = "var tags=[";
         for (i=0; i<tags.length; i++) {
            if (tags[i] !== undefined && tags[i] !== null && tags[i] !== ''){
               func += '\'' + tags[i].replace(/'/g,'\\\'') + '\',';
            }
         }
         func = func.replace(/,$/,'') + '];';
         var label;
         if (func !== 'var tags=[];') {
            func += 'var posttags=document.getElementById(\'post_tags\');' +
                    'var currtags=posttags.value.split(\',\');' +
                    'if (currtags.length === 1 && /^\\s*$/.test(currtags[0])) {' +
                     'currtags=[];' +
                    '}' +
                    'var addtags=[];' +
                    'for(i=0;i<tags.length;i++){' +
                     'var f=false;' +
                     'for(j=0;j<currtags.length;j++){' +
                      'if(tags[i]===currtags[j]){' +
                       'f=true;break;' +
                      '}' +
                     '}' +
                     'if(!f){addtags.push(tags[i]);}' +
                    '}' +
                    'if(addtags.length>0){' +
                     'if($(\'post_tags_label\')){' +
                      'Element.remove(\'post_tags_label\');' +
                     '}' +
                     'currtags=currtags.concat(addtags);' +
                     'posttags.value=currtags.join(\',\');' +
                     'for(i=0;i<addtags.length;i++){' +
                      'var newtoken=document.createElement(\'div\');' +
                      'newtoken.className=\'token\';' +
                      'var span=document.createElement(\'span\');' +
                      'span.className=\'tag\';' +
                      'span.innerHTML=addtags[i];' +
                      'newtoken.appendChild(span);' +
                      'var rem=document.createElement(\'a\');' +
                      'rem.href=\'#\';rem.innerHTML=\'x\';' +
                      'rem.onclick=function(){tag_editor_remove_tag($(this).up());' +
                         'return false;};' +
                      'newtoken.appendChild(rem);' +
                      'document.getElementById(\'tokens\').appendChild(newtoken);' +
                     '}' +
                    '}return false;';
            var set_tags = $('#set_tags');
            addHeight = $('<div style="text-align:left">' +
                              '<a class="reblog_tags" style="color:#666;' +
                              'font-size:10px;" href="#" ' +
                              'onclick="' + func + '">' +
                              locale[lang].reblogTags + '</a></div>')
               .prependTo(set_tags).outerHeight();
            label = $('#post_tags_label');
            if (label.length > 0) {
               var newHeight = parseInt(label.css('top').match(/[0-9]*/)[0]);
               if (!isNaN(newHeight)) {
                  newHeight += addHeight;
                  label.css('top',newHeight+'px');
               }
            }
         }
         if (passTags === 0 || autoFillTags === 0) {
            document.getElementById('post_tags').value = "";
            document.getElementById('tokens').innerHTML = "";
         }
         else {
            $('head').append('<script type="text/javascript">' +
                             'function MissingE_reblogTags() { ' +
                             func + ' }' + "\n" + 'MissingE_reblogTags();' +
                             '</script>');
         }
      }
      clearReblogTags();
   }
}
