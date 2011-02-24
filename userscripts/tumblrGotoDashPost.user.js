// ==UserScript==
// @name           Tumblr Goto Dash Post
// @description    Go directly to a post on your dashboard so you can reply!
// @namespace      http://userscripts.org/users/113977
// @include        http://www.tumblr.com/dashboard/iframe*
// @version        0.1.3
// @date           2011-01-27
// @creator        Jeremy Cutler
// ==/UserScript==

(function(){

div = document.getElementsByTagName("div")[0];
controls = div.getElementsByTagName("a");
if (window.location.href.indexOf("%2Fpost%2F") != -1 ||
    window.location.href.indexOf("/post/") != -1) {

   var following = false;
   var you = true;
   for (i=0; i<document.forms.length; i++) {
      if (/unfollow$/.test(document.forms[i].action))
         following = true;
      if (/follow$/.test(document.forms[i].action))
         you = false;
   }
   if (following || you) {
      var pid = window.location.href;
      var st = pid.indexOf("pid")+4;
      var en = pid.indexOf("&",st);
      pid = pid.substring(st, en);
      pid = Number(pid)+1;
   
      var dashlnk = document.createElement('a');
      dashlnk.setAttribute('href', 'http://www.tumblr.com/dashboard/1000/' + pid + "?lite");
      dashlnk.setAttribute('target', '_top');
      var icn = document.createElement('img');
      icn.style.width = '50px';
      icn.style.height='20px';
      icn.style.borderWidth='0';
      icn.style.display='block';
      icn.style.cssFloat='left';
      icn.style.cursor='pointer';
      icn.alt='To Dash';
      icn.setAttribute('src','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAUCAYAAADPym6aAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAABl0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuNtCDrVoAAAJBSURBVFhH1Ze/a8JQEMfb2VUcHHQUB2f/BP8ARwfBQRyr7tLf1GJpEYqbUOggBcFJcOru4hRQigGlIojgVCEqpu9re3J9RqNRpAlcXvJ+3ufu3iXv9OTnevot7VqcEcS9eDi3qUD3hSNw2wjhdruzyWSyKvfzeDx3ZmOP1G4OEg6HXxRFUUejkX4kpaxExmYQr9eb7ff7Y11ck8nEniDxeLyiquonIHBpmmY/kEQiUe52u32CoLLVaukktVrtIxKJvBqFWyaTeZPHhkKhZyuhiXG9Xm9gMnY1tKLRaHkwGMxkRYzeh8Ohlk6nK/IiAKnX6wrV430LZQz3hmUQn8/32Gw2e/P5fBsWXSSCFWvJIAACCHmlVCq90+QcGH2oHn0wjkCojfdnBjTe7IFA4KHdbv8JrdlsphcKhSpETLZsE8lgKxAoAEDZwlAcCkFxUh7vqEdfCD1TvUGYrc9aTqfzVnhmudl51ioWiwpZblcQsjJ3N1cY9dzqMjj3rKlHqAPSrwidDsJsOp0us5YVEFKAEgGtwa0tQxp50BIIJvb7/blGo6F2Op0vWnxXEL7Z+f4hKFgdYcU9QaF2EI+Q4i6XKxsMBgu7gMiZgsc13+h4BhAlBGqjLHdQEHlzmXnEyvdizzGbf1HWTW43kCsBgl/knJAbDpXP5+vj8ViHiN8Ys6+u4YduTw/Ic5p65FIsCKALvrDD4bhOpVJVSCwWKx9YKa4k1oURcVyAUVFCn7Ug//1gBSASGWJ5sBJ9FocrO8vJN8O9JMwxE25gAAAAAElFTkSuQmCC');
      dashlnk.appendChild(icn);
      div.insertBefore(dashlnk,controls[controls.length-1]);
   }
}

})();