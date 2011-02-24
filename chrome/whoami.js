chrome.extension.sendRequest({greeting: "start"}, function(response){
   var active = JSON.parse(response);
   var info = "'Missing e' Startup\n";
   for (var i in active) {
      info += i + ": active\n";
   }
   console.log(info);
});
