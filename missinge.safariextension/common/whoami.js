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
var MissingE_startup;
if (window.top == window ||
    /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(window.location.href)) {
   var fr = /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(window.location.href);
   safari.self.tab.dispatchMessage("start",{isFrame: fr, url: window.location.href, bodyId: document.body.id});
}

function doStartup(response) {
   if (MissingE_startup) return;
   MissingE_startup = true;
   if (response.name != "startup") return;
   var info = "'Missing e' Startup on ";
   info += response.message.url + "\n";
   for (var i in response.message) {
      if (i != 'url' && i != 'isFrame' && !(/_fill$/.test(i))) {
         if (response.message[i])  
            info += i + ": active\n";
         else
            info += i + ": inactive\n";
      }
   }
   console.log(info);
   
   if (window.top == window) {
      if (response.message.bookmarker) MissingE_bookmarker_doStartup();
      if (response.message.dashLinksToTabs)
         safari.self.tab.dispatchMessage("settings",{component: "dashLinksToTabs"});
      if (response.message.postCrushes) {
         if (response.message.postCrushes_fill)
            MissingE_postCrushes_fill_doStartup();
         else
            MissingE_postCrushes_doStartup();
      }
      if (response.message.replyReplies) {
         if (response.message.replyReplies_fill)
            MissingE_replyReplies_fill_doStartup();
         else
            MissingE_replyReplies_doStartup();
      }
      if (response.message.followChecker)
         safari.self.tab.dispatchMessage("settings",{component: "followChecker"});
      if (response.message.unfollower)
         safari.self.tab.dispatchMessage("settings",{component: "unfollower"});
      if (response.message.postingFixes)
         safari.self.tab.dispatchMessage("settings",{component: "postingFixes"});
      if (response.message.reblogQuoteFit) MissingE_reblogQuoteFit_doStartup();
      if (response.message.reblogYourself) MissingE_reblogYourself_dash_doStartup();
      if (response.message.safeDash) MissingE_safeDash_doStartup();
      if (response.message.timestamps) MissingE_timestamps_doStartup();
      if (response.message.magnifier) MissingE_magnifier_doStartup();
   }
   else {
      if (response.message.gotoDashPost) MissingE_gotoDashPost_doStartup();
      if (response.message.reblogYourself) MissingE_reblogYourself_post_doStartup();
   }
}

function settings_startup(response) {
   if (response.name != "settings") return;
   else if (response.message.component == "postingFixes")
      MissingE_postingFixes_doStartup(response.message.photoReplies, response.message.uploaderToggle, response.message.addUploader);
   else if (response.message.component == "followChecker")
      MissingE_followChecker_doStartup(response.message.retries);
   else if (response.message.component == "unfollower")
      MissingE_unfollower_doStartup(response.message.retries);
   else if (response.message.component == "dashLinksToTabs")
      MissingE_dashLinksToTabs_doStartup(response.message.newPostTabs, response.message.sidebar);
}

safari.self.addEventListener("message", doStartup, false);
safari.self.addEventListener("message", settings_startup, false);
