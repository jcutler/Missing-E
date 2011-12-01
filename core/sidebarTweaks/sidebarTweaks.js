/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
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

MissingE.packages.sidebarTweaks = {

   makeSidebar: function(tumblrAcctNum, retries) {
      var tumblrAcct = '';
      var tumblrText = '';
      var sidebartxt = '';
      if ($('#right_column a.posts').length === 0) {
         var i;
         var list = [];
         var bloglist = '';
         $('#all_blogs_menu li[id]').each(function() {
            list.push([this.id.match(/menuitem-(.*)/)[1], $(this).text()]);
         });
         if (list.length === 0) {
            return false;
         }
         if (tumblrAcctNum >= list.length) {
            tumblrAcctNum = 0;
         }
         if (list.length > 0) {
            bloglist = '<ul id="MissingE_sidebar_menu" ' +
               'class="controls_section">';
            for (i=0; i<list.length; i++) {
               var klass = '';
               if (i === tumblrAcctNum) {
                  tumblrAcct = MissingE.escapeHTML(list[i][0]);
                  tumblrText = MissingE.escapeHTML(list[i][1]);
                  klass = 'class="current_sidebar"';
               }
               bloglist += '<li ' + klass + '><a tumblr="' +
                  MissingE.escapeHTML(list[i][0]) +
                  '" href="#" onclick="return false;">' +
                  '<div class="hide_overflow">' +
                  MissingE.escapeHTML(list[i][1]) + '</div></a></li>';
            }
            bloglist += '</ul>';
         }
   
         var lang = $('html').attr('lang');
         var sidebarList = [
            {
            label: MissingE.getLocale(lang).sidebar.posts,
            klass: "posts"
            },
            {
            label: MissingE.getLocale(lang).sidebar.followers,
            klass: "followers"
            },
            {
            label: MissingE.getLocale(lang).sidebar.messages,
            klass: "messages"
            },
            {
            label: MissingE.getLocale(lang).sidebar.drafts,
            klass: "drafts"
            },
            {
            label: MissingE.getLocale(lang).sidebar.queue,
            klass: "queue"
            }
         ];
         sidebartxt = '<ul account="' + tumblrAcctNum + '" ' +
            'class="controls_section" id="MissingE_sidebar">' +
            '<li id="MissingE_sidebar_title" class="recessed selected">' +
               '<a href="#" onclick="return false;">' + tumblrText + '</a>' +
               '<a href="http://' + tumblrAcct + '.tumblr.com/" id="' +
               'MissingE_sidebar_bloglink" target="_blank"></a>' +
               bloglist + '</li>';
         for (i=0; i<sidebarList.length; i++) {
            sidebartxt += '<li><a href="/blog/' + tumblrAcct +
               (sidebarList[i].klass !== 'posts' ? '/' +
                sidebarList[i].klass : '') + '" class="' +
               sidebarList[i].klass + '">' + '<div class="hide_overflow">' +
               sidebarList[i].label + '</div></a></li>';
         }
         sidebartxt += '<li class="recessed"><a href="/mega-editor/' +
            MissingE.escapeHTML(tumblrAcct) + '" class="mass_editor">' +
            '<div class="hide_overflow">' +
            MissingE.getLocale(lang).sidebar.massEditor + '</div>' +
            '<div class="gradient"></div></a></li></ul>';
   
         var sidebar;
         var beforeguy = $('#right_column a.likes');
         if (beforeguy.length === 0) {
            beforeguy = $('#right_column a.following');
         }
         if (beforeguy.length > 0) {
            sidebar = $(sidebartxt)
               .insertAfter(beforeguy.closest('.controls_section'));
         }
         else if ($('#search_form').length > 0) {
            sidebar = $(sidebartxt).insertBefore('#search_form');
         }
         else {
            sidebar = $(sidebartxt).prependTo('#right_column');
         }
         if (sidebar) {
            $.ajax({
               type: "GET",
               url: "http://www.tumblr.com/blog/" + tumblrAcct,
               tumblrAcctNum: tumblrAcctNum,
               tumblrAcct: tumblrAcct,
               dataType: "html",
               tryCount: 0,
               retryLimit: retries,
               error: function() {
                  var msb = $('#MissingE_sidebar');
                  if (msb.attr('account') != this.tumblrAcctNum) {
                     return;
                  }
                  this.tryCount++;
                  if (this.tryCount <= this.retryLimit) {
                     $.ajax(this);
                     return;
                  }
                  msb.find('span.count').remove();
                  msb.find('a.posts,a.followers,a.messages,a.drafts,a.queue')
                     .append('<span onclick="return false;" ' +
                             'class="count MissingE_sidebar_retry">&#x21bb;' +
                             '</span>');
               },
               success: function(data) {
                  var msb = $('#MissingE_sidebar');
                  if (msb.attr('account') != this.tumblrAcctNum) {
                     return;
                  }
                  if (!(/id="dashboard_index"/.test(data))) {
                     this.tryCount++;
                     if (this.tryCount <= this.retryLimit) {
                        $.ajax(this);
                        return;
                     }
                     msb.find('a.posts,a.followers,a.messages,a.drafts,a.queue')
                        .append('<span onclick="return false;" ' +
                                'class="count MissingE_sidebar_retry">' +
                                '&#x21bb;</span>');
                     return;
                  }
                  msb.find('span.count').remove();
                  var len = data.length;
                  var beginIdx = data.indexOf('<div id="right_column');
                  var postIdx = data.indexOf('<!-- Posts -->', beginIdx);
                  var followerIdx = data.indexOf('<!-- Followers -->',
                                                 beginIdx);
                  var msgsIdx = data.indexOf('<!-- Messages -->', beginIdx);
                  var draftIdx = data.indexOf('<!-- Drafts -->', beginIdx);
                  var queueIdx = data.indexOf('<!-- Queue -->', beginIdx);
                  var endIdx = data.indexOf('<!-- Launch Mass Post editor -->',
                                            beginIdx);
                  if (followerIdx === -1) { followerIdx = len; }
                  if (msgsIdx === -1) { msgsIdx = len; }
                  var postNum = data.substring(postIdx, followerIdx)
                     .match(/<span class="count">([^<]*)/);
                  if (postNum && postNum.length >= 2) {
                     msb.find('a.posts').append('<span class="count">' +
                                MissingE.escapeHTML(postNum[1]) + '</span>');
                  }
                  if (followerIdx !== len) {
                     var followerNum = data.substring(followerIdx, msgsIdx)
                        .match(/<span class="count">([^<]*)/);
                     if (followerNum && followerNum.length >= 2) {
                        msb.find('a.followers').append('<span class="count">' +
                                   MissingE.escapeHTML(followerNum[1]) +
                                   '</span>');
                     }
                  }
                  if (msgsIdx !== len) {
                     var msgsNum = data.substring(msgsIdx, draftIdx)
                        .match(/<span class="count">([^<]*)/);
                     if (msgsNum && msgsNum.length >= 2) {
                        msb.find('a.messages').append('<span class="count">' +
                                   MissingE.escapeHTML(msgsNum[1]) + '</span>');
                     }
                  }
                  var draftNum = data.substring(draftIdx, queueIdx)
                     .match(/<span class="count">([^<]*)/);
                  if (draftNum && draftNum.length >= 2) {
                     msb.find('a.drafts').append('<span class="count">' +
                                MissingE.escapeHTML(draftNum[1]) + '</span>');
                  }
                  var queueNum = data.substring(queueIdx, endIdx)
                     .match(/<span class="count">([^<]*)/);
                  if (queueNum && queueNum.length >= 2) {
                     msb.find('a.queue').append('<span class="count">' +
                                MissingE.escapeHTML(queueNum[1]) + '</span>');
                  }
                  msb.trigger('load.sidebar', this.tumblrAcct);
               }
            });
            $('#MissingE_sidebar span.MissingE_sidebar_retry').live('click',
                                                                    function() {
               var acct = parseInt($('#MissingE_sidebar').attr('account'));
               if (isNaN(acct)) { acct = 0; }
               $('#MissingE_sidebar').remove();
               MissingE.packages.sidebarTweaks.makeSidebar(acct, retries);
               return false;
            });
            $('#MissingE_sidebar_title').click(function(e) {
               if (e.target.id &&
                   e.target.id === 'MissingE_sidebar_bloglink') {
                  return;
               }
               var menu = $('#MissingE_sidebar_menu');
               if (menu.length > 0 &&
                   menu.find('li:not(.current_sidebar)').length > 0) {
                  if (menu.is(':visible')) {
                     $('#MissingE_sidebar').removeClass('hiddenish');
                     $('#overlay_for_active_menu').hide();
                     menu.hide();
                  }
                  else {
                     $('#MissingE_sidebar').addClass('hiddenish');
                     if ($('#overlay_for_active_menu').length === 0) {
                        $('body').prepend('<div id="overlay_for_active_menu">' +
                                          '</div>');
                     }
                     $('#overlay_for_active_menu').show();
                     menu.show();
                  }
               }
            });
            $('#MissingE_sidebar_menu a').click(function() {
               var newAcctNum = $('#MissingE_sidebar_menu a').index(this);
               $('#MissingE_sidebar').remove();
               $('#overlay_for_active_menu').hide();
               extension.sendRequest("sidebarTweaks", {accountNum: newAcctNum});
               MissingE.packages.sidebarTweaks.makeSidebar(newAcctNum,retries);
            });
            $('#overlay_for_active_menu').live('click', function() {
               if ($('#MissingE_sidebar_menu').is(':visible')) {
                  $('#MissingE_sidebar').removeClass('hiddenish');
                  $(this).hide();
                  $('#MissingE_sidebar_menu').hide();
               }
            });
         }
      }
   },
   
   run: function() {
      var settings = this.settings;
      $('head').append('<style type="text/css">' +
                       '#MissingE_sidebar_title a { background-image:url("' +
                       extension.getURL('core/sidebarTweaks/picker.png') +
                       '") !important; } ' +
                       '#MissingE_sidebar_title #MissingE_sidebar_bloglink {' +
                       'background-image:url("' +
                       extension.getURL('core/sidebarTweaks/to_blog.png') +
                       '") !important; }</style>');
   
      if (settings.followingLink === 1) {
         $('#right_column a.following').attr('href','/following');
      }
      if (settings.slimSidebar === 1) {
         $('#tag_contributors li.item, #tag_editors li.item, ' +
           '#recommended_tumblelogs li.item').each(function() {
            var bg = $(this).css('background-image');
            bg = bg.replace(/_40\./,'_30.');
            $(this).css('background-image',bg);
         });
      }
      if (settings.addSidebar === 1) {
         MissingE.packages.sidebarTweaks.makeSidebar(settings.accountNum,
                                                     settings.retries);
      }
   },

   init: function() {
      extension.sendRequest("settings", {component: "sidebarTweaks"},
                            function(response) {
         if (response.component === "sidebarTweaks") {
            var i;
            MissingE.packages.sidebarTweaks.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.sidebarTweaks.settings[i] = response[i];
               }
            }
            MissingE.packages.sidebarTweaks.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.sidebarTweaks.init();
}

}(jQuery));
