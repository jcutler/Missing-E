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
var ss = require("simple-storage");
var url = require("url");
var data = require("self").data;
var Request = require("request").Request;
var timer = require("timer");

var defaultRetries = 10;
var maxRetries = 99;
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
                     "gotoDashPost",
                     "postingFixes",
                     "reblogYourself",
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
                                data.url("options.js")],
            onMessage: function(data) {
               handleMessage(data, this);
            }
         });
      }
   });
}

var widget = widgets.Widget({
   label: "Missing e",
   contentURL: data.url("missinge32.png"),
   onClick: function() {
      openSettings();
   }
});

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

function setStorage(key, val) {
   ss.storage[key] = val;
}

function doTimestamp(stamp, id, theWorker) {
   var ts = stamp["unix-timestamp"];
   var d = new Date(ts*1000);
   var ins = getStorage("MissingE_timestamps_format","%Y-%m-%D %H:%i");
   ins = getFormattedDate(d, ins);
   theWorker.postMessage({greeting: "timestamp", pid: id, success: true, data: ins});
}

function doReblogDash(stamp, id, theWorker) {
   var key = stamp["reblog-key"];
   var replaceIcons = getStorage("MissingE_dashboardFixes_enabled",1) == 1 &&
                      getStorage("MissingE_dashboardFixes_replaceIcons",1) == 1;
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
          i !== "url") {
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

function startMagnifier(message, myWorker) {
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
                retryLimit: getStorage("MissingE_magnifier_retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
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
            doMagnifier(info, this.headers.targetId, myWorker);
         }
      }
   }).get();
}

function startTimestamp(message, myWorker) {
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
                retryLimit: getStorage("MissingE_timestamps_retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
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
            doTimestamp(info, this.headers.targetId, myWorker);
         }
      }
   }).get();
}

function startReblogYourself(message, myWorker) {
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
                retryLimit: getStorage("MissingE_reblogYourself_retries",defaultRetries),
                targetId: pid},
      onComplete: function(response) {
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
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
            doReblogDash(info, this.headers.targetId, myWorker);
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
   else if (message.greeting == "change-setting") {
      setStorage(message.name, message.val);
   }
   else if (message.greeting == "all-settings") {
      var settings = {};
      settings.greeting = "all-settings";
      for (i=0; i<componentList.length; i++) {
         settings["MissingE_" + componentList[i] + "_enabled"] = getStorage("MissingE_" + componentList[i] +
                                                                            "_enabled", 1);
      }
      settings.MissingE_dashboardFixes_reblogQuoteFit = getStorage("MissingE_dashboardFixes_reblogQuoteFit",1);
      settings.MissingE_dashboardFixes_wrapTags = getStorage("MissingE_dashboardFixes_wrapTags",1);
      settings.MissingE_dashboardFixes_replaceIcons = getStorage("MissingE_dashboardFixes_replaceIcons",1);
      settings.MissingE_magnifier_retries = getStorage("MissingE_magnifier_retries",defaultRetries);
      settings.MissingE_dashLinksToTabs_newPostTabs = getStorage("MissingE_dashLinksToTabs_newPostTabs",1);
      settings.MissingE_dashLinksToTabs_sidebar = getStorage("MissingE_dashLinksToTabs_sidebar",0);
      settings.MissingE_dashLinksToTabs_reblogLinks = getStorage("MissingE_dashLinksToTabs_reblogLinks",0);
      settings.MissingE_dashLinksToTabs_editLinks = getStorage("MissingE_dashLinksToTabs_editLinks",0);
      settings.MissingE_timestamps_retries = getStorage("MissingE_timestamps_retries",defaultRetries);
      settings.MissingE_timestamps_format = getStorage("MissingE_timestamps_format","%Y-%m-%D %H:%i");
      settings.MissingE_postingFixes_photoReplies = getStorage("MissingE_postingFixes_photoReplies",1);
      settings.MissingE_postingFixes_uploaderToggle = getStorage("MissingE_postingFixes_uploaderToggle",1);
      settings.MissingE_postingFixes_addUploader = getStorage("MissingE_postingFixes_addUploader",1);
      settings.MissingE_reblogYourself_postPage = getStorage("MissingE_reblogYourself_postPage",1);
      settings.MissingE_reblogYourself_dashboard = getStorage("MissingE_reblogYourself_dashboard",1);
      settings.MissingE_reblogYourself_retries = getStorage("MissingE_reblogYourself_retries",defaultRetries);
      settings.MissingE_followChecker_retries = getStorage("MissingE_followChecker_retries",defaultRetries);
      settings.MissingE_postCrushes_prefix = getStorage("MissingE_postCrushes_prefix","Tumblr Crushes:");
      settings.MissingE_postCrushes_crushSize = getStorage("MissingE_postCrushes_crushSize",1);
      settings.MissingE_postCrushes_addTags = getStorage("MissingE_postCrushes_addTags",1);
      settings.MissingE_postCrushes_showPercent = getStorage("MissingE_postCrushes_showPercent",1);
      settings.MissingE_replyReplies_showAvatars = getStorage("MissingE_replyReplies_showAvatars",1);
      settings.MissingE_replyReplies_smallAvatars = getStorage("MissingE_replyReplies_smallAvatars",1);
      settings.MissingE_replyReplies_addTags = getStorage("MissingE_replyReplies_addTags",1);
      settings.MissingE_unfollower_retries = getStorage("MissingE_unfollower_retries",defaultRetries);
      myWorker.postMessage(settings);
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
            settings.reblogLinks = getStorage("MissingE_dashLinksToTabs_reblogLinks",0);
            settings.editLinks = getStorage("MissingE_dashLinksToTabs_editLinks",0);
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
          (/http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//
             .test(message.url))) ||
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
          (/http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//
             .test(message.url))) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url))) {
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
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages|drafts|queue)/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//.test(message.url))) {
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
