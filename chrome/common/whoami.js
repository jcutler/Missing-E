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

/*global chrome, window */

if ((window.top === window &&
    !(/http:\/\/www\.tumblr\.com\/customize/.test(location.href))) ||
    /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href)) {
   chrome.extension.sendRequest({greeting: "start", url: location.href,
                                 bodyId: document.body.id}, function(response){
      var i;
      var active = JSON.parse(response);
      var info = "'Missing e' Startup on ";
      info += active.url + "\n";
      for (i in active) {
         if (active.hasOwnProperty(i)) {
            if (i !== 'url') {
               info += i + ": " + (active[i] ? "active" : "inactive") + "\n";
            }
         }
      }
      console.log(info);
   });

   var scr = document.createElement('script');
   scr.setAttribute('type','text/javascript');
   scr.innerHTML = 'Ajax.Responders.register({' +
      'onCreate: function(request) {' +
         'request["timeoutId"] = window.setTimeout(function() {' +
            'if (request.transport.readyState >= 1 && ' +
                 'request.transport.readyState <= 3) {' +
               'console.log("TIMEOUT");' +
               'request.transport.abort();' +
               'if (request.options["onFailure"]) {' +
                  'request.options.onFailure(request.transport, ' +
                                             'request.json);' +
               '}' +
            '}' +
         '}, 10000);' +
      '},' +
      'onComplete: function(response){' +
         'window.clearTimeout(request["timeoutId"]);' +
         'console.log(response);' +
         'if ((/\\/dashboard\\/[0-9]+\\/[0-9]+\\?lite$/' +
               '.test(response.url)) && ' +
              'response.transport.status === 200 && ' +
              '!(/<!-- START POSTS -->/' +
                 '.test(response.transport.responseText))) {' +
            'if (request.options["onFailure"]) {' +
               'response.options.onFailure(request.transport, request.json);' +
            '}' + 
         '}' +
      '}' +
   '});';
   document.getElementsByTagName('head')[0].appendChild(scr);
}
