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

 /*global extension, jQuery, MissingE */

 (function($){

   MissingE.packages.betterReblogs = {

      hasFacebook: {},
      hasTwitter: {},
      facebookChecked: {},
      twitterChecked: {},

      showingReblogMenu: function() {
         return $('#MissingE_quick_reblog:visible').length > 0;
      },

      addAskReblog: function(item) {
         if (item.tagName === "LI" && $(item).hasClass('post') &&
           $(item).hasClass('note')) {
            $(item).find('div.post_controls a.MissingE_betterReblogs_retryAsk')
         .remove();
         if ($(item).find('div.post_controls a[href^="/reblog"]').length > 0 ||
           $(item).find('div.post_controls a.MissingE_reblog_control')
           .length > 0) {
            return true;
      }
      var tid = $(item).attr("id").match(/\d*$/)[0];
      var perm = $(item).find("a.permalink:first");
      if (perm.length === 0) {
         return;
      }

      extension.sendRequest("betterReblogs",
        {pid: tid, url: perm.attr("href")},
        this.receiveAskReblog);
   }
},

receiveAskReblog: function(response) {
   var item = $('#post_' + response.pid);
   if (item.find('div.post_controls a[href^="/reblog"]').length > 0) {
      return;
   }
   var perm = item.find("a.permalink:first");
   var tid = response.pid;
   var klass, before, rblnk, txt,i;

   var lang = $('html').attr('lang');
   var question = "";
   var asker = $(item).find(".post_question_asker").text();
   for (i=0; i<MissingE.getLocale(lang).asked.length; i++) {
      if (i>0) {
         question += " ";
      }
      if (MissingE.getLocale(lang).asked[i] === "U") {
         question += asker;
      }
      else {
         question += MissingE.escapeHTML(MissingE.getLocale(lang).asked[i]);
      }
   }
   question += ": " + $(item).find("div.post_question").text()
   .replace(/\s+/g,' ').replace(/^\s/,'')
   .replace(/\s$/,'');
   question = encodeURIComponent(question);

   var reblog_text = MissingE.getLocale(lang).reblog;
   before = $('#post_control_reply_' + tid);
   if (before.length === 0) {
      before = $('#show_notes_link_' + tid);
   }
   if (response.success) {
      rblnk = $('<a />',
        {title: reblog_text,
          "class": "reblog_button",
          href: "/reblog/" + tid + "/" + response.data +
          "/text?post%5Bone%5D=" +
          MissingE.escapeHTML(question) + "&MissingEaskName=" +
          response.name + "&MissingEaskPost=" +
          encodeURIComponent(perm.attr("href"))});
      if (before.length === 0) {
         rblnk.prependTo(item.find('div.post_controls')).after(' ');
      }
      else {
         rblnk.insertAfter(before).before(' ');
      }
      item.attr('name', response.name);
      rblnk.trigger('MissingEaddReblog');
   }
   else {
      var reblog_err = MissingE.getLocale(lang).error;
      rblnk = $('<a />',
        {title: reblog_err,
          href: "#",
          "class": "post_control MissingE_betterReblogs_retryAsk",
          click: function() { return false; }});
      if (before.length === 0) {
         rblnk.prependTo(item.find('div.post_controls')).after(' ');
      }
      else {
         rblnk.insertAfter(before).before(' ');
      }
   }
},

getServiceDefaults: function() {
   var options = $('#MissingE_quick_reblog_selector option');
   options.each(function() {
      MissingE.packages.betterReblogs.hasTwitter[this.value] = true;
      MissingE.packages.betterReblogs.hasFacebook[this.value] = true;
      $.ajax({
         type: "GET",
         url: "http://www.tumblr.com/blog/" + this.value + "/settings",
         dataType: "html",
         tryCount: 0,
         retryLimit: 4,
         blog: this.value,
         error: function(xhr) {
            if (xhr.status < 500) {
               return;
            }
            else {
               this.tryCount++;
               if (this.tryCount <= this.retryLimit) {
                  $.ajax(this);
                  return;
               }
            }
         },
         success: function(data) {
            var tumblr = this.blog;
            var select = $('#MissingE_quick_reblog_selector select');
            var cb = data.match(/<input[^>]*name="channel\[twitter_send_posts\]"[^>]*>/);
            if (cb && cb.length > 0) {
               MissingE.packages.betterReblogs.twitterChecked[tumblr] =
               /checked="checked"/.test(cb[0]) ||
               /checked\s*[^=]/.test(cb[0]);
            }
            var oauth = data.match(/<[^>]*id="oauth_signed_in_screenname"[^>]*>([^<]+)<\/[^>]*>/);
            if (!oauth || oauth.length < 2) {
               MissingE.packages.betterReblogs.hasTwitter[tumblr] = false;
               MissingE.packages.betterReblogs.twitterChecked[tumblr] = false;
            }
            cb = data.match(/<div[^>]*id="fb_connect_prompt[^>]*>/);
            if (cb && cb.length > 0) {
               MissingE.packages.betterReblogs.facebookChecked[tumblr] =
               /display:\s*none/.test(cb[0]);
            }
            MissingE.packages.betterReblogs.hasFacebook[tumblr] =
            MissingE.packages.betterReblogs.facebookChecked[tumblr];

            if (select.val() === tumblr) {
               select.trigger('change');
            }
         }
      });
});
},

getFacebookDefaults: function() {
   if (!MissingE.packages.betterReblogs.servicesChecked) {
      MissingE.packages.betterReblogs.servicesChecked = true;
      MissingE.packages.betterReblogs.getServiceDefaults();
   }
},

getTwitterDefaults: function() {
   if (!MissingE.packages.betterReblogs.servicesChecked) {
      MissingE.packages.betterReblogs.servicesChecked = true;
      MissingE.packages.betterReblogs.getServiceDefaults();
   }
},

changeQuickReblogAcct: function(sel, twitter, facebook) {
   var rm = $('#MissingE_quick_reblog_manual');
   var curhref = rm.attr('href');
   if (/channel_id=/.test(curhref)) {
      rm.attr('href',curhref.replace(/channel_id=[^&]*/,'channel_id=' +
        sel.val()));
   }
   else {
      rm.attr('href',curhref + '&channel_id=' + sel.val());
   }
   if (MissingE.packages.betterReblogs.hasTwitter[sel.val()]) {
      $('#MissingE_quick_reblog').addClass('hasTwitter');
   }
   else {
      $('#MissingE_quick_reblog').removeClass('hasTwitter');
   }
   if (MissingE.packages.betterReblogs.hasFacebook[sel.val()]) {
      $('#MissingE_quick_reblog').addClass('hasFacebook');
   }
   else {
      $('#MissingE_quick_reblog').removeClass('hasFacebook');
   }
   if ((twitter === "default" &&
    MissingE.packages.betterReblogs.twitterChecked[sel.val()]) ||
     twitter === "on") {
      $('#MissingE_quick_reblog_twitter input').get(0).checked = true;
}
else {
   $('#MissingE_quick_reblog_twitter input').get(0).checked = false;
}
if ((facebook === "default" &&
 MissingE.packages.betterReblogs.facebookChecked[sel.val()]) ||
  facebook === "on") {
   $('#MissingE_quick_reblog_facebook input').get(0).checked = true;
}
else {
   $('#MissingE_quick_reblog_facebook input').get(0).checked = false;
}
},

setReblogTags: function(tags) {
   localStorage.setItem('tbr_ReblogTags',tags.join(','));
},

setReblogTagsPlainText: function(tags) {
   localStorage.setItem('tbr_ReblogTags',tags);
},

setTagOverride: function() {
   localStorage.setItem('tbr_OverrideTags','1');
},

clearTagOverride: function() {
   localStorage.removeItem('tbr_OverrideTags');
},

startReblog: function(id) {
   var lang = $('html').attr('lang');
   var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.attr('oldtxt',a.attr('title'));
   $('#MissingE_quick_reblog').css('display','none');
   a.removeClass('MissingE_quick_reblogging_success')
   .addClass('MissingE_quick_reblogging');
   a.attr('title',MissingE.getLocale(lang).reblogging);
},

failReblog: function(id) {
   var lang = $('html').attr('lang');
   var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.removeClass('MissingE_quick_reblogging');
   a.attr('title',a.attr('oldtxt'));
   a.removeAttr('oldtxt');
   alert(MissingE.getLocale(lang).reblogFailed);
},

finishReblog: function(id) {
   var lang = $('html').attr('lang');
   var a = $('#post_'+id).find('div.post_controls a[href^="/reblog/"]');
   a.removeClass('MissingE_quick_reblogging')
   .addClass('MissingE_quick_reblogging_success');
   a.attr('title',MissingE.getLocale(lang).rebloggedText);
   a.removeAttr('oldtxt');
},

reblogTextFull: function(item) {
   var post = $(item);
   if (item.tagName === 'LI' &&
     post.hasClass('post') &&
     post.hasClass('regular')) {
      post.find('div.post_controls a[href^="/reblog/"]').each(function() {
         if (/\w\?/.test(this.href)) {
            this.setAttribute('href',
               this.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
         }
      });
}
else if (item.tagName === 'A' &&
   post.parent().is('div.post_controls') &&
   post.closest('li.post').hasClass('regular')) {
   if (/[\w]\?/.test(item.href)) {
      item.setAttribute('href',
         item.getAttribute('href').replace(/(\/text)?\?/,'/text?'));
   }
}
},

serializePostData: function(postData, result, propertyPrefix){
   result = result || [];
   for(var prop in postData){
      var jsonValue = null, value = postData[prop];
      var property = propertyPrefix 
      ? propertyPrefix + '['+prop+']'
      : prop;
      switch(typeof value){
         case 'string':
         jsonValue = JSON.stringify(value);
         break;
         case 'number':
         jsonValue = JSON.stringify(value);
         break;
         case 'object':
         MissingE.packages.betterReblogs.serializePostData(value, result, property);
         jsonValue = undefined;
         break;
         case 'boolean':
         jsonValue = value.toString();
         break;
         case 'null':
         case 'undefined':
         jsonValue = null;
         break;
      }
      if(jsonValue !== undefined){
         result.push('"'+property+'":'+jsonValue+'');
      }
   }
   if(!propertyPrefix){
      return '{'+result.join(',')+'}';
   }
},

doReblog: function (item, accountName, queueTags, reblogTags) {
   var reblogMode = {
      "normal":  '0',
      "draft":   '1',
      "queue":   '2',
      "private": 'private'
   };
   var i,isAsk,type,url,postId,perm,user, $item = $(item);
   if ($item.parent().hasClass('post_controls')) {
      type = 'normal';
         //url = $(item).attr('href');
         postId = $(item).closest('li.post').attr('id').match(/\d*$/)[0];
      }
      else {
         type = item.id.replace(/MissingE_quick_reblog_/,'');
         if (!type || type === 'manual') { return; }
         //url = $(item).siblings('a[href!="#"]').attr('href');
         postId = $(item).parent().attr('id').replace(/list_for_/,'');
      }

      url = location.protocol + '//' + location.host;

      var tags = $('#MissingE_quick_reblog_tags textarea').val();
      tags = tags.replace(/^\s*,/,'').replace(/,(\s*,)*/g,',')
      .replace(/\s*,\s*/g,',').replace(/,$/,'')
      .replace(/^\s*/,'').replace(/\s*$/,'');
      var mode = reblogMode[type];
      var taglist;
      if (queueTags && queueTags !== "" && type === "queue") {
         taglist = tags.split(',');
         for (i=0; i<queueTags.length; i++) {
            if ($.inArray(queueTags[i],taglist) === -1) {
               taglist.push(queueTags[i]);
            }
         }
         tags = taglist.join(",");
      }
      if (reblogTags && reblogTags !== "") {
         taglist = tags.split(',');
         for (i=0; i<reblogTags.length; i++) {
            if ($.inArray(reblogTags[i],taglist) === -1) {
               taglist.push(reblogTags[i]);
            }
         }
         tags = taglist.join(",");
      }
      isAsk = $('#post_' + postId).hasClass('note');
      perm = $('#permalink_' + postId).attr("href");
      user = $('#post_' + postId).attr("name");
      var twitter = $('#MissingE_quick_reblog_twitter input').is(':checked') &&
      $('#MissingE_quick_reblog').hasClass('hasTwitter');
      var facebook = $('#MissingE_quick_reblog_facebook input').is(':checked') &&
      $('#MissingE_quick_reblog').hasClass('hasFacebook');
      var caption = $('#MissingE_quick_reblog_caption textarea').val();
      caption = caption.replace(/^\s+/,'').replace(/\s+$/,'');
      if (caption.length > 0) {
         caption = '\n<p>' + caption.replace(/\n/g,'</p>\n<p>') + '</p>';
         caption = caption.replace(/<p><\/p>/g,'<p><br /></p>');
      }

      if(item.attributes['data-reblog-id'] === undefined){
         item = document.querySelector('[data-reblog-id="'+postId+'"]') || item;
      }

      MissingE.packages.betterReblogs.startReblog(postId);
      var postData = { //this is the data that will be posted to get more info from Tumblr server. 
                           //Tumblr then would generate the reblog modal dialog from the returned data. 
                           //We, however, will just submit it back
         reblog_id: parseInt(item.getAttribute('data-reblog-id')), //probably the id of the post
         reblog_key: item.getAttribute('data-reblog-key'), //looks like an anti-forgery key
         post_type: false, //I think it is supposed to be the post type, but in all my observations, it was sent false. Still need more study.
                             //I believe this property wil be of use if we use the option to reblog long text posts as text, insted of links 
         form_key: item.getAttribute('data-user-form-key') //I have no idea what this is, but Tumblr use it, probably
      };
      $.post(url + '/svc/post/fetch', JSON.stringify(postData), function(result){
         debugger;
         var images = {};
         if(result.post.photos){
            for (var i = 0, j = result.post.photos.length; i < j; i++) {
               var photo = result.post.photos[i];
               images[photo.id] = '';
            }
         }
         var newPost = {
            form_key: postData.form_key,
            channel_id: accountName,
            detached: true, //I don't know what this is, but Tumblr submit it
            reblog: result.post.is_reblog, 
            reblog_id: postData.reblog_id,
            reblog_key: postData.reblog_key,
            errors: false,
            created_post: result.created_post, //I have no idea what this is
            context_page: result.context_page || result.post_context_page,
            post_context_page: result.post_context_page || result.context_page,
            silent: true, //Tumblr seems to send this too, but I don't know what this means
            context_id: '', //no  idea what this is
            reblog_post_id: postData.reblog_id,
            is_rich_text: { //I don't know what this is. I bet this is important, so I'll investigate it more, later
            one: '0',
            two: '1',
            three: '0'
         },
         post:{
            slug: result.post.slug,
            source_url: result.post.source_url || 'http://', //the http:// seems to be required
            date: '',
            type: result.post.type,
               two: (result.post.two || '<p></p>') + (caption || ''), //this seems to be the content of the post itself. I need to test for more types of posts
               tags: tags || '',
               publish_on: '',
               state: mode,//result.post.state.toString(),
               photoset_layout: result.post.photoset_layout,
               photoset_order: result.post.photos ? ($.map(result.post.photos, function(photo){
                  return photo.id
               }).join(',')) : null
            },
            custom_tweet: '',
            images: images,
            MAX_FILE_SIZE: '10485760'
         };
         $.ajax({
            type: 'POST',
            url: url + '/svc/post/update',
            data: MissingE.packages.betterReblogs.serializePostData(newPost),
            dataType: 'JSON',
            contentType: 'application/json',
            error: function () {
               MissingE.packages.betterReblogs.failReblog(postId);
            },
            success: function(postResult) {
               if(postResult.errors){
                  console.log(postResult.errors);
                  MissingE.packages.betterReblogs.failReblog(postId);
               }
               else{
                  MissingE.packages.betterReblogs.finishReblog(postId);
               }
            }
         });
      }).fail(function(){
         MissingE.packages.betterReblogs.failReblog(postId);
      });      
   },

   run: function() {
      var lang = $('html').attr('lang');
      var settings = this.settings;
      var queueTags = "", reblogTags = "";

      $('#posts .post_controls .reblog_button').mouseover(function() {
         var item = $(this);
         var post = item.closest('.post');
         if (!post.hasClass('note') &&
            (!item.attr('data-fast-reblog-url') ||
               item.attr('data-fast-reblog-url') === '')) {
            var key = this.href.match(/\/reblog\/(\d+)\/(\w+)/);
         if (key && key.length > 2) {
            item.attr('data-fast-reblog-url',
               "/fast_reblog/" + key[1] + "/" + key[2]);
         }
      }
   });

      if (settings.tagQueuedPosts === 1) {
         queueTags = settings.queueTags;
      }
      if (settings.tagReblogs === 1) {
         reblogTags = settings.reblogTags;
      }
      if (settings.passTags === 1) {
         var selector = '#posts div.post_controls a[href^="/reblog/"]';
         if (settings.quickReblog === 1) {
            selector = '#MissingE_quick_reblog_manual';
         }
         $(selector).live('mousedown', function() {
            var tags;
            var isManual = this.id === 'MissingE_quick_reblog_manual';
            if (isManual && settings.autoFillTags === 1) {
               tags = $('#MissingE_quick_reblog_tags textarea').val();
               tags = tags.replace(/\s*,\s*/g,',').replace(/,$/,'')
               .replace(/^\s*/,'');
               MissingE.packages.betterReblogs.setReblogTagsPlainText(tags);
               MissingE.packages.betterReblogs.setTagOverride();
            }
            else {
               if (isManual) {
                  var postId = $(this).parent().attr('id')
                  .replace(/list_for_/,'');
                  tags = $('#post_' + postId).find('span.tags a');
               }
               else {
                  tags = $(this).closest('li.post').find('span.tags a');
               }
               var tagarr = [];
               if (MissingE.isTumblrURL(location.href, ["tagged"])) {
                  var i;
                  var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
                  str = str.replace(/\?/,'').replace(/\+/g,' ');
                  var entities = str.match(/%[\dA-F]{2}/gi);
                  if (entities !== undefined && entities !== null) {
                     for (i=0; i<entities.length; i++) {
                        var repl = String.fromCharCode(parseInt(entities[i]
                           .replace(/%/,''),16));
                        str = str.replace(entities[i],repl);
                     }
                  }
                  tagarr.push(str);
               }
               tags.each(function() {
                  if (/http:\/\/[^\/]*\/ask/.test(this.href)) {
                     return true;
                  }
                  tagarr.push($(this).text().replace(/^#/,''));
               });
               MissingE.packages.betterReblogs.setReblogTags(tagarr);
               if (isManual) {
                  MissingE.packages.betterReblogs.setTagOverride();
               }
               else {
                  MissingE.packages.betterReblogs.clearTagOverride();
               }
            }
         });
}
if (settings.fullText === 1) {
   $('#posts li.post.regular').each(function() {
      MissingE.packages.betterReblogs.reblogTextFull(this);
   });
   extension.addAjaxListener(function(type,list) {
      if (type === 'notes') { return; }
      $.each(list, function(i, val) {
         MissingE.packages.betterReblogs
         .reblogTextFull($('#'+val).get(0));
      });
   });
   $('#posts div.post_controls a').live('MissingEaddReblog', function(){
      MissingE.packages.betterReblogs.reblogTextFull(this);
   });
}
if (settings.reblogAsks === 1) {
   $('#posts li.post div.post_controls ' +
    'a.MissingE_betterReblogs_retryAsk').live('click', function() {
      var post = $(this).closest('li.post');
      if (post.length === 1) {
         MissingE.packages.betterReblogs
         .addAskReblog($(this).parents('li.post').get(0));
      }
   });
    $('#posts li.post').each(function(){
      MissingE.packages.betterReblogs.addAskReblog(this);
   });
    extension.addAjaxListener(function(type,list) {
      if (type !== 'posts') { return; }
      $.each(list, function(i,val) {
         MissingE.packages.betterReblogs.addAskReblog($('#'+val).get(0));
      });
   });
 }
 if (settings.quickReblog === 1) {
   var idx;
   $('#posts .post_controls a[href^="/edit"]').live('click', function() {
      if (/%3Flite/.test(this.href)) {
         this.href = this.href.replace(/%3Flite/,"");
      }
   });
   var txt = '<div id="MissingE_quick_reblog">' +
   '<div id="MissingE_qr_nipple"></div>' +
   '<div class="MissingE_qr_list">';
   for (idx=0; idx<MissingE.getLocale(lang).reblogOptions.length; idx++) {
      var doonclick = 'onclick="return false;"';
      if (MissingE.getLocale(lang).reblogOptions[idx].item === 'manual') {
         doonclick = '';
      }
      txt += '<a class="MissingE_quick_reblog_button" ' +
      'id="MissingE_quick_reblog_' +
      MissingE.escapeHTML(MissingE.getLocale(lang)
         .reblogOptions[idx].item) +
      '" href="#" ' + doonclick + '>' +
      '<div class="MissingE_qr_list_item">' +
      MissingE.escapeHTML(MissingE.getLocale(lang)
         .reblogOptions[idx].text) +
      '</div></a>';
   }
   var node = extension.isFirefox ?
   ['<span class="MissingE_quick_reblog_field">',
   '</span>'] :
   ['<a href="#" onclick="return false;" ' +
   'class="MissingE_quick_reblog_field">',
   '</a>'];
   txt += node[0] +
   '<div class="MissingE_qr_list_item has_tag_input ' +
   'MissingE_quick_reblog_twitter_box">' +
   '<div id="MissingE_quick_reblog_twitter">' +
   '<input type="checkbox" /> ' +
   MissingE.escapeHTML(MissingE.getLocale(lang).twitterText) +
   '</div></div>' + node[1];
   txt += node[0] +
   '<div class="MissingE_qr_list_item has_tag_input ' +
   'MissingE_quick_reblog_facebook_box">' +
   '<div id="MissingE_quick_reblog_facebook">' +
   '<input type="checkbox" /> ' +
   MissingE.escapeHTML(MissingE.getLocale(lang).facebookText) +
   '</div></div>' + node[1];
   var list = $('#popover_blogs div');
   if (list.length > 0) {
      txt +=  node[0] +
      '<div class="MissingE_qr_list_item has_tag_input">' +
      '<div id="MissingE_quick_reblog_selector">' +
      '<select>';
      list.each(function(i) {
         var acct = this.id.match(/menuitem-(.*)/);
         if (!acct) { return; }
         acct = acct[1];
         var sel = false;
         if ((settings.accountName === 0 &&
          i === 0) ||
           settings.accountName === acct) {
            sel = true;
      }
      txt += '<option value="' + MissingE.escapeHTML(acct) + '"' +
      (sel ? ' selected="selected"' : '') + '>' +
      MissingE.escapeHTML(acct) + '</option>';
   });
      txt +=  '</select><br />Tumblr</div></div>' + node[1];
   }
   else if (settings.tumblrAccounts.length > 0) {
      txt +=  node[0] +
      '<div class="MissingE_qr_list_item has_tag_input">' +
      '<div id="MissingE_quick_reblog_selector">' +
      '<select>';
      for (i=0; i<settings.tumblrAccounts.length; i++) {
         var sel = false;
         if ((settings.accountName === 0 &&
          i === 0) ||
           settings.accountName === settings.tumblrAccounts[i].account) {
            sel = true;
      }
      txt += '<option value="' +
      MissingE.escapeHTML(settings.tumblrAccounts[i].account) +
      '"' + (sel ? ' selected="selected"' : '') + '>' +
      MissingE.escapeHTML(settings.tumblrAccounts[i].account) +
      '</option>';
   }
   txt += '</select><br />Tumblr</div></div>' + node[1];
}
txt += node[0] + '<div class="MissingE_qr_list_item has_tag_input">' +
'<div id="MissingE_quick_reblog_caption">' +
'<textarea rows="2" /><br />' +
MissingE.escapeHTML(MissingE.getLocale(lang).captionText) +
'</div></div>' + node[1];
txt += node[0] + '<div class="MissingE_qr_list_item has_tag_input">' +
'<div id="MissingE_quick_reblog_tags">' +
'<textarea rows="2" /><br />' +
MissingE.escapeHTML(MissingE.getLocale(lang).tagsText) +
'</div></div>' + node[1];
var qr = $(txt).appendTo('body');
qr.find('#MissingE_quick_reblog_caption textarea')
.attr('placeholder', MissingE.getLocale(lang).captionText);
qr.find('#MissingE_quick_reblog_tags textarea')
.attr('placeholder', MissingE.getLocale(lang).tagsText);
if (settings.quickReblogCaption === 0) {
   qr.find('#MissingE_quick_reblog_caption')
   .closest('.MissingE_qr_list_item').css('display','none');
}
var qrSel = qr.find('#MissingE_quick_reblog_selector select');
if (settings.accountName === 0 ||
  qrSel.find('option[value="' + settings.accountName + '"]')
  .length === 0) {
   qrSel.val(qrSel.find('option:first').attr('value'));
}
else {
   qrSel.val(settings.accountName);
}
qrSel.click(function(e) {
   e.stopPropagation();
   return false;
}).change(function() {
   MissingE.packages.betterReblogs
   .changeQuickReblogAcct($(this),
    settings.quickReblogForceTwitter,
    settings.quickReblogForceFacebook);
}).mouseover(function(){
   qr.addClass('MissingE_quick_reblog_selecting');
}).mouseout(function(){
   qr.removeClass('MissingE_quick_reblog_selecting');
});

qr.mouseover(function(e){
   if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
     !$.contains(qr.get(0), e.relatedTarget) &&
     !$(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
      qr.removeData('off');
}
}).mouseout(function(e){
   if (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
     !$.contains(qr.get(0), e.relatedTarget) &&
     !$(e.relatedTarget).hasClass('MissingE_quick_reblog_main')) {
      $(this).css('display','');
   if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
      qr.data('off','off');
   }
   else {
      clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
      MissingE.packages.betterReblogs.resetTumblr =
      setTimeout(function() {
         if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
         var sel = $('#MissingE_quick_reblog_selector select');
         if (sel.find('option[value="' + settings.accountName +
           '"]').length > 0) {
            sel.val(settings.accountName);
      }
      else {
         sel.val(sel.find('option:first').val());
      }
      sel.trigger('change');
   }, 1000);
   }
}
});
qr.find('textarea').focus(function() {
   if (qr.hasClass('MissingE_quick_reblog_keys')) {
      $(this).closest('.MissingE_qr_list_item')
      .addClass('MissingE_qr_keyActive');
   }
   qr.addClass('MissingE_quick_reblog_tags_inputting');
   var taginput = this;
   if (extension.isSafari || extension.isFirefox) {
      $(document).bind('keydown.MissingEqr', function(e) {
         if (e.keyCode === 27) {
            taginput.blur();
            return true;
         }
      });
   }
}).blur(function() {
   if (qr.hasClass('MissingE_quick_reblog_keys')) {
      $(this).closest('.MissingE_qr_list_item')
      .removeClass('MissingE_qr_keyActive');
   }
   if (extension.isSafari || extension.isFirefox) {
      $(document).unbind('keydown.MissingEqr');
   }
   qr.removeClass('MissingE_quick_reblog_tags_inputting');
   if (qr.data('off')) {
      qr.removeData('off');
      var sel = $('#MissingE_quick_reblog_selector select');
      if (sel.find('option[value="' + settings.accountName +
        '"]').length > 0) {
         sel.val(settings.accountName);
   }
   else {
      sel.val(sel.find('option:first').val());
   }
   sel.trigger('change');
}
}).keydown(function(e) {
   var type = "unknown";
   if (this.parentNode.id === 'MissingE_quick_reblog_tags') {
      type = 'tags';
   }
   else if (this.parentNode.id === 'MissingE_quick_reblog_caption') {
      type = 'caption';
   }
   if (e.which === 9) {
      this.blur();
      e.preventDefault();
      if (type === 'tags') {
         if (e.shiftKey) {
            $('#MissingE_quick_reblog_caption textarea')
            .get(0).focus();
         }
      }
      else if (type === 'caption') {
         if (!e.shiftKey) {
            $('#MissingE_quick_reblog_tags textarea').get(0).focus();
         }
      }
   }
   else if (e.which === 27) {
      return;
   }
   else if (e.which === 13 && type === 'tags') {
      e.preventDefault();
   }
   if (e.which >= 65 || e.which <= 90 ||
     e.which === 37 || e.which === 39) {
      e.stopPropagation();
}
}).keyup(function() {
   if (this.parentNode.id === 'MissingE_quick_reblog_caption') {
      this.style.height = '24px';
      var newHeight = this.scrollHeight;
      if (newHeight < 24) { newHeight = 24; }
      if (newHeight > 60) { newHeight = 72; }
      this.style.height = newHeight + 'px';
   }
});
$('#posts div.post_controls a[href^="/reblog/"]')
.live('mouseover',function(e) {
   var reblog = $(this);
   reblog.addClass('MissingE_quick_reblog_main')
      .removeClass('reblog_button');//remove the class to prevent the native popup from showing up
   if (reblog.hasClass('MissingE_quick_reblogging')) {
      return;
   }
   clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
   delete MissingE.packages.betterReblogs.resetTumblr;
   var pos = reblog.offset();
   var h = reblog.outerHeight() - 2;
   var w = (qr.outerWidth()>>1) - (reblog.innerWidth()>>1);
   var marg = parseInt($('body').css('margin-top'), 10);
   if (isNaN(marg)) { marg = 0; }
   var tagarr = [];
   if (settings.passTags === 1 &&
     settings.autoFillTags === 1) {
      var tags = reblog.closest('li.post').find('span.tags a');
   if (MissingE.isTumblrURL(location.href, ["tagged"])) {
      var i;
      var str = location.href.match(/[^\/\?]*(?:$|\?)/)[0];
      str = str.replace(/\?/,'').replace(/\+/g,' ');
      var entities = str.match(/%[\dA-F]{2}/gi);
      if (entities !== undefined && entities !== null) {
         for (i=0; i<entities.length; i++) {
            var repl = String.fromCharCode(parseInt(entities[i]
               .replace(/%/,''),16));
            str = str.replace(entities[i],repl);
         }
      }
      tagarr.push(str);
   }
   tags.each(function() {
      if (/http:\/\/[^\/]*\/ask/.test(this.href)) {
         return true;
      }
      var currtag = $(this).text().replace(/^#/,'');
      if (!(/^\s*$/.test(currtag))) {
         tagarr.push(currtag);
      }
   });
}
var postId = reblog.closest('li.post').attr('id').match(/\d*$/)[0];
if (qr.find('div.MissingE_qr_list').attr('id') !==
   'list_for_' + postId) {
   qr.find('#MissingE_quick_reblog_tags textarea')
.val(tagarr.join(', '));
qr.find('#MissingE_quick_reblog_caption textarea')
.css('height','24px').val('');
qr.find('div.MissingE_qr_list').attr('id','list_for_' + postId);
}
var arg = '';
if (settings.accountName !== '0') {
   arg = '&channel_id=' + settings.accountName;
   if (!(/\?/.test(reblog.attr('href')))) {
      arg = arg.replace(/&/,'?');
   }
}
var newurl = reblog.attr('href').replace(/%3Flite/,"")
.replace(/channel_id=[^&]*/,'')
.replace(/\?&/,'?').replace(/&&/,'&')
.replace(/[\?&]$/,'') + arg;
qr.find('#MissingE_quick_reblog_manual').attr('href', newurl);
h = Math.round(pos.top+h-marg);
w = Math.round(pos.left-w-1);
qr.removeData('off');
if (e.relatedTarget) {
   qr.css('cssText', 'top:' + h + 'px !important;' +
   'left:' + w + 'px !important; display: block !important;');
}
else{
   qr.css('cssText', 'top:' + h + 'px !important;' +
      'left:' + w + 'px !important;');
}
}).live('mouseout',function(e) {
   if (!e.relatedTarget ||
     (e.relatedTarget.id !== 'MissingE_quick_reblog' &&
       !$.contains(qr.get(0), e.relatedTarget))) {
      qr.css('display','');
   if (qr.hasClass('MissingE_quick_reblog_tags_inputting')) {
      qr.data('off','off');
   }
   else {
      clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
      MissingE.packages.betterReblogs.resetTumblr =
      setTimeout(function() {
         if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
         var sel = $('#MissingE_quick_reblog_selector select');
         if (sel.find('option[value="' + settings.accountName +
           '"]').length > 0) {
            sel.val(settings.accountName);
      }
      else {
         sel.val(sel.find('option:first').val());
      }
      sel.trigger('change');
   }, 1000);
   }
}
}).live('click',function(e) {
   var me = $(this);
   if (me.hasClass('MissingE_quick_reblogging')) {
      return false;
   }
   var selector = $('#MissingE_quick_reblog_selector select');
   var account = settings.accountName;
   if (selector.length > 0) {
      account = selector.val();
   }
   e.preventDefault();
   MissingE.packages.betterReblogs
   .doReblog(this,account,queueTags,reblogTags);
   return false;
});
if (settings.quickKeyboardShortcut) {
   $(document).click(function(e) {
      if (!$.contains(qr.get(0), e.relatedTarget)) {
         qr.removeClass('MissingE_quick_reblog_keys');
         var inpBox = $('#MissingE_quick_reblog_tags textarea');
         inpBox.get(0).blur();
         if (qr.css('display') === 'none') {
            clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
            MissingE.packages.betterReblogs.resetTumblr =
            setTimeout(function() {
               if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
               var sel = $('#MissingE_quick_reblog_selector select');
               if (sel.find('option[value="' + settings.accountName +
                 '"]').length > 0) {
                  sel.val(settings.accountName);
            }
            else {
               sel.val(sel.find('option:first').val());
            }
            sel.trigger('change');
         }, 1000);
         }
      }
   });
   window.addEventListener('keydown', function(e) {
      if (e.metaKey || e.altKey || e.ctrlKey ||
        e.keyCode !== 82) {
         return;
   }
   $.globalEval('Tumblr.KeyCommands.suspend();');
}, true);
   $(window).keydown(function(e) {
               // 27 = Esc, 68 = D, 81 = Q, 82 = R, 84 = T
               if (e.metaKey || e.altKey || e.ctrlKey ||
                 (e.keyCode !== 68 && e.keyCode !== 81 && e.keyCode !== 82 &&
                   e.keyCode !== 84 && e.keyCode !== 27)) {
                  return;
            }
            if ($(e.target).is('input,textarea')) {
               if (!qr.hasClass('MissingE_quick_reblog_keys') ||
                 e.keyCode !== 27) {
                  return;
            }
         }
         else if (e.shiftKey && e.keyCode !== 82) {
            return;
         }
         var currPos = $(window).scrollTop()+7;
         $('#posts li.post').each(function() {
            var postPos = this.offsetTop;
            if (postPos === currPos) {
               var isManual = false;
               var rebBtn = $(this).find('div.post_controls ' +
                'a[href^="/reblog/"]').get(0);
               var overEvt = document.createEvent("MouseEvent");
               overEvt.initMouseEvent("mouseover", true, true, window, 0,
                0, 0, 0, 0, false, false, false,
                false, 0, null);
               rebBtn.dispatchEvent(overEvt);
               if (!$(rebBtn).hasClass('MissingE_quick_reblogging')) {
                  var itm, inpBox;
                  if (e.keyCode === 68) {
                     itm = document.getElementById('MissingE_quick_reblog_draft');
                  }
                  else if (e.keyCode === 81) {
                     itm = document.getElementById('MissingE_quick_reblog_queue');
                  }
                  else if (e.keyCode === 82 && e.shiftKey) {
                     isManual = true;
                     itm = document.getElementById('MissingE_quick_reblog_manual');
                  }
                  else if (e.keyCode === 82) {
                     itm = rebBtn;
                  }
                  else if (e.keyCode === 84) {
                     qr.addClass('MissingE_quick_reblog_keys');
                     qr.find('.MissingE_qr_keyActive').removeClass('MissingE_qr_keyActive');
                     inpBox = $('#MissingE_quick_reblog_tags textarea');
                     inpBox.closest('.MissingE_qr_list_item').addClass('MissingE_qr_keyActive');
                     inpBox.get(0).focus();
                     e.preventDefault();
                     return false;
                  }
                  else if (qr.hasClass('MissingE_quick_reblog_keys') &&
                     e.keyCode === 27) {
                     qr.removeClass('MissingE_quick_reblog_keys');
                  inpBox = $('#MissingE_quick_reblog_tags textarea');
                  inpBox.get(0).blur();
                  if (qr.css('display') === 'none') {
                     clearTimeout(MissingE.packages.betterReblogs.resetTumblr);
                     MissingE.packages.betterReblogs.resetTumblr =
                     setTimeout(function() {
                        if (MissingE.packages.betterReblogs.showingReblogMenu()) { return; }
                        var sel = $('#MissingE_quick_reblog_selector select');
                        if (sel.find('option[value="' + settings.accountName +
                           '"]').length > 0) {
                           sel.val(settings.accountName);
                     }
                     else {
                        sel.val(sel.find('option:first').val());
                     }
                     sel.trigger('change');
                  }, 1000);
                  }
               }
               if (!itm) {
                  return;
               }
               else {
                  qr.removeClass('MissingE_quick_reblog_keys');
               }
               if (isManual) {
                  var downEvt = document.createEvent("MouseEvent");
                  downEvt.initMouseEvent("mousedown", true, true,
                   window, 0, 0, 0, 0, 0, false,
                   false, false, false, 0, null);
                  itm.dispatchEvent(downEvt);
                  var clickEvt = document.createEvent("MouseEvent");
                  clickEvt.initMouseEvent("click", true, true, window,
                     0, 0, 0, 0, 0, false, false,
                     false, false, 0, null);
                  itm.dispatchEvent(clickEvt);
               }
               else {
                  var selector = $('#MissingE_quick_reblog_selector select');
                  var account = settings.accountName;
                  if (selector.length > 0) {
                     account = selector.val();
                  }
                  MissingE.packages.betterReblogs
                  .doReblog(itm, account, queueTags, reblogTags);
               }
            }
            var outEvt = document.createEvent("MouseEvent");
            outEvt.initMouseEvent("mouseout", true, true, window, 0,
              0, 0, 0, 0, false, false, false,
              false, 0, null);
            rebBtn.dispatchEvent(outEvt);
            return false;
         }
         if (postPos >= currPos) {
            return false;
         }
      });
$.globalEval('Tumblr.KeyCommands.resume();');
});
}

qr.find('#MissingE_quick_reblog_twitter input').mousedown(function() {
   this.checked = !this.checked;
   return false;
}).click(function() {
   return false;
});
qr.find('#MissingE_quick_reblog_facebook input').mousedown(function() {
   this.checked = !this.checked;
   return false;
}).click(function() {
   return false;
});
qr.find('span.MissingE_quick_reblog_field div').click(function() {
   return false;
});
qr.find('a').click(function(e){
   if (e.target.tagName === 'INPUT' ||
     e.target.tagName === 'SELECT') { return false; }
      var trg = $(e.target);
   if (trg.hasClass('MissingE_quick_reblog_field') ||
     trg.closest('a').hasClass('MissingE_quick_reblog_field')) {
      return false;
}
var selector = $('#MissingE_quick_reblog_selector select');
var account = settings.accountName;
if (selector.length > 0) {
   account = selector.val();
}
MissingE.packages.betterReblogs
.doReblog(this,account,queueTags,reblogTags);
});

MissingE.packages.betterReblogs.getTwitterDefaults();
MissingE.packages.betterReblogs.getFacebookDefaults();
}
},

init: function() {
   extension.sendRequest("settings", {component: "betterReblogs"},
     function(response) {
      if (response.component === "betterReblogs") {
         var i;
         MissingE.packages.betterReblogs.settings = {};
         for (i in response) {
            if (response.hasOwnProperty(i) &&
              i !== "component") {
               MissingE.packages.betterReblogs.settings[i] = response[i];
         }
      }
      MissingE.packages.betterReblogs.run();
   }
});
}
};

if (extension.isChrome ||
  extension.isFirefox) {
   MissingE.packages.betterReblogs.init();
}

}(jQuery));