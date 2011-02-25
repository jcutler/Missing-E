function getPageHeight() {
   var windowHeight;
   if (self.innerHeight) {
      // all except Explorer
      windowHeight = self.innerHeight;
   }
   else if (document.documentElement && document.documentElement.clientHeight) {
      // Explorer 6 Strict Mode
      windowHeight = document.documentElement.clientHeight;
   }
   else if (document.body) {
      // other Explorers
      windowHeight = document.body.clientHeight;
   }
   return windowHeight;
}
