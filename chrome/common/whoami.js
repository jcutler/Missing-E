if (window.top == window ||
    /http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(window.location.href)) {
   chrome.extension.sendRequest({greeting: "start", url: window.location.href}, function(response){
      var active = JSON.parse(response);
      var info = "'Missing e' Startup on ";
      info += active.url + "\n";
      for (var i in active) {
         if (i != 'url') {
            if (active[i])  
               info += i + ": active\n";
            else
               info += i + ": inactive\n";
         }
      }
      console.log(info);
   });
}
