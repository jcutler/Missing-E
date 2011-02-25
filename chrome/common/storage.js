function getStorage(key, defVal) {
   var retval = localStorage[key];
   if (retval == undefined || retval == null || retval == "")
      return defVal;
   else
      return retval;
}

function setStorage(key, val) {
   localStorage[key] = val;
}
