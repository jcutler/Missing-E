/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
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

MissingE.packages.blockNotes = {
   hideNotification: function(item) {
		var i = $(item);
		if(i.hasClass('first_notification')) {
			var e = i.next('.notification');
			if(e.hasClass('last_notification')) {
				e.removeClass('last_notification');
				e.addClass('single_notification');
			} else {
				e.addClass('first_notification');
			}
		}
		if(i.hasClass('last_notification')) {
			var e = i.prev('.notification');
			if(e.hasClass('first_notification')) {
				e.removeClass('first_notification');
				e.addClass('single_notification');
			} else {
				e.addClass('last_notification');
			}		
		}
		
		i.hide();
   },

   loadNotification: function(item) {
      var lang = $('html').attr('lang');

	  //Only operate on notifications
      if (item.tagName === "LI" && $(item).hasClass("notification")) {
		var index;
		var links = $(item).find('a');
		//Ensure it is a "like" notification
		links.each(function(i,e) {
			if($(e).html() == 'post') { //Kind of hackish
				index = i;
				return false;
			}
		});
		if(index == undefined)
			return false;
			
		$(item).find('.block').html('block user'); //Make more explicit
		
		//Find post ID from link url
		var url = links.get(index).href;
		var postId = url.split('/')[4];
		
		//Add postId to notification
		$(item).addClass('MissingE_blockNotes_'+postId);
		
		//Build "block notes" link
		var newlink = $('<a></a>').addClass('block')
			.addClass('MissingE_blockNotes')
			.attr('MissingE_blockNotes_id',postId)
			.attr('MissingE_blockNotes_link',url)
			.attr('MissingE_blockNotes_text',links.get(index+1).innerHTML)
			.html('block notes');
		
		$(item).append(newlink);
		
		if(MissingE.packages.blockNotes.settings['blocked'].hasOwnProperty(postId)) //If already blocked
			MissingE.packages.blockNotes.hideNotification(item);
      }
   },
   
   updateBlocked: function() {
      if (extension.isFirefox ||
          extension.isSafari) {
         extension.sendRequest("change-setting", {name: 'MissingE_blockNotes_blocked', val: JSON.stringify(MissingE.packages.blockNotes.settings['blocked'])});
      }
      else {
         extension.backupVal('MissingE_blockNotes_blocked', JSON.stringify(MissingE.packages.blockNotes.settings['blocked']) );
      }
   },

   run: function() {
      $('#posts li.notification').each(function(){
         MissingE.packages.blockNotes.loadNotification(this);
      });
	  
      extension.addAjaxListener(function(type,list) {
         if (type === 'notes') { return; }
         $.each(list, function(i,val) {
            MissingE.packages.blockNotes.loadNotification($('#'+val).get(0));
         });
      });
	  
	  $('body').delegate('.MissingE_blockNotes','click',function(event) {
		MissingE.packages.blockNotes.settings['blocked'][$(this).attr('MissingE_blockNotes_id')] = {'text': $(this).attr('MissingE_blockNotes_text'), 'link': $(this).attr('MissingE_blockNotes_link') };
		$('.MissingE_blockNotes_' + $(this).attr('MissingE_blockNotes_id')).each(function(i,e) { MissingE.packages.blockNotes.hideNotification(e); });
		MissingE.packages.blockNotes.updateBlocked();
	  });
   },

   init: function() {
      $('head').append('<style type="text/css"> \
		.MissingE_blockNotes { \
			right: 78px !important; \
		} \
		#posts .notification .hide_overflow { \
			max-width: 400px !important; \
		} \
		</style>');
      extension.sendRequest("settings", {component: "blockNotes"},
                            function(response) {
         if (response.component === "blockNotes") {
            var i;
            MissingE.packages.blockNotes.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
				   if(i === 'blocked') {
					MissingE.packages.blockNotes.settings[i] = JSON.parse(response[i]);
				   } else {
					MissingE.packages.blockNotes.settings[i] = response[i];
				   }
               }
            }
            MissingE.packages.blockNotes.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.blockNotes.init();
}

}(jQuery));
