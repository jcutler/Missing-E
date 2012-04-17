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

/*global extension, MissingE */

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
         var halfblock = document.createElement('div');
         var remhalf = document.createElement('div')
         block.className = 'MissingE_reblog';
         block.style.height = h + 'px';
         block.style.width = (w+1) + 'px';
         halfblock.className = "half";
         halfblock.style.height = h + "px";
         remhalf.className = "remhalf";
         remhalf.style.width = (w-24) + "px";
         remhalf.style.height = h + "px";
         remhalf.style.background = "transparent url('" + img.src +
                                    "') -24px 0 no-repeat";
         remhalf.style.cssFloat = "right";
         block.appendChild(halfblock);
         block.appendChild(remhalf);
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
                  link.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
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
                  trg.href = trg.href.replace(/(\/text)?\?/,'/text?');
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
         var settings = this.settings;
         var st = document.createElement('style');
         st.type = 'text/css';
         st.textContent = '.MissingE_reblog { ' +
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
         var acct, i;
         for (i=0; i<document.forms.length; i++) {
            if (/\/(un)?follow/
                  .test(document.forms[i].getAttribute('action'))) {
               acct = document.forms[i].id.value;
               break;
            }
         }
         if (acct && settings.reblogAsks === 1) {
            extension.sendRequest("tumblrPermission", {user: acct},
                                  function(response) {
               if (!response.allow) {
                  var div = document.getElementsByTagName("div")[0];
                  var controls;
                  if (div) { controls = div.getElementsByTagName("a"); }
                  var noReblog = true;
                  for (i=0; i<controls.length; i++) {
                     if (/\/reblog\//.test(controls[i].href)) {
                        noReblog = false;
                        break;
                     }
                  }
                  if (noReblog) {
                     var url, redir;
                     var loc = location.href;
                     var last = controls[controls.length-1];
                     var gdp = document
                                 .getElementById('MissingE_gotoDashPost_link');
                     if (gdp) {
                        last = gdp;
                     }
                     loc = loc.substring(loc.indexOf("src=")+4);
                     redir = loc.substring(0,loc.indexOf("&"));
                     loc = loc.replace(/%3A/gi,":")
                              .replace(/%2F/gi,"/");
                     url = "/reblog/";
                     if (/&pid=(\d*)/.test(loc)) {
                        url += loc.match(/&pid=(\d*)/)[1] + "/";
                        url += loc.match(/&rk=(\w*)/)[1];
                        url += '?redirect_to=' + redir;

                        var link = document.createElement('a');
                        link.setAttribute('href', url);
                        link.setAttribute('target', '_top');

                        var dashimg = null;
                        for (i=controls.length-1; i>=0; i--) {
                           if (controls[i].href ===
                                 'http://www.tumblr.com/dashboard') {
                              dashimg = controls[i]
                                          .getElementsByTagName('img')[0];
                              break;
                           }
                        }
                        var suffix = '';
                        var lang = 'en';
                        if (dashimg) {
                           suffix = dashimg.src.match(/alpha([^\.]*)(.*)/);
                           if (suffix !== null && suffix.length > 2) {
                              lang = suffix[1].match(/[a-z]+/);
                              if (lang === null || lang.length === 0) {
                                 lang = 'en';
                              }
                              else {
                                 lang = lang[0];
                              }
                              suffix = suffix[1] + suffix[2];
                           }
                        }
                        else {
                           suffix = '.png';
                        }

                        var icon = document.createElement('img');
                        icon.style.height='20px';
                        icon.style.width='64px';
                        icon.style.borderWidth='0';
                        icon.style.display='block';
                        icon.style.cssFloat='left';
                        icon.style.cursor='pointer';
                        icon.alt=MissingE.getLocale(lang).reblog;
                        icon.src = 'http://assets.tumblr.com/images/' +
                           'iframe_reblog_alpha' + suffix;
                        link.appendChild(icon);
                        div.insertBefore(link,last);
                        var evt = document.createEvent("HTMLEvents");
                        evt.initEvent("MissingEaddReblog", true, true);
                        link.dispatchEvent(evt);
                     }
                  }
               }
            });
         }
         extension.addListener("sendAsker", MissingE.packages.betterReblogsPost
                                                .receiveAsker);
         if (extension.isChrome) {
            extension.sendRequest("getAsker",
                                  MissingE.packages
                                    .betterReblogsPost.receiveAsker);
         }
         else {
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
      if (MissingE.isTumblrURL(location.href, ["iframe"])) {
         extension.sendRequest("settings",
                               {component: "betterReblogs",
                                subcomponent: "post"},
                               function(response) {
            if (response.component === "betterReblogs") {
               var i;
               MissingE.packages.betterReblogsPost.settings = {};
               for (i in response) {
                  if (response.hasOwnProperty(i) &&
                      i !== "component") {
                     MissingE.packages.betterReblogsPost
                        .settings[i] = response[i];
                  }
               }
               MissingE.packages.betterReblogsPost.run(location.href);
            }
         })
      }
      else if (document.getElementById("tumblr_controls")) {
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

}());
