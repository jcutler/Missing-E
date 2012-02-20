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

(function($) {

MissingE.utilities.options = {
   all_settings: {},

   exportSettings: function() {
      MissingE.utilities.exportSettings(function(response) {
         $('#settingsframe').get(0).src = response.url;
      });
   },

   setupPage: function() {
      $('input.toggler').checkbox();

      $('#nav a.nav_item').click(function() {
         if (this.id === 'close_nav') { window.close(); }
         else {
            MissingE.utilities.options.doshow(this.id.replace(/_nav$/,''));
         }
      });

      $('input.toggler').bind("change", function() {
         MissingE.utilities.options.toggle(this);
      }).click(function() {
         MissingE.utilities.options.toggle(this);
      });

      $('.section_options input.simple, .section_options input:checkbox, ' +
        '.section_options input:radio, .section_options select, ' +
        '#firefox_options input:checkbox')
            .bind("change", function() {
         MissingE.utilities.options.doSetting(this, false);
      });

      $('input.setting_prefix,input.setting_format,input.setting_text')
            .bind("keyup", function(e) {
         MissingE.utilities.options.doKeyUp(e, this, false);
      });

      $('input.blurable_setting').bind("blur", function() {
         MissingE.utilities.options.doSetting(this, false);
      });

      $('input.setting_retry').bind("change", function() {
         MissingE.utilities.options
            .doSetting(this, true, MissingE.defaultRetries,
                       MissingE.minRetries, MissingE.maxRetries);
      }).spin({
         min: MissingE.minRetries,
         max: MissingE.maxRetries,
         timeInterval: 100,
         lock: true,
         btnClass: 'spinner'
      });

      $('span.resetter').click(function() {
         if (this.id === "prefix-resetter") {
            MissingE.utilities.options.resetPrefix(this);
         }
         else if ($(this).hasClass('retry_resetter')) {
            MissingE.utilities.options.resetRetries(this);
         }
      });
   },

   getStorage: function(key,defaultValue) {
      if (extension.isFirefox ||
          extension.isSafari) {
         return MissingE.utilities.options.all_settings[key] == undefined ?
            defaultValue : MissingE.utilities.options.all_settings[key];
      }
      else if (extension.isOpera) {
         return widget.preferences[key] == undefined ? defaultValue : widget.preferences[key];
      }
      else {
         return localStorage[key] == undefined ? defaultValue : localStorage[key];
      }
   },

   setStorage: function(key,value) {
      if (extension.isFirefox ||
          extension.isSafari) {
         MissingE.utilities.options.all_settings[key] = value;
         extension.sendRequest("change-setting", {name: key, val: value});
      }
      else if (extension.isOpera) {
         widget.preferences[key] = value;
      }
      else {
         localStorage[key] = value;
      }
   },

   parseNames: function(st) {
      if (!st || st.length === 0) {
         return [];
      }
      return st.split(',').sort();
   },

   serializeNames: function(arr) {
      return arr.sort().join(',');
   },

   trim: function(str) {
      return str.replace(/^\s+/,'').replace(/\s+$/,'');
   },

   doKeyUp: function(e, obj, isNumber, defaultValue, min, max) {
      var key = e.which;
      if (key < 33 || key > 46) {
         MissingE.utilities.options.doSetting(obj, isNumber, defaultValue,
                                              min, max);
      }
   },

   doSetting: function(obj, isNumber, defaultValue, min, max) {
      if (obj.tagName.toLowerCase() == "select") {
         MissingE.utilities.options.setStorage(obj.name, $(obj).val());
      }
      else if (obj.type == "checkbox") {
         MissingE.utilities.options.setStorage(obj.name, (obj.checked ? 1 : 0));
      }
      else if (obj.type == "radio") {
         var val = obj.value;
         if (val === "1") { val = 1; }
         else if (val === "0") { val = 0; }
         else if (val === "2") { val = 2; }
         MissingE.utilities.options.setStorage(obj.name, val);
      }
      else if (obj.type == "text") {
         if (isNumber) {
            obj.value = MissingE.utilities.options.trim(obj.value);
            if (/[^\d]/.test(obj.value)) {
               obj.value = MissingE.utilities.options
                              .getStorage(obj.name, defaultValue);
            }
            else {
               var num;
               if (obj.value == '') num = min;
               else num = parseInt(obj.value, 10);
               if (num < min) num = min;
               if (num > max) num = max;
               obj.value = num;
               MissingE.utilities.options.setStorage(obj.name, num);
            }
         }
         else if (obj.name === 'MissingE_askTweaks_defaultTags' ||
                  obj.name === 'MissingE_replyReplies_defaultTags' ||
                  obj.name === 'MissingE_postingTweaks_queueTags') {
            var val = MissingE.utilities.options.trim(obj.value);
            val = val.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
                     .replace(/\s*,\s*/g,', ').replace(/,\s*$/,'')
                     .replace(/^\s*/,'').replace(/\s*$/,'');
            obj.value = val;
            MissingE.utilities.options.setStorage(obj.name, obj.value);
         }
         else {
            MissingE.utilities.options.setStorage(obj.name, (obj.value));
         }
      }
      if (obj.name === 'MissingE_bookmarker_format') {
         $('#MissingE_bookmarker_format_sample')
            .text(MissingE.getBookmarkerFormat(new Date(),
                                               'missing-e', obj.value));
      }
      else if (obj.name === 'MissingE_timestamps_format') {
         $('#MissingE_timestamps_format_sample')
            .text(MissingE.getFormattedDate(new Date(), obj.value));
      }
   },

   loadCheck: function(f, i, def) {
      if (!f || !f[i]) {
         console.log("Problem finding '" + f.id + "' option '" + i + "'.");
      }
      else if (MissingE.utilities.options.getStorage(i,def) == 1) {
         f[i].checked = true;
      }
      else { f[i].checked = false; }
   },

   loadSettings: function() {
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
      var i;
      $('span.defRetries').text(MissingE.defaultRetries);
      $('#versionnum').text(MissingE.utilities.options
                              .getStorage('MissingE_version',''));
      if (!extension.isFirefox) {
         extension.sendRequest("update", function(response) {
            if (response.update) {
               var uplink = 'http://missing-e.com/update/' + extension.appName;
               $('#updatelink').attr('href',uplink);
               $('#update').show();
            }
         });
      }
      if (extension.isFirefox) {
         var hwSec = document.getElementById('firefox_section');
         var hwFrm = document.getElementById('firefox_options');
         if (hwSec && hwFrm) {
            hwSec.style.display = "block";
            MissingE.utilities.options.loadCheck(hwFrm, 'MissingE_hideWidget', 0);
         }
      }
      for (i=0; i<componentList.length; i++) {
         var v = componentList[i];
         var frm = document.getElementById(v + "_options");
         if (!frm) {
            console.log("Unable to find '" + v + "' form.");
            continue;
         }
         var active = frm.active;
         if (MissingE.utilities.options
               .getStorage('MissingE_' + v + '_enabled', 1) == 1) {
            active.checked = true;
            $(frm).find('.section_main').css('opacity','1');
         }
         else {
            active.checked = false;
            $(frm).find('.section_main').css('opacity','0.5');
         }
         if (v == "askTweaks") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_askTweaks_scroll',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_askTweaks_betterAnswers',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_askTweaks_tagAsker',1);
            frm.MissingE_askTweaks_defaultTags.value = MissingE.utilities.options.getStorage('MissingE_askTweaks_defaultTags','');
            MissingE.utilities.options.loadCheck(frm,'MissingE_askTweaks_askDash',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_askTweaks_massDelete',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_askTweaks_smallFanMail',0);
         }
         else if (v == "sidebarTweaks") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_sidebarTweaks_addSidebar',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_sidebarTweaks_slimSidebar',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_sidebarTweaks_followingLink',0);
            frm.MissingE_sidebarTweaks_retries.value = MissingE.utilities.options.getStorage('MissingE_sidebarTweaks_retries',MissingE.defaultRetries);
         }
         else if (v == "dashLinksToTabs") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashLinksToTabs_newPostTabs',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashLinksToTabs_sidebar',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashLinksToTabs_reblogLinks',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashLinksToTabs_editLinks',0);
         }
         else if (v == "magnifier") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_magnifier_magnifyAvatars',0);
         }
         else if (v == "bookmarker") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_bookmarker_addBar',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_bookmarker_keyboardShortcut',1);
            var bmFormat = MissingE.utilities.options.getStorage('MissingE_bookmarker_format',MissingE.defaultFormat);
            frm.MissingE_bookmarker_format.value = bmFormat;
            $('#MissingE_bookmarker_format_sample').text(MissingE.getBookmarkerFormat(new Date(), 'missing-e', bmFormat));
         }
         else if (v == "timestamps") {
            frm.MissingE_timestamps_retries.value = MissingE.utilities.options.getStorage('MissingE_timestamps_retries',MissingE.defaultRetries);
            var tsFormat = MissingE.utilities.options.getStorage('MissingE_timestamps_format',MissingE.defaultFormat);
            frm.MissingE_timestamps_format.value = tsFormat;
            $('#MissingE_timestamps_format_sample').text(MissingE.getFormattedDate(new Date(), tsFormat));
         }
         else if (v == "postCrushes") {
            if (MissingE.utilities.options.getStorage('MissingE_postCrushes_crushSize',1) == 1)
               document.getElementById("MissingE_postCrushes_crushSize_small").checked = true;
            else
               document.getElementById("MissingE_postCrushes_crushSize_large").checked = true;
            MissingE.utilities.options.loadCheck(frm,'MissingE_postCrushes_addTags',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_postCrushes_showPercent',1);
            frm.MissingE_postCrushes_prefix.value = MissingE.utilities.options.getStorage('MissingE_postCrushes_prefix',"Tumblr Crushes:");
            MissingE.utilities.options.loadCheck(frm,'MissingE_postCrushes_newTab',1);
         }
         else if (v == "replyReplies") {
            if (MissingE.utilities.options.getStorage('MissingE_replyReplies_smallAvatars',1) == 1) {
               document.getElementById("MissingE_replyReplies_smallAvatars_small").checked = true;
            }
            else if (MissingE.utilities.options.getStorage('MissingE_replyReplies_smallAvatars',1) == 0) {
               document.getElementById("MissingE_replyReplies_smallAvatars_large").checked = true;
            }
            else if (MissingE.utilities.options.getStorage('MissingE_replyReplies_smallAvatars',1) == 2) {
               document.getElementById("MissingE_replyReplies_smallAvatars_medium").checked = true;
            }
            MissingE.utilities.options.loadCheck(frm,'MissingE_replyReplies_showAvatars',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_replyReplies_addTags',1);
            frm.MissingE_replyReplies_defaultTags.value = MissingE.utilities.options.getStorage('MissingE_replyReplies_defaultTags','');
            MissingE.utilities.options.loadCheck(frm,'MissingE_replyReplies_newTab',1);
         }
         else if (v == "dashboardTweaks") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_reblogQuoteFit',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_wrapTags',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_replaceIcons',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_postLinks',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_reblogReplies',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_widescreen',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_queueArrows',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_noExpandAll',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_massDelete',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_randomQueue',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_sortableNotes',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_notePreview',1);
            frm.MissingE_dashboardTweaks_previewRetries.value = MissingE.utilities.options.getStorage('MissingE_dashboardTweaks_previewRetries',MissingE.defaultRetries);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_simpleHighlight',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_pagedNav',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_dashboardTweaks_keyboardShortcut',1);
         }
         else if (v == "safeDash") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_safeDash_photosetAll',0);
         }
         else if (v == "betterReblogs") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_betterReblogs_passTags',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_betterReblogs_autoFillTags',1);
            frm.MissingE_betterReblogs_retries.value = MissingE.utilities.options.getStorage('MissingE_betterReblogs_retries',MissingE.defaultRetries);
            MissingE.utilities.options.loadCheck(frm,'MissingE_betterReblogs_quickReblog',0);
            if (MissingE.utilities.options.getStorage('MissingE_betterReblogs_quickReblogAcctType',0) == 1)
               document.getElementById('MissingE_betterReblogs_quickReblogAcctType_Secondary').checked = true;
            else
               document.getElementById('MissingE_betterReblogs_quickReblogAcctType_Primary').checked = true;
            var qran = MissingE.utilities.options.getStorage('MissingE_betterReblogs_quickReblogAcctName','');
            if (qran == '0') {
               qran = '';
            }
            frm.MissingE_betterReblogs_quickReblogAcctName.value = qran;
            $(frm.MissingE_betterReblogs_quickReblogForceTwitter).val(MissingE.utilities.options.getStorage('MissingE_betterReblogs_quickReblogForceTwitter','default'));
            MissingE.utilities.options.loadCheck(frm,'MissingE_betterReblogs_fullText',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_betterReblogs_reblogAsks',0);
            frm.MissingE_betterReblogs_askRetries.value = MissingE.utilities.options.getStorage('MissingE_betterReblogs_askRetries',MissingE.defaultRetries);
            MissingE.utilities.options.loadCheck(frm,'MissingE_betterReblogs_keyboardShortcut',1);
         }
         else if (v == "postingTweaks") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_photoReplies',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_addUploader',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_quickButtons',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_blogSelect',0);
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_subEdit',1);
            frm.MissingE_postingTweaks_subEditRetries.value = MissingE.utilities.options.getStorage('MissingE_postingTweaks_subEditRetries',MissingE.defaultRetries);
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_tagQueuedPosts',0);
            frm.MissingE_postingTweaks_queueTags.value = MissingE.utilities.options.getStorage('MissingE_postingTweaks_queueTags','');
            MissingE.utilities.options.loadCheck(frm,'MissingE_postingTweaks_showAnswers',0);
         }
         else if (v == "reblogYourself") {
            MissingE.utilities.options.loadCheck(frm,'MissingE_reblogYourself_postPage',1);
            MissingE.utilities.options.loadCheck(frm,'MissingE_reblogYourself_dashboard',1);
            frm.MissingE_reblogYourself_retries.value = MissingE.utilities.options.getStorage('MissingE_reblogYourself_retries',MissingE.defaultRetries);
         }
      }
   },

   resetPrefix: function() {
      var prefix = document.getElementById("postCrushes_options")
                     .MissingE_postCrushes_prefix;
      prefix.value = "Tumblr Crushes:";
      MissingE.utilities.options.doSetting(prefix, false);
   },

   resetRetries: function(obj) {
      var input = $(obj).siblings('input:text');
      input.val(MissingE.defaultRetries);
      MissingE.utilities.options
         .doSetting(input.get(0), true, MissingE.defaultRetries,
                    MissingE.minRetries, MissingE.maxRetries);
   },

   toggle: function(obj) {
      if (obj.name !== "active") { return false; }
      var frm = $(obj).closest("form");
      var component = frm.attr("id").match(/^[a-zA-Z]+/)[0];
      if (obj.checked) {
         obj.checked = false;
         MissingE.utilities.options
               .setStorage('MissingE_' + component + '_enabled', 0);
         frm.find('.section_main').css('opacity','0.5');
      }
      else {
         obj.checked = true;
         MissingE.utilities.options
               .setStorage('MissingE_' + component + '_enabled', 1);
         frm.find('.section_main').css('opacity','1');
      }
   },

   doshow: function(component) {
      var itm;
      if (component == 'about') {
         document.getElementById('about_nav').className = 'nav_item active';
         document.getElementById('about_container').style.display = 'block';
      }
      else {
         document.getElementById('about_nav').className = 'nav_item';
         document.getElementById('about_container').style.display = 'none';
      }
      if (component == 'dashboard') {
         document.getElementById('dashboard_nav').className = 'nav_item active';
         document.getElementById('dashboard_container').style.display = 'block';
      }
      else {
         document.getElementById('dashboard_nav').className = 'nav_item';
         document.getElementById('dashboard_container').style.display = 'none';
      }
      if (component == 'posting') {
         document.getElementById('posting_nav').className = 'nav_item active';
         document.getElementById('posting_container').style.display = 'block';
      }
      else {
         document.getElementById('posting_nav').className = 'nav_item';
         document.getElementById('posting_container').style.display = 'none';
      }
      if (component == 'social') {
         document.getElementById('social_nav').className = 'nav_item active';
         document.getElementById('social_container').style.display = 'block';
      }
      else {
         document.getElementById('social_nav').className = 'nav_item';
         document.getElementById('social_container').style.display = 'none';
      }
   },

   init: function() {
      extension.sendRequest("close-options");

      $('a[rel*=facebox]').facebox({
         loadingImage : '../lib/facebox/loading.gif',
         closeImage   : '../lib/facebox/closelabel.png'
      });

      $("#export_button").click(MissingE.utilities.options.exportSettings);
      $("#import").change(function() {
         MissingE.utilities.importSettings(this, $('#settingsframe').get(0));
      });

      if (extension.isFirefox ||
          extension.isSafari) {
         extension.sendRequest("all-settings", function(response) {
            MissingE.utilities.options.all_settings = response;
            MissingE.utilities.options.loadSettings();
            MissingE.utilities.options.setupPage();
         });
      }
      else {
         MissingE.utilities.options.loadSettings();
         MissingE.utilities.options.setupPage();
      }
   }
};

$(document).ready(function($) {
   MissingE.utilities.options.init();
});

}(jQuery));
