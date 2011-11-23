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

var MissingE = {};

var extension = {
   isChrome: false,
   isFirefox: true,
   isOpera: false,
   isSafari: false,
   callbacks: {},
   _hasCallback: function(name,func) {
      var i;
      for (i=0; i<this.callbacks[name].length; i++) {
         if (this.callbacks[name][i] === func) {
            return true;
         }
      }
      return false;
   },
   addAjaxListener: function(func) {
                       console.log(document);
                       console.log(func);
      if (typeof func !== "function") { return false; }
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_\d+)/g);
         func(type, list);
      }, false);
   },
   sendRequest: function(name, request, callback) {
      var i;
      if (!this.callbacks.hasOwnProperty(name)) {
         this.callbacks[name] = [];
      }
      if (callback &&
          !this._hasCallback(name, callback)) {
         this.callbacks[name].push(callback);
      }
      request.greeting = name;
      self.postMessage(request);
   }
};

self.on("message", function(response) {
   var i;
   if (extension.callbacks.hasOwnProperty(response.greeting)) {
      for (i=0; i<extension.callbacks[response.greeting].length; i++) {
         extension.callbacks[response.greeting][i](response);
      }
   }
});
