/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Missing e' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Missing e'. If not, see <http://www.gnu.org/licenses/>.
 */

/*global window, $, chrome, getStorage, setStorage, getFormattedDate */

var bmi = chrome.extension.getURL('bookmarker/sidebar_bookmark.png');
var mimg = chrome.extension.getURL('bookmarker/post_bookmark.png');

var bookmarkText = {
                   en: "bookmark",
                   de: "lesezeichen",
                   fr: "marquer",
                   it: "segnalibro"
};

var st = document.createElement('style');
st.setAttribute('type','text/css');
st.innerHTML = '#right_column .dashboard_nav_item ul.dashboard_subpages ' +
               'li a .icon.dashboard_controls_bookmark { ' +
               'background-image:url("' + bmi + '") !important; } ' +
               '#s113977_marklist a:active { color:#C4CDD6 !important; } ' +
               'a.s113977_mark { background-image:url("' + mimg + '"); }';
document.getElementsByTagName('head')[0].appendChild(st);

function serializeMarks(a) {
   var s = "";
   var i;
   a.sort().reverse();
   for (i=0; i<a.length; i++) {
      s = a[i][0] + ";" + a[i][1] + ";" + a[i][2] + (i>0 ? "," : "") + s;
   }
   return s;
}

function parseMarks(s) {
   var arr = [];
   var i;
   var ms = s.split(",");
   for (i=0; i<ms.length; i++) {
      var cm = ms[i].split(";");
      if (cm.length === 3) {
         arr.push([cm[0],cm[1],cm[2]]);
      }
   }
   arr.sort().reverse();
   return arr;
}

function getMarkText(dt, post, name) {
   var pid = Number(post)+1;
   return '<li id="mark_' + post + '">' +
            '<a class="MissingE_bookmarker_marklink" href="/dashboard/1000/' +
            pid + '?lite" post="' + post + '">' +
            '<span class="icon dashboard_controls_bookmark"></span>' +
            '<span class="mark_date" timestamp="' + dt + '">' + name +
            '</span></a> <a id="unmark_' + post +
            '" class="s113977_unmarker tracked_tag_control" ' +
            'onclick="return false;" href="#">x</a></li>';
}

function generateList() {
   var i;
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var marklist = $('#s113977_marklist');
   if (marks.length === 0) {
      $('#posts a.s113977_ismarked').removeClass("s113977_ismarked");
      marklist.empty().parent().hide();
      return true;
   }
   marklist.parent().show();
   var markitems = marklist.find('li');
   if (markitems.length > 0) {
      var idx = 0;
      markitems.each(function(i) {
         var cd = $(this).find('span.mark_date').attr("timestamp");

         if (idx >= marks.length ||
             cd > marks[idx][0]) {
            $("#bookmark_" + this.id.match(/[0-9]*$/)[0])
                                       .removeClass("s113977_ismarked");
            $(this).remove();
         }
         else if (cd < marks[idx][0]) {
            while (idx < marks.length && cd <= marks[idx][0]) {
               $("#bookmark_" + marks[idx][1]).addClass("s113977_ismarked");
               if (cd !== marks[idx][0]) {
                  $(this).before(getMarkText(marks[idx][0], marks[idx][1],
                                             marks[idx][2]));
               }
               else {
                  $(this).find('span.mark_date').text(marks[idx][2]);
               }
               idx++;
            }
         }
         else {
            $("#bookmark_" + marks[idx][1]).addClass("s113977_ismarked");
            $(this).find('span.mark_date').text(marks[idx][2]);
            idx++;
         }
      });
      for(; idx<marks.length; idx++) {
         $("#bookmark_" + marks[idx][1]).addClass("s113977_ismarked");
         marklist.append(getMarkText(marks[idx][0], marks[idx][1],
                                     marks[idx][2]));
      }
   }
   else {
      for (i=0; i<marks.length; i++) {
         $("#bookmark_" + marks[i][1]).addClass("s113977_ismarked");
         marklist.append(getMarkText(marks[i][0], marks[i][1],
                                     marks[i][2]));
      }
   }
}

function removeMark(post) {
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var i;
   for (i=0; i<marks.length; i++) {
      if (marks[i][1] === post) {
         break;
      }
   }
   marks.splice(i,1);
   setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
   generateList();
}

function addMark(post,custom) {
   var d = new Date();
   var ds = getFormattedDate(d, "%Y-%m-%D %H:%i:%s");

   if (custom) {
      var ans = "";
      var ok = true;
      while (ans === "") {
         if (ok) {
            ans = prompt("Enter a bookmark name:",ds);
         }
         else {
            ans = prompt("Enter a bookmark name (cannot be empty):",ds);
         }
         if (ans === null || ans === undefined) { return false; }
         ans = ans.replace(/^\s*/,'').replace(/\s*$/,'').replace(/[;,]/g,'.');
         ok = false;
      }
      ds = ans;
   }
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   marks.push([d.getTime(),post,ds]);
   setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
   generateList();
}

function markClick(e) {
   if (e.which === 1) {
      if ($(this).hasClass("s113977_ismarked")) {
         $(this).removeClass("s113977_ismarked");
         removeMark(this.id.match(/[0-9]*$/)[0]);
      }
      else {
         addMark(this.id.match(/[0-9]*$/)[0],e.shiftKey);
      }
      return false;
   }
}

function doMarks(item) {
   if (item.tagName === 'LI' && $(item).hasClass('post')) {
      var lang = $('html').attr('lang');
      $(item).find('div.post_controls:not(.bookmarkAdded)').each(function(i){
         var j;
         var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
         var heart = $(this).find('a.like_button');
         var mag = $(this).find('a.s113977_magnify');
         var mom = $(this).parent();
         var post = mom.attr('id').match(/[0-9]*$/)[0];
         var klass = 's113977_mark';
         for (j=0; j < marks.length; j++) {
            if (post === marks[j][1]) {
               klass += ' s113977_ismarked';
               break;
            }
         }
         var node = $('<a class="' + klass + '" id="bookmark_' + post +
                      '" title="' + bookmarkText[lang] + '" ' +
                      'href="#" onclick="return false;"></a>');
         node.click(markClick);
         $(this).addClass('bookmarkAdded');
         if (mag.length > 0) {
            mag.after(node);
         }
         else if (heart.length > 0) {
            heart.before(node);
         }
         else {
            $(this).append(node);
         }
      });
   }
}

function handleEdit(type, evt) {
   var end = false;
   var par = $(evt.target).parent();
   if (type === 'keyup' && evt.keyCode === 27) { end = true; }
   else if ((type === 'keyup' && evt.keyCode === 13) ||
            type === 'focusout') {
      var post = par.attr("post").match(/([0-9]+)(\?lite|$)/)[1];
      end = true;
      var oldval = evt.target.getAttribute("value");
      var newval = evt.target.value;
      newval = newval.replace(/^\s*/,'').replace(/\s*$/,'')
                                          .replace(/[;,]/g,'.');
      if (newval !== oldval && newval !== "") {
         evt.target.value = newval;
         var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
         var i;
         for (i=0; i<marks.length; i++) {
            if (marks[i][1] === post) { break; }
         }
         marks[i][2] = newval;
         setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
         par.find('span.mark_date').html(newval);
      }
   }
   if (end) {
      par.removeData('editmode').find('span.mark_date').show();
      par.siblings('.s113977_unmarker')
           .removeClass('MissingE_bookmarker_forceHide');
      $(evt.target).remove();
      par.siblings('#s113977_bookmark_confirmedit').remove();
   }
}

$('#s113977_marklist a.MissingE_bookmarker_marklink').live('click',
                                                           function(e) {
   if ($(this).data('editmode') === "EDIT") { return false; }
   if (e.shiftKey) {
      $(this).data('editmode','EDIT');
      var title = $(this).find('span.mark_date');
      var ds = title.text();
      var inp = $('<input name="MissingE_bookmarker_edit" type="text" ' +
                  'size="10" value="' + ds +
                  '" id="MissingE_bookmarker_edit">');
      inp.focusout(function(e) { handleEdit('focusout',e);})
            .keyup(function(e) { handleEdit('keyup',e); });
      title.after(inp);
      $(this).after('<a id="s113977_bookmark_confirmedit" ' +
                    'class="tracked_tag_control" onclick="return false;" ' +
                    'style="display:inline;" href="#">&#10004;</a>');
      inp.get(0).focus();
      title.hide();
      $(this).siblings('.s113977_unmarker')
               .addClass('MissingE_bookmarker_forceHide');
   return false;
   }
});

function marklistClick(e) {
   if (/s113977_unmarker/.test(e.target.className) && e.which === 1) {
      removeMark(e.target.id.match(/[0-9]*$/)[0]);
      return false;
   }
}

if (document.body.id !== "tinymce" &&
    document.body.id !== "dashboard_edit_post") {
   if (!(/drafts$/.test(location.href)) &&
       !(/queue$/.test(location.href)) &&
       !(/messages$/.test(location.href)) &&
       !(/submissions[^\/]*$/.test(location.href)) &&
       !(/drafts\/after\/[^\/]*$/.test(location.href)) &&
       !(/queue\/after\/[^\/]*$/.test(location.href))) {
      $("#posts li.post").each(function(i) {
         doMarks(this);
      });
   }

   var list = $('<div class="dashboard_nav_item" ' +
                'style="padding-left:0;position:relative;">' +
                '<div class="dashboard_nav_title">Bookmarks</div>' +
                '<ul id="s113977_marklist" class="dashboard_subpages"></ul>' +
                '</div>');

   var pos = $("#dashboard_controls_radar_buttons");
   if (pos.length > 0) {
      pos.parent().before(list);
   }
   else {
      $("#right_column").append(list);
   }
   list.click(marklistClick);
   generateList();
}

function refreshMarks() {
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var i;
   $("#posts a.s113977_ismarked").each(function(){
      var remove = true;
      var i;
      for (i=0; i<marks.length; i++) {
         if (this.id === "bookmark_" + marks[i][1]) {
            remove = false;
            break;
         }
      }
      if (remove) { $(this).removeClass("s113977_ismarked"); }
   });
   for (i=0; i<marks.length; i++) {
      $("#bookmark_" + marks[i][1]).addClass("s113977_ismarked");
   }
   generateList();
}

if (document.body.id !== "tinymce" &&
    document.body.id !== "dashboard_edit_post") {
   if (!(/drafts$/.test(location.href)) &&
       !(/queue$/.test(location.href)) &&
       !(/messages$/.test(location.href)) &&
       !(/submissions[^\/]*$/.test(location.href)) &&
       !(/drafts\/after\/[^\/]*$/.test(location.href)) &&
       !(/queue\/after\/[^\/]*$/.test(location.href))) {
      document.addEventListener('DOMNodeInserted', function(e) {
         doMarks(e.target);
      }, false);
   }
   window.addEventListener('storage',function(e) {
      if (e.key !== 'MissingE_bookmarker_marks') { return false; }
      else { refreshMarks(); }
   }, false);
}
