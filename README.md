[![Npm Package](https://img.shields.io/npm/v/direct-alipay.svg?style=flat-square)](https://www.npmjs.com/package/direct-alipay)
[![Npm Downloads](http://img.shields.io/npm/dm/direct-alipay.svg?style=flat-square)](https://www.npmjs.com/package/direct-alipay)
[![Dependency Status](https://david-dm.org/gwuhaolin/direct-alipay.svg?style=flat-square)](https://npmjs.org/package/direct-alipay)

# 支付宝 即时到账 NodeJS包 [demo](http://ccnu-aa.leanapp.cn/)

## 集成到你的项目

#### 1.安装
```bash
    npm install direct-alipay
```    

#### 2.配置支付宝参数
```js
    var directAlipay = require('direct-alipay');
    directAlipay.config({
        seller_email: 'jyjjh@mail.ccnu.edu.cn',
        partner: '2088911275465084',
        key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
        return_url: 'http://127.0.0.1:3000/return'
    }); 
```   
    
参数说明见[支付宝官方文档](https://openhome.alipay.com/platform/document.htm#webApp-directPay-API-direct)
    
#### 3.传入订单参数,生成支付跳转URL
```js
    var url = directAlipay.buildDirectPayURL({
        out_trade_no: Date.now().toString() + Math.random(),//业务侧需要为每个订单生成一个唯一订单号
        subject: '给华中师范大学贫困学生的捐赠',//订单标题
        body: 'body',
        total_fee: '1'//订单金额，单位元
    });
```
   
#### 4.引导用户跳转到获得的URL，跳转到支付宝支付界面
```js
    window.location.href = url;
```

#### 5.用户支付完毕后,会跳转到第2步配置的return_url，在这里来判断订单是否成功支付
```js
    app.get('/return', function (req, res) {
        var params = req.query;
        directAlipay.verity(params).then(function() {
                  //该通知是来自支付宝的合法通知
        }).catch(function(err) {
            console.error(err);
        });
    });
```
    
支付宝回调通知见[官方文档](https://openhome.alipay.com/platform/document.htm#webApp-transPay-transpay-notify)

## 运行Demo
仔细`npm start`后，用浏览器打开`http://localhost:3000`

## 文档

##### `directAlipay`
所有方法的入口
```js
    var directAlipay = require('direct-alipay');
```

##### `directAlipay.config(params)`
配置支付宝基础配置，在使用前先配置.
```js
    directAlipay.config({
        //签约支付宝账号或卖家收款支付宝帐户
        seller_email: 'jyjjh@mail.ccnu.edu.cn',
        //合作身份者ID，以2088开头由16位纯数字组成的字符串
        partner: '2088911275465084',
        //交易安全检验码，由数字和字母组成的32位字符串
        key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
        //支付宝服务器通知的页面
        notify_url: 'http://127.0.0.1:3000/notify',
        //支付后跳转后的页面
        return_url: 'http://127.0.0.1:3000/'
    }); 
```     
    
其它配置参数见[官方文档](https://openhome.alipay.com/platform/document.htm#webApp-directPay-API-direct)

##### `directAlipay.buildDirectPayURL(params)`
使用订单参数构造一个支付请求
```js
    directAlipay.buildDirectPayURL({
        out_trade_no: '你的网站订单系统中的唯一订单号匹配',
        subject: '订单名称显示在支付宝收银台里的“商品名称”里，显示在支付宝的交易管理的“商品名称”的列表里',
        body: '订单描述、订单详细、订单备注，显示在支付宝收银台里的“商品描述”里',
        total_fee: '订单总金额'
    });
```

返回支付宝支付请求URL 浏览器跳转到该url支付

##### `directAlipay.verity(params)`
验证来自支付宝的通知是否合法
```js
    app.get('/notify', function (req, res) {
        var params = req.body;
        directAlipay.verity(params).then(function() {
          //该通知是来自支付宝的合法通知
        }).catch(function(err) {
          console.error(err);
        })
    });
```
