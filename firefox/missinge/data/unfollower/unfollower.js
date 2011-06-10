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

/*global localStorage, $, window, safari, getPageHeight */

var text;
var done;
var failed = false;
var ignoreList;

function parseNames(st) {
   if (st === undefined || st === null || st.length === 0) {
      return [];
   }
   return st.split(',').sort();
}

function serializeNames(arr) {
   if (!arr) { return ''; }
   return arr.sort().join(',');
}

function doFinish(newlist,show,acct) {
   var unfollows = [];
   var c, i;
   var currlist = parseNames(localStorage.getItem('MissingE_unfollower_' + acct));
   localStorage.setItem('MissingE_unfollower_' + acct,serializeNames(newlist));
   if (!show) { return true; }
   var n=0;
   var a = currlist;
   var b = newlist;
   for (c=0; c<a.length; c++) {
      while (n<b.length && b[n] < a[c]) {
         n++;
      }
      if (b[n] === a[c]) { n++; }
      else {
         unfollows.push(a[c]);
      }
   }
   var txt = '<table id="unfollowrtable"><tbody>';
   for (i=0; i<unfollows.length; i++) {
      var klass = '';
      if (i%2===1) { klass = 'tu-greyrow'; }
      if (i===0) { klass += ' tu-firstrow'; }
      if (i===unfollows.length-1) { klass += ' tu-lastrow'; }
      if (klass !== '') { klass = ' class="' + klass + '"'; }
      txt += '<tr><td ' + klass + '>';
      txt += '<a target="_blank" href="http://' + unfollows[i] +
               '.tumblr.com/">' + unfollows[i] + '</a>';
      txt += '</td></tr>';
   }
   txt += '</table>';

   if (unfollows.length === 0) {
      jQuery('#MissingE_unfollowdisplay .unfollowerlist')
         .html('<p><em>Nobody has unfollowed you.</em></p>');
   }
   else {
      txt = '<p><em style="font-size:80%;">These tumblrers have changed ' +
            'their username,<br />unfollowed you, or deleted their ' +
            'accounts:</em></p>' + txt;
      jQuery('#MissingE_unfollowdisplay .unfollowerlist').html(txt);
   }
   if (jQuery('#facebox').css('display') === 'block') {
      jQuery.facebox({ div: '#MissingE_unfollowdisplay' }, 'unfollowrbox');
   }
   jQuery('#MissingE_unfollowdisplay .unfollowerlist').empty();
   a = [];
   b = [];
   currlist = [];
   newlist = [];
   unfollows = [];
}

function doDisplay(start,show,acct) {
   var fin = true;
   var i, j;
   for (i=start; i<done.length; i++) {
      if (!done[i]) {
         fin = false;
         break;
      }
   }
   if (fin) {
      done = [];
      var names = [];
      for (i=0; i<text.length; i++) {
         var raw = text[i].match(/<div class="name">\s*<a href="http:[\/0-9A-Za-z\-\_\.]*"><div class="hide_overflow">[0-9a-zA-Z\-\_]+<\/div><\/a>/mg);
         if (raw === undefined || raw === null || raw.length === 0) {
            continue;
         }
         for (j=0; j<raw.length; j++) {
            names.push(raw[j].match(/>([0-9A-Za-z\-\_]*)<\/div><\/a>/)[1]);
         }
      }
      text = [];
      names.sort();
      for (i=0; i<names.length-1; i++) {
         if (names[i] === names[i+1]) {
            names.splice(i+1,1);
         }
      }
      doFinish(names,show,acct);
   }
   else {
      if (!failed) {
         window.setTimeout(function(){doDisplay(i,show,acct);}, 500);
      }
   }
}

function doChooser(acct) {
   var i;
   var chtext = '<p style="margin-top:5px;"><strong>' + acct +
            '</strong> is not being tracked!<br />Was this account renamed?</p>' +
            '<form id="unfollower_chooser_form">' +
            '<table id="unfollower_chooser_table" border="0">' +
            '<tr><th colspan="2"><em>Active Tracked Accounts</em>' +
            '</tr>';
   var listed = parseNames(localStorage.getItem('MissingE_unfollower_lists'));
   for (i=0; i<listed.length; i++) {
      var num = parseNames(localStorage.getItem('MissingE_unfollower_' +
                                                listed[i])).length;
      var klass = (i%2===1 ? 'greyrow' : '');
      klass += (i===listed.length-1 ? ' uctlast ' : '');
      chtext += '<tr><td class="uname ' + klass + '">' + listed[i] +
         ' <em>(' + num + ')</em></td><td user="' + listed[i] + '" class="' +
         klass + '"><button type="button" class="rn_btn" account="' + acct +
         '" value="Rename"><span>Rename</span></button>' +
         '<button type="button" class="del_btn" account="' + acct +
         'value="Delete"><span>Delete</span></button></td></tr>';
   }
   if (listed.length === 0) {
      chtext += '<tr><td colspan="2" class="uctlast"></td></tr>';
   }
   chtext += '</table><div class="newacct"><button type="button" ' +
               'class="new_btn" account="' + acct + '" value="New Account">' +
               '<span>New Account</span></button>' +
               '<button type="button" class="ignore_btn" account="' + acct +
               '" value="Ignore"><span>Ignore</span></button></div></form>';

   jQuery('#MissingE_unfollowdisplay .unfollowerlist').html(chtext);
   jQuery.facebox({ div: '#MissingE_unfollowdisplay' }, 'unfollowrbox early');
}

function doGet(num, show, extensionURL, retries, acct) {
   var i;
   failed = false;

   var followLists = localStorage.getItem('MissingE_unfollower_lists');
   var ure = new RegExp('(^|,)' + acct + '($|,)');
   if (!ure.test(followLists)) {
      doChooser(acct);
      return;
   }
   if (show) {
      jQuery('#MissingE_unfollowdisplay .unfollowerlist')
         .html('<p><img src="' + extensionURL +
               'facebox/loading.gif' + '" /></p>');
      jQuery.facebox({ div: '#MissingE_unfollowdisplay' }, 'unfollowrbox');
   }

   var pages = Math.ceil(num / 40) + 1;
   text = new Array(pages);
   done = new Array(pages);
   for (i=0; i<pages; i++) {
      done[i] = false;
   }
   for (i=0; i<pages; i++) {
      jQuery.ajax({
         type: "GET",
         url: '/tumblelog/' + acct + '/followers/page/'+(i+1),
         dataType: "html",
         tryCount: 0,
         retryLimit: retries,
         background: !show,
         pageNumber: i,
         error: function(xhr, textStatus) {
            this.tryCount++;
            if (!failed && this.tryCount <= this.retryLimit &&
                (jQuery('#facebox').css('display') === 'block' ||
                 this.background)) {
               jQuery.ajax(this);
               return;
            }
            else if (!failed) {
               failed = true;
               jQuery('#MissingE_unfollowdisplay .unfollowerlist')
                  .html('<p><em>Having trouble getting followers listing ' +
                        'from Tumblr\'s servers, please try again later.' +
                        '</em></p><img style="margin:20px 0;" src="' +
                        extensionURL + 'images/oh_dear.png' +
                        '" /><div><em>Artwork by ' +
                        '<a href="http://theoatmeal.com/">The Oatmeal</a>' +
                        '</em></div>');
               if (jQuery('#facebox').css('display') === 'block') {
                  jQuery.facebox({ div: '#MissingE_unfollowdisplay' }, 'unfollowrbox');
               }
            }
         },
         success: function(data, textStatus) {
            if (!(/id="dashboard_followers"/.test(data))) {
               this.tryCount++;
               if (!failed && this.tryCount <= this.retryLimit &&
                   (jQuery('#facebox').css('display') === 'block' ||
                    this.background)) {
                  jQuery.ajax(this);
                  return;
               }
               else if (!failed) {
                  failed = true;
                  jQuery('#MissingE_unfollowdisplay .unfollowerlist')
                     .html('<p><em>Having trouble getting followers ' +
                           'listing from Tumblr\'s servers, please try ' +
                           'again later.</em></p>' +
                           '<img style="margin:20px 0;" src="' +
                           extensionURL + 'images/oh_dear.png' +
                           '" /><div><em>Artwork by ' +
                           '<a href="http://theoatmeal.com/">The Oatmeal' +
                           '</a></em></div>');
                  if (jQuery('#facebox').css('display') === 'block') {
                     jQuery.facebox({ div: '#MissingE_unfollowdisplay' },
                               'unfollowrbox');
                  }
               }
               return true;
            }

            var j = this.pageNumber;
            text[j] = data;
            done[j] = true;
         }
      });
   }

   doDisplay(0,show,acct);
}

function getCountAndDoSilent(acct, extensionURL, retries) {
   jQuery.ajax({
      type: "GET",
      url: '/tumblelog/' + acct + '/followers',
      dataType: "html",
      tryCount: 0,
      retryLimit: retries,
      account: acct,
      error: function(xhr, textStatus) {
         this.tryCount++;
         if (this.tryCount <= this.retryLimit) {
            jQuery.ajax(this);
            return;
         }
      },
      success: function(data, textStatus) {
         if (!(/id="dashboard_followers"/.test(data))) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
               jQuery.ajax(this);
               return;
            }
            return true;
         }
         var followers = data.match(/href="\/tumblelog\/[^\/]+\/followers"[^>]*>\s*<div[^>]*>[^<]*<\/div>\s*<span\s+class="count">([0-9][0-9,\.]*)<\/span>/m);
         if (followers && followers.length > 1) {
            doGet(followers[1].replace(/,/g,"").replace(/\./g,""), false,
                  extensionURL, this.retryLimit, this.account);
         }
      }
   });
}

function tu_init(extensionURL, retries) {
   jQuery('#unfollower_chooser_form button').live('click', function() {
      var acct = jQuery(this).attr('account');
      switch(this.className) {
         case 'rn_btn': {
            var old = jQuery(this).parent().attr('user');
            var followerLists = parseNames(localStorage
                                           .getItem('MissingE_unfollower_lists'));
            var idx = jQuery.inArray(old,followerLists);
            if (idx >= 0) {
               var r = confirm('Replace "' + old + '" account with "' + acct + '"?');
               if (r) {
                  followerLists[idx] = acct;
                  localStorage.setItem('MissingE_unfollower_lists',
                                       serializeNames(followerLists));
                  var followers = localStorage.getItem('MissingE_unfollower_' + old);
                  localStorage.removeItem('MissingE_unfollower_' + old);
                  localStorage.setItem('MissingE_unfollower_' + acct, followers);
                  jQuery.facebox.close();
               }
            }
            else {   
               jQuery.facebox.close();
            }
            break;
         }
         case 'del_btn': {
            var old = jQuery(this).parent().attr('user');
            var r = confirm('Delete data for "' + old + '"?');
            if (r) {
               var followerLists = parseNames(localStorage
                                              .getItem('MissingE_unfollower_lists'));
               var idx = jQuery.inArray(old,followerLists);
               if (idx >= 0) {
                  followerLists.splice(idx,1);
                  localStorage.setItem('MissingE_unfollower_lists',
                                       serializeNames(followerLists));
                  localStorage.removeItem('MissingE_unfollower_' + old);
                  jQuery(this).parent().children('button').css('visibility','hidden');
                  jQuery(this).parent().prev().empty();
               }
            }
            break;
         }
         case 'new_btn': {
            var followerLists = parseNames(localStorage
                                           .getItem('MissingE_unfollower_lists'));
            followerLists.push(acct);
            localStorage.setItem('MissingE_unfollower_lists',
                                 serializeNames(followerLists));
            var fl = jQuery('#right_column').find('a.followers .count');
            followers = fl.text().match(/^([0-9][0-9,\.]*)/);
            if (followers !== undefined && followers !== null &&
                followers.length >= 2) {
               doGet(followers[1].replace(/,/g,"").replace(/\./g,""),
                     false, extensionURL, retries, acct);
            }
            else {
               getCountAndDoSilent(acct, extensionURL, retries);
            }
            jQuery.facebox.close();
            break;
         }
         case 'ignore_btn': {
            var ignores = parseNames(ignoreList);
            ignores.push(acct);
            localStorage.removeItem('MissingE_unfollower_' + acct);
            ignoreList = serializeNames(ignores);
            self.postMessage({greeting: "unfollowerIgnore", list: ignoreList});
            jQuery('#MissingE_unfollowdelta').remove();
            jQuery.facebox.close();
            break;
         }
      }
   });

   var followers;
   jQuery("body").append('<div id="MissingE_unfollowdisplay" style="display:none;">' +
                    '<div style="font:bold 24px Georgia,serif;' +
                    'color:#1f354c;">unfollower</div>' +
                    '<div class="unfollowerlist" style="height:' +
                    ((getPageHeight()/10)*7) + 'px;overflow-y:auto;' +
                    'text-align:center;margin-top:10px;"></div>' +
                    '<img class="logo" src="' + extensionURL +
                    'Icon-64.png' + '" /></div>');

   var acct = location.href.match(/\/tumblelog\/([^\/]*)/);
   if (!acct || acct.length <= 1) {
      acct = jQuery('#user_channels li.tab:first a').attr('href').match(/\/tumblelog\/([^\/]*)/);
   }
   if (acct && acct.length > 1) {
      acct = acct[1];
   }
   else {
      return;
   }
   var ignore = false;
   var fl = jQuery('#right_column').find('a.followers .count');
   var followLists = localStorage.getItem('MissingE_unfollower_lists');
   var lastFollows = localStorage.getItem('MissingE_unfollower_names');
   if (followLists === undefined || followLists === null ||
       followLists === "") {
      if (lastFollows) {
         followLists = acct;
         localStorage.setItem('MissingE_unfollower_lists',acct);
         localStorage.removeItem('MissingE_unfollower_names');
         localStorage.setItem('MissingE_unfollower_' + acct, lastFollows);
      }
   }
   var ure = new RegExp('(^|,)' + acct + '($|,)');
   if (ure.test(followLists)) {
      lastFollows = localStorage.getItem('MissingE_unfollower_' + acct);
   }
   else {
      lastFollows = null;
      if (ure.test(ignoreList)) {
         ignore = true;
      }
   }
   if (!ignore) {
      if (lastFollows === undefined || lastFollows === null ||
          lastFollows === "") {
         if (followLists === undefined || followLists === null ||
             followLists === "") {
            followLists = acct;
            localStorage.setItem('MissingE_unfollower_lists',acct);
         }
         followers = fl.text().match(/^([0-9][0-9,\.]*)/);
         if (followers !== undefined && followers !== null &&
             followers.length >= 2) {
            doGet(followers[1].replace(/,/g,"").replace(/\./g,""), false,
                  extensionURL, retries, acct);
         }
         else {
            getCountAndDoSilent(acct, extensionURL, retries);
         }
      }
      var deltxt = '<a id="MissingE_unfollowdelta" title="Unfollower" ' +
                     'onclick="return false;" ' +
                     'href="#">&Delta;</a>';
      var fw = jQuery("#MissingE_followwhonotin");
      if (fw.size()>0) {
         fw.before(deltxt);
      }
      else if (fl.length >= 1) {
         fl.append(deltxt);
      }
      jQuery('#MissingE_unfollowdelta').click(function() {
         followers = jQuery(this).parent().text()
                           .match(/^([0-9][0-9,\.]*)/);
         if (followers === undefined || followers === null ||
             followers.length < 2) {
            return false;
         }
         doGet(followers[1].replace(/,/g,"").replace(/\./g,""), true,
               extensionURL, retries, acct);
      });
   }
}

self.on('message', function (message) {
   if (message.greeting !== "settings" ||
       message.component !== "unfollower") {
      return;
   }
   if (document.body.id !== "dashboard_edit_post") {
      jQuery('head').append('<link rel="stylesheet" type="text/css" ' +
                            'href="' + message.extensionURL + 'unfollower/' +
                            'unfollower.css" />');
      ignoreList = message.ignore;
      tu_init(message.extensionURL, message.retries);
   }
});

self.postMessage({greeting: "settings", component: "unfollower"});
