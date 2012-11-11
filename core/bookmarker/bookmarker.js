/*
 * 'Missing e' Extension
 *
 * Copyright 2012, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: license/GPL-LICENSE.txt
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

(function($){

MissingE.packages.bookmarker = {

   reverseLoading: false,

   serializeMarks: function(a) {
      var s = "";
      var i;
      a.reverse();
      for (i=0; i<a.length; i++) {
         s = a[i][0] + ";" + a[i][1] + ";" + a[i][2] + (i>0 ? "," : "") + s;
      }
      return s;
   },

   parseMarks: function(s) {
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
   },

   getMarkText: function(dt, post, name) {
      var pid = Number(post);
      var mark = $('<li />', {id: "mark_" + post}).attr("post", post);
      var url = "/dashboard/49/";
      if (this.reverseLoading) {
         url += "-" + (pid-1) + "#post_" + pid;
      }
      else {
         url += (pid+1);
      }
      mark.append($('<a />',
                    {href: url,
                     "class": "MissingE_bookmarker_marklink"})
                     .attr("post", post)
                     .append($('<div />', {"class": "hide_overflow"})
                              .append($('<span />',
                                        {"class": "mark_date",
                                         text: name}).attr("timestamp",dt))));
      mark.append($('<a />', {id: "unmark_" + post,
                              "class": "MissingE_unmarker", href: "#"}));
      return mark;
   },

   addBar: function(mark, lang, altPost) {
      var post;
      var markid = mark[1];
      var marktxt = mark[2];
      if (altPost) { post = $(altPost); }
      else { post = $('#post_' + mark[1]); }
      if ($('#bookmarkbar_' + mark[1]).length === 0) {
         var bar = $('<div />', {id: "bookmarkbar_" + markid,
                                 "class": "MissingE_bookmark_bar"});
         bar.append($('<div />', {"class": "MissingE_bookmark_line"}));
         var bartxt = $('<div />',
                        {"class": "MissingE_bookmark_text",
                         text: MissingE.getLocale(lang).bookmarkNoun + " - "});
         bartxt.append($('<em />', {id: "bookmarkbar_label_" + markid,
                                    text: marktxt}));
         if (altPost || post.hasClass("MissingE_dummy")) {
            var label = $('<span />', {"class": "MissingE_bookmark_missing " +
                                          "MissingE_bookmark_missing_" + lang,
                                       text: " ("});
            label.append($('<a />',
                           {target: "_blank",
                            href: "http://missing-e.com/faq#bookmark-issue",
                            text: MissingE.getLocale(lang).postUnavailable}));
            label.append(")");
            bartxt.append(label);
         }
         bar.append(bartxt);
         post.before(bar);
      }
      else {
         $('#bookmarkbar_' + markid).removeData('toremove');
         $('#bookmarkbar_label_' + markid).text(marktxt);
      }
   },

   generateList: function() {
      var i;
      var lang = $('html').attr('lang');
      var marks = MissingE.packages.bookmarker
         .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
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
         markitems.each(function() {
            if ($(this).data('gone') === 'gone') {
               return;
            }
            var post = $(this).attr('post').match(/\d*$/)[0];
            if (idx >= marks.length) {
               $('#bookmark_' + post)
                  .removeClass("MissingE_ismarked");
               $('#bookmarkbar_' + post).remove();
               $(this).remove();
            }
            else if (post === marks[idx][1]) {
               $('#bookmarkbar_label_' + post).text(marks[idx][2]);
               $(this).find('span.mark_date').text(marks[idx][2]);
               idx++;
            }
            else {
               $('#bookmark_' + post).removeClass('MissingE_ismarked');
               $('#bookmarkbar_' + post).data('toremove','remove');
               $('#bookmark_' + marks[idx][1]).addClass('MissingE_ismarked');
               $('#mark_' + marks[idx][1]).remove().data('gone','gone');
               $('#bookmarkbar_' + marks[idx][1]).data('toremove','remove');
               MissingE.packages.bookmarker.addBar(marks[idx], lang);
               $(this).before(MissingE.packages.bookmarker
                              .getMarkText(marks[idx][0], marks[idx][1],
                                           marks[idx][2]));
               $(this).remove();
               idx++;
            }
         });
         for(idx; idx<marks.length; idx++) {
            $("#bookmark_" + marks[idx][1]).addClass("MissingE_ismarked");
            MissingE.packages.bookmarker.addBar(marks[idx], lang);
            marklist.append(MissingE.packages.bookmarker
                            .getMarkText(marks[idx][0], marks[idx][1],
                                         marks[idx][2]));
         }
         $('#posts div.MissingE_bookmark_bar').each(function() {
            if ($(this).data('toremove') === 'remove') {
               $(this).remove();
            }
         });
      }
      else {
         for (i=0; i<marks.length; i++) {
            $("#bookmark_" + marks[i][1]).addClass("MissingE_ismarked");
            MissingE.packages.bookmarker.addBar(marks[i], lang);
            marklist.append(MissingE.packages.bookmarker
                            .getMarkText(marks[i][0], marks[i][1],
                                         marks[i][2]));
         }
      }
   },

   removeMark: function(post) {
      var marks = MissingE.packages.bookmarker
         .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
      var i;
      for (i=0; i<marks.length; i++) {
         if (marks[i][1] === post) {
            break;
         }
      }
      marks.splice(i,1);
      var allMarks = MissingE.packages.bookmarker.serializeMarks(marks);
      MissingE.setStorage("MissingE_bookmarker_marks", allMarks);
      extension.backupVal("MissingE_bookmarker_marks", allMarks);
      MissingE.packages.bookmarker.generateList();
   },

   addMark: function(post,user,custom) {
      var lang = $('html').attr('lang');
      var d = new Date();
      var ds = MissingE.getBookmarkerFormat(d, user, this.settings.format,
                                            lang);

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
            if (ans === null || ans === undefined ||
                (extension.isSafari && ans === "")) {
               return false;
            }
            ans = ans.replace(/^\s*/,'').replace(/\s*$/,'')
                     .replace(/[;,]/g,'.');
            ok = false;
         }
         ds = ans;
      }
      var marks = MissingE.packages.bookmarker
         .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
      marks.unshift([d.getTime(),post,ds]);
      var allMarks = MissingE.packages.bookmarker.serializeMarks(marks);
      MissingE.setStorage("MissingE_bookmarker_marks", allMarks);
      extension.backupVal("MissingE_bookmarker_marks", allMarks);
      MissingE.packages.bookmarker.generateList();
      return true;
   },

   markClick: function(e) {
      if (e.which === 1) {
         var post, pid, oldPos, scrollBy, moveWin, oldScroll;
         if ($(this).hasClass("MissingE_ismarked")) {
            post = $(this).closest('li.post');
            pid = this.id.match(/\d*$/)[0];
            try {
               oldScroll = $(window).scrollTop();
               moveWin = $('#bookmarkbar_' + pid).get(0).offsetTop -
                           oldScroll <= 34;
               oldPos = post.get(0).offsetTop;
            }
            catch (e) {
               moveWin = false;
            }
            $(this).removeClass("MissingE_ismarked");
            MissingE.packages.bookmarker.removeMark(this.id.match(/\d*$/)[0]);
            if (moveWin) {
               scrollBy = (post.get(0).offsetTop - $(window).scrollTop()) -
                          (oldPos - oldScroll);
               window.scrollBy(0, scrollBy);
            }
         }
         else {
            var user = '';
            post = $(this).closest('li.post');
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
            pid = this.id.match(/\d*$/)[0];
            oldPos = post.get(0).offsetTop;

            if (MissingE.packages.bookmarker.addMark(pid,user,e.shiftKey)) {
               try {
                  oldScroll = $(window).scrollTop();
                  moveWin = $('#bookmarkbar_' + pid).get(0).offsetTop -
                              oldScroll <= 34;
               }
               catch (e) {
                  moveWin = false;
               }
               if (moveWin) {
                  scrollBy = (post.get(0).offsetTop - $(window).scrollTop()) -
                             (oldPos - oldScroll);
                  window.scrollBy(0, scrollBy);
               }
            }
         }
         return false;
      }
   },

   doMarks: function(item) {
      if (item.tagName === 'LI' && $(item).hasClass('post')) {
         var lang = $('html').attr('lang');
         var post = $(item).attr('id').match(/\d*$/)[0];
         if (MissingE.isTumblrURL(location.href, ["tagged"]) &&
             ($('#user_menu_' + post + ' a[following]')
                   .attr('following') === 'false' ||
              $('#user_menu_' + post).length === 0)) {
            return false;
         }
         var ctrl = $(item).find('div.post_controls:not(.bookmarkAdded)');
         var j;
         var marks = MissingE.packages.bookmarker
            .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
         var heart = ctrl.find('a.like_button');
         var mag = ctrl.find('a.MissingE_magnify');
         var klass = 'post_control MissingE_mark';
         var from = this.dashboardPagePost ? this.dashboardPagePost : 0;
         for (j=0; j < marks.length; j++) {
            if (post === marks[j][1]) {
               klass += ' MissingE_ismarked';
               MissingE.packages.bookmarker.addBar(marks[j], lang);
               break;
            }
            var postVal = parseInt(post,10);
            var markVal = parseInt(marks[j][1],10);
            var prevPost = $(item).prevAll('li.post:not(#new_post)').first();
            if (MissingE.isTumblrURL(location.href, ["dashboardOnly"]) &&
                postVal < markVal &&
                ((prevPost.length === 1 &&
                  parseInt(prevPost.attr('id').match(/\d*$/)[0],10) > markVal) ||
                 from > markVal)) {
               MissingE.packages.bookmarker.addBar(marks[j], lang, item);
            }
         }
         var node = $('<a />', {"class": klass, id: "bookmark_" + post,
                                title: MissingE.getLocale(lang).bookmarkVerb,
                                href: "#", click: function(){ return false}});
         node.click(MissingE.packages.bookmarker.markClick);
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
   },

   handleEdit: function(type, evt) {
      var end = false;
      var par = $(evt.target).closest('li');
      if (type === 'keyup' && evt.keyCode === 27) { end = true; }
      else if ((type === 'keyup' && evt.keyCode === 13) ||
               type === 'focusout') {
         var post = par.attr("post").match(/(\d+)(\?lite|$)/)[1];
         end = true;
         var oldval = evt.target.getAttribute("value");
         var newval = evt.target.value;
         newval = newval.replace(/^\s*/,'').replace(/\s*$/,'')
                                             .replace(/[;,]/g,'.');
         if (newval !== oldval && newval !== "") {
            evt.target.value = newval;
            var marks = MissingE.packages.bookmarker
               .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
            var i;
            for (i=0; i<marks.length; i++) {
               if (marks[i][1] === post) { break; }
            }
            marks[i][2] = newval;
            var allMarks = MissingE.packages.bookmarker.serializeMarks(marks);
            MissingE.setStorage("MissingE_bookmarker_marks", allMarks);
            extension.backupVal("MissingE_bookmarker_marks", allMarks);
            par.find('span.mark_date').text(newval);
            $('#bookmarkbar_label_' + post).text(newval);
         }
      }
      if (end) {
         par.removeData('editmode').find('span.mark_date')
            .css('visibility','visible');
         par.find('.MissingE_unmarker')
              .removeClass('MissingE_bookmarker_forceHide');
         $(evt.target).remove();
         par.find('#MissingE_bookmark_confirmedit').remove();
      }
   },

   marklistClick: function(e) {
      if (/MissingE_unmarker/.test(e.target.className) && e.which === 1) {
         MissingE.packages.bookmarker.removeMark(e.target.id.match(/\d*$/)[0]);
         return false;
      }
   },

   refreshMarks: function() {
      var marks = MissingE.packages.bookmarker
         .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
      var i;
      $("#posts a.MissingE_ismarked").each(function(){
         var remove = true;
         var i;
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
      MissingE.packages.bookmarker.generateList();
   },

   doMove: function(f,t) {
      var marks = MissingE.packages.bookmarker
         .parseMarks(MissingE.getStorage("MissingE_bookmarker_marks",""));
      var item = marks.splice(f,1)[0];
      marks.splice(t,0,item);
      var allMarks = MissingE.packages.bookmarker.serializeMarks(marks);
      MissingE.setStorage("MissingE_bookmarker_marks", allMarks);
      extension.backupVal("MissingE_bookmarker_marks", allMarks);
   },

   run: function() {
      var settings = this.settings;

      if (/^#post_\d+$/.test(location.hash)) {
         if ($(location.hash).length === 0) {
            var dummyId = location.hash.replace(/^#/,'');
            var dummy = $('<li />', {id: dummyId,
                                     "class": "post MissingE_dummy"});
            dummy.css({'height':0,
                       'padding':0,
                       'margin':0});
            $('#posts').append(dummy);
         }
      }

      $('head').append('<style type="text/css">' +
         '#MissingE_marklist .MissingE_bookmarker_marklink, ' +
         '.MissingE_bookmark_text { background-image:url("' +
         extension.getURL("core/bookmarker/sidebar_bookmark.png") +
         '") !important; } ' +
         'a.MissingE_mark { background-image:url("' +
         extension.getURL("core/bookmarker/mark_control.png") + '"); } ' +
         '#right_column #MissingE_marklist .MissingE_unmarker { ' +
         'background-image:url("' +
         extension.getURL("core/bookmarker/unmarker.png") + '") !important; }');

      if (document.body.id !== "tinymce" &&
          document.body.id !== "dashboard_edit_post") {

         if (!MissingE.isTumblrURL(location.href,
                                   ["drafts", "queue", "messages"])) {
            if (settings.keyboardShortcut) {
               $(window).keydown(function(e) {
                  if (e.keyCode !== 77 ||
                      e.metaKey || e.shiftKey || e.altKey || e.ctrlKey ||
                      $(e.target).is('input,textarea')) {
                     return;
                  }
                  var currPos = $(window).scrollTop()+7;
                  $('#posts li.post').each(function() {
                     var postPos = this.offsetTop;
                     if (postPos === currPos) {
                        var mark = $(this).find('div.post_controls a.MissingE_mark');
                        if (mark.length === 0) { return false; }
                        mark = mark.get(0);
                        MissingE.packages.bookmarker.markClick
                           .apply(mark, [{which:1, shiftKey:false}]);
                        return false;
                     }
                     if (postPos >= currPos) {
                        return false;
                     }
                  });
               });
            }
            $("#posts li.post").each(function() {
               MissingE.packages.bookmarker.doMarks(this);
            });
            extension.addAjaxListener(function(type, list) {
               if (type === 'notes') { return; }
               $.each(list, function(i,val) {
                  MissingE.packages.bookmarker.doMarks($('#'+val).get(0));
               });
            });

            if (settings.addBar === 0) {
               $('head').append('<style type="text/css">' +
                                '#posts .MissingE_bookmark_bar { ' +
                                'display:none; }</style>');
            }
         }
         var lang = $('html').attr('lang');
         var list = $('<ul />', {id: "MissingE_marklist",
                                 "class": "controls_section"});
         var title = $('<li />', {"class": "MissingE_marklist_title recessed"});
         title.append($('<a />',
                        {href: "#", click: function(){ return false },
                         text: MissingE.getLocale(lang).bookmarksTitle}));
         list.append(title);

         $(function() {
            $('#MissingE_marklist').sortable({
               items: "li[post]",
               cursor:'move',
               axis:'y',
               opacity:0.6,
               revert:true,
               start:function(e,ui){
                  $(this).data('position',$('#MissingE_marklist li[post]')
                               .index(ui.item));
               },
               update:function(e,ui){
                  var oldp = $(this).data('position');
                  var newp = $('#MissingE_marklist li[post]').index(ui.item);
                  MissingE.packages.bookmarker.doMove(oldp,newp);
               }
            });
            $('#MissingE_marklist li').disableSelection();
         });
         var pos = $("#right_column #MissingE_tagslist");
         if (pos.length === 0) {
            pos = $("#right_column #tumblr_radar");
         }
         if (pos.length === 0) {
            pos = $("#right_column .radar");
         }
         if (pos.length === 0) {
            pos = $("#right_column .promo");
         }
         if (pos.length > 0) {
            pos.before(list);
         }
         else {
            $("#right_column").append(list);
         }
         list.click(MissingE.packages.bookmarker.marklistClick);
         MissingE.packages.bookmarker.generateList();

         window.addEventListener('storage',function(e) {
            if (e.key !== 'MissingE_bookmarker_marks') { return false; }
            else { MissingE.packages.bookmarker.refreshMarks(); }
         }, false);
      }
   },

   init: function() {
      if (MissingE.isTumblrURL(location.href, ["dashboardOnly"])) {
         var from = location.href.match(/http:\/\/www\.tumblr\.com\/dashboard\/\d+\/(\d+)/);
         if (from && from.length > 1) {
            this.dashboardPagePost = parseInt(from[1],10);
         }
         else {
            this.dashboardPagePost = 0;
         }
      }
      else {
         this.dashboardPagePost = 0;
      }
      $('#MissingE_marklist a.MissingE_bookmarker_marklink').live('click',
                                                                 function(e) {
         if ($(this).closest('li').data('editmode') === "EDIT") {
            e.preventDefault();
         }
         if (e.shiftKey) {
            $(this).closest('li').data('editmode','EDIT');
            var title = $(this).find('span.mark_date');
            var ds = title.text();
            var inp = $('<input />',
                        {type: "text", name: "MissingE_bookmarker_edit",
                         size: "10", val: ds, id: "MissingE_bookmarker_edit"});
            inp.blur(function(e) {
               MissingE.packages.bookmarker.handleEdit('focusout',e);
            }).keyup(function(e) {
               MissingE.packages.bookmarker.handleEdit('keyup',e);
            }).keydown(function(e) {
               if (e.which >= 65 || e.which <= 90 ||
                   e.which === 37 || e.which === 39) {
                  e.stopPropagation();
               }
            }).click(function(e) {
               e.stopPropagation();
            });
            title.closest('li').append(inp);
            var check = $('<a />', {id: "MissingE_bookmark_confirmedit",
                                    click: function() { return false },
                                    href: "#"});
            check.css('display', 'inline').html('&#10004;');
            check.insertAfter(this);
            check.click(function() { inp.get(0).blur(); });
            inp.get(0).focus();
            title.css('visibility','hidden');
            $(this).siblings('.MissingE_unmarker')
                     .addClass('MissingE_bookmarker_forceHide');
            return false;
         }
         else {
            var bar = $('#bookmarkbar_' + $(this).attr('post'));
            if (MissingE.isTumblrURL(location.href, ["dashboardOnly"]) &&
                bar.length > 0) {
               $(window).scrollTop(bar.get(0).offsetTop-10);
               return false;
            }
         }
      });

      extension.sendRequest("settings", {component: "bookmarker"},
                            function(response) {
         if (response.component === "bookmarker") {
            var i;
            MissingE.packages.bookmarker.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.bookmarker.settings[i] = response[i];
               }
            }
            var allMarks = MissingE.getStorage("MissingE_bookmarker_marks","");
            if (allMarks === "" && response.hasOwnProperty("backupMarks") &&
                response.backupMarks !== "") {
               MissingE.setStorage("MissingE_bookmarker_marks",
                                   response.backupMarks);
            }
            else {
               extension.backupVal("MissingE_bookmarker_marks", allMarks);
            }
            MissingE.packages.bookmarker.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.bookmarker.init();
}

}(jQuery));
