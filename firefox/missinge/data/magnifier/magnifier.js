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

/*global safari, $ */

var magnifyText = {
                  title: {
                        en: "magnify",
                        de: "vergrößern",
                        fr: "agrandir",
                        it: "ingrandire",
                        ja: "拡大する"
                         },
                  error: {
                        en: "An error occured. Click to reload 'Magnifier'.",
                        de: "Ist ein Fehler aufgetreten. Klicken Sie erneut zu versuchen.",
                        fr: "Une erreur s'est produite. Cliquez pour essayer à nouveau.",
                        it: "È verificato un errore. Clicca per provare di nuovo.",
                        ja: "エラーが発生しました。 もう一度やり直してください]をクリックします。"
                         },
                  loading: {
                        en: "Loading...",
                        de: "Nicht bereit...",
                        fr: "Pas prêt...",
                        it: "Non pronto...",
                        ja: "準備が整っていない"
                           }
};

function magClick(e) {
   if (e.which === 1) {
      if (jQuery(this).hasClass('MissingE_magnify_err')) {
         insertMagnifier(jQuery(this).closest('li.post').get(0),'a');
         return false;
      }
      var src = jQuery(this).attr('src');
      if (src === undefined || src === null || src === "") { return false; }
      jQuery.facebox({ image: src });
   }
}

function insertMagnifier(item) {
   if (item.tagName === "LI" && jQuery(item).hasClass("post") &&
       jQuery(item).hasClass("photo")) {
      var lang = jQuery('html').attr('lang');
      var ctrl = jQuery(item).find('div.post_controls');
      var bm = ctrl.find('a.MissingE_mark');
      var heart = ctrl.find('a.like_button');
      var tid = jQuery(item).attr("id").match(/[0-9]*$/)[0];
      var addr;
      var perm = jQuery(item).find("a.permalink:first");
      ctrl.find('a.MissingE_magnify').remove();
      if (perm.length > 0) {
         addr = perm.attr("href").match(/http:\/\/[^\/]*/)[0];
      }
      else {
         if (jQuery(item).find('span.private_label').length > 0) {
            addr = location.href
               .match(/http:\/\/www\.tumblr\.com\/tumblelog\/([^\/]*)/)[1];
            addr = 'http://' + addr + '.tumblr.com';
         }
      }
      var mi = jQuery('<a title="' + magnifyText.loading[lang] + '" ' +
                 'class="MissingE_magnify MissingE_magnify_hide" id="magnify_' +
                 tid + '" href="#" onclick="return false;"></a>');
      mi.click(magClick);
      if (bm.length > 0) {
         bm.before(mi);
      }
      else if (heart.length > 0) {
         heart.before(mi);
      }
      else {
         ctrl.append(mi);
      }
      postMessage({greeting: "magnifier", pid: tid, url: addr});
   }
}

function receiveMagnifier(message) {
   if (message.greeting !== "magnifier") { return; }
   var lang = jQuery('html').attr('lang');
   if (message.success) {
      jQuery('#magnify_' + message.pid).attr('src',message.data)
         .removeClass('MissingE_magnify_hide')
         .attr('title', magnifyText.title[lang]);
   }
   else {
      jQuery('#magnify_' + message.pid).attr('src','')
         .addClass('MissingE_magnify_err')
         .removeClass('MissingE_magnify_hide')
         .attr('title', magnifyText.error[lang]);
   }
}

function MissingE_magnifier_doStartup(extensionURL) {
   var magimg = extensionURL + 'magnifier/magnifier.png';
   var turnimg = extensionURL + 'magnifier/turners.png';

   jQuery('head').append('<link rel="stylesheet" type="text/css" href="' +
                    extensionURL + 'magnifier/magnifier.css" />');
   var turnload = new Image();
   turnload.src = turnimg;
   jQuery('head').append('<style id="MissingE_magnifier_style" type="text/css">' +
                    'a.MissingE_magnify { ' +
                    'background-image:url("' + magimg + '"); } ' +
                    '#facebox .slideshow .turner_left, ' +
                    '#facebox .slideshow .turner_right { ' +
                    'background-image:url("' + turnimg + '"); }</style>');

   if (!(/drafts$/.test(location.href)) &&
       !(/queue$/.test(location.href)) &&
      !(/messages$/.test(location.href)) &&
      !(/submissions[^\/]*$/.test(location.href))) {
      on("message", receiveMagnifier);
      jQuery('#facebox .turner_left,#facebox .turner_right')
         .live('click', function(e) {
         
         var curr = jQuery(this).siblings('div.image:visible:last');
         var next;
         if (jQuery(this).hasClass('turner_right')) {
            next = curr.next('div.image');
            if (next.length === 0) {
               next = curr.parent().find('div.image:first');
            }
         }
         else {
            next = curr.prev('div.image');
            if (next.length === 0) {
               next = curr.parent().find('div.image:last');
            }
         }
         curr.parent().find('div.image:visible').not(curr).hide();
         curr.hide();
         next.show();
      });
      jQuery('#posts li.post[class~="photo"]').each(function(){
         insertMagnifier(this);
      });
      document.addEventListener('DOMNodeInserted',function(e) {
         insertMagnifier(e.target);
      }, false);
   }
}
