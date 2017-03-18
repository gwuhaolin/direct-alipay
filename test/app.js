'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var alipay = require('../index');
var app = express();
alipay.config({
    seller_email: 'jyjjh@mail.ccnu.edu.cn',
    partner: '2088911275465084',
    key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
    return_url: 'http://127.0.0.1:3000/return'
});

// index.html
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.post('/', function (req, res) {
    var params = req.body;
    // 业务侧需要为每个订单生成一个唯一订单号
    params.out_trade_no = Date.now().toString() + Math.random();
    var url = alipay.buildDirectPayURL(params);
    res.redirect(url);
});

// 点击链接直接给华中师范大学贫困学生付款一元 的跳转链接
app.get('/pay', function (req, res) {
    var url = alipay.buildDirectPayURL({
        out_trade_no: Date.now().toString() + Math.random(),//业务侧需要为每个订单生成一个唯一订单号
        subject: '给华中师范大学贫困学生的捐赠',//订单标题
        body: 'body',
        total_fee: '1'//订单金额，单位元
    });
    console.log(url);
    res.redirect(url);
});

app.get('/return', function (req, res) {
    var params = req.query;
    alipay.verify(params, function (err, result) {
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
