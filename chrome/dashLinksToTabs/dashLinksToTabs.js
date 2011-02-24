var lcol = document.getElementById('left_column')

if (lcol) {
   lcol.addEventListener('click', function(e) {
      if (e.target == undefined || e.target == null) return false;
      var node = e.target;
      if (node.tagName!='A') {
         for (; node != null && node.tagName != 'AREA' && node.tagName != 'A' && node.id != this; node=node.parentNode);
      }
      if (node == null || node == this) return false;
      if (!/^#/.test(node.href))
         node.target='_blank'
      return true;
   }, false);
}
