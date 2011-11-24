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

(function(){

if (typeof MissingE === "undefined") { return; }

MissingE.packages.betterReblogsPost = {

   setReblogTags: function(tags) {
      localStorage.setItem('tbr_ReblogTags',tags.join(','));
   },

   addTags: function(link) {
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
         block.innerHTML = '<div class="half" style="height:' + h + 'px;">' +
            '</div><div class="remhalf" style="width:' + (w-24) +
            'px;height:' + h + 'px;background:transparent url(\'' + img.src +
            '\') no-repeat -24px 0;float:right;"></div>';
         block.className = 'MissingE_reblog';
         block.style.height = h + 'px';
         block.style.width = (w+1) + 'px';
         link.replaceChild(block, img);
         var host, pid;
         var loc = location.href;
         loc = loc.substring(loc.indexOf("src=")+4);
         loc = loc.replace(/%3A/gi,":").replace(/%2F/gi,"/");
         host = loc.match(/http:\/\/[^\/]*/)[0];
         pid = loc.match(/&pid=(\d*)/)[1];
         extension.sendRequest("tags", {pid: pid, url: host},
                               MissingE.packages.betterReblogsPost.receiveTags);

         link.addEventListener('mousedown',function(){
            var tags = this.getAttribute('tags');
            if (tags !== undefined && tags !== null) {
               MissingE.packages.betterReblogsPost
                  .setReblogTags(this.getAttribute('tags').split(','));
            }
         }, false);
      };
      theimg.src = img.src;
      return true;
   },

   receiveTags: function(response) {
      var i,link;
      var div = document.getElementsByTagName("div")[0];
      var controls = div.getElementsByTagName("a");
      for (i=0; i<controls.length; i++) {
         if (/\/reblog/.test(controls[i].href)) {
            link = controls[i];
            break;
         }
      }
      if (link !== undefined && link !== null) {
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
      }
   },

   receiveAsker: function(response) {
      if (response.name && response.name !== "") {
         document.addEventListener('mousedown', function(e) {
            var trg;
            if (e.target.tagName === "A" &&
                /^http:\/\/www\.tumblr\.com\/reblog/.test(e.target.href)) {
               trg = e.target;
            }
            else if (e.target.parentNode &&
                     e.target.parentNode.tagName === "A" &&
                     /^http:\/\/www\.tumblr\.com\/reblog/
                        .test(e.target.parentNode.href)) {
               trg = e.target.parentNode;
            }
            else if (e.target.parentNode &&
                     e.target.parentNode.parentNode &&
                     e.target.parentNode.parentNode.tagName === "A" &&
                     /^http:\/\/www\.tumblr\.com\/reblog/
                        .test(e.target.parentNode.parentNode.href)) {
               trg = e.target.parentNode.parentNode;
            }
            if (trg) {
               var askee = location.href.match(/[&\?]name=([^&]*)/);
               if (!askee || askee.length <= 1) {
                  return;
               }
               else {
                  askee = askee[1];
               }
               if (/MissingEaskName=/.test(trg.href)) {
                  return;
               }
               if (/\?/.test(trg.href)) {
                  trg.href += "&";
               }
               else {
                  trg.href += "?";
               }
               if (response.isSure) {
                  trg.href = trg.href.replace(/\?/,'/text?');
               }
               else {
                  trg.href += "MissingEaskSure=0&";
               }
               trg.href += "MissingEaskName=" + askee;
               trg.href += "&MissingEaskerName=" + response.name;
               trg.href += "&MissingEaskPost=" +
                              encodeURIComponent(response.url);
           }
         }, false);
      }
   },

   run: function(frameURL) {
      if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href) &&
          location.href === frameURL) {
         var st = document.createElement('style');
         st.type = 'text/css';
         st.innerHTML = '.MissingE_reblog { ' +
                        'float:left;margin-left:3px;display:inline-block;}' +
                        '.MissingE_reblog .half { ' +
                        'float:left;width:25px;background:transparent url("' +
                        extension.getURL("core/betterReblogs/reblog_tags.png") +
                        '") no-repeat 0 0; }' +
                        '.MissingE_reblog_success .half ' +
                        '{ background-position: -25px 0; } ' +
                        '.MissingE_reblog_fail .half ' +
                        '{ background-position:-50px 0; }';
         document.getElementsByTagName('head')[0].appendChild(st);
         extension.addListener("sendAsker", MissingE.packages.betterReblogsPost
                                                .receiveAsker);
         if (extension.isSafari ||
             extension.isFirefox) {
            extension.sendRequest("getAsker");
         }
         if (!MissingE.packages.betterReblogsPost.addTags()) {
            document.addEventListener('MissingEaddReblog',function(e) {
               var item = e.target;
               if (item.tagName === 'A' && /\/reblog/.test(item.href)) {
                  MissingE.packages.betterReblogsPost.addTags(item);
               }
            }, false);
         }
      }
   },

   runPermalink: function() {
      var frame = document.getElementById("tumblr_controls");
      if (!frame ||
          !(/^http:\/\/[^\.]*\.tumblr\.com\/iframe.html/.test(frame.src)) ||
          /^http:\/\/www\.tumblr\.com\//.test(location.href)) {
         return;
      }
      var myasker = document.getElementsByClassName('asker');
      var isSure = true;
      var name = "";
      var i;
      for (i=0; i<myasker.length; i++) {
         if (myasker[i].tagName === "A") {
            if (!(/[^\w\-]/.test(myasker[i].innerHTML))) {
               name = myasker[i].innerHTML;
               break;
            }
         }
      }
      if (name === "") {
         isSure = false;
         myasker = document.body.innerHTML
                        .match(/<a href="[^"]*">([\w\-]+)<\/a>\s*asked\:/);
         if (myasker && myasker.length > 1) {
            name = myasker[1];
         }
      }
      extension.sendRequest("sendAsker", {name: name, url: location.href,
                                          isSure: isSure});
   },

   init: function() {
      if (window.top !== window &&
          /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(location.href)) {
         if (extension.isFirefox &&
             !extension.hasBaseURL()) {
            extension.sendRequest("settings",
                                  {component: "betterReblogs",
                                   subcomponent: "post"},
                                  function(response) {
               if (response.component !== "betterReblogs") {
                  return;
               }
               MissingE.packages.betterReblogsPost.run(location.href);
            });
         }
         else {
            MissingE.packages.betterReblogsPost.run(location.href);
         }
      }
      else if (window.top === window) {
         MissingE.packages.betterReblogsPost.runPermalink();
      }
   }
};

if (extension.isChrome ||
    extension.isFirefox ||
    (extension.isSafari &&
     window.top === window)) {
   MissingE.packages.betterReblogsPost.init();
}

})();
