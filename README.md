#支付宝 即时到账 NodeJS包
###开始使用
1.安装

    npm install direct-alipay    
    
2.配置支付宝参数
   
    var alipay = require('direct-alipay');
    alipay.config({
        seller_email: 'jyjjh@mail.ccnu.edu.cn',
        partner: '2088911275465084',
        key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
        notify_url: 'http://127.0.0.1:3000/notify',
        return_url: 'http://127.0.0.1:3000/'
    });    
    
参数说明见[官方文档](https://openhome.alipay.com/platform/document.htm#webApp-directPay-API-direct)
    
3.传入订单参数,生成支付跳转URL
   
    var url = alipay.buildDirectPayURL({
        out_trade_no: 'out_trade_no',
        subject: 'subject',
        body: 'body',
        total_fee: '1'
    });
   
4.引导用户跳转到获得的URL，跳转到支付宝支付界面

    window.location.href = url;
    
5.用户支付完毕后,支付宝会发生通知到第2步配置的notify_url，在这里来判断订单是否成功支付
 
    app.get('/notify', function (req, res) {
        var params = req.query;
        console.log(params);
        alipay.verity(params, function (err, result) {
            if (err) {
                console.error(err);
            } else {
            console.log(result);
            }
        });
        res.end('');
    });