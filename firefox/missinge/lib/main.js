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
var widget;

require("unload").when(function(reason){
   if (widget) {
      widget.destroy();
   }
});

var defaultTimeout = 15;
var minTimeout = 5;
var maxTimeout = 120;
var defaultRetries = 4;
var minRetries = 0;
var maxRetries = 20;
var maxActiveAjax = 15;
var defaultFormat = "%Y-%m-%D %H:%i";
var activeAjax = 0;
var waitQueue = [];
var cache = {};
var cacheElements = 0;
var cacheClear;
var clearQueues;
var fiveMinutes = 300000;
var tenSeconds = 10000;
var followCheckerTab = null;
var formKey;
var followYou = [];
var youFollow = [];

function clearFollowChecker() {
   followYou = [];
   youFollow = [];
   formKey = null;
   followCheckerTab = null;
}

cacheClear = timer.setInterval(function() {
   var followCheckerClosed = true;
   cache = {};
   cacheElements = 0;
   try {
      if (followCheckerTab &&
          followCheckerTab.url) {
         followCheckerClosed = false;
      }
      else {
         followCheckerClosed = true;
      }
   }
   catch(e) {
      followCheckerClosed = true;
   }
   if (followCheckerClosed) {
      clearFollowChecker();
   }
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

function setIntegerPrefType(pref,defVal) {
   if (ps.isSet(pref) &&
       typeof ps.get(pref,defVal) === "string") {
      var val = ps.get(pref, defVal);
      if (val === "0") { val = 0; }
      else if (val === "1") { val = 1; }
      ps.reset(pref);
      ps.set(pref, val);
   }
}

function getStorage(key, defVal) {
   return ps.get(key, defVal);
}

function setStorage(key, val) {
   ps.set(key, val);
}

function closeTab(url) {
   for each (var tab in tabs) {
      if (tab.url === url) {
         tab.close();
      }
   }
}

function openSettings() {
   closeTab(data.url("options.html"));

   tabs.open({
      url: data.url("options.html"),
      onReady: function(tab) {
         tab.attach({
            contentScriptFile: [data.url("common/jquery.min.js"),
                                data.url("common/defs.js"),
                                data.url("common/utils.js"),
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
   widget = widgets.Widget({
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
   if (!tags) {
      tags = [];
   }
   theWorker.postMessage({greeting: "tags", success: true, data: tags, extensionURL: data.url("")});
}

function doTimestamp(stamp, id, theWorker) {
   var ts = stamp["unix-timestamp"];
   var d = new Date(ts*1000);
   var ins = getStorage("extensions.MissingE.timestamps.format",defaultFormat);
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

function doAskAjax(url, pid, count, myWorker, retries, type, doFunc) {
   var failMsg = {greeting:type, success:false};
   Request({
      url: url + pid,
      headers: {tryCount: count,
                retryLimit: retries,
                targetId: pid},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            console.debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 ||
             !(/<input[^>]*name="post\[date\]"[^>]*>/.test(response.text))) {
            if (closed) {
               console.debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doFunc, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  doAskAjax('http://www.tumblr.com/edit/',
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, type, doFunc);
               }
               else {
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var failed = false;
            var txt;
            var inp = response.text
                        .match(/<input[^>]*name="post\[date\]"[^>]*>/);
            if (!inp) { failed = true; }
            else {
               txt = inp[0].match(/value="([^"]*)"/);
               if (!txt || txt.length < 2) {
                  failed = true;
               }
               else {
                  txt = txt[1];
               }
            }
            if (failed) {
               console.debug(type + " request (" + this.headers.targetId +
                             ") failed");
               dequeueAjax(this.headers.targetId);
               myWorker.postMessage(failMsg);
               return;
            }
            var m = txt.match(/([A-Za-z]+) ([0-9]+)[^,]*, ([0-9]+) ([0-9]+):([0-9]+)([aApP][mM])/);
            var d = new Date(m[1] + ' ' + m[2] + ', ' + m[3] + ' ' +
                             (m[6]=='pm' && m[4] !== '12' ? parseInt(m[4])+12 : m[4]) +
                             ':' + m[5] + ':00 GMT');
            var stamp = Math.round(d.getTime()/1000);
            var info = {"unix-timestamp":stamp};
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doFunc(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function doAjax(url, pid, count, myWorker, retries, type, doFunc, additional) {
   var failMsg = {greeting:type, success:false};
   if (additional) {
      for (i in additional) {
         if (additional.hasOwnProperty(i)) {
            failMsg[i] = additional[i];
         }
      }
   }
   Request({
      url: url + "/api/read/json?id=" + pid,
      headers: {tryCount: count,
                retryLimit: retries,
                targetId: pid},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            console.debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text))) {
            if (closed) {
               console.debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doFunc, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  doAjax(this.url.replace(/\/api\/read\/json\?id=[0-9]*$/,''),
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, type, doFunc,
                         additional);
               }
               else {
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
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
               doFunc(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
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
      doAjax(message.url, message.pid, 0, myWorker,
             getStorage("extensions.MissingE.betterReblogs.retries",defaultRetries),
             "tags", doTags, {extensionURL:data.url("")});
   }
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
      doAjax(message.url, message.pid, 0, myWorker,
             getStorage("extensions.MissingE.magnifier.retries",defaultRetries),
             "magnifier", doMagnifier, {pid: message.pid});
   }
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
   else if (message.url === 'http://www.tumblr.com/edit/') {
      startAjax(message.pid);
      doAskAjax(message.url, message.pid, 0, myWorker,
                getStorage("extensions.MissingE.timestamps.retries",defaultRetries),
                "timestamp", doTimestamp);
   }
   else {
      startAjax(message.pid);
      doAjax(message.url, message.pid, 0, myWorker,
             getStorage("extensions.MissingE.timestamps.retries",defaultRetries),
             "timestamp", doTimestamp, {pid: message.pid});
   }
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
      doAjax(message.url, message.pid, 0, myWorker,
             getStorage("extensions.MissingE.reblogYourself.retries",defaultRetries),
             "reblogYourself", doReblogDash,
             {
               pid:message.pid,
               icons:getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 && 
                     getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1
             });
   }
}

function inArray(entry, arr) {
   var i;
   for (i=0; i<arr.length; i++) {
      if (arr[i] === entry) {
         return i;
      }
   }
   return -1;
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
   else if (message.greeting == "unfollowerIgnore") {
      setStorage('extensions.MissingE.unfollower.ignore', message.list);
   }
   else if (message.greeting == "close-followChecker") {
      closeTab(data.url("followChecker/followChecker.html"));
   }
   else if (message.greeting == "followChecker") {
      closeTab(data.url("followChecker/followChecker.html"));
      followYou = message.followYou;
      youFollow = message.youFollow;
      formKey = message.formKey;
      tabs.open({
         url: data.url("followChecker/followChecker.html"),
         onReady: function(tab) {
            followCheckerTab = tab;
            tab.attach({
               contentScriptFile:[data.url("common/jquery.min.js"),
                                  data.url("followChecker/followCheckerTab.js")
                                 ],
               onMessage: function(data) {
                  handleMessage(data, this);
               }
            });
         }
      });
   }
   else if (message.greeting == "followChecker_fill") {
      if (myWorker.tab == followCheckerTab &&
          formKey) {
         myWorker.postMessage({greeting: "followChecker_fill",
                              success:true, formKey:formKey,
                              followYou:followYou, youFollow:youFollow});
      }
      else {
         myWorker.postMessage({greeting: "followChecker_fill",
                              success:false});
      }
   }
   else if (message.greeting == "unfollow") {
      var idx = inArray(message.tumblrId + ';' + message.tumblrURL + ';' +
                        message.tumblrImg, youFollow);
      if (idx != -1) {
         youFollow.splice(idx,1);
      }
   }
   else if (message.greeting == "follow") {
      var idx = inArray(message.tumblrId + ';' + message.tumblrURL + ';' +
                        message.tumblrImg, followYou);
      if (idx != -1) {
         followYou.splice(idx,1);
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
      settings.MissingE_experimentalFeatures_enabled = getStorage("extensions.MissingE.experimentalFeatures.enabled",0);
      for (i=0; i<componentList.length; i++) {
         settings["MissingE_" + componentList[i] + "_enabled"] =
            getStorage("extensions.MissingE." + componentList[i] + ".enabled", 1);
      }
      settings.MissingE_askFixes_scroll = getStorage("extensions.MissingE.askFixes.scroll",1);
      settings.MissingE_askFixes_buttons = getStorage("extensions.MissingE.askFixes.buttons",0);
      settings.MissingE_askFixes_tags = getStorage("extensions.MissingE.askFixes.tags",0);
      settings.MissingE_askFixes_tagAsker = getStorage("extensions.MissingE.askFixes.tagAsker",1);
      settings.MissingE_askFixes_defaultTags = getStorage("extensions.MissingE.askFixes.defaultTags",'');
      settings.MissingE_bookmarker_format = getStorage("extensions.MissingE.bookmarker.format",defaultFormat);
      settings.MissingE_dashboardFixes_reblogQuoteFit = getStorage("extensions.MissingE.dashboardFixes.reblogQuoteFit",1);
      settings.MissingE_dashboardFixes_wrapTags = getStorage("extensions.MissingE.dashboardFixes.wrapTags",1);
      settings.MissingE_dashboardFixes_replaceIcons = getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1);
      settings.MissingE_dashboardFixes_timeoutAJAX = getStorage("extensions.MissingE.dashboardFixes.timeoutAJAX",1);
      settings.MissingE_dashboardFixes_timeoutLength = getStorage("extensions.MissingE.dashboardFixes.timeoutLength",defaultTimeout);
      settings.MissingE_dashboardFixes_postLinks = getStorage("extensions.MissingE.dashboardFixes.postLinks",1);
      settings.MissingE_dashboardFixes_reblogReplies = getStorage("extensions.MissingE.dashboardFixes.reblogReplies",0);
      settings.MissingE_dashboardFixes_widescreen = getStorage("extensions.MissingE.dashboardFixes.widescreen",0);
      settings.MissingE_dashboardFixes_queueArrows = getStorage("extensions.MissingE.dashboardFixes.queueArrows",1);
      settings.MissingE_dashboardFixes_followingLink = getStorage("extensions.MissingE.dashboardFixes.followingLink",0);
      settings.MissingE_magnifier_retries = getStorage("extensions.MissingE.magnifier.retries",defaultRetries);
      settings.MissingE_dashLinksToTabs_newPostTabs = getStorage("extensions.MissingE.dashLinksToTabs.newPostTabs",1);
      settings.MissingE_dashLinksToTabs_sidebar = getStorage("extensions.MissingE.dashLinksToTabs.sidebar",0);
      settings.MissingE_dashLinksToTabs_reblogLinks = getStorage("extensions.MissingE.dashLinksToTabs.reblogLinks",0);
      settings.MissingE_dashLinksToTabs_editLinks = getStorage("extensions.MissingE.dashLinksToTabs.editLinks",0);
      settings.MissingE_timestamps_retries = getStorage("extensions.MissingE.timestamps.retries",defaultRetries);
      settings.MissingE_timestamps_format = getStorage("extensions.MissingE.timestamps.format",defaultFormat);
      settings.MissingE_postingFixes_photoReplies = getStorage("extensions.MissingE.postingFixes.photoReplies",1);
      settings.MissingE_postingFixes_uploaderToggle = getStorage("extensions.MissingE.postingFixes.uploaderToggle",1);
      settings.MissingE_postingFixes_addUploader = getStorage("extensions.MissingE.postingFixes.addUploader",1);
      settings.MissingE_postingFixes_quickButtons = getStorage("extensions.MissingE.postingFixes.quickButtons",1);
      settings.MissingE_postingFixes_blogSelect = getStorage("extensions.MissingE.postingFixes.blogSelect",0);
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
      settings.MissingE_unfollower_ignore = getStorage("extensions.MissingE.unfollower.ignore",'');
      settings.MissingE_betterReblogs_passTags = getStorage("extensions.MissingE.betterReblogs.passTags",1);
      settings.MissingE_betterReblogs_retries = getStorage("extensions.MissingE.betterReblogs.retries",defaultRetries);
      settings.MissingE_betterReblogs_autoFillTags = getStorage("extensions.MissingE.betterReblogs.autoFillTags",1);
      settings.MissingE_betterReblogs_quickReblog = getStorage("extensions.MissingE.betterReblogs.quickReblog",0);
      settings.MissingE_betterReblogs_quickReblogAcctType = getStorage("extensions.MissingE.betterReblogs.quickReblogAcctType",0);
      settings.MissingE_betterReblogs_quickReblogAcctName = getStorage("extensions.MissingE.betterReblogs.quickReblogAcctName",'');
      settings.MissingE_version = getStorage("extensions.MissingE.version",'');
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "settings") {
      var settings = {};
      settings.greeting = "settings";
      settings.component = message.component;
      settings.subcomponent = message.subcomponent;
      settings.experimental = getStorage("extensions.MissingE.experimentalFeatures.enabled",0);
      settings.extensionURL = data.url("");
      switch(message.component) {
         case "askFixes":
            settings.scroll = getStorage("extensions.MissingE.askFixes.scroll",1);
            settings.buttons = getStorage("extensions.MissingE.askFixes.buttons",0);
            settings.tags = getStorage("extensions.MissingE.askFixes.tags",0);
            settings.tagAsker = getStorage("extensions.MissingE.askFixes.tagAsker",1);
            settings.defaultTags = getStorage("extensions.MissingE.askFixes.defaultTags",'');
            if (settings.defaultTags !== '') {
               settings.defaultTags = settings.defaultTags.replace(/, /g,',').split(',');
            }
            break;
         case "bookmarker":
            settings.format = getStorage("extensions.MissingE.bookmarker.format",defaultFormat);
            break;
         case "dashboardFixes":
            settings.reblogQuoteFit = getStorage("extensions.MissingE.dashboardFixes.reblogQuoteFit",1);
            settings.wrapTags = getStorage("extensions.MissingE.dashboardFixes.wrapTags",1);
            settings.replaceIcons = getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1);
            settings.timeoutAJAX = getStorage("extensions.MissingE.dashboardFixes.timeoutAJAX",1);
            settings.timeoutLength = getStorage("extensions.MissingE.dashboardFixes.timeoutLength",defaultTimeout);
            settings.postLinks = getStorage("extensions.MissingE.dashboardFixes.postLinks",1);
            settings.reblogReplies = getStorage("extensions.MissingE.dashboardFixes.reblogReplies",0);
            settings.widescreen = getStorage("extensions.MissingE.dashboardFixes.widescreen",0);
            settings.queueArrows = getStorage("extensions.MissingE.dashboardFixes.queueArrows",1);
            settings.followingLink = getStorage("extensions.MissingE.dashboardFixes.followingLink",0);
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
            settings.blogSelect = getStorage("extensions.MissingE.postingFixes.blogSelect",0);
            break;
         case "unfollower":
            settings.ignore = getStorage("extensions.MissingE.unfollower.ignore",'');
         case "followChecker":
            settings.retries = getStorage("extensions.MissingE." + message.component + ".retries",defaultRetries);
            break;
         case "betterReblogs":
            settings.passTags = getStorage("extensions.MissingE.betterReblogs.passTags",1);
            settings.autoFillTags = getStorage("extensions.MissingE.betterReblogs.autoFillTags",1);
            settings.quickReblog = getStorage("extensions.MissingE.betterReblogs.quickReblog",0);
            settings.accountName = '0';
            if (getStorage("extensions.MissingE.betterReblogs.quickReblogAcctType",0) == 1) {
               settings.accountName = getStorage("extensions.MissingE.betterReblogs.quickReblogAcctName",'0');
            }
            settings.replaceIcons = (getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 &&
                                       getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1) ? 1 : 0;
            break;
      }
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "start") {
      var activeScripts = {};
      var zindexFix = false;
      var injectScripts = [data.url("common/storage.js"),
                           data.url("common/utils.js"),
                           data.url("common/localizations.js")];
      activeScripts.extensionURL = data.url("");
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/followers/
               .test(message.url)) {
         if (getStorage("extensions.MissingE.safeDash.enabled",1) == 1) {
            injectScripts.push(data.url("safeDash/safeDash.js"));
            activeScripts.safeDash = true;
         }
         else
            activeScripts.safeDash = false;

         if (getStorage("extensions.MissingE.bookmarker.enabled",1) == 1) {
            injectScripts.push(data.url("common/jquery-ui.min.js"));
            injectScripts.push(data.url("bookmarker/bookmarker.js"));
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getStorage("extensions.MissingE.unfollower.enabled",1) == 1) {
            injectScripts.push(data.url("unfollower/unfollower.js"));
            activeScripts.unfollower = true;
         }
         else
            activeScripts.unfollower = false;

         if (getStorage("extensions.MissingE.followChecker.enabled",1) == 1) {
            injectScripts.push(data.url("followChecker/followChecker.js"));
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
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/queue/.test(message.url) ||
          (/http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//
             .test(message.url)) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/followers/
             .test(message.url))) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url))) {
         if (getStorage("extensions.MissingE.dashLinksToTabs.enabled",1) == 1) {
            injectScripts.push(data.url("dashLinksToTabs/dashLinksToTabs.js"));
            activeScripts.dashLinksToTabs = true;
         }
         else
            activeScripts.dashLinksToTabs = false;

         if (getStorage("extensions.MissingE.safeDash.enabled",1) == 1) {
            injectScripts.push(data.url("safeDash/safeDash.js"));
            activeScripts.safeDash = true;
         }
         else
            activeScripts.safeDash = false;

         if (getStorage("extensions.MissingE.bookmarker.enabled",1) == 1) {
            injectScripts.push(data.url("common/jquery-ui.min.js"));
            injectScripts.push(data.url("bookmarker/bookmarker.js"));
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getStorage("extensions.MissingE.unfollower.enabled",1) == 1) {
            injectScripts.push(data.url("unfollower/unfollower.js"));
            activeScripts.unfollower = true;
         }
         else
            activeScripts.unfollower = false;

         if (getStorage("extensions.MissingE.followChecker.enabled",1) == 1) {
            injectScripts.push(data.url("followChecker/followChecker.js"));
            activeScripts.followChecker = true;
         }
         else
            activeScripts.followChecker = false;

         if (getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1) {
            injectScripts.push(data.url("dashboardFixes/dashboardFixes.js"));
            activeScripts.dashboardFixes = true;
         }
         else
            activeScripts.dashboardFixes = false;
      }
      if (/http:\/\/www\.tumblr\.com\/ask_form\//.test(message.url)) {
         if (getStorage("extensions.MissingE.askFixes.enabled",1) == 1 &&
             getStorage("extensions.MissingE.askFixes.scroll",1) == 1) {
            /* Don't inject script. Taken care of by a page mod */
            activeScripts.askFixes = true;
         }
         else
            activeScripts.askFixes = false;
      }
      if (!message.isFrame &&
          ((/http:\/\/www\.tumblr\.com\/new\//.test(message.url) ||
            /http:\/\/www\.tumblr\.com\/tumblelog\/[0-9A-Za-z\-\_]+\/new\//.test(message.url) ||
            /http:\/\/www\.tumblr\.com\/reblog\//.test(message.url) ||
            /http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(message.url)) ||
         (/http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/.test(message.url)) ||
         (/http:\/\/www\.tumblr\.com\/share/.test(message.url)))) {
         if (getStorage("extensions.MissingE.postingFixes.enabled",1) == 1) {
            injectScripts.push(data.url("postingFixes/postingFixes.js"));
            activeScripts.postingFixes = true;
         }
         else
            activeScripts.postingFixes = false;

         if (getStorage("MissingE.betterReblogs.enabled",1) == 1) {
            injectScripts.push(data.url("betterReblogs/betterReblogs_fill.js"));
            activeScripts.betterReblogs = true;
            activeScripts.betterReblogs_fill = true;
         }
         else
            activeScripts.betterReblogs = false;
      }
      if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(message.url) &&
          !(/http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(myWorker.tab.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/new\//.test(myWorker.tab.url)) &&
          !(/http:\/\/www\.tumblr\.com\/new\//.test(myWorker.tab.url))) {
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
            injectScripts.push(data.url("replyReplies/replyReplies.js"));
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = false;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/new\/(text|photo)/.test(message.url)) {
         if (getStorage("extensions.MissingE.replyReplies.enabled",1) == 1) {
            injectScripts.push(data.url("replyReplies/replyReplies_fill.js"));
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = true;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/following/.test(message.url)) {
         if (getStorage("extensions.MissingE.postCrushes.enabled",1) == 1) {
            injectScripts.push(data.url("postCrushes/postCrushes.js"));
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = false;
         }
         else
            activeScripts.postCrushes = false;
      }
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/new\/photo/.test(message.url)) {
         if (getStorage("extensions.MissingE.postCrushes.enabled",1) == 1) {
            injectScripts.push(data.url("postCrushes/postCrushes_fill.js"));
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = true;
         }
         else
            activeScripts.postCrushes = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/(submissions|messages)/
               .test(message.url) ||
           /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages)/
               .test(message.url))) {
         if (getStorage("extensions.MissingE.askFixes.enabled",1) == 1) {
            injectScripts.push(data.url("askFixes/askFixes.js"));
            activeScripts.askFixes = true;
         }
         else {
            activeScripts.askFixes = false;
         }
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/(submissions|messages)/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages)/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(drafts|queue)/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//.test(message.url))) {
         if (getStorage("extensions.MissingE.timestamps.enabled",1) == 1) {
            injectScripts.push(data.url("timestamps/timestamps.js"));
            activeScripts.timestamps = true;
         }
         else
            activeScripts.timestamps = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages|drafts|queue)/.test(message.url)) &&
          !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//.test(message.url))) {
         if (getStorage("extensions.MissingE.betterReblogs.enabled",1) == 1) {
            if (getStorage("extensions.MissingE.betterReblogs.quickReblog",0) == 1) {
               zindexFix = true;
            }
            injectScripts.push(data.url("betterReblogs/betterReblogs_dash.js"));
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;

         if (getStorage("extensions.MissingE.magnifier.enabled",1) == 1) {
            injectScripts.push(data.url("magnifier/magnifier.js"));
            activeScripts.magnifier = true;
         }
         else
            activeScripts.magnifier = false;

         if (getStorage("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
             getStorage("extensions.MissingE.reblogYourself.dashboard",1) == 1) {
            injectScripts.push(data.url("reblogYourself/reblogYourself_dash.js"));
            activeScripts.reblogYourself = true;
         }
         else
            activeScripts.reblogYourself = false;
      }

      if (message.isFrame &&
          (activeScripts.gotoDashPost || activeScripts.reblogYourself)) {
         injectScripts.push(data.url("common/widenIframe.js"));
      }

      if (activeScripts.unfollower ||
          activeScripts.followChecker ||
          activeScripts.magnifier) {
         zindexFix = true;
         injectScripts.unshift(data.url("common/faceboxHelper.js"));
         injectScripts.unshift(data.url("facebox/facebox.js"));
      }

      injectScripts.unshift(data.url("common/jquery.min.js"));
      if (zindexFix) {
         injectScripts.push(data.url("common/zindexFix.js"));
      }
      activeScripts.url = message.url;
      activeScripts.isFrame = message.isFrame;
      activeScripts.greeting = "startup";
      myWorker.tab.attach({
         contentScriptFile: injectScripts,
         onMessage: function onMessage(data) {
            handleMessage(data, this);
         }
      });
      myWorker.postMessage(activeScripts);
   }

}

pageMod.PageMod({
   include: ["http://www.tumblr.com/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("common/addmenu.js"),
                       data.url("common/whoami.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
      });
   }
});

pageMod.PageMod({
   include: ["http://www.tumblr.com/ask_form/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: data.url("askFixes/askFixes.js"),
   onAttach: function (worker) {
      worker.on('message', function(data) {
         if (getStorage("extensions.MissingE.askFixes.enabled",1) == 1 &&
             getStorage("extensions.MissingE.askFixes.scroll",1) == 1) {
            handleMessage(data, this);
         }
      });
   }
});

pageMod.PageMod({
   include: ["http://www.tumblr.com/dashboard/iframe*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("common/localizations.js"),
                       data.url("betterReblogs/betterReblogs_post.js"),
                       data.url("gotoDashPost/gotoDashPost.js"),
                       data.url("reblogYourself/reblogYourself_post.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         var answer = data.greeting !== 'settings';
         if (data.greeting === 'settings') {
            answer = !(/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(this.tab.url)) &&
               !(/http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(this.tab.url)) &&
               !(/http:\/\/www\.tumblr\.com\/new\//.test(this.tab.url)) &&
               ((data.component === 'betterReblogs' &&
                 data.subcomponent === 'post' &&
                 getStorage("extensions.MissingE.betterReblogs.enabled",1) == 1 &&
                 getStorage("extensions.MissingE.betterReblogs.passTags",1) == 1) ||
                (data.component === 'gotoDashPost' &&
                 getStorage("extensions.MissingE.gotoDashPost.enabled",1) == 1) ||
                (data.component === 'reblogYourself' &&
                 data.subcomponent === 'post' &&
                 getStorage("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
                 getStorage("extensions.MissingE.reblogYourself.postPage",1) == 1));
         }
         if (answer) {
            handleMessage(data, this);
         }
      });
   }
});

function getVersion() {
   return data.load("version");
}

function onStart(currVersion, prevVersion) {
   if (prevVersion && prevVersion !== currVersion) {
      console.log("Updated Missing e (" +
                  prevVersion + " => " + currVersion + 
                  ")");
   }
   else if (!prevVersion) {
      console.log("Installed Missing e " + currVersion);
   }
   setStorage('extensions.MissingE.version',currVersion);
}

var currVersion = getVersion();
var prevVersion = getStorage('extensions.MissingE.version',null);
onStart(currVersion, prevVersion);

setIntegerPrefType('extensions.MissingE.betterReblogs.quickReblogAcctType',0);
setIntegerPrefType('extensions.MissingE.postCrushes.crushSize',1);
setIntegerPrefType('extensions.MissingE.replyReplies.smallAvatars',1);

console.log("Missing e is running.");
