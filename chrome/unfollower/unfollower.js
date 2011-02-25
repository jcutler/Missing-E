var text;
var done;
var failed = false;
var retries = 0;

function tu_init() {
   $("body").append('<div id="113977_unfollowdisplay" style="display:none;"><div style="font:bold 24px Georgia,serif;color:#1f354c;">unfollowr.</div><div class="unfollowerlist" style="height:' + ((getPageHeight()/10)*7) + 'px;overflow-y:auto;text-align:center;margin-top:10px;"></div><img class="logo" src="' + chrome.extension.getURL('missinge64.png') + '" /></div>');

   var fl = $('#right_column').find('a[href$="/followers"]');
   var lastFollows = window.localStorage.getItem('tu_Names');
   if (lastFollows == undefined || lastFollows == null || lastFollows == "") {
      followers = fl.html().match(/([0-9][0-9,\.]*)/);
      if (followers != undefined && followers != null && followers.length >= 2)
         doGet(followers[1].replace(/,/g,"").replace(/\./g,""), false);
   }

   var deltxt = '<a id="113977_unfollowdelta" title="Unfollower" class="tracked_tag_control" onclick="return false;" href="#">&Delta;</a>';
   var fw = $("#113977_followwhonotin");
   if (fw.size()>0) {
      fw.before(deltxt);
   }
   else {
      fl.parent().append(' ' + deltxt);
   }
   $('#113977_unfollowdelta').click(function() {
      followers = $(this).parent().children("a:first").html().match(/([0-9][0-9,\.]*)/);
      if (followers == undefined || followers == null || followers.length < 2)
         return false;
      doGet(followers[1].replace(/,/g,"").replace(/\./g,""), true);
   });
}

function doGet(num, show) {
   failed = false;

   if (show) {
      $('#113977_unfollowdisplay .unfollowerlist').html('<p><img src="' + chrome.extension.getURL('facebox/loading.gif') + '" /></p>');
      $.facebox({ div: '#113977_unfollowdisplay' }, 'unfollowrbox');
   }

   var pages = Math.ceil(num / 40) + 1;
   text = new Array(pages);
   done = new Array(pages);
   for (i=0; i<pages; i++)
      done[i] = false;

   for (i=0; i<pages; i++) {
      $.ajax({
         type: "GET",
         url: '/followers/page/'+(i+1),
         dataType: "html",
         tryCount: 0,
         retryLimit: retries,
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
                  $('#113977_unfollowdisplay .unfollowerlist').html('<p><em>Having trouble getting followers listing from Tumblr\'s servers, please try again later.</em></p>');
                  if ($('#facebox').css('display') == 'block')
                     $.facebox({ div: '#113977_unfollowdisplay' }, 'unfollowrbox');
               }
            }
         },
         success: function(data, textStatus) {
            if (/id="dashboard_followers"/.test(data) == false) {
               if (!failed) {
                  failed = true;
                  $('#113977_unfollowdisplay .unfollowerlist').html('<p><em>Having trouble getting followers listing from Tumblr\'s servers, please try again later.</em></p>');
                  if ($('#facebox').css('display') == 'block')
                     $.facebox({ div: '#113977_unfollowdisplay' }, 'unfollowrbox');
               }
               return true;
            }

            var j = this.pageNumber;
            text[j] = data;
            done[j] = true;
         }
      });
   }

   doDisplay(0,show);
}

function doDisplay(start,show) {
   var fin = true;
   var i;
   for (i=start; i<done.length; i++) {
      if (!done[i]) {
         fin = false;
         break;
      }
   }
   if (fin) {
      done = [];
      var names = new Array();
      for (i=0; i<text.length; i++) {
         var raw = text[i].match(/<div class="name">\s*<a href="http:[\/0-9A-Za-z\-\_\.]*">[0-9a-zA-Z\-\_]*<\/a>/mg);
         if (raw == undefined || raw == null || raw.length == 0)
            continue;
         for (j=0; j<raw.length; j++) {
            names.push(raw[j].match(/>([0-9A-Za-z\-\_]*)<\/a>/)[1]);
         }
      }
      text = [];
      names.sort();
      for (i=0; i<names.length-1; i++) {
         if (names[i] == names[i+1])
            names.splice(i+1,1);
      }
      doFinish(names,show);
   }
   else {
      if (!failed)
         window.setTimeout(function(){doDisplay(i,show);}, 500);
   }
}

function parseNames(st) {
   if (st == undefined || st == null || st.length == 0)
      return new Array(0);
   return st.split(',').sort();
}

function serializeNames(arr) {
   return arr.sort().join(',');
}

function doFinish(newlist,show) {
   var unfollows = new Array();
   currlist = parseNames(window.localStorage.getItem('tu_Names'));
   window.localStorage.setItem('tu_Names',serializeNames(newlist));
   if (!show) return true;
   var n=0;
   var a = currlist;
   var b = newlist;
   for (c=0; c<a.length; c++) {
      for (; n<b.length && b[n] < a[c]; n++);
      if (b[n] == a[c]) n++;
      else {
         unfollows.push(a[c]);
      }
   }
   var txt = '<table id="unfollowrtable"><tbody>';
   for (i=0; i<unfollows.length; i++) {
      var klass = '';
      if (i%2==1) klass = 'tu-greyrow';
      if (i==0) klass += ' tu-firstrow';
      if (i==unfollows.length-1) klass += ' tu-lastrow';
      if (klass != '') klass = ' class="' + klass + '"';
      txt += '<tr><td ' + klass + '>';
      txt += '<a target="_blank" href="http://' + unfollows[i] + '.tumblr.com/">' +
         unfollows[i] + '</a>';
      txt += '</td></tr>';
   }
   txt += '</table>';

   if (unfollows.length == 0)
      $('#113977_unfollowdisplay .unfollowerlist').html('<p><em>Nobody has unfollowed you.</em></p>');
   else {
      txt = '<p><em style="font-size:80%;">These tumblrers have changed their username,<br />unfollowed you, or deleted their accounts:</em></p>' + txt;
      $('#113977_unfollowdisplay .unfollowerlist').html(txt);
   }
   if ($('#facebox').css('display') == 'block')
      $.facebox({ div: '#113977_unfollowdisplay' }, 'unfollowrbox');
   $('#113977_unfollowdisplay .unfollowerlist').empty();
   a = [];
   b = [];
   currlist = [];
   newlist = [];
   unfollows = [];

}

if (document.body.id != "dashboard_edit_post") {
   chrome.extension.sendRequest({greeting: "settings", component: "unfollower"}, function(response) {
      var settings = JSON.parse(response);
      retries = settings.retries;
      tu_init();
   });
}
