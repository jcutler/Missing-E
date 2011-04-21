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
   postMessage({greeting: "start", isFrame: fr, url: location.href,
                                             bodyId: document.body.id});
}

function doStartup(message) {
   var i;
   if (MissingE_startup) { return; }
   MissingE_startup = true;
   if (/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/submissions/
         .test(location.href) ||
       /http:\/\/www\.tumblr\.com\/messages/.test(location.href) ||
       /http:\/\/www\.tumblr\.com\/submissions/.test(location.href)) {
      document.domain = "tumblr.com";
   }
   var info = "'Missing e' Startup on ";
   info += message.url + "\n";
   for (i in message) {
      if (message.hasOwnProperty(i)) {
         if (i !== 'url' &&
             i !== 'isFrame' &&
             !(/_fill$/.test(i)) &&
             i !== 'greeting' &&
             i !== 'extensionURL') {
            info += i + ": " + (message[i] ? "active" : "inactive") +
                     "\n";
         }
      }
   }
   console.log(info);
   jQuery.noConflict();

   jQuery.facebox.settings.closeImage = message.extensionURL +
      'facebox/closelabel.png';
   jQuery.facebox.settings.loadingImage = message.extensionURL +
      'facebox/loading.gif';

   jQuery('head').append('<link rel="stylesheet" type="text/css" ' +
                         'href="' + message.extensionURL + 'facebox/facebox.css" />');

   if (window.top === window) {
      if (message.bookmarker) {
         MissingE_bookmarker_doStartup(message.extensionURL);
      }
      if (message.dashLinksToTabs) {
         postMessage({greeting: "settings", component: "dashLinksToTabs"});
      }
      if (message.postCrushes) {
         if (message.postCrushes_fill) {
            MissingE_postCrushes_fill_doStartup(message.extensionURL);
         }
         else {
            MissingE_postCrushes_doStartup(message.extensionURL);
         }
      }
      if (message.betterReblogs) {
         if (message.betterReblogs_fill) {
            MissingE_betterReblogs_fill_doStartup();
         }
         else {
            postMessage({greeting: "settings", component: "betterReblogs"});
         }
      }
      if (message.replyReplies) {
         if (message.replyReplies_fill) {
            MissingE_replyReplies_fill_doStartup();
         }
         else {
            MissingE_replyReplies_doStartup(message.extensionURL);
         }
      }
      if (message.followChecker) {
         postMessage({greeting: "settings", component: "followChecker"});
      }
      if (message.unfollower) {
         postMessage({greeting: "settings", component: "unfollower"});
      }
      if (message.postingFixes) {
         postMessage({greeting: "settings", component: "postingFixes"});
      }
      if (message.dashboardFixes) {
         postMessage({greeting: "settings", component: "dashboardFixes"});
      }
      if (message.reblogYourself) {
         MissingE_reblogYourself_dash_doStartup();
      }
      if (message.safeDash) {
         MissingE_safeDash_doStartup(message.extensionURL);
      }
      if (message.timestamps) {
         MissingE_timestamps_doStartup();
      }
      if (message.magnifier) {
         MissingE_magnifier_doStartup(message.extensionURL);
      }
   }
   else {
      if (message.betterReblogs) {
         MissingE_betterReblogs_post_doStartup(message.url);
      }
      if (message.askFixes) {
         MissingE_askFixes_doStartup(message.extensionURL);
      }
      if (message.gotoDashPost) {
         MissingE_gotoDashPost_doStartup(message.extensionURL);
      }
      if (message.reblogYourself) {
         MissingE_reblogYourself_post_doStartup();
      }
   }
}

function settings_startup(message) {
   if (message.component === "postingFixes") {
      MissingE_postingFixes_doStartup(message.extensionURL,
                                      message.photoReplies,
                                      message.uploaderToggle,
                                      message.addUploader,
                                      message.quickButtons);
   }
   else if (message.component === "followChecker") {
      MissingE_followChecker_doStartup(message.extensionURL, message.retries);
   }
   else if (message.component === "unfollower") {
      MissingE_unfollower_doStartup(message.extensionURL, message.retries);
   }
   else if (message.component === "dashLinksToTabs") {
      MissingE_dashLinksToTabs_doStartup(message.newPostTabs,
                                         message.sidebar,
                                         message.reblogLinks,
                                         message.editLinks);
   }
   else if (message.component === "dashboardFixes") {
      MissingE_dashboardFixes_doStartup(message.extensionURL,
                                        message.reblogQuoteFit,
                                        message.wrapTags,
                                        message.replaceIcons,
                                        message.timeoutAJAX,
                                        message.timeoutLength,
                                        message.postLinks);
   }
   else if (message.component === "betterReblogs") {
      MissingE_betterReblogs_dash_doStartup(message.passTags);
   }
}

on('message', function onMessage(message) {
   if (message.greeting === "startup") {
      doStartup(message);
   }
   else if (message.greeting === "settings") {
      settings_startup(message);
   }
});
