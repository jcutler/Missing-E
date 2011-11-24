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

/*global doZindexFix,getLocale,
  MissingE_askFixes_doStartup,
  MissingE_askFixes_domain_doStartup,
  MissingE_askFixes_scroll_doStartup,
  MissingE_betterReblogs_dash_doStartup,
  MissingE_betterReblogs_fill_doStartup,
  MissingE_betterReblogs_post_doStartup,
  MissingE_bookmarker_doStartup,
  MissingE_dashboardFixes_doStartup,
  MissingE_dashLinksToTabs_doStartup,
  MissingE_gotoDashPost_doStartup,
  MissingE_magnifier_doStartup,
  MissingE_massEditor_doStartup,
  MissingE_postCrushes_doStartup,
  MissingE_postCrushes_fill_doStartup,
  MissingE_postingFixes_doStartup,
  MissingE_postingFixes_subEdit_doStartup,
  MissingE_reblogYourself_dash_doStartup,
  MissingE_reblogYourself_post_doStartup,
  MissingE_replyReplies_doStartup,
  MissingE_replyReplies_fill_doStartup,
  MissingE_safeDash_doStartup,
  MissingE_sidebarTweaks_doStartup,
  MissingE_timestamps_doStartup,
  safari */ 

if ((window.top === window &&
    !(/http:\/\/missinge\.infraware\.ca/.test(location.href)) &&
    !(/http:\/\/www\.tumblr\.com\/customize/.test(location.href))) ||
    /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href) ||
    /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href)) {
   var fr = /http:\/\/www\.tumblr\.com\/dashboard\/iframe/
               .test(location.href) ||
            /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href);
   safari.self.tab.dispatchMessage("start", {isFrame: fr, url: location.href,
                                             bodyId: document.body.id});
   safari.self.tab.dispatchMessage("update");
}
else if (/http:\/\/missinge\.infraware\.ca/.test(location.href)) {
   var versiondiv = document.getElementById('versioncheck');
   if (versiondiv) {
      var ver = versiondiv.getAttribute('version');
      safari.self.tab.dispatchMessage("version", {v: ver});
   }
}

function updateCheck(response) {
   if (response.name !== "update") { return; }
   var up = document.getElementById('missinge_updatenotice');
   if (up && response.message.update) {
      var html = document.getElementsByTagName('html');
      var lang = 'en';
      if (html && html[0]) { lang = html[0].getAttribute('lang'); }
      up.setAttribute('title', getLocale(lang).update);
      var post = '';
      if (response.message.link !== '') {
         post = 'post/' + response.message.link;
      }
      up.onclick = function() {
         window.open('http://missinge.infraware.ca/update?b=safari');
      };
      up.style.display = 'block';
   }
}

function versionCheck(response) {
   if (response.name !== "version") { return; }
   if (response.message.uptodate) {
      document.getElementById('uptodate').style.display = 'inline-block';
   }
   else {
      document.getElementById('notuptodate').style.display = 'inline-block';
   }
}

function doStartup(response) {
   var i;
   if (response.name !== "startup" ||
       window.location.href !== response.message.url) {
      return;
   }
   if (/http:\/\/www\.tumblr\.com\/blog\/[^\/]*\/submissions/
         .test(location.href) ||
       /http:\/\/www\.tumblr\.com\/blog\/[^\/]*\/messages/
         .test(location.href) ||
       /http:\/\/www\.tumblr\.com\/inbox/.test(location.href) ||
       /http:\/\/www\.tumblr\.com\/submissions/.test(location.href)) {
      document.domain = "tumblr.com";
   }
   var info = "'Missing e' (v" + response.message.version + ") Startup on ";
   info += response.message.url + "\n";
   for (i in response.message) {
      if (response.message.hasOwnProperty(i)) {
         if (i !== 'url' && i !== 'isFrame' && !(/_fill$/.test(i)) &&
             i !== 'zindexFix' && i !== 'version') {
            info += i + ": " + (response.message[i] ? "active" : "inactive") +
                     "\n";
         }
      }
   }
   console.log(info);

   if (window.top === window) {
      if (response.message.zindexFix) {
         doZindexFix();
      }
      if (response.message.massEditor) {
         MissingE_massEditor_doStartup();
      }
      if (response.message.bookmarker) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "bookmarker"});
      }
      if (response.message.dashLinksToTabs) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "dashLinksToTabs"});
      }
      if (response.message.postCrushes) {
         if (response.message.postCrushes_fill) {
            MissingE_postCrushes_fill_doStartup();
         }
         else {
            MissingE_postCrushes_doStartup();
         }
      }
      if (response.message.betterReblogs) {
         if (response.message.betterReblogs_fill) {
            MissingE.packages.betterReblogsFill.init();
         }
         else {
            MissingE.packages.betterReblogs.init();
         }
      }
      if (response.message.replyReplies) {
         if (response.message.replyReplies_fill) {
            MissingE_replyReplies_fill_doStartup();
         }
         else {
            MissingE_replyReplies_doStartup();
         }
      }
      if (response.message.postingFixes) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "postingFixes"});
      }
      if (response.message.sidebarTweaks) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "sidebarTweaks"});
      }
      if (response.message.dashboardFixes) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "dashboardFixes"});
      }
      if (response.message.askFixes) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "askFixes"});
      }
      if (response.message.reblogYourself) {
         MissingE_reblogYourself_dash_doStartup();
      }
      if (response.message.safeDash) {
         MissingE_safeDash_doStartup();
      }
      if (response.message.timestamps) {
         MissingE.packages.timestamps.init();
      }
      if (response.message.magnifier) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "magnifier"});
      }
   }
   else {
      if (response.message.betterReblogs) {
         MissingE.packages.betterReblogsPost.init();
      }
      if (response.message.askFixes) {
         MissingE_askFixes_scroll_doStartup();
         MissingE_askFixes_domain_doStartup();
      }
      if (response.message.gotoDashPost) {
         MissingE.packages.gotoDashPost.init();
      }
      if (response.message.reblogYourself) {
         MissingE_reblogYourself_post_doStartup();
      }
      if (response.message.postingFixes) {
         MissingE_postingFixes_subEdit_doStartup();
      }
   }
}

function settings_startup(response) {
   if (response.name !== "settings") { return; }
   else if (response.message.component === "bookmarker") {
      MissingE_bookmarker_doStartup(response.message.format,
                                    response.message.addBar);
   }
   else if (response.message.component === "magnifier") {
      MissingE_magnifier_doStartup(response.message.magnifyAvatars);
   }
   else if (response.message.component === "postingFixes") {
      MissingE_postingFixes_doStartup(response.message.photoReplies,
                                      response.message.uploaderToggle,
                                      response.message.addUploader,
                                      response.message.quickButtons,
                                      response.message.blogSelect,
                                      response.message.tagQueuedPosts,
                                      response.message.queueTags);
   }
   else if (response.message.component === "askFixes") {
      MissingE_askFixes_doStartup(response.message.tagAsker,
                                  response.message.defaultTags,
                                  response.message.betterAnswers,
                                  response.message.askDash,
                                  response.message.massDelete);
   }
   else if (response.message.component === "dashLinksToTabs") {
      MissingE_dashLinksToTabs_doStartup(response.message.newPostTabs,
                                         response.message.sidebar,
                                         response.message.reblogLinks,
                                         response.message.editLinks);
   }
   else if (response.message.component === "sidebarTweaks") {
      MissingE_sidebarTweaks_doStartup(response.message.retries,
                                       response.message.accountNum,
                                       response.message.slimSidebar,
                                       response.message.followingLink,
                                       response.message.addSidebar);
   }
   else if (response.message.component === "dashboardFixes") {
      MissingE_dashboardFixes_doStartup(response.message.experimental,
                                        response.message.reblogQuoteFit,
                                        response.message.wrapTags,
                                        response.message.replaceIcons,
                                        response.message.timeoutAJAX,
                                        response.message.timeoutLength,
                                        response.message.postLinks,
                                        response.message.reblogReplies,
                                        response.message.widescreen,
                                        response.message.queueArrows,
                                        response.message.expandAll,
                                        response.message.massDelete,
                                        response.message.randomQueue,
                                        response.message.sortableNotes);
   }
}

safari.self.addEventListener("message", updateCheck, false);
safari.self.addEventListener("message", doStartup, false);
safari.self.addEventListener("message", settings_startup, false);
safari.self.addEventListener("message", versionCheck, false);
