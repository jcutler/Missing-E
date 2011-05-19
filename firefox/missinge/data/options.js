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

var all_settings;

var defaultTimeout = 15;
var minTimeout = 5;
var maxTimeout = 120;
var defaultRetries = 4;
var minRetries = 0;
var maxRetries = 20;

jQuery(document).ready(function (){
   jQuery('a[rel*=facebox]').facebox({
      loadingImage : 'facebox/loading.gif',
      closeImage   : 'facebox/closelabel.png'
   });
   self.postMessage({greeting: "all-settings"});
   self.on('message', function(message) {
      if (message.greeting !== "all-settings") { return false; }
      all_settings = message;
      loadSettings();
      jQuery('input.toggler').checkbox();
   });

   jQuery('#nav a.nav_item').live('click',function() {
      if (this.id === 'close_nav') {
         window.close();
      }
      else {
         doshow(this.id.replace(/_nav$/,''));
      }
   });

   jQuery('#home_nav,#settings_nav').click(function() {
      doshow('about');
   });

   jQuery('input.toggler').bind("change", function() {
      toggle(this);
   }).click(function() {
      toggle(this);
   });

   jQuery('input.simple_setting').bind("change", function() {
      doSetting(this, false);
   });

   jQuery('input.setting_prefix,input.setting_format,input.setting_text')
         .bind("keyup", function(e) {
      doKeyUp(e, this, false);
   });

   jQuery('input.setting_retry').bind("change", function() {
      doSetting(this, true, defaultRetries, minRetries, maxRetries);
   }).spin({
      min:minRetries,
      max:maxRetries,
      timeInterval:100,
      lock:true,
      btnClass:'spinner'
   });

   jQuery('input.setting_timeout').bind("change", function() {
      doSetting(this, true, defaultTimeout, minTimeout, maxTimeout);
   }).spin({
      min:minRetries,
      max:maxRetries,
      timeInterval:100,
      lock:true,
      btnClass:'spinner'
   });

   jQuery('span.resetter').click(function() {
      if (this.id === "prefix-resetter") {
         resetPrefix(this);
      }
      else if (jQuery(this).hasClass('timeout_resetter')) {
         resetTimeout(this);
      }
      else if (jQuery(this).hasClass('retry_resetter')) {
         resetRetries(this);
      }
   });

});

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

function getStorage(key,defaultValue) {
   if (all_settings[key] == undefined)
      return defaultValue;
   else
      return all_settings[key];
}

function setStorage(key,value) {
   all_settings[key] = value;
   self.postMessage({greeting: "change-setting", name: key, val: value});
}

function trim(str) {
   return str.replace(/^\s+/,'').replace(/\s+$/,'');
}

function doKeyUp(e, obj, isNumber, defaultValue, min, max) {
   var key = e.which;
   if (key < 33 || key > 46)
      doSetting(obj, isNumber, defaultValue, min, max);
}

function doSetting(obj, isNumber, defaultValue, min, max) {
   if (obj.type == "checkbox")
      setStorage(obj.name, (obj.checked ? 1 : 0));
   else if (obj.type == "radio")
      setStorage(obj.name, (obj.value));
   else if (obj.type == "text") {
      if (isNumber) {
         obj.value = trim(obj.value);
         if (/[^0-9]/.test(obj.value)) {
            obj.value = getStorage(obj.name, defaultValue);
         }
         else {
            var num;
            if (obj.value == '') num = min;
            else num = parseInt(obj.value);
            if (num < min) num = min;
            if (num > max) num = max;
            obj.value = num;
            setStorage(obj.name, num);
         }
      }
      else {
         setStorage(obj.name, (obj.value));
      }
   }
}

function loadSettings() {
   jQuery('span.defRetries').text(defaultRetries);
   jQuery('#versionnum').text(getStorage('MissingE_version',''));
   var exp = document.getElementById("experimentalFeatures_options").active;
   if (getStorage('MissingE_experimentalFeatures_enabled', 0) == 1) {
      exp.checked = true;
      jQuery('#posts td.experimental').show();
   }
   else {
      exp.checked = false;
      jQuery('#posts td.experimental').hide();
   }
   for (i in componentList) {
      var v = componentList[i];
      var frm = document.getElementById(v + "_options");
      var active = frm.active;
      if (getStorage('MissingE_' + v + '_enabled', 1) == 1) {
         active.checked = true;
      }
      else {
         active.checked = false;
      }
      if (v == "dashLinksToTabs") {
         if (getStorage('MissingE_dashLinksToTabs_newPostTabs',1) == 1)
            frm.MissingE_dashLinksToTabs_newPostTabs.checked = true;
         else
            frm.MissingE_dashLinksToTabs_newPostTabs.checked = false;
         if (getStorage('MissingE_dashLinksToTabs_sidebar',0) == 1)
            frm.MissingE_dashLinksToTabs_sidebar.checked = true;
         else
            frm.MissingE_dashLinksToTabs_sidebar.checked = false;
         if (getStorage('MissingE_dashLinksToTabs_reblogLinks',0) == 1)
            frm.MissingE_dashLinksToTabs_reblogLinks.checked = true;
         else
            frm.MissingE_dashLinksToTabs_reblogLinks.checked = false;
         if (getStorage('MissingE_dashLinksToTabs_editLinks',0) == 1)
            frm.MissingE_dashLinksToTabs_editLinks.checked = true;
         else
            frm.MissingE_dashLinksToTabs_editLinks.checked = false;
      }
      else if (v == "magnifier") {
         frm.MissingE_magnifier_retries.value = getStorage('MissingE_magnifier_retries',defaultRetries);
      }
      else if (v == "timestamps") {
         frm.MissingE_timestamps_retries.value = getStorage('MissingE_timestamps_retries',defaultRetries);
         frm.MissingE_timestamps_format.value = getStorage('MissingE_timestamps_format',"%Y-%m-%D %H:%i");
      }
      else if (v == "postCrushes") {
         if (getStorage('MissingE_postCrushes_crushSize',1) == 1)
            document.getElementById("MissingE_postCrushes_crushSize_small").checked = true;
         else
            document.getElementById("MissingE_postCrushes_crushSize_large").checked = true;
         if (getStorage('MissingE_postCrushes_addTags',1) == 1)
            frm.MissingE_postCrushes_addTags.checked = true;
         else
            frm.MissingE_postCrushes_addTags.checked = false;
         if (getStorage('MissingE_postCrushes_showPercent',1) == 1)
            frm.MissingE_postCrushes_showPercent.checked = true;
         else
            frm.MissingE_postCrushes_showPercent.checked = false;
         frm.MissingE_postCrushes_prefix.value = getStorage('MissingE_postCrushes_prefix',"Tumblr Crushes:");
      }
      else if (v == "replyReplies") {
         if (getStorage('MissingE_replyReplies_smallAvatars',1) == 1)
            document.getElementById("MissingE_replyReplies_smallAvatars_small").checked = true;
         else
            document.getElementById("MissingE_replyReplies_smallAvatars_large").checked = true;
         if (getStorage('MissingE_replyReplies_showAvatars',1) == 1)
            frm.MissingE_replyReplies_showAvatars.checked = true;
         else
            frm.MissingE_replyReplies_showAvatars.checked = false;
         if (getStorage('MissingE_replyReplies_addTags',1) == 1)
            frm.MissingE_replyReplies_addTags.checked = true;
         else
            frm.MissingE_replyReplies_addTags.checked = false;
         if (getStorage('MissingE_replyReplies_newTab',1) == 1)
            frm.MissingE_replyReplies_newTab.checked = true;
         else
            frm.MissingE_replyReplies_newTab.checked = false;
      }
      else if (v == "dashboardFixes") {
         if (getStorage('MissingE_dashboardFixes_reblogQuoteFit',1) == 1)
            frm.MissingE_dashboardFixes_reblogQuoteFit.checked = true;
         else
            frm.MissingE_dashboardFixes_reblogQuoteFit.checked = false;
         if (getStorage('MissingE_dashboardFixes_wrapTags',1) == 1)
            frm.MissingE_dashboardFixes_wrapTags.checked = true;
         else
            frm.MissingE_dashboardFixes_wrapTags.checked = false;
         if (getStorage('MissingE_dashboardFixes_replaceIcons', 1) == 1)
            frm.MissingE_dashboardFixes_replaceIcons.checked = true;
         else
            frm.MissingE_dashboardFixes_replaceIcons.checked = false;
         if (getStorage('MissingE_dashboardFixes_timeoutAJAX', 1) == 1)
            frm.MissingE_dashboardFixes_timeoutAJAX.checked = true;
         else
            frm.MissingE_dashboardFixes_timeoutAJAX.checked = false;
         frm.MissingE_dashboardFixes_timeoutLength.value = getStorage('MissingE_dashboardFixes_timeoutLength',defaultTimeout);
         if (getStorage('MissingE_dashboardFixes_postLinks', 1) == 1)
            frm.MissingE_dashboardFixes_postLinks.checked = true;
         else
            frm.MissingE_dashboardFixes_postLinks.checked = false;
         if (getStorage('MissingE_dashboardFixes_reblogReplies', 0) == 1)
            frm.MissingE_dashboardFixes_reblogReplies.checked = true;
         else
            frm.MissingE_dashboardFixes_reblogReplies.checked = false;
         if (getStorage('MissingE_dashboardFixes_widescreen', 0) == 1)
            frm.MissingE_dashboardFixes_widescreen.checked = true;
         else
            frm.MissingE_dashboardFixes_widescreen.checked = false;
      }
      else if (v == "betterReblogs") {
         if (getStorage('MissingE_betterReblogs_passTags',1) == 1)
            frm.MissingE_betterReblogs_passTags.checked = true;
         else
            frm.MissingE_betterReblogs_passTags.checked = false;
         if (getStorage('MissingE_betterReblogs_autoFillTags',1) == 1)
            frm.MissingE_betterReblogs_autoFillTags.checked = true;
         else
            frm.MissingE_betterReblogs_autoFillTags.checked = false;
         if (getStorage('MissingE_betterReblogs_quickReblog',0) == 1)
            frm.MissingE_betterReblogs_quickReblog.checked = true;
         else
            frm.MissingE_betterReblogs_quickReblog.checked = false;
         frm.MissingE_betterReblogs_retries.value = getStorage('MissingE_betterReblogs_retries',defaultRetries);
         if (getStorage('MissingE_betterReblogs_quickReblogAcctType',0) == 1)
            document.getElementById('MissingE_betterReblogs_quickReblogAcctType_Secondary').checked = true;
         else
            document.getElementById('MissingE_betterReblogs_quickReblogAcctType_Primary').checked = true;
         frm.MissingE_betterReblogs_quickReblogAcctName.value = getStorage('MissingE_betterReblogs_quickReblogAcctName','');
      }
      else if (v == "postingFixes") {
         if (getStorage('MissingE_postingFixes_photoReplies',1) == 1)
            frm.MissingE_postingFixes_photoReplies.checked = true;
         else
            frm.MissingE_postingFixes_photoReplies.checked = false;
         if (getStorage('MissingE_postingFixes_uploaderToggle',1) == 1)
            frm.MissingE_postingFixes_uploaderToggle.checked = true;
         else
            frm.MissingE_postingFixes_uploaderToggle.checked = false;
         if (getStorage('MissingE_postingFixes_addUploader',1) == 1)
            frm.MissingE_postingFixes_addUploader.checked = true;
         else
            frm.MissingE_postingFixes_addUploader.checked = false;
         if (getStorage('MissingE_postingFixes_quickButtons',1) == 1)
            frm.MissingE_postingFixes_quickButtons.checked = true;
         else
            frm.MissingE_postingFixes_quickButtons.checked = false;
      }
      else if (v == "reblogYourself") {
         if (getStorage('MissingE_reblogYourself_postPage',1) == 1)
            frm.MissingE_reblogYourself_postPage.checked = true;
         else
            frm.MissingE_reblogYourself_postPage.checked = false;
         if (getStorage('MissingE_reblogYourself_dashboard',1) == 1)
            frm.MissingE_reblogYourself_dashboard.checked = true;
         else
            frm.MissingE_reblogYourself_dashboard.checked = false;
         frm.MissingE_reblogYourself_retries.value = getStorage('MissingE_reblogYourself_retries',defaultRetries);
      }
      else if (v == "unfollower") {
         frm.MissingE_unfollower_retries.value = getStorage('MissingE_unfollower_retries',defaultRetries);
      }
      else if (v == "followChecker") {
         frm.MissingE_followChecker_retries.value = getStorage('MissingE_followChecker_retries',defaultRetries);
      }
   }
}

function resetPrefix() {
   var prefix = document.getElementById("postCrushes_options").MissingE_postCrushes_prefix;
   prefix.value = "Tumblr Crushes:";
   doSetting(prefix, false);
}

function resetRetries(obj) {
   var input = jQuery(obj).siblings('input:text');
   input.val(defaultRetries);
   doSetting(input.get(0), true, defaultRetries, minRetries, maxRetries);
}

function resetTimeout(obj) {
   var input = jQuery(obj).siblings('input:text');
   input.val(defaultTimeout);
   doSetting(input.get(0), true, defaultTimeout, minTimeout, maxTimeout);
}

function toggle(obj) {
   if (obj.name !== 'active') { return false; }
   var frm = jQuery(obj).closest("form");
   var component = frm.attr("id").match(/^[a-zA-Z]+/)[0];
   if (obj.checked) {
      obj.checked = false;
      setStorage('MissingE_' + component + '_enabled', 0);
      if (component == 'experimentalFeatures') {
         jQuery('#posts td.experimental').hide();
      }
   }
   else {
      obj.checked = true;
      setStorage('MissingE_' + component + '_enabled', 1);
      if (component == 'experimentalFeatures') {
         jQuery('#posts td.experimental').show();
      }
   }
}

function doshow(component) {
   var itm;
   if (component == 'about') {
      document.getElementById('about_nav').className = 'nav_item active';
      document.getElementById('about_posts').style.display = 'block';
      document.getElementById('experimental_section').style.display = 'none';
   }
   else {
      document.getElementById('about_nav').className = 'nav_item';
      document.getElementById('about_posts').style.display = 'none';
      document.getElementById('experimental_section').style.display = 'block';
   }
   if (component == 'dashboard') {
      document.getElementById('dashboard_nav').className = 'nav_item active';
      document.getElementById('dashboard_posts').style.display = 'block';
   }
   else {
      document.getElementById('dashboard_nav').className = 'nav_item';
      document.getElementById('dashboard_posts').style.display = 'none';
   }
   if (component == 'posting') {
      document.getElementById('posting_nav').className = 'nav_item active';
      document.getElementById('posting_posts').style.display = 'block';
   }
   else {
      document.getElementById('posting_nav').className = 'nav_item';
      document.getElementById('posting_posts').style.display = 'none';
   }
   if (component == 'social') {
      document.getElementById('social_nav').className = 'nav_item active';
      document.getElementById('social_posts').style.display = 'block';
   }
   else {
      document.getElementById('social_nav').className = 'nav_item';
      document.getElementById('social_posts').style.display = 'none';
   }
}
