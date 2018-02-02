$(function (){

  $.ajaxSetup({cache: true });

  $.fn.togglePlaceholder = function() {
    return this.each(function() {
      $(this)
        .data("holder", $(this).attr("placeholder"))
        .focusin(function(){
          $(this).attr('placeholder','');
        })
        .focusout(function(){
          $(this).attr('placeholder',$(this).data('holder'));
        });
    });
  }

  $.fn.doScroll = function (option) {
    return this.each(function() {
      var $parent = $(this);
      setInterval(function () {
        var $first = $parent.find(':first');
        var height = $first.height;
        $first.animate({
          marginTop: -height + 'px'
        }, 500, function() {
          $first.css('marginTop', 0).appendTo($parent);
        });
      }, option && option.speed ? option.speed: 2000);
    });
  }

  $.extend({

    loadScripts: function (scriptUrls) {
      var dfd = $.Deferred();
      var urls = scriptUrls;
      var loop = function (urls) {
        if( !urls || urls.length == 0) {
          return dfd.resolve();
        };
        var currentUrl = urls.shift();
        if($.isArray(currentUrl)){
          console.log('begin load '+currentUrl.join(', '))
          $.when.apply($, $.map(currentUrl,function (item) {
            return $.getScript(item);
          })).always(function () {
            loop(urls);
          })
        }else{
          console.log('begin load '+currentUrl)
          $.getScript(currentUrl).always(function () {
            loop(urls)
          })
        }
      }
      loop(urls);
      return dfd.promise();
    },

    loadCss: function (cssUrls) {
      var dfd = $.Deferred();
      var urls = cssUrls;
      var loop = function (urls) {
        if( !urls || urls.length == 0) {
          return dfd.resolve();
        };
        var currentUrl = urls.shift();
        if($.isArray(currentUrl)){
          console.log('begin load '+currentUrl.join(', '));
          $.when.apply($, $.map(currentUrl,function (item) {
            return $("head").append("<link rel='stylesheet' type='text/css' href='"+item+"' />");
          })).always(function () {
            loop(urls);
          })
        }else{
          console.log('begin load '+currentUrl);
          $("head").append("<link rel='stylesheet' type='text/css' href='"+currentUrl+"' />");
          loop(urls)
        }
      }
      loop(urls);
      return dfd.promise();
    },

    s5_configs: function (callbacks) {
      return $.get('/api/configs?'+Date.now())
        .then(function (config) {
          if($.isArray(callbacks)){
            return $.when.apply($,$.map(callbacks,function (cb) {
              return cb(config)
            }));
          }else if (callbacks) {
            return callbacks(config)
          }
        })
    },

    loadMobiscroll: function (config) {
      var v = 1000;
      return $.when(
        $.loadCss([config.CDN_SERVER+'/common/mobiscroll.2.13.2.css?'+v]),
        $.loadScripts([config.CDN_SERVER+'/common/mobiscroll.2.13.2.js?'+v])
      );
    },

    loadCalendar: function (config) {
      var v = 1000;
      return $.when(
        $.loadCss([config.CDN_SERVER+'/common/calendar.css?'+v]),
        $.loadScripts([config.CDN_SERVER+'/common/calendar.min.js?'+v])
      );
    },

    loadLodash: function () {
      return $.loadScripts(['http://cdn.bootcss.com/lodash.js/4.17.4/lodash.min.js'])
    },

    loadMoment: function () {
      return $.loadScripts(['http://cdn.bootcss.com/moment.js/2.18.1/moment.min.js'])
    },

    loadHandlebars: function () {
      return $.loadScripts(['//cdn.bootcss.com/handlebars.js/4.0.10/handlebars.min.js'])
    },

    loadJqConfirm: function () {
      return $.when(
        $.loadCss(['//cdn.bootcss.com/jquery-confirm/3.3.0/jquery-confirm.min.css']),
        $.loadScripts(['//cdn.bootcss.com/jquery-confirm/3.3.0/jquery-confirm.min.js'])
      );
    },

    loadJqForm: function () {
      return $.loadScripts(['http://cdn.bootcss.com/jquery.form/4.2.1/jquery.form.min.js'])
    },

    loadLoadingoverlay: function () {
      return $.loadScripts(['/common/loadingoverlay.min.js','/common/loadingoverlay_progress.min.js']);
    },

    loadQrcode: function () {
      return $.loadScripts(['http://cdn.bootcss.com/jquery.qrcode/1.0/jquery.qrcode.min.js'])
    },

    urlParam: function(name){
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
      return results && results.length>0 ? results[1] : null ;
    },

    s5_path_prefix: function () {
      return $('#PATH_LEVEL_ONE').val();
    },
    s5_socket_url: function () {
      return $('#SOCKET_URL').val();
    },
    s5_pay_result_url_mobile: function () {
      return $('#PAY_RESULT_URL_MOBILE').val();
    },
    s5_pay_result_url_pc: function () {
      return $('#PAY_RESULT_URL_PC').val();
    },
    s5_pay_result_url_pc_comp: function () {
      return $('#PAY_RESULT_URL_PC_COMP').val();
    },
    s5_site_type: function () {
      return $('#SITEMAP_TYPE').val();
    },
    s5_pay_result_url: function () {
      return $('#ORDER_CENTER_URL').val();
    },

    s5_init_query: function () {
      $('[init-query]').each(function () {
        $(this).val($.urlParam($(this).attr('init-query')))
      })
    },

    s5_date_time: function(selector){
      var opt = {
        preset: 'datetime',
        minDate: new Date(1960, 3, 10, 9, 22),
        maxDate: new Date(2080, 7, 30, 15, 44),
        stepMinute: 1,
        theme: 'ios7',
        mode:"scroller",
        display:"bottom",
        animate: "",
        dateFormat: 'yy-mm-dd' // 日期格式
      };
      if($.isFunction($.fn.scroller)){
        $(selector).scroller(opt);
      }else{
        $.s5_configs(function (config) {
          $.loadMobiscroll(config).then(function () {
            $(selector).scroller(opt);
          })
        });
      }

    },
    /**
     * Toast
     * @param text
     */
    s5_toast: function (text) {
      var width  = $(window).width();
      if( width >= 800 ){
        $.s5_toast_pc(text);
      }else{
        $.s5_toast_m(text);
      }
    },

    s5_toast_pc: function (text) {
      $.s5_toast_with_option(text,{
        fontSize: 16,
        boxWidth: '35%',
        closeTime: 3000
      })
    },

    s5_toast_m: function (text) {
      $.s5_toast_with_option(text,{
        fontSize: 16,
        boxWidth: '90%',
        closeTime: 3000
      })
    },

    s5_toast_with_option: function (text,option) {
      
      if(!text) return;

      var op = {
        theme: 'dark',
        title: '温馨提示:',
        content: '<p style="font-size: '+option.fontSize+'px">'+text+'</p>',
        boxWidth: option.boxWidth,
        useBootstrap: false,
        autoClose: 'confirmAction|'+option.closeTime,
        buttons: {
          confirmAction: {
            text: '关闭'
          }
        }
      };

      if($.isFunction($.confirm)){
        $.confirm(op);
      }else{
        $.loadJqConfirm().then(function () {
          $.confirm(op);
        })
      }

    },


    ajaxScriptTemplate: function (scriptPropName, replaceFunc) {

      var actionFunc = function () {
        var apiMap = _.reduce($('script['+scriptPropName+']'),function (result, item) {
          var key = JSON.stringify({
              url: $(item).attr('url'),
              query: $(item).attr('query'),
              tpl: $(item).attr('tpl')
            }
          );
          result[key] = result[key] || []
          result[key].push(item)
          return result
        },{})

        _.each(apiMap, function (eles, key) {
          var apiObj = JSON.parse(key)
          var query = ""

          if( apiObj.query === "Y") {
            query = location.search.substring(1)
          }

          $.ajax({
            url: apiObj.url,
            data: query,
            cache: true,
            method: 'get',
            timeout: 6000,
            headers: {
              tpl: apiObj.tpl
            },
            success: function (data) {
              _.each(eles, function (ele) {
                replaceFunc(ele,data)
              })
            },
            error: function () {
              console.error('ajaxDataRender error...')
              _.each(eles, function (ele) {
                $(ele).remove()
              })
            }
          })
        })

      }

      if(window['_']){
        actionFunc();
      }else{
        $.loadLodash().then(actionFunc);
      }

    },

    ajaxDataRender: function () {

      $.ajaxScriptTemplate('ajax-data-render',function (ele,data) {
        var actionFunc = function () {
          var template = Handlebars.compile($('#'+$(ele).attr('tpl')).html());
          $(ele).replaceWith(template(data))
        }
        if(window['Handlebars']){
          actionFunc()
        }else{
          $.loadHandlebars().then(actionFunc)
        }

      })

    },


    ajaxHtml: function () {
      $.ajaxScriptTemplate('ajax-html',function (ele,data) {
        $(ele).replaceWith(data);
      });
    },
    /**
     *
     * 本地订单号历史
     */
    s5_local_orders: function () {
      return JSON.parse(localStorage.getItem('orders') || '[]');
    },
    /**
     * 本地订单号添加
     * @param orderNumber
     */
    s5_local_orders_add: function (orderNumber) {
      var actionFunc = function () {
        if(!localStorage) return;
        var orders = $.s5_local_orders();
        if(! _.includes(orders,orderNumber) ){
          orders.push(orderNumber)
          try {
            localStorage.setItem('orders',JSON.stringify(orders))
          }catch (err){
            console.error(err)
          }

        }
      }

      if(window['_']){
        actionFunc();
      }else{
        $.loadLodash().then(actionFunc);
      }

    },
    /**
     * 本地订单历史
     */
    s5_local_order_info: function () {
      return JSON.parse(localStorage.getItem('order_info') || '[]');
    },
    /**
     * 本地订单表单信息添加
     * @param orderNumber
     */
    s5_local_order_info_add: function (obj) {
      var actionFunc = function () {
        if(!localStorage) return;
        var orders = $.s5_local_order_info();
        if( _.findIndex(orders,function (o) {
            return o.orderNumber == obj.orderNumber
          }) < 0 ){
          orders.push(obj)
          try {
            localStorage.setItem('order_info',JSON.stringify(orders))
          }catch (err){
            console.error(err)
          }
        }
      }
      if(window['_']){
        actionFunc()
      }else{
        $.loadLodash().then(actionFunc)
      }
    },
    /**
     * 提交订单评论
     * @param order
     * @param comment
     */
    s5_order_comment_submit: function () {

      $('#orderCommentForm').on('submit',function (e) {
        e.preventDefault();
        var actionFunc = function () {
          $('#orderCommentForm').ajaxSubmit({
            url: '/api/order/comment/submit',
            type: 'post',
            success: function (data) {
              $.s5_toast(data.M)
            },
            error: function (resp) {
              $.s5_toast(resp.responseText)
            }
          })

        }
        if($.isFunction($.fn.ajaxSubmit)){
          actionFunc()
        }else{
          $.loadJqForm().then(actionFunc)
        }

      })

    },
    /**
     * 订单查询
     * @param order
     * @param comment
     */
    s5_order_query_submit: function (callback,jqele) {

      var form = jqele ? jqele : $('#orderQueryForm')

      callback = callback ? callback : function (orderNumber) {
        location.href = $('#ORDER_CENTER_URL').val()+'/'+orderNumber
      }
      form.on('submit',function (e) {
        e.preventDefault();
        var actionFunc = function () {
          form.ajaxSubmit({
            url: '/api/order/number/validate',
            type: 'get',
            success: function (data) {
              if(data && data.S >0 ){
                callback(form.find('[name=orderNumber]').val())
              }else{
                $.s5_toast(data.M)
              }
            },
            error: function (resp) {
              $.s5_toast(resp.responseText)
            }
          })

        }
        if($.isFunction($.fn.ajaxSubmit)){
          actionFunc();
        }else{
          $.loadJqForm().then(actionFunc);
        }

      })



    },

    /**
     * 订单支付状态跟踪
     * @param orderNumber
     */
    s5_order_follow: function (orderNumber) {

      if(!orderNumber) return;

      window.mySockets = window.mySockets || {}

      var ws = window.mySockets[orderNumber]

      if(!ws){

        var SOCKET_URL = $.s5_socket_url();
        var ws = new WebSocket(SOCKET_URL+'/ws/orders/'+orderNumber);


        console.log('create a new websocket for '+orderNumber);

        ws.onmessage = function(evt) {
          console.log(orderNumber+' : ' + evt.data);
          if(evt.data == 'payed'){ // 支付成功
            ws.onclose();
            location.href = $.s5_pay_result_url()+'/'+orderNumber;
          }
        };

        var keepAlive = null

        ws.onopen = function(evt) {
          console.log("Connection open ...");
          keepAlive = setInterval(function () {
            ws.send("hi");
          },5000)
        };

        ws.onclose = function(evt) {
          console.log('Connection closed.');
          if(keepAlive) clearInterval(keepAlive)
          window.mySockets[orderNumber] = null;
        };

        window.mySockets[orderNumber] = ws;
      }
    },

    /**
     * 下单
     */
    s5_order_submit: function(orderForm,succesCallback,preSubmit){

      orderForm.on('submit',function (e) {
        e.preventDefault()
        if(preSubmit) preSubmit()

        var actionFunc = function () {
          orderForm.ajaxSubmit({
            url: '/api/order/submit-one',
            type: 'post',
            async:false,
            success: function (data) {
              if(data.S >0 ) {
                $.s5_local_orders_add(data.D.orderNumber)
                $.s5_local_order_info_add(data.D)
                if(succesCallback){
                  succesCallback(data.D)
                }else{
                  if(data.D.siteInfo){
                    var siteInfo = JSON.parse(data.D.siteInfo)
                    location.href = $.s5_pay_result_url()+'/'+data.D.orderNumber+'?theme='+siteInfo.theme
                  }else{
                    location.href = $.s5_pay_result_url()+'/'+data.D.orderNumber
                  }
                }

              }else{
                $.s5_toast(data.M)
              }

            },
            error: function (resp) {
              $.s5_toast(resp.responseText)
            }
          })

        }

        if($.isFunction($.fn.ajaxSubmit)){
          actionFunc();
        }else{
          $.loadJqForm().then(actionFunc);
        }

      })

    },


    /**
     * 支付表单提交
     */
    s5_pay_submit: function (payForm,successCallback,preSubmit) {

      payForm.on('submit', function (e) {
        e.preventDefault();
        if (preSubmit) preSubmit();

        var actionFunc = function () {

          payForm.ajaxSubmit({
            url: '/api/pay/submit',
            type: 'post',
            async: false,
            success: function (data) {
              $.s5_order_follow($('#orderNumber').val())
              successCallback(data)
            },
            error: function (resp) {
              $.s5_toast(resp.responseText)
            }
          });

        }

        if ($.isFunction($.fn.ajaxSubmit)) {
          actionFunc();
        } else {
          $.loadJqForm().then(actionFunc);
        }
      });

    },

    s5_placeholder: function () {
      $("[placeholder]").togglePlaceholder();
    },

    s5_qrcode: function (selector, optioin) {
      var actionFunc = function () {
        $(selector).qrcode(optioin);
      }
      if($.isFunction($.fn.qrcode)){
        actionFunc();
      }else{
        $.loadQrcode().then(actionFunc);
      }
    },

    s5_ajaxSubmit: function (jqele,optioin) {
      var actionFunc = function () {
        return jqele.ajaxSubmit(optioin);
      }
      if($.isFunction($.fn.ajaxSubmit)){
        return actionFunc();
      }else{
        return $.loadJqForm().then(actionFunc);
      }
    },
    
    s5_confirm: function (optioin) {
      var actionFunc = function () {
        $.confirm(optioin);
      }
      if($.isFunction($.confirm)){
        actionFunc();
      }else{
        $.loadJqConfirm().then(actionFunc);
      }
    },

    s5_gotourl: function (url) {
      var a = $('<a href="'+ url +'" target="_blank">链接</a>');  //生成一个临时链接对象
      var d = a.get(0);
      var e = document.createEvent('MouseEvents');
      e.initEvent( 'click', true, true );  //模拟点击操作
      d.dispatchEvent(e);
      a.remove();   // 点击后移除该对象
    },

    s5_bindAnchor: function () {
      $(document).on('click','[href^="#"]',function (e) {
        e.preventDefault()
        $('html, body').animate({
          scrollTop: $($(this).attr('href')).offset().top
        }, 2000);
      })
    }

  });


  $.loadLoadingoverlay().then(function () {

    $(document).ajaxStart(function(){
      $.LoadingOverlay("show");
    });
    $(document).ajaxStop(function(){
      $.LoadingOverlay("hide");
    });

    $.ajaxHtml();
    $.ajaxDataRender();
    $.s5_placeholder();


  });




})