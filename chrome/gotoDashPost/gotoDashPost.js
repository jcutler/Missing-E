if (/http:\/\/www\.tumblr\.com\/dashboard\/iframe/.test(window.location.href)) {
   div = document.getElementsByTagName("div")[0];
   controls = div.getElementsByTagName("a");
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
      icn.setAttribute('src', chrome.extension.getURL('gotoDashPost/goto.png'));
      dashlnk.appendChild(icn);
      div.insertBefore(dashlnk,controls[controls.length-1]);
   }
}
