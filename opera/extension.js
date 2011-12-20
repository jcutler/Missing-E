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
   isChrome: false,
   isFirefox: false,
   isOpera: true,
   isSafari: false,
   _ajaxListeners: null,
   _listeners: null,

   _hasAjaxListener: function(func) {
   },

   _hasListener: function(name, func) {
   },

   _registerAjaxListener: function() {
   },

   _registerListener: function() {
   },

   addAjaxListener: function(func) {
   },

   addListener: function(name, func) {
   },

   getURL: function(rel) {
   },

   hasBaseURL: function() {
   },

   insertStyleSheet: function() {
   },

   openWindow: function(addr) {
   },

   removeAjaxListener: function(func) {
   },

   removeListener: function(name, func) {
   },

   sendRequest: function(name, request, callback) {
   }
};

}());
