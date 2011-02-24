function loadTimestamp(item) {
   if (item.tagName == "LI" && $(item).hasClass("post") && $(item).attr("id") != "new_post") {
      var div = $(item).find("div.post_info");
      if (div.length == 0)
         $(item).find(".post_controls:first").after('<div class="post_info"><span class="MissingE_timestamp" style="font-weight:normal;">Loading timestamp...</span></div>');
      else
         div.append('<br><span class="MissingE_timestamp" style="font-weight:normal;">Loading timestamp...</span>');
      $(item).data("tries",0);
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var addr = $(item).find("a.post_avatar:first").attr("href");

      chrome.extension.sendRequest({greeting: "timestamp", pid: tid, url: addr}, function(response) {
         if (response.success) {
            var info = $('#post_' + response.pid).find('span.MissingE_timestamp');
            info.text(response.data);
         }
         else {
            var info = $('#post_' + response.pid).find('span.MissingE_timestamp');
            info.html('Timestamp loading failed. <a class="MissingE_timestamp_retry" href="#">Retry</a>');
         }
      });
   }
}
   
/*
function work_113977(item) {
   $(".s113977_stamped").each(function() {
      var tid = this.id.match(/[0-9]*$/)[0];
      $("script.scr"+tid).remove();
   });
   $("li.post").each(function() {
      var scrs = $("script.scr"+this.id.match(/[0-9]*$/)[0]);
      if (scrs.length >= 10) scrs.remove();
      if (!(/s113977_stamped/.test($(this).attr("class"))) && this.id != "new_post")
         load_113977($(this));
   });
}

function load_113977(li) {
   var div = li.find(".post_info");
   if (div.length == 0) {
      li.find(".post_controls:first").after('<div class="post_info"></div>');
   }
   
   if (/post/.test(li.attr("class"))) {
      var scr = li.find("a.post_avatar:first").attr("href");
      scr += '/api/read/json?id=';
      var tid = li.attr("id").match(/[0-9]*$/)[0];
      scr += tid;
      scr += '&callback=callback_113977';
      var thes = $('.s113977_tts_scr[src="' + scr + '"]');
      if (thes.length <= 10) {
         scrpt = document.createElement('script');
         scrpt.setAttribute('class','s113977_tts_scr scr'+tid);
         scrpt.setAttribute('type','text/javascript');
         scrpt.src = scr;
         document.getElementsByTagName('head')[0].appendChild(scrpt);
      }
   }
}

var callback = document.createElement('script');
callback.setAttribute('id','113977_tts_callback');
callback.setAttribute('type','text/javascript');
callback.innerHTML = "function callback_113977(json){\nvar id = json['posts'][0]['id'];\nvar ts = json['posts'][0]['unix-timestamp'];\nvar li = document.getElementById('post_'+id);\nif (/s113977_stamped/.test(li.className)) return true;\nli.className += ' s113977_stamped';\nvar divs = li.getElementsByTagName('div');\nvar div_info, div, div_controls;\nfor (i=0; i<divs.length; i++) {\nif (/post_info/.test(divs[i].className)) div_info = divs[i];\nelse if (/post_controls/.test(divs[i].className)) div_controls = divs[i];\n} div = div_info;\nvar prebr = true;\nif (div.innerHTML == '') {\nprebr=false;\n}\nvar pd = new Date(ts*1000);\nvar dt = " + (GM_getValue("tts_ShowYear",1)==1 ? "pd.getFullYear() + '-' + " : "") + "((pd.getMonth()+1) < 10 ? '0' : '') + (pd.getMonth()+1) + '-' + (pd.getDate() < 10 ? '0' : '') + pd.getDate() + ' ' + (pd.getHours() < 10 ? '0' : '') + pd.getHours() + ':' + (pd.getMinutes() < 10 ? '0' : '') + pd.getMinutes();\nvar br = document.createElement('br');\nvar txt = document.createElement('span');\ntxt.style.fontWeight='normal';\ntxt.setAttribute('class','s113977_timestamp');\ntxt.innerHTML = dt;\nif (prebr) div.appendChild(br);\ndiv.appendChild(txt);\n}";
document.getElementsByTagName('head')[0].appendChild(callback);

$('span.s113977_timestamp').live('click', function(e) {
   if (e.ctrlKey)
      setShowYear();
});
*/
if (/drafts$/.test(location) == false &&
    /queue$/.test(location) == false &&
    /messages$/.test(location) == false) {
   $('#posts li.post div.post_info a.MissingE_timestamp_retry').live('click',function() {
      var post = $(this).closest('li.post');
      if (post.length == 1) {
         loadTimestamp(this.parents('li.post').get(0));
      }
   });
   $('#posts li.post').each(function(){loadTimestamp(this);});
   document.addEventListener('DOMNodeInserted',function(e) {
      loadTimestamp(e.target);
   }, false);
}
