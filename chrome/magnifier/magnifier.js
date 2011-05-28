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

/*global chrome, $ */

var magnifyText = {
                  title: {
                        en: "magnify",
                        de: "vergrößern",
                        fr: "agrandir",
                        it: "ingrandire",
                        ja: "拡大する",
                        tr: "büyütmek"
                         },
                  error: {
                        en: "An error occured. Click to reload 'Magnifier'.",
                        de: "Ein Fehler ist aufgetreten. Klicken Sie, erneut zu versuchen.",
                        fr: "Une erreur s'est produite. Cliquez pour essayer à nouveau.",
                        it: "È verificato un errore. Clicca per provare di nuovo.",
                        ja: "エラーが発生しました。 もう一度やり直してください]をクリックします。",
                        tr: "Bir hata oluştu. Yeniden denemek için tıklayın."
                         },
                  loading: {
                        en: "Loading...",
                        de: "wird geladen...",
                        fr: "Pas prêt...",
                        it: "Non pronto...",
                        ja: "準備が整っていない",
                        tr: "Hazır değil"
                         }
};

var magimg = chrome.extension.getURL('magnifier/magnifier.png');
var turnimg = chrome.extension.getURL('magnifier/turners.png');
var turnload = new Image();
turnload.src = turnimg;
$('head').append('<style type="text/css">a.MissingE_magnify { ' +
                  'background-image:url("' + magimg + '"); } ' +
                  '#facebox .slideshow .turner_left, ' +
                  '#facebox .slideshow .turner_right{ ' +
                  'background-image:url("' + turnimg + '"); }</style>');

function magClick(e) {
   if (e.which === 1) {
      if ($(this).hasClass('MissingE_magnify_err')) {
         insertMagnifier($(this).closest('li.post').get(0),'a');
         return false;
      }
      var src = $(this).attr('src');
      if (src === undefined || src === null || src === "") { return false; }
      $.facebox({ image: src });
   }
}

function insertMagnifier(item) {
   if (item.tagName === "LI" && $(item).hasClass("post") &&
       $(item).hasClass("photo")) {
      var lang = $('html').attr('lang');
      var ctrl = $(item).find('div.post_controls');
      var bm = ctrl.find('a.MissingE_mark');
      var heart = ctrl.find('a.like_button');
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var addr;
      var perm = $(item).find("a.permalink:first");
      ctrl.find('a.MissingE_magnify').remove();
      if (perm.length > 0) {
         addr = perm.attr("href").match(/http:\/\/[^\/]*/)[0];
      }
      else {
         if ($(item).find('span.private_label').length > 0) {
            addr = location.href
               .match(/http:\/\/www\.tumblr\.com\/tumblelog\/([^\/]*)/)[1];
            addr = 'http://' + addr + '.tumblr.com';
         }
      }
      var mi = $('<a title="' + magnifyText.loading[lang] + '" ' +
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
      chrome.extension.sendRequest({greeting: "magnifier", pid: tid, url: addr},
                                   function(response) {
         var lang = $('html').attr('lang');
         if (response.success) {
            $('#magnify_' + response.pid).attr('src',response.data)
               .removeClass('MissingE_magnify_hide')
               .attr('title', magnifyText.title[lang]);
         }
         else {
            $('#magnify_' + response.pid).attr('src','')
               .addClass('MissingE_magnify_err')
               .removeClass('MissingE_magnify_hide')
               .attr('title', magnifyText.error[lang]);
         }
      });
   }
}

if (!(/drafts$/.test(location.href)) &&
    !(/queue$/.test(location.href)) &&
    !(/messages$/.test(location.href)) &&
    !(/submissions[^\/]*$/.test(location.href))) {
   $('#facebox .turner_left,#facebox .turner_right')
      .live('click', function(e) {

      var curr = $(this).siblings('div.image:visible:last');
      var next;
      if ($(this).hasClass('turner_right')) {
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
      curr.fadeOut('fast');
      next.fadeIn('slow');
   });
   $('#posts li.post[class~="photo"]').each(function(){
      insertMagnifier(this);
   });
   document.addEventListener('DOMNodeInserted',function(e) {
      insertMagnifier(e.target);
   }, false);
}
