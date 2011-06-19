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

/*global window, $, safari, getStorage, setStorage, getFormattedDate */

var bmi = safari.extension.baseURI + 'bookmarker/sidebar_bookmark.png';
var mimg = safari.extension.baseURI + 'bookmarker/post_bookmark.png';

var markFormat;

function serializeMarks(a) {
   var s = "";
   var i;
   a.reverse();
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
   return arr;
}

function getMarkText(dt, post, name) {
   var pid = Number(post)+1;
   return '<li post="' + post + '" id="mark_' + post + '">' +
            '<a href="/dashboard/1000/' + pid +
            '?lite" post="' + post + '" class="MissingE_bookmarker_marklink">' +
            '<div class="hide_overflow"><span class="mark_date" timestamp="' +
            dt + '">' + name + '</span></div></a>' +
            '<a id="unmark_' + post + '" class="MissingE_unmarker" ' +
            'onclick="return false;" href="#">x</a></li>';
}

function addBar(mark, lang) {
   if ($('#bookmarkbar_' + mark[1]).length === 0) {
      $('#post_' + mark[1]).before('<div id="bookmarkbar_' + mark[1] + '" ' +
            'class="MissingE_bookmark_bar"><div ' +
            'class="MissingE_bookmark_line"></div><div ' +
            'class="MissingE_bookmark_text">' +
            locale[lang]["bookmarkNoun"] + ' - <em id="bookmarkbar_label_' +
            mark[1] + '">' + mark[2] + '</em></div></div>');
   }
}

function generateList() {
   var i;
   var lang = $('html').attr('lang');
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var marklist = $('#MissingE_marklist');
   if (marks.length === 0) {
      $('#posts a.MissingE_ismarked').removeClass("MissingE_ismarked");
      $('#posts div.MissingE_bookmark_bar').remove();
      marklist.hide();
      marklist.find('li[post]').remove();
      return true;
   }
   marklist.show();
   var markitems = marklist.find('li[post]');
   if (markitems.length > 0) {
      var idx = 0;
      markitems.each(function(i) {
         if ($(this).data('gone') == 'gone') {
            return;
         }
         var cd = $(this).find('span.mark_date').attr("timestamp");
         var post = $(this).attr('post').match(/[0-9]*$/)[0];
         if (idx >= marks.length) {
            $('#bookmark_' + post)
               .removeClass("MissingE_ismarked");
            $('#bookmarkbar_' + post).remove();
            $(this).remove();
         }
         else if (post == marks[idx][1]) {
            $('#bookmarkbar_label_' + post).text(marks[idx][2]);
            $(this).find('span.mark_date').text(marks[idx][2]);
            idx++;
         }
         else {
            $('#bookmark_' + post).removeClass('MissingE_ismarked');
            $('#bookmarkbar_' + post).remove();
            $('#bookmark_' + marks[idx][1]).addClass('MissingE_ismarked');
            $('#mark_' + marks[idx][1]).remove().data('gone','gone');
            $('#bookmarkbar_' + marks[idx][1]).remove();
            addBar(marks[idx], lang);
            $(this).before(getMarkText(marks[idx][0], marks[idx][1],
                                       marks[idx][2]));
            $(this).remove();
            idx++;
         }
      });
      for(; idx<marks.length; idx++) {
         $("#bookmark_" + marks[idx][1]).addClass("MissingE_ismarked");
         addBar(marks[idx], lang);
         marklist.append(getMarkText(marks[idx][0], marks[idx][1],
                                     marks[idx][2]));
      }
   }
   else {
      for (i=0; i<marks.length; i++) {
         $("#bookmark_" + marks[i][1]).addClass("MissingE_ismarked");
         addBar(marks[i], lang);
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

function addMark(post,user,custom) {
   var d = new Date();
   var ds = getBookmarkerFormat(d, user, markFormat);

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
   marks.unshift([d.getTime(),post,ds]);
   setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
   generateList();
   return true;
}

function markClick(e) {
   if (e.which === 1) {
      if ($(this).hasClass("MissingE_ismarked")) {
         var post = $(this).closest('li.post');
         var pid = this.id.match(/[0-9]*$/)[0];
         var moveWin = $('#bookmarkbar_' + pid).offset().top -
                        $(window).scrollTop() <= 34;
         var oldPos = post.offset().top;
         $(this).removeClass("MissingE_ismarked");
         removeMark(this.id.match(/[0-9]*$/)[0]);
         if (moveWin) {
            var scrollTo = $(window).scrollTop() + post.offset().top -
                           oldPos;
            $(window).scrollTop(scrollTo);
         }
      }
      else {
         var user = '';
         var post = $(this).closest('li.post');
         if (post.hasClass('is_mine')) {
            user = 'you';
         }
         else if (post.length !== 0) {
            while (post.length !== 0 && post.hasClass('same_user_as_last')) {
               post = post.prev();
               while (post.length !== 0 && !post.is('li.post')) {
                  post = post.prev();
               }
            }
            if (post.length !== 0) {
               var name = post.find('div.user_menu_list a[following]');
               if (name.length !== 0) {
                  user = name.attr('href').replace(/^\/?[^\/]*\//,'');
               }
            }
         }
         var pid = this.id.match(/[0-9]*$/)[0];
         var oldPos = post.offset().top;
         if (addMark(pid,user,e.shiftKey)) {
            if ($('#bookmarkbar_' + pid).offset().top -
                  $(window).scrollTop() <= 34) {
               var scrollTo = $(window).scrollTop() + post.offset().top -
                              oldPos;
               $(window).scrollTop(scrollTo);
            }
         }
      }
      return false;
   }
}

function doMarks(item) {
   if (item.tagName === 'LI' && $(item).hasClass('post')) {
      var lang = $('html').attr('lang');
      var post = $(item).attr('id').match(/[0-9]*$/)[0];
      if (/http:\/\/www\.tumblr\.com\/tagged\//.test(location.href) &&
          $('#user_menu_' + post + ' a[following]')
               .attr('following') === 'false') {
         return false;
      }
      var lang = $('html').attr('lang');
      var ctrl = $(item).find('div.post_controls:not(.bookmarkAdded)');
      var j;
      var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
      var heart = ctrl.find('a.like_button');
      var mag = ctrl.find('a.MissingE_magnify');
      var klass = 'MissingE_mark';
      for (j=0; j < marks.length; j++) {
         if (post === marks[j][1]) {
            klass += ' MissingE_ismarked';
            addBar(marks[j], lang);
            break;
         }
      }
      var node = $('<a class="' + klass + '" id="bookmark_' + post +
                   '" title="' + locale[lang]["bookmarkVerb"] + '" ' +
                   'href="#" onclick="return false;"></a>');
      node.click(markClick);
      ctrl.addClass('bookmarkAdded');
      if (mag.length > 0) {
         mag.after(node);
      }
      else if (heart.length > 0) {
         heart.before(node);
      }
      else {
         ctrl.append(node);
      }
   }
}

function handleEdit(type, evt) {
   var end = false;
   var par = $(evt.target).closest('li');
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
         $('#bookmarkbar_label_' + post).text(newval);
      }
   }
   if (end) {
      par.removeData('editmode').find('span.mark_date').show();
      par.find('.MissingE_unmarker')
           .removeClass('MissingE_bookmarker_forceHide');
      $(evt.target).remove();
      par.find('#MissingE_bookmark_confirmedit').remove();
   }
}

$('#MissingE_marklist a.MissingE_bookmarker_marklink').live('click',
                                                           function(e) {
   if ($(this).closest('li').data('editmode') === "EDIT") { return false; }
   if (e.shiftKey) {
      $(this).closest('li').data('editmode','EDIT');
      var title = $(this).find('span.mark_date');
      var ds = title.text();
      var inp = $('<input name="MissingE_bookmarker_edit" type="text" ' +
                  'size="10" value="' + ds +
                  '" id="MissingE_bookmarker_edit">');
      inp.focusout(function(e) { handleEdit('focusout',e);})
            .keyup(function(e) { handleEdit('keyup',e); });
      title.after(inp);
      var check = $('<a id="MissingE_bookmark_confirmedit" ' +
                    'onclick="return false;" style="display:inline;" ' +
                    'href="#"></a>').html('&#10004;').insertAfter(this);
      check.click(function(e) { inp.get(0).blur(); });
      inp.get(0).focus();
      title.hide();
      $(this).siblings('.MissingE_unmarker')
               .addClass('MissingE_bookmarker_forceHide');
      return false;
   }
});

function marklistClick(e) {
   if (/MissingE_unmarker/.test(e.target.className) && e.which === 1) {
      removeMark(e.target.id.match(/[0-9]*$/)[0]);
      return false;
   }
}

function refreshMarks() {
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var i;
   $("#posts a.MissingE_ismarked").each(function(){
      var remove = true;
      for (i=0; i<marks.length; i++) {
         if (this.id === "bookmark_" + marks[i][1]) {
            remove = false;
            break;
         }
      }
      if (remove) { $(this).removeClass("MissingE_ismarked"); }
   });
   for (i=0; i<marks.length; i++) {
      $("#bookmark_" + marks[i][1]).addClass("MissingE_ismarked");
   }
   generateList();
}

function doMove(f,t) {
   var marks = parseMarks(getStorage("MissingE_bookmarker_marks",""));
   var item = marks.splice(f,1)[0];
   marks.splice(t,0,item);
   setStorage("MissingE_bookmarker_marks",serializeMarks(marks));
}

function MissingE_bookmarker_doStartup(format) {
   markFormat = format;
   var st = document.createElement('style');
   st.setAttribute('type','text/css');
   st.innerHTML = '#MissingE_marklist .MissingE_bookmarker_marklink, ' +
                  '.MissingE_bookmark_text { ' +
                  'background-image:url("' + bmi + '") !important; } ' +
                  'a.MissingE_mark { background-image:url("' + mimg + '"); }';
   document.getElementsByTagName('head')[0].appendChild(st);

   if (document.body.id !== "tinymce" &&
       document.body.id !== "dashboard_edit_post") {
      if (!(/drafts$/.test(location.href)) &&
          !(/queue$/.test(location.href)) &&
          !(/messages$/.test(location.href)) &&
          !(/inbox$/.test(location.href)) &&
          !(/submissions[^\/]*$/.test(location.href)) &&
          !(/drafts\/after\/[^\/]*$/.test(location.href)) &&
          !(/queue\/after\/[^\/]*$/.test(location.href))) {
         $("#posts li.post").each(function(i) {
            doMarks(this);
         });
         document.addEventListener('DOMNodeInserted', function(e) {
            doMarks(e.target);
         }, false);

         if (addBar === 0) {
            $('head').append('<style type="text/css">' +
                             '#posts .MissingE_bookmark_bar { ' +
                             'display:none; }</style>');
         }
      }
      var lang = $('html').attr('lang');
      var list = $('<ul id="MissingE_marklist" ' +
                   'class="right_column_section">' +
                   '<li class="MissingE_marklist_title recessed">' +
                   '<a href="#" onclick="return false;">' +
                   locale[lang]["bookmarksTitle"] + '</a></li></ul>');

      var pos = $("#right_column .radar");
      if (pos.length === 0) {
         pos = $("#right_column .promo");
      }
      if (pos.length > 0) {
         pos.before(list);
      }
      else {
         $("#right_column").append(list);
      }
      list.click(marklistClick);
      generateList();

      $(function() {
         $('#MissingE_marklist').sortable({
            items:"li[post]",
            cursor:'move',
            axis:'y',
            opacity:0.6,
            revert:true,
            start:function(e,ui){
               $(this).data('position',$('#MissingE_marklist li[post]').index(ui.item));
            },
            update:function(e,ui){
               var oldp = $(this).data('position');
               var newp = $('#MissingE_marklist li[post]').index(ui.item);
               doMove(oldp,newp);
            }
         });
         $('#MissingE_marklist li').disableSelection();
      });

      window.addEventListener('storage',function(e) {
         if (e.key !== 'MissingE_bookmarker_marks') { return false; }
         else { refreshMarks(); }
      }, false);
   }
}
