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

/*global chrome */

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function addTags(link) {
   var i;
   if (link === undefined || link === null) {
      var div = document.getElementsByTagName("div")[0];
      var controls = div.getElementsByTagName("a");
      for (i=0; i<controls.length; i++) {
         if (/\/reblog/.test(controls[i].href)) {
            link = controls[i];
            break;
         }
      }
      if (link === undefined || link === null) {
         return false;
      }
   }

   var img = link.getElementsByTagName('img')[0];
   var theimg = new Image();
   theimg.onload = function() {
      var w = this.width;
      var h = this.height;
   
      var block = document.createElement('div');
      block.innerHTML = '<div class="half" style="height:' + h + 'px;"></div>' +
         '<div class="remhalf" style="width:' + (w-24) + 'px;height:' + h +
         'px;background:transparent url(\'' + img.src + '\') no-repeat ' +
         '-24px 0;float:right;"></div>';
      block.className = 'MissingE_reblog';
      block.style.height = h + 'px';
      block.style.width = (w+1) + 'px';
      link.replaceChild(block, img);
      var host, pid;
      var loc = location.href;
      loc = loc.substring(loc.indexOf("src=")+4);
      loc = loc.replace(/%3A/gi,":")
               .replace(/%2F/gi,"/");
      host = loc.match(/http:\/\/[^\/]*/)[0];
      pid = loc.match(/&pid=([0-9]*)/)[1];
      chrome.extension.sendRequest({greeting: "tags", pid: pid, url: host},
                                   function(response) {
         if (response.success) {
            link.firstChild.className += " MissingE_reblog_success";
            link.setAttribute('tags',response.data.join(','));
            if (response.fullText) {
               link.setAttribute('href',
                  link.getAttribute('href').replace(/\?/,'/text?'));
            }
         }
         else {
            link.firstChild.className += " MissingE_reblog_fail";
         }
      });
   
      link.addEventListener('mousedown',function(e){
         var tags = this.getAttribute('tags');
         if (tags !== undefined && tags !== null) {
            setReblogTags(this.getAttribute('tags').split(','));
         }
      }, false);
   };
   theimg.src = img.src;
   return true;
}

if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href)) {
   var st = document.createElement('style');
   st.type = 'text/css';
   st.innerHTML = '.MissingE_reblog { ' +
                     'float:left;' +
                     'margin-left:3px;' +
                     'display:inline-block;}' +
                  '.MissingE_reblog .half { ' +
                     'float:left;' +
                     'width:25px;' +
                     'background:transparent url("' +
                     chrome.extension.getURL('betterReblogs/reblog_tags.png') +
                     '") no-repeat 0 0; }' +
                  '.MissingE_reblog_success .half ' +
                     '{ background-position: -25px 0; } ' +
                  '.MissingE_reblog_fail .half ' +
                     '{ background-position:-50px 0; }';
   document.getElementsByTagName('head')[0].appendChild(st);
   chrome.extension.onRequest.addListener(function(request) {
      if (request.greeting !== "asker") { return; }
      if (request.name && request.name !== "") {
         document.addEventListener('mousedown', function(e) {
            var trg;
            if (e.target.tagName === "A" &&
                /^http:\/\/www\.tumblr\.com\/reblog/.test(e.target.href)) {
               trg = e.target;
            }
            else if (e.target.parentNode &&
                     e.target.parentNode.tagName === "A" &&
                     /^http:\/\/www\.tumblr\.com\/reblog/.test(e.target.parentNode.href)) {
               trg = e.target.parentNode;
            }
            else if (e.target.parentNode &&
                     e.target.parentNode.parentNode &&
                     e.target.parentNode.parentNode.tagName === "A" &&
                     /^http:\/\/www\.tumblr\.com\/reblog/.test(e.target.parentNode.parentNode.href)) {
               trg = e.target.parentNode.parentNode;
            }
            if (trg) {
               if (/MissingEname=/.test(trg.href)) {
                  return;
               }
               if (/\?/.test(trg.href)) {
                  trg.href += "&";
               }
               else {
                  trg.href += "?";
               }
               trg.href = trg.href.replace(/\?/,'/text?');
               trg.href += "MissingEname=" + request.name;
               trg.href += "&MissingEpost=" + encodeURIComponent(request.url);
            }
         }, false);
      }
   });
   if (!addTags()) {
      document.addEventListener('MissingEaddReblog',function(e){
         var item = e.target;
         if (item.tagName === 'A' && /\/reblog/.test(item.href)) {
            addTags(item);
         }
      }, false);
   }
}
else if (window.top === window) {
   var myasker = document.getElementsByClassName('asker');
   var name = "";
   var i;
   for (i=0; i<myasker.length; i++) {
      if (myasker[i].tagName === "A") {
         if (!(/[^a-zA-Z0-9\-]/.test(myasker[i].innerHTML))) {
            name = myasker[i].innerHTML;
            break;
         }
      }
   }
   if (name === "") {
      myasker = document.body.innerHTML
                     .match(/<a href="[^"]*">([a-zA-Z0-9\-]+)<\/a>\s*asked\:/);
      if (myasker && myasker.length > 1) {
         name = myasker[1];
      }
   }
   chrome.extension.sendRequest({greeting: "asker", name: name, url: location.href});
}

