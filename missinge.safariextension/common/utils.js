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

/*global locale */

var urlPatterns = {
   "askForm":    /^ask_form\/[^\/]+$/,
   "blog":       /^blog\/[^\/]+(\/search\/[^\/]+)?(\/\d+)?[\/]?$/,
   "blogData":   /^blog\/[^\/]+\/((members|followers)(\/page\/\d+)?|settings)[\/]?$/,
   "crushes":    /^(blog\/[^\/]+\/)?new\/photo[\/]?$/,
   "dashboard":  /^dashboard(\/search\/[^\/]+)?(\/\d+){0,2}[\/]?$/,
   "drafts":     /^blog\/[^\/]+\/drafts[\/]?.*$/,
   "followers":  /^blog\/[^\/]+\/followers[\/]?.*$/,
   "following":  /^following(\/page\/\d+)?[\/]?$/,
   "iframe":     /^dashboard\/iframe/,
   "likes":      /^like(s(\/.*)?|d\/by\/[^\/]+(\/.*)?)$/,
   "massEditor": /^mega-editor\/[^\/]+[\/]?$/,
   "messages":   /^(blog\/[^\/]+\/)?(messages|submissions|inbox)[\/]?.*$/,
   "post":       /^((blog\/[^\/]+\/)?new\/[^\/]+|edit\/\d+|share(\/\w+))[\/]?$/,
   "queue":      /^blog\/[^\/]+\/queue[\/]?.*$/,
   "reblog":     /^reblog\/\d+\/\w+(\/\w+)?[\/]?$/,
   "reply":      /^(blog\/[^\/]+\/)?new\/(text|photo)[\/]?$/,
   "settings":   /^blog\/[^\/]+\/settings[\/]?$/,
   "tagged":     /^tagged\/[^\/]+[\/]?.*$/
};

function isTumblrURL(fullURL, matches) {
   if (!/^http:\/\/www\.tumblr\.com\//.test(fullURL) ||
       !matches) {
      return false;
   }

   var i;
   var url = fullURL.replace(/^http:\/\/www\.tumblr\.com\//,'')
                    .replace(/\?.*$/,'');
   for (i=0; i<matches.length; i++) {
      if (!urlPatterns.hasOwnProperty(matches[i])) {
         debug("Invalid Tumblr URL pattern: '" + matches[i] + "'");
      }
      else {
         if (urlPatterns[matches[i]].test(url)) {
            return true;
         }
      }
   }
   return false;
}

function zeroPad(num, len) {
   var ret = "";
   ret += num;
   while (ret.length < len) { ret = "0" + ret; }
   return ret;
}

function getLocale(lang) {
   if (typeof lang !== "string") {
      lang = "en";
   }
   lang = lang.toLowerCase();
   if (locale.hasOwnProperty(lang) &&
       locale[lang] !== false) {
      return locale[lang];
   }
   else {
      if (!locale.hasOwnProperty(lang)) {
         locale[lang] = false;
         console.log("Warning: Localization not found for language '" +
                     lang + "'");
      }
      return locale.en;
   }
}

function getFormattedDate(d, format, lang) {
   var ret = format;
   ret = ret.replace(/%Y/g,d.getFullYear())
            .replace(/%y/g,(d.getFullYear()%100))
            .replace(/%M/g,getLocale(lang).monthsShort[d.getMonth()])
            .replace(/%B/g,getLocale(lang).monthsLong[d.getMonth()])
            .replace(/%w/g,getLocale(lang).daysShort[d.getDay()])
            .replace(/%W/g,getLocale(lang).daysLong[d.getDay()])
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

function getBookmarkerFormat(d, user, format, lang) {
   var ret = getFormattedDate(d, format, lang);
   return ret.replace(/%u/g,user);
}

function getPageHeight() {
   return window.innerHeight;
}

function escapeHTML(str) {
   return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
            .replace(/>/,'&gt;').replace(/</,'&lt;');
}

function unescapeHTML(str) {
   var ret = str;
   while (/&#[0-9]*;/.test(ret)) {
      var entity = ret.match(/&#([0-9]+);/);
      var symbol = String.fromCharCode(entity[1]);
      ret = ret.replace(entity[0], symbol);
   }
   return ret.replace(/&amp;/g,'&').replace(/&quot;/g,'"')
            .replace(/&gt;/g,'>').replace(/&lt;/,'<');
}

function randomRange(from, to) {
   return Math.floor(Math.random() * (to - from + 1) + from);
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
