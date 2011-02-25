var followertext;
var followeetext;
var followerdone;
var followeedone;
var failed = false;
var retries = 0;

function tfc_init() {
   $("body").append('<div id="113977_followwhodisplay" style="display:none;"><div style="font:bold 24px Georgia,serif;color:#1f354c;">followcheckr.</div><div class="followwholist" style="height:' + ((getPageHeight()/10)*7) + 'px;overflow-y:auto;text-align:center;margin-top:10px;"></div><img class="logo" src="' + chrome.extension.getURL('missinge64.png') + '" /></div>');

   var fl = $('#right_column').find('a[href$="/followers"]');

   var uf = $("#113977_unfollowdelta");
   var notintxt = '<a id="113977_followwhonotin" title="Follow Checker" class="tracked_tag_control" onclick="return false;" href="#">&rho;</a>';

   if (uf.size()>0) {
      uf.after(notintxt);
   }
   else {
      fl.parent().append(' ' + notintxt);
   }
   $('#113977_followwhonotin').click(function() {
      followers = $(this).parent().children("a:first").html().match(/([0-9][0-9,\.]*)/);
      followees = $('#dashboard_nav_following').children("a:first").html().match(/[\s>]([0-9][0-9,\.]*)/);
      if (followers == undefined || followers == null || followers.length < 2 ||
          followees == undefined || followees == null || followees.length < 2)
         return false;
      doFWGet(followers[1].replace(/,/g,"").replace(/\./g,""), followees[1].replace(/,/g,"").replace(/\./g,""), true);
   });
}

function doFWGet(followers, followees, show) {
   failed = false;

   if (show) {
      $('#113977_followwhodisplay .followwholist').html('<p><img src="' + chrome.extension.getURL('facebox/loading.gif') + '" /></p>');
      $.facebox({ div: '#113977_followwhodisplay' }, 'followwhobox');
   }

   var followerpages = Math.ceil(followers / 40) + 1;
   var followeepages = Math.ceil(followees / 25) + 1;
   followertext = new Array(followerpages);
   followeetext = new Array(followeepages);
   followerdone = new Array(followerpages);
   followeedone = new Array(followeepages);
   for (i=0; i<followerpages; i++)
      followerdone[i] = false;
   for (i=0; i<followeepages; i++)
      followeedone[i] = false;

   for (i=0; i<followerpages; i++) {
      $.ajax({
         type: "GET",
         url: '/followers/page/'+(i+1),
         dataType: "html",
         tryCount: 0,
         retryLimit: 10,
         pageNumber: i,
         error: function(xhr, textStatus) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
               $.ajax(this);
               return;
            }
            else {
               if (!failed) {
                  failed = true;
                  $('#113977_followwhodisplay .followwholist').html('<p><em>Having trouble getting followers listing from Tumblr\'s servers, please try again later.</em></p>');
                  if ($('#facebox').css('display') == 'block')
                     $.facebox({ div: '#113977_followwhodisplay' }, 'followwhobox');
               }
            }
         },
         success: function(data, textStatus) {
            if (/id="dashboard_followers"/.test(data) == false) {
               if (!failed) {
                  failed = true;
                  $('#113977_followwhodisplay .followwholist').html('<p><em>Having trouble getting followers listing from Tumblr\'s servers, please try again later.</em></p>');
                  if ($('#facebox').css('display') == 'block')
                     $.facebox({ div: '#113977_followwhodisplay' }, 'followwhobox');
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
         retryLimit: 10,
         pageNumber: i,
         error: function(xhr, textStatus) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
               $.ajax(this);
               return;
            }
            else {
               if (!failed) {
                  failed = true;
                  $('#113977_followwhodisplay .followwholist').html('<p><em>Having trouble getting list of who you follow from Tumblr\'s servers, please try again later.</em></p>');
                  if ($('#facebox').css('display') == 'block')
                     $.facebox({ div: '#113977_followwhodisplay' }, 'followwhobox');
               }
            }
         },
         success: function(data, textStatus) {
            if (/id="dashboard_following"/.test(data) == false) {
               if (!failed) {
                  failed = true;
                  $('#113977_followwhodisplay .followwholist').html('<p><em>Having trouble getting list of who you follow from Tumblr\'s servers, please try again later.</em></p>');
                  if ($('#facebox').css('display') == 'block')
                     $.facebox({ div: '#113977_followwhodisplay' }, 'followwhobox');
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

function doFWDisplay(followerstart,followeestart,show) {
   var fin = true;
   var i,j;
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
      var followernames = new Array();
      for (i=0; i<followertext.length; i++) {
         var raw = followertext[i].match(/<div class="name">\s*<a href="http:[\/0-9A-Za-z\-\_\.]*">[0-9a-zA-Z\-\_]*<\/a>/mg);
         if (raw == undefined || raw == null || raw.length == 0)
            continue;
         for (j=0; j<raw.length; j++) {
            followernames.push(raw[j].match(/>([0-9A-Za-z\-\_]*)<\/a>/)[1] + ';' + raw[j].match(/a href="(http:[\/0-9A-Za-z\-\_\.]*)"/)[1]);
         }
      }
      followertext = [];
      followernames.sort();
      for (i=0; i<followernames.length-1; i++) {
         if (followernames[i] == followernames[i+1])
            followernames.splice(i+1,1);
      }

      var followeenames = new Array();
      for (i=0; i<followeetext.length; i++) {
         var raw = followeetext[i].match(/<div class="name">\s*<a href="http:[\/0-9A-Za-z\-\_\.]*">[0-9a-zA-Z\-\_]*<\/a>/mg);
         if (raw == undefined || raw == null || raw.length == 0)
            continue;
         for (j=0; j<raw.length; j++) {
            followeenames.push(raw[j].match(/>([0-9A-Za-z\-\_]*)<\/a>/)[1] + ';' + raw[j].match(/a href="(http:[\/0-9A-Za-z\-\_\.]*)"/)[1]);
         }
      }
      followeetext = [];
      followeenames.sort();
      for (i=0; i<followeenames.length-1; i++) {
         if (followeenames[i] == followeenames[i+1])
            followeenames.splice(i+1,1);
      }

      doFWFinish(followernames, followeenames,show);
   }
   else {
      if (!failed)
         window.setTimeout(function(){doFWDisplay(i,j,show);}, 500);
   }
}

function doFWFinish(followers, followees, show) {
   var youfollow = new Array();
   var followyou = new Array();
   if (!show) return true;
   
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

   for (; f<followers.length; f++)
      followyou.push(followers[f]);
   for (; e<followees.length; e++)
      youfollow.push(followees[e]);

   followers = [];
   followees = [];
  
   var txt = '<table id="followwhotable" border="0"><thead><tr><th><em>You Don\'t Follow (' + followyou.length + ')</em></th><th><em>Don\'t Follow You (' + youfollow.length + ')</em></th></tr></thead><tbody>';
   for (i=0;i<youfollow.length && i<followyou.length;i++) {
      var yentry = youfollow[i].split(';');
      var fentry = followyou[i].split(';');
      var fklass = '';
      var yklass = '';
      if (i%2==1) fklass = 'fw-greyrow';
      if (i%2==1) yklass = 'fw-greyrow';
      if (i==youfollow.length-1) yklass+=' fw-last';
      if (i==followyou.length-1) fklass+=' fw-last';
      if (fklass != '') fklass = 'class="' + fklass + '"';
      if (yklass != '') yklass = 'class="' + yklass + '"';
      txt += '<tr><td ' + fklass + '><a target="_blank" href="' + fentry[1] + '">' + fentry[0] + '</a></td>';
      txt += '<td ' + yklass + '><a target="_blank" href="' + yentry[1] + '">' + yentry[0] + '</a></td></tr>';
   }
   for (; i<youfollow.length; i++) {
      var klass = '';
      if (i%2==1) klass = 'fw-greyrow';
      if (i==youfollow.length-1) klass+=' fw-last';
      if (klass != '') klass = 'class="' + klass + '"';
      var yentry = youfollow[i].split(';');
      txt += '<tr><td></td><td ' + klass + '><a target="_blank" href="' + yentry[1] + '">' + yentry[0] + '</a></td></tr>';
   }
   for (; i<followyou.length; i++) {
      var klass = '';
      if (i%2==1) klass = 'fw-greyrow';
      if (i==followyou.length-1) klass+=' fw-last';
      if (klass != '') klass = 'class="' + klass + '"';
      var fentry = followyou[i].split(';');
      txt += '<tr><td ' + klass + '><a target="_blank" href="' + fentry[1] + '">' + fentry[0] + '</a></td><td></td></tr>';
   }
   txt += '</tr></tbody></table>';
   $('#113977_followwhodisplay .followwholist').html(txt);

   followyou = [];
   youfollow = [];
   if ($('#facebox').css('display') == 'block')
      $.facebox({ div: '#113977_followwhodisplay' }, 'followwhobox');
   $('#113977_followwhodisplay .followwholist').empty();
}

if (document.body.id != "tinymce" &&
    document.body.id != "dashboard_edit_post") {
   chrome.extension.sendRequest({greeting: "settings", component: "followChecker"}, function(response) {
      var settings = JSON.parse(response);
      retries = settings.retries;
      tfc_init();
   });
}
