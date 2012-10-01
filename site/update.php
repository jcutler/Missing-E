<!DOCTYPE html>
<?php
include 'firefoxURL.php';
?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en" dir="ltr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="tumblr,missinge,missing,e,feature,features,blog,blogging" />
<meta name="description" content="Missing e - The unofficial browser extension for Tumblr!"/>
<meta name="author" content="Jeremy Cutler" />
<meta name="robots" content="FOLLOW,INDEX" />
<title>Update - Missing e - The original browser extension for Tumblr!</title>
<link href='http://fonts.googleapis.com/css?family=Kreon:300,400,700' rel='stylesheet' type='text/css'>
<link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
<link rel="icon" href="/favicon.png" type="image/x-icon" />
<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/bcjbagclppcgdbpobcpoojdjdmcjhpid">
<script type="text/javascript" src="browser.js"></script>
<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="currentVersion.js"></script>
<link rel="stylesheet" type="text/css" href="reset.css" />
<link rel="stylesheet" type="text/css" href="sitestyles.css" />
<script type="text/javascript">
<!--

var updateCheck;
var extResponded;
var upToDate = false;

function toggleBrowser(browser) {
   var success = false;
   browser = browser.toLowerCase();
   if (browser === 'chrome') {
      success = true;
      $('#download_firefox').hide();
      $('#download_safari').hide();
      $('#download_chrome').show();
   }
   else if (browser === 'firefox') {
      success = true;
      $('#download_chrome').hide();
      $('#download_safari').hide();
      $('#download_firefox').show();
   }
   else if (browser === 'safari') {
      success = true;
      $('#download_chrome').hide();
      $('#download_firefox').hide();
      $('#download_safari').show();
   }
   if (success) {
      $('#download_select').hide();
      $('#download_process').show();
   }
   return false;
}

function versionCompare(v1, v2) {
   if (!v1 && !v2) { return 0; }
   else if (!v1) { return -1; }
   else if (!v2) { return 1; }
   else {
      var i;
      var ver1 = v1.split('.');
      var ver2 = v2.split('.');
      var len = ver1.length >= ver2.length ? ver1.length : ver2.length;
      for (i=0; i<len; i++) {
         if (i >= ver1.length && ver2[i] !== '0') { return -1; }
         else if (i >= ver2.length && ver1[i] !== '0') { return 1; }
         else {
            ver1[i] = parseInt(ver1[i]);
            ver2[i] = parseInt(ver2[i]);
         }
         if (ver1[i] > ver2[i]) { return 1; }
         if (ver2[i] > ver1[i]) { return -1; }
      }
      return 0;
   }
}

function updateToggle(uptodate, browser, version) {
   var success = false;
   browser = browser.toLowerCase();
   $('#loading_message').hide();
   if (uptodate && versionCompare(version,currentVersion) >= 0) {
      $('#download_process').hide().children('div').hide();
      $('#uptodate_message').show();
   }
   else {
      $('#uptodate_message').hide();
      toggleBrowser(browser);
   }
}

function receiveMessage(msg) {
   if (msg.data.response === "updated") {
      if (updateCheck) {
         window.clearTimeout(updateCheck);
      }
      $('#old_update').remove();
      upToDate = msg.data.uptodate;
      window.postMessage({"MissingE":true, "src":"site",
                          "request":"extensionInfo"},
                         "http://missing-e.com");
   }
   if (msg.data.response === "extensionInfo") {
      var browser = BrowserDetect.browser;
      if (msg.data.info && msg.data.info.browser) {
         browser = msg.data.info.browser;
      }
      updateToggle(upToDate, browser, msg.data.info.version);
   }
}

function checkUpdate(count) {
   if (!count) { count = 1; }

   if (window.extResponded) {
      return;
   }
   else if ($('#old_update').length === 0) {
      return;
   }
   else if ($('#uptodate').css('display') === "inline-block" ||
            $('#notuptodate').css('display') === "inline-block") {
      $('#old_update').remove();
      updateToggle(false, BrowserDetect.browser);
      return;
   }
   else if (count === 3) {
      updateToggle(false, BrowserDetect.browser);
   }
   else if (count > 20) {
      return;
   }
   count++;
   window.postMessage({"MissingE":true, "src":"site", "request":"updated"},
                      "http://missing-e.com");
   updateCheck = setTimeout(function(){ checkUpdate(count); }, 500);
}

function loadChromeDownload() {
   location.href = $('#chrome_install').attr('href');
}

jQuery(document).ready(function($) {
   if (typeof firefoxURL !== "undefined") {
      $('#firefox_download').attr('href',firefoxURL);
   }
   $('a.recognize_other').click(function() {
      $('#download_process').hide().children('div').hide();
      $('#download_select').show();
      return false;
   });
   $('#download_select a').click(function() {
      var item = $(this);
      var browser = $(this).attr('class');
      toggleBrowser(browser);
      return false;
   });
   $('#chrome_install').click(function() {
      if (chrome.webstore.install) {
         chrome.webstore.install('https://chrome.google.com/webstore/detail/bcjbagclppcgdbpobcpoojdjdmcjhpid',
            function(){return;}, loadChromeDownload);
         return false;
      }
      else {
         loadChromeDownload();
         return false;
      }
   });
   window.extResponded = false;
   window.addEventListener("message", function(e) {
      if (e.data && e.data.MissingE && e.data.src === "extension") {
         window.extResponded = true;
         receiveMessage(e);
      }
   }, false);
   window.postMessage({"MissingE":true, "src":"site", "request":"updated"},
                      "http://missing-e.com");
   updateCheck = setTimeout(checkUpdate, 500);
});

-->
</script>
</head>
<body id="download">
<div id="old_update">
 <div id="uptodate"></div>
 <div id="notuptodate"></div>
</div>
<div version="2.13.4" id="versioncheck" style="display:none"></div>
<header>
 <nav>
  <div id="nav_bar">
   <a href="/" id="home_nav"><span id="home_navbg"></span><span class="subtext">HOME</span><img src="images/missinge100.png" alt="Home" /></a>
   <div id="nav_links">
    <a href="features" class="features_nav">FEATURES<span class="subtext">WHAT IT'S FOR.</span></a>
    <a href="faq" class="faq_nav">FAQ<span class="subtext">QUESTIONS?</span></a>
    <a href="troubleshoot" class="problems_nav">PROBLEMS<span class="subtext">LET'S TROUBLESHOOT!</span></a>
    <a href="http://blog.missing-e.com" class="blog_nav">BLOG<span class="subtext">STAY UPDATED.</span></a>
    <a href="https://www.paypal.com/ca/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=EGQCRBB2BH5U8" class="donate_nav">DONATE<span class="subtext">SUPPORT MISSING E!</span></a>
   </div>
  </div>
 </nav>
 <div id="banner">
  <div id="icon_ribbon">
   <div id="page_icon">
    <img src="images/update.png" alt="Update Missing e" style="margin-left:5px;margin-top:0;opacity:0.95;" />
   </div>
  </div>
  <div id="icon_ribbon_rem"></div>
  <div id="banner_text">
   <hgroup>
    <h1>Update Missing e!</h1>
    <h2>Keep <strong>Missing e</strong> up to date so you don't miss out on fixes and new features.</h2>
   </hgroup>
  </div>
 </div>
</header>
<div id="ad_title">Ads by Google. Missing e does not endorse and disclaims liability for any product, manufacturer, distributor, service or service provider mentioned.</div>
<div id="ad">
 <div id="ad_sidetitle"></div>
 <script type="text/javascript">
  <!--
   google_ad_client = "ca-pub-3604999147338055";
   /* New Site */
   google_ad_slot = "2433939047";
   google_ad_width = 728;
   google_ad_height = 90;
  //-->
 </script>
 <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
</div>
<div id="main_content">
 <div class="content_box">
  <div id="loading_message">
   <div class="iconbar">
    <div class="baricon" id="clock"></div>
    <div class="bartxt">
     <h1>Getting version information&hellip;</h1>
    </div>
   </div>
  </div>
  <div id="uptodate_message" style="display:none;">
   <div class="iconbar">
    <div class="baricon" id="battery"></div>
    <div class="bartxt">
     <h1>Sweet! Your <strong>Missing e</strong> extension is up to date.</h1>
    </div>
   </div>
  </div>
  <div id="download_select" style="display:none;">
   <h1>Select your browser:</h1>
   <div class="browser_select">
    <a class="chrome" href="#"><img src="images/chrome.png" alt="Google Chrome" /><div>Google Chrome</div></a>
    <a class="firefox" href="#"><img src="images/firefox.png" alt="Mozilla Firefox" /><div>Mozilla Firefox</div></a>
    <a class="safari" href="#"><img src="images/safari.png" alt="Apple Safari" /><div>Apple Safari</div></a>
   </div>
  </div>
  <div id="download_process" style="display:none;">
   <div id="download_chrome" style="display:none;">
    <div class="recognize">Your browser appears to be <strong>Google Chrome</strong>. <a class="silverbutton button recognize_other" href="#">Not correct?</a></div>
    <div class="install_title">
     <h1><strong>Missing e</strong> is not up to date. <strong>Update it now!</strong></h1>
     <div class="update_text">Chrome will update your extensions regularly. To update immediately, follow these instructions:</div>
    </div>
    <div class="highlights">
     <div class="postit_box paper_box1 install_box">
      <div class="step_icon step1"></div>
      <hgroup><h1>Get the new version</h1></hgroup>
      <p>Click the button below to download <strong>Missing e</strong>.</p>
      <a id="chrome_install" href="https://clients2.google.com/service/update2/crx?response=redirect&amp;x=id%3Dbcjbagclppcgdbpobcpoojdjdmcjhpid%26uc%26lang%3Den-US" class="button greenbutton">Download Now</a>
     </div>
     <div class="postit_box paper_box2 install_box">
      <div class="step_icon step2"></div>
      <hgroup><h1>Confirm installation</h1></hgroup>
      <p>Click the <strong>Continue</strong> button in the confirmation that may appear at the bottom of your browser window.</p>
      <p>When asked if you want to <em>Add "Missing e"</em>, click the <strong>Add</strong> button.</p>
     </div>
     <div class="paper_box paper_box3 install_box">
      <div class="step_icon step3"></div>
      <hgroup><h1>You're done!</h1></hgroup>
      <p>Wasn't that easy? Now reload Tumblr to continue using <strong>Missing e</strong>.</p>
     </div>
    </div>
   </div>
   <div id="download_safari" style="display:none;">
    <div class="recognize">Your browser appears to be <strong>Apple Safari</strong>. <a class="silverbutton button recognize_other" href="#">Not correct?</a></div>
    <div class="install_title">
     <h1><strong>Missing e</strong> is not up to date. <strong>Update it now!</strong></h1>
     <div class="update_text">Safari will update your extensions regularly. To update immediately, follow these instructions:</div>
    </div>
    <div class="highlights">
     <div class="postit_box paper_box1 install_box">
      <div class="step_icon step1"></div>
      <hgroup><h1>Get the new version</h1></hgroup>
      <p>Click the button below to download <strong>Missing e</strong>.</p>
      <a href="safari/download.php" class="button greenbutton">Download Now</a>
     </div>
     <div class="postit_box paper_box2 install_box">
      <div class="step_icon step2"></div>
      <hgroup><h1>Install the extension</h1></hgroup>
      <p>Open the downloaded file <em>(missinge.safariextz)</em> by double-clicking on it.</p>
      <p>When asked to if you are sure you want to install, click the <strong>Install</strong> button.</p>
     </div>
     <div class="paper_box paper_box3 install_box">
      <div class="step_icon step3"></div>
      <hgroup><h1>You're done!</h1></hgroup>
      <p>Wasn't that easy? Now reload Tumblr to continue using <strong>Missing e</strong>.</p>
     </div>
    </div>
   </div>
   <div id="download_firefox" style="display:none;">
    <div class="recognize">Your browser appears to be <strong>Mozilla Firefox</strong>. <a class="silverbutton button recognize_other" href="#">Not correct?</a></div>
    <div class="install_title">
     <h1><strong>Missing e</strong> is not up to date. <strong>Update it now!</strong></h1>
     <div class="update_text">Firefox will update your extensions regularly. To update immediately, follow these instructions:</div>
    </div>
    <div class="highlights">
     <div class="postit_box paper_box1 install_box">
      <div class="step_icon step1"></div>
      <hgroup><h1>Get the new version</h1></hgroup>
      <p>Click the button below to download <strong>Missing e</strong>.</p>
      <a id="firefox_download" href="<?=$firefoxURL?>" class="button greenbutton">Download Now</a>
     </div>
     <div class="postit_box paper_box2 install_box">
      <div class="step_icon step2"></div>
      <hgroup><h1>Confirm installation</h1></hgroup>
      <p>Click the <strong>Install Now</strong> button in the confirmation box that appears.</p>
     </div>
     <div class="paper_box paper_box3 install_box">
      <div class="step_icon step3"></div>
      <hgroup><h1>You're done!</h1></hgroup>
      <p>Wasn't that easy? Now reload Tumblr to continue using <strong>Missing e</strong>.</p>
     </div>
    </div>
   </div>
  </div>
 </div>
</div>
<div id="footer_container">
 <div id="footer">
  &copy; 2012, Jeremy Cutler<br />
  <small>An open-source project released under <a class="link" href="http://www.gnu.org/licenses/gpl.html" title="GPL v3 License">GPL v3</a></small>
  <a class="button silverbutton" href="http://blog.missing-e.com" title="Missing e on Tumblr">Follow Missing e on Tumblr</a>
 </div>
</div>
</body>
</html>
