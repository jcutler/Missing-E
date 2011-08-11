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

/*global locale,self */

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
            .replace(/%M/g,locale[lang].monthsShort[d.getMonth()])
            .replace(/%B/g,locale[lang].monthsLong[d.getMonth()])
            .replace(/%w/g,locale[lang].daysShort[d.getDay()])
            .replace(/%W/g,locale[lang].daysLong[d.getDay()])
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
   var windowHeight;
   if (self.innerHeight) {
      // all except Explorer
      windowHeight = self.innerHeight;
   }
   return windowHeight;
}

function escapeHTML(str) {
   return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
            .replace(/>/,'&gt;').replace(/</,'&lt;');
}
