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

/*global self */ 

var MissingE_startup;

if (!(/http:\/\/www\.tumblr\.com\/customize/.test(location.href)) &&
    !(/http:\/\/www\.tumblr\.com\/upload\/image/.test(location.href))) {
   var fr = /http:\/\/www\.tumblr\.com\/dashboard\/iframe/
               .test(location.href) ||
            /http:\/\/www\.tumblr\.com\/ask_form\//.test(location.href);
   if (document.body.id !== 'tinymce') {
      self.postMessage({greeting: "start", isFrame: fr, url: location.href,
                                              bodyId: document.body.id});
   }
}

self.on('message', function (message) {
   if (message.greeting !== 'update') { return; }
   var up = document.getElementById('missinge_updatenotice');
   if (up && message.update) {
      up.setAttribute('title', message.msg);
      var post = '';
      if (message.link !== '') {
         post = 'post/' + message.link;
      }
      up.onclick = function() {
         window.open('http://missinge.infraware.ca/update?b=firefox');
      };
      up.style.display = 'block';
   }
});

self.on('message', function (message) {
   if (message.greeting !== "startup") {
      return;
   }
   var i;
   if (MissingE_startup) { return; }
   MissingE_startup = true;
   if (/http:\/\/www\.tumblr\.com\/blog\/[^\/]*\/submissions/
         .test(location.href) ||
       /http:\/\/www\.tumblr\.com\/blog\/[^\/]*\/messages/
         .test(location.href) ||
       /http:\/\/www\.tumblr\.com\/inbox/.test(location.href) ||
       /http:\/\/www\.tumblr\.com\/submissions/.test(location.href)) {
      document.domain = "tumblr.com";
   }
   var info = "'Missing e' (v" + message.version + ") Startup on ";
   info += message.url + "\n";
   for (i in message) {
      if (message.hasOwnProperty(i)) {
         if (i !== 'url' &&
             i !== 'isFrame' &&
             !(/_fill$/.test(i)) &&
             i !== 'greeting' &&
             i !== 'extensionURL' &&
             i !== 'version') {
            info += i + ": " + (message[i] ? "active" : "inactive") +
                     "\n";
         }
      }
   }
   console.log(info);

   var html = document.getElementsByTagName('html');
   var lang;
   if (html && html[0]) { lang = html[0].getAttribute('lang'); }
   if (!lang) { lang = 'en'; }
   self.postMessage({greeting: "update", lang: lang});
});

