/*
 * 'Missing e' Extension
 *
 * Copyright 2012, Jeremy Cutler
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

if ((window.top === window &&
    !(/http:\/\/missing-e\.com/.test(location.href)) &&
    !(/http:\/\/www\.tumblr\.com\/customize/.test(location.href))) ||
    /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href) ||
    /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href) ||
    /http:\/\/www\.tumblr\.com\/send(_confirmation)?/.test(location.href)) {
   var fr = /http:\/\/www\.tumblr\.com\/dashboard\/iframe/
               .test(location.href) ||
            /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href) ||
            /http:\/\/www\.tumblr\.com\/send(_confirmation)?/
               .test(location.href);
   safari.self.tab.dispatchMessage("start", {isFrame: fr, url: location.href,
                                             bodyId: document.body.id});
   safari.self.tab.dispatchMessage("update");
}

function updateCheck(response) {
   if (response.name !== "update") { return; }
   var up = document.getElementById('missinge_updatenotice');
   if (up && response.message.update) {
      var html = document.getElementsByTagName('html');
      var lang = 'en';
      if (html && html[0]) { lang = html[0].getAttribute('lang'); }
      up.setAttribute('title', MissingE.getLocale(lang).update);
      var post = '';
      if (response.message.link !== '') {
         post = 'post/' + response.message.link;
      }
      up.onclick = function() {
         window.open('http://missing-e.com/update/safari');
      };
      up.style.display = 'block';
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
             i !== 'zindexFix' && i !== 'version' && i !== "warningInfo" &&
             i !== 'konami') {
            info += i + ": " + (response.message[i] ? "active" : "inactive") +
                     "\n";
         }
      }
   }
   MissingE.log(info);

   if (window.top === window) {
      if (response.message.warningInfo) {
         MissingE.utilities.warningInfo.init();
      }
      if (response.message.zindexFix) {
         MissingE.utilities.zindexFix.init();
      }
      if (response.message.konami) {
         MissingE.utilities.konami.init();
      }
      if (response.message.getAccounts) {
         MissingE.packages.getAccounts.init();
      }
      if (response.message.massEditor) {
         MissingE.packages.massEditor.init();
      }
      if (response.message.bookmarker) {
         MissingE.packages.bookmarker.init();
      }
      if (response.message.dashLinksToTabs) {
         MissingE.packages.dashLinksToTabs.init();
      }
      if (response.message.postCrushes) {
         if (response.message.postCrushes_fill) {
            MissingE.packages.postCrushesFill.init();
         }
         else {
            MissingE.packages.postCrushes.init();
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
            MissingE.packages.replyRepliesFill.init();
         }
         else {
            MissingE.packages.replyReplies.init();
         }
      }
      if (response.message.postingTweaks) {
         MissingE.packages.postingTweaks.init();
      }
      if (response.message.sidebarTweaks) {
         MissingE.packages.sidebarTweaks.init();
      }
      if (response.message.dashboardTweaks) {
         MissingE.packages.dashboardTweaks.init();
      }
      if (response.message.askTweaks) {
         MissingE.packages.askTweaks.init();
      }
      if (response.message.reblogYourself) {
         if (response.message.reblogYourself_fill) {
            MissingE.packages.reblogYourselfFill.init();
         }
         else {
            MissingE.packages.reblogYourself.init();
         }
      }
      if (response.message.safeDash) {
         MissingE.packages.safeDash.init();
      }
      if (response.message.timestamps) {
         MissingE.packages.timestamps.init();
      }
      if (response.message.magnifier) {
         MissingE.packages.magnifier.init();
      }
   }
   else {
      if (response.message.betterReblogs) {
         MissingE.packages.betterReblogsPost.init();
      }
      if (response.message.askTweaks) {
         MissingE.packages.askTweaks.init();
      }
      if (response.message.gotoDashPost) {
         MissingE.packages.gotoDashPost.init();
      }
      if (response.message.reblogYourself) {
         MissingE.packages.reblogYourselfPost.init();
      }
      if (response.message.postingTweaks) {
         MissingE.packages.postingTweaksPost.init();
      }
   }
}

safari.self.addEventListener("message", updateCheck, false);
safari.self.addEventListener("message", doStartup, false);