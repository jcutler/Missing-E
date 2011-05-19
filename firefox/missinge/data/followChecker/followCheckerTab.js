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

function fill(message) {
   if (message.greeting !== "followChecker_fill") {
      return false;
   }
   else if (message.success) {
      var i;
      jQuery('#error').css('display','none');
      jQuery('a.unfollow_button,a.follow_button').live('click', function() {
         var id = this.id.replace(/(un)?follow_button_/,'');
         var url = jQuery(this).closest('div.followee,div.follower')
                     .find('div.name a').attr('href');
         var avatar = jQuery(this).closest('div.followee,div.follower')
                        .find('img.avatar').attr('src')
                        .match(/http:\/\/[^\/]*\/avatar_(.*)$/)[1];
         var action = this.id.match(/^[^_]*/)[0];
         jQuery('#loading_' + id).show();
         jQuery(this).hide();
         jQuery.ajax({
            type: "POST",
            url: 'http://www.tumblr.com/' + action,
            tumblrAction: action,
            tumblrId: id,
            tumblrURL: url,
            tumblrImg: avatar,
            data: {id: id, form_key: message.formKey},
            success: function() {
               jQuery('#loading_' + this.tumblrId).hide();
               self.postMessage({greeting: this.tumblrAction,
                            tumblrId: this.tumblrId,
                            tumblrURL: this.tumblrURL,
                            tumblrImg: this.tumblrImg});
            },
            error: function(jqXHR, textStatus, errorThrown) {
               jQuery('#' + this.action + '_loading_' + this.tumblrId).hide();
               jQuery('#' + this.action + '_button_' + this.tumblrId).show();
               alert("Sorry, Tumblr seems to be having technical trouble.\n\nPlease try again later.");
            }
         });
         return false;
      });
      jQuery('#followYou_count').text(message.followYou.length);
      var txt = '';
      for (i=0; i<message.followYou.length; i++) {
         var entry = message.followYou[i].split(';');
         if (!entry[2] || entry[2] == '') {
            entry[2] = 'http://assets.tumblr.com/images/default_avatar_30.gif';
         }
         else {
            entry[2] = 'http://media.tumblr.com/avatar_' + entry[2];
         }
         txt += '<div class="follower' + ((i%2==1) ? ' alt' : '') + '">' +
               '<a href="' + entry[1] + '" target="_blank">' +
               '<img class="avatar" alt="' + entry[0] + '" src="' +
               entry[2] + '" />' +
               '</a><div class="name"><a href="' + entry[1] + '" ' +
               'target="_blank">' + entry[0] + '</a></div>' +
               '<div class="control"><a href="#" class="follow_button" ' +
               'id="follow_button_' + entry[0] + '" onclick="return false;">' +
               '<img src="http://assets.tumblr.com/images/iframe_follow.png" ' +
               'alt="Follow" /></a><img class="loading" src="loading.gif" ' +
               'id="follow_loading_' + entry[0] + '" /></div></div>';
      }
      jQuery('#followers .section').html(txt);
      jQuery('#youFollow_count').text(message.youFollow.length);
      var txt = '';
      for (i=0; i<message.youFollow.length; i++) {
         var entry = message.youFollow[i].split(';');
         if (!entry[2] || entry[2] == '') {
            entry[2] = 'http://assets.tumblr.com/images/default_avatar_30.gif';
         }
         else {
            entry[2] = 'http://media.tumblr.com/avatar_' + entry[2];
         }
         txt += '<div class="followee' + ((i%2==1) ? '' : ' alt') + '">' +
               '<a href="' + entry[1] + '" target="_blank">' +
               '<img class="avatar" alt="' + entry[0] + '" src="' +
               entry[2] + '" />' +
               '</a><div class="name"><a href="' + entry[1] + '" ' +
               'target="_blank">' + entry[0] + '</a></div>' +
               '<div class="control"><a href="#" class="unfollow_button" ' +
               'id="unfollow_button_' + entry[0] +
               '" onclick="return false;"><img src="' +
               'http://assets.tumblr.com/images/iframe_unfollow_alpha.png" ' +
               'alt="Follow" /></a><img class="loading" src="loading.gif" ' +
               'id="unfollow_loading_' + entry[0] + '" /></div></div>';
      }
      jQuery('#followees .section').html(txt);
      jQuery('#container').css('display','block');
   }
   else {
      jQuery('#container').css('display','none');
      jQuery('#error').css('display','block');
   }
}

jQuery(document).ready(function (){
   self.postMessage({greeting: "followChecker_fill"});
   self.on('message', fill);
});
