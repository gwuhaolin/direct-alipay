var assert = require('assert');
var alipay = require('../index');

describe('alipay.js', function () {

    before(function () {
        alipay.config({
            seller_email: 'jyjjh@mail.ccnu.edu.cn',
            partner: '2088911275465084',
            key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
            notify_url: 'http://127.0.0.1:3000/notify',
            return_url: 'http://127.0.0.1:3000/'
        })
    });

    it('#buildDirectPayURL', function () {
        var url = alipay.buildDirectPayURL({
            out_trade_no: 'out_trade_no',
            subject: 'subject',
            body: 'body',
            total_fee: '1'
        });
        assert.equal(url, 'https://mapi.alipay.com/gateway.do?service=create_direct_pay_by_user&_input_charset=UTF-8&notify_url=http%3A%2F%2F127.0.0.1%3A3000%2Fpaynotify&partner=2088911275465084&return_url=http%3A%2F%2F127.0.0.1%3A3000%2Fpayreturn&seller_email=jyjjh%40mail.ccnu.edu.cn&payment_type=1&body=body&out_trade_no=out_trade_no&subject=subject&total_fee=1&sign=71aac6a20c3025e74ae1be718561f3f3&sign_type=MD5');
    })
});