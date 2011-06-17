function makeSidebar(tumblrAcctNum, retries) {
   var tumblrAcct = '';
   var tumblrText = '';
   var sidebartxt = '';
   var sidebarPosts = $('#right_column a.posts');
   if ($('#right_column a.posts').length === 0) {
      var i;
      var list = [];
      var bloglist = '';
      $('#user_channels li').each(function() {
         list.push([this.id.match(/tab-(.*)/)[1], $(this).text()]);
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
   
      var lang = $('html').attr('lang');
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
      var beforeguy = $('#right_column a.likes');
      if (beforeguy.length === 0) {
         beforeguy = $('#right_column a.following');
      }
      if (beforeguy.length > 0) {
         sidebar = $(sidebartxt)
            .insertAfter(beforeguy.closest('.right_column_section'));
      }
      else if ($('#search_form').length > 0) {
         sidebar = $(sidebartxt).insertBefore('#search_form');
      }
      if (sidebar) {
         $.ajax({
            type: "GET",
            url: "http://www.tumblr.com/tumblelog/" + tumblrAcct,
            dataType: "html",
            tryCount: 0,
            retryLimit: retries,
            error: function(xhr, textStatus) {
               this.tryCount++;
               if (this.tryCount <= this.retryLimit) {
                  $.ajax(this);
                  return;
               }
            },
            success: function(data, textStatus) {
               if (!(/id="dashboard_index"/.test(data))) {
                  this.tryCount++;
                  if (this.tryCount <= this.retryLimit) {
                     $.ajax(this);
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
                  $('#MissingE_sidebar a.posts').append('<span class="count">' +
                                                        postNum + '</span>');
               }
               if (followerNum) {
                  $('#MissingE_sidebar a.followers').append('<span class="count">' +
                                                        followerNum + '</span>');
               }
               if (msgsNum) {
                  $('#MissingE_sidebar a.messages').append('<span class="count">' +
                                                        msgsNum + '</span>');
               }
               if (draftNum) {
                  $('#MissingE_sidebar a.drafts').append('<span class="count">' +
                                                        draftNum + '</span>');
               }
               if (queueNum) {
                  $('#MissingE_sidebar a.queue').append('<span class="count">' +
                                                        queueNum + '</span>');
               }
            }
         });
         $('#MissingE_sidebar_title').click(function() {
            var menu = $('#MissingE_sidebar_menu');
            if (menu.length > 0 &&
                menu.find('li:not(.current_sidebar)').length > 0) {
               if (menu.is(':visible')) {
                  $('#overlay_for_active_menu').hide();
                  menu.hide();
               }
               else {
                  if ($('#overlay_for_active_menu').length === 0) {
                     $('body').prepend('<div id="overlay_for_active_menu"></div>');
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
            safari.self.tab.dispatchMessage("sidebarTweaks",
                                            {accountNum: newAcctNum});
            makeSidebar(newAcctNum,retries);
         });
         $('#overlay_for_active_menu').live('click', function() {
            if ($('#MissingE_sidebar_menu').is(':visible')) {
               $(this).hide();
               $('#MissingE_sidebar_menu').hide();
            }
         });
      }
   }
}

function MissingE_sidebarTweaks_doStartup(retries, accountNum, hideRadar,
                                          slimSidebar, followingLink,
                                          addSidebar) {
   $('head').append('<style type="text/css">' +
                    '#MissingE_sidebar_title a {' +
                    'background-image:url("' +
                    safari.extension.baseURI + 'sidebarTweaks/picker.png' +
                    '"); }</style>');

   if (hideRadar === 1) {
      $('head').append('<style type="text/css">' +
                       '#right_column div.radar { display:none; }' +
                       '</style>');
   }
   if (followingLink === 1) {
      $('#right_column a.following').attr('href','/following');
   }
   if (slimSidebar === 1) {
      $('#right_column').addClass('MissingE_slim_sidebar');
      var style = document.createElement("link");
      style.setAttribute('rel','stylesheet');
      style.setAttribute('type','text/css');
      style.href = safari.extension.baseURI + "sidebarTweaks/slimSidebar.css";
      document.getElementsByTagName('head')[0].appendChild(style);
      $('#tag_contributors li.item, #tag_editors li.item').each(function() {
         var bg = $(this).css('background-image');
         bg = bg.replace(/_40\./,'_30.');
         $(this).css('background-image',bg);
      });
   }
   else {
      $('#right_column').addClass('MissingE_noslim_sidebar');
   }
   if (addSidebar === 1) {
      makeSidebar(accountNum, retries);
   }
}
