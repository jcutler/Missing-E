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

/*global chrome, window, $, getPageHeight */

var followertext;
var followeetext;
var followerdone;
var followeedone;
var failed = false;
var youfollow = [];
var followyou = [];

function doFWFinish(followers, followees, show) {
   youfollow = [];
   followyou = [];
   var yentry, fentry, yklass, fklass, klass, i;
   if (!show) { return true; }

   var e=0;
   var f=0;

   while (f < followers.length && e < followees.length) {
      if (followers[f] < followees[e]) {
         followyou.push(followers[f]);
         f++;
      }
      else if (followers[f] > followees[e]) {
         youfollow.push(followees[e]);
         e++;
      }
      else {
         e++;
         f++;
      }
   }

   for (; f<followers.length; f++) {
      followyou.push(followers[f]);
   }
   for (; e<followees.length; e++) {
      youfollow.push(followees[e]);
   }

   followers = [];
   followees = [];

   var txt = '<table id="followwhotable" border="0"><thead><tr><th><em>' +
               'You Don\'t Follow (' + followyou.length + ')</em></th>' +
               '<th><em>Don\'t Follow You (' + youfollow.length + ')</em>' +
               '</th></tr></thead><tbody>';
   for (i=0;i<youfollow.length && i<followyou.length;i++) {
      yentry = youfollow[i].split(';');
      fentry = followyou[i].split(';');
      fklass = '';
      yklass = '';
      if (i%2===1) { fklass = 'fw-greyrow'; }
      if (i%2===1) { yklass = 'fw-greyrow'; }
      if (i===youfollow.length-1) { yklass+=' fw-last'; }
      if (i===followyou.length-1) { fklass+=' fw-last'; }
      if (fklass !== '') { fklass = 'class="' + fklass + '"'; }
      if (yklass !== '') { yklass = 'class="' + yklass + '"'; }
      txt += '<tr><td ' + fklass + '><a target="_blank" href="' +
               fentry[1] + '">' + fentry[0] + '</a></td>';
      txt += '<td ' + yklass + '><a target="_blank" href="' +
               yentry[1] + '">' + yentry[0] + '</a></td></tr>';
   }
   for (; i<youfollow.length; i++) {
      klass = '';
      if (i%2===1) { klass = 'fw-greyrow'; }
      if (i===youfollow.length-1) { klass+=' fw-last'; }
      if (klass !== '') { klass = 'class="' + klass + '"'; }
      yentry = youfollow[i].split(';');
      txt += '<tr><td></td><td ' + klass + '><a target="_blank" href="' +
               yentry[1] + '">' + yentry[0] + '</a></td></tr>';
   }
   for (; i<followyou.length; i++) {
      klass = '';
      if (i%2===1) { klass = 'fw-greyrow'; }
      if (i===followyou.length-1) { klass+=' fw-last'; }
      if (klass !== '') { klass = 'class="' + klass + '"'; }
      fentry = followyou[i].split(';');
      txt += '<tr><td ' + klass + '><a target="_blank" href="' + fentry[1] +
               '">' + fentry[0] + '</a></td><td></td></tr>';
   }
   txt += '</tr></tbody></table>';
   $('#MissingE_followwhodisplay .followwholist').html(txt);

   if ($('#facebox').css('display') === 'block') {
      $(document).one('close.facebox', function() {
         followyou = [];
         youfollow = [];
      });
      $.facebox({ div: '#MissingE_followwhodisplay' }, 'followwhobox');
      $('#facebox a.MissingE_followChecker_newTab').css('display','inline');
   }
   $('#MissingE_followwhodisplay .followwholist').empty();
}

function doFWDisplay(followerstart,followeestart,show) {
   var fin = true;
   var i,j,raw;
   i=0;
   j=0;
   for (i=followerstart; i<followerdone.length; i++) {
      if (!followerdone[i]) {
         fin = false;
         break;
      }
   }
   for (j=followeestart; j<followeedone.length; j++) {
      if (!followeedone[j]) {
         fin = false;
         break;
      }
   }
   if (fin) {
      followerdone = [];
      followeedone = [];
      var followernames = [];
      for (i=0; i<followertext.length; i++) {
         raw = followertext[i]
                     .match(/<div class="name">\s*<a href="http:[\/0-9A-Za-z\-\_\.]*">[0-9a-zA-Z\-\_]*<\/a>/mg);
         if (raw === undefined || raw === null || raw.length === 0) {
            continue;
         }
         for (j=0; j<raw.length; j++) {
            var fentryname = raw[j].match(/>([0-9A-Za-z\-\_]*)<\/a>/)[1];
            var fentryurl = raw[j].match(/a href="(http:[\/0-9A-Za-z\-\_\.]*)"/)[1];
            var avre = new RegExp('a href="' + fentryurl +
                                  '">\s*<img class="avatar"([\n\r]|.)*?src="http:\/\/[^\/]*\/avatar\_([^_]*_30\....)','m');
            var imgm = avre.exec(followertext[i]);
            var fentryava = '';
            if (imgm && imgm.length > 1) {
               fentryava = imgm[imgm.length-1];
            }
            followernames.push(fentryname + ';' + fentryurl + ';' + fentryava);
         }
      }
      followertext = [];
      followernames.sort();
      for (i=0; i<followernames.length-1; i++) {
         if (followernames[i] === followernames[i+1]) {
            followernames.splice(i+1,1);
         }
      }

      var followeenames = [];
      for (i=0; i<followeetext.length; i++) {
         raw = followeetext[i]
                     .match(/<div class="name">\s*<a href="http:[\/0-9A-Za-z\-\_\.]*">[0-9a-zA-Z\-\_]*<\/a>/mg);
         if (raw === undefined || raw === null || raw.length === 0) {
            continue;
         }
         for (j=0; j<raw.length; j++) {
            var fentryname = raw[j].match(/>([0-9A-Za-z\-\_]+)<\/a>/)[1];
            var fentryurl = raw[j].match(/a href="(http:[\/0-9A-Za-z\-\_\.]*)"/)[1];
            var avre = new RegExp('a href="' + fentryurl +
                                  '">\s*<img class="avatar"([\n\r]|.)*?src="http:\/\/[^\/]*\/avatar\_([^_]*_30\....)','m');
            var imgm = avre.exec(followeetext[i]);
            var fentryava = '';
            if (imgm && imgm.length > 1) {
               fentryava = imgm[imgm.length-1];
            }
            followeenames.push(fentryname + ';' + fentryurl + ';' + fentryava);
         }
      }
      followeetext = [];
      followeenames.sort();
      for (i=0; i<followeenames.length-1; i++) {
         if (followeenames[i] === followeenames[i+1]) {
            followeenames.splice(i+1,1);
         }
      }
      doFWFinish(followernames, followeenames,show);
   }
   else {
      if (!failed) {
         window.setTimeout(function(){doFWDisplay(i,j,show);}, 500);
      }
   }
}

function doFWGet(followers, followees, show, retries) {
   var i;
   failed = false;

   if (show) {
      $('#MissingE_followwhodisplay .followwholist')
         .html('<p><img src="' +
               chrome.extension.getURL('facebox/loading.gif') + '" /></p>');
      $.facebox({ div: '#MissingE_followwhodisplay' }, 'followwhobox');
   }

   var followerpages = Math.ceil(followers / 40) + 1;
   var followeepages = Math.ceil(followees / 25) + 1;
   followertext = new Array(followerpages);
   followeetext = new Array(followeepages);
   followerdone = new Array(followerpages);
   followeedone = new Array(followeepages);
   for (i=0; i<followerpages; i++) {
      followerdone[i] = false;
   }
   for (i=0; i<followeepages; i++) {
      followeedone[i] = false;
   }

   for (i=0; i<followerpages; i++) {
      $.ajax({
         type: "GET",
         url: '/followers/page/'+(i+1),
         dataType: "html",
         tryCount: 0,
         retryLimit: retries,
         pageNumber: i,
         error: function(xhr, textStatus) {
            this.tryCount++;
            if (!failed && this.tryCount <= this.retryLimit &&
                $('#facebox').css('display') === 'block') {
               $.ajax(this);
               return;
            }
            else if (!failed) {
               failed = true;
               $('#MissingE_followwhodisplay .followwholist')
                  .html('<p><em>Having trouble getting followers ' +
                        'listing from Tumblr\'s servers, please try again ' +
                        'later.</em></p><img style="margin:20px 0;" src="' +
                        chrome.extension.getURL('images/oh_dear.png') +
                        '" /><div><em>Artwork by ' +
                        '<a href="http://theoatmeal.com/">The Oatmeal</a>' +
                        '</em></div>');
               if ($('#facebox').css('display') === 'block') {
                  $.facebox({ div: '#MissingE_followwhodisplay' },
                            'followwhobox');
               }
            }
         },
         success: function(data, textStatus) {
            if (!(/id="dashboard_followers"/.test(data))) {
               this.tryCount++;
               if (!failed && this.tryCount <= this.retryLimit &&
                   $('#facebox').css('display') === 'block') {
                  $.ajax(this);
                  return;
               }
               else if (!failed) {
                  failed = true;
                  $('#MissingE_followwhodisplay .followwholist')
                     .html('<p><em>Having trouble getting followers listing ' +
                           'from Tumblr\'s servers, please try again later.' +
                           '</em></p><img style="margin:20px 0;" src="' +
                           chrome.extension.getURL('images/oh_dear.png') +
                           '" /><div><em>Artwork by ' +
                           '<a href="http://theoatmeal.com/">The Oatmeal</a>' +
                           '</em></div>');
                  if ($('#facebox').css('display') === 'block') {
                     $.facebox({ div: '#MissingE_followwhodisplay' },
                               'followwhobox');
                  }
               }
               return true;
            }

            var j = this.pageNumber;
            followertext[j] = data;
            followerdone[j] = true;
         }
      });
   }

   for (i=0; i<followeepages; i++) {
      $.ajax({
         type: "GET",
         url: '/following/page/'+(i+1),
         dataType: "html",
         tryCount: 0,
         retryLimit: retries,
         pageNumber: i,
         error: function(xhr, textStatus) {
            this.tryCount++;
            if (!failed && this.tryCount <= this.retryLimit &&
                $('#facebox').css('display') === 'block') {
               $.ajax(this);
               return;
            }
            else if (!failed) {
               failed = true;
               $('#MissingE_followwhodisplay .followwholist')
                  .html('<p><em>Having trouble getting list of who you ' +
                        'follow from Tumblr\'s servers, please try again ' +
                        'later.</em></p><img style="margin:20px 0;" src="' +
                        chrome.extension.getURL('images/oh_dear.png') +
                        '" /><div><em>Artwork by ' +
                        '<a href="http://theoatmeal.com/">The Oatmeal</a>' +
                        '</em></div>');
               if ($('#facebox').css('display') === 'block') {
                  $.facebox({ div: '#MissingE_followwhodisplay' },
                            'followwhobox');
               }
            }
         },
         success: function(data, textStatus) {
            if (!(/id="dashboard_following"/.test(data))) {
               this.tryCount++;
               if (!failed && this.tryCount <= this.retryLimit &&
                   $('#facebox').css('display') === 'block') {
                  $.ajax(this);
                  return;
               }
               else if (!failed) {
                  failed = true;
                  $('#MissingE_followwhodisplay .followwholist')
                     .html('<p><em>Having trouble getting list of who you ' +
                           'follow from Tumblr\'s servers, please try again ' +
                           'later.</em></p><img style="margin:20px 0;" src="' +
                           chrome.extension.getURL('images/oh_dear.png') +
                           '" /><div><em>Artwork by ' +
                           '<a href="http://theoatmeal.com/">The Oatmeal</a>' +
                           '</em></div>');
                  if ($('#facebox').css('display') === 'block') {
                     $.facebox({ div: '#MissingE_followwhodisplay' },
                               'followwhobox');
                  }
               }
               return true;
            }

            var j = this.pageNumber;
            followeetext[j] = data;
            followeedone[j] = true;
         }
      });
   }

   doFWDisplay(0,0,show);
}

function followChecker_newTab() {
   var form_key = $('#form_key').val();
   if (form_key && followyou.length > 0 && youfollow.length > 0) {
      chrome.extension.sendRequest({greeting: "followChecker",
                                    formKey: form_key,
                                    followYou: followyou,
                                    youFollow: youfollow});
   }
}

function tfc_init(retries) {
   $("body").append('<div id="MissingE_followwhodisplay" style="display:none;">' +
                    '<div style="' +
                    'font:bold 24px Georgia,serif;color:#1f354c;">' +
                    'follow checker <a class="MissingE_followChecker_newTab"' +
                    ' href="#" onclick="return false;" ' +
                    'title="View in new tab"><img src="' +
                    chrome.extension.getURL('followChecker/ext.gif') +
                    '" alt="View in new tab" /></a></div>' +
                    '<div class="followwholist" ' +
                    'style="height:' + ((getPageHeight()/10)*7) +
                    'px;overflow-y:auto;text-align:center;margin-top:10px;">' +
                    '</div><img class="logo" src="' +
                    chrome.extension.getURL('missinge64.png') + '" /></div>');

   var fl = $('#right_column').find('a[href$="/followers"]');
   $('#facebox .MissingE_followChecker_newTab').live('click', followChecker_newTab);
   var uf = $("#MissingE_unfollowdelta");
   var notintxt = '<a id="MissingE_followwhonotin" title="Follow Checker" ' +
                  'class="tracked_tag_control" onclick="return false;" ' +
                  'href="#">&rho;</a>';

   if (uf.size()>0) {
      uf.after(notintxt);
   }
   else {
      fl.parent().append(' ' + notintxt);
   }
   $('#MissingE_followwhonotin').click(function() {
      chrome.extension.sendRequest({greeting: "close-followChecker"});
      var followers = $(this).parent().children("a:first").html()
                     .match(/([0-9][0-9,\.]*)/);
      var followees = $('#dashboard_nav_following').children("a:first").html()
                     .match(/[\s>]([0-9][0-9,\.]*)/);
      if (followers === undefined || followers === null ||
          followers.length < 2 || followees === undefined ||
          followees === null || followees.length < 2) {
         return false;
      }
      doFWGet(followers[1].replace(/,/g,"").replace(/\./g,""),
              followees[1].replace(/,/g,"").replace(/\./g,""), true, retries);
   });
}

if (document.body.id !== "tinymce" &&
    document.body.id !== "dashboard_edit_post") {
   chrome.extension.sendRequest({greeting: "settings",
                                 component: "followChecker"},
                                 function(response) {
      var settings = JSON.parse(response);
      tfc_init(settings.retries);
   });
}
