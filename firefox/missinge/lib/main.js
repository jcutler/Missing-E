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

const requests = require("request");
var pageMod = require("page-mod");
const widgets = require("widget");
var tabs = require("tabs");
var ps = require("preferences-service");
var url = require("url");
var data = require("self").data;
var Request = require("request").Request;
var timer = require("timer");
var widget = null;
/*** NOT READY
const { Cc, Ci, Cu } = require("chrome");
***/
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
var replies = [];
var crushes = [];
var repliesAndCrushesClear;
var fiveMinutes = 300000;
var tenSeconds = 10000;
var extension = {isFirefox: true};
var MissingE = require("utils").utils;
MissingE.locale = require("localizations").locale;
var lang = 'en';

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

repliesAndCrushesClear = timer.setInterval(function() {
   var i;
   for (i=0; i<replies.length; i++) {
      try {
         var url = replies[i].tab.url;
      }
      catch(err) {
         replies.splice(i,1);
         i--;
      }
   }
   for (i=0; i<crushes.length; i++) {
      try {
         var url = crushes[i].tab.url;
      }
      catch(err) {
         crushes.splice(i,1);
         i--;
      }
   }
}, fiveMinutes);

cacheClear = timer.setInterval(function() {
   cache = {};
   cacheElements = 0;
   permissionCache = {};
}, fiveMinutes);

clearQueues = timer.setInterval(function() {
   if (activeAjax == 0) {
      if (numSleeping !== 0) {
         MissingE.debug(numSleeping + " still sleeping");
      }
      if (waitQueue.length > 0) {
         MissingE.debug(waitQueue.length + " still queued");
      }
   }
}, tenSeconds);

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

function getAllSettings(getStale) {
   var settings = {};
   settings.greeting = "all-settings";
   settings["MissingE_hideWidget"] = getSetting("extensions.MissingE.hideWidget", 0);
   for (i=0; i<componentList.length; i++) {
      settings["MissingE_" + componentList[i] + "_enabled"] =
         getSetting("extensions.MissingE." + componentList[i] + ".enabled", 1);
   }
   settings.MissingE_massEditor_showNotes = getSetting("extensions.MissingE.massEditor.showNotes",1);
   settings.MissingE_safeDash_photosetAll = getSetting("extensions.MissingE.safeDash.photosetAll",0);
   settings.MissingE_safeDash_keyboardShortcut = getSetting("extensions.MissingE.safeDash.keyboardShortcut",1);
   settings.MissingE_askTweaks_scroll = getSetting("extensions.MissingE.askTweaks.scroll",1);
   settings.MissingE_askTweaks_betterAnswers = getSetting("extensions.MissingE.askTweaks.betterAnswers",0);
   settings.MissingE_askTweaks_photoReplies = getSetting("extensions.MissingE.askTweaks.photoReplies",1);
   settings.MissingE_askTweaks_submissionControls = getSetting("extensions.MissingE.askTweaks.submissionControls",1);
   settings.MissingE_askTweaks_tagAsker = getSetting("extensions.MissingE.askTweaks.tagAsker",1);
   settings.MissingE_askTweaks_defaultTags = getSetting("extensions.MissingE.askTweaks.defaultTags",'');
   settings.MissingE_askTweaks_askDash = getSetting("extensions.MissingE.askTweaks.askDash",0);
   settings.MissingE_askTweaks_massDelete = getSetting("extensions.MissingE.askTweaks.massDelete",1);
   settings.MissingE_askTweaks_smallFanMail = getSetting("extensions.MissingE.askTweaks.smallFanMail",0);
   settings.MissingE_askTweaks_allFanMail = getSetting("extensions.MissingE.askTweaks.allFanMail",0);
   settings.MissingE_bookmarker_format = getSetting("extensions.MissingE.bookmarker.format",MissingE.defaultFormat);
   settings.MissingE_bookmarker_addBar = getSetting("extensions.MissingE.bookmarker.addBar",1);
   settings.MissingE_bookmarker_keyboardShortcut = getSetting("extensions.MissingE.bookmarker.keyboardShortcut",1);
   settings.MissingE_dashboardTweaks_reblogQuoteFit = getSetting("extensions.MissingE.dashboardTweaks.reblogQuoteFit",1);
   settings.MissingE_dashboardTweaks_wrapTags = getSetting("extensions.MissingE.dashboardTweaks.wrapTags",1);
   settings.MissingE_dashboardTweaks_replaceIcons = getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1);
   settings.MissingE_dashboardTweaks_textControls = getSetting("extensions.MissingE.dashboardTweaks.textControls",0);
   settings.MissingE_dashboardTweaks_smallIcons = getSetting("extensions.MissingE.dashboardTweaks.smallIcons",0);
   settings.MissingE_dashboardTweaks_postLinks = getSetting("extensions.MissingE.dashboardTweaks.postLinks",1);
   settings.MissingE_dashboardTweaks_reblogReplies = getSetting("extensions.MissingE.dashboardTweaks.reblogReplies",0);
   settings.MissingE_dashboardTweaks_widescreen = getSetting("extensions.MissingE.dashboardTweaks.widescreen",0);
   settings.MissingE_dashboardTweaks_queueArrows = getSetting("extensions.MissingE.dashboardTweaks.queueArrows",1);
   settings.MissingE_dashboardTweaks_noExpandAll = getSetting("extensions.MissingE.dashboardTweaks.noExpandAll",0);
   settings.MissingE_dashboardTweaks_massDelete = getSetting("extensions.MissingE.dashboardTweaks.massDelete",1);
   settings.MissingE_dashboardTweaks_randomQueue = getSetting("extensions.MissingE.dashboardTweaks.randomQueue",1);
   settings.MissingE_dashboardTweaks_sortableNotes = getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1);
   settings.MissingE_dashboardTweaks_notePreview = getSetting("extensions.MissingE.dashboardTweaks.notePreview",1);
   settings.MissingE_dashboardTweaks_previewRetries = getSetting("extensions.MissingE.dashboardTweaks.previewRetries",MissingE.defaultRetries);
   settings.MissingE_dashboardTweaks_simpleHighlight = getSetting("extensions.MissingE.dashboardTweaks.simpleHighlight",0);
   settings.MissingE_dashboardTweaks_pagedNav = getSetting("extensions.MissingE.dashboardTweaks.pagedNav",0);
   settings.MissingE_dashboardTweaks_keyboardShortcut = getSetting("extensions.MissingE.dashboardTweaks.keyboardShortcut",1);
   settings.MissingE_sidebarTweaks_retries = getSetting("extensions.MissingE.sidebarTweaks.retries",MissingE.defaultRetries);
   settings.MissingE_sidebarTweaks_addSidebar = getSetting("extensions.MissingE.sidebarTweaks.addSidebar",0);
   settings.MissingE_sidebarTweaks_slimSidebar = getSetting("extensions.MissingE.sidebarTweaks.slimSidebar",0);
   settings.MissingE_sidebarTweaks_accountNum = getSetting("extensions.MissingE.sidebarTweaks.accountNum",0);
   settings.MissingE_sidebarTweaks_showTags = getSetting("extensions.MissingE.sidebarTweaks.showTags",0);
   settings.MissingE_magnifier_magnifyAvatars = getSetting("extensions.MissingE.magnifier.magnifyAvatars",0);
   settings.MissingE_dashLinksToTabs_newPostTabs = getSetting("extensions.MissingE.dashLinksToTabs.newPostTabs",1);
   settings.MissingE_dashLinksToTabs_sidebar = getSetting("extensions.MissingE.dashLinksToTabs.sidebar",0);
   settings.MissingE_dashLinksToTabs_reblogLinks = getSetting("extensions.MissingE.dashLinksToTabs.reblogLinks",0);
   settings.MissingE_dashLinksToTabs_editLinks = getSetting("extensions.MissingE.dashLinksToTabs.editLinks",0);
   settings.MissingE_timestamps_retries = getSetting("extensions.MissingE.timestamps.retries",MissingE.defaultRetries);
   settings.MissingE_timestamps_format = getSetting("extensions.MissingE.timestamps.format",MissingE.defaultFormat);
   settings.MissingE_postingTweaks_photoReplies = getSetting("extensions.MissingE.postingTweaks.photoReplies",1);
   settings.MissingE_postingTweaks_addUploader = getSetting("extensions.MissingE.postingTweaks.addUploader",1);
   settings.MissingE_postingTweaks_quickButtons = getSetting("extensions.MissingE.postingTweaks.quickButtons",1);
   settings.MissingE_postingTweaks_blogSelect = getSetting("extensions.MissingE.postingTweaks.blogSelect",0);
   settings.MissingE_postingTweaks_subEdit = getSetting("extensions.MissingE.postingTweaks.subEdit",1);
   settings.MissingE_postingTweaks_subEditRetries = getSetting("extensions.MissingE.postingTweaks.subEditRetries",MissingE.defaultRetries);
   settings.MissingE_postingTweaks_tagQueuedPosts = getSetting("extensions.MissingE.postingTweaks.tagQueuedPosts",0);
   settings.MissingE_postingTweaks_queueTags = getSetting("extensions.MissingE.postingTweaks.queueTags",'');
   settings.MissingE_postingTweaks_showAnswers = getSetting("extensions.MissingE.postingTweaks.showAnswers",0);
   settings.MissingE_postingTweaks_facebookOff = getSetting("extensions.MissingE.postingTweaks.facebookOff",0);
   settings.MissingE_postingTweaks_smartRedirect = getSetting("extensions.MissingE.postingTweaks.smartRedirect",0);
   settings.MissingE_reblogYourself_postPage = getSetting("extensions.MissingE.reblogYourself.postPage",1);
   settings.MissingE_reblogYourself_dashboard = getSetting("extensions.MissingE.reblogYourself.dashboard",1);
   settings.MissingE_reblogYourself_retries = getSetting("extensions.MissingE.reblogYourself.retries",MissingE.defaultRetries);
   settings.MissingE_postCrushes_prefix = getSetting("extensions.MissingE.postCrushes.prefix","Tumblr Crushes:");
   settings.MissingE_postCrushes_crushSize = getSetting("extensions.MissingE.postCrushes.crushSize",1);
   settings.MissingE_postCrushes_addTags = getSetting("extensions.MissingE.postCrushes.addTags",1);
   settings.MissingE_postCrushes_showPercent = getSetting("extensions.MissingE.postCrushes.showPercent",1);
   settings.MissingE_postCrushes_newTab = getSetting("extensions.MissingE.postCrushes.newTab",1);
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
   settings.MissingE_betterReblogs_quickReblogForceFacebook = getSetting("extensions.MissingE.betterReblogs.quickReblogForceFacebook",'default');
   settings.MissingE_betterReblogs_quickReblogCaption = getSetting("extensions.MissingE.betterReblogs.quickReblogCaption",1);
   settings.MissingE_betterReblogs_fullText = getSetting("extensions.MissingE.betterReblogs.fullText",0);
   settings.MissingE_betterReblogs_tagReblogs = getSetting("extensions.MissingE.betterReblogs.tagReblogs",0);
   settings.MissingE_betterReblogs_reblogTags = getSetting("extensions.MissingE.betterReblogs.reblogTags",'');
   settings.MissingE_betterReblogs_reblogAsks = getSetting("extensions.MissingE.betterReblogs.reblogAsks",0);
   settings.MissingE_betterReblogs_quickKeyboardShortcut = getSetting("extensions.MissingE.betterReblogs.quickKeyboardShortcut",1);
   settings.MissingE_betterReblogs_askRetries = getSetting("extensions.MissingE.betterReblogs.askRetries",MissingE.defaultRetries);
   settings.MissingE_version = getSetting("extensions.MissingE.version",'');
   settings.MissingE_previousVersion = getSetting('extensions.MissingE.previousVersion','');

   if (getStale) {
      settings.MissingE_askFixes_scroll = getSetting("extensions.MissingE.askFixes.scroll",1);
      settings.MissingE_askFixes_betterAnswers = getSetting("extensions.MissingE.askFixes.betterAnswers",0);
      settings.MissingE_askFixes_tagAsker = getSetting("extensions.MissingE.askFixes.tagAsker",1);
      settings.MissingE_askFixes_defaultTags = getSetting("extensions.MissingE.askFixes.defaultTags",'');
      settings.MissingE_askFixes_askDash = getSetting("extensions.MissingE.askFixes.askDash",0);
      settings.MissingE_askFixes_massDelete = getSetting("extensions.MissingE.askFixes.massDelete",1);
      settings.MissingE_dashboardFixes_reblogQuoteFit = getSetting("extensions.MissingE.dashboardFixes.reblogQuoteFit",1);
      settings.MissingE_dashboardFixes_wrapTags = getSetting("extensions.MissingE.dashboardFixes.wrapTags",1);
      settings.MissingE_dashboardFixes_replaceIcons = getSetting("extensions.MissingE.dashboardFixes.replaceIcons",1);
      settings.MissingE_dashboardFixes_postLinks = getSetting("extensions.MissingE.dashboardFixes.postLinks",1);
      settings.MissingE_dashboardFixes_reblogReplies = getSetting("extensions.MissingE.dashboardFixes.reblogReplies",0);
      settings.MissingE_dashboardFixes_widescreen = getSetting("extensions.MissingE.dashboardFixes.widescreen",0);
      settings.MissingE_dashboardFixes_queueArrows = getSetting("extensions.MissingE.dashboardFixes.queueArrows",1);
      settings.MissingE_dashboardFixes_massDelete = getSetting("extensions.MissingE.dashboardFixes.massDelete",1);
      settings.MissingE_dashboardFixes_randomQueue = getSetting("extensions.MissingE.dashboardFixes.randomQueue",1);
      settings.MissingE_dashboardFixes_sortableNotes = getSetting("extensions.MissingE.dashboardFixes.sortableNotes",1);
      settings.MissingE_postingFixes_photoReplies = getSetting("extensions.MissingE.postingFixes.photoReplies",1);
      settings.MissingE_postingFixes_addUploader = getSetting("extensions.MissingE.postingFixes.addUploader",1);
      settings.MissingE_postingFixes_quickButtons = getSetting("extensions.MissingE.postingFixes.quickButtons",1);
      settings.MissingE_postingFixes_blogSelect = getSetting("extensions.MissingE.postingFixes.blogSelect",0);
      settings.MissingE_postingFixes_subEdit = getSetting("extensions.MissingE.postingFixes.subEdit",1);
      settings.MissingE_postingFixes_subEditRetries = getSetting("extensions.MissingE.postingFixes.subEditRetries",MissingE.defaultRetries);
      settings.MissingE_postingFixes_tagQueuedPosts = getSetting("extensions.MissingE.postingFixes.tagQueuedPosts",0);
      settings.MissingE_postingFixes_queueTags = getSetting("extensions.MissingE.postingFixes.queueTags",'');
   }
   return settings;
}

function collapseSettings(toPref, oldA, oldB) {
   if ((ps.isSet(oldA) || ps.isSet(oldB)) &&
       !ps.isSet(toPref)) {
      MissingE.log('"' + oldA + '" and "' + oldB + '" depracated. Moving settings to "' + toPref + '"');
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

function clearSetting(pref) {
   if (ps.isSet(pref)) {
      ps.reset(pref);
   }
}

function moveSetting(oldpref,newpref) {
   if (ps.isSet(oldpref) && !ps.isSet(newpref)) {
      MissingE.log('"' + oldpref + '" depracated. Moving setting to "' + newpref + '"');
      ps.set(newpref,ps.get(oldpref,0));
      ps.reset(oldpref);
   }
   else if (ps.isSet(oldpref)) {
      ps.reset(oldpref);
   }
}

function moveAllSettings(oldgroup, newgroup) {
   var allsettings = getAllSettings(true);
   var re = new RegExp("^MissingE_" + oldgroup + "_");
   for (i in allsettings) {
      if (allsettings.hasOwnProperty(i) &&
          re.test(i)) {
         var oldpref = 'extensions.' + i.replace(/_/g,'.');
         if (ps.isSet(oldpref)) {
            var newpref = 'extensions.' + i.replace(re,'MissingE_' + newgroup + '_').replace(/_/g,'.');
            MissingE.log('"' + oldpref + '" depracated. Moving setting to "' + newpref + '"');
            if (!ps.isSet(newpref)) {
               ps.set(newpref, ps.get(oldpref,0));
            }
            ps.reset(oldpref);
         }
      }
   }
}

function invertSetting(oldpref,newpref) {
   if (ps.isSet(oldpref) && !ps.isSet(newpref)) {
      MissingE.log('"' + oldpref + '" changed to inverted setting "' + newpref + '"');
      ps.set(newpref,1-ps.get(oldpref,0));
      ps.reset(oldpref);
   }
   else if (ps.isSet(oldpref)) {
      ps.reset(oldpref);
   }
}

function settingChange(pref, from, to) {
   var re = new RegExp("[" + from + "]", "g");
   if (ps.isSet(pref)) {
      var val = ps.get(pref);
      var newval = val.replace(re, to);
      if (newval !== val) {
         MissingE.log('"' + pref + '" changed from \'' + val + '\' to \'' + newval + '\'');
        ps.set(pref,newval);
      }
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

function boolSettingToInt(pref) {
   if (ps.isSet(pref) &&
       typeof ps.get(pref, false) === "boolean") {
      var val = ps.get(pref, false) ? 1 : 0;
      ps.reset(pref);
      ps.set(pref,val);
   }
}

function closeTab(url) {
   for each (var tab in tabs) {
      var thisURL = tab.url.replace(/#.*$/,'');
      if (thisURL === url) {
         tab.close();
      }
   }
}

function openSettings() {
   closeTab(data.url("core/options.html"));
   tabs.open({url: data.url("core/options.html")});
}

function toggleWidget() {
   if (getSetting("extensions.MissingE.hideWidget",0) === false ||
       getSetting("extensions.MissingE.hideWidget",0) === 0) {
      if (!widget) {
         widget = widgets.Widget({
            label: "Missing e",
            id: "missinge",
            tooltip: "Missing e Settings",
            contentURL: data.url("widget.html"),
            onClick: function() {
               openSettings();
            }
         });
      }
   }
   else if (widget) {
      widget.destroy();
      widget = null;
   }
}

function exportOptionsXML(theWorker) {
   theWorker.postMessage({greeting: "exportOptions", url: "http://tools.missing-e.com/settings?" + parameterize(createOptionParams())});
}

function isInternalSetting(setting) {
   return !/^MissingE_/.test(setting) ||
          setting === "MissingE_version" ||
          setting === "MissingE_previousVersion" ||
          /MissingE_externalVersion/.test(setting) ||
          setting === "MissingE_compatCheck" ||
          setting === "MissingE_lastUpdateCheck" ||
          setting === "MissingE_konami_active" ||
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

function createOptionString() {
   var i, result = "";
   var opts = createOptionParams();
   for (i in opts) {
      if (opts.hasOwnProperty(i)) {
         result += i + ": \"" + opts[i] + "\"\n";
      }
   }
   return result;
}

function receiveOptions(message, theWorker) {
   var changed, set, reset;
   changed = set = reset = 0;
   var settings = message.data;
   var allSettings = getAllSettings(true);
   var currSettings = getAllSettings(true);
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
            else if (typeof allSettings[i] !== "undefined") {
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
               MissingE.debug(i + " [" + old + " => '" +
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
      toggleWidget();
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
      MissingE.debug("Cache entry does not have tags");
      return false;
   }
   var tags = stamp.tags;
   if (!tags) {
      tags = [];
   }
   theWorker.postMessage({greeting: "tags", success: true, data: tags,
                          extensionURL: data.url("")});
   return true;
}

function doVimeoPreview(stamp, id, theWorker) {
   var failMsg = {greeting: "preview", success: true, pid: id,
                  data: [data.url('core/dashboardTweaks/black.png')],
                  type: "video"};
   if (!stamp.videoThumbs ||
       stamp.videoThumbs.length !== 1 ||
       !/vimeo:/.test(stamp.videoThumbs[0])) {
      try {
         theWorker.postMessage(failMsg);
      }
      catch (e) {}
      return true;
   }
   var vimeoId = stamp.videoThumbs[0].match(/vimeo:(.*)/)[1];
   Request({
      url: "http://vimeo.com/api/v2/video/" + vimeoId + ".xml",
      headers: {targetId: id},
      onComplete: function(response) {
         var data = response.text.match(/<thumbnail_small>([^<]*)/);
         var closed = false;
         try {
            var tab = theWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            MissingE.debug("vimeo request (" + this.headers.targetId + ") failed");
            if (!closed) { theWorker.postMessage(failMsg); }
            return;
         }
         if (response.status !== 200 || !data) {
            MissingE.debug("vimeo request (" + this.headers.targetId + ") failed");
            if (!closed) { theWorker.postMessage(failMsg); }
            return;
         }

         var theEntry, isNew;
         if (data && data.length > 0) {
            data = data[1];
         }
         else if (!closed) {
            theWorker.postMessage(failMsg);
            return;
         }
         if ((theEntry = cache[id])) {
            MissingE.debug("Saving vimeo thumb " + id + " to cache (HIT)");
            isNew = false;
         }
         else {
            MissingE.debug("Saving vimeo thumb " + id + " to cache (MISS)");
            cacheElements++;
            theEntry = {};
            isNew = false;
         }
         theEntry.videoThumbs = [data];
         if (isNew) {
            cache[id] = theEntry;
         }
         if (!closed) {
            theWorker.postMessage({greeting: "preview", success: true,
                                   pid: this.headers.targetId, data: [data],
                                   type: "video"});
         }
         return;
      }
   }).get();
}

function doNotes(count, id, theWorker) {
   theWorker.postMessage({greeting: "notes", success: true, pid: id,
                          data: count});
   return true;
}

function doPreview(stamp, id, theWorker) {
   var i, type;
   if (!stamp.photos && !stamp.videoThumbs) {
      MissingE.debug("Cache entry does not have photos");
      return false;
   }
   if (stamp.photos) { type = "photo"; }
   else if (stamp.videoThumbs) { type = "video"; }
   var photos = [];
   for (i=0; stamp.photos && i<stamp.photos.length; i++) {
      photos.push(stamp.photos[i].replace(/\d+\.([a-z]+)$/,"100.$1"));
   }
   for (i=0; stamp.videoThumbs && i<stamp.videoThumbs.length; i++) {
      photos.push(stamp.videoThumbs[i]);
   }
   if (photos.length === 0) {
      photos.push(data.url('core/dashboardTweaks/black.png'));
   }
   if (/vimeo:/.test(photos[0])) {
      MissingE.debug("Preview image is " + photos[0] + ". Accessing Vimeo API.");
      doVimeoPreview(stamp, id, theWorker);
      return true;
   }
   else {
      theWorker.postMessage({greeting: "preview", success: true, pid: id, data: photos, type: type});
      return true;
   }

   return true;
}

function doTimestamp(stamp, id, theWorker) {
   if (!stamp.timestamp) {
      MissingE.debug("Cache entry does not have timestamp");
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
      MissingE.debug("Cache entry does not have reblog key.");
      return false;
   }
   var key = stamp.reblog_key;
   var name = stamp.name;
   theWorker.postMessage({greeting: type, pid: id, success: true, data: key, name: name});
   return true;
}

function queueAjax(details) {
   waitQueue.push(details);
   MissingE.debug("Queueing " + details.type + " request. " + (waitQueue.length) + " in queue");
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
      MissingE.debug("Dequeueing " + call.type + " request. " + (waitQueue.length) + " in queue");
      runItem(call);
   }
}

function saveCache(id, entry) {
   var theEntry;
   var isNew = true;
   if ((theEntry = cache[id])) {
      MissingE.debug("Saving " + id + " to cache (HIT)");
      isNew = false;
   }
   else {
      MissingE.debug("Saving " + id + " to cache (MISS)");
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
             i == "publishStamp" ||
             (i == "name" && entry[i] != "")) {
            theEntry[i] = entry[i];
         }
         else if (i == "videoThumbs" &&
                  !theEntry.hasOwnProperty(i)) {
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
      MissingE.debug(type + " request(" + id + ") has cache entry.");
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
   else if (call.type === "notes") {
      startNotes(call.message, call.worker);
   }
   else if (call.type === "preview") {
      startPreview(call.message, call.worker);
   }
}

function wakeById(id) {
   var i,j;
   for (i=0; activeRequests[id] && i<activeRequests[id].length; i++) {
      var call;
      if ((call = activeRequests[id][i])) {
         delete onHold[call.type + call.message.pid];
         numSleeping--;
         MissingE.debug("Selectively waking " + call.type + " request (" + call.message.pid + "). " + numSleeping + " still asleep");
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
      MissingE.debug("Sleeping " + details.type + " request (" + details.message.pid +
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
            MissingE.debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 ||
             !(/<input[^>]*name="post\[date\]"[^>]*>/.test(response.text))) {
            if (closed) {
               MissingE.debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doFunc, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  MissingE.debug("Retry " + type + " request (" + this.headers.targetId + ")");
                  doAskAjax('http://www.tumblr.com/edit/',
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, type, doFunc);
               }
               else {
                  MissingE.debug(type + " request (" + this.headers.targetId + ") failed");
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
               MissingE.debug(type + " request (" + this.headers.targetId + ") failed");
               dequeueAjax(this.headers.targetId);
               myWorker.postMessage(failMsg);
               return;
            }

            var stamp = MissingE.buildTimestamp(txt);

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

function parseRSS(data, forceType) {
   var info = {};
   var i;
   var tags = data.match(/<category>[^<]*<\/category>/g);
   if (!tags) { tags = []; }
   for (i=0; i<tags.length; i++) {
      tags[i] = tags[i].replace(/^<category>/,'')
                     .replace(/<\/category>$/,'');
   }
   info.tags = tags;

   var pubTime = data.match(/<pubDate>([^<]*)<\/pubDate>/);
   if (pubTime && pubTime.length > 1) {
      info.publishStamp = (new Date(pubTime[1])).valueOf()/1000;
   }

   var photos = [];
   var desc = data.match(/<description>&lt;img[^<]*/);
   if (desc) {
      desc = desc[0].replace(/^<description>/,'');
      while (/^&lt;img/.test(desc)) {
         var img = desc.match(/src="([^"]*)"/);
         if (img && img.length > 1) {
            photos.push(img[1].replace(/http:\/\/[0-9]+\./,'http://'));
         }
         desc = desc.replace(/^&lt;img[^&]*(&gt;|[^&]+)+/,'');
         desc = desc.replace(/^(&lt;br\/&gt;|\s)+/,'');
      }
   }
   if (photos.length > 0) {
      info.photos = photos;
   }

   var videoThumbs = [];
   var youtube = data.match(/<description>&lt;iframe[^&]*src="http:\/\/www\.youtube\.com\/embed\/([^\/\?]*)/);
   var vimeo = data.match(/<description>&lt;iframe[^&]*src="http:\/\/player.vimeo.com\/video\/([^\/\?"'%]*)/);
   var tumblr;
   if (/<description>&lt;span id="video_player/.test(data)) {
      tumblr = data.match(/poster=(http[^'"\(\)&]*)/);
      tumblr = tumblr[0].replace(/poster=/,'').split(',');
   }
   if (youtube && youtube.length > 1) {
      for (i=0; i<=3; i++) {
         videoThumbs.push('http://img.youtube.com/vi/' + youtube[1] + '/' +
                               i + '.jpg');
      }
   }
   else if (vimeo && vimeo.length > 1) {
      videoThumbs.push('vimeo:' + vimeo[1]);
   }
   else if (tumblr && tumblr.length > 1) {
      for (i=1; i<tumblr.length; i++) {
         videoThumbs.push(tumblr[i].replace(/%3A/gi,':').replace(/%2F/gi,'/'));
      }
   }
   if (videoThumbs.length > 0 || forceType === "video") {
      info.videoThumbs = videoThumbs;
   }

   return info;
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
            MissingE.debug("tags request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !goodData) {
            if (closed) {
               MissingE.debug("Stop tags request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("tags", this.headers.targetId, myWorker,
                           doTags, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  MissingE.debug("Retry tags request (" + this.headers.targetId + ")");
                  doTagsAjax(this.url,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit);
               }
               else {
                  MissingE.debug("tags request (" + this.headers.targetId + ") failed");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var info = parseRSS(response.text);
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doTags(info, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function doNotesAjaxMultiStep(baseURL, pid, count, myWorker, retries) {
   var failMsg = {greeting:"notes", success:false, pid:pid};
   Request({
      url: baseURL + '/post/' + pid + "/rss",
      headers: {tryCount: count,
                retryLimit: retries,
                baseURL: baseURL,
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
            MissingE.debug("notes 1st request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !goodData) {
            if (closed) {
               MissingE.debug("Stop notes 1st request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (!cacheServe("notes 1st", this.headers.targetId, myWorker,
                            function(){return true;}, true, true)) {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  MissingE.debug("Retry notes 1st request (" + this.headers.targetId + ")");
                  doNotesAjaxMultiStep(this.headers.baseURL,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit);
               }
               else {
                  MissingE.debug("notes 1st request (" + this.headers.targetId + ") failed");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var info = parseRSS(response.text);
            saveCache(this.headers.targetId, info);
            /** Do not dequeue here, FF implementation considers both steps
                as one startAjax event
             **/
            if (!closed) {
               doNotesAjax(this.headers.baseURL, this.headers.targetId,
                           0, myWorker, this.headers.retryLimit);
            }
         }
      }
   }).get();
}

function doNotesAjax(baseURL, pid, count, myWorker, retries) {
   if (!cache.hasOwnProperty(pid) ||
       !cache[pid].hasOwnProperty("publishStamp")) {
      MissingE.debug("AJAX notes 1st request (" + pid + ")");
      doNotesAjaxMultiStep(baseURL, pid, 0, myWorker, retries);
      return;
   }
   var failMsg = {greeting:"notes", success:false, pid:pid};
   Request({
      url: baseURL + '/archive?before_time=' + (cache[pid].publishStamp+1),
      headers: {tryCount: count,
                retryLimit: retries,
                baseURL: baseURL,
                targetId: pid},
      onComplete: function(response) {
         var data = response.text.replace(/\n/g,' ');
         var re = new RegExp('< *a [^>]*id="post_' + this.headers.targetId + '".*<\/a>');
         var postInfo = re.exec(data);
         var closed = false;
         try {
            var tab = myWorker.tab;
         }
         catch (err) {
            closed = true;
         }
         if (response.status === 404) {
            MissingE.debug("notes request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !postInfo) {
            if (closed) {
               MissingE.debug("Stop notes request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (this.headers.tryCount <= this.headers.retryLimit) {
               MissingE.debug("Retry notes request (" + this.headers.targetId + ")");
               doNotesAjax(this.headers.baseURL, this.headers.targetId,
                           (this.headers.tryCount + 1), myWorker,
                           this.headers.retryLimit);
            }
            else {
               MissingE.debug("notes request (" + this.headers.targetId + ") failed");
               dequeueAjax(this.headers.targetId);
               myWorker.postMessage(failMsg);
            }
         }
         else {
            var noteCount = postInfo[0].match(/<\s*div\s+class="notes"\s*>[^<\d]*([\d\., ]+)[^<\d]*/);
            if (!noteCount || noteCount.length < 2) {
               noteCount = "";
            }
            else {
               noteCount = noteCount[1];
            }
            noteCount = noteCount.replace(/^\s+/,'').replace(/\s+$/,'').replace(/\s/g,',');
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doNotes(noteCount, this.headers.targetId, myWorker);
            }
         }
      }
   }).get();
}

function doPreviewAjax(url, pid, count, type, myWorker, retries) {
   var failMsg = {greeting:"preview", success:false, pid:pid};
   Request({
      url: url,
      headers: {tryCount: count,
                retryLimit: retries,
                targetId: pid,
                type: type},
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
            MissingE.debug("preview request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !goodData) {
            if (closed) {
               MissingE.debug("Stop preview request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe("preview", this.headers.targetId, myWorker,
                           doPreview, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  MissingE.debug("Retry preview request (" + this.headers.targetId + ")");
                  doPreviewAjax(this.url,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         this.headers.type, myWorker, this.headers.retryLimit);
               }
               else {
                  MissingE.debug("preview request (" + this.headers.targetId + ") failed");
                  dequeueAjax(this.headers.targetId);
                  myWorker.postMessage(failMsg);
               }
            }
         }
         else {
            var info = parseRSS(response.text, this.headers.type);
            saveCache(this.headers.targetId, info);
            dequeueAjax(this.headers.targetId);
            if (!closed) {
               doPreview(info, this.headers.targetId, myWorker);
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
            MissingE.debug(type + " request (" + this.headers.targetId + ") not found");
            dequeueAjax(this.headers.targetId);
            myWorker.postMessage(failMsg);
            return;
         }
         if (response.status != 200 || !ifr || ifr.length === 0) {
            if (closed) {
               MissingE.debug("Stop " + type + " request: Tab closed or changed.");
               dequeueAjax(this.headers.targetId);
               return;
            }
            if (cacheServe(type, this.headers.targetId, myWorker,
                           doReblogDash, true)) {
               return true;
            }
            else {
               if (this.headers.tryCount <= this.headers.retryLimit) {
                  MissingE.debug("Retry " + type + " request (" + this.headers.targetId + ")");
                  doReblogAjax(type, this.url,
                         this.headers.targetId, (this.headers.tryCount + 1),
                         myWorker, this.headers.retryLimit, additional);
               }
               else {
                  MissingE.debug(type + " request (" + this.headers.targetId + ") failed");
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
               MissingE.debug(type + " request (" + this.headers.targetId + ") failed");
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
      MissingE.debug("Stop tags request: Tab closed or changed.");
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
      MissingE.debug("AJAX tags request (" + message.pid + ")");
      startAjax(message.pid);
      doTagsAjax(url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.betterReblogs.retries",MissingE.defaultRetries));
   }
}

function startNotes(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      MissingE.debug("Stop notes request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "notes", message: message, worker: myWorker});
   }
   else {
      MissingE.debug("AJAX notes request (" + message.pid + ")");
      startAjax(message.pid);
      doNotesAjax(message.url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.dashboardTweaks.previewRetries",MissingE.defaultRetries));
   }
}

function startPreview(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      MissingE.debug("Stop preview request: Tab closed or changed.");
      dequeueAjax();
      return;
   }
   if (cacheServe("preview", message.pid, myWorker, doPreview, false)) {
      return true;
   }
   else if (isRequested({type: "preview", message: message, worker: myWorker})) {
      return true;
   }
   else if (activeAjax >= maxActiveAjax) {
      queueAjax({type: "preview", message: message, worker: myWorker});
   }
   else {
      var url = message.url + "/post/" + message.pid + "/rss";
      MissingE.debug("AJAX preview request (" + message.pid + ")");
      startAjax(message.pid);
      doPreviewAjax(url, message.pid, 0, message.type, myWorker,
             getSetting("extensions.MissingE.dashboardTweaks.previewRetries",MissingE.defaultRetries));
   }
}

function startMagnifier(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      MissingE.debug("Stop magnifier request: Tab closed or changed.");
      return;
   }
   if (!message.hasOwnProperty('src')) {
      myWorker.postMessage({greeting: "magnifier", pid: message.pid,
                            success: false});
   }
   else {
      var ft = message.src.match(/\.[a-z]{2,4}$/i);
      var fullsrc = message.src.replace(/_\d+\.[a-z]{2,4}$/i,'_1280'+ft);

      Request({
         url: fullsrc,
         onComplete: function(response) {
            var closed = false;
            try {
               var tab = myWorker.tab;
            }
            catch (err) {
               closed = true;
            }
            if (response.status == 200) {
               myWorker.postMessage({greeting: "magnifier", pid: message.pid,
                                     success:true, data: fullsrc});
            }
            else {
               myWorker.postMessage({greeting: "magnifier", pid: message.pid,
                                     success:true, data: message.src});
            }
         }
      }).get();
   }
}

function startTimestamp(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      MissingE.debug("Stop timestamp request: Tab closed or changed.");
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
      MissingE.debug("AJAX timestamp request (" + message.pid + ")");
      startAjax(message.pid);
      doAskAjax(message.url, message.pid, 0, myWorker,
                getSetting("extensions.MissingE.timestamps.retries",MissingE.defaultRetries),
                "timestamp", doTimestamp);
   }
}

function startBetterReblogsAsk(message, myWorker) {
   try {
      var tab = myWorker.tab;
   }
   catch (err) {
      MissingE.debug("Stop betterReblogs request: Tab closed or changed.");
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
      MissingE.debug("AJAX betterReblogs request (" + message.pid + ")");
      startAjax(message.pid);
      doReblogAjax("betterReblogs", message.url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.reblogYourself.askRetries",MissingE.defaultRetries),
             { pid:message.pid });
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
      MissingE.debug("Stop reblogYourself request: Tab closed or changed.");
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
      MissingE.debug("AJAX reblogYourself request (" + message.pid + ")");
      startAjax(message.pid);
      doReblogAjax("reblogYourself", message.url, message.pid, 0, myWorker,
             getSetting("extensions.MissingE.reblogYourself.retries",MissingE.defaultRetries),
             { pid:message.pid });
   }
}

/*** NOT READY
function decode64(input) {
   var output = "";
   var chr1, chr2, chr3 = "";
   var enc1, enc2, enc3, enc4 = "";
   keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
   var i = 0;

   // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
   var base64test = /[^A-Za-z0-9\+\/\=]/g;
   if (base64test.exec(input)) {
      MissingE.debug("There were invalid base64 characters in the input text.");
      return;
   }
   input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

   do {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
         output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
         output = output + String.fromCharCode(chr3);
      }

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";

   } while (i < input.length);

   return unescape(output);
}

function takeScreenshot(x, y, w, h) {
   var window = Cc['@mozilla.org/appshell/window-mediator;1']
                  .getService(Ci.nsIWindowMediator)
                  .getMostRecentWindow("navigator:browser").gBrowser.contentWindow;

   x = x ? x : 0;
   y = y ? y : 0;
   w = w ? w : window.innerWidth - x;
   h = h ? h : window.innerHeight - y;

   var ss = Cc["@mozilla.org/appshell/appShellService;1"]
               .getService(Ci.nsIAppShellService).hiddenDOMWindow.document
               .createElementNS("http://www.w3.org/1999/xhtml", "canvas");
   ss.mozOpaque = true;
   ss.width = w;
   ss.height = h;
   var ctx = ss.getContext("2d");
   ctx.drawWindow(window, x, y, w, h, "rgb(255,255,255)");
   return ss.toDataURL();
}
***/

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
   else if (message.greeting == "updatedCheck") {
      myWorker.postMessage({greeting: "updatedCheck", uptodate:
         MissingE.versionCompare(getSetting("extensions.MissingE.version",'0'),
                                 message.v) >= 0});
   }
   /*
   else if (message.greeting == "update") {
      myWorker.postMessage({greeting: "update", update:
         MissingE.versionCompare(getSetting("extensions.MissingE.externalVersion",'0'),
                                 getSetting("extensions.MissingE.version",'0')) > 0,
         msg:MissingE.getLocale(message.lang).update});
   }
   */
   else if (message.greeting == "getOptions") {
      myWorker.postMessage({greeting: "getOptions", options: createOptionString()});
   }
   else if (message.greeting == "getExtensionInfo") {
      myWorker.postMessage({greeting: "getExtensionInfo",
         info:{ version: getSetting("extensions.MissingE.version",'0') }});
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
   else if (message.greeting == "notes") {
      startNotes(message, myWorker);
   }
   else if (message.greeting == "preview") {
      startPreview(message, myWorker);
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
         MissingE.debug("Building timestamp (" + message.pid + ")");
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
      if (key === 'extensions.MissingE.hideWidget') {
         toggleWidget();
      }
   }
   else if (message.greeting == "backupVal") {
      var key = 'extensions.' + message.key.replace(/_/g,'.');
      setSetting(key, message.val);
      if (key === 'extensions.MissingE.hideWidget') {
         toggleWidget();
      }
   }
   else if (message.greeting == "getBackupVal") {
      var key = 'extensions.' + message.key.replace(/_/g,'.');
      myWorker.postMessage({greeting: "getBackupVal", key: message.key, val: getSetting(key)});
   }
   else if (message.greeting == "all-settings") {
      if (myWorker.tab.url === data.url("core/options.html")) {
         var settings = getAllSettings();
         myWorker.postMessage(settings);
      }
   }
   else if (message.greeting == "sidebarTweaks") {
      setSetting('extensions.MissingE.sidebarTweaks.accountNum',
                 message.accountNum);
   }
   else if (message.greeting == "tumblrPermission") {
      checkPermission(message.user, 0, myWorker,
                      getSetting("extensions.MissingE.postingTweaks.subEditRetries",MissingE.defaultRetries));
   }
   else if (message.greeting == "sendCrushes") {
      if (getSetting("extensions.MissingE.postCrushes.newTab",1) === 1) {
         tabs.open({
            url: message.url,
            onOpen: function(tab) {
               crushes.push({tab: tab, img: message.img, tags: message.tags});
            }
         });
      }
      else {
         crushes.push({tab: myWorker.tab, img: message.img,
                       tags: message.tags});
         myWorker.tab.url = message.url;
      }
   }
/*** NOT READY
   else if (message.greeting == "screenshot") {
      var dataURI = takeScreenshot(0,0,500,500);
      dataURI = dataURI.replace(/^[^,]*,/);
      var binData = decode64(dataURI);
   }
***/
   else if (message.greeting == "getCrushes") {
      var i;
      for (i=0; i<crushes.length; i++) {
         if (crushes[i].tab === myWorker.tab) {
            myWorker.postMessage({greeting: "getCrushes", img: crushes[i].img,
                                  tags: crushes[i].tags});
            crushes.splice(i,1);
            break;
         }
      }
   }
   else if (message.greeting == "sendReply") {
      if (message.newReply &&
          getSetting("extensions.MissingE.replyReplies.newTab",1) === 1) {
         tabs.open({
            url: message.url,
            onOpen: function(tab) {
               replies.push({tab: tab, reply: message.reply,
                             tags: message.tags});
            }
         });
      }
      else {
         replies.push({tab: myWorker.tab, reply: message.reply,
                       tags: message.tags});
         myWorker.tab.url = message.url;
      }
   }
   else if (message.greeting == "getReply") {
      var i;
      for (i=0; i<replies.length; i++) {
         if (replies[i].tab === myWorker.tab) {
            myWorker.postMessage({greeting: "getReply", reply: replies[i].reply,
                                  tags: replies[i].tags});
            replies.splice(i,1);
            break;
         }
      }
   }
   else if (message.greeting == "settings") {
      var settings = {};
      settings.greeting = "settings";
      settings.component = message.component;
      settings.subcomponent = message.subcomponent;
      settings.extensionURL = data.url("");
      var tumblrs = getSetting("extensions.MissingE.tumblrs",'');
      settings.tumblrAccounts = [];
      while (tumblrs.length > 0) {
         var len = tumblrs.indexOf(":");
         var acct = tumblrs.substring(0,len);
         tumblrs = tumblrs.substring(len+1);
         len = tumblrs.indexOf(",");
         if (len < 0) { len = tumblrs.length; }
         var acctTxt = tumblrs.substring(0,len);
         tumblrs = tumblrs.substring(len+1);
         acctTxt = acctTxt.replace(/%%/g,"%").replace(/%2C/g,",");
         settings.tumblrAccounts.push({account:acct,name:acctTxt});
      }
      switch(message.component) {
         case "konami":
            settings.active = getSetting("extensions.MissingE.konami.active",0);
            break;
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
            settings.photoReplies = getSetting("extensions.MissingE.askTweaks.photoReplies",1);
            settings.submissionControls = getSetting("extensions.MissingE.askTweaks.submissionControls",1);
            break;
         case "sidebarTweaks":
            settings.retries = getSetting("extensions.MissingE.sidebarTweaks.retries",MissingE.defaultRetries);
            settings.accountNum = getSetting("extensions.MissingE.sidebarTweaks.accountNum",0);
            settings.slimSidebar = getSetting("extensions.MissingE.sidebarTweaks.slimSidebar",0);
            settings.addSidebar = getSetting("extensions.MissingE.sidebarTweaks.addSidebar",0);
            settings.showTags = getSetting("extensions.MissingE.sidebarTweaks.showTags",0);
            break;
         case "bookmarker":
            settings.backupMarks = getSetting("extensions.MissingE.bookmarker.marks","");
            settings.format = getSetting("extensions.MissingE.bookmarker.format",MissingE.defaultFormat);
            settings.addBar = getSetting("extensions.MissingE.bookmarker.addBar",1);
            settings.keyboardShortcut = getSetting("extensions.MissingE.bookmarker.keyboardShortcut",1);
            break;
         case "dashboardTweaks":
            settings.reblogQuoteFit = getSetting("extensions.MissingE.dashboardTweaks.reblogQuoteFit",1);
            settings.wrapTags = getSetting("extensions.MissingE.dashboardTweaks.wrapTags",1);
            settings.replaceIcons = getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1);
            settings.textControls = getSetting("extensions.MissingE.dashboardTweaks.textControls",0);
            settings.smallIcons = getSetting("extensions.MissingE.dashboardTweaks.smallIcons",0);
            settings.postLinks = getSetting("extensions.MissingE.dashboardTweaks.postLinks",1);
            settings.reblogReplies = getSetting("extensions.MissingE.dashboardTweaks.reblogReplies",0);
            settings.widescreen = getSetting("extensions.MissingE.dashboardTweaks.widescreen",0);
            settings.queueArrows = getSetting("extensions.MissingE.dashboardTweaks.queueArrows",1);
            settings.noExpandAll = getSetting("extensions.MissingE.dashboardTweaks.noExpandAll",0);
            settings.massDelete = getSetting("extensions.MissingE.dashboardTweaks.massDelete",1);
            settings.randomQueue = getSetting("extensions.MissingE.dashboardTweaks.randomQueue",1);
            settings.sortableNotes = getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1);
            settings.notePreview = getSetting("extensions.MissingE.dashboardTweaks.notePreview",1);
            settings.simpleHighlight = getSetting("extensions.MissingE.dashboardTweaks.simpleHighlight",0);
            settings.pagedNav = getSetting("extensions.MissingE.dashboardTweaks.pagedNav",0);
            settings.keyboardShortcut = getSetting("extensions.MissingE.dashboardTweaks.keyboardShortcut",1);
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
            settings.addUploader = getSetting("extensions.MissingE.postingTweaks.addUploader",1);
            settings.quickButtons = getSetting("extensions.MissingE.postingTweaks.quickButtons",1);
            settings.blogSelect = getSetting("extensions.MissingE.postingTweaks.blogSelect",0);
            settings.tagQueuedPosts = getSetting("extensions.MissingE.postingTweaks.tagQueuedPosts",0);
            settings.queueTags = getSetting("extensions.MissingE.postingTweaks.queueTags",'');
            if (settings.queueTags !== '') {
               settings.queueTags = settings.queueTags.replace(/, /g,',').split(',');
            }
            settings.showAnswers = getSetting("extensions.MissingE.postingTweaks.showAnswers",0);
            settings.facebookOff = getSetting("extensions.MissingE.postingTweaks.facebookOff",0);
            settings.smartRedirect = getSetting("extensions.MissingE.postingTweaks.smartRedirect",0);
            break;
         case "magnifier":
            settings.magnifyAvatars = getSetting("extensions.MissingE.magnifier.magnifyAvatars",0);
            break;
         case "safeDash":
            settings.keyboardShortcut = getSetting("extensions.MissingE.safeDash.keyboardShortcut",1);
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
            settings.quickReblogForceFacebook = getSetting("extensions.MissingE.betterReblogs.quickReblogForceFacebook",'default');
            settings.quickReblogCaption = getSetting("extensions.MissingE.betterReblogs.quickReblogCaption",1);
            settings.fullText = getSetting("extensions.MissingE.betterReblogs.fullText",0);
            settings.tagQueuedPosts = (getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1 && getSetting("extensions.MissingE.postingTweaks.tagQueuedPosts",0) == 1) ? 1 : 0;
            settings.queueTags = getSetting("extensions.MissingE.postingTweaks.queueTags",'');
            if (settings.queueTags !== '') {
               settings.queueTags = settings.queueTags.replace(/, /g,',').split(',');
            }
            settings.tagReblogs = getSetting("extensions.MissingE.betterReblogs.tagReblogs",0);
            settings.reblogTags = getSetting("extensions.MissingE.betterReblogs.reblogTags",'');
            if (settings.reblogTags !== '') {
               settings.reblogTags = settings.reblogTags.replace(/, /g,',').split(',');
            }
            settings.reblogAsks = 0;//getSetting("extensions.MissingE.betterReblogs.reblogAsks",0);
            settings.quickKeyboardShortcut = getSetting("extensions.MissingE.betterReblogs.quickKeyboardShortcut",1);
            break;
      }
      myWorker.postMessage(settings);
   }
   else if (message.greeting == "earlyStyles") {
      var injectSlimSidebar = false;
      var injectStyles = [];

      if (myWorker.tab.url !== message.url &&
          MissingE.isTumblrURL(message.url, ["upload"]) &&
          MissingE.isTumblrURL(myWorker.tab.url,
                               ["dashboard", "blog", "likes", "tagged"])) {
         if (getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1 &&
             getSetting("extensions.MissingE.dashboardTweaks.smallIcons",0) == 1) {
            myWorker.postMessage({greeting: "earlyStyles",
                                  extensionURL: data.url(""),
                                  styles: [{file: "core/dashboardTweaks/smallIcons.css"}]});
         }
         return;
      }
      else if (myWorker.tab.url !== message.url &&
          !MissingE.isTumblrURL(message.url, ["askForm", "fanMail"])) {
         return;
      }

      if (getSetting("extensions.MissingE.askTweaks.enabled",1) == 1) {
         if (getSetting("extensions.MissingE.askTweaks.smallFanMail",0) == 1 &&
             MissingE.isTumblrURL(message.url, ["fanMail", "messages"])) {
            injectStyles.push({file: "core/askTweaks/smallFanMail.css"});
         }
         if (getSetting("extensions.MissingE.askTweaks.allFanMail",0) == 1 &&
             MissingE.isTumblrURL(message.url, ["messages"])) {
            injectStyles.push({file: "core/askTweaks/allFanMail.css"});
         }
      }

      if (MissingE.isTumblrURL(message.url,
                      ["dashboard",
                       "blog",
                       "blogData",
                       "drafts",
                       "queue",
                       "messages",
                       "likes",
                       "tagged"])) {

         injectStyles.push({code:
               '#posts .post .post_controls .MissingE_experimental_reply, ' +
               '#posts .post .post_controls .MissingE_experimental_reply_wait, ' +
               '#posts .post .post_controls .MissingE_experimental_reply_fail, ' +
               '#posts .post .post_controls .MissingE_experimental_reply_success, ' +
               '#posts .post .post_controls .MissingE_reblogYourself_retry, ' +
               '#posts .post .post_controls .MissingE_betterReblogs_retryAsk { ' +
                  'background-image:url("' +
                     data.url("core/dashboardTweaks/postControls.png") +
                  '"); ' +
               '} ' +
               '#posts .post .post_controls .MissingE_quick_reblogging { ' +
                  'background-image:url("' +
                     data.url("core/betterReblogs/reblogging.gif") +
                  '") !important; ' +
               '} ' +
               '#posts .post .post_controls .MissingE_quick_reblogging_success { ' +
                  'background-image:url("' +
                     data.url("core/betterReblogs/reblogSuccess.png") +
                  '") !important; ' +
               '}'});

         if (getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1) {
            injectStyles.push({file: "core/dashboardTweaks/dashboardTweaks.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.smallIcons",0) == 1) {
               injectStyles.push({file: "core/dashboardTweaks/smallIcons.css"});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.notePreview",1) == 1) {
               injectStyles.push({file: "core/dashboardTweaks/preview.css"});
               injectStyles.push({code:
                  '#MissingE_preview .previewIcon { ' +
                     'background-image:url("' +
                     data.url("core/dashboardTweaks/prevIcon.png") +
                     '"); ' +
                  '}' +
                  '#MissingE_preview.MissingE_preview_loading { ' +
                     'background-image:url("' +
                     data.url("core/dashboardTweaks/loader.gif") +
                     '");' +
                  '}' +
                  '#MissingE_preview.MissingE_preview_fail { ' +
                     'background-image:url("' +
                     data.url("core/dashboardTweaks/prevFail.png") +
                     '");' +
                  '}'});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.replaceIcons",1) == 1) {
               injectStyles.push({code:
                  '#posts .post .post_controls a[id^="ask_answer_link"], ' +
                  '#posts .post .post_controls a[href^="/edit"], ' +
                  '#dashboard_inbox .post .post_controls a[id^="post_delete_"], ' +
                  '#posts .post .post_controls a[onclick*="delete_post_"], ' +
                  '#posts .post .post_controls a[onclick*="queue_post"], ' +
                  '#posts .post .post_controls a[onclick*="approve_post"], ' +
                  '#posts .post .post_controls a[onclick*="publish_post"] { ' +
                     'background-image:url("' +
                        data.url("core/dashboardTweaks/postControls.png") +
                     '"); ' +
                  '}'});
               injectStyles.push({file: "core/dashboardTweaks/replaceIcons.css"});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.textControls",0) == 1) {
               injectStyles.push({file: "core/dashboardTweaks/textControls.css"});
            }
            if (getSetting("extensions.MissingE.dashboardTweaks.reblogQuoteFit",1) == 1)
               injectStyles.push({file: "core/dashboardTweaks/reblogQuoteFit.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.wrapTags",1) == 1)
               injectStyles.push({file: "core/dashboardTweaks/wrapTags.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.postLinks",1) == 1)
               injectStyles.push({file: "core/dashboardTweaks/postLinks.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.massDelete",1) == 1 ||
                getSetting("extensions.MissingE.dashboardTweaks.randomQueue",1) == 1)
               injectStyles.push({file: "core/dashboardTweaks/draftQueueTools.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1) == 1)
               injectStyles.push({file: "core/dashboardTweaks/notesSorter.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.widescreen",0) == 1 &&
                !MissingE.isTumblrURL(message.url, ["settings"]))
               injectStyles.push({file: "core/dashboardTweaks/widescreen.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.queueArrows",1) == 1 &&
                MissingE.isTumblrURL(message.url, ["queue"]))
               injectStyles.push({file: "core/dashboardTweaks/queueArrows.css"});
            if (getSetting("extensions.MissingE.dashboardTweaks.simpleHighlight",0) == 1)
               injectStyles.push({file: "core/dashboardTweaks/simpleHighlight.css"});
         }

         if (getSetting("extensions.MissingE.safeDash.enabled",1) == 1) {
            injectStyles.push({file: "core/safeDash/safeDash.css"});
            if (getSetting("extensions.MissingE.safeDash.photosetAll",0) == 1) {
               injectStyles.push({file: "core/safeDash/photosetAll.css"});
            }
            injectStyles.push({code:
               '#right_column #MissingE_safeDash li a {' +
                  'background-image:url("' +
                  data.url("core/safeDash/lockicon.png") +
                  '") !important; ' +
               '} ' +
               'body.MissingE_safeDash #posts li.post.photo .post_content > div:first-child, ' +
               'body.MissingE_safeDash #posts li.post.photo .flipcard img, ' +
               'body.MissingE_safeDash #posts li.post.photo .photoset_photo, ' +
               'body.MissingE_safeDash #posts li.post.photo img.image_thumbnail, ' +
               'body.MissingE_safeDash #posts li.post.video .video_thumbnail, ' +
               'body.MissingE_safeDash #posts li.post.video .video_embed, ' +
               'body.MissingE_safeDash #posts li.post.video span[id^="video_player"], ' +
               'body.MissingE_safeDash #posts li.notification blockquote[style], ' +
               'body.MissingE_safeDash #posts li.post ol.notes blockquote.photo_container, ' +
               'body.MissingE_safeDash #posts li.post .post_content p .nsfw_span, ' +
               'body.MissingE_safeDash #posts li.post .post_content img.album_art, ' +
               'body.MissingE_safeDash #posts li.post .post_content img[onclick*="album_art"], ' +
               'body.MissingE_safeDash #posts li.post.video .tumblr_video_container { ' +
                  'background-image:url("' +
                  data.url("core/safeDash/lock.png") +
                  '");' +
               '}'});
         }

         if (getSetting("extensions.MissingE.bookmarker.enabled",1) == 1) {
            injectStyles.push({file: "core/bookmarker/bookmarker.css"});
         }

         if (getSetting("extensions.MissingE.sidebarTweaks.enabled",1) == 1) {
            injectStyles.push({file: "core/sidebarTweaks/sidebarTweaks.css"});
            if (getSetting("extensions.MissingE.sidebarTweaks.slimSidebar",0) == 1) {
               injectSlimSidebar = true;
            }
         }

         if (getSetting("extensions.MissingE.magnifier.enabled",1) == 1) {
            injectStyles.push({file: "core/magnifier/magnifier.css"});
         }

         if (getSetting("extensions.MissingE.askTweaks.enabled",1) == 1) {
            injectStyles.push({file: "core/askTweaks/askTweaks.css"});
         }
      }

      if (MissingE.isTumblrURL(message.url, ["massEditor"])) {
        if (getSetting("extensions.MissingE.massEditor.enabled",1) == 1) {
           injectStyles.push({file: "core/massEditor/massEditor.css"});
           if (getSetting("extensions.MissingE.massEditor.showNotes",1) == 1) {
              injectStyles.push({file: "core/massEditor/showNotes.css"});
           }
        }
      }

      if (MissingE.isTumblrURL(message.url,
                      ["post",
                       "reblog",
                       "messages",
                       "drafts"])) {
         if (getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1) {
            injectStyles.push({file: "core/postingTweaks/postingTweaks.css"});
         }
      }

      if (MissingE.isTumblrURL(message.url,
                      ["dashboard",
                       "blog",
                       "tagged"])) {
         if (getSetting("extensions.MissingE.replyReplies.enabled",1) == 1) {
            injectStyles.push({code: "#posts .notification .notification_type_icon { background-image:url('" + data.url('core/replyReplies/notification_icons.png') + "') !important; } #posts ol.notes .notification_type_icon { background-image:url('" + data.url('core/replyReplies/notes_icons.png') + "') !important; }"});
            injectStyles.push({file: "core/replyReplies/replyReplies.css"});
         }
      }

      if (MissingE.isTumblrURL(message.url, ["following"])) {
         if (getSetting("extensions.MissingE.magnifier.enabled",1) == 1) {
            injectStyles.push({file: "core/magnifier/magnifier.css"});
         }
      }

      if (MissingE.isTumblrURL(message.url,
                      ["dashboard",
                       "blog",
                       "likes",
                       "tagged"])) {
         if (getSetting("extensions.MissingE.betterReblogs.enabled",1) == 1) {
            injectStyles.push({code: "#MissingE_quick_reblog #MissingE_qr_nipple { background-image:url('" + data.url('core/betterReblogs/qrnipple.png') + "') !important; }"});
            injectStyles.push({file: "core/betterReblogs/quickReblogMenu.css"});
         }
      }

      if (injectSlimSidebar) {
         injectStyles.push({file: "core/sidebarTweaks/slimSidebar.css"});
      }

      if (injectStyles.length > 0) {
         myWorker.postMessage({greeting: "earlyStyles",
                               extensionURL: data.url(""),
                               styles: injectStyles});
      }
   }
   else if (message.greeting == "start") {
      var activeScripts = {};
      var zindexFix = false;
      var needUI = false, needUIresizable = false, needUIsortable = false,
          needUIdraggable = false;
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
          MissingE.isTumblrURL(message.url, ["dashboard", "messages"])) {
         injectScripts.push(data.url("core/common/getAccounts.js"));
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["dashboardOnly"])) {
         injectScripts.push(data.url("core/common/warningInfo.js"));
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url, ["massEditor"])) {
            if (getSetting("extensions.MissingE.massEditor.enabled",1) == 1) {
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
         injectScripts.push(data.url("core/common/konami.js"));

         if (getSetting("extensions.MissingE.safeDash.enabled",1) == 1) {
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
            injectScripts.push(data.url("core/bookmarker/bookmarker.js"));
            activeScripts.bookmarker = true;
         }
         else
            activeScripts.bookmarker = false;

         if (getSetting("extensions.MissingE.sidebarTweaks.enabled",1) == 1) {
            injectScripts.push(data.url("core/sidebarTweaks/sidebarTweaks.js"));
            activeScripts.sidebarTweaks = true;
         }
         else
            activeScripts.sidebarTweaks = false;

         if (getSetting("extensions.MissingE.magnifier.enabled",1) == 1) {
            injectScripts.push(data.url("core/magnifier/magnifier.js"));
            activeScripts.magnifier = true;
         }
         else
            activeScripts.magnifier = false;

         if (getSetting("extensions.MissingE.dashboardTweaks.enabled",1) == 1) {
            if (getSetting("extensions.MissingE.dashboardTweaks.sortableNotes",1) == 1) {
               needUI = true;
               needUIsortable = true;
            }
            injectScripts.push(data.url("core/dashboardTweaks/dashboardTweaks.js"));
            activeScripts.dashboardTweaks = true;
         }
         else
            activeScripts.dashboardTweaks = false;

         if (getSetting("extensions.MissingE.askTweaks.enabled",1) == 1) {
            needUI = true;
            needUIdraggable = true;
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
                                "queue",
                                "drafts"])) {
         if (getSetting("extensions.MissingE.postingTweaks.enabled",1) == 1) {
            needUI = true;
            needUIresizable = true;
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

         if (getSetting("extensions.MissingE.reblogYourself.enabled",1) == 1) {
            injectScripts.push(data.url("core/reblogYourself/reblogYourself_fill.js"));
            activeScripts.reblogYourself = true;
            activeScripts.reblogYourself_fill = true;
         }
         else
            activeScripts.reblogYourself = false;
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
                                "blog",
                                "tagged"])) {
         if (getSetting("extensions.MissingE.replyReplies.enabled",1) == 1) {
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
                       "messages",
                       "tagged"])) {
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
            injectStyles.push({file: data.url("core/betterReblogs/betterReblogs.css")});
            injectScripts.push(data.url("core/betterReblogs/betterReblogs_dash.js"));
            activeScripts.betterReblogs = true;
         }
         else
            activeScripts.betterReblogs = false;
      }
      if (!message.isFrame &&
          MissingE.isTumblrURL(message.url,
                      ["dashboard",
                       "blog",
                       "likes",
                       "tagged",
                       "drafts",
                       "queue",
                       "messages"])) {
         if (getSetting("extensions.MissingE.reblogYourself.enabled",1) == 1 &&
             getSetting("extensions.MissingE.reblogYourself.dashboard",1) == 1) {
            injectStyles.push({file: data.url("core/reblogYourself/reblogYourself.css")});
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
      injectScripts.unshift(data.url("lib/evalFix.js"));
      injectScripts.unshift(data.url("lib/jquery-1.7.2.min.js"));
      if (zindexFix) {
         injectScripts.push(data.url("core/common/zindexFix.js"));
      }
      activeScripts.url = message.url;
      activeScripts.isFrame = message.isFrame;
      activeScripts.greeting = "startup";

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
   contentScriptWhen: "start",
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/utils.js"),
                       data.url("core/common/earlyCSS.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
      });
   }
});

pageMod.PageMod({
   include: ["http://www.tumblr.com/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/common/menuButton.js"),
                       data.url("core/utils.js"),
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
   include: [data.url("core/options.html") + "*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("lib/jquery-1.7.2.min.js"),
                        data.url("lib/evalFix.js"),
                        data.url("extension.js"),
                        data.url("core/localizations.js"),
                        data.url("core/utils.js"),
                        data.url("lib/checkbox/jquery.checkbox.min.js"),
                        data.url("lib/facebox/facebox.js"),
                        data.url("lib/jquery-spin/jquery-spin.js"),
                        data.url("core/options.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
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
   include: ["http://missing-e.com/*"],
   contentScriptWhen: 'ready',
   contentScriptFile: [data.url("extension.js"),
                       data.url("core/siteIntegration.js")],
   onAttach: function (worker) {
      worker.on('message', function(data) {
         handleMessage(data, this);
      });
   }
});

/*
function getExternalVersion() {
   Request({
      url: 'http://missing-e.com/version',
      onComplete: function(response) {
         if (response.status == 200) {
            setSetting('extensions.MissingE.lastUpdateCheck', ((new Date()).valueOf()).toString());
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
*/

function fixupSettings() {
   setIntegerPrefType('extensions.MissingE.betterReblogs.quickReblogAcctType',0);
   setIntegerPrefType('extensions.MissingE.postCrushes.crushSize',1);
   setIntegerPrefType('extensions.MissingE.replyReplies.smallAvatars',1);
   setIntegerPrefType('extensions.MissingE.sidebarTweaks.accountNum',0);

   boolSettingToInt('extensions.MissingE.hideWidget');

   moveAllSettings('askFixes','askTweaks');
   moveAllSettings('dashboardFixes','dashboardTweaks');
   moveAllSettings('postingFixes','postingTweaks');
   clearSetting('extensions.MissingE.postingTweaks.uploaderToggle');
   clearSetting('extensions.MissingE.experimentalFeatures.enabled');
   clearSetting('extensions.MissingE.sidebarTweaks.followingLink');
   clearSetting('extensions.MissingE.betterReblogs.keyboardShortcut');
   settingChange('extensions.MissingE.bookmarker.format',',;','.');
   invertSetting('extensions.MissingE.dashboardTweaks.expandAll','extensions.MissingE.dashboardTweaks.noExpandAll');
   moveSetting('extensions.MissingE.dashboardTweaks.slimSidebar','extensions.MissingE.sidebarTweaks.slimSidebar');
   moveSetting('extensions.MissingE.sidebarTweaks.showOverflowTags','extensions.MissingE.sidebarTweaks.showTags');
   collapseSettings('extensions.MissingE.askTweaks.betterAnswers','extensions.MissingE.askTweaks.buttons','extensions.MissingE.askTweaks.tags');
   invertSetting('extensions.MissingE.betterReblogs.noPassTags','extensions.MissingE.betterReblogs.passTags');
}

function onStart(currVersion, prevVersion) {
   if (prevVersion && prevVersion !== currVersion) {
      MissingE.log("Updated Missing e (" +
            prevVersion + " => " + currVersion + ")");
      setSetting('extensions.MissingE.previousVersion',prevVersion);
   }
   else if (!prevVersion) {
      MissingE.log("Installed Missing e " + currVersion);
      setSetting('extensions.MissingE.previousVersion',currVersion);
      openSettings();
   }
   if (getSetting('extensions.MissingE.previousVersion','') == '') {
      setSetting('extensions.MissingE.previousVersion',currVersion);
   }
   setSetting('extensions.MissingE.version',currVersion);
   clearSetting('extensions.MissingE.konami.active');
}

onStart(currVersion, prevVersion);

/*
if (!MissingE.isSameDay(getSetting('extensions.MissingE.lastUpdateCheck',0))) {
   MissingE.debug("Checking current available version.");
   getExternalVersion();
}
*/

fixupSettings();
toggleWidget();