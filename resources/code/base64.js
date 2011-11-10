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

var Base64 = {
   _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
   
   encode: function(input) {
      var o = "";
      var c1, c2, c3, e1, e2, e3, e4;
      var i = 0;

      input = Base64._utf8_encode(input);

      while (i < input.length) {
         c1 = input.charCodeAt(i++);
         c2 = input.charCodeAt(i++);
         c3 = input.charCodeAt(i++);
         e1 = c1 >> 2;
         e2 = ((c1 & 3) << 4) | (c2 >> 4);
         e3 = ((c2 & 15) << 2) | (c3 >> 6);
         e4 = c3 & 63;

         if (isNaN(c2)) { e3 = e4 = 64; }
         else if (isNaN(c3)) { e4 = 64; }

         o = o + this._keyStr.charAt(e1) + this._keyStr.charAt(e2) +
                 this._keyStr.charAt(e3) + this._keyStr.charAt(e4);
      }
      return o;
   },

   decode: function(input) {
      var o = "";
      var c1, c2, c3, e1, e2, e3, e4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g,"");

      while (i < input.length) {
         e1 = this._keyStr.indexOf(input.charAt(i++));
         e2 = this._keyStr.indexOf(input.charAt(i++));
         e3 = this._keyStr.indexOf(input.charAt(i++));
         e4 = this._keyStr.indexOf(input.charAt(i++));

         c1 = (e1 << 2) | (e2 >> 4);
         c2 = ((e2 & 15) << 4) | (e3 >> 2);
         c3 = ((e3 & 3) << 6) | e4;

         o = o + String.fromCharCode(c1);

         if (e3 !== 64) {
            o = o + String.fromCharCode(c2);
         }
         if (e4 !== 64) {
            o = o + String.fromCharCode(c3);
         }
      }

      o = Base64._utf8_decode(o);
      return o;
   },

   _utf8_encode: function(str) {
      str = str.replace(/\r\n/g,"\n");
      var utftext = "";

      for (var n = 0; n < str.length; n++) {
         var c = str.charCodeAt(n);
         if (c < 128) {
            utftext += String.fromCharCode(c);
         }
         else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
         }
         else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
         }
      }

      return utftext;
   },

   _utf8_decode: function(utftext) {
      var str = "";
      var i = 0;
      var c, c1, c2;
      c = c1 = c2 = 0;
      
      while (i < utftext.length) {
         c = utftext.charCodeAt(i);
 
         if (c < 128) {
            str += String.fromCharCode(c);
            i++;
         }
         else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
         }
         else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
         }
      }
      return str;
   }
};
