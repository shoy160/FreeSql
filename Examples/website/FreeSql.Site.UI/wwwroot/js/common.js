﻿
(function (window) {

    window.base = function () { };

    base.prototype = {
        showLoading: function (obj) {
            var index = layer.msg(obj.msg, {
                icon: 16,
                shade: 0.1,
                shadeClose: false,
            });
            return index;
        },
        closeLoading: function (index) {
            layer.close(index);
        },
        showMessage: function (options) {
            if (layer == null) {
                alert(options.msg);
                return;
            }
            var yes = function (index) {
                if ($.isFunction(options.yes)) {
                    options.yes();
                }
                layer.close(index);
            };
            layer.alert(options.msg || "操作成功", {
                icon: options.type || 1,
                scrollbar: false,
                shadeClose: false,
                closeBtn: 0,
                skin: 'layui-layer-lan'//'layer-ext-moon'
            }, yes);
        },
        //options={title:"标题",msg:"内容",yes:function,no:function}
        showConfirm: function (options) {
            if (options == null || options.msg == null) {
                return;
            }
            var yes = options.yes;
            var no = options.no;
            var defaultAction = function (index) {
                layer.close(index);
            };
            if (yes == null) {
                yes = defaultAction;
            }
            if (no == null) {
                no = defaultAction
            }
            ////layer.confirm(options.msg, yes, options.title, no);
            //layer.confirm(options.msg, { btn: ['确定', '取消'] }, yes, no);
            layer.confirm(options.msg, {
                btn: ['确定', '取消'], //按钮
                icon: 3,
                shadeClose: false,
                skin: 'layer-ext-moon'
            }, yes, no);
        },
        markDownEdit: function (id, option) {
            var _option = $.extend({
                width: "96%",
                height: 640,
                syncScrolling: "single",
                path: "../../lib/editormd/lib/"
            }, options);
            return editormd(id, _option);
        },
        ajax: function (url, appendPostData, beforeFn, completeFn, successFn, errorFn, isShowLoading) {
            jQuery.ajax({
                type: "POST",
                url: url,
                data: appendPostData,
                global: false,
                beforeSend: function (XMLHttpRequest) {
                    if (jQuery.isFunction(beforeFn)) {
                        if (beforeFn(XMLHttpRequest)) {
                            if (isShowLoading != false) {
                                freejs.showLoading();
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        if (isShowLoading != false) {
                            freejs.showLoading();
                        }
                    }
                },
                success: function (data, textStatus) {
                    if (jQuery.isFunction(successFn)) {
                        successFn(data, textStatus);
                    }
                },
                complete: function (XMLHttpRequest, textStatus) {
                    var gohome = XMLHttpRequest.getResponseHeader("Timeout");
                    if (gohome) {
                        // window.top.window.location.href = gohome;
                        return false;
                    }
                    if (isShowLoading != false) {
                        freejs.hideLoading();
                    }
                    if (jQuery.isFunction(completeFn)) {
                        completeFn();
                    }
                },
                error: function (e, d, s, u, b) {
                    if (jQuery.isFunction(errorFn)) {
                        errorFn(e, d, s);
                    }
                    else {
                        freejs.showMessage({
                            title: "发生异常",
                            type: 2,
                            msg: s
                        });
                    }
                }
            });
        },
        dialogWindow: {
            /*
            url: "/Admin/Document/DocContentEditModule",   //页面地址
            paramters: { id: "" },                         //参数
            -------------------------------------------------------
            title: "新增文档",                             //标题
            area: ['1100px', '660px'],                     //尺寸
            submit: {                                      //提交参数
                url: "/Admin/Document/DocContentCreate",   //   提交的地址
            },                                             //
            callback: reloadTable                          //执行完成回调函数
             */
            create: function (options, formpage) {
                $("#docContentEdit").load(options.url, options.paramters, function (responseText, textStatus, jqXHR) {
                    switch (textStatus) {
                        case "success":
                            freejs.dialogWindow.open($.extend({
                                type: 1,
                                maxmin: true,
                                title: "编辑",
                                area: ['1100px', '660px'],
                                shadeClose: false, //点击遮罩关闭
                                content: responseText,
                                submit: {
                                    url: "/Admin/Document/DocContentCreate",
                                }
                            }, options), form);
                            break;
                        case "error":
                            freejs.showMessage({ title: "提示", msg: "页面加载失败", type: 2 });
                            break;
                    }
                });
            },
            /*
            {
                type: 1,
                maxmin: true,
                title: "编辑",
                area: ['1100px', '660px'],
                shadeClose: false, //点击遮罩关闭
                content: responseText,
                submit: {
                    url: "/Admin/Document/DocContentCreate",
                }
            }
             */
            open: function (options, form) {
                var base_options = {
                    type: 1,
                    maxmin: true,
                    title: "编辑",
                    area: ['1100px', '660px'],
                    shadeClose: false //点击遮罩关闭
                };
                var new_options = $.extend(base_options, options);
                new_options.success = function (layero, index) {
                    form.render();
                    $(".form-module-content").height(dialog_Paramters.height - 110);
                    contentEdit = editormd("md_DocContent", {
                        width: "96%",
                        height: 640,
                        syncScrolling: "single",
                        path: "../../lib/editormd/lib/"
                    });
                    //监听提交
                    form.on('submit(formDemo)', function (data) {
                        $.ajax({
                            type: 'POST',
                            url: options.submit.url,//"/Admin/Document/DocContentCreate",
                            data: JSON.stringify(data.field),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (e) {
                                if (e.Status == 1) {
                                    freejs.showMessage({ title: "提示", msg: e.Msg || "保存成功", type: 1 });
                                    if ($.isFunction(new_options.callback)) new_options.callback();
                                    layer.close(index);
                                }
                                else {
                                    freejs.showMessage({ title: "提示", msg: e.Msg, type: 2 });
                                }
                            }
                        });
                        return false;
                    });
                }
                layer.open(new_options);
            },
            close: function () {
            }
        }
    };
    window.freejs = new base();

    /**
     * 数组扩展
     * @param {any} func
     */
    Array.prototype.select = function (func) {
        var retValues = [];
        if (this.length == 0) {
            return retValues;
        }
        if (func == null) {
            return this;
        }
        for (var i = 0; i < this.length; i++) {
            retValues.push(func(this[i]));
        }
        return retValues;
    };
    Array.prototype.where = function (func) {
        if (func == null) {
            return this;
        }
        var retList = [];
        for (var i = 0; i < this.length; i++) {
            if (func(this[i]) != false) {
                retList.push(this[i]);
            }
        }
        return retList;
    }
})(window);