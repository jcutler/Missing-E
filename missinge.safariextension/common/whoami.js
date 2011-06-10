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

/*global window, safari, MissingE_bookmarker_doStartup,
  MissingE_dashboardFixes_doStartup, MissingE_dashLinksToTabs_doStartup,
  MissingE_followChecker_doStartup, MissingE_gotoDashPost_doStartup,
  MissingE_magnifier_doStartup, MissingE_postCrushes_doStartup,
  MissingE_postCrushes_fill_doStartup, MissingE_postingFixes_doStartup,
  MissingE_reblogYourself_dash_doStartup,
  MissingE_reblogYourself_post_doStartup, MissingE_replyReplies_doStartup,
  MissingE_replyReplies_fill_doStartup, MissingE_safeDash_doStartup,
  MissingE_timestamps_doStartup, MissingE_unfollower_doStartup */

var MissingE_startup;
if ((window.top === window &&
    !(/http:\/\/www\.tumblr\.com\/customize/.test(location.href))) ||
    /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href) ||
    /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href)) {
   var fr = /http:\/\/www\.tumblr\.com\/dashboard\/iframe/
               .test(location.href) ||
            /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href);
   safari.self.tab.dispatchMessage("start", {isFrame: fr, url: location.href,
                                             bodyId: document.body.id});
}

function doStartup(response) {
   var i;
   if (MissingE_startup) { return; }
   MissingE_startup = true;
   if (/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/submissions/
         .test(location.href) ||
       /http:\/\/www\.tumblr\.com\/messages/.test(location.href) ||
       /http:\/\/www\.tumblr\.com\/submissions/.test(location.href)) {
      document.domain = "tumblr.com";
   }
   if (response.name !== "startup") { return; }
   var info = "'Missing e' Startup on ";
   info += response.message.url + "\n";
   for (i in response.message) {
      if (response.message.hasOwnProperty(i)) {
         if (i !== 'url' && i !== 'isFrame' && !(/_fill$/.test(i)) && i !== 'zindexFix') {
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
            safari.self.tab.dispatchMessage("settings",
                                            {component: "betterReblogs",
                                             subcomponent: "fill"});
         }
         else {
            safari.self.tab.dispatchMessage("settings",
                                            {component: "betterReblogs",
                                             subcomponent: "dash"});
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
      if (response.message.followChecker) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "followChecker"});
      }
      if (response.message.unfollower) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "unfollower"});
      }
      if (response.message.postingFixes) {
         safari.self.tab.dispatchMessage("settings",
                                         {component: "postingFixes"});
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
         MissingE_timestamps_doStartup();
      }
      if (response.message.magnifier) {
         MissingE_magnifier_doStartup();
      }
   }
   else {
      if (response.message.betterReblogs) {
         MissingE_betterReblogs_post_doStartup(response.message.url);
      }
      if (response.message.askFixes) {
         MissingE_askFixes_scroll_doStartup();
      }
      if (response.message.gotoDashPost) {
         MissingE_gotoDashPost_doStartup();
      }
      if (response.message.reblogYourself) {
         MissingE_reblogYourself_post_doStartup();
      }
   }
}

function settings_startup(response) {
   if (response.name !== "settings") { return; }
   else if (response.message.component === "bookmarker") {
      MissingE_bookmarker_doStartup(response.message.format);
   }
   else if (response.message.component === "postingFixes") {
      MissingE_postingFixes_doStartup(response.message.photoReplies,
                                      response.message.uploaderToggle,
                                      response.message.addUploader,
                                      response.message.quickButtons,
                                      response.message.blogSelect);
   }
   else if (response.message.component === "askFixes") {
      MissingE_askFixes_doStartup(response.message.tagAsker,
                                  response.message.defaultTags,
                                  response.message.buttons,
                                  response.message.tags);
   }
   else if (response.message.component === "followChecker") {
      MissingE_followChecker_doStartup(response.message.retries);
   }
   else if (response.message.component === "unfollower") {
      MissingE_unfollower_doStartup(response.message.retries,
                                    response.message.ignore);
   }
   else if (response.message.component === "dashLinksToTabs") {
      MissingE_dashLinksToTabs_doStartup(response.message.newPostTabs,
                                         response.message.sidebar,
                                         response.message.reblogLinks,
                                         response.message.editLinks);
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
                                        response.message.followingLink);
   }
   else if (response.message.component === "betterReblogs") {
      if (response.message.subcomponent === "dash") {
         MissingE_betterReblogs_dash_doStartup(response.message.passTags,
                                        response.message.quickReblog,
                                        response.message.replaceIcons,
                                        response.message.accountName);
      }
      else if (response.message.subcomponent === "fill") {
         MissingE_betterReblogs_fill_doStartup(response.message.autoFillTags);
      }
   }
}

safari.self.addEventListener("message", doStartup, false);
safari.self.addEventListener("message", settings_startup, false);
