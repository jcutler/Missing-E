// ==UserScript==
// @name           Tumblr Post Crushes
// @description    Quickly post your tumblr crushes (along with links to their blogs) from your following page
// @namespace      http://userscripts.org/users/113977
// @include        http://www.tumblr.com/following*
// @include        http://www.tumblr.com/new/photo*
// @version        0.1.6
// @date           2011-05-07
// ==/UserScript==

(function() {
   var scriptUpdater = {
      name : "Tumblr Post Crushes",
      shortname : 'tcp',
      version : "0.1.6",
      usoID : 95561,
      lastCheck : function() { return (window.localStorage.getItem(this.shortname + '_lastCheck') ? window.localStorage.getItem(this.shortname + '_lastCheck') : 0); },
      now : (new Date()).valueOf(),
      xmlhttp : (typeof(GM_xmlhttpRequest)!='undefined' && GM_xmlhttpRequest) || function(){},
      init : function() {
      },
      parse : function(me, responseDetails) {
         var verm = responseDetails.responseText.match(/@version\s*([0-9\.]*)/);
         if (verm.length < 2) return false;
         me.lastCheck = me.now;
         window.localStorage.setItem(this.shortname + '_lastCheck',me.now);
         if (verm[1] != me.version) {
            var answer = confirm(me.name + " has been updated to version " + verm[1] + "\n\nDo you want to upgrade?\n\nThis page should be reloaded after installing the new version.");
            if (answer) {
               window.open("http://userscripts.org/scripts/show/" + me.usoID);
            }
         }
      },
      doCheck : function() {
         this.init();
         if (this.now - this.lastCheck() > 604800000) {
            this.xmlhttp({
               method: "GET",
               url: "http://userscripts.org/scripts/source/" + this.usoID + ".meta.js",
               onload: function(responseDetails) { scriptUpdater.parse(scriptUpdater, responseDetails); }
            });
         }
      }
   };

   var tcp_settings;
   var isFF = (navigator.userAgent && navigator.userAgent.indexOf("Firefox") != -1);
   var missingeServer = 'http://crush.missinge.infraware.ca';

   function doSettings() {
      if (isFF) {
         tcp_settings = window.open('', 'tcp_settings', 'width=500,height=450,titlebar=no,toolbar=no,location=no,status=no,menubar=no');
         doPage(tcp_settings);
      }
      else {
         tcp_settings = window.open('http://www.tumblr.com/following', 'tcp_settings', 'width=500,height=450,titlebar=no,toolbar=no,location=no,status=no,menubar=no');
      }
   }

   function doPage(setWin) {
      var large = window.localStorage.getItem('tcp_crushNotLarge');
      var percent = window.localStorage.getItem('tcp_crushNoPercentages');
      var prefix = window.localStorage.getItem('tcp_crushPrefix');
      var addTags = window.localStorage.getItem('tcp_crushAddTags');
      if (large != undefined && large != null && large == '1')
         large = false;
      else
         large = true;
      if (percent != undefined && percent != null && percent == '1')
         percent = false;
      else
         percent = true;
      if (addTags != undefined && addTags != null && addTags == '1')
         addTags = true;
      else
         addTags = false;
      if (prefix == undefined || prefix == null) prefix = "Tumblr Crushes:";

      var doc = '<html><head>' +
                  '<script type="text/javascript">' +
                     'function resetPrefix() {' +
                        'document.getElementById("tcp_form").prefix.value = "Tumblr Crushes:";' +
                     '} ' +      
                     'function doChanges() {' +
                        'var btn = document.getElementById("saver");' +
                        'btn.innerHTML = "Saving...";' +
                        'var frm = document.getElementById("tcp_form");' +
                        'var notLarge = frm.crush_size[0].checked;' +
                        'var percent = frm.show_percent.checked;' +
                        'var prefix = frm.prefix.value.replace(/^\\s*([\\S\\s]*?)\\s*$/, "$1");' +
                        'var addTags = frm.tags.checked;' +
                        'frm.prefix.value = prefix;' +
                        'window.localStorage.setItem("tcp_crushNotLarge", (notLarge ? "1":"0"));' +
                        'window.localStorage.setItem("tcp_crushNoPercentages", (percent ? "0":"1"));' +
                        'window.localStorage.setItem("tcp_crushPrefix", prefix);' +
                        'window.localStorage.setItem("tcp_crushAddTags", (addTags ? "1":"0"));' +
                        'btn.innerHTML = "Save";' +
                        'window.close();' +
                     '}' +
                  '</script>' +
                  '<style type="text/css">' +
                     'body { text-align:center; font-family:Arial,Helvetica,sans-serif; color:#2D4159; background-color:#3B5874; } ' +
                     'form { margin:0; padding:0; } h2 { color:white; margin:10px 0 0; } ' +
                     'div#box { border:4px solid white; background-color:white; -webkit-border-radius: 8px; -moz-border-radius: 8px; border-radius: 8px; width:400px; padding:15px 20px; margin:0 auto; } ' +
                     'table { border:0px; margin:0 auto 15px; border-collapse:collapse; } ' +
                     'td { background-color:#ECECEC; font-size:12px; line-height:20px; text-align:left; padding:10px 12px 10px 10px; } ' +
                     'td.input { border-right:2px solid white; text-align:right; vertical-align:top; padding:10px !important; } ' +
                     'td.notfirst { border-top:2px solid white; } td.alt { background-color:#F4F4F4; } ' +
                     'td.wide { text-align:center; } ' +
                     'button { background-color:#777777; color:white; border:1px solid #777777; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; font-size:14px; font-weight:bold; padding:2px 4px; cursor:pointer; margin:0 4px; } ' +
                     'span#resetter { text-decoration:underline; color:#777777; cursor:pointer; } ' +
                     'p { color:white; margin:0 0 10px 0; padding:0; font-size:10px; } ' +
                     'p a { color:white; text-decoration:underline; } ' +
                  '</style><title>Tumblr Post Crushes - Settings</title></head><body>' +
                  '<h2>Tumblr Post Crushes - Settings</h2><p id="version">v' + scriptUpdater.version + '<br />' +
                  '<a href="http://userscripts.org/scripts/show/' + scriptUpdater.usoID + '" target="_blank">Check for updates</a></p>' + 
                  '<div id="box"><form id="tcp_form"><table><tr><td class="input">' +
                  '<input type="radio" name="crush_size" value="1" ' +
                  (large ? '' : 'checked="checked" ') + '/></td><td>Small avatars <em>(70x70 avatars, same as on ' +
                  'following page)</em></td></tr><td class="input"><input type="radio" ' +
                  'name="crush_size" value="0" ' + (large ? 'checked="checked" ' : '') + '/>' +
                  '</td><td>Large avatars <em>(128x128 avatars)</em></td></tr><tr><td class="input alt notfirst">' +
                  '<input type="checkbox" name="tags" value="0" ' +
                  (addTags ? 'checked="checked" ' : '') + '/></td><td class="alt notfirst">Add crush names to post tags</td>' +
                  '</tr><tr><td class="input notfirst"><input type="checkbox" name="show_percent" value="0" ' +
                  (percent ? 'checked="checked" ' : '') + '/></td><td class="notfirst">Show crush percentages</td>' +
                  '</tr><tr><td colspan="2" class="alt notfirst wide"><input name="prefix" type="text" value="' +
                  prefix + '" size="40" maxlength="64" /> <span id="resetter" onclick="resetPrefix()">Reset</span><br />' +
                  'Prefix text for crush list</td></tr></table></form>' +
                  '<button id="saver" onclick="doChanges()" type="button" value="Save">Save</button>' +
                  '<button onclick="window.close()" type="button" value="Cancel">Cancel</button>' +
                  '</div></body></html>';
      setWin.document.open();
      setWin.document.write(doc);
      setWin.document.close();
      setWin.focus();
   }

   if (document.body.id == 'dashboard_following') {
      if (!isFF && window.name == 'tcp_settings') {
         doPage(window);
         return;
      }
      
      if (isFF) scriptUpdater.doCheck();
      var crushdiv = document.getElementById("crushes");
      var infodiv = crushdiv.nextSibling;
      while (infodiv != undefined && infodiv != null && infodiv.tagName != 'DIV') {
         infodiv = infodiv.nextSibling;
      }

      var st = document.createElement('style');
      st.type ='text/css';
      st.innerHTML = '#tcp_outerdiv:hover #tcp_innerspan { visibility:visible !important; } #tcp_innerspan:hover { text-decoration:underline !important; }';
      document.getElementsByTagName('head')[0].appendChild(st);
   
      var newdiv = document.createElement('div');
      newdiv.style.position="relative";
      newdiv.style.verticalAlign="middle";
      newdiv.style.marginTop="10px";
      newdiv.id = "tcp_outerdiv";
      var innerdiv = document.createElement('div');
      innerdiv.style.cursor="pointer";
      innerdiv.style.verticalAlign="middle";
      innerdiv.innerHTML = '<img src="http://assets.tumblr.com/images/crushes_heart.png" style="opacity:0.6;height:28px;width:29px;" /><div style="position:absolute;top:15%;width:100%;color:#2D4159;font:italic bold 12px/1.4 Arial,Helvetica,sans-serif;">Post your crushes to Tumblr</div>';
      var setter = document.createElement('span');
      setter.id = "tcp_innerspan";
      setter.style.visibility="hidden";
      setter.style.cursor="pointer";
      setter.innerHTML = 'Settings';
   
      setter.addEventListener('click', function() {
         doSettings();
      }, false);

      innerdiv.addEventListener('click', function() {

         var from = [/:/g, /\//g, /\?/g, /\=/g, / /g, /</g, />/g, /\=/g, /"/g];
         var to = ["%3A", "%2F", "%3F", "%3D", "%20", '%3C', '%3E', '%3D', '%22'];
         var crushes = document.getElementById("crushes").getElementsByTagName("a");
         var crushimg = new Array(9);
         var crushurl = new Array(9);
         var crushper = new Array(9);
         var crushname = new Array(9);
         for (i=0; i<crushes.length; i++) {
            crushimg[i] = crushes[i].style.backgroundImage.replace(/^url\(["']*/,"").replace(/['"]*\)$/,"").replace(/^http:\/\/[^\/]*\//,"").replace(from,to);
            crushurl[i] = crushes[i].href.replace(from,to);
            crushname[i] = crushes[i].getAttribute('title').match(/^[0-9a-zA-Z\-\_]*/)[0];
            crushper[i] = crushes[i].getElementsByTagName("span")[0].innerHTML.replace(/%/,"").replace(from,to);
         }
      
         for (i=0; i<crushes.length; i++) {
            for (j=0; j<from.length; j++) {
               crushimg[i] = crushimg[i].replace(from[j],to[j]);
               crushurl[i] = crushurl[i].replace(from[j],to[j]);
            }
         }
      
         var get = "";
         for (i=0; i<crushes.length; i++) {
            if (i>0) get += "&";
            get += "img" + i + "=" + crushimg[i] + "&per" + i + "=" + crushper[i];
         }
         var prefix = window.localStorage.getItem('tcp_crushPrefix');
         if (prefix == undefined || prefix == null) prefix = "Tumblr Crushes:";
         var txt = '';
         if (prefix.length > 0)
            txt += '<p><strong>' + prefix + '</strong></p>'
         txt += '<ul>';
         for (i=0; i<crushes.length; i++) {
            txt += '<li><a href="' + crushurl[i] + '">' + crushname[i] + '</a></li>';
         }
         txt += '</ul><p></p>';
      
         for (j=0; j<from.length; j++) txt = txt.replace(from[j],to[j]);

         window.localStorage.setItem('tcp_crushTags',crushname.join(','));
          
         window.localStorage.setItem('tcp_crushURL', missingeServer + '/?' + get);
         window.open('http://www.tumblr.com/new/photo?post%5Bone%5D=&post%5Btwo%5D=' + txt + '&post%5Bthree%5D=');
         
      }, true);
      newdiv.appendChild(innerdiv);
      newdiv.appendChild(setter);
      infodiv.appendChild(newdiv);
   }
   else if (document.body.id == 'dashboard_edit_post') {
   
      var url = window.localStorage.getItem("tcp_crushURL");
      if (url != undefined && url != null && url != "") {
         window.localStorage.removeItem("tcp_crushURL");
         var notlarge = window.localStorage.getItem('tcp_crushNotLarge');
         var notPercent = window.localStorage.getItem('tcp_crushNoPercentages');
         var addTags = window.localStorage.getItem('tcp_crushAddTags');
         if (addTags != undefined && addTags != null && addTags == '1') {
            var tags = window.localStorage.getItem('tcp_crushTags');
            tagarr = tags.split(',');
            var txt = "";
            document.getElementById('post_tags').value = tags;
            for (i=0; i<tagarr.length; i++) {
               if (tagarr[i] != null && tagarr[i] != '') {
                  txt += '<div class="token"><span class="tag">' + tagarr[i] + '</span>' +
                     '<a title="Remove tag" onclick="tag_editor_remove_tag($(this).up()); return false;" href="#">x</a>' +
                     '</div>';
               }
            }
            if (txt != '') {
               document.getElementById('tokens').innerHTML = txt;
               var label = document.getElementById('post_tags_label');
               label.parentNode.removeChild(label);
            }
         }
         window.localStorage.removeItem('tcp_crushTags');
         if (notlarge == undefined || notlarge == null || notlarge != '1')
            url += '&large=1';
         if (notPercent == undefined || notPercent == null || notPercent != '1')
            url += '&showPercent=1';
         document.getElementById('photo_src').value = url;
         document.getElementById('photo_upload').style.display = "none";
         document.getElementById('photo_url').style.display = "block";
      }
   
   }
}());
