var accmenu = document.getElementById("account_menu");

if (accmenu) {
   var links = accmenu.getElementsByTagName('a');
   var setlnk = document.createElement('a');
   setlnk.href = chrome.extension.getURL('options.html');
   setlnk.setAttribute("target","_blank");
   setlnk.innerHTML = "Missing E";
   accmenu.insertBefore(setlnk, links[links.length-1]);
}
