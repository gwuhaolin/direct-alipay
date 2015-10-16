'use strict';
var express = require('express');
var alipay = require('../index');
var app = express();
alipay.config({
    seller_email: 'jyjjh@mail.ccnu.edu.cn',
    partner: '2088911275465084',
    key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
    return_url: 'http://127.0.0.1:3000/return'
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/', function (req, res) {
    var params = req.body;
    params.out_trade_no = Date.now().toString();
    var url = alipay.buildDirectPayURL(params);
    res.redirect(url);
});

app.get('/pay', function (req, res) {
    var url = alipay.buildDirectPayURL({
        out_trade_no: 'out_trade_no',
        subject: 'subject',
        body: 'body',
        total_fee: '1'
    });
    console.log(url);
    res.redirect(url);
});

app.get('/return', function (req, res) {
    var params = req.query;
    alipay.verity(params, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            if (result === true) {
                res.reply('支付成功');
                //该通知是来自支付宝的合法通知
            }
        }
    });
    res.end('');
});

app.listen(3000);
