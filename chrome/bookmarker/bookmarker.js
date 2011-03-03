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
 * along with 'Missing e'.  If not, see <http://www.gnu.org/licenses/>.
 */

var bmi = chrome.extension.getURL('bookmarker/sidebar_bookmark.png');
var mimg = chrome.extension.getURL('bookmarker/post_bookmark.png');

var st = document.createElement('style');
st.setAttribute('type','text/css');
st.innerHTML = '#right_column .dashboard_nav_item ul.dashboard_subpages li a .icon.dashboard_controls_bookmark { background-image:url("' + bmi + '") !important; } #s113977_marklist a:active { color:#C4CDD6 !important; } a.s113977_mark { background-image:url("' + mimg + '"); }';
document.getElementsByTagName('head')[0].appendChild(st);

function serializeMarks(a) {
   var s = "";
   a.sort().reverse();
   for (i=0; i<a.length; i++) {
      s = a[i][0] + ";" + a[i][1] + ";" + a[i][2] + (i>0 ? "," : "") + s;
   }
   return s;
}

function parseMarks(s) {
   var arr = new Array();
   var ms = s.split(",");
   for (i=0; i<ms.length; i++) {
      var cm = ms[i].split(";");
      if (cm.length == 3) {
         arr.push([cm[0],cm[1],cm[2]]);
      }
   }
   arr.sort().reverse();
   return arr;
}

function markClick(e) {
   if (e.which == 1) {
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

function addMark(post,custom) {
   var d = new Date();
   var ds = d.getFullYear()+"-"+(d.getMonth()+1<10?"0":"")+(d.getMonth()+1)+"-"+(d.getDate()<10?"0":"")+d.getDate()+" "+(d.getHours()<10?"0":"")+d.getHours()+":"+(d.getMinutes()<10?"0":"")+d.getMinutes()+":"+(d.getSeconds()<10?"0":"")+d.getSeconds();
   
   if (custom) {
      var ans = "";
      var ok = true;
      while (ans == "") {
         if (ok)
            ans = prompt("Enter a bookmark name:\n\nUse only alphanumeric characters and spaces.",ds);
         else
            ans = prompt("Enter a bookmark name (cannot be empty):\n\nUse only alphanumeric characters and spaces.",ds);
         if (ans == null || ans == undefined) return false;
         ans = ans.replace(/[^a-zA-Z0-9\s]/g,'').replace(/^\s*/,'').replace(/\s*$/,'');
         ok = false;
      }
      ds = ans;
   }
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   marks.push([d.getTime(),post,ds]);
   setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
   generateList();
}

function removeMark(post) {
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   for (i=0; i<marks.length; i++) {
      if (marks[i][1] == post) {
         break;
      }
   }
   marks.splice(i,1);
   setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
   generateList();
}

function doMarks(item) {
   if (item.tagName == 'LI' && $(item).hasClass('post')) {
      $(item).find('div.post_controls:not(.bookmarkAdded)').each(function(i){
         var heart = $(this).find('a.like_button').remove();
         var mom = $(this).parent();
         var post = mom.attr('id').match(/[0-9]*$/)[0];
         var node = $('<a class="s113977_mark" id="bookmark_' + post + '" title="Bookmark" href="#" onclick="return false;"></a>');
         node.appendTo(this).click(markClick);
         $(this).addClass('bookmarkAdded').append(heart); 
      });
   }
}

function getMarkText(dt, post, name) {
   var pid = Number(post)+1;
   return '<li id="mark_' + post + '"><a class="MissingE_bookmarker_marklink" href="/dashboard/1000/' + pid + '?lite" post="' + post + '"><span class="icon dashboard_controls_bookmark"></span><span class="mark_date" timestamp="' + dt + '">' + name + '</span></a> <a id="unmark_' + post + '" class="s113977_unmarker tracked_tag_control" onclick="return false;" href="#">x</a></li>';
}

function handleEdit(type, evt) {
   var end = false;
   var par = $(evt.target).parent();
   if (type == 'keyup' && evt.keyCode == 27) end = true;
   else if ((type == 'keyup' && evt.keyCode == 13) ||
            type == 'focusout') {
      var post = par.attr("post").match(/([0-9]+)(\?lite|$)/)[1];
      end = true;
      var oldval = evt.target.getAttribute("value");
      var newval = evt.target.value;
      newval = newval.replace(/^\s*/,'').replace(/\s*$/,'').replace(/[;,]/g,'.');
      if (newval != oldval && newval != "") {
         evt.target.value = newval;
         var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
         var i;
         for (i=0; i<marks.length; i++) {
            if (marks[i][1] == post)
               break;
         }
         marks[i][2] = newval;
         setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
         par.find('span.mark_date').html(newval);
      }
   }
   if (end) {
      par.removeData('editmode').find('span.mark_date').show();
      par.siblings('.s113977_unmarker').removeClass('MissingE_bookmarker_forceHide');
      $(evt.target).remove();
   }
}

$('#s113977_marklist a.MissingE_bookmarker_marklink').live('click',function(e) {
   if ($(this).data('editmode') == "EDIT") return false;
   if (e.shiftKey) {
      $(this).data('editmode','EDIT');
      var title = $(this).find('span.mark_date');
      var ds = title.text();
      var inp = $('<input name="MissingE_bookmarker_edit" type="text" size="10" value="' + ds + '" id="MissingE_bookmarker_edit">');
      inp.focusout(function(e) { handleEdit('focusout',e);})
            .keyup(function(e) { handleEdit('keyup',e); });
      title.after(inp);
      inp.get(0).focus();
      title.hide();
      $(this).siblings('.s113977_unmarker').addClass('MissingE_bookmarker_forceHide');
   return false;
   }
     /* 
      ds = ans;
      var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
      var i;
      for (i=0; i<marks.length; i++) {
         if (marks[i][1] == post)
            break;
      }
      marks[i][2] = ds;
      setStorage("MissingE_bookmarker_marks",serializeMarks(marks));

      $(this).parent().remove();
      generateList();
      return false;
      title.after(inp);
   }
   */
});

function marklistClick(e) {
   if (/s113977_unmarker/.test(e.target.className) && e.which == 1) {
      removeMark(e.target.id.match(/[0-9]*$/)[0]);
      return false;
   }
}

function generateList() {
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var marklist = $('#s113977_marklist');
   if (marks.length == 0) {
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
            $("#bookmark_" + this.id.match(/[0-9]*$/)[0]).removeClass("s113977_ismarked");
            $(this).remove();
         }
         else if (cd < marks[idx][0]) {
            while (idx < marks.length && cd <= marks[idx][0]) {
               $("#bookmark_" + marks[idx][1]).addClass("s113977_ismarked");
               if (cd != marks[idx][0]) {
                  $(this).before(getMarkText(marks[idx][0],marks[idx][1],marks[idx][2]));
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
         marklist.append(getMarkText(marks[idx][0],marks[idx][1],marks[idx][2]));
      }
   }
   else {
      for (i=0; i<marks.length; i++) {
         $("#bookmark_" + marks[i][1]).addClass("s113977_ismarked");
         marklist.append(getMarkText(marks[i][0],marks[i][1],marks[i][2]));
      }
   }
}

if (document.body.id != "tinymce" &&
    document.body.id != "dashboard_edit_post") {
   if (/drafts$/.test(location) == false &&
       /queue$/.test(location) == false &&
       /messages$/.test(location) == false)
      $("#posts li.post").each(function(i) {
         doMarks(this);
      });

   var list = $('<div class="dashboard_nav_item" style="padding-left:0;position:relative;"><div class="dashboard_nav_title">Bookmarks</div><ul id="s113977_marklist" class="dashboard_subpages"></ul></div>');

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
   $("#posts a.s113977_ismarked").each(function(){
      var remove = true;
      for (i=0; i<marks.length; i++) {
         if (this.id == "bookmark_" + marks[i][1]) {
            remove = false;
            break;
         }
      }
      if (remove) $(this).removeClass("s113977_ismarked");
   });
   for (i=0; i<marks.length; i++) {
      $("#bookmark_" + marks[i][1]).addClass("s113977_ismarked");
   }
   generateList();
}

if (document.body.id != "tinymce" &&
    document.body.id != "dashboard_edit_post") {
   if (/drafts$/.test(location) == false &&
       /queue$/.test(location) == false &&
       /messages$/.test(location) == false) {
      document.addEventListener('DOMNodeInserted', function(e) {
         doMarks(e.target);
      }, false);
   }
   window.addEventListener('storage',function(e) {
      if (e.key != 'MissingE_bookmarker_marks') return false;
      else
         refreshMarks();
   }, false);
}
