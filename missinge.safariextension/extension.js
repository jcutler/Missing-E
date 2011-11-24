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

var MissingE = {
   packages: {}
};

var extension = {
   isChrome: false,
   isFirefox: false,
   isOpera: false,
   isSafari: true,
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
      if (typeof func !== "function") { return false; }
      $(document).bind('MissingEajax', function(e) {
         func(e.originalEvent.data.type, e.originalEvent.data.list);
      });
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
      safari.self.tab.dispatchMessage(name, request);
   }
};

safari.self.addEventListener("message", function(response) {
   var i;
   if (extension.callbacks.hasOwnProperty(response.name)) {
      for (i=0; i<extension.callbacks[response.name].length; i++) {
         extension.callbacks[response.name][i](response.message);
      }
   }
});
