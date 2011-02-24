chrome.extension.sendRequest({greeting: "settings", component: "postingFixes"}, function(response) {
   var postingFixes_settings = JSON.parse(response);
   if (postingFixes_settings.photoReplies == 1) {
      var apr = document.getElementById("allow_photo_replies");
      if (apr != null && apr != undefined) apr.checked = true;
   }
   
   if (postingFixes_settings.uploaderToggle == 1) {
      var url = document.getElementById("photo_url");
      var lnk = document.getElementById("use_url_link");
      
      if (url != null && url != undefined && lnk != null && lnk != undefined) {
         var uil = lnk.cloneNode();
         uil.id = "use_img_link";
         uil.innerHTML = '<a href="#" onclick="Element.hide(\'photo_url\'); $(\'photo_src\').value = \'\'; Element.show(\'photo_upload\'); return false;">Upload images instead</a>';
         uil.style.marginTop = "7px";
         url.appendChild(uil);
      }
   }
});
