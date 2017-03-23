'use strict';
var https = require('https');
var crypto = require('crypto');
var querystring = require('querystring');

var basicConfig = {
    alipay_gateway: 'https://mapi.alipay.com/gateway.do?',
    //字符编码格式
    _input_charset: 'UTF-8',
    //签名方式 不需修改
    sign_type: 'MD5'
};

/**
 * https GET 对应的url
 * @param url  @param url 要请求的url
 * @returns {Promise}
 */
function httpsGET(url) {
    return new Promise(function (resolve, reject) {
        var req = https.get(url, function (res) {
            res.on('data', function (data) {
                resolve(data);
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
        req.end();
    });
}

/**
 * 计算签名
 * @param json
 * @returns {string}
 */
function buildSign(json) {
    var keys = Object.keys(json);
    keys = keys.sort();
    var map = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key !== 'sign' && key !== 'sign_type' && json[key]) {
            map[key] = json[key];
        }
    }
    var str = querystring.unescape(querystring.stringify(map)) + basicConfig.key;
    return crypto.createHash(basicConfig.sign_type).update(str, basicConfig._input_charset).digest('hex');
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
    Object.assign(basicConfig, params);
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
    var json = {
        service: 'create_direct_pay_by_user',
        payment_type: '1',
        _input_charset: basicConfig._input_charset,
        notify_url: basicConfig.notify_url,
        partner: basicConfig.partner,
        return_url: basicConfig.return_url,
        seller_email: basicConfig.seller_email
    };
    Object.assign(json, orderParams);
    //加入签名结果与签名方式
    json.sign = buildSign(json);
    json.sign_type = basicConfig.sign_type;
    return basicConfig.alipay_gateway + querystring.stringify(json);
};

/**
 * 验证来自支付宝的通知是否合法
 * @param params 来自支付宝的通知参数
 * @returns {Promise} 验证通过时resolve，失败时reject
 */
exports.verify = function (params) {
    return new Promise(function (resolve, reject) {
        var paramsSign = params.sign;
        var realSign = buildSign(params);
        if (paramsSign === realSign) {
            var url = basicConfig.alipay_gateway +
                querystring.stringify({
                    service: 'notify_verify',
                    partner: basicConfig.partner,
                    notify_id: params['notify_id']
                });
            httpsGET(url).then(function (data) {
                if (data.toString() === 'true') {
                    resolve(true);
                } else {
                    reject('来自alipay接口的结果为:验证结果不合法');
                }
            }).catch(function (err) {
                reject('请求alipay接口发生网络错误:' + JSON.stringify(err))
            });
        } else {
            reject('sign验证不相等: ' + paramsSign + ' !== ' + realSign);
        }
    });
};
