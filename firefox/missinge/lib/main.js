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

const requests = require("request");
var pageMod = require("page-mod");
const widgets = require("widget");
var tabs = require("tabs");
var ps = require("preferences-service");
var url = require("url");
var data = require("self").data;
var Request = require("request").Request;
var timer = require("timer");

var defaultTimeout = 15;
var minTimeout = 5;
var maxTimeout = 120;
var defaultRetries = 4;
var minRetries = 0;
var maxRetries = 20;
var maxActiveAjax = 15;
var activeAjax = 0;
var waitQueue = [];
var cache = {};
var cacheElements = 0;
var cacheClear;
var clearQueues;
var fiveMinutes = 300000;
var tenSeconds = 10000;

cacheClear = timer.setInterval(function() {
   cache = {};
   cacheElements = 0;
}, fiveMinutes);
clearQueues = timer.setInterval(function() {
   if (activeAjax == 0) {
      dequeueAjax();
   }
}, tenSeconds);

var componentList = ["dashboardFixes",
                     "bookmarker",
                     "dashLinksToTabs",
                     "safeDash",
                     "timestamps",
                     "magnifier",
                     "betterReblogs",
                     "gotoDashPost",
                     "postingFixes",
                     "reblogYourself",
                     "askFixes",
                     "followChecker",
                     "postCrushes",
                     "replyReplies",
                     "unfollower"];

var months = ["Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"];

function getStorage(key, defVal) {
   return ps.get(key, defVal);
}

function setStorage(key, val) {
   ps.set(key, val);
}

function openSettings() {
   for each (var tab in tabs) {
      if (tab.url === data.url("options.html")) {
         tab.close();
      }
   }

   tabs.open({
      url: data.url("options.html"),
      onReady: function(tab) {
         tab.attach({
            contentScriptFile: [data.url("common/jquery-1.5.min.js"),
                                data.url("checkbox/jquery.checkbox.min.js"),
                                data.url("facebox/facebox.js"),
                                data.url("jquery-spin/jquery-spin.js"),
                                data.url("options.js")],
            onMessage: function(data) {
               handleMessage(data, this);
            }
         });
      }
   });
}

if (!getStorage("extensions.MissingE.hideWidget",false)) {
   var widget = widgets.Widget({
      label: "Missing e",
      id: "missinge",
      tooltip: "Missing e Settings",
      contentURL: data.url("missinge32.png"),
      onClick: function() {
         openSettings();
      }
   });
}

function zeroPad(num, len) {
   var ret = "";
   ret += num;
   while (ret.length < len) { ret = "0" + ret; }
   return ret;
}

function getFormattedDate(d, format) {
   var ret = format;
   ret = ret.replace(/%Y/g,d.getFullYear())
            .replace(/%y/g,(d.getFullYear()%100))
            .replace(/%M/g,months[d.getMonth()])
            .replace(/%m/g,zeroPad(d.getMonth()+1,2))
            .replace(/%n/g,(d.getMonth()+1))
            .replace(/%D/g,zeroPad(d.getDate(),2))
            .replace(/%d/g,d.getDate())
            .replace(/%G/g,zeroPad((d.getHours()%12===0 ?
                                    "12" : d.getHours()%12),2))
            .replace(/%g/g,(d.getHours()%12===0 ? "12" : d.getHours()%12))
            .replace(/%H/g,zeroPad(d.getHours(),2))
            .replace(/%h/g,d.getHours())
            .replace(/%i/g,zeroPad(d.getMinutes(),2))
            .replace(/%s/g,zeroPad(d.getSeconds(),2))
            .replace(/%A/g,(d.getHours() < 12 ? "AM" : "PM"))
            .replace(/%a/g,(d.getHours() < 12 ? "am" : "pm"));
   return ret;
}

function doTags(stamp, id, theWorker) {
   var tags = stamp["tags"];
   theWorker.postMessage({greeting: "tags", success: true, data: tags, extensionURL: data.url("")});
}

function doTimestamp(stamp, id, theWorker) {
   var ts = stamp["unix-timestamp"];
   var d = new Date(ts*1000);
   var ins = getStorage("extensions.MissingE.timestamps.format","%Y-%m-%D %H:%i");
   ins = getFormattedDate(d, ins);
   theWorker.postMessage({greeting: "timestamp", pid: id, success: true, data: ins});
}

function doReblogDash(stamp, id, theWorker) {
   var key = stamp["reblog-key"];
   var replaceIcons = getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 &&
                      getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1;
   theWorker.postMessage({greeting: "reblogYourself", pid: id, success: true, data: key, icons: replaceIcons});
}

function doMagnifier(stamp, id, theWorker) {
   var url;
   if (stamp.photos.length > 0) {
      url = new Array();
      for (i=0; i<stamp.photos.length; i++) {
         url.push(stamp.photos[i]["photo-url-1280"]);
         var cap = stamp.photos[i]["caption"];
         if (cap == undefined || cap == null)
            url.push("");
         else
            url.push(cap);
      }
      url = JSON.stringify(url);
   }
   else {
      url = stamp["photo-url-1280"];
   }
   theWorker.postMessage({greeting: "magnifier", pid: id, success: true, data: url});
}

function queueAjax(details) {
   waitQueue.push(details);
}

function runItem(call) {
   if (call.type === "magnifier") {
      startMagnifier(call.message, call.worker);
   }
   else if (call.type === "reblogYourself") {
      startReblogYourself(call.message, call.worker);
   }
   else if (call.type === "timestamp") {
      startTimestamp(call.message, call.worker);
   }
   else if (call.type === "tags") {
      startTags(call.message, call.worker);
   }
}

function dequeueAjax(id) {
   if (id) {
      activeAjax--;
   }
   while (activeAjax < maxActiveAjax) {
      var call = waitQueue.shift();
      if (!call) { return false; }
      runItem(call);
   }
}

function saveCache(id, entry) {
   cacheElements++;
   for (var i in entry) {
      if (i !== "photos" &&
          i !== "photo-url-1280" &&
          i !== "unix-timestamp" &&
          i !== "reblog-key" &&
          i !== "url" &&
          i !== "tags") {
         delete entry[i];
      }
   }
   cache[id] = entry;
}

function cacheServe(type, id, theWorker, fn, midFlight) {
   var entry;
   if ((entry = cache[id])) {
      if (midFlight) {
         dequeueAjax(id);
      }
      else {
         dequeueAjax();
      }
      fn(entry, id, theWorker);
      return true;
   }
   else {
      return false;
   }
}

function startAjax(id) {
   activeAjax++;
}

function startTags(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      console.debug("Stop tags request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("tags", message.pid, myWorker, doTags, false)) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "tags", message: message, worker: myWorker});
   }
   else {
      startAjax(message.pid);
      requestTags(message.url, message.pid, 0, myWorker);
   }
}

function requestTags(url, pid, count, myWorker) {
   Request({
      url: url + "/api/read/json?id=" + pid,
      headers: {tryCount: count,
                retryLimit: getStorage("extensions.MissingE.betterReblogs.retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
            if (closed) {
               console.debug("Stop tags request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("tags", this.headers.targetId, myWorker,
                           doTags, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  requestTags(this.url.replace(/\/api\/read\/json\?id=[0-9]*$/,''), this.headers.targetId, (this.headers.tryCount + 1), myWorker);
               }
               else {
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage({greeting: "tags", success:false});
               }
            }
         }
         else {
            var txt = response.text.replace(/^\s*var\s+tumblr_api_read\s+=\s+/,'').replace(/;\s*$/,'');
            var stamp = JSON.parse(txt);
            var info = stamp["posts"][0];
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doTags(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function startMagnifier(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      console.debug("Stop magnifier request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("magnifier", message.pid, myWorker, doMagnifier, false)) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "magnifier", message: message, worker: myWorker});
   }
   else {
      startAjax(message.pid);
      requestMagnifier(message.url, message.pid, 0, myWorker);
   }
}

function requestMagnifier(url, pid, count, myWorker) {
   Request({
      url: url + "/api/read/json?id=" + pid,
      headers: {tryCount: count,
                retryLimit: getStorage("extensions.MissingE.magnifier.retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
            if (closed) {
               console.debug("Stop magnifier request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("magnifier", this.headers.targetId, myWorker,
                           doMagnifier, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  requestMagnifier(this.url.replace(/\/api\/read\/json\?id=[0-9]*$/,''), this.headers.targetId, (this.headers.tryCount + 1), myWorker);
               }
               else {
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage({greeting: "magnifier", pid: this.headers.targetId, success:false});
               }
            }
         }
         else {
            var txt = response.text.replace(/^\s*var\s+tumblr_api_read\s+=\s+/,'').replace(/;\s*$/,'');
            var stamp = JSON.parse(txt);
            var info = stamp["posts"][0];
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doMagnifier(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function startTimestamp(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      console.debug("Stop timestamp request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("timestamp", message.pid, myWorker, doTimestamp, false)) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "timestamp", message: message, worker: myWorker});
   }
   else {
      startAjax(message.pid);
      requestTimestamp(message.url, message.pid, 0, myWorker);
   }
}

function requestTimestamp(url, pid, count, myWorker) {
   Request({
      url: url + "/api/read/json?id=" + pid,
      headers: {tryCount: count,
                retryLimit: getStorage("extensions.MissingE.timestamps.retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
            if (closed) {
               console.debug("Stop timestamp request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("timestamp", this.headers.targetId, myWorker,
                           doTimestamp, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  requestTimestamp(this.url.replace(/\/api\/read\/json\?id=[0-9]*$/,''), this.headers.targetId, (this.headers.tryCount + 1), myWorker);
               }
               else {
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage({greeting: "timestamp", pid: this.headers.targetId, success:false});
               }
            }
         }
         else {
            var txt = response.text.replace(/^\s*var\s+tumblr_api_read\s+=\s+/,'').replace(/;\s*$/,'');
            var stamp = JSON.parse(txt);
            var info = stamp["posts"][0];
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doTimestamp(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function startReblogYourself(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      console.debug("Stop reblogYourself request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("reblogYourself", message.pid, myWorker, doReblogDash,
                  false)) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "reblogYourself", message: message, worker: myWorker});
   }
   else {
      startAjax(message.pid);
      requestReblogDash(message.url, message.pid, 0, myWorker);
   }
}

function requestReblogDash(url, pid, count, myWorker) {
   Request({
      url: url + "/api/read/json?id=" + pid,
      headers: {tryCount: count,
                retryLimit: getStorage("extensions.MissingE.reblogYourself.retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
            if (closed) {
               console.debug("Stop reblogYourself request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("reblogYourself", this.headers.targetId, myWorker,
                           doReblogDash, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  requestReblogDash(this.url.replace(/\/api\/read\/json\?id=[0-9]*$/,''), this.headers.targetId, (this.headers.tryCount + 1), myWorker);
               }
               else {
                  dequeueAjax(this.headers.targetId);
                  var replaceIcons = getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 &&
                                       getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1;
                  myWorker.postMessage({greeting: "reblogYourself", pid: this.headers.targetId, success:false, icons: replaceIcons});
               }
            }
         }
         else {
            var txt = response.text.replace(/^\s*var\s+tumblr_api_read\s+=\s+/,'').replace(/;\s*$/,'');
            var stamp = JSON.parse(txt);
            var info = stamp["posts"][0];
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doReblogDash(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function handleMessage(message, myWorker) {
   var i;
   if (message.greeting === "addMenu") {
      myWorker.postMessage({greeting: "addMenu", extensionURL: data.url("")});
   }
   else if (message.greeting == "open") {
      if (message.url !== "OPTIONS") {
         tabs.open(message.url);
      }
      else {
         openSettings();
      }
   }
   else if (message.greeting == "reblogYourself") {
      startReblogYourself(message, myWorker);
   }
   else if (message.greeting == "magnifier") {
      startMagnifier(message, myWorker);
   }
   else if (message.greeting == "timestamp") {
      startTimestamp(message, myWorker);
   }
   else if (message.greeting == "tags") {
      startTags(message, myWorker);
   }
   else if (message.greeting == "change-setting") {
      var key = 'extensions.' + message.name.replace(/_/g,'.');
      setStorage(key, message.val);
   }
   else if (message.greeting == "all-settings") {
      var settings = {};
      settings.greeting = "all-settings";
      for (i=0; i<componentList.length; i++) {
         settings["MissingE_" + componentList[i] + "_enabled"] =
            getStorage("extensions.MissingE." + componentList[i] + ".enabled", 1);
      }
      settings.MissingE_dashboardFixes_reblogQuoteFit = getStorage("extensions.MissingE.dashboardFixes.reblogQuoteFit",1);
      settings.MissingE_dashboardFixes_wrapTags = getStorage("extensions.MissingE.dashboardFixes.wrapTags",1);
      settings.MissingE_dashboardFixes_replaceIcons = getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1);
      settings.MissingE_dashboardFixes_timeoutAJAX = getStorage("extensions.MissingE.dashboardFixes.timeoutAJAX",1);
      settings.MissingE_dashboardFixes_timeoutLength = getStorage("extensions.MissingE.dashboardFixes.timeoutLength",defaultTimeout);
      settings.MissingE_dashboardFixes_postLinks = getStorage("extensions.MissingE.dashboardFixes.postLinks",1);
      settings.MissingE_magnifier_retries = getStorage("extensions.MissingE.magnifier.retries",defaultRetries);
      settings.MissingE_dashLinksToTabs_newPostTabs = getStorage("extensions.MissingE.dashLinksToTabs.newPostTabs",1);
      settings.MissingE_dashLinksToTabs_sidebar = getStorage("extensions.MissingE.dashLinksToTabs.sidebar",0);
      settings.MissingE_dashLinksToTabs_reblogLinks = getStorage("extensions.MissingE.dashLinksToTabs.reblogLinks",0);
      settings.MissingE_dashLinksToTabs_editLinks = getStorage("extensions.MissingE.dashLinksToTabs.editLinks",0);
      settings.MissingE_timestamps_retries = getStorage("extensions.MissingE.timestamps.retries",defaultRetries);
      settings.MissingE_timestamps_format = getStorage("extensions.MissingE.timestamps.format","%Y-%m-%D %H:%i");
      settings.MissingE_postingFixes_photoReplies = getStorage("extensions.MissingE.postingFixes.photoReplies",1);
      settings.MissingE_postingFixes_uploaderToggle = getStorage("extensions.MissingE.postingFixes.uploaderToggle",1);
      settings.MissingE_postingFixes_addUploader = getStorage("extensions.MissingE.postingFixes.addUploader",1);
      settings.MissingE_postingFixes_quickButtons = getStorage("extensions.MissingE.postingFixes.quickButtons",1);
      settings.MissingE_reblogYourself_postPage = getStorage("extensions.MissingE.reblogYourself.postPage",1);
      settings.MissingE_reblogYourself_dashboard = getStorage("extensions.MissingE.reblogYourself.dashboard",1);
      settings.MissingE_reblogYourself_retries = getStorage("extensions.MissingE.reblogYourself.retries",defaultRetries);
      settings.MissingE_followChecker_retries = getStorage("extensions.MissingE.followChecker.retries",defaultRetries);
      settings.MissingE_postCrushes_prefix = getStorage("extensions.MissingE.postCrushes.prefix","Tumblr Crushes:");
      settings.MissingE_postCrushes_crushSize = getStorage("extensions.MissingE.postCrushes.crushSize",1);
      settings.MissingE_postCrushes_addTags = getStorage("extensions.MissingE.postCrushes.addTags",1);
      settings.MissingE_postCrushes_showPercent = getStorage("extensions.MissingE.postCrushes.showPercent",1);
      settings.MissingE_replyReplies_showAvatars = getStorage("extensions.MissingE.replyReplies.showAvatars",1);
      settings.MissingE_replyReplies_smallAvatars = getStorage("extensions.MissingE.replyReplies.smallAvatars",1);
      settings.MissingE_replyReplies_addTags = getStorage("extensions.MissingE.replyReplies.addTags",1);
      settings.MissingE_replyReplies_newTab = getStorage("extensions.MissingE.replyReplies.newTab",1);
      settings.MissingE_unfollower_retries = getStorage("extensions.MissingE.unfollower.retries",defaultRetries);
      settings.MissingE_betterReblogs_passTags = getStorage("extensions.MissingE.betterReblogs.passTags",1);
      settings.MissingE_betterReblogs_retries = getStorage("extensions.MissingE.betterReblogs.retries",defaultRetries);
      settings.MissingE_betterReblogs_autoFillTags = getStorage("extensions.MissingE.betterReblogs.autoFillTags",1);
      settings.MissingE_betterReblogs_quickReblog = getStorage("extensions.MissingE.betterReblogs.quickReblog",1);
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "settings") {
      var settings = {};
      settings.greeting = "settings";
      settings.component = message.component;
      settings.subcomponent = message.subcomponent;
      settings.extensionURL = data.url("");
      switch(message.component) {
         case "dashboardFixes":
            settings.reblogQuoteFit = getStorage("extensions.MissingE.dashboardFixes.reblogQuoteFit",1);
            settings.wrapTags = getStorage("extensions.MissingE.dashboardFixes.wrapTags",1);
            settings.replaceIcons = getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1);
            settings.timeoutAJAX = getStorage("extensions.MissingE.dashboardFixes.timeoutAJAX",1);
            settings.timeoutLength = getStorage("extensions.MissingE.dashboardFixes.timeoutLength",defaultTimeout);
            settings.postLinks = getStorage("extensions.MissingE.dashboardFixes.postLinks",1);
            break;
         case "dashLinksToTabs":
            settings.newPostTabs = getStorage("extensions.MissingE.dashLinksToTabs.newPostTabs",1);
            settings.sidebar = getStorage("extensions.MissingE.dashLinksToTabs.sidebar",0);
            settings.reblogLinks = getStorage("extensions.MissingE.dashLinksToTabs.reblogLinks",0);
            settings.editLinks = getStorage("extensions.MissingE.dashLinksToTabs.editLinks",0);
            break;
         case "replyReplies":
            settings.showAvatars = getStorage("extensions.MissingE.replyReplies.showAvatars",1);
            settings.smallAvatars = getStorage("extensions.MissingE.replyReplies.smallAvatars",1);
            settings.addTags = getStorage("extensions.MissingE.replyReplies.addTags",1);
            settings.newTab = getStorage("extensions.MissingE.replyReplies.newTab",1);
            break;
         case "postCrushes_fill":
         case "postCrushes":
            settings.prefix = getStorage("extensions.MissingE.postCrushes.prefix","Tumblr Crushes:");
            settings.crushSize = getStorage("extensions.MissingE.postCrushes.crushSize",1);
            settings.addTags = getStorage("extensions.MissingE.postCrushes.addTags",1);
            settings.showPercent = getStorage("extensions.MissingE.postCrushes.showPercent",1);
            break;
         case "postingFixes":
            settings.photoReplies = getStorage("extensions.MissingE.postingFixes.photoReplies",1);
            settings.uploaderToggle = getStorage("extensions.MissingE.postingFixes.uploaderToggle",1);
            settings.addUploader = getStorage("extensions.MissingE.postingFixes.addUploader",1);
            settings.quickButtons = getStorage("extensions.MissingE.postingFixes.quickButtons",1);
            break;
         case "unfollower":
         case "followChecker":
            settings.retries = getStorage("extensions.MissingE." + message.component + ".retries",defaultRetries);
            break;
         case "betterReblogs":
            settings.passTags = getStorage("extensions.MissingE.betterReblogs.passTags",1);
            settings.autoFillTags = getStorage("extensions.MissingE.betterReblogs.autoFillTags",1);
            settings.quickReblog = getStorage("extensions.MissingE.betterReblogs.quickReblog",1);
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
          (/http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//
             .test(message.url))) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url))) {
         if (getStorage("extensions.MissingE.dashLinksToTabs.enabled",1) == 1) {
            activeScripts.dashLinksToTabs = true;
         }
         else
            activeScripts.dashLinksToTabs = false;

         if (getStorage("extensions.MissingE.safeDash.enabled",1) == 1) {
            activeScripts.safeDash = true;
         }
         else
            activeScripts.safeDash = false;

         if (getStorage("extensions.MissingE.bookmarker.enabled",1) == 1) {
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getStorage("extensions.MissingE.unfollower.enabled",1) == 1 ||
             getStorage("extensions.MissingE.followChecker.enabled",1) == 1) {
         }

         if (getStorage("extensions.MissingE.unfollower.enabled",1) == 1) {
            activeScripts.unfollower = true;
         }
         else
            activeScripts.unfollower = false;

         if (getStorage("extensions.MissingE.followChecker.enabled",1) == 1) {
            activeScripts.followChecker = true;
         }
         else
            activeScripts.followChecker = false;

         if (getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1) {
            activeScripts.dashboardFixes = true;
         }
         else
            activeScripts.dashboardFixes = false;
      }
      if (/http:\/\/www\.tumblr\.com\/ask_form\//.test(message.url)) {
         if (getStorage("extensions.MissingE.askFixes.enabled",1) == 1) {
            activeScripts.askFixes = true;
         }
         else
            activeScripts.askFixes = false;
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
         if (getStorage("extensions.MissingE.postingFixes.enabled",1) == 1) {
            activeScripts.postingFixes = true;
         }
         else
            activeScripts.postingFixes = false;

         if (getStorage("MissingE.betterReblogs.enabled",1) == 1) {
            activeScripts.betterReblogs = true;
            activeScripts.betterReblogs_fill = true;
         }
         else
            activeScripts.betterReblogs = false;
      }
      if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(message.url) &&
          !(/http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/new\//.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/new\//.test(message.url))) {
         if (getStorage("extensions.MissingE.gotoDashPost.enabled",1) == 1) {
            activeScripts.gotoDashPost = true;
         }
         else
            activeScripts.gotoDashPost = false;

         if (getStorage("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
             getStorage("extensions.MissingE.reblogYourself.postPage",1) == 1) {
            activeScripts.reblogYourself = true;
         }
         else
            activeScripts.reblogYourself = false;

         if (getStorage("extensions.MissingE.betterReblogs.enabled",1) == 1 &&
             getStorage("extensions.MissingE.betterReblogs.passTags",1) == 1) {
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
           /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url))) {
         if (getStorage("extensions.MissingE.replyReplies.enabled",1) == 1) {
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = false;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/new\/(text|photo)/.test(message.url)) {
         if (getStorage("extensions.MissingE.replyReplies.enabled",1) == 1) {
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = true;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/following/.test(message.url)) {
         if (getStorage("extensions.MissingE.postCrushes.enabled",1) == 1) {
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = false;
         }
         else
            activeScripts.postCrushes = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/new\/photo/.test(message.url)) {
         if (getStorage("extensions.MissingE.postCrushes.enabled",1) == 1) {
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
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages|drafts|queue)/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//.test(message.url))) {
         if (getStorage("extensions.MissingE.timestamps.enabled",1) == 1) {
            activeScripts.timestamps = true;
         }
         else
            activeScripts.timestamps = false;

         if (getStorage("extensions.MissingE.betterReblogs.enabled",1) == 1) {
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;

         if (getStorage("extensions.MissingE.magnifier.enabled",1) == 1) {
            activeScripts.magnifier = true;
         }
         else
            activeScripts.magnifier = false;

         if (getStorage("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
             getStorage("extensions.MissingE.reblogYourself.dashboard",1) == 1) {
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
                       data.url("askFixes/askFixes.js"),
                       data.url("betterReblogs/betterReblogs_dash.js"),
                       data.url("betterReblogs/betterReblogs_fill.js"),
                       data.url("betterReblogs/betterReblogs_post.js"),
                       data.url("bookmarker/bookmarker.js"),
                       data.url("dashboardFixes/dashboardFixes.js"),
                       data.url("dashLinksToTabs/dashLinksToTabs.js"),
                       data.url("gotoDashPost/gotoDashPost.js"),
                       data.url("postCrushes/postCrushes.js"),
                       data.url("postCrushes/postCrushes_fill.js"),
                       data.url("postingFixes/postingFixes.js"),
                       data.url("reblogYourself/reblogYourself_post.js"),
                       data.url("reblogYourself/reblogYourself_dash.js"),
                       data.url("replyReplies/replyReplies.js"),
                       data.url("replyReplies/replyReplies_fill.js"),
                       data.url("safeDash/safeDash.js"),
                       data.url("timestamps/timestamps.js"),
                       data.url("facebox/facebox.js"),
                       data.url("followChecker/followChecker.js"),
                       data.url("unfollower/unfollower.js"),
                       data.url("magnifier/magnifier.js"),
                       data.url("common/whoami.js")],
   onAttach: function onAttach(worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
      });
   }
});

console.log("Missing e is running.");
