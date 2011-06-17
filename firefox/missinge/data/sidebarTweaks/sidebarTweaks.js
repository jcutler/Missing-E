function makeSidebar(tumblrAcctNum, retries) {
   var tumblrAcct = '';
   var tumblrText = '';
   var sidebartxt = '';
   var sidebarPosts = jQuery('#right_column a.posts');
   if (jQuery('#right_column a.posts').length === 0) {
      var i;
      var list = [];
      var bloglist = '';
      jQuery('#user_channels li').each(function() {
         list.push([this.id.match(/tab-(.*)/)[1], jQuery(this).text()]);
      });
      if (tumblrAcctNum >= list.length) {
         tumblrAcctNum = 0;
      }
      if (list.length > 0) {
         bloglist = '<ul id="MissingE_sidebar_menu" ' +
            'class="right_column_section">';
         for (i=0; i<list.length; i++) {
            var klass = '';
            if (i === tumblrAcctNum) {
               tumblrAcct = list[i][0];
               tumblrText = list[i][1];
               klass = 'class="current_sidebar"';
            }
            bloglist += '<li ' + klass + '><a tumblr="' + list[i][0] +
               '" href="#" onclick="return false;"><div class="hide_overflow">' +
               list[i][1] + '</div></a></li>';
         }
         bloglist += '</ul>';
      }
   
      var lang = jQuery('html').attr('lang');
      var sidebarList = [
         {
         label: locale[lang]["sidebar"]["posts"],
         klass: "posts"
         },
         {
         label: locale[lang]["sidebar"]["followers"],
         klass: "followers"
         },
         {
         label: locale[lang]["sidebar"]["messages"],
         klass: "messages"
         },
         {
         label: locale[lang]["sidebar"]["drafts"],
         klass: "drafts"
         },
         {
         label: locale[lang]["sidebar"]["queue"],
         klass: "queue"
         }
      ];
      sidebartxt = '<ul class="right_column_section" id="MissingE_sidebar">' +
         '<li id="MissingE_sidebar_title" class="recessed selected">' +
            '<a href="#" onclick="return false;">' + tumblrText + '</a>' +
            bloglist + '</li>';
      for (i=0; i<sidebarList.length; i++) {
         sidebartxt += '<li><a href="/tumblelog/' + tumblrAcct +
            (sidebarList[i].klass !== 'posts' ? '/' + sidebarList[i].klass : '') +
            '" class="' + sidebarList[i].klass + '"><div class="hide_overflow">' +
            sidebarList[i].label + '</div></a></li>';
      }
      sidebartxt += '<li class="recessed"><a href="/mega-editor/' + tumblrAcct +
         '" class="mass_editor"><div class="hide_overflow">' +
         locale[lang]["sidebar"]["massEditor"] + '</div><div class="gradient">' +
         '</div></a></li></ul>';
   
      var sidebar;
      var beforeguy = jQuery('#right_column a.likes');
      if (beforeguy.length === 0) {
         beforeguy = jQuery('#right_column a.following');
      }
      if (beforeguy.length > 0) {
         sidebar = jQuery(sidebartxt)
            .insertAfter(beforeguy.closest('.right_column_section'));
      }
      else if (jQuery('#search_form').length > 0) {
         sidebar = jQuery(sidebartxt).insertBefore('#search_form');
      }
      if (sidebar) {
         jQuery.ajax({
            type: "GET",
            url: "http://www.tumblr.com/tumblelog/" + tumblrAcct,
            dataType: "html",
            tryCount: 0,
            retryLimit: retries,
            error: function(xhr, textStatus) {
               this.tryCount++;
               if (this.tryCount <= this.retryLimit) {
                  jQuery.ajax(this);
                  return;
               }
            },
            success: function(data, textStatus) {
               if (!(/id="dashboard_index"/.test(data))) {
                  this.tryCount++;
                  if (this.tryCount <= this.retryLimit) {
                     jQuery.ajax(this);
                     return;
                  }
                  return;
               }
               var postIdx = data.indexOf('<!-- Posts -->');
               var followerIdx = data.indexOf('<!-- Followers -->');
               var msgsIdx = data.indexOf('<!-- Messages -->');
               var draftIdx = data.indexOf('<!-- Drafts -->');
               var queueIdx = data.indexOf('<!-- Queue -->');
               var endIdx = data.indexOf('<!-- Launch Mass Post editor -->');
               var postNum = data.substring(postIdx, followerIdx)
                  .match(/<span class="count">([^>]*)/);
               if (postNum && postNum.length >= 2) {
                  postNum = postNum[1];
               }
               else {
                  postNum = null;
               }
               var followerNum = data.substring(followerIdx, msgsIdx)
                  .match(/<span class="count">([^>]*)/);
               if (followerNum && followerNum.length >= 2) {
                  followerNum = followerNum[1];
               }
               else {
                  followerNum = null;
               }
               var msgsNum = data.substring(msgsIdx, draftIdx)
                  .match(/<span class="count">([^>]*)/);
               if (msgsNum && msgsNum.length >= 2) {
                  msgsNum = msgsNum[1];
               }
               else {
                  msgsNum = null;
               }
               var draftNum = data.substring(draftIdx, queueIdx)
                  .match(/<span class="count">([^>]*)/);
               if (draftNum && draftNum.length >= 2) {
                  draftNum = draftNum[1];
               }
               else {
                  draftNum = null;
               }
               var queueNum = data.substring(queueIdx, endIdx)
                  .match(/<span class="count">([^>]*)/);
               if (queueNum && queueNum.length >= 2) {
                  queueNum = queueNum[1];
               }
               else {
                  queueNum = null;
               }
               if (postNum) {
                  jQuery('#MissingE_sidebar a.posts').append('<span class="count">' +
                                                        postNum + '</span>');
               }
               if (followerNum) {
                  jQuery('#MissingE_sidebar a.followers').append('<span class="count">' +
                                                        followerNum + '</span>');
               }
               if (msgsNum) {
                  jQuery('#MissingE_sidebar a.messages').append('<span class="count">' +
                                                        msgsNum + '</span>');
               }
               if (draftNum) {
                  jQuery('#MissingE_sidebar a.drafts').append('<span class="count">' +
                                                        draftNum + '</span>');
               }
               if (queueNum) {
                  jQuery('#MissingE_sidebar a.queue').append('<span class="count">' +
                                                        queueNum + '</span>');
               }
            }
         });
         jQuery('#MissingE_sidebar_title').click(function() {
            var menu = jQuery('#MissingE_sidebar_menu');
            if (menu.length > 0 &&
                menu.find('li:not(.current_sidebar)').length > 0) {
               if (menu.is(':visible')) {
                  jQuery('#overlay_for_active_menu').hide();
                  menu.hide();
               }
               else {
                  if (jQuery('#overlay_for_active_menu').length === 0) {
                     jQuery('body').prepend('<div id="overlay_for_active_menu"></div>');
                  }
                  jQuery('#overlay_for_active_menu').show();
                  menu.show();
               }
            }
         });
         jQuery('#MissingE_sidebar_menu a').click(function() {
            var newAcctNum = jQuery('#MissingE_sidebar_menu a').index(this);
            jQuery('#MissingE_sidebar').remove();
            jQuery('#overlay_for_active_menu').hide();
            self.postMessage({greeting: "sidebarTweaks",
                              accountNum: newAcctNum});
            makeSidebar(newAcctNum,retries);
         });
         jQuery('#overlay_for_active_menu').live('click', function() {
            if (jQuery('#MissingE_sidebar_menu').is(':visible')) {
               jQuery(this).hide();
               jQuery('#MissingE_sidebar_menu').hide();
            }
         });
      }
   }
}

self.on('message', function(message) {
   if (message.greeting !== "settings" ||
       message.component !== "sidebarTweaks") {
      return false;
   }
   var extensionURL = message.extensionURL;
   jQuery('head').append('<link type="text/css" rel="stylesheet" ' +
                         'href="' + extensionURL +
                         'sidebarTweaks/sidebarTweaks.css" />');
   jQuery('head').append('<style type="text/css">' +
                    '#MissingE_sidebar_title a {' +
                    'background-image:url("' +
                    extensionURL + 'sidebarTweaks/picker.png"); }' +
                    '</style>');

   if (message.hideRadar === 1) {
      jQuery('head').append('<style type="text/css">' +
                       '#right_column div.radar { display:none; }' +
                       '</style>');
   }
   if (message.followingLink === 1) {
      jQuery('#right_column a.following').attr('href','/following');
   }
   if (message.slimSidebar === 1) {
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = extensionURL + "sidebarTweaks/slimSidebar.css";
      document.getElementsByTagName('head')[0].appendChild(style);
      jQuery('#tag_contributors li.item, #tag_editors li.item').each(function(){
         var bg = jQuery(this).css('background-image');
         bg = bg.replace(/_40\./,'_30.');
         jQuery(this).css('background-image',bg);
      });
   }
   if (message.addSidebar === 1) {
      makeSidebar(message.accountNum,
                  message.retries);
   }
});

self.postMessage({greeting: "settings", component: "sidebarTweaks"});
