function addReblog(item) {
   if (item.tagName == "LI" && $(item).hasClass('post') && $(item).hasClass('is_mine') && !$(item).hasClass('new_post')) {
      if ($(item).find('div.post_controls a:contains("reblog")').length > 0)
         return true;
      var tid = $(item).attr("id").match(/[0-9]*$/)[0];
      var addr = $(item).find("a.post_avatar:first").attr("href");

      chrome.extension.sendRequest({greeting: "reblogYourself", pid: tid, url: addr}, function(response) {
         if (response.success) {
            var redir = window.location.href;
            redir = redir.replace(/http:\/\/www.tumblr.com/,'').replace(/\//g,'%2F').replace(/\?/g,'%3F').replace(/&/g,'%26');
            $(item).find('div.post_controls a:contains("edit")').after(' <a href="/reblog/' + tid + '/' + response.data + '?redirect_to=' + redir + '">reblog</a>');
         }
      });
   }
}

if (/drafts$/.test(location) == false &&
    /queue$/.test(location) == false &&
    /messages$/.test(location) == false) {
   $('#posts li.is_mine').each(function(){addReblog(this);});
   document.addEventListener('DOMNodeInserted',function(e) {
      addReblog(e.target);
   }, false);
}
