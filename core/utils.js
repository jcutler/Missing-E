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

(function(){

var utils = {
   defaultRetries: 4,
   minRetries: 0,
   maxRetries: 20,
   defaultFormat: "%Y-%m-%D %H:%i",

   urlPatterns: {
      "askForm":      /^ask_form\/[^\/]+(\/success)?[\/]?$/,
      "bookmarklet":  /^share(\/\w+)?[\/]?$/,
      "blog":         /^blog\/[^\/]+(\/search\/[^\/]+)?(\/\d+)?[\/]?$/,
      "blogData":     /^blog\/[^\/]+\/((members|followers)(\/page\/\d+)?|settings)[\/]?$/,
      "crushes":      /^(blog\/[^\/]+\/)?new\/photo[\/]?$/,
      "dashboard":    /^(dashboard|show\/[^\/]*)([\/].*)?/,
      "dashboardOnly":/^dashboard([\/].*)?/,
      "drafts":       /^blog\/[^\/]+\/drafts[\/]?.*$/,
      "fanMail":      /^send(\/|_confirmation)?/,
      "followers":    /^blog\/[^\/]+\/followers[\/]?.*$/,
      "following":    /^following(\/page\/\d+)?[\/]?$/,
      "iframe":       /^dashboard\/iframe/,
      "likes":        /^like(s(\/.*)?|d\/by\/[^\/]+(\/.*)?)$/,
      "massEditor":   /^mega-editor\/[^\/]+(\/[0-9]+\/[0-9]+)?[\/]?$/,
      "messages":     /^(blog\/[^\/]+\/)?(messages|submissions|inbox)[\/]?.*$/,
      "post":         /^((blog\/[^\/]+\/)?new\/[^\/]+|edit\/\d+|share(\/\w+)?)[\/]?$/,
      "queue":        /^blog\/[^\/]+\/queue[\/]?.*$/,
      "reblog":       /^reblog\/\d+\/\w+(\/\w+)?[\/]?$/,
      "reply":        /^(blog\/[^\/]+\/)?new\/(text|photo)[\/]?$/,
      "settings":     /^blog\/[^\/]+\/settings[\/]?$/,
      "tagged":       /^tagged\/[^\/]+[\/]?.*$/,
      "upload":       /^upload(\/image)?/
   },

   buildTimestamp: function(inStamp) {
      var i, x, stamp, tmp, tz, d, dq;
      var dt = {};
      var today = new Date();
      if (this.isEDTfromUTC(today)) {
         today.setUTCHours(today.getUTCHours()-4);
      }
      else {
         today.setUTCHours(today.getUTCHours()-5);
      }
      dt.day = today.getUTCDay();
      stamp = inStamp.replace(/,/,'').split(" ");
      for (i=0; i<stamp.length; i++) {
         if (/^\d{4}$/.test(stamp[i])) {
            dt.year = parseInt(stamp[i], 10);
         }
         else if (/\d{1,2}:\d{2}$/.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2}):(\d{2})/);
            dt.hours = parseInt(tmp[1], 10);
            dt.minutes = parseInt(tmp[2].replace(/^0/,''), 10);
         }
         else if (/\d{1,2}:\d{2}(am|pm)/i.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2}):(\d{2})/);
            if (/pm$/i.test(stamp[i])) {
               dt.hours = parseInt(tmp[1], 10)+12;
               if (dt.hours === 24) { dt.hours = 12; }
            }
            else {
               dt.hours = parseInt(tmp[1], 10);
               if (dt.hours === 12) { dt.hours = 0; }
            }
            dt.minutes = parseInt(tmp[2].replace(/^0/,''), 10);
         }
         else if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            dt.date = parseInt(tmp[1], 10);
            dt.month = parseInt(tmp[2], 10);
            dt.year = parseInt(tmp[3], 10);
         }
         else if (/\d{1,2}(st|nd|rd|th)$/.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2})/);
            dt.date = parseInt(tmp[1], 10);
         }
         else if (/^[A-Za-z]+$/.test(stamp[i])) {
            var found = false;
            for (x=0; !found && x < this.getLocale("en")
                                       .monthsLong.length; x++) {
               if ((new RegExp(this.getLocale("en").monthsLong[x],"i"))
                     .test(stamp[i]) ||
                   (new RegExp(this.getLocale("en").monthsShort[x],"i"))
                     .test(stamp[i])) {
                  dt.month = x+1;
                  found = true;
               }
            }
            for (x=0; !found && x < this.getLocale("en")
                                       .daysLong.length; x++) {
               if ((new RegExp(this.getLocale("en").daysLong[x],"i"))
                     .test(stamp[i]) ||
                   (new RegExp(this.getLocale("en").daysShort[x], "i"))
                     .test(stamp[i])) {
                  dt.date = (x - dt.day - 7) % 7;
                  found = true;
               }
            }
         }
      }
      if (dt.year) {
         tz = this.isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" : "EST";
         d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                         dt.hours + ":" + dt.minutes + ":00 " + tz);
         return Math.round(d.getTime()/1000);
      }
      if (!dt.year) {
         if (dt.month) {
            dq = new Date(dt.month + "/" + dt.date + "/" +
                              today.getUTCFullYear() + " " + dt.hours +
                              ":" + dt.minutes + ":00 UTC");
            /* If more than a day ahead, month is in previous year */
            if (dq > today + 86400000) {
               dt.year = today.getUTCFullYear() - 1;
            }
            else {
               dt.year = today.getUTCFullYear();
            }
            tz = this.isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" :
                                                                     "EST";
            d = new Date(dt.month + "/" + dt.date + "/" + dt.year +
                             " " + dt.hours + ":" + dt.minutes + ":00 " +
                             tz);
            return Math.round(d.getTime()/1000);
         }
         else if (dt.date < 0) {
            dq = new Date((today.getUTCMonth()+1) + "/" +
                              today.getUTCDate() + "/" +
                              today.getUTCFullYear() + " " + dt.hours +
                              ":" + dt.minutes + ":00 UTC");
            /* If more than a month ahead, wrapped backwards across year */
            if (dq > today + 2764800000) {
               today.setUTCFullYear(dt.year);
            }
            /* If more than a day ahead, wrapped backwards across month */
            if (dq > today + 86400000) {
               today.setUTCMonth(today.getUTCMonth()-1);
            }
            today = new Date(today.valueOf()+86400000*dt.date);
            dt.date = today.getUTCDate();
            dt.month = today.getUTCMonth()+1;
            dt.year = today.getUTCFullYear();
            tz = this.isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" :
                                                                     "EST";
            d = new Date(dt.month + "/" + dt.date + "/" + dt.year +
                             " " + dt.hours + ":" + dt.minutes + ":00 " +
                             tz);
            return Math.round(d.getTime()/1000);
         }
         else if (!dt.date) {
            dt.year = today.getUTCFullYear();
            dt.month = today.getUTCMonth()+1;
            dt.date = today.getUTCDate();
            tz = this.isEDT(dt.year,dt.month,dt.date,dt.hours) ? "EDT" :
                                                                     "EST";
            d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                           dt.hours + ":" + dt.minutes + ":00 " + tz);
            return Math.round(d.getTime()/1000);
         }
      }
      return null;
   },

   createTag: function(lang, txt) {
      var theTag = document.createElement("div");
      var theSpan = document.createElement("span");
      var theA = document.createElement("a");
      theTag.className = "token";
      theSpan.className = "tag";
      theSpan.textContent = txt;
      theTag.appendChild(theSpan);
      theA.title = MissingE.getLocale(lang).removeTag;
      theA.href = "#";
      theA.textContent = "x";
      theA.addEventListener("click", function(e){
         var atag = this.parentNode;
         var tagbox = atag.parentNode;
         tagbox.removeChild(atag);
         document.getElementById("tag_editor_input").blur();
         e.preventDefault();
      }, false);
      theTag.appendChild(theA);
      return theTag;
   },

   escapeHTML: function(str) {
      return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
               .replace(/>/,'&gt;').replace(/</,'&lt;');
   },

   getBookmarkerFormat: function(d, user, format, lang) {
      var ret = this.getFormattedDate(d, format, lang);
      return ret.replace(/%u/g,user);
   },

   getFormattedDate: function(d, format, lang) {
      var ret = format;
      ret = ret.replace(/%Y/g,d.getFullYear())
               .replace(/%y/g,(d.getFullYear()%100))
               .replace(/%M/g,this.getLocale(lang).monthsShort[d.getMonth()])
               .replace(/%B/g,this.getLocale(lang).monthsLong[d.getMonth()])
               .replace(/%w/g,this.getLocale(lang).daysShort[d.getDay()])
               .replace(/%W/g,this.getLocale(lang).daysLong[d.getDay()])
               .replace(/%m/g,this.zeroPad(d.getMonth()+1,2))
               .replace(/%n/g,(d.getMonth()+1))
               .replace(/%D/g,this.zeroPad(d.getDate(),2))
               .replace(/%d/g,d.getDate())
               .replace(/%G/g,this.zeroPad((d.getHours()%12===0 ?
                                       "12" : d.getHours()%12),2))
               .replace(/%g/g,(d.getHours()%12===0 ? "12" : d.getHours()%12))
               .replace(/%H/g,this.zeroPad(d.getHours(),2))
               .replace(/%h/g,d.getHours())
               .replace(/%i/g,this.zeroPad(d.getMinutes(),2))
               .replace(/%s/g,this.zeroPad(d.getSeconds(),2))
               .replace(/%A/g,(d.getHours() < 12 ? "AM" : "PM"))
               .replace(/%a/g,(d.getHours() < 12 ? "am" : "pm"));
      return ret;
   },

   getLocale: function(lang) {
      if (typeof lang !== "string") {
         lang = "en";
      }
      lang = lang.toLowerCase();
      if (this.locale.hasOwnProperty(lang) &&
          this.locale[lang] !== false) {
         return this.locale[lang];
      }
      else {
         if (!this.locale.hasOwnProperty(lang)) {
             this.locale[lang] = false;
            console.log("Warning: Localization not found for language '" +
                        lang + "'");
         }
         return this.locale.en;
      }
   },

   getStorage: function(key, defVal) {
      var retval = localStorage[key];
      if (retval === undefined || retval === null || retval === "") {
         return defVal;
      }
      else {
         if (/[^\d]/.test(retval)) {
            return retval;
         }
         else {
            return parseInt(retval, 10);
         }
      }
   },

   isEDT: function(year, month, date, hours) {
      var add;
      var start = new Date("03/01/" + year + " 07:00:00 UTC");
      var day = start.getDay();
      if (day === 0) { add = 7; }
      else { add = 14-day; }
      start.setUTCDate(start.getUTCDate()+add);
      var end = new Date("11/01/" + year + " 06:00:00 UTC");
      day = end.getDay();
      if (day === 0) { add = 0; }
      else { add = 7-day; }
      end.setUTCDate(end.getUTCDate()+add);
      if (month>start.getUTCMonth()+1 && month<end.getUTCMonth()+1) {
         return true;
      }
      else if (month === start.getUTCMonth()+1) {
         if (date === start.getUTCDate()) {
            if (hours >= 2) {
               return true;
            }
            else {
               return false;
            }
         }
         else {
            return date > start.getUTCDate();
         }
      }
      else if (month === end.getUTCMonth()+1) {
         if (date === end.getUTCDate()) {
            if (hours >= 2) {
               return false;
            }
            else {
               return true;
            }
         }
         else {
            return date < end.getUTCDate();
         }
      }
      else {
         return false;
      }
   },

   isEDTfromUTC: function(dt) {
      var add;
      var start = new Date("03/01/" + dt.getUTCFullYear() + " 07:00:00 UTC");
      var day = start.getDay();
      if (day === 0) { add = 7; }
      else { add = 14-day; }
      start.setUTCDate(start.getUTCDate()+add);
      var end = new Date("11/01/" + dt.getUTCFullYear() + " 06:00:00 UTC");
      day = end.getDay();
      if (day === 0) { add = 0; }
      else { add = 7-day; }
      end.setUTCDate(end.getUTCDate()+add);
      return (dt>=start && dt<end);
   },

   isSameDay: function(dt) {
      if (typeof dt === "string") {
         dt = parseInt(dt,10);
      }
      var now = new Date();
      var then = new Date(dt);
      if (now > then + 86400000) {
         return false;
      }
      return now.getFullYear() === then.getFullYear() &&
             now.getMonth() === then.getMonth() &&
             now.getDate() === then.getDate();
   },

   isTumblrURL: function(fullURL, matches) {
      if (!/^http:\/\/www\.tumblr\.com\//.test(fullURL)) {
         return false;
      }
      else if (!matches) {
         return true;
      }
      var i;
      var url = fullURL.replace(/^http:\/\/www\.tumblr\.com\//,'')
                       .replace(/\?.*$/,'').replace(/#.*$/,'');
      for (i=0; i<matches.length; i++) {
         if (!this.urlPatterns.hasOwnProperty(matches[i])) {
            debug("Invalid Tumblr URL pattern: '" + matches[i] + "'");
         }
         else {
            if (this.urlPatterns[matches[i]].test(url)) {
               return true;
            }
         }
      }
      return false;
   },

   randomRange: function(from, to) {
      return Math.floor(Math.random() * (to - from + 1) + from);
   },

   setStorage: function(key, val) {
      localStorage[key] = val;
   },

   unescapeHTML: function(str) {
      var ret = str;
      while (/&#[0-9]*;/.test(ret)) {
         var entity = ret.match(/&#([0-9]+);/);
         var symbol = String.fromCharCode(entity[1]);
         ret = ret.replace(entity[0], symbol);
      }
      return ret.replace(/&amp;/g,'&').replace(/&quot;/g,'"')
               .replace(/&gt;/g,'>').replace(/&lt;/,'<');
   },

   zeroPad: function(num, len) {
      var ret = "";
      ret += num;
      while (ret.length < len) { ret = "0" + ret; }
      return ret;
   }
};

if (typeof window === "undefined" &&
    typeof require === "function" &&
    require("api-utils/xul-app")) {
   exports.utils = utils;
}
else if (!MissingE.hasOwnProperty("_utilsLoaded") ||
         !MissingE._utilsLoaded) {
   var i;
   MissingE._utilsLoaded = true;
   for (i in utils) {
      if (utils.hasOwnProperty(i)) {
         MissingE[i] = utils[i];
      }
   }

   Array.prototype.shuffle = function () {
      var s = [];
      while (this.length) {
         s.push(this.splice(Math.random() * this.length, 1)[0]);
      }
      while (s.length) {
         this.push(s.pop());
      }
      return this;
   };
}

}());
