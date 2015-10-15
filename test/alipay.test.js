var assert = require('assert');
var querystring = require('querystring');
var alipay = require('../index');

describe('alipay.js', function () {

    before(function () {
        alipay.config({
            seller_email: 'jyjjh@mail.ccnu.edu.cn',
            partner: '2088911275465084',
            key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
            notify_url: 'http://127.0.0.1:3000/notify'
        })
    });

    it('#buildDirectPayURL', function () {
        var url = alipay.buildDirectPayURL({
            out_trade_no: 'out_trade_no',
            subject: 'subject',
            body: 'body',
            total_fee: '1'
        });
        var sign = querystring.parse(url.split('?')[1])['sign'];
        assert.equal(sign, 'e135712a2e345760594831d16124f1b7');
    })
});