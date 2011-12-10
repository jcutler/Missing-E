/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
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

var maxActiveAjax = 15;

var activeAjax = 0;
var activeRequests = {};
var waitQueue = [];
var onHold = {};
var numSleeping = 0;
var cache = {};
var cacheElements = 0;
var cacheClear;
var clearQueues;
var permissionCache = {};
var fiveMinutes = 300000;
var tenSeconds = 10000;
var MissingE = require("utils").utils;
MissingE.locale = require("localizations").locale;
var lang = 'en';
var debugMode = false;

function getVersion() {
   return require("self").version;
}

function parameterize(input) {
   var p = [];
   for (i in input) {
      if (input.hasOwnProperty(i)) {
         p.push(encodeURIComponent(i)+"="+encodeURIComponent(input[i]));
      }
   }
   return p.join("&").replace(/%20/g,"+");
}

function getSetting(key, defVal) {
   return ps.get(key, defVal);
}

function setSetting(key, val) {
   ps.set(key, val);
}

var currVersion = getVersion();
var prevVersion = getSetting('extensions.MissingE.version',null);

cacheClear = timer.setInterval(function() {
   cache = {};
   cacheElements = 0;
   permissionCache = {};
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

var componentList = ["dashboardTweaks",
                     "bookmarker",
                     "dashLinksToTabs",
                     "safeDash",
                     "timestamps",
                     "magnifier",
                     "betterReblogs",
                     "gotoDashPost",
                     "postingTweaks",
                     "reblogYourself",
                     "askTweaks",
                     "postCrushes",
                     "replyReplies",
                     "massEditor",
                     "sidebarTweaks"];

function getAllSettings() {
   var settings = {};
   settings.greeting = "all-settings";
   settings.MissingE_experimentalFeatures_enabled = getSetting("extensions.MissingE.experimentalFeatures.enabled",0);
   for (i=0; i<componentList.length; i++) {
      settings["MissingE_" + componentList[i] + "_enabled"] =
         getSetting("extensions.MissingE." + componentList[i] + ".enabled", 1);
   }
   settings.MissingE_askTweaks_scroll = getSetting("extensions.MissingE.askTweaks.scroll",1);
   settings.MissingE_askTweaks_betterAnswers = getSetting("extensions.MissingE.askTweaks.betterAnswers",0);
   settings.MissingE_askTweaks_tagAsker = getSetting("extensions.MissingE.askTweaks.tagAsker",1);
   settings.MissingE_askTweaks_defaultTags = getSetting("extensions.MissingE.askTweaks.defaultTags",'');
   settings.MissingE_askTweaks_askDash = getSetting("extensions.MissingE.askTweaks.askDash",0);
   settings.MissingE_askTweaks_massDelete = getSetting("extensions.MissingE.askTweaks.massDelete",1);
   settings.MissingE_bookmarker_format = getSetting("extensions.MissingE.bookmarker.format",MissingE.defaultFormat);
   settings.MissingE_bookmarker_addBar = getSetting("extensions.MissingE.bookmarker.addBar",1);
   settings.MissingE_dashboardTweaks_reblogQuoteFit = getSetting("extensions.MissingE.dashboardTweaks.reblogQuoteFit",1);
   settings.MissingE_dashboardTweaks_wrapTags = getSetting("extensions.MissingE.dashboardTweaks.wrapTags",1);
   settings.MissingE_dashboardTweaks_replaceIcons = getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1);
   settings.MissingE_dashboardTweaks_postLinks = getSetting("extensions.MissingE.dashboardTweaks.postLinks",1);
   settings.MissingE_dashboardTweaks_reblogReplies = getSetting("extensions.MissingE.dashboardTweaks.reblogReplies",0);
   settings.MissingE_dashboardTweaks_widescreen = getSetting("extensions.MissingE.dashboardTweaks.widescreen",0);
   settings.MissingE_dashboardTweaks_queueArrows = getSetting("extensions.MissingE.dashboardTweaks.queueArrows",1);
   settings.MissingE_dashboardTweaks_expandAll = getSetting("extensions.MissingE.dashboardTweaks.expandAll",1);
   settings.MissingE_dashboardTweaks_massDelete = getSetting("extensions.MissingE.dashboardTweaks.massDelete",1);
   settings.MissingE_dashboardTweaks_randomQueue = getSetting("extensions.MissingE.dashboardTweaks.randomQueue",0);
   settings.MissingE_dashboardTweaks_sortableNotes = getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1);
   settings.MissingE_sidebarTweaks_retries = getSetting("extensions.MissingE.sidebarTweaks.retries",MissingE.defaultRetries);
   settings.MissingE_sidebarTweaks_addSidebar = getSetting("extensions.MissingE.sidebarTweaks.addSidebar",0);
   settings.MissingE_sidebarTweaks_slimSidebar = getSetting("extensions.MissingE.sidebarTweaks.slimSidebar",0);
   settings.MissingE_sidebarTweaks_followingLink = getSetting("extensions.MissingE.sidebarTweaks.followingLink",0);
   settings.MissingE_magnifier_retries = getSetting("extensions.MissingE.magnifier.retries",MissingE.defaultRetries);
   settings.MissingE_magnifier_magnifyAvatars = getSetting("extensions.MissingE.magnifier.magnifyAvatars",0);
   settings.MissingE_dashLinksToTabs_newPostTabs = getSetting("extensions.MissingE.dashLinksToTabs.newPostTabs",1);
   settings.MissingE_dashLinksToTabs_sidebar = getSetting("extensions.MissingE.dashLinksToTabs.sidebar",0);
   settings.MissingE_dashLinksToTabs_reblogLinks = getSetting("extensions.MissingE.dashLinksToTabs.reblogLinks",0);
   settings.MissingE_dashLinksToTabs_editLinks = getSetting("extensions.MissingE.dashLinksToTabs.editLinks",0);
   settings.MissingE_timestamps_retries = getSetting("extensions.MissingE.timestamps.retries",MissingE.defaultRetries);
   settings.MissingE_timestamps_format = getSetting("extensions.MissingE.timestamps.format",MissingE.defaultFormat);
   settings.MissingE_postingTweaks_photoReplies = getSetting("extensions.MissingE.postingTweaks.photoReplies",1);
   settings.MissingE_postingTweaks_uploaderToggle = getSetting("extensions.MissingE.postingTweaks.uploaderToggle",1);
   settings.MissingE_postingTweaks_addUploader = getSetting("extensions.MissingE.postingTweaks.addUploader",1);
   settings.MissingE_postingTweaks_quickButtons = getSetting("extensions.MissingE.postingTweaks.quickButtons",1);
   settings.MissingE_postingTweaks_blogSelect = getSetting("extensions.MissingE.postingTweaks.blogSelect",0);
   settings.MissingE_postingTweaks_subEdit = getSetting("extensions.MissingE.postingTweaks.subEdit",1);
   settings.MissingE_postingTweaks_subEditRetries = getSetting("extensions.MissingE.postingTweaks.subEditRetries",MissingE.defaultRetries);
   settings.MissingE_postingTweaks_tagQueuedPosts = getSetting("extensions.MissingE.postingTweaks.tagQueuedPosts",0);
   settings.MissingE_postingTweaks_queueTags = getSetting("extensions.MissingE.postingTweaks.queueTags",'');
   settings.MissingE_reblogYourself_postPage = getSetting("extensions.MissingE.reblogYourself.postPage",1);
   settings.MissingE_reblogYourself_dashboard = getSetting("extensions.MissingE.reblogYourself.dashboard",1);
   settings.MissingE_reblogYourself_retries = getSetting("extensions.MissingE.reblogYourself.retries",MissingE.defaultRetries);
   settings.MissingE_postCrushes_prefix = getSetting("extensions.MissingE.postCrushes.prefix","Tumblr Crushes:");
   settings.MissingE_postCrushes_crushSize = getSetting("extensions.MissingE.postCrushes.crushSize",1);
   settings.MissingE_postCrushes_addTags = getSetting("extensions.MissingE.postCrushes.addTags",1);
   settings.MissingE_postCrushes_showPercent = getSetting("extensions.MissingE.postCrushes.showPercent",1);
   settings.MissingE_replyReplies_showAvatars = getSetting("extensions.MissingE.replyReplies.showAvatars",1);
   settings.MissingE_replyReplies_smallAvatars = getSetting("extensions.MissingE.replyReplies.smallAvatars",1);
   settings.MissingE_replyReplies_addTags = getSetting("extensions.MissingE.replyReplies.addTags",1);
   settings.MissingE_replyReplies_defaultTags = getSetting("extensions.MissingE.replyReplies.defaultTags",'');
   settings.MissingE_replyReplies_newTab = getSetting("extensions.MissingE.replyReplies.newTab",1);
   settings.MissingE_betterReblogs_passTags = getSetting("extensions.MissingE.betterReblogs.passTags",1);
   settings.MissingE_betterReblogs_retries = getSetting("extensions.MissingE.betterReblogs.retries",MissingE.defaultRetries);
   settings.MissingE_betterReblogs_autoFillTags = getSetting("extensions.MissingE.betterReblogs.autoFillTags",1);
   settings.MissingE_betterReblogs_quickReblog = getSetting("extensions.MissingE.betterReblogs.quickReblog",0);
   settings.MissingE_betterReblogs_quickReblogAcctType = getSetting("extensions.MissingE.betterReblogs.quickReblogAcctType",0);
   settings.MissingE_betterReblogs_quickReblogAcctName = getSetting("extensions.MissingE.betterReblogs.quickReblogAcctName",'');
   settings.MissingE_betterReblogs_quickReblogForceTwitter = getSetting("extensions.MissingE.betterReblogs.quickReblogForceTwitter",'default');
   settings.MissingE_betterReblogs_fullText = getSetting("extensions.MissingE.betterReblogs.fullText",0);
   settings.MissingE_betterReblogs_reblogAsks = getSetting("extensions.MissingE.betterReblogs.reblogAsks",0);
   settings.MissingE_version = getSetting("extensions.MissingE.version",'');
   settings.MissingE_betterReblogs_askRetries = getSetting("extensions.MissingE.betterReblogs.askRetries",MissingE.defaultRetries);
   return settings;
}

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

function moveAllSettings(oldgroup, newgroup) {
   var allsettings = getAllSettings();
   var re = new RegExp("^MissingE_" + oldgroup + "_");
   for (i in allsettings) {
      if (allsettings.hasOwnProperty(i) &&
          re.test(i)) {
         var oldpref = 'extensions.' + i.replace(/_/g,'.');
         var newpref = 'extensions.' + i.replace(re,'MissingE_' + newgroup + '_').replace(/_/g,'.');
         console.log('"' + oldpref + '" depracated. Moving setting to "' + newpref + '"');
         if (!ps.isSet(newpref)) {
            ps.set(newpref, ps.get(oldpref,0));
         }
         ps.reset(oldpref);
      }
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
   closeTab(data.url("core/options.html"));

   tabs.open({
      url: data.url("core/options.html"),
      onReady: function(tab) {
         tab.attach({
            contentScriptFile: [data.url("jquery-1.5.2.min.js"),
                                data.url("extension.js"),
                                data.url("core/localizations.js"),
                                data.url("core/utils.js"),
                                data.url("lib/checkbox/jquery.checkbox.min.js"),
                                data.url("lib/facebox/facebox.js"),
                                data.url("lib/jquery-spin/jquery-spin.js"),
                                data.url("core/options.js")],
            onMessage: function(data) {
               handleMessage(data, this);
            }
         });
      }
   });
}

if (!getSetting("extensions.MissingE.hideWidget",false)) {
   widget = widgets.Widget({
      label: "Missing e",
      id: "missinge",
      tooltip: "Missing e Settings",
      contentURL: data.url("identity/missinge32.png"),
      onClick: function() {
         openSettings();
      }
   });
}

function exportOptionsXML(theWorker) {
   theWorker.postMessage({greeting: "exportOptions", url: "http://tools.missinge.infraware.ca/settings?" + parameterize(createOptionParams())});
}

function isInternalSetting(setting) {
   return !/^MissingE_/.test(setting) ||
          setting === "MissingE_version" ||
          /MissingE_externalVersion/.test(setting) ||
          setting === "MissingE_compatCheck" ||
          !/^[a-zA-Z0-9_]*$/.test(setting);
}

function createOptionParams() {
   var opts = {};
   var currSettings = getAllSettings();
   for (setting in currSettings) {
      if (currSettings.hasOwnProperty(setting) &&
          ps.isSet("extensions." + setting.replace(/_/g,".")) &&
          !isInternalSetting(setting)) {
         opts[setting] = currSettings[setting];
      }
   }
   return opts;
}

function receiveOptions(message, theWorker) {
   var changed, set, reset;
   changed = set = reset = 0;
   var settings = message.data;
   var allSettings = getAllSettings();
   var currSettings = getAllSettings();
   for (i in currSettings) {
      if (currSettings.hasOwnProperty(i) &&
          !ps.isSet("extensions." + i.replace(/_/g,"."))) {
         delete currSettings[i];
      }
   }
   for (i in settings) {
      if (settings.hasOwnProperty(i)) {
         // Important! Firefox settings can be ints
         // so comparison should be == (value only, not type)
         if (!currSettings.hasOwnProperty(i) ||
             currSettings[i] != settings[i]) {
            var done = false;
            if (typeof allSettings[i] === "number") {
               var val = parseInt(settings[i]);
               if (!isNaN(val)) {
                  done = true;
                  setSetting('extensions.' + i.replace(/_/g,"."), val);
               }
            }
            else {
               done = true;
               setSetting('extensions.' + i.replace(/_/g,"."), settings[i]);
            }
            if (done) {
               var old = "'" + currSettings[i] + "'";
               if (currSettings[i] === undefined) {
                  old = "undefined";
                  set++;
               }
               else {
                  changed++;
               }
               debug(i + " [" + old + " => '" +
                           settings[i] + "']");
            }
         }
      }
   }
   for (i in currSettings) {
      if (currSettings.hasOwnProperty(i) &&
          !settings.hasOwnProperty(i) &&
          !isInternalSetting(i)) {
         reset++;
         ps.reset('extensions.' + i.replace(/_/g,"."));
      }
   }
   if (set + changed + reset > 0) {
      fixupSettings();
      theWorker.postMessage({greeting:"importOptions",success:true,
         msg:"Import complete.\n\n" + (set+changed+reset) + " change(s) made."});
   }
   else {
      theWorker.postMessage({greeting:"importOptions",success:false,
         msg:"No changes imported."});
   }
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
   var ins = getSetting("extensions.MissingE.timestamps.format",MissingE.defaultFormat);
   ins = MissingE.getFormattedDate(d, ins, lang);
   theWorker.postMessage({greeting: "timestamp", pid: id, success: true, data: ins});
   return true;
}

function doReblogDash(stamp, id, theWorker, type) {
   if (!stamp.reblog_key) {
      debug("Cache entry does not have reblog key.");
      return false;
   }
   var key = stamp.reblog_key;
   var name = stamp.name;
   var replaceIcons = getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1 &&
                      getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1) == 1;
   theWorker.postMessage({greeting: type, pid: id, success: true, data: key, name: name, icons: replaceIcons});
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
             (i == "name" && entry[i] != "")) {
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
      return fn(entry, id, theWorker, type);
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
   else if (call.type === "betterReblogs") {
      startBetterReblogsAsk(call.message, call.worker);
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
   var failMsg = {greeting:type, success:false, pid:pid};
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
   if (permissionCache.hasOwnProperty(user)) {
      myWorker.postMessage({greeting: "tumblrPermission",
                            allow: permissionCache[user]});
      return;
   }
   Request({
      url: "http://www.tumblr.com/blog/" + user,
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
            permissionCache[user] = false;
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
            permissionCache[user] = allow;
            if (!closed) {
               myWorker.postMessage({greeting: "tumblrPermission",
                                     allow: allow});
            }
         }
      }
   }).get();
}

function doTagsAjax(url, pid, count, myWorker, retries) {
   var failMsg = {greeting:"tags", success:false, pid:pid};
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

function doReblogAjax(type, url, pid, count, myWorker, retries, additional) {
   var failMsg = {greeting:type, success:false, pid:pid};
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
            debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !ifr || ifr.length === 0) {
            if (closed) {
               debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doReblogDash, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  debug("Retry " + type + " request (" + this.headers.targetId + ")");
                  doReblogAjax(type, this.url,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, additional);
               }
               else {
                  debug(type + " request (" + this.headers.targetId + ") failed");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var rk = ifr[0].match(/rk=([^&"']*)/);
            var poster = ifr[0].match(/name=([^&"']*)/);
            var user;
            if (rk && rk.length > 1) {
               if (!poster || poster.length <= 1) {
                  user = "";
               }
               else {
                  user = poster[1];
               }
               var info = {"reblog_key":rk[1],
                           "name":user};
               saveCache(this.headers.targetId, info);
               dequeueAjax(this.headers.targetId);
               if (!closed) {
                  doReblogDash(info, this.headers.targetId, myWorker, type);
               }
            }
            else if (!closed) {
               debug(type + " request (" + this.headers.targetId + ") failed");
               dequeueAjax(this.headers.targetId);
               myWorker.postMessage(failMsg);
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
             getSetting("extensions.MissingE.betterReblogs.retries",MissingE.defaultRetries));
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
                  message.revs[i] + "/" + message.code);
         url.push(message.captions[i]);
      }
      url = JSON.stringify(url);
   }
   else {
      url = "http://www.tumblr.com/photo/1280/" + message.pid + "/" +
         message.revs[0] + "/" + message.code;
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
                getSetting("extensions.MissingE.timestamps.retries",MissingE.defaultRetries),
                "timestamp", doTimestamp);
   }
   else {
      debug("AJAX timestamp request (" + message.pid + ")");
      startAjax(message.pid);
      doAjax(message.url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.timestamps.retries",MissingE.defaultRetries),
             "timestamp", doTimestamp, {pid: message.pid});
   }
}

function startBetterReblogsAsk(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      debug("Stop betterReblogs request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("betterReblogs", message.pid, myWorker, doReblogDash,
                  false)) {
      return true;
   }
   else if (isRequested({type: "betterReblogs", message: message, worker: myWorker})) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "betterReblogs", message: message, worker: myWorker});
   }
   else {
      debug("AJAX betterReblogs request (" + message.pid + ")");
      startAjax(message.pid);
      doReblogAjax("betterReblogs", message.url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.reblogYourself.askRetries",MissingE.defaultRetries),
             {
               pid:message.pid,
               icons:getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1 &&
                     getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1) == 1
             });
   }
}

function doUploader(message, count, retries, myWorker) {
   var failMsg = {greeting: "uploader", success: false};
   Request({
      url: "http://www.tumblr.com/upload/image",
      headers: {tryCount: count,
                retryLimit: retries},
      onComplete: function(response) {
         var key = response.text.match(/<input[^>]*name="form_key"[^>]*value="([^"]*)"[^>]*>/);
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status !== 200 ||
             !key || key.length < 2) {
            if (!closed) {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  doUploader(message, (this.headers.tryCount + 1),
                             this.headers.retryLimit, myWorker);
               }
               else {
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var page = data.load(message.url);
            page = page.replace(/FORMKEY/, key[1])
                       .replace(/<script[^>]*>[^<]*<\/script>/g,'')
                       .replace(/<style[^>]*>[^<]*<\/style>/g,'');
            myWorker.postMessage({greeting: "uploader", success: true, data: page});
         }
      }
   }).get();
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
      doReblogAjax("reblogYourself", message.url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.reblogYourself.retries",MissingE.defaultRetries),
             {
               pid:message.pid,
               icons:getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1 &&
                     getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1) == 1
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
         uptodate:versionCompare(getSetting("extensions.MissingE.version",'0'),
                                 message.v) >= 0});
   }
   else if (message.greeting == "update") {
      myWorker.postMessage({greeting: "update",
         update:versionCompare(getSetting("extensions.MissingE.externalVersion",'0'),
                               getSetting("extensions.MissingE.version",'0')) > 0,
         msg:MissingE.getLocale(message.lang).update});
   }
   else if (message.greeting == "exportOptions") {
      exportOptionsXML(myWorker);
   }
   else if (message.greeting == "importOptions") {
      receiveOptions(message, myWorker);
   }
   else if (message.greeting == "getAsker") {
      myWorker.tab.attach({
         contentScriptFile: [data.url("extension.js"),
                             data.url("core/utils.js"),
                             data.url("core/betterReblogs/betterReblogs_post.js")],
         onMessage: function(msg) {
            myWorker.postMessage({greeting: "sendAsker", name: msg.name,
                                  url: myWorker.tab.url, isSure: msg.isSure});
         }
      });
   }
   else if (message.greeting == "uploader") {
      doUploader(message, 0, 4, myWorker);
   }
   else if (message.greeting == "reblogYourself") {
      startReblogYourself(message, myWorker);
   }
   else if (message.greeting == "betterReblogs") {
      startBetterReblogsAsk(message, myWorker);
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
         debug("Building timestamp (" + message.pid + ")");
         var ts = MissingE.buildTimestamp(message.stamp);
         if (ts !== null) {
            var info = {"timestamp":ts};
            saveCache(message.pid,info);
            doTimestamp(info, message.pid, myWorker);
         }
         else {
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
      setSetting(key, message.val);
   }
   else if (message.greeting == "all-settings") {
      var settings = getAllSettings();
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "sidebarTweaks") {
      setSetting('extensions.MissingE.sidebarTweaks.accountNum',
                 message.accountNum);
   }
   else if (message.greeting == "tumblrPermission") {
      checkPermission(message.user, 0, myWorker,
                      getSetting("extensions.MissingE.postingTweaks.subEditRetries",MissingE.defaultRetries));
   }
   else if (message.greeting == "settings") {
      var settings = {};
      settings.greeting = "settings";
      settings.component = message.component;
      settings.subcomponent = message.subcomponent;
      settings.experimental = getSetting("extensions.MissingE.experimentalFeatures.enabled",0);
      settings.extensionURL = data.url("");
      switch(message.component) {
         case "askTweaks":
            settings.scroll = getSetting("extensions.MissingE.askTweaks.scroll",1);
            settings.betterAnswers = getSetting("extensions.MissingE.askTweaks.betterAnswers",0);
            settings.tagAsker = getSetting("extensions.MissingE.askTweaks.tagAsker",1);
            settings.defaultTags = getSetting("extensions.MissingE.askTweaks.defaultTags",'');
            if (settings.defaultTags !== '') {
               settings.defaultTags = settings.defaultTags.replace(/, /g,',').split(',');
            }
            settings.askDash = getSetting("extensions.MissingE.askTweaks.askDash",0);
            settings.massDelete = getSetting("extensions.MissingE.askTweaks.massDelete",1);
            settings.adjustDomain = MissingE.isTumblrURL(myWorker.tab.url, ["messages"]);
            break;
         case "sidebarTweaks":
            settings.retries = getSetting("extensions.MissingE.sidebarTweaks.retries",MissingE.defaultRetries);
            settings.accountNum = getSetting("extensions.MissingE.sidebarTweaks.accountNum",0);
            settings.slimSidebar = getSetting("extensions.MissingE.sidebarTweaks.slimSidebar",0);
            settings.followingLink = getSetting("extensions.MissingE.sidebarTweaks.followingLink",0);
            settings.addSidebar = getSetting("extensions.MissingE.sidebarTweaks.addSidebar",0);
            break;
         case "bookmarker":
            settings.format = getSetting("extensions.MissingE.bookmarker.format",MissingE.defaultFormat);
            settings.addBar = getSetting("extensions.MissingE.bookmarker.addBar",1);
            break;
         case "dashboardTweaks":
            settings.reblogQuoteFit = getSetting("extensions.MissingE.dashboardTweaks.reblogQuoteFit",1);
            settings.wrapTags = getSetting("extensions.MissingE.dashboardTweaks.wrapTags",1);
            settings.replaceIcons = getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1);
            settings.postLinks = getSetting("extensions.MissingE.dashboardTweaks.postLinks",1);
            settings.reblogReplies = getSetting("extensions.MissingE.dashboardTweaks.reblogReplies",0);
            settings.widescreen = getSetting("extensions.MissingE.dashboardTweaks.widescreen",0);
            settings.queueArrows = getSetting("extensions.MissingE.dashboardTweaks.queueArrows",1);
            settings.expandAll = getSetting("extensions.MissingE.dashboardTweaks.expandAll",1);
            settings.massDelete = getSetting("extensions.MissingE.dashboardTweaks.massDelete",1);
            settings.randomQueue = getSetting("extensions.MissingE.dashboardTweaks.randomQueue",0);
            settings.sortableNotes = getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1);
            break;
         case "dashLinksToTabs":
            settings.newPostTabs = getSetting("extensions.MissingE.dashLinksToTabs.newPostTabs",1);
            settings.sidebar = getSetting("extensions.MissingE.dashLinksToTabs.sidebar",0);
            settings.reblogLinks = getSetting("extensions.MissingE.dashLinksToTabs.reblogLinks",0);
            settings.editLinks = getSetting("extensions.MissingE.dashLinksToTabs.editLinks",0);
            break;
         case "replyReplies":
            settings.showAvatars = getSetting("extensions.MissingE.replyReplies.showAvatars",1);
            settings.smallAvatars = getSetting("extensions.MissingE.replyReplies.smallAvatars",1);
            settings.addTags = getSetting("extensions.MissingE.replyReplies.addTags",1);
            settings.defaultTags = getSetting("extensions.MissingE.replyReplies.defaultTags",'');
            if (settings.defaultTags !== '') {
               settings.defaultTags = settings.defaultTags.replace(/, /g,',').split(',');
            }
            settings.newTab = getSetting("extensions.MissingE.replyReplies.newTab",1);
            break;
         case "postCrushes_fill":
         case "postCrushes":
            settings.prefix = getSetting("extensions.MissingE.postCrushes.prefix","Tumblr Crushes:");
            settings.crushSize = getSetting("extensions.MissingE.postCrushes.crushSize",1);
            settings.addTags = getSetting("extensions.MissingE.postCrushes.addTags",1);
            settings.showPercent = getSetting("extensions.MissingE.postCrushes.showPercent",1);
            break;
         case "postingTweaks":
            settings.photoReplies = getSetting("extensions.MissingE.postingTweaks.photoReplies",1);
            settings.uploaderToggle = getSetting("extensions.MissingE.postingTweaks.uploaderToggle",1);
            settings.addUploader = getSetting("extensions.MissingE.postingTweaks.addUploader",1);
            settings.quickButtons = getSetting("extensions.MissingE.postingTweaks.quickButtons",1);
            settings.blogSelect = getSetting("extensions.MissingE.postingTweaks.blogSelect",0);
            settings.tagQueuedPosts = getSetting("extensions.MissingE.postingTweaks.tagQueuedPosts",0);
            settings.queueTags = getSetting("extensions.MissingE.postingTweaks.queueTags",'');
            if (settings.queueTags !== '') {
               settings.queueTags = settings.queueTags.replace(/, /g,',').split(',');
            }
            break;
         case "magnifier":
            settings.magnifyAvatars = getSetting("extensions.MissingE.magnifier.magnifyAvatars",0);
            break;
         case "betterReblogs":
            settings.passTags = getSetting("extensions.MissingE.betterReblogs.passTags",1);
            settings.autoFillTags = getSetting("extensions.MissingE.betterReblogs.autoFillTags",1);
            settings.quickReblog = getSetting("extensions.MissingE.betterReblogs.quickReblog",0);
            settings.accountName = '0';
            if (getSetting("extensions.MissingE.betterReblogs.quickReblogAcctType",0) == 1) {
               settings.accountName = getSetting("extensions.MissingE.betterReblogs.quickReblogAcctName",'0');
            }
            settings.quickReblogForceTwitter = getSetting("extensions.MissingE.betterReblogs.quickReblogForceTwitter",'default');
            settings.replaceIcons = (getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1 &&
                                       getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1) == 1) ? 1 : 0;
            settings.fullText = getSetting("extensions.MissingE.betterReblogs.fullText",0);
            settings.tagQueuedPosts = (getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1 && getSetting("extensions.MissingE.postingTweaks.tagQueuedPosts",0) == 1) ? 1 : 0;
            settings.queueTags = getSetting("extensions.MissingE.postingTweaks.queueTags",'');
            if (settings.queueTags !== '') {
               settings.queueTags = settings.queueTags.replace(/, /g,',').split(',');
            }
            settings.reblogAsks = getSetting("extensions.MissingE.betterReblogs.reblogAsks",0);
            break;
      }
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "start") {
      var activeScripts = {};
      var zindexFix = false;
      var needUI = false, needUIresizable = false, needUIsortable = false,
          needUIdraggable = false;
      var injectSlimSidebar = false;
      var injectScripts = [data.url("extension.js"),
                           data.url("core/localizations.js"),
                           data.url("core/utils.js")];
      var injectStyles = [];
      myWorker.tab.attach({
         contentScript: 'document.body' +
                           '.setAttribute("data-MissingE-extensionURL","' +
                                          data.url("") + '");',
      });
      activeScripts.extensionURL = data.url("");
      activeScripts.version = currVersion;
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["massEditor"])) {
            if (getSetting("extensions.MissingE.massEditor.enabled",1) == 1) {
               injectStyles.push({file: data.url("core/massEditor/massEditor.css")});
               injectScripts.push(data.url("core/massEditor/massEditor.js"));
               activeScripts.massEditor = true;
            }
            else
               activeScripts.massEditor = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url,
                               ["dashboard",
                                "blog",
                                "blogData",
                                "drafts",
                                "queue",
                                "messages",
                                "likes",
                                "tagged"])) {
         if (getSetting("extensions.MissingE.safeDash.enabled",1) == 1) {
            injectStyles.push({file: data.url("core/safeDash/safeDash.css")});
            injectScripts.push(data.url("core/safeDash/safeDash.js"));
            activeScripts.safeDash = true;
         }
         else
            activeScripts.safeDash = false;

         if (getSetting("extensions.MissingE.dashLinksToTabs.enabled",1) == 1) {
            injectScripts.push(data.url("core/dashLinksToTabs/dashLinksToTabs.js"));
            activeScripts.dashLinksToTabs = true;
         }
         else
            activeScripts.dashLinksToTabs = false;

         if (getSetting("extensions.MissingE.bookmarker.enabled",1) == 1) {
            needUI = true;
            needUIsortable = true;
            injectStyles.push({file: data.url("core/bookmarker/bookmarker.css")});
            injectScripts.push(data.url("core/bookmarker/bookmarker.js"));
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getSetting("extensions.MissingE.sidebarTweaks.enabled",1) == 1) {
            injectStyles.push({file: data.url("core/sidebarTweaks/sidebarTweaks.css")});
            injectScripts.push(data.url("core/sidebarTweaks/sidebarTweaks.js"));
            if (getSetting("extensions.MissingE.sidebarTweaks.slimSidebar",0) == 1) {
               injectSlimSidebar = true;
            }
            activeScripts.sidebarTweaks = true;
         }
         else
            activeScripts.sidebarTweaks = false;

         if (getSetting("extensions.MissingE.magnifier.enabled",1) == 1) {
            injectStyles.push({file: data.url("core/magnifier/magnifier.css")});
            injectScripts.push(data.url("core/magnifier/magnifier.js"));
            activeScripts.magnifier = true;
         }
         else
            activeScripts.magnifier = false;

         if (getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1) {
            injectStyles.push({file: data.url("core/dashboardTweaks/replaceIcons.css")});
            if (getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1) == 1) {
               needUI = true;
               needUIsortable = true;
               injectStyles.push({file: data.url("core/dashboardTweaks/notesSorter.css")});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.reblogQuoteFit",1) == 1) {
               injectStyles.push({file: data.url("core/dashboardTweaks/reblogQuoteFit.css")});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.wrapTags",1) == 1) {
               injectStyles.push({file: data.url("core/dashboardTweaks/wrapTags.css")});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.postLinks",1) == 1) {
               injectStyles.push({file: data.url("core/dashboardTweaks/postLinks.css")});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.massDelete",1) == 1 ||
                getSetting("extensions.MissingE.dashboardTweaks.randomQueue",0) == 1) {
               injectStyles.push({file: data.url("core/dashboardTweaks/draftQueueTools.css")});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.widescreen",0) == 1 &&
                !MissingE.isTumblrURL(message.url, ["settings"])) {
               injectStyles.push({file: data.url("core/dashboardTweaks/widescreen.css")});
            }
            injectScripts.push(data.url("core/dashboardTweaks/dashboardTweaks.js"));
            activeScripts.dashboardTweaks = true;
         }
         else
            activeScripts.dashboardTweaks = false;

         if (getSetting("extensions.MissingE.askTweaks.enabled",1) == 1) {
            needUI = true;
            needUIdraggable = true;
            injectStyles.push({file: data.url("core/askTweaks/askTweaks.css")});
            injectScripts.push(data.url("core/askTweaks/askTweaks.js"));
            activeScripts.askTweaks = true;
         }
         else
            activeScripts.askTweaks = false;
      }
      if (MissingE.isTumblrURL(message.url, ["askForm"])) {
         if (getSetting("extensions.MissingE.askTweaks.enabled",1) == 1) {
            /* Don't inject script. Taken care of by a page mod */
            activeScripts.askTweaks = true;
         }
         else
            activeScripts.askTweaks = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url,
                               ["post",
                                "reblog",
                                "messages",
                                "drafts"])) {
         if (getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1) {
            needUI = true;
            needUIresizable = true;
            injectStyles.push({file: data.url("core/postingTweaks/postingTweaks.css")});
            injectScripts.push(data.url("core/postingTweaks/postingTweaks.js"));
            activeScripts.postingTweaks = true;
         }
         else
            activeScripts.postingTweaks = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["reblog"])) {
         if (getSetting("extensions.MissingE.betterReblogs.enabled",1) == 1) {
            injectScripts.push(data.url("core/betterReblogs/betterReblogs_fill.js"));
            activeScripts.betterReblogs = true;
            activeScripts.betterReblogs_fill = true;
         }
         else
            activeScripts.betterReblogs = false;
      }
      if (MissingE.isTumblrURL(message.url, ["iframe"]) &&
          !MissingE.isTumblrURL(myWorker.tab.url, ["post", "reblog"])) {
         if (getSetting("extensions.MissingE.gotoDashPost.enabled",1) == 1) {
            activeScripts.gotoDashPost = true;
         }
         else
            activeScripts.gotoDashPost = false;

         if (getSetting("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
             getSetting("extensions.MissingE.reblogYourself.postPage",1) == 1) {
            activeScripts.reblogYourself = true;
         }
         else
            activeScripts.reblogYourself = false;

         if (getSetting("extensions.MissingE.betterReblogs.enabled",1) == 1 &&
             getSetting("extensions.MissingE.betterReblogs.passTags",1) == 1) {
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;

         if (getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1 &&
             getSetting("extensions.MissingE.postingTweaks.subEdit",1)) {
            activeScripts.postingTweaks = true;
         }
         else
            activeScripts.postingTweaks = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url,
                               ["dashboard",
                                "blog"])) {
         if (getSetting("extensions.MissingE.replyReplies.enabled",1) == 1) {
            injectStyles.push({code: "#posts .notification .notification_type_icon { background-image:url('" + data.url('core/replyReplies/notification_icons.png') + "') !important; } #posts ol.notes .notification_type_icon { background-image:url('" + data.url('core/replyReplies/notes_icons.png') + "') !important; }"}); 
            injectStyles.push({file: data.url("core/replyReplies/replyReplies.css")});
            injectScripts.push(data.url("core/replyReplies/replyReplies.js"));
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = false;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["reply"])) {
         if (getSetting("extensions.MissingE.replyReplies.enabled",1) == 1) {
            injectScripts.push(data.url("core/replyReplies/replyReplies_fill.js"));
            activeScripts.replyReplies = true;
            activeScripts.replyReplies_fill = true;
         }
         else
            activeScripts.replyReplies = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["following"])) {
         if (getSetting("extensions.MissingE.postCrushes.enabled",1) == 1) {
            injectScripts.push(data.url("core/postCrushes/postCrushes.js"));
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = false;
         }
         else
            activeScripts.postCrushes = false;

         if (getSetting("extensions.MissingE.magnifier.enabled",1) == 1) {
            activeScripts.magnifier = true;
            injectStyles.push({file: data.url("core/magnifier/magnifier.css")});
            injectScripts.push(data.url("core/magnifier/magnifier.js"));
         }
         else
            activeScripts.magnifier = false;

      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["crushes"])) {
         if (getSetting("extensions.MissingE.postCrushes.enabled",1) == 1) {
            injectScripts.push(data.url("core/postCrushes/postCrushes_fill.js"));
            activeScripts.postCrushes = true;
            activeScripts.postCrushes_fill = true;
         }
         else
            activeScripts.postCrushes = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url,
                      ["dashboard",
                       "blog",
                       "likes",
                       "tagged",
                       "messages"])) {
         if (getSetting("extensions.MissingE.timestamps.enabled",1) == 1) {
            injectScripts.push(data.url("core/timestamps/timestamps.js"));
            activeScripts.timestamps = true;
         }
         else
            activeScripts.timestamps = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url,
                      ["dashboard",
                       "blog",
                       "likes",
                       "tagged"])) {
         if (getSetting("extensions.MissingE.betterReblogs.enabled",1) == 1) {
            if (getSetting("extensions.MissingE.betterReblogs.quickReblog",0) == 1) {
               zindexFix = true;
            }
            injectStyles.push({file: data.url("core/betterReblogs/quickReblog.css")});
            injectScripts.push(data.url("core/betterReblogs/betterReblogs_dash.js"));
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;

         if (getSetting("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
             getSetting("extensions.MissingE.reblogYourself.dashboard",1) == 1) {
            injectScripts.push(data.url("core/reblogYourself/reblogYourself_dash.js"));
            activeScripts.reblogYourself = true;
         }
         else
            activeScripts.reblogYourself = false;
      }

      if (message.isFrame &&
          (activeScripts.gotoDashPost || activeScripts.reblogYourself)) {
         injectStyles.push({file: data.url("core/common/widenIframe.css")});
      }

      if (activeScripts.magnifier ||
          (activeScripts.askTweaks &&
           getSetting("extensions.MissingE.askTweaks.askDash",0) == 1)) {
         zindexFix = true;
         injectStyles.push({file: data.url("lib/facebox/facebox.css")});
         var pos = injectScripts.indexOf(data.url("core/utils.js"));
         injectScripts.splice(pos+1, 0, data.url("lib/facebox/facebox.js"));
      }

      if (!MissingE.isTumblrURL(message.url, ["askForm"])) {
         var pos = injectScripts.indexOf(data.url("core/utils.js"));
         injectScripts.splice(pos+1, 0, data.url("core/common/ajaxEvents.js"));
      }

      // In reverse order of requirements
      if (needUI) {
         if (needUIresizable) {
            injectScripts.unshift(data.url("lib/jquery.ui.resizable.min.js"));
         }
         if (needUIsortable) {
            injectScripts.unshift(data.url("lib/jquery.ui.sortable.min.js"));
         }
         if (needUIdraggable) {
            injectScripts.unshift(data.url("lib/jquery.ui.draggable.min.js"));
         }
         injectScripts.unshift(data.url("lib/jquery.ui.mouse.min.js"));
         injectScripts.unshift(data.url("lib/jquery.ui.widget.min.js"));
         injectScripts.unshift(data.url("lib/jquery.ui.core.min.js"));
      }
      injectScripts.unshift(data.url("jquery-1.5.2.min.js"));
      if (zindexFix) {
         injectScripts.push(data.url("core/common/zindexFix.js"));
      }
      activeScripts.url = message.url;
      activeScripts.isFrame = message.isFrame;
      activeScripts.greeting = "startup";

      if (injectSlimSidebar) {
         injectStyles.push({file: data.url("core/sidebarTweaks/slimSidebar.css")});
      }
      var loadStyles = '';
      if (injectStyles.length > 0) {
         loadStyles = '(function($){' +
            'var head = $("head");';
         for (i=0; i<injectStyles.length; i++) {
            if (injectStyles[i].file) {
               loadStyles += 'head.append(\'<link rel="stylesheet" ' +
                  'type="text/css" href="' + injectStyles[i].file + '" />\');';
            }
            else if (injectStyles[i].code) {
               loadStyles += 'head.append(\'<style type="text/css">' +
                  injectStyles[i].code.replace(/'/g,"\\'") + '</style>\');';
            }
         }
         loadStyles += '})(jQuery);';
      }
      myWorker.tab.attach({
         contentScriptFile: injectScripts,
         contentScript: loadStyles,
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
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/common/menuButton.js"),
                       data.url("whoami.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
      });
   }
});

pageMod.PageMod({
   include: ["http://www.tumblr.com/ask_form/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/utils.js"),
                       data.url("core/askTweaks/askTweaks.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         if (getSetting("extensions.MissingE.askTweaks.enabled",1) == 1) {
            handleMessage(data, this);
         }
      });
   }
});

pageMod.PageMod({
   include: ["http://www.tumblr.com/dashboard/iframe*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/localizations.js"),
                       data.url("core/utils.js"),
                       data.url("core/betterReblogs/betterReblogs_post.js"),
                       data.url("core/gotoDashPost/gotoDashPost.js"),
                       data.url("core/reblogYourself/reblogYourself_post.js"),
                       data.url("core/postingTweaks/postingTweaks_post.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         var answer = data.greeting !== 'settings';
         if (data.greeting === 'settings') {
            answer = !(/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(this.tab.url)) &&
               !(/http:\/\/www\.tumblr\.com\/edit\/[0-9]+/.test(this.tab.url)) &&
               !(/http:\/\/www\.tumblr\.com\/new\//.test(this.tab.url)) &&
               ((data.component === 'betterReblogs' &&
                 data.subcomponent === 'post' &&
                 getSetting("extensions.MissingE.betterReblogs.enabled",1) == 1 &&
                 getSetting("extensions.MissingE.betterReblogs.passTags",1) == 1) ||
                (data.component === 'gotoDashPost' &&
                 getSetting("extensions.MissingE.gotoDashPost.enabled",1) == 1) ||
                (data.component === 'reblogYourself' &&
                 data.subcomponent === 'post' &&
                 getSetting("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
                 getSetting("extensions.MissingE.reblogYourself.postPage",1) == 1) ||
                (data.component === 'postingTweaks' &&
                 data.subcomponent === 'post' &&
                 getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1 &&
                 getSetting("extensions.MissingE.postingTweaks.subEdit",1) == 1));
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
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/versionCheck.js")],
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
            setSetting('extensions.MissingE.externalVersion', versionInfo[0]);
            if (versionInfo.length > 1) {
               setSetting('extensions.MissingE.externalVersion.link', versionInfo[1]);
            }
            else {
               setSetting('extensions.MissingE.externalVersion.link', '');
            }
         }
      }
   }).get();
}

function fixupSettings() {
   setIntegerPrefType('extensions.MissingE.betterReblogs.quickReblogAcctType',0);
   setIntegerPrefType('extensions.MissingE.postCrushes.crushSize',1);
   setIntegerPrefType('extensions.MissingE.replyReplies.smallAvatars',1);

   moveAllSettings('askFixes','askTweaks');
   moveAllSettings('dashboardFixes','dashboardTweaks');
   moveAllSettings('postingFixes','postingTweaks');
   moveSetting('extensions.MissingE.dashboardTweaks.slimSidebar','extensions.MissingE.sidebarTweaks.slimSidebar');
   moveSetting('extensions.MissingE.dashboardTweaks.followingLink','extensions.MissingE.sidebarTweaks.followingLink');
   collapseSettings('extensions.MissingE.askTweaks.betterAnswers','extensions.MissingE.askTweaks.buttons','extensions.MissingE.askTweaks.tags');
   invertSetting('extensions.MissingE.betterReblogs.noPassTags','extensions.MissingE.betterReblogs.passTags');
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
   setSetting('extensions.MissingE.version',currVersion);
}

onStart(currVersion, prevVersion);
getExternalVersion();
fixupSettings();

console.log("Missing e is running.");
