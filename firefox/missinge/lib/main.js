/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 2 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

var defaultTimeout = 15;
var minTimeout = 5;
var maxTimeout = 120;
var defaultRetries = 4;
var minRetries = 0;
var maxRetries = 20;
var maxActiveAjax = 15;
var defaultFormat = "%Y-%m-%D %H:%i";
var defaultMaxBig = 30;
var minFontSize = 14;
var maxFontSize = 128;

var activeAjax = 0;
var activeRequests = {};
var waitQueue = [];
var onHold = {};
var numSleeping = 0;
var cache = {};
var cacheElements = 0;
var cacheClear;
var clearQueues;
var fiveMinutes = 300000;
var tenSeconds = 10000;
var locale=JSON.parse(data.load("common/localizations.js")
                      .replace(/^[^{]*/,'')
                      .replace(/;\s*$/,''));
var lang = 'en';
var debugMode = false;

function getVersion() {
   return data.load("version").replace(/\s/g,'');
}

function getStorage(key, defVal) {
   return ps.get(key, defVal);
}

function setStorage(key, val) {
   ps.set(key, val);
}

var currVersion = getVersion();
var prevVersion = getStorage('extensions.MissingE.version',null);

function escapeHTML(str) {
   return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
            .replace(/>/,'&gt;').replace(/</,'&lt;');
}

cacheClear = timer.setInterval(function() {
   cache = {};
   cacheElements = 0;
}, fiveMinutes);
clearQueues = timer.setInterval(function() {
   if (activeAjax == 0) {
      if (numSleeping !== 0) {
         debug(numSleeping + " still sleeping");
      }
      if (waitQueue.length > 0) {
         debug(waitQueue.length + " still queued");
      }
   }
}, tenSeconds);

function debug(msg) {
   if (debugMode) {
      console.debug(msg);
   }
}

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
                     "postCrushes",
                     "replyReplies",
                     "massEditor",
                     "sidebarTweaks"];

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

function collapseSettings(toPref, oldA, oldB) {
   if ((ps.isSet(oldA) || ps.isSet(oldB)) &&
       !ps.isSet(toPref)) {
      console.log('"' + oldA + '" and "' + oldB + '" depracated. Moving settings to "' + toPref + '"');
      if (ps.get(oldA,0) === 1 || ps.get(oldB,0) === 1) {
         ps.set(toPref,1);
      }
      ps.reset(oldA);
      ps.reset(oldB);
   }
   else if (ps.isSet(oldA) || ps.isSet(oldB)) {
      ps.reset(oldA);
      ps.reset(oldB);
   }
}

function moveSetting(oldpref,newpref) {
   if (ps.isSet(oldpref) && !ps.isSet(newpref)) {
      console.log('"' + oldpref + '" depracated. Moving setting to "' + newpref + '"');
      ps.set(newpref,ps.get(oldpref,0));
      ps.reset(oldpref);
   }
   else if (ps.isSet(oldpref)) {
      ps.reset(oldpref);
   }
}

function invertSetting(oldpref,newpref) {
   if (ps.isSet(oldpref) && !ps.isSet(newpref)) {
      console.log('"' + oldpref + '" changed to inverted setting "' + newpref + '"');
      ps.set(newpref,1-ps.get(oldpref,0));
      ps.reset(oldpref);
   }
   else if (ps.isSet(oldpref)) {
      ps.reset(oldpref);
   }
}

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
            contentScriptFile: [data.url("common/jquery-1.5.2.min.js"),
                                data.url("common/defs.js"),
                                data.url("common/localizations.js"),
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

function getFormattedDate(d, format, lang) {
   var ret = format;
   if (!lang || !locale[lang]) { lang = 'en'; }
   ret = ret.replace(/%Y/g,d.getFullYear())
            .replace(/%y/g,(d.getFullYear()%100))
            .replace(/%M/g,locale[lang]["monthsShort"][d.getMonth()])
            .replace(/%B/g,locale[lang]["monthsLong"][d.getMonth()])
            .replace(/%w/g,locale[lang]["daysShort"][d.getDay()])
            .replace(/%W/g,locale[lang]["daysLong"][d.getDay()])
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
   if (!stamp.tags) {
      debug("Cache entry does not have tags");
      return false;
   }
   var tags = stamp.tags;
   if (!tags) {
      tags = [];
   }
   theWorker.postMessage({greeting: "tags", success: true, data: tags,
                          extensionURL: data.url("")});
}

function doTimestamp(stamp, id, theWorker) {
   if (!stamp.timestamp) {
      debug("Cache entry does not have timestamp");
      return false;
   }
   var ts = stamp.timestamp;
   var d = new Date(ts*1000);
   if (isNaN(d)) {
      theWorker.postMessage({greeting: "timestamp", pid: id, success: false});
   }
   var ins = getStorage("extensions.MissingE.timestamps.format",defaultFormat);
   ins = getFormattedDate(d, ins, lang);
   theWorker.postMessage({greeting: "timestamp", pid: id, success: true, data: ins});
   return true;
}

function doReblogDash(stamp, id, theWorker) {
   if (!stamp.reblog_key) {
      debug("Cache entry does not have reblog key.");
      return false;
   }
   var key = stamp.reblog_key;
   var replaceIcons = getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 &&
                      getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1;
   theWorker.postMessage({greeting: "reblogYourself", pid: id, success: true, data: key, icons: replaceIcons});
   return true;
}

function queueAjax(details) {
   waitQueue.push(details);
   debug("Queueing " + details.type + " request. " + (waitQueue.length) + " in queue");
}

function dequeueAjax(id) {
   if (id) {
      activeAjax--;
      wakeById(id);
      delete activeRequests[id];
   }
   while (activeAjax < maxActiveAjax) {
      var call = waitQueue.shift();
      if (!call) { return false; }
      debug("Dequeueing " + call.type + " request. " + (waitQueue.length) + " in queue");
      runItem(call);
   }
}

function saveCache(id, entry) {
   var theEntry;
   var isNew = true;
   if ((theEntry = cache[id])) {
      debug("Saving " + id + " to cache (HIT)");
      isNew = false;
   }
   else {
      debug("Saving " + id + " to cache (MISS)");
      cacheElements++;
      theEntry = {};
   }
   for (var i in entry) {
      if (entry.hasOwnProperty(i)) {
         if (i == "photos" ||
             i == "timestamp" ||
             i == "reblog_key" ||
             i == "post_url" ||
             i == "tags" ||
             i == "type" ||
             i == "blog_name") {
            theEntry[i] = entry[i];
         }
      }
   }
   if (isNew) {
      cache[id] = theEntry;
   }
}

function cacheServe(type, id, theWorker, fn, midFlight, notAjax) {
   var entry;
   if ((entry = cache[id])) {
      debug(type + " request(" + id + ") has cache entry.");
      if (midFlight && !notAjax) {
         dequeueAjax(id);
      }
      else if (!notAjax) {
         dequeueAjax();
      }
      return fn(entry, id, theWorker);
      return true;
   }
   else {
      return false;
   }
}

function runItem(call) {
   if (call.type === "reblogYourself") {
      startReblogYourself(call.message, call.worker);
   }
   else if (call.type === "timestamp") {
      startTimestamp(call.message, call.worker);
   }
   else if (call.type === "tags") {
      startTags(call.message, call.worker);
   }
}

function wakeById(id) {
   var i,j;
   for (i=0; activeRequests[id] && i<activeRequests[id].length; i++) {
      var call;
      if ((call = activeRequests[id][i])) {
         delete onHold[call.type + call.message.pid];
         numSleeping--;
         debug("Selectively waking " + call.type + " request (" + call.message.pid + "). " + numSleeping + " still asleep");
         runItem(call);
      }
   }
}

function isRequested(details) {
   var bucket;
   if (!details.message.sleepCount) {
      details.message.sleepCount = 0;
   }
   if ((bucket = activeRequests[details.message.pid]) &&
       details.message.sleepCount < 5) {
      onHold[details.type + details.message.pid] = details;
      bucket.push(details);
      numSleeping++;
      details.message.sleepCount++;
      debug("Sleeping " + details.type + " request (" + details.message.pid +
            ") [" + details.message.sleepCount + "]. " + numSleeping +
            " asleep");
      return true;
   }
   else {
      return false;
   }
}

function startAjax(id) {
   activeAjax++;
   if (!activeRequests.hasOwnProperty(id)) {
      activeRequests[id] = [];
   }
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
            debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 ||
             !(/<input[^>]*name="post\[date\]"[^>]*>/.test(response.text))) {
            if (closed) {
               debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doFunc, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  debug("Retry " + type + " request (" + this.headers.targetId + ")");
                  doAskAjax('http://www.tumblr.com/edit/',
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, type, doFunc);
               }
               else {
                  debug(type + " request (" + this.headers.targetId + ") failed");
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
               debug(type + " request (" + this.headers.targetId + ") failed");
               dequeueAjax(this.headers.targetId);
               myWorker.postMessage(failMsg);
               return;
            }
            var m = txt.match(/([A-Za-z]+) ([0-9]+)[^,]*, ([0-9]+) ([0-9]+):([0-9]+)([aApP][mM])/);
            var d = new Date(m[1] + ' ' + m[2] + ', ' + m[3] + ' ' +
                             (m[6]=='pm' && m[4] !== '12' ? parseInt(m[4])+12 : m[4]) +
                             ':' + m[5] + ':00 GMT');
            var stamp = Math.round(d.getTime()/1000);
            var info = {"timestamp":stamp};
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doFunc(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function checkPermission(user, count, myWorker, retries) {
   Request({
      url: "http://www.tumblr.com/tumblelog/" + user,
      headers: {tryCount: count,
                retryLimit: retries},
      onComplete: function(response) {
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status != 200 && response.status < 500) {
            myWorker.postMessage({greeting: "tumblrPermission",
                                  allow: false});
            return;
         }
         if (response.status != 200) {
            if (this.headers.tryCount <= this.headers.retryLimit) {
               checkPermission(user, (this.headers.tryCount + 1),
                               myWorker, retries);
            }
            else {
               myWorker.postMessage({greeting: "tumblrPermission",
                                     allow: false});
            }
         }
         else {
            var allow = /<\s*body\s*id="dashboard_index"/.test(response.text);
            if (!closed) {
               myWorker.postMessage({greeting: "tumblrPermission",
                                     allow: allow});
            }
         }
      }
   }).get();
}

function doTagsAjax(url, pid, count, myWorker, retries) {
   var failMsg = {greeting:"tags", success:false};
   Request({
      url: url,
      headers: {tryCount: count,
                retryLimit: retries,
                targetId: pid},
      onComplete: function(response) {
         var goodData = /<guid>[^<]*<\/guid>/.test(response.text);
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            debug("tags request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !goodData) {
            if (closed) {
               debug("Stop tags request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("tags", this.headers.targetId, myWorker,
                           doTags, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  debug("Retry tags request (" + this.headers.targetId + ")");
                  doTagsAjax(this.url,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit);
               }
               else {
                  debug("tags request (" + this.headers.targetId + ") failed");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var i;
            var tags = response.text.match(/<category>[^<]*<\/category>/g);
            if (!tags) { tags = []; }
            for (i=0; i<tags.length; i++) {
               tags[i] = tags[i].replace(/^<category>/,'')
                              .replace(/<\/category>$/,'');
            }
            var info = {"tags":tags};
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doTags(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function doReblogYourselfAjax(url, pid, count, myWorker, retries, additional) {
   var failMsg = {greeting:"reblogYourself", success:false};
   if (additional) {
      for (i in additional) {
         if (additional.hasOwnProperty(i)) {
            failMsg[i] = additional[i];
         }
      }
   }
   Request({
      url: url,
      headers: {tryCount: count,
                retryLimit: retries,
                targetId: pid},
      onComplete: function(response) {
         var ifr = response.text.match(/<\s*iframe[^>]*id="tumblr_controls"[^>]*>/);
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            debug("reblogYourself request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !ifr || ifr.length === 0) {
            if (closed) {
               debug("Stop reblogYourself request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("reblogYourself", this.headers.targetId, myWorker,
                           doReblogDash, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  debug("Retry reblogYourself request (" + this.headers.targetId + ")");
                  doReblogYourselfAjax(this.url,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, additional);
               }
               else {
                  debug("reblogYourself request (" + this.headers.targetId + ") failed");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var rk = ifr[0].match(/rk=([^&]*)/);
            if (rk && rk.length > 1) {
               var info = {"reblog_key":rk[1]};
               saveCache(this.headers.targetId, info);
               dequeueAjax(this.headers.targetId);
               if (!closed) {
                  doReblogDash(info, this.headers.targetId, myWorker);
               }
            }
            else if (!closed) {
               debug("reblogYourself request (" + this.headers.targetId + ") failed");
               dequeueAjax(this.headers.targetId);
               myWorker.postMessage(failMsg);
            }
         }
      }
   }).get();
}

/*
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
      url: "http://api.tumblr.com/v2/blog/" + 
            url.replace(/^https?:\/\//,'') + "/posts?api_key=" + apiKey +
            "&id=" + escapeHTML(pid),
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
            debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 ||
             !(/^\s*var\s+tumblr_api_read/.test(response.text)) &&
             !(/^\s*{\s*['"]meta['"]\s*:\s*{[^}]*['"]status['"]\s*:\s*200,/
                .test(response.text))) {
            if (closed) {
               debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doFunc, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  debug("Retry " + type + " request (" + this.headers.targetId + ")");
                  doAjax(this.url.replace(/\/api\/read\/json\?id=[0-9]*$/,''),
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, type, doFunc,
                         additional);
               }
               else {
                  debug("Retry " + type + " request (" + this.headers.targetId + ")");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var txt = response.text.replace(/^\s*var\s+tumblr_api_read\s+=\s+/,'').replace(/;\s*$/,'');
            var stamp = JSON.parse(txt);
            var info = stamp.response.posts[0];
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doFunc(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}
*/

function startTags(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      debug("Stop tags request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("tags", message.pid, myWorker, doTags, false)) {
      return true;
   }
   else if (isRequested({type: "tags", message: message, worker: myWorker})) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "tags", message: message, worker: myWorker});
   }
   else {
      var url = message.url + "/post/" + message.pid + "/rss";
      debug("AJAX tags request (" + message.pid + ")");
      startAjax(message.pid);
      doTagsAjax(url, message.pid, 0, myWorker,
             getStorage("extensions.MissingE.betterReblogs.retries",defaultRetries));
   }
}

function startMagnifier(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      debug("Stop magnifier request: Tab closed or changed.");
      return;
   }
   debug("Buidling magnifier request (" + message.pid + ")");
   var i,url;
   if (message.num > 1) {
      url = [];
      for (i=0; i<message.num; i++) {
         url.push("http://www.tumblr.com/photo/1280/" + message.pid + "/" +
                  (i+1) + "/" + message.code);
         url.push(message.captions[i]);
      }
      url = JSON.stringify(url);
   }
   else {
      url = "http://www.tumblr.com/photo/1280/" + message.pid + "/1/" +
         message.code;
   }
   myWorker.postMessage({greeting: "magnifier", pid: message.pid, success: true,
                         data: url});
}

function startTimestamp(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      debug("Stop timestamp request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (message.lang) { lang = message.lang; }
   if (cacheServe("timestamp", message.pid, myWorker, doTimestamp, false)) {
      return true;
   }
   else if (isRequested({type: "timestamp", message: message, worker: myWorker})) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "timestamp", message: message, worker: myWorker});
   }
   else if (message.url === 'http://www.tumblr.com/edit/') {
      debug("AJAX timestamp request (" + message.pid + ")");
      startAjax(message.pid);
      doAskAjax(message.url, message.pid, 0, myWorker,
                getStorage("extensions.MissingE.timestamps.retries",defaultRetries),
                "timestamp", doTimestamp);
   }
   else {
      debug("AJAX timestamp request (" + message.pid + ")");
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
      debug("Stop reblogYourself request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("reblogYourself", message.pid, myWorker, doReblogDash,
                  false)) {
      return true;
   }
   else if (isRequested({type: "reblogYourself", message: message, worker: myWorker})) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "reblogYourself", message: message, worker: myWorker});
   }
   else {
      debug("AJAX reblogYourself request (" + message.pid + ")");
      startAjax(message.pid);
      doReblogYourselfAjax(message.url, message.pid, 0, myWorker,
             getStorage("extensions.MissingE.reblogYourself.retries",defaultRetries),
             {
               pid:message.pid,
               icons:getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 && 
                     getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1
             });
   }
}

function versionCompare(v1, v2) {
   if (!v1 && !v2) { return 0; }
   else if (!v1) { return -1; }
   else if (!v2) { return 1; }
   else {
      var i;
      var ver1 = v1.split('.');
      var ver2 = v2.split('.');
      var len = ver1.length >= ver2.length ? ver1.length : ver2.length;
      for (i=0; i<len; i++) {
         if (i >= ver1.length && ver2[i] !== '0') { return -1; }
         else if (i >= ver2.length && ver1[i] !== '0') { return 1; }
         else {
            ver1[i] = parseInt(ver1[i]);
            ver2[i] = parseInt(ver2[i]);
         }
         if (ver1[i] > ver2[i]) { return 1; }
         if (ver2[i] > ver1[i]) { return -1; }
      }
      return 0;
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

function isEDTfromUTC(dt) {
   var start = new Date("03/01/" + dt.getUTCFullYear() + " 07:00:00 UTC");
   var day = start.getDay();
   start.setUTCDate(start.getUTCDate()+14-day);
   var end = new Date("11/01/" + dt.getUTCFullYear() + " 06:00:00 UTC");
   day = end.getDay();
   end.setUTCDate(end.getUTCDate()+7-day);
   return (dt>=start && dt<end);
}

function isEDT(year,month,day,hours) {
   var start = new Date("03/01/" + year + " 07:00:00 UTC");
   var day = start.getDay();
   start.setUTCDate(start.getUTCDate()+14-day);
   var end = new Date("11/01/" + year + " 06:00:00 UTC");
   day = end.getDay();
   end.setUTCDate(end.getUTCDate()+7-day);
   if (month>start.getUTCMonth()+1 && month<end.getUTCMonth()+1) {
      return true;
   }
   else if (month === start.getUTCMonth()+1) {
      if (day > start.getUTCDate()) {
         return true;
      }
      else if (day < start.getUTCDate()) {
         return false;
      }
      else {
         if (hours >= 2) {
            return true;
         }
         else {
            return false;
         }
      }
   }
   else if (month === end.getUTCMonth()+1) {
      if (day < end.getUTCDate()) {
         return true;
      }
      else if (day > end.getUTCDate()) {
         return false;
      }
      else {
         if (hours >= 2) {
            return false;
         }
         else {
            return true;
         }
      }
   }
   else {
      return false;
   }
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
   else if (message.greeting == "version") {
      myWorker.postMessage({greeting: "version",
         uptodate:versionCompare(getStorage("extensions.MissingE.version",'0'),
                                 message.v) >= 0});
   }
   else if (message.greeting == "update") {
      myWorker.postMessage({greeting: "update",
         update:versionCompare(getStorage("extensions.MissingE.externalVersion",'0'),
                               getStorage("extensions.MissingE.version",'0')) > 0,
         msg:locale[message.lang]["update"]});
   }
   else if (message.greeting == "reblogYourself") {
      startReblogYourself(message, myWorker);
   }
   else if (message.greeting == "magnifier") {
      startMagnifier(message, myWorker);
   }
   else if (message.greeting == "tags") {
      startTags(message, myWorker);
   }
   else if (message.greeting == "timestamp") {
      if (message.type == "ask") {
         startTimestamp(message, myWorker);
      }
      else if (cacheServe("timestamp", message.pid, myWorker, doTimestamp, false, true)) {
         return true;
      }
      else {
         var sentStamp = false;
         debug("Building timestamp (" + message.pid + ")");
         var dt = {};
         var today = new Date();
         if (isEDTfromUTC(today)) {
            today.setUTCHours(today.getUTCHours()-4);
         }
         else {
            today.setUTCHours(today.getUTCHours()-5);
         }
         dt.day = today.getUTCDay();
         stamp = message.stamp.replace(/,/,'').split(" ");
         for (i=0; i<stamp.length; i++) {
            if (/[0-9][0-9][0-9][0-9]$/.test(stamp[i])) {
               dt.year = parseInt(stamp[i]);
            }
            else if (/[0-9][0-9]*:[0-9][0-9]$/.test(stamp[i])) {
               var tmp = stamp[i].match(/([0-9]*):([0-9]*)/);
               dt.hours = parseInt(tmp[1]);
               dt.minutes = parseInt(tmp[2].replace(/^0/,''));
            }
            else if (/[0-9][0-9]*:[0-9][0-9](am|AM|pm|PM)/.test(stamp[i])) {
               var tmp = stamp[i].match(/([0-9]*):([0-9]*)/);
               if (/pm$/i.test(stamp[i])) {
                  dt.hours = parseInt(tmp[1])+12;
                  if (dt.hours === 24) { dt.hours = 12; }
               }
               else {
                  dt.hours = parseInt(tmp[1]);
                  if (dt.hours === 12) { dt.hours = 0; }
               }
               dt.minutes = parseInt(tmp[2].replace(/^0/,''));
            }
            else if (/[0-9][0-9]*\/[0-9][0-9]*\/[0-9][0-9]*/.test(stamp[i])) {
               var tmp = stamp[i].match(/([0-9]*)\/([0-9]*)\/([0-9]*)/);
               dt.date = parseInt(tmp[1]);
               dt.month = parseInt(tmp[2]);
               dt.year = parseInt(tmp[3]);
            }
            else if (/[0-9][0-9]*(st|nd|rd|th)$/.test(stamp[i])) {
               var tmp = stamp[i].match(/([0-9]*)/);
               dt.date = parseInt(tmp[1]);
            }
            else if (/^[A-Za-z]+$/.test(stamp[i])) {
               if (/^jan(uary)?$/i.test(stamp[i])) {
                  dt.month = 1;
               }
               else if (/^feb(ruary)?$/i.test(stamp[i])) {
                  dt.month = 2;
               }
               else if (/^mar(ch)?$/i.test(stamp[i])) {
                  dt.month = 3;
               }
               else if (/^apr(il)?$/i.test(stamp[i])) {
                  dt.month = 4;
               }
               else if (/^may$/i.test(stamp[i])) {
                  dt.month = 5;
               }
               else if (/^jun(e)?$/i.test(stamp[i])) {
                  dt.month = 6;
               }
               else if (/^jul(y)?$/i.test(stamp[i])) {
                  dt.month = 7;
               }
               else if (/^aug(ust)?$/i.test(stamp[i])) {
                  dt.month = 8;
               }
               else if (/^sep(t|tember)?$/i.test(stamp[i])) {
                  dt.month = 9;
               }
               else if (/^oct(ober)?$/i.test(stamp[i])) {
                  dt.month = 10;
               }
               else if (/^nov(ember)?$/i.test(stamp[i])) {
                  dt.month = 11;
               }
               else if (/^dec(ember)?$/i.test(stamp[i])) {
                  dt.month = 12;
               }
               else if (/^sun(day)?$/i.test(stamp[i])) {
                  dt.date = -dt.day; 
               }
               else if (/^mon(day)?$/i.test(stamp[i])) {
                  dt.date = (1-dt.day-7)%7;
               }
               else if (/^tue(s|sday)?$/i.test(stamp[i])) {
                  dt.date = (2-dt.day-7)%7;
               }
               else if (/^wed(nesday)?$/i.test(stamp[i])) {
                  dt.date = (3-dt.day-7)%7;
               }
               else if (/^thu(r|rs|rsday)?$/i.test(stamp[i])) {
                  dt.date = (4-dt.day-7)%7;
               }
               else if (/^fri(day)?$/i.test(stamp[i])) {
                  dt.date = (5-dt.day-7)%7;
               }
               else if (/^sat(urday)?$/i.test(stamp[i])) {
                  dt.date = (6-dt.day-7)%7;
               }
            }
         }
         if (dt.year) {
            var tz = isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" : "EST";
            var d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                            dt.hours + ":" + dt.minutes + ":00 " + tz);
            var ts = Math.round(d.getTime()/1000);
            var info = {"timestamp":ts};
            saveCache(message.pid,info);
            sentStamp = true;
            doTimestamp(info, message.pid, myWorker);
         }
         if (!dt.year) {
            if (dt.month) {
               var dq = new Date(dt.month + "/" + dt.date + "/" + today.getUTCFullYear() + " " +
                                dt.hours + ":" + dt.minutes + ":00 UTC");
               if (dq > today + 86400000) {
                  dt.year = today.getUTCFullYear() - 1;
               }
               else {
                  dt.year = today.getUTCFullYear();
               }
               var tz = isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" : "EST";
               var d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                              dt.hours + ":" + dt.minutes + ":00 " + tz);
               var ts = Math.round(d.getTime()/1000);
               var info = {"timestamp":ts};
               saveCache(message.pid,info);
               sentStamp = true;
               doTimestamp(info, message.pid, myWorker);
            }
            else if (dt.date < 0) {
               var dq = new Date(today.month + "/" + today.date + "/" + today.getUTCFullYear() + " " +
                                dt.hours + ":" + dt.minutes + ":00 UTC");
               if (dq > today + 2764800000) {
                  dt.year = today.getUTCFullYear() - 1;
                  today.setUTCFullYear(dt.year);
               }
               else {
                  dt.year = today.getUTCFullYear();
               }
               if (dq > today + 86400000) {
                  dt.month = today.getUTCMonth();
                  today.setUTCMonth(today.getUTCMonth()-1);
               }
               else {
                  dt.month = today.getUTCMonth()+1;
               }
               today = new Date(today.valueOf()+86400000*dt.date);
               dt.date = today.getUTCDate();
               var tz = isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" : "EST";
               var d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                              dt.hours + ":" + dt.minutes + ":00 " + tz);
               var ts = Math.round(d.getTime()/1000);
               var info = {"timestamp":ts};
               saveCache(message.pid,info);
               sentStamp = true;
               doTimestamp(info, message.pid, myWorker);
            }
            else if (!dt.date) {
               dt.year = today.getUTCFullYear();
               dt.month = today.getUTCMonth()+1;
               dt.date = today.getUTCDate();
               var tz = isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" : "EST";
               var d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                              dt.hours + ":" + dt.minutes + ":00 " + tz);
               var ts = Math.round(d.getTime()/1000);
               var info = {"timestamp":ts};
               saveCache(message.pid,info);
               sentStamp = true;
               doTimestamp(info, message.pid, myWorker);
            }
         }
         //console.log(message.stamp);
         //console.log(dt);
         if (!sentStamp) {
            theWorker.postMessage({greeting: "timestamp", pid: id,
                                   success: false});
         }
      }
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
      settings.MissingE_askFixes_betterAnswers = getStorage("extensions.MissingE.askFixes.betterAnswers",0);
      settings.MissingE_askFixes_tagAsker = getStorage("extensions.MissingE.askFixes.tagAsker",1);
      settings.MissingE_askFixes_defaultTags = getStorage("extensions.MissingE.askFixes.defaultTags",'');
      settings.MissingE_askFixes_askDash = getStorage("extensions.MissingE.askFixes.askDash",0);
      settings.MissingE_askFixes_massDelete = getStorage("extensions.MissingE.askFixes.massDelete",1);
      settings.MissingE_bookmarker_format = getStorage("extensions.MissingE.bookmarker.format",defaultFormat);
      settings.MissingE_bookmarker_addBar = getStorage("extensions.MissingE.bookmarker.addBar",1);
      settings.MissingE_dashboardFixes_reblogQuoteFit = getStorage("extensions.MissingE.dashboardFixes.reblogQuoteFit",1);
      settings.MissingE_dashboardFixes_wrapTags = getStorage("extensions.MissingE.dashboardFixes.wrapTags",1);
      settings.MissingE_dashboardFixes_replaceIcons = getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1);
      settings.MissingE_dashboardFixes_timeoutAJAX = getStorage("extensions.MissingE.dashboardFixes.timeoutAJAX",1);
      settings.MissingE_dashboardFixes_timeoutLength = getStorage("extensions.MissingE.dashboardFixes.timeoutLength",defaultTimeout);
      settings.MissingE_dashboardFixes_postLinks = getStorage("extensions.MissingE.dashboardFixes.postLinks",1);
      settings.MissingE_dashboardFixes_reblogReplies = getStorage("extensions.MissingE.dashboardFixes.reblogReplies",0);
      settings.MissingE_dashboardFixes_widescreen = getStorage("extensions.MissingE.dashboardFixes.widescreen",0);
      settings.MissingE_dashboardFixes_queueArrows = getStorage("extensions.MissingE.dashboardFixes.queueArrows",1);
      settings.MissingE_dashboardFixes_expandAll = getStorage("extensions.MissingE.dashboardFixes.expandAll",1);
      settings.MissingE_dashboardFixes_massDelete = getStorage("extensions.MissingE.dashboardFixes.massDelete",1);
      settings.MissingE_sidebarTweaks_retries = getStorage("extensions.MissingE.sidebarTweaks.retries",defaultRetries);
      settings.MissingE_sidebarTweaks_addSidebar = getStorage("extensions.MissingE.sidebarTweaks.addSidebar",0);
      settings.MissingE_sidebarTweaks_slimSidebar = getStorage("extensions.MissingE.sidebarTweaks.slimSidebar",0);
      settings.MissingE_sidebarTweaks_followingLink = getStorage("extensions.MissingE.sidebarTweaks.followingLink",0);
      settings.MissingE_magnifier_retries = getStorage("extensions.MissingE.magnifier.retries",defaultRetries);
      settings.MissingE_magnifier_magnifyAvatars = getStorage("extensions.MissingE.magnifier.magnifyAvatars",0);
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
      settings.MissingE_postingFixes_subEdit = getStorage("extensions.MissingE.postingFixes.subEdit",1);
      settings.MissingE_postingFixes_subEditRetries = getStorage("extensions.MissingE.postingFixes.subEditRetries",defaultRetries);
      settings.MissingE_postingFixes_tagQueuedPosts = getStorage("extensions.MissingE.postingFixes.tagQueuedPosts",0);
      settings.MissingE_postingFixes_queueTags = getStorage("extensions.MissingE.postingFixes.queueTags",'');
      settings.MissingE_reblogYourself_postPage = getStorage("extensions.MissingE.reblogYourself.postPage",1);
      settings.MissingE_reblogYourself_dashboard = getStorage("extensions.MissingE.reblogYourself.dashboard",1);
      settings.MissingE_reblogYourself_retries = getStorage("extensions.MissingE.reblogYourself.retries",defaultRetries);
      settings.MissingE_postCrushes_prefix = getStorage("extensions.MissingE.postCrushes.prefix","Tumblr Crushes:");
      settings.MissingE_postCrushes_crushSize = getStorage("extensions.MissingE.postCrushes.crushSize",1);
      settings.MissingE_postCrushes_addTags = getStorage("extensions.MissingE.postCrushes.addTags",1);
      settings.MissingE_postCrushes_showPercent = getStorage("extensions.MissingE.postCrushes.showPercent",1);
      settings.MissingE_replyReplies_showAvatars = getStorage("extensions.MissingE.replyReplies.showAvatars",1);
      settings.MissingE_replyReplies_smallAvatars = getStorage("extensions.MissingE.replyReplies.smallAvatars",1);
      settings.MissingE_replyReplies_addTags = getStorage("extensions.MissingE.replyReplies.addTags",1);
      settings.MissingE_replyReplies_defaultTags = getStorage("extensions.MissingE.replyReplies.defaultTags",'');
      settings.MissingE_replyReplies_newTab = getStorage("extensions.MissingE.replyReplies.newTab",1);
      settings.MissingE_betterReblogs_passTags = getStorage("extensions.MissingE.betterReblogs.passTags",1);
      settings.MissingE_betterReblogs_retries = getStorage("extensions.MissingE.betterReblogs.retries",defaultRetries);
      settings.MissingE_betterReblogs_autoFillTags = getStorage("extensions.MissingE.betterReblogs.autoFillTags",1);
      settings.MissingE_betterReblogs_quickReblog = getStorage("extensions.MissingE.betterReblogs.quickReblog",0);
      settings.MissingE_betterReblogs_quickReblogAcctType = getStorage("extensions.MissingE.betterReblogs.quickReblogAcctType",0);
      settings.MissingE_betterReblogs_quickReblogAcctName = getStorage("extensions.MissingE.betterReblogs.quickReblogAcctName",'');
      settings.MissingE_betterReblogs_quickReblogForceTwitter = getStorage("extensions.MissingE.betterReblogs.quickReblogForceTwitter",'default');
      settings.MissingE_betterReblogs_fullText = getStorage("extensions.MissingE.betterReblogs.fullText",0);
      settings.MissingE_version = getStorage("extensions.MissingE.version",'');
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "sidebarTweaks") {
      setStorage('extensions.MissingE.sidebarTweaks.accountNum',
                 message.accountNum);
   }
   else if (message.greeting == "tumblrPermission") {
      checkPermission(message.user, 0, myWorker,
                      getStorage("extensions.MissingE.postingFixes.subEditRetries",defaultRetries));
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
            settings.betterAnswers = getStorage("extensions.MissingE.askFixes.betterAnswers",0);
            settings.tagAsker = getStorage("extensions.MissingE.askFixes.tagAsker",1);
            settings.defaultTags = getStorage("extensions.MissingE.askFixes.defaultTags",'');
            if (settings.defaultTags !== '') {
               settings.defaultTags = settings.defaultTags.replace(/, /g,',').split(',');
            }
            settings.askDash = getStorage("extensions.MissingE.askFixes.askDash",0);
            settings.massDelete = getStorage("extensions.MissingE.askFixes.massDelete",1);
            break;
         case "sidebarTweaks":
            settings.retries = getStorage("extensions.MissingE.sidebarTweaks.retries",defaultRetries);
            settings.accountNum = getStorage("extensions.MissingE.sidebarTweaks.accountNum",0);
            settings.slimSidebar = getStorage("extensions.MissingE.sidebarTweaks.slimSidebar",0);
            settings.followingLink = getStorage("extensions.MissingE.sidebarTweaks.followingLink",0);
            settings.addSidebar = getStorage("extensions.MissingE.sidebarTweaks.addSidebar",0);
            break;
         case "bookmarker":
            settings.format = getStorage("extensions.MissingE.bookmarker.format",defaultFormat);
            settings.addBar = getStorage("extensions.MissingE.bookmarker.addBar",1);
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
            settings.expandAll = getStorage("extensions.MissingE.dashboardFixes.expandAll",1);
            settings.massDelete = getStorage("extensions.MissingE.dashboardFixes.massDelete",1);
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
            settings.defaultTags = getStorage("extensions.MissingE.replyReplies.defaultTags",'');
            if (settings.defaultTags !== '') {
               settings.defaultTags = settings.defaultTags.replace(/, /g,',').split(',');
            }
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
            settings.tagQueuedPosts = getStorage("extensions.MissingE.postingFixes.tagQueuedPosts",0);
            settings.queueTags = getStorage("extensions.MissingE.postingFixes.queueTags",'');
            if (settings.queueTags !== '') {
               settings.queueTags = settings.queueTags.replace(/, /g,',').split(',');
            }
            break;
         case "magnifier":
            settings.magnifyAvatars = getStorage("extensions.MissingE.magnifier.magnifyAvatars",0);
            break;
         case "betterReblogs":
            settings.passTags = getStorage("extensions.MissingE.betterReblogs.passTags",1);
            settings.autoFillTags = getStorage("extensions.MissingE.betterReblogs.autoFillTags",1);
            settings.quickReblog = getStorage("extensions.MissingE.betterReblogs.quickReblog",0);
            settings.accountName = '0';
            if (getStorage("extensions.MissingE.betterReblogs.quickReblogAcctType",0) == 1) {
               settings.accountName = getStorage("extensions.MissingE.betterReblogs.quickReblogAcctName",'0');
            }
            settings.quickReblogForceTwitter = getStorage("extensions.MissingE.betterReblogs.quickReblogForceTwitter",'default');
            settings.replaceIcons = (getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1 &&
                                       getStorage("extensions.MissingE.dashboardFixes.replaceIcons",1) == 1) ? 1 : 0;
            settings.fullText = getStorage("extensions.MissingE.betterReblogs.fullText",0);
            settings.tagQueuedPosts = (getStorage("extensions.MissingE.postingFixes.enabled",1) == 1 && getStorage("extensions.MissingE.postingFixes.tagQueuedPosts",0) == 1) ? 1 : 0;
            settings.queueTags = getStorage("extensions.MissingE.postingFixes.queueTags",'');
            if (settings.queueTags !== '') {
               settings.queueTags = settings.queueTags.replace(/, /g,',').split(',');
            }
            break;
      }
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "start") {
      var activeScripts = {};
      var zindexFix = false;
      var needUI = false, needUIresizable = false, needUIsortable = false,
          needUIdraggable = false;
      var injectScripts = [data.url("common/storage.js"),
                           data.url("common/utils.js"),
                           data.url("common/localizations.js")];
      activeScripts.extensionURL = data.url("");
      activeScripts.version = currVersion;
      if (!message.isFrame &&
          /http:\/\/www\.tumblr\.com\/mega-editor\//.test(message.url)) {
            if (getStorage("extensions.MissingE.massEditor.enabled",1) == 1) {
               injectScripts.push(data.url("massEditor/massEditor.js"));
               activeScripts.massEditor = true;
            }
            else
               activeScripts.massEditor = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/drafts/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/inbox/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/queue/.test(message.url) ||
          (/http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//
             .test(message.url)) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/processing/
             .test(message.url))) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url))) {
         if (getStorage("extensions.MissingE.safeDash.enabled",1) == 1) {
            injectScripts.push(data.url("safeDash/safeDash.js"));
            activeScripts.safeDash = true;
         }
         else
            activeScripts.safeDash = false;
      }
      if (!message.isFrame &&
          (/http:\/\/www\.tumblr\.com\/dashboard/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/drafts/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/likes/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/liked\/by\//.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/inbox/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/queue/.test(message.url) ||
          (/http:\/\/www\.tumblr\.com\/tumblelog/.test(message.url) &&
           !(/http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/new\//
             .test(message.url))) ||
          /http:\/\/www\.tumblr\.com\/tagged\//.test(message.url))) {
         if (getStorage("extensions.MissingE.dashLinksToTabs.enabled",1) == 1) {
            injectScripts.push(data.url("dashLinksToTabs/dashLinksToTabs.js"));
            activeScripts.dashLinksToTabs = true;
         }
         else
            activeScripts.dashLinksToTabs = false;

         if (getStorage("extensions.MissingE.bookmarker.enabled",1) == 1) {
            needUI = true;
            needUIsortable = true;
            injectScripts.push(data.url("bookmarker/bookmarker.js"));
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getStorage("extensions.MissingE.sidebarTweaks.enabled",1) == 1) {
            injectScripts.push(data.url("sidebarTweaks/sidebarTweaks.js"));
            activeScripts.sidebarTweaks = true;
         }
         else
            activeScripts.sidebarTweaks = false;

         if (getStorage("extensions.MissingE.magnifier.enabled",1) == 1) {
            injectScripts.push(data.url("magnifier/magnifier.js"));
            activeScripts.magnifier = true;
         }
         else
            activeScripts.magnifier = false;

         if (getStorage("extensions.MissingE.dashboardFixes.enabled",1) == 1) {
            injectScripts.push(data.url("dashboardFixes/dashboardFixes.js"));
            activeScripts.dashboardFixes = true;
         }
         else
            activeScripts.dashboardFixes = false;

         if (getStorage("extensions.MissingE.askFixes.enabled",1) == 1) {
            needUIdraggable = true;
            injectScripts.push(data.url("askFixes/askFixes.js"));
            activeScripts.askFixes = true;
         }
         else
            activeScripts.askFixes = false;
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
          /http:\/\/www\.tumblr\.com\/inbox/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/messages/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[A-Za-z0-9\-\_]+\/submissions/.test(message.url) ||
          /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/drafts/.test(message.url)) ||
         (/http:\/\/www\.tumblr\.com\/share/.test(message.url)))) {
         if (getStorage("extensions.MissingE.postingFixes.enabled",1) == 1) {
            needUI = true;
            needUIresizable = true;
            injectScripts.push(data.url("postingFixes/postingFixes.js"));
            activeScripts.postingFixes = true;
         }
         else
            activeScripts.postingFixes = false;
      }
      if (!message.isFrame &&
         /http:\/\/www\.tumblr\.com\/reblog\//.test(message.url)) {
         if (getStorage("extensions.MissingE.betterReblogs.enabled",1) == 1) {
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

         if (getStorage("extensions.MissingE.postingFixes.enabled",1) == 1 &&
             getStorage("extensions.MissingE.postingFixes.subEdit",1)) {
            activeScripts.postingFixes = true;
         }
         else
            activeScripts.postingFixes = false;
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
          /http:\/\/www\.tumblr\.com\/(tumblelog\/[^\/]*\/)?new\/(text|photo)/
            .test(message.url)) {
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

         if (getStorage("extensions.MissingE.magnifier.enabled",1) == 1) {
            activeScripts.magnifier = true;
            injectScripts.unshift(data.url("magnifier/magnifier.js"));
         }
         else
            activeScripts.magnifier = false;
            
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
          (/http:\/\/www\.tumblr\.com\/(submissions|messages|inbox)/.test(message.url) ||
           /http:\/\/www\.tumblr\.com\/tumblelog\/[^\/]*\/(submissions|messages)/.test(message.url))) {
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
         if (getStorage("extensions.MissingE.timestamps.enabled",1) == 1) {
            injectScripts.push(data.url("timestamps/timestamps.js"));
            activeScripts.timestamps = true;
         }
         else
            activeScripts.timestamps = false;

         if (getStorage("extensions.MissingE.betterReblogs.enabled",1) == 1) {
            if (getStorage("extensions.MissingE.betterReblogs.quickReblog",0) == 1) {
               zindexFix = true;
            }
            injectScripts.push(data.url("betterReblogs/betterReblogs_dash.js"));
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;

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

      if (activeScripts.magnifier ||
          (activeScripts.askFixes &&
           getStorage("extensions.MissingE.askFixes.askDash",0) == 1)) {
         zindexFix = true;
         injectScripts.unshift(data.url("common/faceboxHelper.js"));
         injectScripts.unshift(data.url("facebox/facebox.js"));
      }

      injectScripts.unshift(data.url("common/ajaxEvents.js"));

      // In reverse order of requirements
      if (needUI) {
         if (needUIresizable) {
            injectScripts.unshift(data.url("common/jquery.ui.resizable.js"));
         }
         if (needUIsortable) {
            injectScripts.unshift(data.url("common/jquery.ui.sortable.js"));
         }
         if (needUIdraggable) {
            injectScripts.unshift(data.url("common/jquery.ui.draggable.js"));
         }
         injectScripts.unshift(data.url("common/jquery.ui.mouse.js"));
         injectScripts.unshift(data.url("common/jquery.ui.widget.js"));
         injectScripts.unshift(data.url("common/jquery.ui.core.js"));
      }
      injectScripts.unshift(data.url("common/jquery-1.5.2.min.js"));
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
                       data.url("reblogYourself/reblogYourself_post.js"),
                       data.url("postingFixes/subEdit.js")],
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
                 getStorage("extensions.MissingE.reblogYourself.postPage",1) == 1) ||
                (data.component === 'postingFixes' &&
                 data.subcomponent === 'post' &&
                 getStorage("extensions.MissingE.postingFixes.enabled",1) == 1 &&
                 getStorage("extensions.MissingE.postingFixes.subEdit",1) == 1));
         }
         if (answer) {
            handleMessage(data, this);
         }
      });
   }
});

pageMod.PageMod({
   include: ["http://missinge.infraware.ca/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("common/versionchk.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
      });
   }
});

function getExternalVersion() {
   Request({
      url: 'http://missinge.infraware.ca/version',
      onComplete: function(response) {
         if (response.status == 200) {
            var versionInfo = response.text.split(" ");
            versionInfo[versionInfo.length-1] =
               versionInfo[versionInfo.length-1].replace(/\s*$/m,'');
            setStorage('extensions.MissingE.externalVersion', versionInfo[0]);
            if (versionInfo.length > 1) {
               setStorage('extensions.MissingE.externalVersion.link', versionInfo[1]);
            }
            else {
               setStorage('extensions.MissingE.externalVersion.link', '');
            }
         }
      }
   }).get();
}

function onStart(currVersion, prevVersion) {
   if (prevVersion && prevVersion !== currVersion) {
      console.log("Updated Missing e (" +
                  prevVersion + " => " + currVersion + 
                  ")");
   }
   else if (!prevVersion) {
      console.log("Installed Missing e " + currVersion);
      openSettings();
   }
   setStorage('extensions.MissingE.version',currVersion);
}

onStart(currVersion, prevVersion);
getExternalVersion();

setIntegerPrefType('extensions.MissingE.betterReblogs.quickReblogAcctType',0);
setIntegerPrefType('extensions.MissingE.postCrushes.crushSize',1);
setIntegerPrefType('extensions.MissingE.replyReplies.smallAvatars',1);

moveSetting('extensions.MissingE.dashboardFixes.slimSidebar','extensions.MissingE.sidebarTweaks.slimSidebar');
moveSetting('extensions.MissingE.dashboardFixes.followingLink','extensions.MissingE.sidebarTweaks.followingLink');
collapseSettings('extensions.MissingE.askFixes.betterAnswers','extensions.MissingE.askFixes.buttons','extensions.MissingE.askFixes.tags');
invertSetting('extensions.MissingE.betterReblogs.noPassTags','extensions.MissingE.betterReblogs.passTags');

console.log("Missing e is running.");
