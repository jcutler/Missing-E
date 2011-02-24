// ==UserScript==
// @name           Tumblr - Photo Replies Always
// @description    Always set the "Let people photo reply" checkbox when making a new post
// @namespace      http://userscripts.org/users/113977
// @include        http://www.tumblr.com/*new/*
// @version        0.3.0
// @date           2010-11-26
// @creator        Jeremy Cutler
// ==/UserScript==

var apr = document.getElementById("allow_photo_replies");

if (apr != null) apr.checked = true;