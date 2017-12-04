var ZB = require('zb-com');

// Test public data APIs
var publicClient = new ZB();

// get BTCUSDT ticker
//publicClient.getTicker(logResponse, 'btc_usdt');

// get BTCUSDT order book
//publicClient.getDepth(logResponse, 'btc_usdt', 50, 0.01);
//
// get LTCCNY trades
//publicClient.getTrades(logResponse, 'btc_usdt');
//
// get trades since trade id 2209328
//publicClient.getTrades(logResponse, 'btc_usdt', 1778903);

// Either pass your API key and secret as the first and second parameters to examples.js. eg
// node examples.js your-api-key your-api-secret
//
// Or enter them below.
// WARNING never commit your API keys into a public repository.
var key = process.argv[2] || 'your-api-key';
var secret = process.argv[3] || 'your-api-secret';

var privateClient = new ZB(key, secret);

// uncomment the API you want to test.
// Be sure to check the parameters so you don't do any unwanted live trades

//privateClient.getUserInfo(logResponse);

// limit orders
//privateClient.createOrder(logResponse, 'btc_usdt', 'buy', '0.01', '1.0');
//privateClient.createOrder(logResponse, 'btc_usdt', 'sell', '0.01', '200000');

//privateClient.cancelOrder(logResponse, 'btc_usdt', '201712043271643');

//privateClient.getOrderInfo(logResponse, 'btc_usdt', '201712043271643');

// get the first 20 unfilled orders
//privateClient.getOrderHistory(logResponse, 'btc_usdt', 1, 20);

// get the first 5 account withdrawl
//privateClient.getWithdrawRecord(logResponse, 'btc_usdt', 1, 5);


function logResponse(err, data)
{
    if (err)
    {
        console.log('error name %s', err.name);
        console.log('error message %s', err);
    }

    console.log('\ndata: %s', JSON.stringify(data));
}
