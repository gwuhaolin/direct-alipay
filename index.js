'use strict';
var https = require('https');
var crypto = require('crypto');
var querystring = require('querystring');

var _basicConfig = {
    alipay_gateway: 'https://mapi.alipay.com/gateway.do?',
    //字符编码格式
    _input_charset: 'UTF-8',
    //签名方式 不需修改
    sign_type: 'MD5'
};

/**
 * https GET 对应的url
 * @param url 要请求的url
 * @param callback (error,data)
 */
function _requestUrl(url, callback) {
    var req = https.get(url, function (res) {
        res.on('data', function (data) {
            callback(null, data);
        });
    });
    req.on('error', function (err) {
        callback(err);
    });
    req.end();
}

/**
 * 计算签名
 * @param json
 * @returns {string}
 */
function _buildSign(json) {
    var keys = Object.keys(json);
    keys = keys.sort();
    var map = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key !== 'sign' && key !== 'sign_type' && json[key]) {
            map[key] = json[key];
        }
    }
    var str = querystring.unescape(querystring.stringify(map)) + _basicConfig.key;
    return crypto.createHash(_basicConfig.sign_type).update(str, _basicConfig._input_charset).digest('hex');
}

/**
 * 配置
 * @param params
 * {
 *  seller_email:签约支付宝账号或卖家收款支付宝帐户
 *  partner:合作身份者ID，以2088开头由16位纯数字组成的字符串
 *  key:交易安全检验码，由数字和字母组成的32位字符串
 *  notify_url:支付宝服务器通知的页面
 *  return_url:支付后跳转后的页面
 * }
 */
exports.config = function (params) {
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            _basicConfig[key] = params[key];
        }
    }
};

/**
 * 使用订单参数构造一个支付请求
 * @param orderParams 订单参数
 * {
 *  body:订单描述、订单详细、订单备注，显示在支付宝收银台里的“商品描述”里
 *  out_trade_no:你的网站订单系统中的唯一订单号匹配
 *  subject:订单名称显示在支付宝收银台里的“商品名称”里，显示在支付宝的交易管理的“商品名称”的列表里。
 *  total_fee:订单总金额，显示在支付宝收银台里的“应付总额”里
 * }
 * @returns {string} 支付宝支付请求URL 浏览器跳转到该url支付
 */
exports.buildDirectPayURL = function (orderParams) {
    var json = {};
    //basic
    json.service = 'create_direct_pay_by_user';
    json._input_charset = _basicConfig._input_charset;
    json.notify_url = _basicConfig.notify_url;
    json.partner = _basicConfig.partner;
    json.return_url = _basicConfig.return_url;
    json.seller_email = _basicConfig.seller_email;
    //order
    json.payment_type = '1';
    json.body = orderParams.body;
    json.out_trade_no = orderParams.out_trade_no;
    json.subject = orderParams.subject;
    json.total_fee = orderParams.total_fee;
    //加入签名结果与签名方式
    json.sign = _buildSign(json);
    json.sign_type = _basicConfig.sign_type;
    return _basicConfig.alipay_gateway + querystring.stringify(json);
};

exports.verity = function (params, callback) {
    var paramsSign = params.sign;
    var buildSign = _buildSign(params);
    if (paramsSign === buildSign) {
        var urlParams = {
            service: 'notify_verify',
            partner: _basicConfig.partner,
            notify_id: params['notify_id']
        };
        var url = _basicConfig.alipay_gateway + querystring.stringify(urlParams);
        _requestUrl(url, function (err, data) {
            if (err) {
                callback(err);
            } else {
                if (data == 'true') {
                    callback(null, true);
                } else {
                    callback('error:验证失败');
                }
            }
        });
    } else {
        callback('error:sign验证不通过');
    }
};