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

if (!(/http:\/\/www\.tumblr\.com\/customize/.test(location.href)) &&
    !(/http:\/\/www\.tumblr\.com\/upload\/image/.test(location.href))) {
   var fr = /http:\/\/www\.tumblr\.com\/dashboard\/iframe/
               .test(location.href) ||
            /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href);
   if (document.body.id !== 'tinymce') {
      self.postMessage({greeting: "start", isFrame: fr, url: location.href,
                                              bodyId: document.body.id});
   }
}

self.on('message', function (message) {
   if (message.greeting !== "startup") {
      return;
   }
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
});
