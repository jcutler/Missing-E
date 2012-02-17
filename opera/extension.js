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

/*global chrome, extension, MissingE */

(function(){

if (typeof MissingE !== "undefined") { return; }

MissingE = {
   packages: {},
   utilities: {
      exportSettings: function(callback) {
      },

      importSettings: function(input) {
      }
   }
};

extension = {
   appName: "opera",
   isChrome: false,
   isFirefox: false,
   isOpera: true,
   isSafari: false,
   _ajaxListeners: null,
   _fileCache: {},
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
      document.addEventListener("receiveOperaMessage", function(evt) {
         extension.showMessage(evt);
         var i;
         if (evt.data.greeting === "sendFiles") {
            for (i in evt.data.files) {
               if (evt.data.files.hasOwnProperty(i)) {
                  extension._fileCache[i] = evt.data.files[i];
               }
            }
         }
         else if (evt.data.greeting === "sendImages") {
            for (i in evt.data.imgs) {
               if (evt.data.imgs.hasOwnProperty(i)) {
                  extension._fileCache[i] = evt.data.imgs[i];
               }
            }
         }
         else if (extension._listeners.hasOwnProperty(evt.data.greeting)) {
            for (i=0; i<extension._listeners[evt.data.greeting].length; i++) {
               extension._listeners[evt.data.greeting][i](evt.data);
            }
         }
      }, false);
   },

   _sendMessage: function(request) {
      var msgEvt = document.createEvent("MessageEvent");
      msgEvt.initMessageEvent("sendOperaMessage", true, true,
                              request, location.origin, 0,
                              window, null);
      document.dispatchEvent(msgEvt);
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
      if (this._fileCache.hasOwnProperty(rel)) {
         return this._fileCache[rel];
      }
      else {
         return null;
      }
   },

   hasBaseURL: function() {
      return true;
   },

   insertStyleSheet: function(url) {
      var ss = document.createElement("style");
      ss.setAttribute("type","text/css");
      ss.textContent = extension.getURL(url);
      document.getElementsByTagName("head")[0].appendChild(ss);
   },

   openWindow: function(addr) {
      window.open(addr);
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

   showMessage: function(e) {
      var msg = "", i;
      var request = e.data;
      msg = "\"" + e.data.greeting + "\" message from: " + e.origin;
      for (i in e.data) {
         if (e.data.hasOwnProperty(i) && i !== "greeting") {
            msg += "\n   " + i + " = " + e.data[i];
         }
      }
      console.log(msg);
   },

   sendRequest: function(name, request, callback) {
      if (!request) {
         request = {};
      }
      if (typeof callback === "undefined" &&
          typeof request === "function") {
         callback = request;
         request = {};
      }
      request.greeting = name;
      this.addListener(name, callback);
      this._sendMessage(request);
   }
};

}());
