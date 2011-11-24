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

if (typeof MissingE !== "undefined") { return; }

MissingE = {
   packages: {}
};

extension = {
   isChrome: false,
   isFirefox: true,
   isOpera: false,
   isSafari: false,
   _listeners: {},
   _hasListener: function(name,func) {
      var i;
      for (i=0; i<this._listeners[name].length; i++) {
         if (this._listeners[name][i] === func) {
            return true;
         }
      }
      return false;
   },
   addAjaxListener: function(func) {
      if (typeof func !== "function") { return false; }
      document.addEventListener('MissingEajax', function(e) {
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_\d+)/g);
         func(type, list);
      }, false);
   },
   addListener: function(name, func) {
      if (!this._listeners.hasOwnProperty(name)) {
         this._listeners[name] = [];
      }
      if (func &&
          !this._hasListener(name, func)) {
         this._listeners[name].push(func);
      }
   },
   getURL: function(rel) {
      return this._baseURL + rel;
   },
   hasBaseURL: function() {
      return (typeof this._baseURL !== "undefined");
   },
   sendRequest: function(name, request, callback) {
      this.addListener(name, callback);
      if (!request) {
         request = {};
      }
      request.greeting = name;
      self.postMessage(request);
   }
};

self.on("message", function(response) {
   var i;
   if (response.greeting === "settings" &&
       !extension._baseURL) {
         extension._baseURL = response.extensionURL;
   }
   if (extension._listeners.hasOwnProperty(response.greeting)) {
      for (i=0; i<extension._listeners[response.greeting].length; i++) {
         extension._listeners[response.greeting][i](response);
      }
   }
});

})();
