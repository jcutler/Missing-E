missinge.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ missinge.showFirefoxContextMenu(e); }, false);
};

missinge.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-missinge").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { missinge.onFirefoxLoad(); }, false);
