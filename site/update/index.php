<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en" dir="ltr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="tumblr,missinge,missing,e,feature,features,blog,blogging" />
<meta name="description" content="Missing e - The browser extension for Tumblr!"/>
<meta name="author" content="Jeremy Cutler" />
<meta name="robots" content="FOLLOW,INDEX" />
<title>Update - Missing e - The browser extension for Tumblr!</title>
<link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
<link rel="icon" href="/favicon.png" type="image/x-icon" />
<script type="text/javascript" src="/jquery-1.5.min.js"></script>
<link rel="stylesheet" type="text/css" href="/style.css" />
<script type="text/javascript">
<!--
var img1 = new Image();
img1.src = '/images/github_white.png'; 
var img2 = new Image();
img2.src = '/images/github_blue.png';

jQuery(document).ready(function($) {
   $('a#github').hover(
                       function() { $(this).find('img').attr("src",'/images/github_blue.png'); },
                       function() { $(this).find('img').attr("src",'/images/github_white.png'); });
});
-->
</script>
</head>
<body id="faq">
<div id="logo"><a name="top"></a><a href="/"><img src="/images/missinge.png" alt="Missing e" /></a></div>
<div id="map"><a href="/">GET</a><a href="/about">ABOUT</a><a href="/features">FEATURES</a><a href="/faq">FAQ</a><a href="http://blog.missinge.infraware.ca">BLOG</a></div><div id="content">
<div class="clear"></div>
<h1>There's a new version of <em>Missing e</em>!</h1>
<h2 style="text-align:center;background-color:transparent;"><a href="<?=urldecode($_GET["l"]);?>">Read about it here</a></h2>
<p class="question">How do I update 'Missing e' to the newest version?</p>
<div class="response">
<?php
if ($_GET["b"] === 'chrome') {
?>
<p class="singleline"><strong>Google Chrome</strong></p>
<p>Google Chrome extensions should update automatically on a somewhat regular basis. If you would like to <em>force</em> Chrome to update 'Missing e' now, follow these instructions:</p>
<p>In the Google Chrome menu (the wrench icon at the top right of the browser), go to <em>"Tools"</em> and click on <em>"Extensions"</em>. Once in your extensions list, click the <em>"Developer mode"</em> button on the right-hand side.</p>
<div class="example"><img src="/images/examples/chrome-update-1.png" alt="Activate Developer mode" /></div>
<p>Then, click the <em>"Update extensions now"</em> button.</p>
<div class="example"><img src="/images/examples/chrome-update-2.png" alt="Update extensions" /></div>
<p>You have successfully updated 'Missing e'. Reload any Tumblr tabs you have open to take advantage of features in the new version</p>
<?php
}
else if ($_GET["b"] === 'safari') {
?>
<p class="singleline"><strong>Apple Safari</strong></p>
<p>If Safari is configured to update extensions automatically, extensions should be updated on a somewhat regular basis. If it is not configured to do so, or you wish to <em>force</em> Safari to update 'Missing e' now, follow these instructions:</p>
<p>In the Apple Safari <em>Preferences</em> window (which you can open from the Safari menu), click on the <em>"Extensions"</em> pane. Your list of installed extensions appears at the left. Click on the <em>"Updates"</em> button to show available extension updates.</p>
<div class="example"><img src="/images/examples/safari-update-1.png" alt="Safari Preferences, Extensions pane" /></div>
<p>Click on the <em>"Install All Updates"</em> button to update all of your extensions. If you wish to only update 'Missing e', find it in the list of avaialable updates and click on the <em>"Install"</em> button beside the 'Missing e' icon.</p>
<div class="example"><img src="/images/examples/safari-update-2.png" alt="Update extensions" /></div>
<?php
}
else if ($_GET["b"] === 'firefox') {
?>
<p class="singleline"><strong>Mozilla Firefox</strong></p>
<p>Firefox should update extensions automatically. However, the newest versions of 'Missing e' may not be immediately updated until they are reviewed by the Mozilla Add-ons site. If you wish to <em>force</em> Firefox to update to the newest version of 'Missing e' now, follow these instructions:</p>
<ul><li>Go to the <a href="https://addons.mozilla.org/en-US/firefox/addon/missing-e/versions/"><em>'Missing e' Version History</em> page</a> on the Mozilla Add-ons site.</li>
<li>Simply click on the <em>"Add to Firefox"</em> button next to the newest version (the one at the top of the list)</li></ul>
<?php
}
?>
</div>
<div id="inlinefooter"><div id="foot-left">An open-source project released under <a href="http://www.gnu.org/licenses/gpl.html">GPL v3</a></div><div class="clear"></div></div>
</div>
</body>
</html>
