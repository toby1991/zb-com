# zb.com API Wrapper


A node.js wrapper for the [REST APIs](https://www.zb.com/i/developer) exposed by bitcoin exchange [zb.com](https://zb.com).
You will need to have a registered account with [zb.com](https://zb.com) and generated API keys to access the private methods.

Please contact support@zb.com if you are having trouble opening an account or generating an API key.

A node.js wrapper for the [REST APIs](https://www.zb.com/i/developer) exposed by bitcoin exchange [zb.com](https://zb.com).
You will need to have a registered account with [zb.com](https://zb.com) and generated API keys to access the private methods.

Please contact support@zb.com if you are having trouble opening and account or generating an API key.

### Install

`npm install zb-com`

```js
var zb.com = require('zb-com');

// Test public data APIs
var publicClient = new ZB();

// get BTCUSDT ticker
publicClient.getTicker(console.log, 'btc_usdt');

// get BTCUSDT order book
publicClient.getDepth(console.log, 'btc_usdt');

// get BTCUSDT trades
publicClient.getTrades(console.log, 'btc_usdt');

// replace the parameters with your API key and secret
var privateClient = new ZB('your-api-key', 'your-api-secret');

privateClient.getUserInfo(console.log);

// buy limit order for 0.01 BTC at price 4000 USDT
privateClient.createOrder(console.log, 'btc_usdt', 'buy', '0.01', '4000');

```
