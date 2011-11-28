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

/*global extension, MissingE, self */

(function(){

if (typeof MissingE !== "undefined") { return; }

MissingE = {
   packages: {},
   utilities: {
      exportSettings: function(callback) {
         extension.sendRequest("exportOptions", {}, callback);
      },

      importSettings: function(input, frame) {
         var form = $(input).closest("form").get(0);
         if (input.files[0]) {
            var formData = new FormData(form);
            formData.append("import", input.files[0]);
            this._intervalCount = 0;
            this._interval = setInterval(function() {
               var xmlDoc = frame.contentDocument;
               var importedSettings = {};
               if (xmlDoc.childNodes[1] &&
                   xmlDoc.childNodes[1].nodeName === "parsererror") {
                  clearInterval(this._interval);
                  frame.src = "";
                  form.reset();
                  alert("Imported settings file is not valid XML.");
                  return;
               }
               else if (xmlDoc.readyState === "complete" &&
                        xmlDoc.childNodes[0].nodeName === "missing-e") {
                  clearInterval(this._interval);
                  $('missing-e setting', xmlDoc).each(function(i) {
                     importedSettings[$(this).find('name').text()] =
                        $(this).find('value').text();
                  });
                  frame.src = "";
                  form.reset();
                  extension.sendRequest("importOptions",
                                        {data: importedSettings},
                                        function(response) {
                     if (response.msg) { alert(response.msg); }
                     if (response.success) { window.location.reload(); }
                     else {
                        form.reset();
                     }
                  });
               }
               else if (this._intervalCount++ > 15) {
                  clearInterval(this._interval);
                  frame.src = "";
                  form.reset();
                  alert("Problem uploading file. Please try again later.");
               }
            }, 1000);
            form.submit();
         }
         else {
            form.reset();
         }
      }
   }
};

extension = {
   isChrome: false,
   isFirefox: true,
   isOpera: false,
   isSafari: false,
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
         var type = e.data.match(/^[^:]*/)[0];
         var list = e.data.match(/(post_\d+)/g);
         for (i=0; i<extension._ajaxListeners.length; i++) {
            extension._ajaxListeners[i](type, list);
         }
      }, false);
   },

   _registerListener: function() {
      this._listeners = {};
      self.on("message", function(response) {
         var i;
         if ((response.greeting === "settings" ||
              response.greeting === "addMenu") &&
             !extension._baseURL) {
            extension._baseURL = response.extensionURL;
            document.body.setAttribute("data-MissingE-extensionURL",
                                       response.extensionURL);
         }
         if (extension._listeners.hasOwnProperty(response.greeting)) {
            for (i=0; i<extension._listeners[response.greeting].length; i++) {
               extension._listeners[response.greeting][i](response);
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
      if (!this.hasBaseURL()) {
         return rel;
      }
      else {
         return this._baseURL + rel;
      }
   },

   hasBaseURL: function() {
      if (document.body &&
          document.body.hasAttribute("data-MissingE-extensionURL")) {
         this._baseURL =
            document.body.getAttribute("data-MissingE-extensionURL");
      }
      return (typeof this._baseURL !== "undefined");
   },

   openWindow: function(addr) {
      self.postMessage({greeting: "open", url: addr});
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
      if (!request) {
         request = {};
      }
      request.greeting = name;
      self.postMessage(request);
   }
};

}());
