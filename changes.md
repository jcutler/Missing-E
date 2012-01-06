---
title: Change History - Missing e - The browser extension for Tumblr!
---

<style type="text/css">
body {
font:13px Helvetica,Arial,sans-serif;
margin:20px;
padding:0 20px 10px;
max-width:900px;
border:1px solid #CCC;
border-radius:3px;
-webkit-box-shadow:rgba(0,0,0,0.07) 0 1px 2px inset;
-webkit-border-radius:3px;
-moz-border-radius:3px;
}

h1 {
font-size:170%;
border-top:4px solid #AAA;
padding-top:0.5em;
margin-top:1.5em;
}

h2, h3 {
margin:1em 0;
}

h2 {
font-size:130%;
margin-top:1.5em;
border-top:4px solid #E0E0E0;
padding-top:0.5em;
}

p {
margin:1em 0;
line-height:1.5em;
}

pre {
margin:1em 0;
font-size:12px;
background-color:#EEE;
border:1px solid #DDD;
padding:5px;
color:#444;
overflow:auto;
-webkit-box-shadow:rgba(0,0,0,0.07) 0 1px 2px inset;
-webkit-border-radius:3px;
-moz-border-radius:3px;
border-radius:3px;
}

code {
font-size:12px;
background-color:#f8f8ff;
color:#444;
padding:0 0.2em;
border:1px solid #DEDEDE;
}

pre code {
padding:0;
font-size:12px;
background-color:#EEE;
border:none;
}

a {
color:#4183c4;
}
</style>

#_Missing e_ Change History

    + indicates added features or functionality  
    - indicates features or functionality removed  
    ! indicates fixes to bugs and issues

##**2.3.7** (not yet released)
**_+_** Add option for 40x40 pixel avatar size in Reply Replies  
**_+_** Add selection button for private posts in Mass Editor Tweaks  
**_!_** Change option for expanding all inline images in a post togethre to an opt-out of now default Tumblr interface behaviour  
**_!_** Improve loading speed for page style changes  
**_!_** Fix bug in Sidebar Tweaks default account when importing 'Missing e' settings in Firefox  
**_!_** Prevent error output when using a tab in which 'Missing e' settings have been loaded to navigate to other pages  
**_!_** Fix bug with some Firefox users unable to add/remove bookmarks  
**_!_** Fix alignment issue for close button on 'Missing e' modal boxes  
**_!_** Remove deprecated Magnifier retries setting  
**_!_** Remove Posting Tweaks photo URL / upload photo toggler (now implemented in standard Tumblr interface)

##**2.3.6** (12/27/2011)
**_!_** Improved sanitization of injected HTML

##**2.3.5** (12/27/2011)
**_!_** 'Missing e' bookmarks now preserved when clearing browser cache and local storage data  
**_!_** Compatibility fix for interaction with Tumblr Helper extension  
**_!_** Improved sanitization of injected HTML

##**2.3.4** (12/21/2011)
**_!_** Replace assignments to DOM node innerHTML properties with more efficient/secure alternatives

##**2.3.3** (12/13/2011)
**_!_** Fix Reply Replies issue on Firefox with post body showing up as 'null'  
**_!_** Improve performance of Reply Replies and Post Crushes feature when opening multiple tabs at the same time  
**_!_** Fix transparent text problem in quick reblog menu tag input box

##**2.3.2** (12/10/2011)
**_!_** Fix non-functioning extension on RockMelt browser  
**_!_** Fix hiding of new post icons for custom themes using Stylish (Firefox-only bug)

##**2.3.1** (12/10/2011)
**_!_** Fix issue with Firefox settings for Ask Fixes, Dashboard Fixes and Posting Fixes being reset

##**2.3.0** (12/10/2011)
**_+_** Add "delete" button option for secondary Tumblr permalink post pages  
**_+_** Enable photo magnification for drafts and queued posts  
**_!_** Add reblog button to ask post permalink pages when Better Reblogs ask reblogging option is on but Reblog Yourself is off  
**_!_** Load correct images with Magnifier for posts that have had images replaced  
**_!_** Extend sidebar adding to paginated dashboard pages  
**_!_** Re-run tags AJAX request when dequeueing it (Chrome-only bug)  
**_!_** Fix bug that prevented retrying when initially failing to get reblog keys for Reblog Yourself or ask reblogging in Better Reblogs (Firefox-only bug)  
**_!_** Fix resizable rich-text editor (Firefox-only bug)  
**_!_** Prevent multiple sortable notes buttons being added to posts after sending an ask using the ask box on dashboard feature (Chrome/Firefox bug)  
**_!_** Prevent multiple added elements from being injected into page  
**_!_** Move to common source code base for all platforms

##**2.2.18** (11/22/2011)
**_!_** Fix Polish messages/post deletion confirm message

##**2.2.17** (11/21/2011)
**_!_** Fix incorrect blockquote attribution when reblogging asks from permalink pages  
**_!_** Prevent reblog replies from adding multiple buttons

##**2.2.16** (11/21/2011)
**_!_** Prevent left and right arrow navigation when using tags input field for Quick Reblogging and Ask Tweaks, as well as renaming bookmarks  
**_!_** Implement overriding of Firefox Stylish hiding of notification type icons for Reply Replies  
**_!_** Reblog tags option in Safari set to be active by default (to match other platforms)  
**_!_** Change software license to GPL v3

##**2.2.15** (11/18/2011)

**_!_** Fixed JSON format error in localization file that caused 'Missing e' for Firefox not to start up

##**2.2.14** (11/18/2011)

**_!_** Fixed some translations for Polish localization

##**2.2.13** (11/17/2011)

**_+_** Enable settings exporting and importing using files  
**_+_** Add Shuffle Queue button to Dashboard Tweaks  
**_+_** Add Polish language localization  
**_!_** Force default language to English when correct localization does not exist  
**_!_** Localize text for Post Crushes button  
**_!_** Fix sortable notes not sorting by username  
**_!_** Fix issue in which Mass Editor Tweaks cannot select Chat posts  
**_!_** Fix adding of edit button on sub-Tumblr permalink pages (Safari)

##**2.2.12** (11/07/2011)

**_!_** Fix sizing of Facebook features notification bar for widescreen

##**2.2.11** (11/06/2011)

**_+_** Add reblogging of Ask posts  
**_!_** Fix incorrect calculation of daylight savings time for Timestamps

##**2.2.8** (11/01/2011)

**_!_** Fix Timestamps issue with posts less than a week old, but in a previous month, having dates reported incorrectly.

##**2.2.7** (10/27/2011)

**_+_** Added Russian language localization  
**_!_** Fix problem with features not running on Tumblelog pages (URLs changed from "/tumblelog" to "/blog")

##**2.2.4** (10/16/2011)

**_!_** Fix askbox on dashh feature when on /inbox or /messages pages  
**_!_** Fix issue where Magnifier and Bookmarker not running on pages with URLs ending in trailing slashes

##**2.2.2** (10/14/2011)

**_+_** Sortable notes in dashboard posts  
**_+_** Draggable askbox on dashboard  
**_!_** Do not insert avatar magnifier on queued posts (where no avatar actually present)  
**_!_** Fix issue with some features not running on posts loaded with endless scrolling dashboard when quant.js blocked by browser  
**_!_** Reblog tags when right-clicking and opening reblog in new tab  
**_!_** Update jQuery UI to 1.8.16

##**2.2.0** (10/12/2011)

**_!_** Fix tag reblogging (Tumblr implementation was changed to not reblog tags anymore)  
**_!_** Fix Chrome-only issue with edit button clicks not registering correctly on queued posts

##**2.1.12** (10/06/2011)

**_!_** Fix layout for inline "+ Upload Photo" uploader in Tumblr Share bookmarklet

##**2.1.11** (10/04/2011)

**_!_** Update Firefox version compatibility to 10.0a

##**2.1.8** (09/30/2011)

**_!_** Fix issue with mass delete options not correctly styled in drafts/queue when Ask Fixes mass delete feature not enabled  
**_!_** Fix Chrome on Mac issue where mass delete checkboxes appear truncated

##**2.1.5** (09/22/2011)

**_!_** Fix slim sidebar layout for spotlight blogs  
**_!_** Implement jump to post when click on bookmark for post currently loaded on the page

##**2.1.3** (09/13/2011)

**_!_** Correctly unhide iframe content in Safe Dash

##**2.1.1** (09/08/2011)

**_!_** Fix issue with reblog as text feature running twice on some posts

##**2.1.0** (09/08/2011)

**_!_** Fix issue with manual quick reblogging adding extra blank tag to beginning of tags  
**_!_** Improve implementation of showing queue post sorting icons  
**_!_** Renaming some features  
**_!_** Allow overriding of tags when manually reblogging from quick reblog menu  
**_!_** Prevent j/k navigation when editing bookmark labels

##**2.0.9** (09/01/2011)

**_!_** Fix Sidebar Tweaks added sidebar option (broken by change in Tumblr backend)  
**_!_** Fixes to Spanish localization

##**2.0.7** (08/26/2011)

**_+_** Add automatic tagging of posts queued from quick reblog menu

##**2.0.5** (08/25/2011)

**_+_** Restore Timestamps feature lost at version 2.0.0  
**_+_** Automatic tagging of queued posts  
**_+_** Mass delete feature for draft and queued posts  
**_+_** Add Spanish localization

##**2.0.4** (08/23/2011)

**_!_** Fix "+ Upload Photo" uploader in Firefox

##**2.0.2** (08/22/2011)

**_!_** Improve fix for "+ Upload Photo" uploader

##**2.0.1** (08/17/2011)

**_!_** Fix "+ Upload Photo" uploader (broken by change in Tumblr backend)

##**2.0.0** (08/13/2011)

**_-_** Remove Timestamps feature for posts _**\*(restored in version 2.0.5)**_, keep timestamps for unanswered asks  
**_-_** Remove hide radar feature  
**_-_** Remove Unfollower feature ([see note](http://missinge.infraware.ca/faq#apiissues))  
**_-_** Remove Follow Checker feature ([see note](http://missinge.infraware.ca/faq#apiissues))  
**_!_** Remove max font size feature (now implemented rather heavy-handedly by Tumblr)  
**_!_** Remove all uses of Tumblr API (alternate implementations developed for ALL features except Timestamps)  
**_!_** Fix Safe Dash background alignment for photoset posts  
**_!_** Prevent j/k navigation when tagging ask posts  
**_!_** Prevent j/k navigation when using quick reblogging menu  
**_!_** Fix tag wrapping feature (broken by new Tumblr tags implementation)  
**_!_** Adapt tag reblogging feature to new Tumblr tag reblogging implementation (allow control)

##**1.7.6** (07/26/2011)

**_+_** Resizable rich text post editor boxes  
**_!_** Extend hide radar feature to cover Tumblr promos
