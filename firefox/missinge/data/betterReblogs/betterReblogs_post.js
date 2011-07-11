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

function setReblogTags(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
}

function addTags(link) {
   var i;
   if (link === undefined || link === null) {
      var div = document.getElementsByTagName("div")[0];
      var controls = div.getElementsByTagName("a");
      for (i=0; i<controls.length; i++) {
         if (/reblog/.test(controls[i].href)) {
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
      self.postMessage({greeting:"tags", pid: pid, url: host});
   
      link.addEventListener('mousedown',function(e){
         if (e.which === 1 || e.which === 2) {
            var tags = this.getAttribute('tags');
            if (tags !== undefined && tags !== null) {
               setReblogTags(this.getAttribute('tags').split(','));
            }
         }
      }, false);
   };
   theimg.src = img.src;
   return true;
}

function receiveTags(message) {
   if (message.greeting !== "tags") { return; }
   var i,link;
   var div = document.getElementsByTagName("div")[0];
   var controls = div.getElementsByTagName("a");
   for (i=0; i<controls.length; i++) {
      if (/reblog/.test(controls[i].href)) {
         link = controls[i];
         break;
      }
   }
   if (link !== undefined && link !== null) {
      if (message.success) {
         link.firstChild.className += " MissingE_reblog_success";
         link.setAttribute('tags',message.data.join(','));
         if (message.fullText) {
            link.setAttribute('href',
               link.getAttribute('href').replace(/\?/,'/text?'));
         }
      }
      else {
         link.firstChild.className += " MissingE_reblog_fail";
      }
   }
}

self.on('message', function(message) {
   if (message.greeting !== "settings" ||
       message.component !== "betterReblogs" ||
       message.subcomponent !== "post") {
      return;
   }

   self.on("message", receiveTags);

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
                     message.extensionURL + 'betterReblogs/reblog_tags.png' +
                     '") no-repeat 0 0; }' +
                  '.MissingE_reblog_success .half ' +
                     '{ background-position: -25px 0; } ' +
                  '.MissingE_reblog_fail .half ' +
                     '{ background-position:-50px 0; }';
   document.getElementsByTagName('head')[0].appendChild(st);

   if (!addTags()) {
      document.addEventListener('MissingEaddReblog',function(e){
         var item = e.target;
         if (item.tagName === 'A' && /reblog/.test(item.href)) {
            addTags(item);
         }
      }, false);
   }
});

self.postMessage({greeting: "settings", component: "betterReblogs",
                  subcomponent: "post"});
