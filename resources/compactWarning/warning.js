(function(){

function removeOverride() {
   var klass = document.documentElement.className;
   klass = klass.replace(/\s?compactMissingeWarning/,'');
   document.documentElement.className = klass;
}

function showWarning() {
   removeOverride();
}

var klass;
if (document.readyState === "loading") {
   var klass = document.documentElement.className;
   if (klass !== "") {
      klass += " ";
   }
   document.documentElement.className = klass + "compactMissingeWarning";
}
else if (/compactMissingeWarning/.test(document.documentElement.className) &&
         document.getElementById("detection_alert")) {
   var lang = document.documentElement.getAttribute("lang");
   var header = document.getElementById("header");
   var warning = document.createElement("span");
   warning.id = "MissingE-compactWarning";
   var val = document.createElement("span");
   var nip = document.createElement("span");
   val.textContent = MissingE.getLocale(lang).warning;
   nip.className = "tab_notice_nipple";
   warning.appendChild(val);
   warning.appendChild(nip);
   warning.addEventListener("click", showWarning);
   header.appendChild(warning);
}
else {
   removeOverride();
}

}());
