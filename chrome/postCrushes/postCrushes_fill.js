if (document.body.id == 'dashboard_edit_post') {
   chrome.extension.sendRequest({greeting: "settings", component: "postCrushes"}, function(response) {
      var postCrushes_settings = JSON.parse(response);
      var url = window.localStorage.getItem("tcp_crushURL");
      if (url != undefined && url != null && url != "") {
         window.localStorage.removeItem("tcp_crushURL");
         var notlarge = postCrushes_settings.crushSize;
         var showPercent = postCrushes_settings.showPercent;
         var addTags = postCrushes_settings.addTags;
         if (addTags == '1') {
            var tags = window.localStorage.getItem('tcp_crushTags');
            tagarr = tags.split(',');
            var txt = "";
            document.getElementById('post_tags').value = tags;
            for (i=0; i<tagarr.length; i++) {
               if (tagarr[i] != null && tagarr[i] != '') {
                  txt += '<div class="token"><span class="tag">' + tagarr[i] + '</span>' +
                     '<a title="Remove tag" onclick="tag_editor_remove_tag($(this).up()); return false;" href="#">x</a>' +
                     '</div>';
               }
            }
            if (txt != '') {
               document.getElementById('tokens').innerHTML = txt;
               var label = document.getElementById('post_tags_label');
               label.parentNode.removeChild(label);
            }
         }
         window.localStorage.removeItem('tcp_crushTags');
         if (notlarge != '1')
            url += '&large=1';
         if (showPercent == '1')
            url += '&showPercent=1';
         document.getElementById('photo_src').value = url;
         document.getElementById('photo_upload').style.display = "none";
         document.getElementById('photo_url').style.display = "block";
      }
   });   
}
