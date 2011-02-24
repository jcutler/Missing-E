chrome.extension.sendRequest({greeting: "start", url: window.location.href}, function(response){
   var active = JSON.parse(response);
   var info = "'Missing e' Startup on ";
   info += active.url + "\n";
   for (var i in active) {
      if (i != 'url')
         info += i + ": active\n";
   }
   console.log(info);
});
