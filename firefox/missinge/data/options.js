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

var all_settings;

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

   jQuery('.simple_setting').bind("change", function() {
      doSetting(this, false);
   });

   jQuery('input.setting_prefix,input.setting_format,input.setting_text')
         .bind("keyup", function(e) {
      doKeyUp(e, this, false);
   });

   jQuery('input.blurable_setting').bind("blur", function() {
      doSetting(this, false);
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

   jQuery('input.setting_fontsize').bind("change", function() {
      doSetting(this, true, defaultMaxBig, minFontSize, maxFontSize);
   }).spin({
      min:minFontSize,
      max:maxFontSize,
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
      else if (jQuery(this).hasClass('fontsize_resetter')) {
         resetFontSize(this);
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
                     "postCrushes",
                     "replyReplies",
                     "massEditor",
                     "sidebarTweaks"];

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

function parseNames(st) {
   if (!st || st.length === 0) {
      return [];
   }
   return st.split(',').sort();
}

function serializeNames(arr) {
   return arr.sort().join(',');
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
   if (obj.tagName.toLowerCase() == "select") {
      setStorage(obj.name, jQuery(obj).val());
   }
   else if (obj.type == "checkbox") {
      setStorage(obj.name, (obj.checked ? 1 : 0));
   }
   else if (obj.type == "radio") {
      var val = obj.value;
      if (val === "1") { val = 1; }
      else if (val === "0") { val = 0; }
      setStorage(obj.name, val);
   }
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
      else if (obj.name === 'MissingE_askFixes_defaultTags' ||
               obj.name === 'MissingE_replyReplies_defaultTags' ||
               obj.name === 'MissingE_postingFixes_queueTags') {
         var val = trim(obj.value);
         val = val.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
                  .replace(/\s*,\s*/g,', ').replace(/,\s*$/,'')
                  .replace(/^\s*/,'').replace(/\s*$/,'');
         obj.value = val;
         setStorage(obj.name, obj.value);
      }
      else {
         setStorage(obj.name, (obj.value));
      }
   }
   if (obj.name === 'MissingE_bookmarker_format') {
      jQuery('#MissingE_bookmarker_format_sample').text(getBookmarkerFormat(new Date(), 'missing-e', obj.value));
   }
   else if (obj.name === 'MissingE_timestamps_format') {
      jQuery('#MissingE_timestamps_format_sample').text(getFormattedDate(new Date(), obj.value));
   }
}

function loadCheck(f, i, def) {
   if (getStorage(i,def) == 1) { f[i].checked = true; }
   else { f[i].checked = false; }
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
      if (v == "askFixes") {
         loadCheck(frm,'MissingE_askFixes_scroll',1);
         loadCheck(frm,'MissingE_askFixes_betterAnswers',0);
         loadCheck(frm,'MissingE_askFixes_tagAsker',1);
         frm.MissingE_askFixes_defaultTags.value = getStorage('MissingE_askFixes_defaultTags','');
         loadCheck(frm,'MissingE_askFixes_askDash',0);
         loadCheck(frm,'MissingE_askFixes_massDelete',1);
      }
      else if (v == "sidebarTweaks") {
         loadCheck(frm,'MissingE_sidebarTweaks_addSidebar',0);
         loadCheck(frm,'MissingE_sidebarTweaks_slimSidebar',0);
         loadCheck(frm,'MissingE_sidebarTweaks_followingLink',0);
         frm.MissingE_sidebarTweaks_retries.value = getStorage('MissingE_sidebarTweaks_retries',defaultRetries);
      }
      else if (v == "dashLinksToTabs") {
         loadCheck(frm,'MissingE_dashLinksToTabs_newPostTabs',1);
         loadCheck(frm,'MissingE_dashLinksToTabs_sidebar',0);
         loadCheck(frm,'MissingE_dashLinksToTabs_reblogLinks',0);
         loadCheck(frm,'MissingE_dashLinksToTabs_editLinks',0);
      }
      else if (v == "magnifier") {
         frm.MissingE_magnifier_retries.value = getStorage('MissingE_magnifier_retries',defaultRetries);
         loadCheck(frm,'MissingE_magnifier_magnifyAvatars',0);
      }
      else if (v == "bookmarker") {
         loadCheck(frm,'MissingE_bookmarker_addBar',1);
         var bmFormat = getStorage('MissingE_bookmarker_format',defaultFormat);
         frm.MissingE_bookmarker_format.value = bmFormat;
         jQuery('#MissingE_bookmarker_format_sample').text(getBookmarkerFormat(new Date(), 'missing-e', bmFormat));
      }
      else if (v == "timestamps") {
         frm.MissingE_timestamps_retries.value = getStorage('MissingE_timestamps_retries',defaultRetries);
         var tsFormat = getStorage('MissingE_timestamps_format',defaultFormat);
         frm.MissingE_timestamps_format.value = tsFormat;
         jQuery('#MissingE_timestamps_format_sample').text(getFormattedDate(new Date(), tsFormat));
      }
      else if (v == "postCrushes") {
         if (getStorage('MissingE_postCrushes_crushSize',1) == 1)
            document.getElementById("MissingE_postCrushes_crushSize_small").checked = true;
         else
            document.getElementById("MissingE_postCrushes_crushSize_large").checked = true;
         loadCheck(frm,'MissingE_postCrushes_addTags',1);
         loadCheck(frm,'MissingE_postCrushes_showPercent',1);
         frm.MissingE_postCrushes_prefix.value = getStorage('MissingE_postCrushes_prefix',"Tumblr Crushes:");
      }
      else if (v == "replyReplies") {
         if (getStorage('MissingE_replyReplies_smallAvatars',1) == 1)
            document.getElementById("MissingE_replyReplies_smallAvatars_small").checked = true;
         else
            document.getElementById("MissingE_replyReplies_smallAvatars_large").checked = true;
         loadCheck(frm,'MissingE_replyReplies_showAvatars',1);
         loadCheck(frm,'MissingE_replyReplies_addTags',1);
         frm.MissingE_replyReplies_defaultTags.value = getStorage('MissingE_replyReplies_defaultTags','');
         loadCheck(frm,'MissingE_replyReplies_newTab',1);
      }
      else if (v == "dashboardFixes") {
         loadCheck(frm,'MissingE_dashboardFixes_reblogQuoteFit',1);
         loadCheck(frm,'MissingE_dashboardFixes_wrapTags',1);
         loadCheck(frm,'MissingE_dashboardFixes_replaceIcons',1);
         //loadCheck(frm,'MissingE_dashboardFixes_timeoutAJAX',1);
         //frm.MissingE_dashboardFixes_timeoutLength.value = getStorage('MissingE_dashboardFixes_timeoutLength',defaultTimeout);
         loadCheck(frm,'MissingE_dashboardFixes_postLinks',1);
         loadCheck(frm,'MissingE_dashboardFixes_reblogReplies',0);
         loadCheck(frm,'MissingE_dashboardFixes_widescreen',0);
         loadCheck(frm,'MissingE_dashboardFixes_queueArrows',1);
         loadCheck(frm,'MissingE_dashboardFixes_expandAll',1);
         loadCheck(frm,'MissingE_dashboardFixes_massDelete',1);
      }
      else if (v == "betterReblogs") {
         loadCheck(frm,'MissingE_betterReblogs_passTags',1);
         loadCheck(frm,'MissingE_betterReblogs_autoFillTags',1);
         frm.MissingE_betterReblogs_retries.value = getStorage('MissingE_betterReblogs_retries',defaultRetries);
         loadCheck(frm,'MissingE_betterReblogs_quickReblog',0);
         if (getStorage('MissingE_betterReblogs_quickReblogAcctType',0) == 1)
            document.getElementById('MissingE_betterReblogs_quickReblogAcctType_Secondary').checked = true;
         else
            document.getElementById('MissingE_betterReblogs_quickReblogAcctType_Primary').checked = true;
         var qran = getStorage('MissingE_betterReblogs_quickReblogAcctName','');
         if (qran == '0') {
            qran = '';
         }
         frm.MissingE_betterReblogs_quickReblogAcctName.value = qran;
         jQuery(frm.MissingE_betterReblogs_quickReblogForceTwitter).val(getStorage('MissingE_betterReblogs_quickReblogForceTwitter','default'));
         loadCheck(frm,'MissingE_betterReblogs_fullText',0);
      }
      else if (v == "postingFixes") {
         loadCheck(frm,'MissingE_postingFixes_photoReplies',1);
         loadCheck(frm,'MissingE_postingFixes_uploaderToggle',1);
         loadCheck(frm,'MissingE_postingFixes_addUploader',1);
         loadCheck(frm,'MissingE_postingFixes_quickButtons',1);
         loadCheck(frm,'MissingE_postingFixes_blogSelect',0);
         loadCheck(frm,'MissingE_postingFixes_subEdit',1);
         frm.MissingE_postingFixes_subEditRetries.value = getStorage('MissingE_postingFixes_subEditRetries',defaultRetries);
         loadCheck(frm,'MissingE_postingFixes_tagQueuedPosts',0);
         frm.MissingE_postingFixes_queueTags.value = getStorage('MissingE_postingFixes_queueTags','');
      }
      else if (v == "reblogYourself") {
         loadCheck(frm,'MissingE_reblogYourself_postPage',1);
         loadCheck(frm,'MissingE_reblogYourself_dashboard',1);
         frm.MissingE_reblogYourself_retries.value = getStorage('MissingE_reblogYourself_retries',defaultRetries);
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

function resetFontSize(obj) {
   var input = jQuery(obj).siblings('input:text');
   input.val(defaultMaxBig);
   doSetting(input.get(0), true, defaultMaxBig, minFontSize, maxFontSize);
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
