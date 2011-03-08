/*
 * Facebox (for jQuery)
 * version: 1.2 (05/05/2008)
 * @requires jQuery v1.2 or later
 *
 * Examples at http://famspam.com/facebox/
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2007, 2008 Chris Wanstrath [ chris@ozmm.org ]
 *
 * Usage:
 *
 *  jQuery(document).ready(function() {
 *    jQuery('a[rel*=facebox]').facebox()
 *  })
 *
 *  <a href="#terms" rel="facebox">Terms</a>
 *    Loads the #terms div in the box
 *
 *  <a href="terms.html" rel="facebox">Terms</a>
 *    Loads the terms.html page in the box
 *
 *  <a href="terms.png" rel="facebox">Terms</a>
 *    Loads the terms.png image in the box
 *
 *
 *  You can also use it programmatically:
 *
 *    jQuery.facebox('some html')
 *    jQuery.facebox('some html', 'my-groovy-style')
 *
 *  The above will open a facebox with "some html" as the content.
 *
 *    jQuery.facebox(function($) {
 *      $.get('blah.html', function(data) { $.facebox(data) })
 *    })
 *
 *  The above will show a loading screen before the passed function is called,
 *  allowing for a better ajaxy experience.
 *
 *  The facebox function can also display an ajax page, an image, or the contents of a div:
 *
 *    jQuery.facebox({ ajax: 'remote.html' })
 *    jQuery.facebox({ ajax: 'remote.html' }, 'my-groovy-style')
 *    jQuery.facebox({ image: 'stairs.jpg' })
 *    jQuery.facebox({ image: 'stairs.jpg' }, 'my-groovy-style')
 *    jQuery.facebox({ div: '#box' })
 *    jQuery.facebox({ div: '#box' }, 'my-groovy-style')
 *
 *  Want to close the facebox?  Trigger the 'close.facebox' document event:
 *
 *    jQuery(document).trigger('close.facebox')
 *
 *  Facebox also has a bunch of other hooks:
 *
 *    loading.facebox
 *    beforeReveal.facebox
 *    reveal.facebox (aliased as 'afterReveal.facebox')
 *    init.facebox
 *    afterClose.facebox
 *
 *  Simply bind a function to any of these hooks:
 *
 *   $(document).bind('reveal.facebox', function() { ...stuff to do after the facebox and contents are revealed... })
 *
 */
(function($) {
   $.facebox = function(data, klass) {
      $.facebox.loading();

      if (data.ajax) fillFaceboxFromAjax(data.ajax, klass);
      else if (data.image) fillFaceboxFromImage(data.image, klass);
      else if (data.div) fillFaceboxFromHref(data.div, klass);
      else if ($.isFunction(data)) data.call($);
      else $.facebox.reveal(data, klass);
   }

   /*
    * Public, $.facebox methods
    */

   $.extend($.facebox, {
      settings: {
         opacity      : 0.2,
         overlay      : true,
         loadingImage : chrome.extension.getURL('facebox/loading.gif'),
         closeImage   : chrome.extension.getURL('facebox/closelabel.png'),
         imageTypes   : [ 'png', 'jpg', 'jpeg', 'gif' ],
         faceboxHtml  : '\
      <div id="facebox" style="display:none;"> \
         <div class="popup"> \
            <div class="content"> \
            </div> \
            <a href="#" class="close"><img src="' + chrome.extension.getURL('facebox/closelabel.png') + '" title="close" class="close_image" /></a> \
         </div> \
      </div>'
      },

      loading: function() {
         init();
         if ($('#facebox .loading').length == 1) return true;
         showOverlay();

         $('#facebox .content').empty();
         $('#facebox .content').children().hide().end().append('<div style="padding:50px 0;" class="loading"><img src="'+$.facebox.settings.loadingImage+'"/></div>');

         $('#facebox').css({
            top:  getPageScroll()[1] + (getPageHeight() / 10),
            left: $(window).width() / 2 - 205
         }).show();

         $(document).bind('keydown.facebox', function(e) {
            if (e.keyCode == 27) $.facebox.close();
            return true;
         });
         $(document).trigger('loading.facebox');
      },

      reveal: function(data, klass) {
         $(document).trigger('beforeReveal.facebox');
         if (klass) $('#facebox .content').addClass(klass);
         $('#facebox .content').append(data);
         $('#facebox .loading').remove();
         $('#facebox .body').children().fadeIn('normal');
         $('#facebox').css('left', $(window).width() / 2 - ($('#facebox .popup').width() / 2));
         var h = $('#facebox .popup').height();
         var ph = getPageHeight();
         if (h > ((8 * ph) / 10)) {
            $('#facebox').css('top', getPageScroll()[1] + ((getPageHeight()-h)>>1));
         }
         $(document).trigger('reveal.facebox').trigger('afterReveal.facebox');
      },

      close: function() {
         $(document).trigger('close.facebox');
         return false;
      }
   });

   /*
    * Public, $.fn methods
    */

   $.fn.facebox = function(settings) {
      if ($(this).length == 0) return;

      init(settings);

      function clickHandler() {
         $.facebox.loading(true);

         // support for rel="facebox.inline_popup" syntax, to add a class
         // also supports deprecated "facebox[.inline_popup]" syntax
         var klass = this.rel.match(/facebox\[?\.(\w+)\]?/);
         if (klass) klass = klass[1];

         fillFaceboxFromHref(this.href, klass);
         return false;
      }

      return this.bind('click.facebox', clickHandler);
   }

   /*
    * Private methods
    */

   // called one time to setup facebox on this page
   function init(settings) {
      if ($.facebox.settings.inited) return true;
      else $.facebox.settings.inited = true;

      $(document).trigger('init.facebox');
      makeCompatible();

      var imageTypes = $.facebox.settings.imageTypes.join('|');
      $.facebox.settings.imageTypesRegexp = new RegExp('\.(' + imageTypes + ')$', 'i');

      if (settings) $.extend($.facebox.settings, settings);
      $('body').append($.facebox.settings.faceboxHtml);

      var preload = [ new Image(), new Image() ];
      preload[0].src = $.facebox.settings.closeImage;
      preload[1].src = $.facebox.settings.loadingImage;

      $('#facebox').find('.b:first, .bl').each(function() {
         preload.push(new Image());
         preload.slice(-1).src = $(this).css('background-image').replace(/url\((.+)\)/, '$1');
      });

      $('#facebox .close').click($.facebox.close);
      $('#facebox .close_image').attr('src', $.facebox.settings.closeImage);
   }

   // getPageScroll() by quirksmode.com
   function getPageScroll() {
      var xScroll, yScroll;
      if (self.pageYOffset) {
         yScroll = self.pageYOffset;
         xScroll = self.pageXOffset;
      }
      else if (document.documentElement &&
               document.documentElement.scrollTop) {
         // Explorer 6 Strict
         yScroll = document.documentElement.scrollTop;
         xScroll = document.documentElement.scrollLeft;
      }
      else if (document.body) {
         // all other Explorers
         yScroll = document.body.scrollTop;
         xScroll = document.body.scrollLeft;
      }
      return new Array(xScroll,yScroll);
   }

   // Adapted from getPageSize() by quirksmode.com
   function getPageHeight() {
      var windowHeight;
      if (self.innerHeight) {
         // all except Explorer
         windowHeight = self.innerHeight;
      }
      else if (document.documentElement &&
               document.documentElement.clientHeight) {
         // Explorer 6 Strict Mode
         windowHeight = document.documentElement.clientHeight;
      }
      else if (document.body) { // other Explorers
         windowHeight = document.body.clientHeight;
      }
      return windowHeight;
   }

   // Backwards compatibility
   function makeCompatible() {
      var $s = $.facebox.settings;

      $s.loadingImage = $s.loading_image || $s.loadingImage;
      $s.closeImage = $s.close_image || $s.closeImage;
      $s.imageTypes = $s.image_types || $s.imageTypes;
      $s.faceboxHtml = $s.facebox_html || $s.faceboxHtml;
   }

   // Figures out what you want to display and displays it
   // formats are:
   //     div: #id
   //   image: blah.extension
   //    ajax: anything else
   function fillFaceboxFromHref(href, klass) {
      if (href.match(/#/)) {
         // div
         var url    = window.location.href.split('#')[0];
         var target = href.replace(url,'');
         if (target == '#') return;
         $.facebox.reveal($(target).html(), klass);
      }
      else if (href.match($.facebox.settings.imageTypesRegexp)) {
         // image
         fillFaceboxFromImage(href, klass);
      }
      else {
         // ajax
         fillFaceboxFromAjax(href, klass);
      }
   }

   var facebox_images;
   var facebox_imagesCount;
   function fillFaceboxFromImage(href, klass) {
      if (/^\[/.test(href)) {
         var srcs = JSON.parse(href);
         facebox_images = new Array(srcs.length>>1);
         facebox_imagesCount = 0;
         for (x=0; x<srcs.length; x+=2) {
            var i = x>>1;
            facebox_images[i] = new Image();
            facebox_images[i].onload = function() {
               facebox_imagesCount++;
               if (facebox_imagesCount == facebox_images.length) {
                  var ph = getPageHeight() - 30;
                  var pw = $(window).width() - 30;
                  var maxWidth = 0;
                  var maxHeight = 0;
                  var wide = new Array(facebox_imagesCount);
                  var high = new Array(facebox_imagesCount);
                  code = '';
                  for (j=0; j<facebox_images.length; j++) {
                     if (facebox_images[j].width <= pw && facebox_images[j].height <= ph) {
                        wide[j] = facebox_images[j].width;
                        high[j] = facebox_images[j].height;
                     }
                     else if (facebox_images[j].width <= pw && facebox_images[j].height > ph) {
                        var ratio = ph/facebox_images[j].height;
                        wide[j] = facebox_images[j].width * ratio;
                        high[j] = ph;
                     }
                     else if (facebox_images[j].width > pw && facebox_images[j].height <= ph) {
                        var ratio = pw/facebox_images[j].width;
                        wide[j] = pw;
                        high[j] = facebox_images[j].height * ratio;
                     }
                     else {
                        var ratiow = pw/facebox_images[j].width;
                        var ratioh = ph/facebox_images[j].height;
                        if (ratiow <= ratioh) {
                           wide[j] = pw;
                           high[j] = facebox_images[j].height * ratiow;
                        }
                        else {
                           wide[j] = facebox_images[j].width * ratioh;
                           high[j] = ph;
                        }
                     }
                     if (wide[j] > maxWidth) maxWidth=wide[j];
                     if (high[j] > maxHeight) maxHeight=high[j];
                  }
                  for (j=0; j<facebox_images.length; j++) {
                     var p = (maxHeight - high[j])>>1;
                     code += '<div style="padding:' + p + 'px 0;' + (j != 0 ? 'display:none;':'') +
                              '" class="image"><div style="width:' + wide[j] +
                              'px" class="captioned"><a href="' + facebox_images[j].src +
                              '" target="_blank"><img src="' + facebox_images[j].src + '" /></a>';
                     if (srcs[j*2+1] != "")
                        code += '<div class="caption captionbg">&nbsp;</div><div class="caption">' +
                                 srcs[j*2+1] + '</div>';
                     code += '</div></div>';
                  }
                  var m = (maxHeight - 45)>>1;
                  code = '<div class="slideshow" style="width:' + maxWidth + 'px;height:' +
                           maxHeight + 'px">' + code + '<div style="margin:' + m +
                           'px 0;" class="turner_left"></div><div style="margin:' + m +
                           'px 0;" class="turner_right"></div></div>';
                  $.facebox.reveal(code, klass);
               }
            };
            facebox_images[i].src = srcs[x];
         }
      }
      else {
         var image = new Image();
         image.onload = function() {
            var ph = getPageHeight() - 30;
            var pw = $(window).width() - 30;
            var wide, high;
            if (image.width <= pw && image.height <= ph) {
               wide = image.width;
               high = image.height;
            }
            else if (image.width <= pw && image.height > ph) {
               var ratio = ph/image.height;
               wide = image.width * ratio;
               high = ph;
            }
            else if (image.width > pw && image.height <= ph) {
               var ratio = pw/image.width;
               wide = pw;
               high = image.height * ratio;
            }
            else {
               var ratiow = pw/image.width;
               var ratioh = ph/image.height;
               if (ratiow <= ratioh) {
                  wide = pw;
                  high = image.height * ratiow;
               }
               else {
                  wide = image.width * ratioh;
                  high = ph;
               }
            }
            $.facebox.reveal('<div class="image"><a href="' + image.src +
                              '" target="_blank"><img style="width:' + wide +
                              'px;height:' + high + 'px;" src="' + image.src +
                              '" /></a></div>', klass);
         };
      image.src = href
      }
   }

   function fillFaceboxFromAjax(href, klass) {
      $.get(href, function(data) { $.facebox.reveal(data, klass) });
   }

   function skipOverlay() {
      return $.facebox.settings.overlay == false || $.facebox.settings.opacity === null;
   }

   function showOverlay() {
      if (skipOverlay()) return;

      if ($('#facebox_overlay').length == 0)
         $("body").append('<div id="facebox_overlay" class="facebox_hide"></div>');

      $('#facebox_overlay').hide().addClass("facebox_overlayBG")
         .css('opacity', $.facebox.settings.opacity)
         .click(function() { $(document).trigger('close.facebox') })
         .fadeIn(200);
      return false;
   }

   function hideOverlay() {
      if (skipOverlay()) return;

      $('#facebox_overlay').fadeOut(200, function(){
         $("#facebox_overlay").removeClass("facebox_overlayBG")
                              .addClass("facebox_hide")
                              .remove();
      });
      return false;
   }

   /*
    * Bindings
    */

   $(document).bind('close.facebox', function() {
      $(document).unbind('keydown.facebox');
      $('#facebox').fadeOut(function() {
         $('#facebox .content').removeClass().addClass('content');
         $('#facebox .loading').remove();
         $(document).trigger('afterClose.facebox');
      });
      hideOverlay();
   });

})(jQuery);
