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
