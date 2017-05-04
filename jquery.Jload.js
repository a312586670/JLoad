/**
+-------------------------------------------------------------------
* jQuery Grid - 下拉分页列表Jquery插件 - http://www.9126.org/
+-------------------------------------------------------------------
* @version 1.0.0
* @since 2014/08/11
* @author xhl <supper@9126.org> <http://www.9126.org/>
+-------------------------------------------------------------------
*/
var _defaultid = new Date().getTime();
//var _htmlLoad = "<div class=\"" + _defaultid + " jackson-jload\" style=\"height:30px;text-align:center;color:#808080; line-height:30px; width:100%;\"><span>正在载入...</span></div>";

var _htmlLoad = "<div class=\"" + _defaultid + "\" style=\"height: 40px; z-index: 8888;position:absolute; margin-top:-40px; left:0px;margin-left:0px; padding-left:0px;   width: 100%; background-color: rgba(0, 0, 0, 0.498039);\">" +
                    "<div style=\"margin-top: 10px; margin-left: -53px;left: 50%;position: absolute;\">" +
                "<img style=\"float: left; display: block; vertical-align: central\" width=\"20px\" src=\"{images}\">" +
                "<span style=\"font-size: 18px; color: #fff\">{msg}</span>" +
                "</div></div>";

var _htmlComplete = "<div class=\"" + _defaultid + " jackson-jload\" style=\"height:30px;text-align:center; color:#808080; line-height:30px; width:100%;\">已全部加载</div>";
var Jload = {};
(function ($) {
    $.extend(Jload, {
        createLoad: function (options,html) {
            if ($("." + _defaultid).length > 0) {
                //alert(options.label.css("bottom"));
                $("." + _defaultid).show();
            }
            else {
                //alert(options.label.css("bottom"));
                options.label.after(html);
            }
        },
        resolveTemplete: function (json, templete) {
            var _html = templete;
            for (var key in json) {
                //var _old=/{key}/g;
                var _old = "{" + key + "}";
                var re = new RegExp(_old, "gm");
                var arr = _html.match(re);
                if (arr != null && typeof arr != 'undefined' && arr.length>0) {
                    for (var i = 0; i < arr.length; i++) {
                        _html = _html.replace(_old, json[key]);
                    }
                }
            }
            return _html;
        },
        Ajax: function (options,callback) {
            //eval(options.Loading);
            if (typeof options.onLoading === 'function') { options.onLoading() }
            $.ajax({
                type: options.method,
                dataType: options.dataType,
                url: options.url,//提交到一般处理程序请求数据
                data: options.data,
                async: true,
                success: function (data) {
                    options.data.page++;
                    if (data.PageIndex == 1) {//初次加载
                        options.pageIndex++;
                        if (typeof options.callback === 'function')
                            options.callback(data);
                        else {
                            if (data != null && data.Rows != null && data.Rows.length > 0) {
                                if (options.isArtTemplete)//使用模版引擎
                                {
                                    var _templateScriptBoxhtml = options.Templete;
                                    var render = template.compile(_templateScriptBoxhtml);
                                    var _temHtml = render(data);
                                    options.label.html(_temHtml)
                                }
                                else {
                                    var html = "";
                                    for (var i = 0; i < data.Rows.length; i++) {
                                        html += Jload.resolveTemplete(data.Rows[i], options.Templete);
                                    }
                                    options.label.html(html);
                                }
                            }
                            else {
                                options.label.html(options.noneTemplete);
                            }
                        }
                        if (data != null && data.Rows != null) {
                            if (data.Rows.length >= data.PageSize) {
                                $(window).bind("scroll", function () {
                                    Jload.nextPage(options,callback);
                                })
                            } else {
                                //options.label.append(_htmlLoad);
                                Jload.createLoad(options,_htmlLoad);
                                //options.label.after(_htmlLoad);
                                $(window).unbind("scroll");
                            }
                        }
                    } else {//下一页加载
                        options.pageIndex++;
                        if (data != null && data.Rows != null && data.Rows.length > 0) {
                            var html = "";
                            if (data != null && data.Rows != null && data.Rows.length > 0) {
                                if (options.isArtTemplete)//使用模版引擎
                                {
                                    var _templateScriptBoxhtml = options.Templete;
                                    var render = template.compile(_templateScriptBoxhtml);
                                    html = render(data);
                                }
                                else {
                                    for (var i = 0; i < data.Rows.length; i++) {
                                        html += Jload.resolveTemplete(data.Rows[i], options.Templete);
                                    }
                                }
                            }
                            options.label.append(html)
                            var scorllDom = $(window);
                            if (options.scorllBox != '')
                                scorllDom = $("#" + options.scorllBox);
                            if (data.PageIndex < data.PageCount) {
                                scorllDom.bind("scroll", function () {
                                    Jload.nextPage(options,callback);
                                })
                            }
                            else {
                                _htmlLoad = Jload.resolveTemplete({ images: options.msgImg, msg: "已加载全部" }, _htmlLoad);
                                //options.label.append(_htmlLoad);
                                //options.label.after(_htmlLoad);
                                Jload.createLoad(options, _htmlLoad);
                                scorllDom.unbind("scroll");
                            }
                        }
                        else {
                            _htmlLoad = Jload.resolveTemplete({ images: options.msgImg, msg: "已加载全部" }, _htmlLoad);
                            //options.label.append(_htmlLoad);
                            //options.label.after(_htmlLoad);
                            Jload.createLoad(options,_htmlLoad);
                        }
                    }
                    $("." + _defaultid).remove();
                    if (typeof callback == "function") {
                        callback(data);
                    }
                },
                error: options.error
            });
        },
        nextPage: function (option, callback) {
            var viewH = $(window).height(),  //可见高度
               contentH = $(document).height(), //内容实际高度//
               scrollTop = $(window).scrollTop(); //滚动条可滚动的距离
            if (contentH - viewH == scrollTop) {
                _htmlLoad = Jload.resolveTemplete({ images: option.msgImg, msg: "正在加载..." }, _htmlLoad);
                //option.label.append(_htmlLoad);
                Jload.createLoad(option, _htmlLoad);
                var scorllDom = $(window);
                if (option.scorllBox != '')
                {
                    scorllDom = $("#" + option.scorllBox);
                }
                scorllDom.unbind("scroll");
                Jload.Ajax(option, callback);
            }
        }
    });
    $.fn.Jload = function (options,callback) {
        var $element = $(this);
        var settings = {
            pageIndex: 1,
            url: "",//接口数据URL
            method: "POST",//请求方式POST|GET
            data: { page:1, pagesize:20 },//请求参数,
            label: $element,//绑定数据标签
            Templete: "",//绑定数据模版
            dataType: "json",
            msgImg:"./img/loading_cart.gif",//加载图片
            isArtTemplete:false,//是否使用artTemplate模版引擎
            noneTemplete:"<div style='text-align:center;'>没有数据</div>",//没有数据模版.
            callback: "",
            scorllBox:"",
            onLoading: function () { },//加载友好显示
            error: function () { },
        };
        var ops = $.extend(settings, options);
        Jload.Ajax(ops, callback);
    }
})(jQuery);
