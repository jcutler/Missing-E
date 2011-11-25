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

/*global safari */

var MissingE = {
   packages: {}
};

var extension = {
   isChrome: false,
   isFirefox: false,
   isOpera: false,
   isSafari: true,
   _ajaxListeners: null,
   _listeners: null,

   _hasAjaxListener: function(func) {
      return this._ajaxListeners.indexOf(func) >= 0;
   },

   _hasListener: function(name, func) {
      return this._listeners[name].indexOf(func) >= 0;
   },

   _registerAjaxListener: function() {
      this._ajaxListeners = [];
      document.addEventListener('MissingEajax', function(e) {
         var i;
         for (i=0; i<extension._ajaxListeners.length; i++) {
            extension._ajaxListeners[i](e.data.type, e.data.list);
         }
      }, false);
   },

   _registerListener: function() {
      this._listeners = {};
      safari.self.addEventListener("message", function(response) {
         var i;
         if (extension._listeners.hasOwnProperty(response.name)) {
            for (i=0; i<extension._listeners[response.name].length; i++) {
               extension._listeners[response.name][i](response.message);
            }
         }
      });
   },

   addAjaxListener: function(func) {
      if (typeof func !== "function") { return false; }
      if (this._ajaxListeners === null) {
         this._registerAjaxListener();
      }
      if (!this._hasAjaxListener(func)) {
         this._ajaxListeners.push(func);
      }
   },

   addListener: function(name, func) {
      if (typeof func !== "function") { return false; }
      if (this._listeners === null) {
         this._registerListener();
      }
      if (!this._listeners.hasOwnProperty(name)) {
         this._listeners[name] = [];
      }
      if (!this._hasListener(name, func)) {
         this._listeners[name].push(func);
      }
   },

   getURL: function(rel) {
      return safari.extension.baseURI + rel;
   },

   hasBaseURL: function() {
      return true;
   },

   removeAjaxListener: function(func) {
      var idx;
      if (this._ajaxListeners === null) {
         return null;
      }
      idx = this._ajaxListeners.indexOf(func);
      if (idx >= 0) {
         return this._ajaxListeners.splice(idx, 1);
      }
      else {
         return false;
      }
   },

   removeListener: function(name, func) {
      var idx;
      if (this._listeners === null ||
          !this._listeners.hasOwnProperty(name)) {
         return null;
      }
      idx = this._listeners[name].indexOf(func);
      if (idx >= 0) {
         return this._listeners[name].splice(idx, 1);
      }
      else {
         return null;
      }
   },

   sendRequest: function(name, request, callback) {
      this.addListener(name, callback);
      safari.self.tab.dispatchMessage(name, request);
   }
};
