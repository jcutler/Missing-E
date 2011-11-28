/**
 * jQuery Spin 1.1.1
 *
 * Copyright (c) 2009 Naohiko MORI
 * Dual licensed under the MIT and GPL licenses.
 *
 **/
(function($){
  var calcFloat = {
    get: function(num){
      var num = num.toString();
      if(num.indexOf('.')==-1) return[0, parseInt(num)];
      var nn = num.split('.');
      var po = nn[1].length;
      var st = nn.join('');
      var sign = '';
      if(st.charAt(0)=='-'){
        st = st.substr(1);
        sign = '-';
      }
      for(var i=0; i<st.length; ++i) if(st.charAt(0)=='0') st=st.substr(1, st.length);
      st = sign + st;
      return [po, parseInt(st)];
    },
    getInt: function(num, figure){
      var d = Math.pow(10, figure);
      var n = this.get(num);
      var v1 = parseInt(num) * d;
      var v2 = n[1] * d;
      if(this.get(v1)[1]==v2) return v1;
      return(n[0]==0 ? v1 : v2 / Math.pow(10, n[0]));
    },
    sum: function(v1, v2){
      var n1 = this.get(v1);
      var n2 = this.get(v2);
      var figure = (n1[0] > n2[0] ? n1[0] : n2[0]);
      v1 = this.getInt(v1, figure);
      v2 = this.getInt(v2, figure);
      return (v1 + v2)/Math.pow(10, figure);
    }
  };
  $.extend({
    spin: {
      imageBasePath: '../lib/jquery-spin/img/',
      spinBtnImage: 'spin-button.png',
      spinUpImage: 'spin-up.png',
      spinDownImage: 'spin-down.png',
      interval: 1,
      max: null,
      min: null,
      timeInterval: 500,
      timeBlink: 200,
      btnClass: null,
      btnCss: {cursor: 'pointer', padding: 0, margin: 0, verticalAlign: 'middle'},
      txtCss: {marginRight: 0, paddingRight: 0},
      lock: false,
      decimal: null,
      beforeChange: null,
      changed: null,
      buttonUp: null,
      buttonDown: null
    }
  });
  $.fn.extend({
    spin: function(o){
      return this.each(function(){
				o = o || {};
				var opt = {};
				$.each($.spin, function(k,v){
					opt[k] = (typeof o[k]!='undefined' ? o[k] : v);
				});

        var txt = $(this);

        var spinBtnImage = opt.imageBasePath+opt.spinBtnImage;
        var btnSpin = new Image();
        btnSpin.src = spinBtnImage;
        var spinUpImage = opt.imageBasePath+opt.spinUpImage;
        var btnSpinUp = new Image();
        btnSpinUp.src = spinUpImage;
        var spinDownImage = opt.imageBasePath+opt.spinDownImage;
        var btnSpinDown = new Image();
        btnSpinDown.src = spinDownImage;

        var btn = $(document.createElement('img'));
        btn.attr('src', spinBtnImage);
        if(opt.btnClass) btn.addClass(opt.btnClass);
        if(opt.btnCss) btn.css(opt.btnCss);
        if(opt.txtCss) txt.css(opt.txtCss);
        txt.after(btn);
	if(opt.lock){
		txt.focus(function(){txt.blur();});
        }

        function spin(vector){
          var val = txt.val();
          var org_val = val;
          if(opt.decimal) val=val.replace(opt.decimal, '.');
          if(!isNaN(val)){
            val = calcFloat.sum(val, vector * opt.interval);
            if(opt.min!==null && val<opt.min) val=opt.min;
            if(opt.max!==null && val>opt.max) val=opt.max;
            if(val != txt.val()){
              if(opt.decimal) val=val.toString().replace('.', opt.decimal);
              var ret = ($.isFunction(opt.beforeChange) ? opt.beforeChange.apply(txt, [val, org_val]) : true);
              if(ret!==false){
                txt.val(val);
                if($.isFunction(opt.changed)) opt.changed.apply(txt, [val]);
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change",false,true);
                txt.get(0).dispatchEvent(evt);
                src = (vector > 0 ? spinUpImage : spinDownImage);
                btn.attr('src', src);
                if(opt.timeBlink<opt.timeInterval)
                  setTimeout(function(){btn.attr('src', spinBtnImage);}, opt.timeBlink);
              }
            }
          }
          if(vector > 0){
            if($.isFunction(opt.buttonUp)) opt.buttonUp.apply(txt, [val]);
          }else{
            if($.isFunction(opt.buttonDown)) opt.buttonDown.apply(txt, [val]);
          }
        }

        btn.mousedown(function(e){
          var pos = e.pageY - btn.offset().top;
          var vector = (btn.height()/2 > pos ? 1 : -1);
          (function(){
            spin(vector);
            var tk = setTimeout(arguments.callee, opt.timeInterval);
            $(document).one('mouseup', function(){
              clearTimeout(tk); btn.attr('src', spinBtnImage);
            });
          })();
          return false;
        });
      });
    }
  });
})(jQuery);
