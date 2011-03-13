const requests = require("request");
var pageMod = require("page-mod");
const widgets = require("widget");
var tabs = require("tabs");
var ss = require("simple-storage");
var url = require("url");
var data = require("self").data;
/*
var widget = widgets.Widget({
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    tabs.open("http://www.mozilla.org/");
  }
});
*/

var defaultRetries = 10;
var maxRetries = 99;

var myWorker;

function getStorage(key, defVal) {
   var retval = ss.storage[key];
   if (retval === undefined || retval === null || retval === "") {
      return defVal;
   }
   else {
      if (/[^0-9]/.test(retval)) {
         return retval;
      }
      else {
         return parseInt(retval, 10);
      }
   }
}

function handleMessage(message) {
   if (message.greeting === "addMenu") {
      myWorker.postMessage({greeting: "addMenu", url: data.url("")});
   }
   else if (message.greeting == "open") {
      tabs.open(message.url);
   }
   else if (message.greeting == "settings") {
      var settings = {};
      settings.greeting = "settings";
      settings.component = message.component;
      settings.extensionURL = data.url("");
      switch(message.component) {
         case "dashboardFixes":
            settings.reblogQuoteFit = getStorage("MissingE_dashboardFixes_reblogQuoteFit",1);
            settings.wrapTags = getStorage("MissingE_dashboardFixes_wrapTags",1);
            settings.replaceIcons = getStorage("MissingE_dashboardFixes_replaceIcons",1);
            break;
         case "dashLinksToTabs":
            settings.newPostTabs = getStorage("MissingE_dashLinksToTabs_newPostTabs",1);
            settings.sidebar = getStorage("MissingE_dashLinksToTabs_sidebar",0);
            break;
         case "replyReplies":
            settings.showAvatars = getStorage("MissingE_replyReplies_showAvatars",1);
            settings.smallAvatars = getStorage("MissingE_replyReplies_smallAvatars",1);
            settings.addTags = getStorage("MissingE_replyReplies_addTags",1);
            break;
         case "postCrushes_fill":
         case "postCrushes":
            settings.prefix = getStorage("MissingE_postCrushes_prefix","Tumblr Crushes:");
            settings.crushSize = getStorage("MissingE_postCrushes_crushSize",1);
            settings.addTags = getStorage("MissingE_postCrushes_addTags",1);
            settings.showPercent = getStorage("MissingE_postCrushes_showPercent",1);
            break;
         case "postingFixes":
            settings.photoReplies = getStorage("MissingE_postingFixes_photoReplies",1);
            settings.uploaderToggle = getStorage("MissingE_postingFixes_uploaderToggle",1);
            settings.addUploader = getStorage("MissingE_postingFixes_addUploader",1);
            break;
         case "unfollower":
         case "followChecker":
            settings.retries = getStorage("MissingE_" + message.component + "_retries",defaultRetries);
            break;
      }
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "start") {
      var activeScripts = {};
      activeScripts.extensionURL = data.url("");
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/drafts/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/queue/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url))) {
         if (getStorage("MissingE_dashLinksToTabs_enabled",1) == 1) {
            activeScripts.dashLinksToTabs = true;
         }
         else
            activeScripts.dashLinksToTabs = false;

         if (getStorage("MissingE_safeDash_enabled",1) == 1) {
            activeScripts.safeDash = true;
         }
         else
            activeScripts.safeDash = false;

         if (getStorage("MissingE_bookmarker_enabled",1) == 1) {
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getStorage("MissingE_unfollower_enabled",1) == 1 ||
             getStorage("MissingE_followChecker_enabled",1) == 1) {
         }

         if (getStorage("MissingE_unfollower_enabled",1) == 1) {
            activeScripts.unfollower = true;
         }
         else
            activeScripts.unfollower = false;

         if (getStorage("MissingE_followChecker_enabled",1) == 1) {
            activeScripts.followChecker = true;
         }
         else
            activeScripts.followChecker = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/drafts/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/queue/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url))) {
         if (getStorage("MissingE_dashboardFixes_enabled",1) == 1) {
            activeScripts.dashboardFixes = true;
         }
         else
            activeScripts.dashboardFixes = false;
      }
      if (!message.isFrame &&
          ((message.bodyId == 'dashboard_edit_post' &&
            (/http:\/\/www\.tumblr\.com\/new\//.test(message.url) ||
             /http:\/\/www\.tumblr\.com\/tumblelog\/[0-9A-Za-z\-\_]+\/new\//.test(message.url) ||
             /http:\/\/www\.tumblr\.com\/reblog\//.test(message.url) ||
             /http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(message.url))) ||
         (/http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/.test(message.url)) ||
         (/http:\/\/www\.tumblr\.com\/share/.test(message.url)))) {
         if (getStorage("MissingE_postingFixes_enabled",1) == 1) {
            activeScripts.postingFixes = true;
         }
         else
            activeScripts.postingFixes = false;
      }
      if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(message.url) &&
          !(/http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/new\//.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/new\//.test(message.url))) {
         if (getStorage("MissingE_gotoDashPost_enabled",1) == 1) {
            activeScripts.gotoDashPost = true;
         }
         else
            activeScripts.gotoDashPost = false;

         if (getStorage("MissingE_reblogYourself_enabled",1) == 1 &&
             getStorage("MissingE_reblogYourself_postPage",1) == 1) {
            activeScripts.reblogYourself = true;
         }
         else
            activeScripts.reblogYourself = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url))) {
         if (getStorage("MissingE_replyReplies_enabled",1) == 1) {
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = false;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/new\/text/.test(message.url)) {
         if (getStorage("MissingE_replyReplies_enabled",1) == 1) {
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = true;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/following/.test(message.url)) {
         if (getStorage("MissingE_postCrushes_enabled",1) == 1) {
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = false;
         }
         else
            activeScripts.postCrushes = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/new\/photo/.test(message.url)) {
         if (getStorage("MissingE_postCrushes_enabled",1) == 1) {
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = true;
         }
         else
            activeScripts.postCrushes = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages|drafts|queue)/.test(message.url))) {
         if (getStorage("MissingE_timestamps_enabled",1) == 1) {
            activeScripts.timestamps = true;
         }
         else
            activeScripts.timestamps = false;

         if (getStorage("MissingE_magnifier_enabled",1) == 1) {
            activeScripts.magnifier = true;
         }
         else
            activeScripts.magnifier = false;

         if (getStorage("MissingE_reblogYourself_enabled",1) == 1 &&
             getStorage("MissingE_reblogYourself_dashboard",1) == 1) {
            activeScripts.reblogYourself = true;
         }
         else
            activeScripts.reblogYourself = false;
      }

      activeScripts.url = message.url;
      activeScripts.isFrame = message.isFrame;
      activeScripts.greeting = "startup";
      myWorker.postMessage(activeScripts);
   }

}

pageMod.PageMod({
   include: ["http://www.tumblr.com/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("common/jquery-1.5.min.js"),
                       data.url("common/addmenu.js"),
                       data.url("common/defs.js"),
                       data.url("common/utils.js"),
                       data.url("common/storage.js"),
                       data.url("bookmarker/bookmarker.js"),
                       data.url("dashboardFixes/dashboardFixes.js"),
                       data.url("dashLinksToTabs/dashLinksToTabs.js"),
                       data.url("gotoDashPost/gotoDashPost.js"),
                       data.url("postCrushes/postCrushes.js"),
                       data.url("postCrushes/postCrushes_fill.js"),
                       /*
                       data.url("facebox/facebox.js"),
                       data.url("followChecker/followChecker.js"),
                       data.url("magnifier/magnifier.js"),
                       data.url("postingFixes/postingFixes.js"),
                       data.url("reblogYourself/reblogYourself_post.js"),
                       data.url("reblogYourself/reblogYourself_dash.js"),
                       data.url("replyReplies/replyReplies.js"),
                       data.url("replyReplies/replyReplies_fill.js"),
                       data.url("safeDash/safeDash.js"),
                       data.url("timestamps/timestamps.js"),
                       data.url("unfollower/unfollower.js"),
                       */
                       data.url("common/whoami.js")],
   contentScript: ["postMessage('Content script is attached to '+ " +
                   "document.URL);"],
   onAttach: function onAttach(worker) {
      worker.on('message', handleMessage);
      myWorker = worker;
   }
});



console.log("Missing e is running.");
